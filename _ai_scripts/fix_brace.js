const fs = require('fs');
let content = fs.readFileSync('WEBSITE WISHLIST.html', 'utf8');

// Replace the single closing brace of initCloudSync with a double brace
const brokenPart = `                renderAll();
        }

        async function loadDataFromCloud() {`;

const fixedPart = `                renderAll();
            }
        }

        async function loadDataFromCloud() {`;

if (content.includes(brokenPart)) {
    content = content.replace(brokenPart, fixedPart);
    fs.writeFileSync('WEBSITE WISHLIST.html', content);
    console.log("Fixed missing brace");
} else {
    console.log("Not found");
}
