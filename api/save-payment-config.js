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

function encryptText(text) {
    const keyString = process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY;
    if (!keyString || keyString.length !== 32) {
        throw new Error('PAYMENT_CREDENTIAL_ENCRYPTION_KEY is not set or invalid (must be 32 chars)');
    }
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(keyString), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
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
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (e) {
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }

        const sellerId = decodedToken.uid;
        const { mode, merchantId, clientKey, serverKey } = req.body;

        if (!mode || !merchantId || !clientKey || !serverKey) {
            return res.status(400).json({ success: false, error: 'Missing required parameters' });
        }

        // Encrypt the server key
        let encryptedServerKey;
        try {
            encryptedServerKey = encryptText(serverKey);
        } catch (e) {
            console.error("Encryption error:", e);
            return res.status(500).json({ success: false, error: 'Server Config Error: ' + e.message });
        }

        const paymentConfig = {
            mode,
            merchantId,
            clientKey,
            serverKey: encryptedServerKey,
            updatedAt: new Date().toISOString()
        };

        await db.collection('seller_payments').doc(sellerId).set(paymentConfig);

        return res.status(200).json({ success: true, message: 'Pengaturan pembayaran berhasil disimpan.' });
    } catch (error) {
        console.error('Error saving payment config:', error);
        return res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
    }
};
