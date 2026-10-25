const fs = require('fs');

let html = fs.readFileSync('WEBSITE WISHLIST.html', 'utf8');

// 1. TAILWIND CONFIG & DARK MODE SUPPORT
if (!html.includes('tailwind.config')) {
    html = html.replace(
        '<script src="https://cdn.tailwindcss.com"></script>',
        `<script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: { extend: {} }
        }
    </script>`
    );
}

// 2. BODY DARK MODE
html = html.replace(/<body class="bg-slate-50 text-slate-800 h-screen flex flex-col md:flex-row overflow-hidden">/, '<body class="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 h-screen flex flex-col md:flex-row overflow-hidden transition-colors">');
html = html.replace(/<body class="bg-\[#f8fafc\] text-slate-800 h-screen flex flex-col md:flex-row overflow-hidden">/, '<body class="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 h-screen flex flex-col md:flex-row overflow-hidden transition-colors">');

// 3. SIDEBAR STYLES (Dark Mode)
html = html.replace(/<aside class="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-full z-20">/, '<aside class="hidden md:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col h-full z-20">');

// 4. NAV LINKS (Desktop)
const navLinksDesktop = `<nav class="flex-1 p-4 space-y-2 overflow-y-auto">
                <button onclick="window.navigate('dashboard')" id="nav-dashboard" class="nav-item active w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <i class="fas fa-home w-5"></i> <span class="font-medium">Dashboard</span>
                </button>
                <button onclick="window.navigate('barang')" id="nav-barang" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <i class="fas fa-shopping-bag w-5"></i> <span class="font-medium">Wishlist Barang</span>
                </button>
                <button onclick="window.navigate('tempat')" id="nav-tempat" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <i class="fas fa-map-marked-alt w-5"></i> <span class="font-medium">Wishlist Tempat</span>
                </button>
                <div class="pt-4 pb-2">
                    <p class="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Academics</p>
                </div>
                <button onclick="window.navigate('tugas')" id="nav-tugas" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <i class="fas fa-tasks w-5"></i> <span class="font-medium">Jadwal Tugas</span>
                </button>
                <button onclick="window.navigate('catatan')" id="nav-catatan" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <i class="fas fa-sticky-note w-5"></i> <span class="font-medium">Catatan Kuliah</span>
                </button>
                <button onclick="window.navigate('rundown')" id="nav-rundown" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <i class="fas fa-calendar-alt w-5"></i> <span class="font-medium">Rundown</span>
                </button>
                <div class="pt-4 pb-2">
                    <p class="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">System</p>
                </div>
                <button onclick="window.navigate('setting')" id="nav-setting" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <i class="fas fa-cog w-5"></i> <span class="font-medium">Pengaturan</span>
                </button>
                <button onclick="window.toggleTheme()" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mt-auto">
                    <i class="fas fa-moon w-5 dark:hidden"></i><i class="fas fa-sun w-5 hidden dark:block"></i> <span class="font-medium">Toggle Theme</span>
                </button>
            </nav>`;
html = html.replace(/<nav class="flex-1 p-4 space-y-2 overflow-y-auto">[\s\S]*?<\/nav>/, navLinksDesktop);

// 5. NAV LINKS (Mobile)
const navLinksMobile = `<nav class="flex justify-around items-center p-2">
            <button onclick="window.navigate('dashboard')" id="nav-mobile-dashboard" class="nav-item-mobile active text-slate-400 p-2 flex flex-col items-center gap-1 transition-colors">
                <i class="fas fa-home text-lg"></i><span class="text-[10px] font-medium">Home</span>
            </button>
            <button onclick="window.navigate('tugas')" id="nav-mobile-tugas" class="nav-item-mobile text-slate-400 p-2 flex flex-col items-center gap-1 transition-colors">
                <i class="fas fa-tasks text-lg"></i><span class="text-[10px] font-medium">Tugas</span>
            </button>
            <button onclick="window.navigate('rundown')" id="nav-mobile-rundown" class="nav-item-mobile text-slate-400 p-2 flex flex-col items-center gap-1 transition-colors">
                <i class="fas fa-calendar-alt text-lg"></i><span class="text-[10px] font-medium">Rundown</span>
            </button>
            <button onclick="window.navigate('setting')" id="nav-mobile-setting" class="nav-item-mobile text-slate-400 p-2 flex flex-col items-center gap-1 transition-colors">
                <i class="fas fa-cog text-lg"></i><span class="text-[10px] font-medium">Setel</span>
            </button>
        </nav>`;
