const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'WEBSITE WISHLIST.html');
let html = fs.readFileSync(file, 'utf8');

// Fix 1: renderAll
html = html.replace(
    /function renderAll\(\) \{\s*renderBarang\(\);\s*renderTempat\(\);\s*renderTugas\(\);\s*renderCatatan\(\);\s*renderDashboard\(\);\s*\}/,
    `function renderAll() {
            renderBarang();
            renderTempat();
            renderTugas();
            renderCatatan();
            renderRundown();
            renderDashboard(); 
        }`
);

// Fix 2: openModal for rundown
html = html.replace(
    /document\.getElementById\('rundown-judul'\)\.value = item\.judul;\s*document\.getElementById\('rundown-mulai'\)\.value = item\.mulai;/,
    `document.getElementById('rundown-judul').value = item.judul;
                        if(document.getElementById('rundown-kategori')) document.getElementById('rundown-kategori').value = item.kategori || '';
                        document.getElementById('rundown-mulai').value = item.mulai;`
);

// Fix 3: renderBarang add kategori
html = html.replace(
    /<span class="text-\[9px\] px-1\.5 py-0\.5 rounded uppercase font-bold tracking-wider \$\{badgeColor\}">\$\{item\.priority \|\| 'sedang'\}<\/span>/,
    `<span class="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider \${badgeColor}">\${item.priority || 'sedang'}</span>
                            \${item.kategori ? \`<span class="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">\${item.kategori}</span>\` : ''}`
);

// Fix 4: renderRundown add kategori
html = html.replace(
    /<span class="text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900\/20 px-2 py-1 rounded-md"><i class="far fa-clock"><\/i> \$\{item\.mulai\} - \$\{item\.selesai\}<\/span>/,
    `<div class="flex gap-2 items-center">
                                <span class="text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded-md"><i class="far fa-clock"></i> \${item.mulai} - \${item.selesai}</span>
                                \${item.kategori ? \`<span class="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded border border-purple-100 dark:border-purple-800/50">\${item.kategori}</span>\` : ''}
                            </div>`
);

// Fix 5: Replace renderSettings entirely
const oldRenderSettings = `function renderSettings() {
            const listTugas = document.getElementById('list-setting-tugas');
            const listCatatan = document.getElementById('list-setting-catatan');
            const dataTugas = document.getElementById('tugas-kategori-list');
            const dataCatatan = document.getElementById('catatan-kategori-list');
            if(!listTugas || !listCatatan) return;

            listTugas.innerHTML = ''; dataTugas.innerHTML = '';
            appData.settings.kategoriTugas.forEach(cat => {
                listTugas.innerHTML += \`<span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded-full flex items-center gap-2 border border-indigo-100 dark:border-indigo-800">\${cat} <button onclick="window.deleteSettingCategory('tugas', '\${cat}')" class="hover:text-red-500"><i class="fas fa-times"></i></button></span>\`;
                dataTugas.innerHTML += \`<option value="\${cat}">\`;
            });

            listCatatan.innerHTML = ''; dataCatatan.innerHTML = '';
            appData.settings.kategoriCatatan.forEach(cat => {
                listCatatan.innerHTML += \`<span class="px-3 py-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm rounded-full flex items-center gap-2 border border-yellow-100 dark:border-yellow-800">\${cat} <button onclick="window.deleteSettingCategory('catatan', '\${cat}')" class="hover:text-red-500"><i class="fas fa-times"></i></button></span>\`;
                dataCatatan.innerHTML += \`<option value="\${cat}">\`;
            });
        }`;

