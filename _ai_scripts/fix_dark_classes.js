const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'WEBSITE WISHLIST.html');
let html = fs.readFileSync(file, 'utf8');

// 1. Cloud sync icon background (line 84)
html = html.replace(
    /class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 font-bold"/g,
    'class="w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-400 font-bold"'
);

// 2. Mobile bottom nav (line 211)
html = html.replace(
    /class="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 dark:border-slate-700 pb-safe z-20 shadow-\[0_-5px_10px_rgba\(0,0,0,0\.02\)\]"/g,
    'class="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 pb-safe z-20 shadow-[0_-5px_10px_rgba(0,0,0,0.02)]"'
);

// 3. Catatan Edit/Delete buttons (line 1134-1135)
html = html.replace(
    /class="w-6 h-6 bg-white rounded shadow text-slate-500 dark:text-slate-400 hover:text-blue-500 flex items-center justify-center"/g,
    'class="w-6 h-6 bg-white dark:bg-slate-700 rounded shadow text-slate-500 dark:text-slate-400 hover:text-blue-500 flex items-center justify-center"'
);
html = html.replace(
    /class="w-6 h-6 bg-white rounded shadow text-slate-500 dark:text-slate-400 hover:text-red-500 flex items-center justify-center"/g,
    'class="w-6 h-6 bg-white dark:bg-slate-700 rounded shadow text-slate-500 dark:text-slate-400 hover:text-red-500 flex items-center justify-center"'
);

// 4. Tempat image placeholder
html = html.replace(
    /h-32 w-full bg-slate-100 overflow-hidden/g,
    'h-32 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden'
);

fs.writeFileSync(file, html);
console.log("Fixed dark mode classes!");
