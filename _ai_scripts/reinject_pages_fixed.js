const fs = require('fs');

const patchScript = fs.readFileSync('C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\30131304-0df5-4191-96ab-9e50b499ba3e\\scratch\\patch_wishlist_pro_clean.js', 'utf8');

const startIdx = patchScript.indexOf('const newPages = `') + 18;
const endIdx = patchScript.indexOf('`;\nhtml = html.replace(\'<!-- Modal Barang -->\', newPages');

if (startIdx > 17 && endIdx > -1) {
    const newPages = patchScript.substring(startIdx, endIdx);
    
    const pageRundownStart = newPages.indexOf('            <!-- Rundown Page -->');
    if (pageRundownStart > -1) {
        const pagesOnly = newPages.substring(pageRundownStart);
        
        let html = fs.readFileSync('WEBSITE WISHLIST.html', 'utf8');
        const mainEndIdx = html.indexOf('    </main>');
        
        if (mainEndIdx > -1) {
            const lastDivIdx = html.lastIndexOf('</div>', mainEndIdx);
            if (lastDivIdx > -1) {
                html = html.substring(0, lastDivIdx) + pagesOnly + '\n        ' + html.substring(lastDivIdx);
                fs.writeFileSync('WEBSITE WISHLIST.html', html);
                console.log('Successfully injected pages into main!');
            } else {
                console.log('Could not find last div before main');
            }
        } else {
            console.log('Could not find </main>');
        }
    } else {
        console.log('Could not find Page Rundown in newPages');
    }
} else {
    console.log('Could not find newPages in patch script');
}
