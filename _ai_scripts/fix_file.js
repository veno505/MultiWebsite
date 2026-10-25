const fs = require('fs');
let content = fs.readFileSync('WEBSITE WISHLIST.html', 'utf8');

// The multi_replace_file_content tool previously messed up the loadDataFromCloud section.
// Let's replace the broken section with the correct loadDataFromCloud function.

// Find where initCloudSync() ends and saveData() begins
const initCloudEnd = content.indexOf('        // Fungsi Simpan (Ke Cloud dan Backup Lokal)');
if (initCloudEnd === -1) {
    console.error("Could not find saveData");
    process.exit(1);
}

// Replace the area from the end of initCloudSync to the start of saveData
let before = content.substring(0, initCloudEnd);
let after = content.substring(initCloudEnd);

// Let's extract everything before the broken loadDataFromCloud
// The broken loadDataFromCloud looks like:
//         }
// 
//         // Fungsi Simpan

const fixCode = `
        async function loadDataFromCloud() {
            try {
                const docSnap = await getDoc(DATABASE_REF);
                if (docSnap.exists()) {
                    const parsed = docSnap.data();
                    // Merge Data
                    appData.barang = Array.isArray(parsed.barang) ? parsed.barang : [];
                    appData.tempat = Array.isArray(parsed.tempat) ? parsed.tempat : [];
                    appData.tugas = Array.isArray(parsed.tugas) ? parsed.tugas : [];
                    appData.catatan = Array.isArray(parsed.catatan) ? parsed.catatan : [];
                    appData.rundown = Array.isArray(parsed.rundown) ? parsed.rundown : [];
                    
                    const defaultSettings = {
                        kategoriTugas: ['Kuliah', 'Pekerjaan', 'Organisasi'],
                        kategoriCatatan: ['Jurnal', 'Materi', 'Bebas'],
                        theme: 'light'
                    };
                    appData.settings = (parsed.settings && typeof parsed.settings === 'object') 
                        ? { ...defaultSettings, ...parsed.settings } 
                        : defaultSettings;
                    
                    if (!Array.isArray(appData.settings.kategoriTugas)) appData.settings.kategoriTugas = defaultSettings.kategoriTugas;
                    if (!Array.isArray(appData.settings.kategoriCatatan)) appData.settings.kategoriCatatan = defaultSettings.kategoriCatatan;

                    window.applyTheme();
                }
                renderAll();
            } catch (error) {
                console.error("Gagal menarik data dari Cloud:", error);
            }
        }

`;

// Find the last closing brace of initCloudSync
const initCloudBody = before.substring(before.indexOf('async function initCloudSync()'));
// Remove any remnants of loadDataFromCloud that got broken
before = before.replace(/\s*\}\s*\}\s*\}\s*$/, '\n        }\n');

content = before + fixCode + after;
fs.writeFileSync('WEBSITE WISHLIST.html', content);
console.log("Fixed loadDataFromCloud");
