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
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
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
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const idToken = authHeader.split('Bearer ')[1];
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (e) {
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }

        const sellerId = decodedToken.uid;
        
        const docRef = db.collection('seller_payments').doc(sellerId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(200).json({ success: true, data: null });
        }

        const data = docSnap.data();
        
        // Never return the actual serverKey to the frontend
        return res.status(200).json({ 
            success: true, 
            data: {
                mode: data.mode,
                merchantId: data.merchantId,
                clientKey: data.clientKey,
                hasServerKey: !!data.serverKey // Just tell the frontend a key exists
            }
        });
    } catch (error) {
        console.error('Error fetching payment config:', error);
        return res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
    }
};
