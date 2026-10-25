const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\30131304-0df5-4191-96ab-9e50b499ba3e\\.system_generated\\logs\\transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('WEBSITE WISHLIST.html') && line.includes('function renderAll()')) {
        try {
            const data = JSON.parse(line);
            if (data.type === 'PLANNER_RESPONSE' || data.type === 'TOOL_RESPONSE' || data.type === 'USER_INPUT') {
                fs.appendFileSync('found_lines.txt', line + '\n');
            }
        } catch(e) {}
    }
  }
  console.log("Finished searching logs");
}
processLineByLine();
