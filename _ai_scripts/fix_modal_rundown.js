const fs = require('fs');

let html = fs.readFileSync('WEBSITE WISHLIST.html', 'utf8');

const modalRundown = `
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
`;

// Insert modal-rundown before modal-barang in the actual modal overlay
const targetStr = '        <div id="modal-barang"';
if (html.indexOf(targetStr) > -1) {
    html = html.replace(targetStr, modalRundown + '\n' + targetStr);
}

// Clean up orphaned <!-- Modal Barang --> if it exists outside
const orphanedModalBarangRegex = /<!-- Modal Barang -->\s*<!-- MODALS SECTION -->/g;
html = html.replace(orphanedModalBarangRegex, '<!-- MODALS SECTION -->');

fs.writeFileSync('WEBSITE WISHLIST.html', html);
console.log('Fixed modal rundown and orphaned comments.');
