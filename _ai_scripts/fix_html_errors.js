const fs = require('fs');

function fixHtml(filename) {
    let html = fs.readFileSync(filename, 'utf8');
    
    // Fix src=""
    html = html.replace(/src=""/g, 'src="#"');
    
    // Fix duplicate footer-social-links by making the second one a class or changing ID
    let count = 0;
    html = html.replace(/id="footer-social-links"/g, (match) => {
        count++;
        if (count > 1) {
            return 'id="footer-social-links-' + count + '"';
        }
        return match;
    });
    
    // Fix </section>ion> and </div>iv>
    html = html.replace(/<\/section>ion>/g, '</section>');
    html = html.replace(/<\/div>iv>/g, '</div>');
    
    fs.writeFileSync(filename, html);
    console.log(`Fixed ${filename}`);
}

fixHtml('WEBSITE MULTI.html');
fixHtml('WEBSITE RENTAL.html');
fixHtml('WEBSITE TRY ON.html');
