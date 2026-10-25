let admin, midtransClient, db;
let initError = null;

try {
    admin = require('firebase-admin');
    midtransClient = require('midtrans-client');

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
    db = admin.firestore();
} catch (e) {
    console.error("FATAL INIT ERROR:", e);
    initError = e.message;
}

function setCorsHeaders(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    // Explicitly set JSON content type for ALL responses
    res.setHeader('Content-Type', 'application/json');
}

module.exports = async (req, res) => {
    setCorsHeaders(req, res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ success: true });
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    if (initError) {
        return res.status(500).json({ success: false, error: 'Backend Initialization Error: ' + initError });
    }
    
    try {
        const { sellerId, productId, qty, customerName, customerHp, customerCity, customerNote, paymentMethod } = req.body || {};
        
        if (!sellerId || !productId || !qty || !customerName || !customerHp || !paymentMethod) {
            return res.status(400).json({ success: false, error: 'Missing required request parameters' });
        }
        
        const quantity = parseInt(qty);
        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ success: false, error: 'Quantity must be a positive integer' });
        }
        
        // 1. Fetch seller and product info
        const sellerRef = db.collection('uangku_data').doc(sellerId);
        const sellerDoc = await sellerRef.get();
        
        if (!sellerDoc.exists) {
            return res.status(404).json({ success: false, error: 'Seller or store not found' });
        }
        
        const sellerData = sellerDoc.data();
        const productList = sellerData.produk_data || [];
        const product = productList.find(p => p.id === productId);
        
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found in this seller store' });
        }
        
        const unitPrice = parseFloat(product.harga);
        if (isNaN(unitPrice) || unitPrice <= 0) {
            return res.status(500).json({ success: false, error: 'Invalid product price configuration' });
        }
        
        const totalAmount = unitPrice * quantity;
        const storeName = (sellerData.store_config && sellerData.store_config.nama) || 'CommerceHub Store';
        const sellerWa = (sellerData.store_config && sellerData.store_config.whatsapp) || '';
        
        // 2. Generate Order ID
        const orderId = `CH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        
        // 3. Initialize Midtrans
        const isProd = process.env.MIDTRANS_IS_PRODUCTION === 'true';
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        
        if (!serverKey) {
            return res.status(500).json({ success: false, error: 'MIDTRANS_SERVER_KEY environment variable is not configured.' });
        }
        
        const coreApi = new midtransClient.CoreApi({
            isProduction: isProd,
            serverKey: serverKey
        });
        
        // 4. Construct Payload
        let midtransPayload = {
            payment_type: '',
            transaction_details: {
                order_id: orderId,
                gross_amount: totalAmount
            },
            customer_details: {
                first_name: customerName,
                phone: customerHp
            },
            item_details: [{
                id: productId,
                price: unitPrice,
                quantity: quantity,
                name: product.nama.substring(0, 50)
            }]
        };
        
        if (paymentMethod === 'qris') {
            midtransPayload.payment_type = 'qris';
            midtransPayload.qris = { acquirer: 'gopay' };
        } else if (paymentMethod === 'bri') {
            midtransPayload.payment_type = 'bank_transfer';
            midtransPayload.bank_transfer = { bank: 'bri' };
        } else if (paymentMethod === 'gopay') {
            midtransPayload.payment_type = 'gopay';
        } else if (paymentMethod === 'shopeepay') {
            midtransPayload.payment_type = 'shopeepay';
            const hostUrl = req.headers.origin || 'https://commerce-hub26.vercel.app';
            midtransPayload.shopeepay = { callback_url: hostUrl };
        } else if (paymentMethod === 'dana') {
            midtransPayload.payment_type = 'dana';
        } else {
            return res.status(400).json({ success: false, error: 'Unsupported payment method requested' });
        }
        
        // 5. Send to Midtrans
        let midtransResponse;
        try {
            midtransResponse = await coreApi.charge(midtransPayload);
        } catch (err) {
            console.error('Midtrans direct charge error:', err);
            if (paymentMethod === 'dana') {
                midtransPayload.payment_type = 'qris';
                midtransPayload.qris = { acquirer: 'gopay' };
                midtransResponse = await coreApi.charge(midtransPayload);
            } else {
                // Safely extract midtrans API error messages
                let safeErrMsg = err.message || 'Unknown Midtrans Error';
                if (err.ApiResponse && err.ApiResponse.error_messages) {
                    safeErrMsg = err.ApiResponse.error_messages.join(', ');
                }
                return res.status(400).json({ success: false, error: 'Midtrans API Error: ' + safeErrMsg });
            }
        }
        
        // 6. Parse response
        let paymentInfo = {};
        if (midtransResponse.payment_type === 'qris') {
            const qrAction = midtransResponse.actions && midtransResponse.actions.find(a => a.name === 'generate-qr-code');
            paymentInfo.qrCodeUrl = qrAction ? qrAction.url : '';
        } else if (midtransResponse.payment_type === 'bank_transfer' && midtransResponse.va_numbers) {
            paymentInfo.vaNumber = midtransResponse.va_numbers[0] ? midtransResponse.va_numbers[0].va_number : '';
        } else if (midtransResponse.payment_type === 'gopay') {
            const qrAction = midtransResponse.actions && midtransResponse.actions.find(a => a.name === 'generate-qr-code');
            const deepLinkAction = midtransResponse.actions && midtransResponse.actions.find(a => a.name === 'deeplink-redirect');
            paymentInfo.qrCodeUrl = qrAction ? qrAction.url : '';
            paymentInfo.deepLink = deepLinkAction ? deepLinkAction.url : '';
        } else if (midtransResponse.payment_type === 'shopeepay') {
            const deepLinkAction = midtransResponse.actions && midtransResponse.actions.find(a => a.name === 'deeplink-redirect');
            paymentInfo.deepLink = deepLinkAction ? deepLinkAction.url : '';
        } else if (midtransResponse.payment_type === 'dana') {
            paymentInfo.deepLink = midtransResponse.redirect_url || '';
        }
        
        // 7. Store securely in Firestore
        const transactionData = {
            orderId, sellerId, storeName, sellerWa, productId, 
            productNama: product.nama, productGambar: product.gambar || '',
            qty: quantity, harga: unitPrice, totalHarga: totalAmount, paymentMethod,
            status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            customerName, customerHp, customerCity, customerNote: customerNote || '',
            paymentInfo, midtransStatus: midtransResponse.transaction_status
        };
        
        await db.collection('transactions').doc(orderId).set(transactionData);
        
        // 8. Return JSON
        return res.status(200).json({
            success: true,
            orderId: orderId,
            paymentMethod: paymentMethod,
            totalHarga: totalAmount,
            paymentInfo: paymentInfo
        });
        
    } catch (error) {
        console.error('CREATE_PAYMENT_FATAL_ERROR:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Internal server error: ' + error.message
        });
    }
};
