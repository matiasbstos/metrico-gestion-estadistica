const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'src', 'components', 'Dashboard.jsx');
let content = fs.readFileSync(dashboardPath, 'utf8');

content = content.replace(/\\n/g, '\n');

fs.writeFileSync(dashboardPath, content, 'utf8');
console.log('Fixed newlines');