html = html.replace(/<nav class="flex justify-around items-center p-2">[\s\S]*?<\/nav>/, navLinksMobile);
html = html.replace(/<!-- Bottom Mobile Nav -->\s*<div class="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-10 pb-safe">/, '<!-- Bottom Mobile Nav -->\n        <div class="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-10 pb-safe">');

// 6. MAIN AREA (Dark Mode)
html = html.replace(/<main class="flex-1 flex flex-col h-full relative">/, '<main class="flex-1 flex flex-col h-full relative bg-slate-50 dark:bg-slate-900">');
html = html.replace(/<header class="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-10">/, '<header class="md:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-10">');

// Dashboard UI Dark mode fix (just simple replaces)
html = html.replaceAll('bg-white rounded-2xl', 'bg-white dark:bg-slate-800 rounded-2xl dark:border-slate-700');
html = html.replaceAll('bg-white rounded-xl', 'bg-white dark:bg-slate-800 rounded-xl dark:border-slate-700');
html = html.replaceAll('text-slate-800', 'text-slate-800 dark:text-slate-100');
html = html.replaceAll('text-slate-700', 'text-slate-700 dark:text-slate-300');
html = html.replaceAll('text-slate-600', 'text-slate-600 dark:text-slate-400');
html = html.replaceAll('text-slate-500', 'text-slate-500 dark:text-slate-400');
html = html.replaceAll('bg-slate-50', 'bg-slate-50 dark:bg-slate-800/50');
html = html.replaceAll('border-slate-200', 'border-slate-200 dark:border-slate-700');
html = html.replaceAll('border-slate-100', 'border-slate-100 dark:border-slate-800');

// 7. NEW MODAL FOR RUNDOWN
const rundownModal = `
            <!-- Modal Rundown -->
            <div id="modal-rundown" class="hidden modal-content bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 class="font-bold text-lg text-slate-800 dark:text-white" id="title-modal-rundown">Tambah Sesi</h3>
                    <button onclick="window.closeModal()" class="text-slate-400 hover:text-red-500 w-8 h-8 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors"><i class="fas fa-times"></i></button>
                </div>
                <form id="form-rundown" class="p-6 space-y-4">
                    <input type="hidden" id="rundown-id">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Kegiatan/Sesi <span class="text-red-500">*</span></label>
                        <input type="text" id="rundown-judul" required class="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all" placeholder="Misal: Pembukaan, Ishoma, dsb.">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mulai <span class="text-red-500">*</span></label>
                            <input type="time" id="rundown-mulai" required class="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selesai <span class="text-red-500">*</span></label>
                            <input type="time" id="rundown-selesai" required class="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PIC / Penanggung Jawab</label>
                        <input type="text" id="rundown-pic" class="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all" placeholder="Nama orang...">
                    </div>
                    <div class="pt-4">
                        <button type="submit" class="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl shadow-sm shadow-pink-200 dark:shadow-none transition-colors">Simpan Sesi</button>
                    </div>
                </form>
            </div>
`;
if (!html.includes('id="modal-rundown"')) {
    html = html.replace('<!-- Modal Barang -->', rundownModal + '\n            <!-- Modal Barang -->');
}

// Ensure pages are properly structured
// Note: they are already injected by reinject_pages_fixed.js into main, so we just add the JS logic now.

// 8. JS LOGIC: APP DATA
html = html.replace(
`        let appData = {
            barang: [],
            tempat: [],
            tugas: [],
            catatan: []
        };`,
`        let appData = {
            barang: [],
            tempat: [],
            tugas: [],
            catatan: [],
            rundown: [],
            settings: { theme: 'light', kategoriTugas: ['Umum', 'Tugas Akhir', 'Proyek'], kategoriCatatan: ['Kuliah', 'Pribadi', 'Ide'] }
        };`
);

