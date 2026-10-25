const fs = require('fs');
const path = require('path');
const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const assets = {};

for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    const hrefRegex = /href=['"]([^'"]+)['"]/g;
    let match;
    while ((match = hrefRegex.exec(content)) !== null) {
        const link = match[1];
        if (!link.startsWith('http') && !link.startsWith('#')) {
            if (!assets[link]) assets[link] = [];
            assets[link].push(file);
        }
    }
    
    const srcRegex = /src=['"]([^'"]+)['"]/g;
    while ((match = srcRegex.exec(content)) !== null) {
        const link = match[1];
        if (!link.startsWith('http') && !link.startsWith('#')) {
            if (!assets[link]) assets[link] = [];
            assets[link].push(file);
        }
    }
}

console.log(JSON.stringify(assets, null, 2));
