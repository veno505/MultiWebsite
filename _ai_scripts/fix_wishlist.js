const fs = require('fs');

let html = fs.readFileSync('WEBSITE WISHLIST.html', 'utf8');

// 1. Fix modal dark mode
html = html.replace(/class="hidden modal-content bg-white w-full/g, 'class="hidden modal-content bg-white dark:bg-slate-800 w-full');

// 2. Add Kategori Tempat to Settings (HTML)
html = html.replace(/<div class="grid grid-cols-1 md:grid-cols-2 gap-6">/, '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">');
if (!html.includes('Kategori Tempat')) {
    const tempatSettingBlock = `
                    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 class="font-bold text-slate-800 dark:text-white mb-4"><i class="fas fa-tags text-emerald-500 mr-2"></i>Kategori Tempat</h3>
                        <form id="form-setting-tempat" class="flex gap-2 mb-4">
                            <input type="text" id="input-setting-tempat" required placeholder="Tambah kategori..." class="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-emerald-500">
                            <button type="submit" class="bg-slate-800 dark:bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm"><i class="fas fa-plus"></i></button>
                        </form>
                        <div id="list-setting-tempat" class="flex flex-wrap gap-2"></div>
                    </div>`;
    html = html.replace(/(<div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">[\s\S]*?<h3 class="font-bold text-slate-800 dark:text-white mb-4"><i class="fas fa-tags text-yellow-500 mr-2"><\/i>Kategori Catatan<\/h3>[\s\S]*?<\/form>\s*<div id="list-setting-catatan" class="flex flex-wrap gap-2"><\/div>\s*<\/div>)/, '$1' + tempatSettingBlock);
}

// 3. Add Kategori Tempat to Modal Tempat (HTML)
if (!html.includes('id="tempat-kategori"')) {
    const kategoriInput = `
                <datalist id="tempat-kategori-list"></datalist>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori Destinasi</label>
                    <input type="text" id="tempat-kategori" list="tempat-kategori-list" placeholder="Pilih atau Ketik Kategori" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                </div>`;
    html = html.replace(/(<input type="text" id="tempat-nama" required[^>]*>\s*<\/div>)/, '$1' + kategoriInput);
}

// 4. Update appData settings & loadDataFromCloud
if (!html.includes("kategoriTempat: ['Pantai', 'Pegunungan', 'Kota', 'Kuliner']")) {
    html = html.replace(/kategoriTugas: \['Kuliah', 'Pekerjaan', 'Organisasi'\],(\s*)kategoriCatatan: \['Jurnal', 'Materi', 'Bebas'\],/g, "kategoriTugas: ['Kuliah', 'Pekerjaan', 'Organisasi'],$1kategoriCatatan: ['Jurnal', 'Materi', 'Bebas'],$1kategoriTempat: ['Pantai', 'Pegunungan', 'Kota', 'Kuliner'],");
    html = html.replace(/if \(!Array\.isArray\(appData\.settings\.kategoriCatatan\)\) appData\.settings\.kategoriCatatan = defaultSettings\.kategoriCatatan;/, "if (!Array.isArray(appData.settings.kategoriCatatan)) appData.settings.kategoriCatatan = defaultSettings.kategoriCatatan;\n                    if (!Array.isArray(appData.settings.kategoriTempat)) appData.settings.kategoriTempat = defaultSettings.kategoriTempat;");
}

// 5. Update deleteSettingCategory & event listeners
if (!html.includes("if(type === 'tempat') appData.settings.kategoriTempat")) {
    html = html.replace(/if\(type === 'catatan'\) appData\.settings\.kategoriCatatan = appData\.settings\.kategoriCatatan\.filter\(v => v !== val\);/, "if(type === 'catatan') appData.settings.kategoriCatatan = appData.settings.kategoriCatatan.filter(v => v !== val);\n            if(type === 'tempat') appData.settings.kategoriTempat = appData.settings.kategoriTempat.filter(v => v !== val);");
    
    const tempatListener = `
        document.getElementById('form-setting-tempat')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = document.getElementById('input-setting-tempat').value;
            if(!appData.settings.kategoriTempat.includes(val)) appData.settings.kategoriTempat.push(val);
            document.getElementById('input-setting-tempat').value = '';
            saveData();
        });`;
    html = html.replace(/(document\.getElementById\('form-setting-catatan'\)\.addEventListener\('submit', \(e\) => \{[\s\S]*?\}\);)/, '$1' + tempatListener);
}

// 6. Modal handling in JS
if (!html.includes("document.getElementById('tempat-kategori').value = item.kategori")) {
    html = html.replace(/document\.getElementById\('tempat-nama'\)\.value = item\.name;/, "document.getElementById('tempat-nama').value = item.name;\n                        if(document.getElementById('tempat-kategori')) document.getElementById('tempat-kategori').value = item.kategori || '';");
}
if (!html.includes("kategori: document.getElementById('tempat-kategori')")) {
    html = html.replace(/name: document\.getElementById\('tempat-nama'\)\.value,/, "name: document.getElementById('tempat-nama').value,\n                kategori: document.getElementById('tempat-kategori') ? document.getElementById('tempat-kategori').value : '',");
}

// 7. Update renderSettings
if (!html.includes("list-setting-tempat")) {
    const renderTempatSettings = `
            const listTempat = document.getElementById('list-setting-tempat');
            const dataTempat = document.getElementById('tempat-kategori-list');
            if(listTempat && dataTempat) {
                listTempat.innerHTML = ''; dataTempat.innerHTML = '';
                appData.settings.kategoriTempat.forEach(cat => {
                    listTempat.innerHTML += \`<span class="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm rounded-full flex items-center gap-2 border border-emerald-100 dark:border-emerald-800">\${cat} <button onclick="window.deleteSettingCategory('tempat', '\${cat}')" class="hover:text-red-500"><i class="fas fa-times"></i></button></span>\`;
                    dataTempat.innerHTML += \`<option value="\${cat}">\`;
                });
            }
`;
    html = html.replace(/(appData\.settings\.kategoriCatatan\.forEach\(cat => \{[\s\S]*?\}\);)/, '$1' + renderTempatSettings);
}

// 8. Update renderTempat UI & Fix emerald-50 dark mode
html = html.replace(/bg-emerald-50 flex flex-col items-center justify-center text-emerald-200/g, "bg-emerald-50 dark:bg-emerald-900/20 flex flex-col items-center justify-center text-emerald-200 dark:text-emerald-700/50");

if (!html.includes("item.kategori || 'Umum'")) {
    html = html.replace(/<h4 class="font-bold text-slate-800 dark:text-slate-100 mb-1 \$\{item\.visited \? 'line-through text-slate-500 dark:text-slate-400' : ''\}">\$\{item\.name\}<\/h4>/, `<span class="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 block">\${item.kategori || 'Umum'}</span>\n                        <h4 class="font-bold text-slate-800 dark:text-slate-100 mb-1 \${item.visited ? 'line-through text-slate-500 dark:text-slate-400' : ''}">\${item.name}</h4>`);
}

// 9. Fix renderCatatan bg-yellow-50 dark mode bug
html = html.replace(/class="bg-yellow-50 rounded-xl p-4 shadow-sm border border-yellow-100 relative group"/g, 'class="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 shadow-sm border border-yellow-100 dark:border-yellow-800/50 relative group"');
html = html.replace(/class="w-full px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"/g, 'class="w-full px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800/50 rounded-xl focus:bg-white dark:focus:bg-yellow-900/50 focus:ring-2 focus:ring-yellow-500 outline-none transition-all dark:text-yellow-100"');
html = html.replace(/class="w-full px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all resize-none"/g, 'class="w-full px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800/50 rounded-xl focus:bg-white dark:focus:bg-yellow-900/50 focus:ring-2 focus:ring-yellow-500 outline-none transition-all resize-none dark:text-yellow-100"');
html = html.replace(/class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-yellow-50\/50"/g, 'class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-yellow-50/50 dark:bg-yellow-900/20"');

fs.writeFileSync('WEBSITE WISHLIST.html', html, 'utf8');
console.log("Done patching WEBSITE WISHLIST.html");
