const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'src', 'components', 'Dashboard.jsx');
let content = fs.readFileSync(dashboardPath, 'utf8');

const lines = content.split('\n');
const seenImports = new Set();
const newLines = [];

for (const line of lines) {
  if (line.startsWith('import ')) {
    if (seenImports.has(line.trim())) {
      continue;
    }
    seenImports.add(line.trim());
  }
  newLines.push(line);
}

fs.writeFileSync(dashboardPath, newLines.join('\n'), 'utf8');
console.log('Deduplicated imports!');
