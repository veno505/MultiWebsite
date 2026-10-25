const admin = require('firebase-admin');
const midtransClient = require('midtrans-client');

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
    
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const idToken = authHeader.split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(idToken);
        } catch (e) {
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }

        const { mode, serverKey } = req.body;

        if (!mode || !serverKey) {
            return res.status(400).json({ success: false, error: 'Missing required parameters' });
        }

        const isProd = mode === 'production';
        
        const coreApi = new midtransClient.CoreApi({
            isProduction: isProd,
            serverKey: serverKey
        });

        // We make a dummy charge request with an empty payload.
        // Midtrans will return 401 if the server key is wrong.
        // It will return 400 (Validation Error) if the key is correct but payload is bad.
        try {
            await coreApi.charge({});
        } catch (err) {
            if (err.httpStatusCode === 401) {
                return res.status(400).json({ success: false, error: 'Akses Ditolak: Server Key tidak valid atau salah lingkungan (Sandbox/Production).' });
            }
            if (err.httpStatusCode === 400) {
                // Validation error means the key worked and Midtrans processed the request!
                return res.status(200).json({ success: true, message: 'Koneksi ke Midtrans berhasil!' });
            }
            return res.status(500).json({ success: false, error: 'Midtrans API Error: ' + err.message });
        }
        
        return res.status(200).json({ success: true, message: 'Koneksi ke Midtrans berhasil!' });

    } catch (error) {
        console.error('Error testing midtrans connection:', error);
        return res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
    }
};
