const fs = require('fs');

let html = fs.readFileSync('WEBSITE WISHLIST.html', 'utf8');

const startIdx = html.indexOf('            <!-- Rundown Page -->');
const endIdx = html.indexOf('        <div id="modal-barang"');

if (startIdx > -1 && endIdx > -1) {
    const pagesContent = html.substring(startIdx, endIdx);
    
    // Remove it from its current position
    html = html.substring(0, startIdx) + html.substring(endIdx);
    
    // Insert it before <!-- MODALS SECTION -->
    const modalSectionIdx = html.indexOf('    <!-- MODALS SECTION -->');
    html = html.substring(0, modalSectionIdx) + pagesContent + '\n' + html.substring(modalSectionIdx);
    
    fs.writeFileSync('WEBSITE WISHLIST.html', html);
    console.log('Fixed page locations!');
} else {
    console.log('Could not find indices', startIdx, endIdx);
}
