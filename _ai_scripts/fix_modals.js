const fs = require('fs');
let html = fs.readFileSync('WEBSITE WISHLIST.html', 'utf8');

const modalsHTML = `    <div id="modal-overlay" class="modal fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        
        <!-- Modal Barang -->
        <div id="modal-barang" class="hidden modal-content bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100" id="title-modal-barang">Tambah Barang</h3>
                <button onclick="window.closeModal()" class="text-slate-400 hover:text-red-500 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"><i class="fas fa-times"></i></button>
            </div>
            <form id="form-barang" class="p-6 space-y-4">
                <input type="hidden" id="barang-id">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Barang *</label>
                    <input type="text" id="barang-nama" required class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                </div>
                <datalist id="barang-kategori-list"></datalist>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori Barang</label>
                    <input type="text" id="barang-kategori" list="barang-kategori-list" placeholder="Pilih atau Ketik Kategori" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Harga *</label>
                    <div class="relative">
                        <span class="absolute left-4 top-2.5 text-slate-500 dark:text-slate-400 font-medium">Rp</span>
                        <input type="number" id="barang-harga" required min="0" class="w-full pl-11 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prioritas</label>
                        <select id="barang-prioritas" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none text-sm">
                            <option value="tinggi">🔥 Tinggi</option>
                            <option value="sedang" selected>✨ Sedang</option>
                            <option value="rendah">💡 Rendah</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link Beli (Opsional)</label>
                        <input type="url" id="barang-link" placeholder="https://" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm">
                    </div>
                </div>
                <div class="pt-4">
                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-sm transition-colors">Simpan Barang</button>
                </div>
            </form>
        </div>

        <!-- Modal Tempat -->
        <div id="modal-tempat" class="hidden modal-content bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100" id="title-modal-tempat">Tambah Destinasi</h3>
                <button onclick="window.closeModal()" class="text-slate-400 hover:text-red-500 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"><i class="fas fa-times"></i></button>
            </div>
            <form id="form-tempat" class="p-6 space-y-4">
                <input type="hidden" id="tempat-id">
                <input type="hidden" id="tempat-foto-base64">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Tempat *</label>
                    <input type="text" id="tempat-nama" required class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                </div>
                <datalist id="tempat-kategori-list"></datalist>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori Destinasi</label>
                    <input type="text" id="tempat-kategori" list="tempat-kategori-list" placeholder="Pilih atau Ketik Kategori" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Detail / Link Google Maps *</label>
                    <input type="text" id="tempat-lokasi" required placeholder="Alamat atau paste link Maps" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Foto Tempat (Opsional)</label>
                    <input type="file" id="tempat-foto" accept="image/*" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer">
                    <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">*Foto akan dikompres otomatis agar memori tetap lega.</p>
                </div>
                <div class="pt-4">
                    <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-sm transition-colors">Simpan Tempat</button>
                </div>
            </form>
        </div>

        <!-- Modal Tugas -->
        <div id="modal-tugas" class="hidden modal-content bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100" id="title-modal-tugas">Tambah Tugas Baru</h3>
                <button onclick="window.closeModal()" class="text-slate-400 hover:text-red-500 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"><i class="fas fa-times"></i></button>
            </div>
            <form id="form-tugas" class="p-6 space-y-4">
                <input type="hidden" id="tugas-id">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Judul Tugas *</label>
                    <input type="text" id="tugas-judul" required placeholder="Cth: Makalah Bab 1" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                </div>
                <datalist id="tugas-kategori-list"></datalist>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mata Kuliah *</label>
                    <input type="text" id="tugas-matkul" required list="tugas-kategori-list" placeholder="Pilih atau Ketik Kategori" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Maksimal Pengerjaan (Deadline) *</label>
                    <input type="datetime-local" id="tugas-deadline" required class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                </div>
                <div class="pt-4">
                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-sm transition-colors">Simpan Tugas</button>
                </div>
            </form>
        </div>

        <!-- Modal Catatan -->
        <div id="modal-catatan" class="hidden modal-content bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-yellow-50/50 dark:bg-yellow-900/20">
                <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100" id="title-modal-catatan">Buat Catatan</h3>
                <button onclick="window.closeModal()" class="text-slate-400 hover:text-red-500 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"><i class="fas fa-times"></i></button>
            </div>
            <form id="form-catatan" class="p-6 space-y-4">
                <input type="hidden" id="catatan-id">
                <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Judul Catatan</label>
                        <input type="text" id="catatan-judul" required placeholder="Ide cemerlang..." class="w-full px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800/50 rounded-xl focus:bg-white dark:focus:bg-yellow-900/50 focus:ring-2 focus:ring-yellow-500 outline-none transition-all dark:text-yellow-100">
                    </div>
                    <datalist id="catatan-kategori-list"></datalist>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori / Matkul</label>
                        <input type="text" id="catatan-matkul" list="catatan-kategori-list" placeholder="Pilih atau Ketik Kategori" class="w-full px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800/50 rounded-xl focus:bg-white dark:focus:bg-yellow-900/50 focus:ring-2 focus:ring-yellow-500 outline-none transition-all dark:text-yellow-100">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Isi Catatan *</label>
                    <textarea id="catatan-isi" required rows="4" class="w-full px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800/50 rounded-xl focus:bg-white dark:focus:bg-yellow-900/50 focus:ring-2 focus:ring-yellow-500 outline-none transition-all resize-none dark:text-yellow-100"></textarea>
                </div>
                <div class="pt-4">
                    <button type="submit" class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-xl shadow-sm transition-colors text-slate-900">Simpan Catatan</button>
                </div>
            </form>
        </div>

        <!-- Modal Rundown -->
        <div id="modal-rundown" class="hidden modal-content bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-pink-50/50 dark:bg-pink-900/20">
                <h3 class="font-bold text-lg text-slate-800 dark:text-white" id="title-modal-rundown">Tambah Sesi Rundown</h3>
                <button onclick="window.closeModal()" class="text-slate-400 hover:text-red-500 w-8 h-8 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors"><i class="fas fa-times"></i></button>
            </div>
            <form id="form-rundown" class="p-6 space-y-4">
                <input type="hidden" id="rundown-id">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Sesi / Kegiatan *</label>
                    <input type="text" id="rundown-judul" required placeholder="Cth: Registrasi Peserta" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500 outline-none transition-all dark:text-white">
                </div>
                <datalist id="rundown-kategori-list"></datalist>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori Rundown</label>
                    <input type="text" id="rundown-kategori" list="rundown-kategori-list" placeholder="Pilih atau Ketik Kategori" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500 outline-none transition-all dark:text-white">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mulai *</label>
                        <input type="time" id="rundown-mulai" required class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500 outline-none transition-all dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selesai *</label>
                        <input type="time" id="rundown-selesai" required class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500 outline-none transition-all dark:text-white">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Keterangan / PIC</label>
                    <input type="text" id="rundown-pic" placeholder="Cth: Panitia Inti" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500 outline-none transition-all dark:text-white">
                </div>
                <div class="pt-4">
                    <button type="submit" class="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-xl shadow-sm transition-colors">Simpan Rundown</button>
                </div>
            </form>
        </div>
    </div>`;

html = html.replace(/<div id="modal-overlay" class="modal fixed inset-0 bg-slate-900\/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">[\s\S]*?<\/div>\s*<\/div>/, modalsHTML);

fs.writeFileSync('WEBSITE WISHLIST.html', html, 'utf8');
console.log("Restored modals successfully");
