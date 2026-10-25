const fs = require('fs');

let html = fs.readFileSync('WEBSITE WISHLIST.html', 'utf8');

// 1. Extract page-rundown and page-setting
const startPageRundown = html.indexOf('<!-- Page Rundown -->');
const endPageSetting = html.indexOf('<!-- Modal Overlay -->');

// Find where to extract up to. The pages end right before <!-- Modal Barang -->, wait.
// Actually, I inserted newPages BEFORE <!-- Modal Barang -->
// So the structure is:
// <!-- Modal Rundown --> ... </div>
// <!-- Page Rundown --> ... </div>
// <!-- Page Setting --> ... </div>
//             <!-- Modal Barang -->

const modalBarangStr = '<!-- Modal Barang -->';
const modalBarangIndex = html.indexOf(modalBarangStr, startPageRundown);

const pagesContent = html.substring(startPageRundown, modalBarangIndex);

// Remove pagesContent from its current position
html = html.substring(0, startPageRundown) + html.substring(modalBarangIndex);

// 2. Insert pagesContent BEFORE <!-- Modal Overlay -->
const modalOverlayStr = '<!-- Modal Overlay -->';
const modalOverlayIndex = html.indexOf(modalOverlayStr);

html = html.substring(0, modalOverlayIndex) + pagesContent + '\n        ' + html.substring(modalOverlayIndex);

fs.writeFileSync('WEBSITE WISHLIST.html', html);
console.log('Fixed page placements');
