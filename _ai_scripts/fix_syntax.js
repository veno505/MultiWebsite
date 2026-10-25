const fs = require('fs');

let html = fs.readFileSync('WEBSITE GAME.html', 'utf8');

// Replace \` with `
html = html.replace(/\\`/g, '`');

// Replace \${ with ${
html = html.replace(/\\\$\{/g, '${');

fs.writeFileSync('WEBSITE GAME.html', html, 'utf8');
console.log('Fixed syntax errors in WEBSITE GAME.html');
