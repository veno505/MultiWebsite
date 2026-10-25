const fs = require('fs');

let html = fs.readFileSync('WEBSITE WISHLIST.html', 'utf8');

const startIdx = html.indexOf('            <!-- Rundown Page -->');
const endIdx = html.indexOf('            <!-- Settings Page -->');

if (startIdx > -1) {
    // Find where the Pages chunk ends. Let's find <!-- MODALS SECTION -->
    const modalSectionIdx = html.indexOf('    <!-- MODALS SECTION -->');
    
    // We want to extract from startIdx to just before modalSectionIdx
    const pagesContent = html.substring(startIdx, modalSectionIdx);
    
    // Remove it
    html = html.substring(0, startIdx) + html.substring(modalSectionIdx);
    
    // We want to insert it INSIDE main's scrollable div.
    // Let's find </main>
    const mainEndIdx = html.indexOf('    </main>');
    // Let's find the closing div before </main>
    const scrollableDivEnd = html.lastIndexOf('</div>', mainEndIdx);
    
    html = html.substring(0, scrollableDivEnd) + pagesContent + '\n        ' + html.substring(scrollableDivEnd);
    fs.writeFileSync('WEBSITE WISHLIST.html', html);
    console.log('Fixed pages inside main area.');
} else {
    console.log('Could not find Rundown Page');
}
