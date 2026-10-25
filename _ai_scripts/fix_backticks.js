const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace \` with `
    let newContent = content.replace(/\\`/g, '`');
    // Replace \${ with ${
    newContent = newContent.replace(/\\\$\{/g, '${');
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log("Fixed " + filePath);
    }
}

const filesToFix = [
    'js/gameEngine.js',
    'js/games/mathSprint.js',
    'js/games/tugOfWar.js',
    'js/games/typingRace.js'
];

filesToFix.forEach(fixFile);