const newRenderSettings = `function renderSettings() {
            const listTugas = document.getElementById('list-setting-tugas');
            const listCatatan = document.getElementById('list-setting-catatan');
            const listBarang = document.getElementById('list-setting-barang');
            const listTempat = document.getElementById('list-setting-tempat');
            const listRundown = document.getElementById('list-setting-rundown');

            const dataTugas = document.getElementById('tugas-kategori-list');
            const dataCatatan = document.getElementById('catatan-kategori-list');
            const dataBarang = document.getElementById('barang-kategori-list');
            const dataTempat = document.getElementById('tempat-kategori-list');
            const dataRundown = document.getElementById('rundown-kategori-list');

            if(listTugas && dataTugas) {
                listTugas.innerHTML = ''; dataTugas.innerHTML = '';
                appData.settings.kategoriTugas.forEach(cat => {
                    listTugas.innerHTML += \`<span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded-full flex items-center gap-2 border border-indigo-100 dark:border-indigo-800">\${cat} <button onclick="window.deleteSettingCategory('tugas', '\${cat}')" class="hover:text-red-500"><i class="fas fa-times"></i></button></span>\`;
                    dataTugas.innerHTML += \`<option value="\${cat}">\`;
                });
            }

            if(listCatatan && dataCatatan) {
                listCatatan.innerHTML = ''; dataCatatan.innerHTML = '';
                appData.settings.kategoriCatatan.forEach(cat => {
                    listCatatan.innerHTML += \`<span class="px-3 py-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm rounded-full flex items-center gap-2 border border-yellow-100 dark:border-yellow-800">\${cat} <button onclick="window.deleteSettingCategory('catatan', '\${cat}')" class="hover:text-red-500"><i class="fas fa-times"></i></button></span>\`;
                    dataCatatan.innerHTML += \`<option value="\${cat}">\`;
                });
            }

            if(listBarang && dataBarang) {
                listBarang.innerHTML = ''; dataBarang.innerHTML = '';
                appData.settings.kategoriBarang.forEach(cat => {
                    listBarang.innerHTML += \`<span class="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full flex items-center gap-2 border border-blue-100 dark:border-blue-800">\${cat} <button onclick="window.deleteSettingCategory('barang', '\${cat}')" class="hover:text-red-500"><i class="fas fa-times"></i></button></span>\`;
                    dataBarang.innerHTML += \`<option value="\${cat}">\`;
                });
            }

            if(listTempat && dataTempat) {
                listTempat.innerHTML = ''; dataTempat.innerHTML = '';
                appData.settings.kategoriTempat.forEach(cat => {
                    listTempat.innerHTML += \`<span class="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm rounded-full flex items-center gap-2 border border-emerald-100 dark:border-emerald-800">\${cat} <button onclick="window.deleteSettingCategory('tempat', '\${cat}')" class="hover:text-red-500"><i class="fas fa-times"></i></button></span>\`;
                    dataTempat.innerHTML += \`<option value="\${cat}">\`;
                });
            }

            if(listRundown && dataRundown) {
                listRundown.innerHTML = ''; dataRundown.innerHTML = '';
                appData.settings.kategoriRundown.forEach(cat => {
                    listRundown.innerHTML += \`<span class="px-3 py-1 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm rounded-full flex items-center gap-2 border border-pink-100 dark:border-pink-800">\${cat} <button onclick="window.deleteSettingCategory('rundown', '\${cat}')" class="hover:text-red-500"><i class="fas fa-times"></i></button></span>\`;
                    dataRundown.innerHTML += \`<option value="\${cat}">\`;
                });
            }
        }`;

html = html.replace(oldRenderSettings, newRenderSettings);

// Fix 6: Add missing form submit event listeners
const oldSubmitListener = `document.getElementById('form-setting-catatan').addEventListener('submit', (e) => {
            e.preventDefault();
            const val = document.getElementById('input-setting-catatan').value;
            if(!appData.settings.kategoriCatatan.includes(val)) appData.settings.kategoriCatatan.push(val);
            document.getElementById('input-setting-catatan').value = '';
            saveData();
        });`;

const newSubmitListeners = `document.getElementById('form-setting-catatan').addEventListener('submit', (e) => {
            e.preventDefault();
            const val = document.getElementById('input-setting-catatan').value;
            if(!appData.settings.kategoriCatatan.includes(val)) appData.settings.kategoriCatatan.push(val);
            document.getElementById('input-setting-catatan').value = '';
            saveData();
        });

        if(document.getElementById('form-setting-barang')) {
            document.getElementById('form-setting-barang').addEventListener('submit', (e) => {
                e.preventDefault();
                const val = document.getElementById('input-setting-barang').value;
                if(!appData.settings.kategoriBarang.includes(val)) appData.settings.kategoriBarang.push(val);
                document.getElementById('input-setting-barang').value = '';
                saveData();
            });
        }
        if(document.getElementById('form-setting-tempat')) {
            document.getElementById('form-setting-tempat').addEventListener('submit', (e) => {
                e.preventDefault();
                const val = document.getElementById('input-setting-tempat').value;
                if(!appData.settings.kategoriTempat.includes(val)) appData.settings.kategoriTempat.push(val);
                document.getElementById('input-setting-tempat').value = '';
                saveData();
            });
        }
        if(document.getElementById('form-setting-rundown')) {
            document.getElementById('form-setting-rundown').addEventListener('submit', (e) => {
                e.preventDefault();
                const val = document.getElementById('input-setting-rundown').value;
                if(!appData.settings.kategoriRundown.includes(val)) appData.settings.kategoriRundown.push(val);
                document.getElementById('input-setting-rundown').value = '';
                saveData();
            });
        }

        if(document.getElementById('form-rundown')) {
            document.getElementById('form-rundown').addEventListener('submit', (e) => {
                e.preventDefault();
                const id = document.getElementById('rundown-id').value;
                const newData = {
                    id: id || generateId(),
                    judul: document.getElementById('rundown-judul').value,
                    kategori: document.getElementById('rundown-kategori') ? document.getElementById('rundown-kategori').value : '',
                    mulai: document.getElementById('rundown-mulai').value,
                    selesai: document.getElementById('rundown-selesai').value,
                    pic: document.getElementById('rundown-pic').value,
                    createdAt: id ? (appData.rundown.find(i=>i.id===id) ? appData.rundown.find(i=>i.id===id).createdAt : Date.now()) : Date.now()
                };
                if(id) appData.rundown = appData.rundown.map(i => i.id === id ? newData : i);
                else appData.rundown.push(newData);
                
                saveData(); window.closeModal();
            });
        }`;

html = html.replace(oldSubmitListener, newSubmitListeners);

fs.writeFileSync(file, html);
console.log("Replaced correctly!");