// 9. JS LOGIC: MERGE DATA
html = html.replace(
`                    appData.barang = Array.isArray(parsed.barang) ? parsed.barang : [];
                    appData.tempat = Array.isArray(parsed.tempat) ? parsed.tempat : [];
                    appData.tugas = Array.isArray(parsed.tugas) ? parsed.tugas : [];
                    appData.catatan = Array.isArray(parsed.catatan) ? parsed.catatan : [];`,
`                    appData.barang = Array.isArray(parsed.barang) ? parsed.barang : [];
                    appData.tempat = Array.isArray(parsed.tempat) ? parsed.tempat : [];
                    appData.tugas = Array.isArray(parsed.tugas) ? parsed.tugas : [];
                    appData.catatan = Array.isArray(parsed.catatan) ? parsed.catatan : [];
                    appData.rundown = Array.isArray(parsed.rundown) ? parsed.rundown : [];
                    appData.settings = (parsed.settings && typeof parsed.settings === 'object') ? parsed.settings : appData.settings;
                    window.applyTheme();`
);

// 10. NEW JS FUNCTIONS
const newJs = `
        window.applyTheme = function() {
            if(appData.settings && appData.settings.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };
        window.toggleTheme = function() {
            if(!appData.settings) appData.settings = { theme: 'light', kategoriTugas: [], kategoriCatatan: [] };
            appData.settings.theme = appData.settings.theme === 'dark' ? 'light' : 'dark';
            window.applyTheme();
            saveData();
        };
        window.deleteSettingCategory = function(type, val) {
            if(type === 'tugas') appData.settings.kategoriTugas = appData.settings.kategoriTugas.filter(v => v !== val);
            if(type === 'catatan') appData.settings.kategoriCatatan = appData.settings.kategoriCatatan.filter(v => v !== val);
            saveData();
        };

        const formSettingTugas = document.getElementById('form-setting-tugas');
        if (formSettingTugas) {
            formSettingTugas.addEventListener('submit', (e) => {
                e.preventDefault();
                const val = document.getElementById('input-setting-tugas').value;
                if(!appData.settings.kategoriTugas.includes(val)) appData.settings.kategoriTugas.push(val);
                document.getElementById('input-setting-tugas').value = '';
                saveData();
            });
        }
        
        const formSettingCatatan = document.getElementById('form-setting-catatan');
        if (formSettingCatatan) {
            formSettingCatatan.addEventListener('submit', (e) => {
                e.preventDefault();
                const val = document.getElementById('input-setting-catatan').value;
                if(!appData.settings.kategoriCatatan.includes(val)) appData.settings.kategoriCatatan.push(val);
                document.getElementById('input-setting-catatan').value = '';
                saveData();
            });
        }

        const formRundown = document.getElementById('form-rundown');
        if (formRundown) {
            formRundown.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = document.getElementById('rundown-id').value;
                const newData = {
                    id: id || generateId(),
                    judul: document.getElementById('rundown-judul').value,
                    mulai: document.getElementById('rundown-mulai').value,
                    selesai: document.getElementById('rundown-selesai').value,
                    pic: document.getElementById('rundown-pic').value,
                    createdAt: id ? appData.rundown.find(i=>i.id===id).createdAt : Date.now()
                };
                if(id) appData.rundown = appData.rundown.map(i => i.id === id ? newData : i);
                else appData.rundown.push(newData);
                saveData(); window.closeModal();
            });
        }
`;
html = html.replace('// Utility Helpers', newJs + '\n        // Utility Helpers');

// 11. RENDER ALL
html = html.replace(
`        function renderAll() {
            renderBarang();
            renderTempat();
            renderTugas();
            renderCatatan();
            renderDashboard(); 
        }`,
`        function renderAll() {
            renderBarang();
            renderTempat();
            renderTugas();
            renderCatatan();
            if (typeof renderRundown === 'function') renderRundown();
            if (typeof renderSettings === 'function') renderSettings();
            renderDashboard(); 
        }`
);

