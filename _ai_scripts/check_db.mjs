import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBRqtDo6I0JRBxV-2Cr4D0W8xRr0rDYXpI",
    authDomain: "keuangan-project-91d0a.firebaseapp.com",
    projectId: "keuangan-project-91d0a",
    storageBucket: "keuangan-project-91d0a.firebasestorage.app",
    messagingSenderId: "412887443168",
    appId: "1:412887443168:web:bb38eb69e2b677df805285",
    measurementId: "G-95KQYRMYCC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DATABASE_REF = doc(db, 'wishlist_data', 'database_utama_saya');

async function check() {
    try {
        const docSnap = await getDoc(DATABASE_REF);
        if (docSnap.exists()) {
            console.log("Data exists in Firestore:");
            const data = docSnap.data();
            console.log("Barang count:", data.barang?.length);
            console.log("Tugas count:", data.tugas?.length);
            console.log("Catatan count:", data.catatan?.length);
            console.log("Tempat count:", data.tempat?.length);
            console.log("Rundown count:", data.rundown?.length);
            // write full data to a file for backup
            import('fs').then(fs => {
                fs.writeFileSync('db_backup.json', JSON.stringify(data, null, 2));
                console.log("Full backup written to db_backup.json");
            });
        } else {
            console.log("Document does not exist in Firestore!");
        }
    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}
check();
