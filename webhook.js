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
        
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        if (!serverKey) {
            return res.status(500).json({ error: 'Server Key environment variable is not configured.' });
        }
        
        // 1. Verify Midtrans Webhook Signature
        const signatureString = orderId + statusCode + grossAmount + serverKey;
        const computedHash = crypto.createHash('sha512').update(signatureString).digest('hex');
        
        if (computedHash !== signatureKey) {
            console.warn('Webhook signature verification FAILED! Computed:', computedHash, 'Received:', signatureKey);
            return res.status(401).json({ error: 'Unauthorized: Invalid signature' });
        }
        
        console.log('Webhook signature verified successfully for order:', orderId);
        
        // 2. Fetch the corresponding transaction from Firestore
        const txRef = db.collection('transactions').doc(orderId);
        const txDoc = await txRef.get();
        
        if (!txDoc.exists) {
            console.warn('Webhook transaction document not found in Firestore:', orderId);
            return res.status(404).json({ error: 'Transaction record not found' });
        }
        
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
        
        console.log(`Transaction ${orderId} successfully updated to status: ${finalStatus}`);
        return res.status(200).json({ success: true, statusUpdated: finalStatus });
        
    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
};