// 12. RENDER EXTRAS
const renderExtras = `
        function renderRundown() {
            const list = document.getElementById('list-rundown');
            if(!list) return;
            list.innerHTML = '';
            if(!appData.rundown) appData.rundown = [];
            if(appData.rundown.length === 0) {
                list.innerHTML = \`<div class="p-8 text-center text-slate-400 -ml-6"><i class="fas fa-calendar-times text-3xl mb-2 text-slate-300"></i><p class="text-sm">Rundown acara kosong.</p></div>\`;
                return;
            }
            let sorted = [...appData.rundown].sort((a,b) => a.mulai.localeCompare(b.mulai));
            
            sorted.forEach(item => {
                list.innerHTML += \`
                <div class="relative pl-6 sm:pl-8 group">
                    <div class="absolute w-4 h-4 bg-pink-500 rounded-full -left-[9px] top-1 border-4 border-white dark:border-slate-800 shadow-sm"></div>
                    <div class="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-800 transition-colors">
                        <div class="flex justify-between items-start mb-1">
                            <span class="text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded-md"><i class="far fa-clock"></i> \${item.mulai} - \${item.selesai}</span>
                            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onclick="window.openModal('rundown', '\${item.id}')" class="text-slate-400 hover:text-blue-500"><i class="fas fa-pen text-xs"></i></button>
                                <button onclick="window.deleteItem('rundown', '\${item.id}')" class="text-slate-400 hover:text-red-500"><i class="fas fa-trash text-xs"></i></button>
                            </div>
                        </div>
                        <h4 class="font-bold text-slate-800 dark:text-slate-100 text-lg">\${item.judul}</h4>
                        \${item.pic ? \`<p class="text-sm text-slate-500 dark:text-slate-400 mt-1"><i class="fas fa-user-circle"></i> \${item.pic}</p>\` : ''}
                    </div>
                </div>\`;
            });
        }

        function renderSettings() {
            const listTugas = document.getElementById('list-setting-tugas');
            const listCatatan = document.getElementById('list-setting-catatan');
            const dataTugas = document.getElementById('tugas-kategori-list');
            const dataCatatan = document.getElementById('catatan-kategori-list');
            if(!listTugas || !listCatatan || !appData.settings) return;

            listTugas.innerHTML = ''; if(dataTugas) dataTugas.innerHTML = '';
            appData.settings.kategoriTugas.forEach(cat => {
                listTugas.innerHTML += \`<span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded-full flex items-center gap-2 border border-indigo-100 dark:border-indigo-800">\${cat} <button onclick="window.deleteSettingCategory('tugas', '\${cat}')" class="hover:text-red-500"><i class="fas fa-times"></i></button></span>\`;
                if(dataTugas) dataTugas.innerHTML += \`<option value="\${cat}">\`;
            });

            listCatatan.innerHTML = ''; if(dataCatatan) dataCatatan.innerHTML = '';
            appData.settings.kategoriCatatan.forEach(cat => {
                listCatatan.innerHTML += \`<span class="px-3 py-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm rounded-full flex items-center gap-2 border border-yellow-100 dark:border-yellow-800">\${cat} <button onclick="window.deleteSettingCategory('catatan', '\${cat}')" class="hover:text-red-500"><i class="fas fa-times"></i></button></span>\`;
                if(dataCatatan) dataCatatan.innerHTML += \`<option value="\${cat}">\`;
            });
        }
`;
html = html.replace('function renderDashboard() {', renderExtras + '\n        function renderDashboard() {');

// 13. OPEN MODAL FIX
const openModalStr = `else if (type === 'rundown') {
                        document.getElementById('rundown-id').value = item.id;
                        document.getElementById('rundown-judul').value = item.judul;
                        document.getElementById('rundown-mulai').value = item.mulai;
                        document.getElementById('rundown-selesai').value = item.selesai;
                        document.getElementById('rundown-pic').value = item.pic;
                    }`;
html = html.replace(/else if \(type === 'catatan'\) \{[\s\S]*?\}\s*\}/, `else if (type === 'catatan') {
                        document.getElementById('catatan-id').value = item.id;
                        document.getElementById('catatan-judul').value = item.judul;
                        document.getElementById('catatan-matkul').value = item.matkul;
                        document.getElementById('catatan-isi').value = item.isi;
                    } ${openModalStr}
                }`);

fs.writeFileSync('WEBSITE WISHLIST.html', html);
console.log('Features built and injected.');
