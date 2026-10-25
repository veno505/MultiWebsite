const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'WEBSITE WISHLIST.html');
const html = fs.readFileSync(file, 'utf8');

const regex = /class="([^"]+)"/g;
let match;
const suspicious = [];

while ((match = regex.exec(html)) !== null) {
    const cls = match[1];
    
    // Check for bg-white without dark:bg
    if (cls.includes('bg-white') && !cls.includes('dark:bg')) {
        suspicious.push({ issue: 'bg-white without dark:bg', cls });
    }
    
    // Check for light colored bg without dark:bg
    if (/(?:^|\s)bg-(slate|gray|zinc|neutral|stone)-(50|100|200)(?:\s|$)/.test(cls) && !cls.includes('dark:bg')) {
        suspicious.push({ issue: 'light bg without dark:bg', cls });
    }

    // Check for dark text without dark:text
    if (/(?:^|\s)text-(slate|gray|zinc|neutral|stone)-(700|800|900)(?:\s|$)/.test(cls) && !cls.includes('dark:text')) {
        suspicious.push({ issue: 'dark text without dark:text', cls });
    }
}

const uniqueSuspicious = [...new Set(suspicious.map(s => s.cls))];

console.log("Found " + uniqueSuspicious.length + " unique suspicious class strings.");
uniqueSuspicious.forEach(c => console.log(c));
