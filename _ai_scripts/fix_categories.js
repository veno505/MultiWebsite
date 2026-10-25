const fs = require('fs');

let html = fs.readFileSync('WEBSITE WISHLIST.html', 'utf8');

// 1. Add Kategori Barang and Kategori Rundown to Settings (HTML)
// Change grid-cols-3 to something that wraps well or grid-cols-1 md:grid-cols-2 lg:grid-cols-3
html = html.replace(/<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">/, '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-wrap">');

if (!html.includes('Kategori Barang')) {
    const barangSettingBlock = `
                    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 class="font-bold text-slate-800 dark:text-white mb-4"><i class="fas fa-tags text-blue-500 mr-2"></i>Kategori Barang</h3>
                        <form id="form-setting-barang" class="flex gap-2 mb-4">
                            <input type="text" id="input-setting-barang" required placeholder="Tambah kategori..." class="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500">
                            <button type="submit" class="bg-slate-800 dark:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"><i class="fas fa-plus"></i></button>
                        </form>
                        <div id="list-setting-barang" class="flex flex-wrap gap-2"></div>
                    </div>`;
    const rundownSettingBlock = `
                    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 class="font-bold text-slate-800 dark:text-white mb-4"><i class="fas fa-tags text-rose-500 mr-2"></i>Kategori Rundown</h3>
                        <form id="form-setting-rundown" class="flex gap-2 mb-4">
                            <input type="text" id="input-setting-rundown" required placeholder="Tambah kategori..." class="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-rose-500">
                            <button type="submit" class="bg-slate-800 dark:bg-rose-600 text-white px-3 py-2 rounded-lg text-sm"><i class="fas fa-plus"></i></button>
                        </form>
                        <div id="list-setting-rundown" class="flex flex-wrap gap-2"></div>
                    </div>`;
    
    // Insert after Kategori Tempat
    html = html.replace(/(<div id="list-setting-tempat" class="flex flex-wrap gap-2"><\/div>\s*<\/div>)/, '$1' + barangSettingBlock + rundownSettingBlock);
}

// 2. Add Kategori to Modals
if (!html.includes('id="barang-kategori"')) {
    const barangKategoriInput = `
                <datalist id="barang-kategori-list"></datalist>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori Barang</label>
                    <input type="text" id="barang-kategori" list="barang-kategori-list" placeholder="Pilih atau Ketik Kategori" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                </div>`;
    html = html.replace(/(<input type="text" id="barang-nama" required[^>]*>\s*<\/div>)/, '$1' + barangKategoriInput);
}

if (!html.includes('id="rundown-kategori"')) {
    const rundownKategoriInput = `
                <datalist id="rundown-kategori-list"></datalist>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori Rundown</label>
                    <input type="text" id="rundown-kategori" list="rundown-kategori-list" placeholder="Pilih atau Ketik Kategori" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all">
                </div>`;
    html = html.replace(/(<input type="text" id="rundown-nama" required[^>]*>\s*<\/div>)/, '$1' + rundownKategoriInput);
}

// 3. Update appData settings & loadDataFromCloud
if (!html.includes("kategoriBarang:")) {
    html = html.replace(/kategoriTempat: \['Pantai', 'Pegunungan', 'Kota', 'Kuliner'\],/g, "kategoriTempat: ['Pantai', 'Pegunungan', 'Kota', 'Kuliner'],\n        kategoriBarang: ['Pakaian', 'Elektronik', 'Kebutuhan'],\n        kategoriRundown: ['Persiapan', 'Inti', 'Penutup'],");
    html = html.replace(/if \(!Array\.isArray\(appData\.settings\.kategoriTempat\)\) appData\.settings\.kategoriTempat = defaultSettings\.kategoriTempat;/, "if (!Array.isArray(appData.settings.kategoriTempat)) appData.settings.kategoriTempat = defaultSettings.kategoriTempat;\n                    if (!Array.isArray(appData.settings.kategoriBarang)) appData.settings.kategoriBarang = defaultSettings.kategoriBarang;\n                    if (!Array.isArray(appData.settings.kategoriRundown)) appData.settings.kategoriRundown = defaultSettings.kategoriRundown;");
}

// 4. Update deleteSettingCategory & event listeners
if (!html.includes("if(type === 'barang') appData.settings.kategoriBarang")) {
    html = html.replace(/if\(type === 'tempat'\) appData\.settings\.kategoriTempat = appData\.settings\.kategoriTempat\.filter\(v => v !== val\);/, "if(type === 'tempat') appData.settings.kategoriTempat = appData.settings.kategoriTempat.filter(v => v !== val);\n            if(type === 'barang') appData.settings.kategoriBarang = appData.settings.kategoriBarang.filter(v => v !== val);\n            if(type === 'rundown') appData.settings.kategoriRundown = appData.settings.kategoriRundown.filter(v => v !== val);");
    
    const extraListeners = `
        document.getElementById('form-setting-barang')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = document.getElementById('input-setting-barang').value;
            if(!appData.settings.kategoriBarang.includes(val)) appData.settings.kategoriBarang.push(val);
            document.getElementById('input-setting-barang').value = '';
            saveData();
        });
        document.getElementById('form-setting-rundown')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = document.getElementById('input-setting-rundown').value;
            if(!appData.settings.kategoriRundown.includes(val)) appData.settings.kategoriRundown.push(val);
            document.getElementById('input-setting-rundown').value = '';
            saveData();
        });`;
    html = html.replace(/(document\.getElementById\('form-setting-tempat'\)\?\.addEventListener\('submit', \(e\) => \{[\s\S]*?\}\);)/, '$1' + extraListeners);
}

// 5. Modal handling in JS
if (!html.includes("document.getElementById('barang-kategori').value = item.kategori")) {
    html = html.replace(/document\.getElementById\('barang-nama'\)\.value = item\.name;/, "document.getElementById('barang-nama').value = item.name;\n                        if(document.getElementById('barang-kategori')) document.getElementById('barang-kategori').value = item.kategori || '';");
    html = html.replace(/document\.getElementById\('rundown-nama'\)\.value = item\.name;/, "document.getElementById('rundown-nama').value = item.name;\n                        if(document.getElementById('rundown-kategori')) document.getElementById('rundown-kategori').value = item.kategori || '';");
}
if (!html.includes("kategori: document.getElementById('barang-kategori')")) {
    html = html.replace(/name: document\.getElementById\('barang-nama'\)\.value,/, "name: document.getElementById('barang-nama').value,\n                kategori: document.getElementById('barang-kategori') ? document.getElementById('barang-kategori').value : '',");
    html = html.replace(/name: document\.getElementById\('rundown-nama'\)\.value,/, "name: document.getElementById('rundown-nama').value,\n                kategori: document.getElementById('rundown-kategori') ? document.getElementById('rundown-kategori').value : '',");
}

// 6. Update renderSettings
if (!html.includes("list-setting-barang")) {
    const renderExtraSettings = `
            const listBarang = document.getElementById('list-setting-barang');
            const dataBarang = document.getElementById('barang-kategori-list');
            if(listBarang && dataBarang) {
                listBarang.innerHTML = ''; dataBarang.innerHTML = '';
                appData.settings.kategoriBarang.forEach(cat => {
                    listBarang.innerHTML += \`<span class="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full flex items-center gap-2 border border-blue-100 dark:border-blue-800">\${cat} <button onclick="window.deleteSettingCategory('barang', '\${cat}')" class="hover:text-red-500"><i class="fas fa-times"></i></button></span>\`;
                    dataBarang.innerHTML += \`<option value="\${cat}">\`;
                });
            }

            const listRundown = document.getElementById('list-setting-rundown');
            const dataRundown = document.getElementById('rundown-kategori-list');
            if(listRundown && dataRundown) {
                listRundown.innerHTML = ''; dataRundown.innerHTML = '';
                appData.settings.kategoriRundown.forEach(cat => {
                    listRundown.innerHTML += \`<span class="px-3 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm rounded-full flex items-center gap-2 border border-rose-100 dark:border-rose-800">\${cat} <button onclick="window.deleteSettingCategory('rundown', '\${cat}')" class="hover:text-red-500"><i class="fas fa-times"></i></button></span>\`;
                    dataRundown.innerHTML += \`<option value="\${cat}">\`;
                });
            }
`;
    html = html.replace(/(appData\.settings\.kategoriTempat\.forEach\(cat => \{[\s\S]*?\}\);[\s\S]*?\})/g, '$1' + renderExtraSettings);
}

// 7. Update render UI Cards
// Barang
if (!html.includes("item.kategori || 'Umum'")) {
    html = html.replace(/<h3 class="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1 \$\{item\.bought \? 'line-through text-slate-500 dark:text-slate-400' : ''\}">\$\{item\.name\}<\/h3>/, `<span class="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 block">\${item.kategori || 'Umum'}</span>\n                        <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1 \${item.bought ? 'line-through text-slate-500 dark:text-slate-400' : ''}">\${item.name}</h3>`);
}
// Rundown
if (!html.includes("item.kategori || 'Sesi'")) {
    html = html.replace(/<h4 class="font-bold text-slate-800 dark:text-white text-lg">\$\{item\.name\}<\/h4>/, `<span class="text-[9px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1 block">\${item.kategori || 'Sesi'}</span>\n                            <h4 class="font-bold text-slate-800 dark:text-white text-lg">\${item.name}</h4>`);
}

fs.writeFileSync('WEBSITE WISHLIST.html', html, 'utf8');
console.log("Done patching categories into WEBSITE WISHLIST.html");
