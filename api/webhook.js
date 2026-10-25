const admin = require('firebase-admin');
const crypto = require('crypto');

if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } catch (e) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", e);
            admin.initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID || "keuangan-project-91d0a"
            });
        }
    } else {
        admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID || "keuangan-project-91d0a"
        });
    }
}

const db = admin.firestore();

function decryptText(encryptedText) {
    const keyString = process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY;
    if (!keyString || keyString.length !== 32) {
        throw new Error('Encryption key not configured properly.');
    }
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedData = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(keyString), iv);
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}


module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const payload = req.body;
        
        const orderId = payload.order_id;
        const statusCode = payload.status_code;
        const grossAmount = payload.gross_amount;
        const signatureKey = payload.signature_key;
        const transactionStatus = payload.transaction_status;
        
        if (!orderId || !statusCode || !grossAmount || !signatureKey || !transactionStatus) {
            return res.status(400).json({ error: 'Invalid webhook payload structure' });
        }
        
        // 1. Fetch the corresponding transaction from Firestore FIRST
        const txRef = db.collection('transactions').doc(orderId);
        const txDoc = await txRef.get();
        
        if (!txDoc.exists) {
            console.warn('Webhook transaction document not found in Firestore:', orderId);
            return res.status(404).json({ error: 'Transaction record not found' });
        }
        
        const txData = txDoc.data();
        const sellerId = txData.sellerId;
        
        // 2. Fetch the correct Server Key
        let serverKey = '';
        if (sellerId === 'default' || sellerId === process.env.COMMERCEHUB_OWNER_UID) {
            serverKey = process.env.MIDTRANS_SERVER_KEY;
            if (!serverKey) {
                return res.status(500).json({ error: 'Owner Server Key is not configured.' });
            }
        } else {
            const paymentDoc = await db.collection('seller_payments').doc(sellerId).get();
            if (!paymentDoc.exists) {
                return res.status(404).json({ error: 'Seller payment configuration not found' });
            }
            try {
                serverKey = decryptText(paymentDoc.data().serverKey);
            } catch (e) {
                console.error("Decryption failed for seller:", sellerId, e);
                return res.status(500).json({ error: 'Failed to decrypt seller credentials' });
            }
        }
        
        // 3. Verify Midtrans Webhook Signature
        const signatureString = orderId + statusCode + grossAmount + serverKey;
        const computedHash = crypto.createHash('sha512').update(signatureString).digest('hex');
        
        if (computedHash !== signatureKey) {
            console.warn('Webhook signature verification FAILED! Computed:', computedHash, 'Received:', signatureKey);
            return res.status(401).json({ error: 'Unauthorized: Invalid signature' });
        }
        
        console.log('Webhook signature verified successfully for order:', orderId);
        
        // 3. Map Midtrans transaction status to Firestore status
        let finalStatus = 'pending';
        if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
            finalStatus = 'success';
        } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
            finalStatus = transactionStatus === 'expire' ? 'expire' : 'failed';
        }
        
        // 4. Update the status in Firestore
        await txRef.update({
            status: finalStatus,
            updatedAt: new Date().toISOString(),
            midtransStatus: transactionStatus
        });
        
        // 5. If successful, push to Admin Panel's Data Customer & Rekap
        if (finalStatus === 'success') {
            const sellerDocRef = db.collection('uangku_data').doc(sellerId);
            const sellerDocSnap = await sellerDocRef.get();
            if (sellerDocSnap.exists) {
                const sData = sellerDocSnap.data();
                const rekapList = sData.rekap_transaksi || sData.rekap || [];
                const customerList = sData.customer_orders || sData.customers || [];
                
                // Cek apakah orderId ini sudah dimasukkan ke rekap untuk menghindari duplikasi webhook
                const alreadyRekap = rekapList.find(r => r.orderId === orderId);
                
                if (!alreadyRekap) {
                    const dt = new Date().toISOString();
                    // ID dummy acak untuk tabel HTML Frontend
                    const uniqueId = "MDT-" + Date.now().toString(36) + Math.random().toString(36).substr(2);
                    
                    const newItem = {
                        id: uniqueId,
                        orderId: orderId, // Untuk penanda
                        tanggal: dt,
                        nama: txData.customerName || "Customer",
                        hp: txData.customerHp || "-",
                        whatsapp: txData.customerHp || "-",
                        kota: txData.customerCity || "-",
                        catatan: txData.customerNote || "-",
                        produkId: txData.productId || "-",
                        produkNama: txData.productNama || "Produk",
                        produk: txData.productNama || "Produk", // kompabilitas UI multi
                        kategori: "Midtrans",
                        harga: txData.totalHarga || txData.harga || 0,
                        total: txData.totalHarga || txData.harga || 0,
                        status: 'success'
                    };
                    
                    rekapList.unshift(newItem);
                    customerList.unshift(newItem);
                    
                    await sellerDocRef.update({
                        rekap_transaksi: rekapList,
                        customer_orders: customerList
                    });
                    console.log(`Order ${orderId} automatically added to Data Customer & Rekap.`);
                }
            }
        }
        
        console.log(`Transaction ${orderId} successfully updated to status: ${finalStatus}`);
        return res.status(200).json({ success: true, statusUpdated: finalStatus });
        
    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
};
