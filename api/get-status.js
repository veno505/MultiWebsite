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
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    res.setHeader('Content-Type', 'application/json');
}

module.exports = async (req, res) => {
    setCorsHeaders(req, res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ success: true });
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    if (initError) {
        return res.status(500).json({ success: false, error: 'Backend Initialization Error: ' + initError });
    }
    
    try {
        const { orderId } = req.query;
        if (!orderId) {
            return res.status(400).json({ success: false, error: 'Missing orderId parameter' });
        }
        
        const txRef = db.collection('transactions').doc(orderId);
        const txDoc = await txRef.get();
        
        if (!txDoc.exists) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }
        
        let txData = txDoc.data();
        
        // If transaction is still pending, double check status directly with Midtrans
        if (txData.status === 'pending') {
            const isProd = process.env.MIDTRANS_IS_PRODUCTION === 'true';
            const serverKey = process.env.MIDTRANS_SERVER_KEY;
            
            if (serverKey) {
                const coreApi = new midtransClient.CoreApi({
                    isProduction: isProd,
                    serverKey: serverKey
                });
                
                try {
                    const midtransResponse = await coreApi.transaction.status(orderId);
                    const midStatus = midtransResponse.transaction_status;
                    let finalStatus = 'pending';
                    
                    if (midStatus === 'settlement' || midStatus === 'capture') {
                        finalStatus = 'success';
                    } else if (midStatus === 'deny' || midStatus === 'cancel' || midStatus === 'expire') {
                        finalStatus = midStatus === 'expire' ? 'expire' : 'failed';
                    }
                    
                    if (finalStatus !== txData.status) {
                        const now = new Date().toISOString();
                        await txRef.update({
                            status: finalStatus,
                            updatedAt: now,
                            midtransStatus: midStatus
                        });
                        txData.status = finalStatus;
                        txData.updatedAt = now;
                    }
                } catch (midError) {
                    console.warn('Could not query Midtrans API directly for transaction status:', midError.message);
                }
            }
        }
        
        return res.status(200).json({
            success: true,
            orderId: txData.orderId,
            status: txData.status,
            customerName: txData.customerName,
            totalHarga: txData.totalHarga,
            paymentMethod: txData.paymentMethod,
            productNama: txData.productNama,
            productGambar: txData.productGambar || '',
            qty: txData.qty,
            storeName: txData.storeName,
            createdAt: txData.createdAt,
            updatedAt: txData.updatedAt,
            paymentInfo: txData.paymentInfo || {}
        });
        
    } catch (error) {
        console.error('GET_STATUS_FATAL_ERROR:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Internal server error: ' + error.message 
        });
    }
};
