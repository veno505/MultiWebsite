const admin = require('firebase-admin');

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

function setCorsHeaders(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
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

    try {
        const { sellerId } = req.query;

        if (!sellerId) {
            return res.status(400).json({ success: false, error: 'Missing sellerId' });
        }

        if (sellerId === 'default' || sellerId === process.env.COMMERCEHUB_OWNER_UID) {
            return res.status(200).json({ 
                success: true, 
                isAvailable: true // Owner always has Midtrans configured via Env Vars
            });
        }

        const docRef = db.collection('seller_payments').doc(sellerId);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data();
            if (data && data.serverKey) {
                return res.status(200).json({ 
                    success: true, 
                    isAvailable: true 
                });
            }
        }

        return res.status(200).json({ 
            success: true, 
            isAvailable: false 
        });

    } catch (error) {
        console.error('Error checking payment status:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
