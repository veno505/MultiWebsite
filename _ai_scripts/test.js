
        // Import Firebase SDK v11.6.1 (Tanpa Auth agar semua device bisa akses dokumen yang sama)
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // Konfigurasi Firebase dari akun Anda
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
        
        // KUNCI SINKRONISASI SEMUA DEVICE:
        // Hardcode nama dokumen agar HP, Laptop, dan Tablet membaca data yang persis sama.
        const DATABASE_REF = doc(db, 'wishlist_data', 'database_utama_saya');

        // State Management Default
        let appData = {
            barang: [],
            tempat: [],
            tugas: [],
            catatan: [],
            rundown: [],
            settings: {
                kategoriTugas: ['Kuliah', 'Pekerjaan', 'Organisasi'],
                kategoriCatatan: ['Jurnal', 'Materi', 'Bebas'],
                theme: 'light'
            }
        };

        // Inisialisasi & Sinkronisasi
        async function initCloudSync() {
            try {
                updateCloudUI('syncing');
                await loadDataFromCloud();
                updateCloudUI('connected');
                
                // Auto-refresh tiap 5 detik agar update dari device lain otomatis masuk
                setInterval(loadDataFromCloud, 5000);
            } catch (error) {
                console.error("Gagal terhubung ke Cloud Firebase:", error);
                updateCloudUI('error', error.message);
                
                // Fallback ke LocalStorage jika internet putus
                const savedData = localStorage.getItem('wishlist_pro_data');
                if (savedData) {
                    try {
                        appData = { ...appData, ...JSON.parse(savedData) };
                    } catch(e) {}
                }
                renderAll();
            }
        }

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

        // Fungsi Simpan (Ke Cloud dan Backup Lokal)
        async function saveData() {
            // Backup ke lokal sbg cache
            localStorage.setItem('wishlist_pro_data', JSON.stringify(appData));
            
            // Render optimistik
            renderAll();
            
            if (DATABASE_REF) {
                updateCloudUI('syncing');
                try {
                    await setDoc(DATABASE_REF, appData);
                    setTimeout(() => updateCloudUI('connected'), 500); // Visual feedback
                } catch (error) {
                    console.error("Gagal menyimpan ke Cloud:", error);
                    updateCloudUI('error', "Izin Ditolak. Cek Rules Firestore.");
                }
            }
        }

        function updateCloudUI(state, errorMessage = "") {
            const container = document.getElementById('cloud-status-container');
            const icon = document.getElementById('cloud-icon');
            const title = document.getElementById('cloud-title');
            const desc = document.getElementById('cloud-desc');
            const mobileIcon = document.getElementById('mobile-cloud-icon');

            if (state === 'connected') {
                container.className = 'bg-emerald-50 rounded-xl p-4 flex items-center gap-3 border border-emerald-100 transition-colors duration-300';
                icon.className = 'fas fa-cloud text-emerald-500';
                title.className = 'text-xs font-semibold text-emerald-800';
                title.innerText = 'Tersinkronisasi';
                desc.innerText = 'Tersimpan otomatis';
                
                mobileIcon.className = 'w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100';
                mobileIcon.innerHTML = '<i class="fas fa-cloud text-xs"></i>';
            } else if (state === 'syncing') {
                icon.className = 'fas fa-spinner fa-spin text-blue-500';
                title.innerText = 'Menyimpan...';
                
                mobileIcon.innerHTML = '<i class="fas fa-spinner fa-spin text-xs"></i>';
            } else if (state === 'error') {
                 container.className = 'bg-red-50 rounded-xl p-4 flex items-center gap-3 border border-red-100 transition-colors duration-300';
                 icon.className = 'fas fa-exclamation-triangle text-red-500';
                 title.className = 'text-xs font-semibold text-red-800';
                 title.innerText = 'Offline Mode';
                 
                 // Tampilkan pesan error singkat
                 let errText = 'Gagal sinkron Cloud';
                 if (String(errorMessage).includes('permission')) errText = 'Izin Firestore Ditolak';
                 else if (errorMessage) errText = errorMessage;
                 
                 desc.innerText = errText;
                 
                 mobileIcon.className = 'w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 border border-red-100';
                 mobileIcon.innerHTML = '<i class="fas fa-exclamation-triangle text-xs"></i>';
            }
        }

        // Ekspos fungsi navigasi & modal ke window agar bisa dipanggil dari HTML onclick
        window.navigate = function(pageId) {
            document.querySelectorAll('.page-section').forEach(el => {
                el.classList.add('hidden');
                el.classList.remove('block');
            });
            document.getElementById(`page-${pageId}`).classList.remove('hidden');
            document.getElementById(`page-${pageId}`).classList.add('block');

            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            if(document.getElementById(`nav-desktop-${pageId}`)) document.getElementById(`nav-desktop-${pageId}`).classList.add('active');

            document.querySelectorAll('.nav-item-mobile').forEach(el => el.classList.remove('active'));
            if(document.getElementById(`nav-mobile-${pageId}`)) document.getElementById(`nav-mobile-${pageId}`).classList.add('active');
        };

        window.openModal = function(type, editId = null) {
            document.getElementById('modal-overlay').classList.add('show');
            document.querySelectorAll('.modal-content').forEach(el => el.classList.add('hidden'));
            
            const form = document.getElementById(`form-${type}`);
            form.reset();
            document.getElementById(`modal-${type}`).classList.remove('hidden');

            if (type === 'tempat') document.getElementById('tempat-foto-base64').value = "";

            if (editId) {
                document.getElementById(`title-modal-${type}`).innerText = `Edit Data`;
                const item = appData[type].find(i => i.id === editId);
                if (item) {
                    if (type === 'barang') {
                        document.getElementById('barang-id').value = item.id;
                        document.getElementById('barang-nama').value = item.name;
                        document.getElementById('barang-harga').value = item.price;
                        document.getElementById('barang-prioritas').value = item.priority || 'sedang';
                        document.getElementById('barang-link').value = item.link || '';
                    } else if (type === 'tempat') {
                        document.getElementById('tempat-id').value = item.id;
                        document.getElementById('tempat-nama').value = item.name;
                        document.getElementById('tempat-lokasi').value = item.location;
                        document.getElementById('tempat-foto-base64').value = item.photo || '';
                    } else if (type === 'tugas') {
                        document.getElementById('tugas-id').value = item.id;
                        document.getElementById('tugas-judul').value = item.judul;
                        document.getElementById('tugas-matkul').value = item.matkul;
                        document.getElementById('tugas-deadline').value = item.deadline;
                    } else if (type === 'catatan') {
                        document.getElementById('catatan-id').value = item.id;
                        document.getElementById('catatan-judul').value = item.judul;
                        document.getElementById('catatan-matkul').value = item.matkul;
                        document.getElementById('catatan-isi').value = item.isi;
                    } else if (type === 'rundown') {
                        document.getElementById('rundown-id').value = item.id;
                        document.getElementById('rundown-judul').value = item.judul;
                        document.getElementById('rundown-mulai').value = item.mulai;
                        document.getElementById('rundown-selesai').value = item.selesai;
                        document.getElementById('rundown-pic').value = item.pic;
                    }
                }
            } else {
                document.getElementById(`title-modal-${type}`).innerText = `Tambah Data`;
                document.getElementById(`${type}-id`).value = "";
            }
        };

        window.closeModal = function() {
            document.getElementById('modal-overlay').classList.remove('show');
        };

        window.deleteItem = function(type, id) {
            // Gunakan custom modal jika memungkinkan, tapi karna aturan menggunakan confirm tidak boleh, 
            // Untuk demo ini saya langsung hapus. Di production buatkan modal dialog custom.
            appData[type] = appData[type].filter(i => i.id !== id);
            saveData();
        };

        window.toggleStatus = function(type, id) {
            const item = appData[type].find(i => i.id === id);
            if(item) {
                if(type === 'barang' || type === 'tugas') item.completed = !item.completed;
                if(type === 'tempat') item.visited = !item.visited;
                saveData();
            }
        };

        
        window.applyTheme = function() {
            if(appData.settings && appData.settings.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };
        window.toggleTheme = function() {
            appData.settings.theme = appData.settings.theme === 'dark' ? 'light' : 'dark';
            window.applyTheme();
            saveData();
        };
        window.deleteSettingCategory = function(type, val) {
            if(type === 'tugas') appData.settings.kategoriTugas = appData.settings.kategoriTugas.filter(v => v !== val);
            if(type === 'catatan') appData.settings.kategoriCatatan = appData.settings.kategoriCatatan.filter(v => v !== val);
            saveData();
        };

        document.getElementById('form-setting-tugas').addEventListener('submit', (e) => {
            e.preventDefault();
            const val = document.getElementById('input-setting-tugas').value;
            if(!appData.settings.kategoriTugas.includes(val)) appData.settings.kategoriTugas.push(val);
            document.getElementById('input-setting-tugas').value = '';
            saveData();
        });
        document.getElementById('form-setting-catatan').addEventListener('submit', (e) => {
            e.preventDefault();
            const val = document.getElementById('input-setting-catatan').value;
            if(!appData.settings.kategoriCatatan.includes(val)) appData.settings.kategoriCatatan.push(val);
            document.getElementById('input-setting-catatan').value = '';
            saveData();
        });

        document.getElementById('form-rundown').addEventListener('submit', (e) => {
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

        // Utility Helpers
        const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
        const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        function detectLink(text) {
            const urlPattern = /(https?:\/\/[^\s]+)/g;
            if (urlPattern.test(text)) {
                return text.replace(urlPattern, url => `<br><a href="${url}" target="_blank" class="text-blue-500 hover:underline font-semibold bg-blue-50 px-2 py-1 rounded-md text-xs border border-blue-100 inline-flex items-center gap-1 mt-1"><i class="fas fa-external-link-alt"></i> Buka Peta</a>`);
            }
            return text;
        }

        function renderAll() {
            renderBarang();
            renderTempat();
            renderTugas();
            renderCatatan();
            renderDashboard(); 
        }

        function renderBarang() {
            const list = document.getElementById('list-barang');
            list.innerHTML = '';
            if(appData.barang.length === 0) {
                list.innerHTML = `<div class="p-8 text-center text-slate-400"><i class="fas fa-box-open text-3xl mb-2 text-slate-300"></i><p class="text-sm">Wishlist barang kosong.</p></div>`;
                return;
            }
            
            appData.barang.sort((a,b) => b.createdAt - a.createdAt).forEach(item => {
                let badgeColor = item.priority === 'tinggi' ? 'bg-red-100 text-red-600' : (item.priority === 'rendah' ? 'bg-slate-100 text-slate-600 dark:text-slate-400' : 'bg-yellow-100 text-yellow-600');
                
                list.innerHTML += `
                <div class="p-4 flex items-center gap-4 hover:bg-slate-50 dark:bg-slate-800/50 transition-colors ${item.completed ? 'opacity-60 bg-slate-50 dark:bg-slate-800/50' : ''}">
                    <button onclick="window.toggleStatus('barang', '${item.id}')" class="w-6 h-6 shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 text-transparent hover:border-blue-400'}">
                        <i class="fas fa-check text-xs"></i>
                    </button>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <h4 class="font-semibold text-sm ${item.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'} truncate">${item.name}</h4>
                            <span class="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${badgeColor}">${item.priority || 'sedang'}</span>
                        </div>
                        <p class="text-sm font-bold text-blue-600">${formatIDR(item.price)}</p>
                        ${item.link ? `<a href="${item.link}" target="_blank" class="text-xs text-blue-500 hover:underline mt-1 inline-block"><i class="fas fa-link"></i> Link Pembelian</a>` : ''}
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <button onclick="window.openModal('barang', '${item.id}')" class="w-8 h-8 rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50 flex items-center justify-center transition-colors"><i class="fas fa-pen text-xs"></i></button>
                        <button onclick="window.deleteItem('barang', '${item.id}')" class="w-8 h-8 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"><i class="fas fa-trash text-xs"></i></button>
                    </div>
                </div>`;
            });
        }

        function renderTempat() {
            const list = document.getElementById('list-tempat');
            list.innerHTML = '';
            if(appData.tempat.length === 0) {
                list.innerHTML = `<div class="col-span-full p-8 text-center text-slate-400"><i class="fas fa-map-marked-alt text-3xl mb-2 text-slate-300"></i><p class="text-sm">Belum ada destinasi tersimpan.</p></div>`;
                return;
            }

            appData.tempat.sort((a,b) => b.createdAt - a.createdAt).forEach(item => {
                const imgHtml = item.photo ? `<div class="h-32 w-full bg-slate-100 overflow-hidden"><img src="${item.photo}" class="w-full h-full object-cover"></div>` : `<div class="h-24 w-full bg-emerald-50 flex flex-col items-center justify-center text-emerald-200"><i class="fas fa-image text-2xl mb-1"></i><span class="text-[10px]">Tanpa Foto</span></div>`;
                
                list.innerHTML += `
                <div class="bg-white dark:bg-slate-800 rounded-xl dark:border-slate-700 overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 relative ${item.visited ? 'opacity-70' : ''}">
                    ${item.visited ? '<div class="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10"><i class="fas fa-check mr-1"></i>DIKUNJUNGI</div>' : ''}
                    ${imgHtml}
                    <div class="p-4">
                        <h4 class="font-bold text-slate-800 dark:text-slate-100 mb-1 ${item.visited ? 'line-through text-slate-500 dark:text-slate-400' : ''}">${item.name}</h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">${detectLink(item.location)}</p>
                        
                        <div class="flex items-center gap-2 mt-auto">
                            <button onclick="window.toggleStatus('tempat', '${item.id}')" class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${item.visited ? 'bg-slate-100 text-slate-600 dark:text-slate-400 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}">
                                ${item.visited ? 'Batal' : 'Tandai Selesai'}
                            </button>
                            <button onclick="window.openModal('tempat', '${item.id}')" class="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-blue-500 flex items-center justify-center transition-colors"><i class="fas fa-pen text-xs"></i></button>
                            <button onclick="window.deleteItem('tempat', '${item.id}')" class="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"><i class="fas fa-trash text-xs"></i></button>
                        </div>
                    </div>
                </div>`;
            });
        }

        function renderTugas() {
            const list = document.getElementById('list-tugas');
            const filter = document.getElementById('filter-tugas-status') ? document.getElementById('filter-tugas-status').value : 'semua';
            list.innerHTML = '';
            
            let filteredTugas = appData.tugas.filter(item => {
                if(filter === 'aktif') return !item.completed;
                if(filter === 'selesai') return item.completed;
                return true;
            });

            if(filteredTugas.length === 0) {
                list.innerHTML = `<div class="col-span-full p-8 text-center text-slate-400"><i class="fas fa-tasks text-3xl mb-2 text-slate-300"></i><p class="text-sm">Tidak ada tugas pada filter ini.</p></div>`;
                return;
            }

            let sortedTugas = filteredTugas.sort((a,b) => {
                if(a.completed !== b.completed) return a.completed ? 1 : -1;
                return new Date(a.deadline) - new Date(b.deadline);
            });

            sortedTugas.forEach(item => {
                list.innerHTML += `
                <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col ${item.completed ? 'opacity-60' : 'hover:shadow-md transition-shadow'}">
                    <div class="flex justify-between items-start mb-3">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-800/50">${item.matkul}</span>
                        <div class="flex gap-2">
                            <button onclick="window.openModal('tugas', '${item.id}')" class="w-6 h-6 text-slate-400 hover:text-blue-500 flex items-center justify-center"><i class="fas fa-pen text-xs"></i></button>
                            <button onclick="window.deleteItem('tugas', '${item.id}')" class="w-6 h-6 text-slate-400 hover:text-red-500 flex items-center justify-center"><i class="fas fa-trash text-xs"></i></button>
                        </div>
                    </div>
                    <div class="flex items-start gap-3 mb-3 flex-1">
                        <button onclick="window.toggleStatus('tugas', '${item.id}')" class="mt-0.5 w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-all ${item.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-indigo-400'}">
                            <i class="fas fa-check text-[10px]"></i>
                        </button>
                        <div>
                            <h4 class="font-bold text-slate-800 dark:text-slate-100 leading-tight mb-2 ${item.completed ? 'line-through text-slate-500 dark:text-slate-500' : ''}">${item.judul}</h4>
                            ${item.completed 
                                ? `<span class="text-[10px] font-bold px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 inline-flex items-center gap-1"><i class="fas fa-check"></i> Selesai</span>`
                                : `<span class="live-timer" data-deadline="${item.deadline}">Menghitung waktu...</span>`
                            }
                        </div>
                    </div>
                </div>`;
            });
        }

        function renderCatatan() {
            const list = document.getElementById('list-catatan');
            list.innerHTML = '';
            if(appData.catatan.length === 0) {
                list.innerHTML = `<div class="col-span-full p-8 text-center text-slate-400"><i class="fas fa-sticky-note text-3xl mb-2 text-slate-300"></i><p class="text-sm">Belum ada catatan.</p></div>`;
                return;
            }

            appData.catatan.sort((a,b) => b.createdAt - a.createdAt).forEach(item => {
                list.innerHTML += `
                <div class="bg-yellow-50 rounded-xl p-4 shadow-sm border border-yellow-100 relative group">
                    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button onclick="window.openModal('catatan', '${item.id}')" class="w-6 h-6 bg-white rounded shadow text-slate-500 dark:text-slate-400 hover:text-blue-500 flex items-center justify-center"><i class="fas fa-pen text-xs"></i></button>
                        <button onclick="window.deleteItem('catatan', '${item.id}')" class="w-6 h-6 bg-white rounded shadow text-slate-500 dark:text-slate-400 hover:text-red-500 flex items-center justify-center"><i class="fas fa-trash text-xs"></i></button>
                    </div>
                    <span class="text-[9px] font-bold uppercase tracking-wider text-yellow-700 mb-1 block">${item.matkul || 'Umum'}</span>
                    <h4 class="font-bold text-slate-800 dark:text-slate-100 mb-2">${item.judul || 'Tanpa Judul'}</h4>
                    <p class="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">${item.isi}</p>
                </div>`;
            });
        }

        
        function renderRundown() {
            const list = document.getElementById('list-rundown');
            if(!list) return;
            list.innerHTML = '';
            if(appData.rundown.length === 0) {
                list.innerHTML = `<div class="p-8 text-center text-slate-400 -ml-6"><i class="fas fa-calendar-times text-3xl mb-2 text-slate-300"></i><p class="text-sm">Rundown acara kosong.</p></div>`;
                return;
            }
            let sorted = [...appData.rundown].sort((a,b) => (a.mulai || "").localeCompare(b.mulai || ""));
            
            sorted.forEach(item => {
                list.innerHTML += `
                <div class="relative pl-6 sm:pl-8 group">
                    <div class="absolute w-4 h-4 bg-pink-500 rounded-full -left-[9px] top-1 border-4 border-white dark:border-slate-800 shadow-sm"></div>
                    <div class="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-800 transition-colors">
                        <div class="flex justify-between items-start mb-1">
                            <span class="text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded-md"><i class="far fa-clock"></i> ${item.mulai} - ${item.selesai}</span>
                            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onclick="window.openModal('rundown', '${item.id}')" class="text-slate-400 hover:text-blue-500"><i class="fas fa-pen text-xs"></i></button>
                                <button onclick="window.deleteItem('rundown', '${item.id}')" class="text-slate-400 hover:text-red-500"><i class="fas fa-trash text-xs"></i></button>
                            </div>
                        </div>
                        <h4 class="font-bold text-slate-800 dark:text-slate-100 text-lg">${item.judul}</h4>
                        ${item.pic ? `<p class="text-sm text-slate-500 dark:text-slate-400 mt-1"><i class="fas fa-user-circle"></i> ${item.pic}</p>` : ''}
                    </div>
                </div>`;
            });
        }

        function renderSettings() {
            const listTugas = document.getElementById('list-setting-tugas');
            const listCatatan = document.getElementById('list-setting-catatan');
            const dataTugas = document.getElementById('tugas-kategori-list');
            const dataCatatan = document.getElementById('catatan-kategori-list');
            if(!listTugas || !listCatatan) return;

            listTugas.innerHTML = ''; dataTugas.innerHTML = '';
            appData.settings.kategoriTugas.forEach(cat => {
                listTugas.innerHTML += `<span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded-full flex items-center gap-2 border border-indigo-100 dark:border-indigo-800">${cat} <button onclick="window.deleteSettingCategory('tugas', '${cat}')" class="hover:text-red-500"><i class="fas fa-times"></i></button></span>`;
                dataTugas.innerHTML += `<option value="${cat}">`;
            });

            listCatatan.innerHTML = ''; dataCatatan.innerHTML = '';
            appData.settings.kategoriCatatan.forEach(cat => {
                listCatatan.innerHTML += `<span class="px-3 py-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm rounded-full flex items-center gap-2 border border-yellow-100 dark:border-yellow-800">${cat} <button onclick="window.deleteSettingCategory('catatan', '${cat}')" class="hover:text-red-500"><i class="fas fa-times"></i></button></span>`;
                dataCatatan.innerHTML += `<option value="${cat}">`;
            });
        }

        function renderDashboard() {
            let uncompletedBarang = appData.barang.filter(i => !i.completed);
            let totalBudget = uncompletedBarang.reduce((sum, item) => sum + item.price, 0);
            
            let totalTempat = appData.tempat.length;
            let visitedTempat = appData.tempat.filter(i => i.visited).length;

            let totalTugas = appData.tugas.length;
            let doneTugas = appData.tugas.filter(i => i.completed).length;

            document.getElementById('stat-budget').innerText = formatIDR(totalBudget);
            document.getElementById('stat-tempat').innerText = `${visitedTempat} / ${totalTempat}`;
            document.getElementById('stat-tugas').innerText = `${doneTugas} / ${totalTugas}`;

            const dashUrgent = document.getElementById('dash-urgent-tasks');
            let urgentTasks = appData.tugas.filter(i => !i.completed).sort((a,b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 2);
            
            dashUrgent.innerHTML = '';
            if (urgentTasks.length === 0) {
                dashUrgent.innerHTML = `<div class="col-span-full text-sm text-slate-500 dark:text-slate-400 italic px-2">Semua tugas aman terkendali! 🎉</div>`;
            } else {
                urgentTasks.forEach(item => {
                    dashUrgent.innerHTML += `
                    <div class="bg-red-50 border border-red-100 rounded-xl p-3 flex justify-between items-center">
                        <div class="min-w-0 pr-3">
                            <p class="text-[10px] font-bold text-red-500 uppercase">${item.matkul}</p>
                            <p class="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">${item.judul}</p>
                        </div>
                        <span class="live-timer shrink-0" data-deadline="${item.deadline}"></span>
                    </div>`;
                });
            }

            const dashBarang = document.getElementById('dash-recent-barang');
            dashBarang.innerHTML = '';
            appData.barang.slice(0, 3).forEach(item => {
                dashBarang.innerHTML += `<div class="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:bg-slate-800/50"><span class="text-sm truncate ${item.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}">${item.name}</span><span class="text-xs font-bold ${item.completed ? 'text-slate-400' : 'text-blue-600'}">${formatIDR(item.price)}</span></div>`;
            });
            if(appData.barang.length === 0) dashBarang.innerHTML = '<p class="text-xs text-slate-400 italic">Belum ada barang.</p>';

            const dashTempat = document.getElementById('dash-recent-tempat');
            dashTempat.innerHTML = '';
            appData.tempat.slice(0, 3).forEach(item => {
                dashTempat.innerHTML += `<div class="flex items-center gap-2 p-2 rounded hover:bg-slate-50 dark:bg-slate-800/50"><i class="fas fa-map-marker-alt text-slate-300 text-xs"></i><span class="text-sm truncate ${item.visited ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}">${item.name}</span></div>`;
            });
            if(appData.tempat.length === 0) dashTempat.innerHTML = '<p class="text-xs text-slate-400 italic">Belum ada tempat.</p>';
        }

        function updateTimers() {
            document.querySelectorAll('.live-timer').forEach(el => {
                const deadlineStr = el.getAttribute('data-deadline');
                if (!deadlineStr) return;
                
                const deadline = new Date(deadlineStr).getTime();
                const now = Date.now();
                const diff = deadline - now;
                
                if (diff <= 0) {
                    el.innerHTML = '<i class="fas fa-exclamation-circle"></i> Terlambat';
                    el.className = 'live-timer text-[10px] font-bold px-2 py-1 rounded bg-red-100 text-red-600 inline-flex items-center gap-1 border border-red-200';
                    return;
                }
                
                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const m = Math.floor((diff / 1000 / 60) % 60);
                const s = Math.floor((diff / 1000) % 60);
                
                let text = '';
                if (d > 0) text += `${d}h `;
                if (h > 0 || d > 0) text += `${h}j `;
                text += `${m}m ${s}d`;
                
                el.innerHTML = '<i class="fas fa-stopwatch"></i> ' + text;
                
                if (d < 1) el.className = 'live-timer text-[10px] font-bold px-2 py-1 rounded bg-orange-100 text-orange-600 inline-flex items-center gap-1 border border-orange-200';
                else if (d < 3) el.className = 'live-timer text-[10px] font-bold px-2 py-1 rounded bg-yellow-100 text-yellow-700 inline-flex items-center gap-1 border border-yellow-200';
                else el.className = 'live-timer text-[10px] font-bold px-2 py-1 rounded bg-indigo-50 text-indigo-600 inline-flex items-center gap-1 border border-indigo-100';
            });
        }
        setInterval(updateTimers, 1000);

        // Image Compression
        document.getElementById('tempat-foto')?.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if(!file) return;

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 600;
                    let w = img.width, h = img.height;
                    
                    if (w > h && w > MAX_SIZE) { h *= MAX_SIZE / w; w = MAX_SIZE; }
                    else if (h > MAX_SIZE) { w *= MAX_SIZE / h; h = MAX_SIZE; }
                    
                    canvas.width = w; canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    
                    const base64 = canvas.toDataURL('image/jpeg', 0.7);
                    document.getElementById('tempat-foto-base64').value = base64;
                }
            };
        });

        // Form Event Listeners
        document.getElementById('form-barang').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('barang-id').value;
            const newData = {
                id: id || generateId(),
                name: document.getElementById('barang-nama').value,
                price: Number(document.getElementById('barang-harga').value),
                priority: document.getElementById('barang-prioritas').value,
                link: document.getElementById('barang-link').value,
                completed: id ? appData.barang.find(i=>i.id===id).completed : false,
                createdAt: id ? appData.barang.find(i=>i.id===id).createdAt : Date.now()
            };
            if(id) appData.barang = appData.barang.map(i => i.id === id ? newData : i);
            else appData.barang.push(newData);
            
            saveData(); window.closeModal();
        });

        document.getElementById('form-tempat').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('tempat-id').value;
            const newData = {
                id: id || generateId(),
                name: document.getElementById('tempat-nama').value,
                location: document.getElementById('tempat-lokasi').value,
                photo: document.getElementById('tempat-foto-base64').value,
                visited: id ? appData.tempat.find(i=>i.id===id).visited : false,
                createdAt: id ? appData.tempat.find(i=>i.id===id).createdAt : Date.now()
            };
            if(id) appData.tempat = appData.tempat.map(i => i.id === id ? newData : i);
            else appData.tempat.push(newData);
            
            saveData(); window.closeModal();
        });

        document.getElementById('form-tugas').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('tugas-id').value;
            const newData = {
                id: id || generateId(),
                judul: document.getElementById('tugas-judul').value,
                matkul: document.getElementById('tugas-matkul').value,
                deadline: document.getElementById('tugas-deadline').value,
                completed: id ? appData.tugas.find(i=>i.id===id).completed : false,
                createdAt: id ? appData.tugas.find(i=>i.id===id).createdAt : Date.now()
            };
            if(id) appData.tugas = appData.tugas.map(i => i.id === id ? newData : i);
            else appData.tugas.push(newData);
            
            saveData(); window.closeModal();
        });

        document.getElementById('form-catatan').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('catatan-id').value;
            const newData = {
                id: id || generateId(),
                judul: document.getElementById('catatan-judul').value,
                matkul: document.getElementById('catatan-matkul').value,
                isi: document.getElementById('catatan-isi').value,
                createdAt: id ? appData.catatan.find(i=>i.id===id).createdAt : Date.now()
            };
            if(id) appData.catatan = appData.catatan.map(i => i.id === id ? newData : i);
            else appData.catatan.push(newData);
            
            saveData(); window.closeModal();
        });

        // Jalankan koneksi saat halaman dimuat
        initCloudSync();
    
