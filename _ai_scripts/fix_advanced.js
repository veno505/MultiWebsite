const fs = require('fs');

let html = fs.readFileSync('WEBSITE WISHLIST.html', 'utf8');

// 1. Move Page Rundown and Page Setting to before Modal Overlay
const startPageRundown = html.indexOf('<!-- Page Rundown -->');
const modalOverlayIndex = html.indexOf('<!-- Modal Overlay -->');
const modalBarangIndex = html.indexOf('<!-- Modal Barang -->', startPageRundown);

if (startPageRundown > -1 && modalBarangIndex > -1) {
    const pagesContent = html.substring(startPageRundown, modalBarangIndex);
    html = html.substring(0, startPageRundown) + html.substring(modalBarangIndex);
    
    const newModalOverlayIndex = html.indexOf('<!-- Modal Overlay -->');
    html = html.substring(0, newModalOverlayIndex) + pagesContent + '\n        ' + html.substring(newModalOverlayIndex);
}

// 2. Fix Modal Rundown structure
const modalRundownRegex = /<!-- Modal Rundown -->\s*<div id="modal-rundown"[^>]*>\s*<div class="([^"]*)">/i;
const match = html.match(modalRundownRegex);
if (match) {
    const replacement = `<!-- Modal Rundown -->\n        <div id="modal-rundown" class="hidden modal-content \${match[1]}">`;
    html = html.replace(modalRundownRegex, replacement);
    
    // We also need to remove the extra closing </div> for the removed wrapper.
    // The wrapper ends right before <!-- Page Rundown -->
    const endModalRundown = html.indexOf('<!-- Page Rundown -->');
    if (endModalRundown > -1) {
        // Look backwards from endModalRundown for the first </div>
        const beforePageRundown = html.substring(0, endModalRundown);
        const lastDivIndex = beforePageRundown.lastIndexOf('</div>');
        if (lastDivIndex > -1) {
            html = html.substring(0, lastDivIndex) + html.substring(lastDivIndex + 6);
        }
    }
}

fs.writeFileSync('WEBSITE WISHLIST.html', html);
console.log('Fixed HTML structures');
