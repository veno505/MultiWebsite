let admin;
let initError = null;

try {
    admin = require('firebase-admin');
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
} catch (e) {
    console.error("FATAL INIT ERROR:", e);
    initError = e.message;
}

function setCorsHeaders(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
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
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'Unauthorized: Missing token' });
        }
        const idToken = authHeader.split('Bearer ')[1];
        
        // Verify token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken.email !== 'marveyno@gmail.com') {
            return res.status(403).json({ success: false, error: 'Forbidden: Only Super Admin can perform this action' });
        }
        
        const { target, action } = req.body;
        if (!target || !action) {
            return res.status(400).json({ success: false, error: 'Missing target (UID/Email) or action' });
        }
        
        // Resolve UID
        let targetUid = target;
        if (target.includes('@')) {
            try {
                const userRecord = await admin.auth().getUserByEmail(target);
                targetUid = userRecord.uid;
            } catch (e) {
                return res.status(404).json({ success: false, error: 'User not found with that email' });
            }
        }
        
        if (targetUid === decodedToken.uid) {
            return res.status(400).json({ success: false, error: 'Cannot modify your own Super Admin account' });
        }
        
        if (action === 'disable') {
            await admin.auth().updateUser(targetUid, { disabled: true });
            return res.status(200).json({ success: true, message: 'Account disabled successfully', targetUid });
        } else if (action === 'enable') {
            await admin.auth().updateUser(targetUid, { disabled: false });
            return res.status(200).json({ success: true, message: 'Account enabled successfully', targetUid });
        } else if (action === 'delete') {
            await admin.auth().deleteUser(targetUid);
            // Optionally delete their data in Firestore too
            await admin.firestore().collection('uangku_data').doc(targetUid).delete();
            return res.status(200).json({ success: true, message: 'Account deleted successfully', targetUid });
        } else {
            return res.status(400).json({ success: false, error: 'Invalid action' });
        }
        
    } catch (error) {
        console.error('ADMIN_ACTION_ERROR:', error);
        return res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};
