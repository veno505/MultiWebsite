const fs = require('fs');
const html = fs.readFileSync('WEBSITE WISHLIST.html', 'utf8');
const { JSDOM } = require('jsdom');
try {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  console.log("Body length:", doc.body.innerHTML.length);
  console.log("Number of elements:", doc.querySelectorAll('*').length);
  console.log("Title:", doc.title);
} catch (e) {
  console.error("Parse Error:", e);
}
