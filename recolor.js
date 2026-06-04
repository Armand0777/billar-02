const fs = require('fs');
const path = require('path');

const directory = 'c:\\Billanga\\src';

const replacements = [
  { regex: /billanga-red-dark/g, replacement: 'billanga-primary-dark' },
  { regex: /billanga-red/g, replacement: 'billanga-primary' }
];

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.match(/\.(tsx|ts|css)$/)) {
        results.push(file);
      }
    }
  });
  return results;
};

const files = walk(directory);

let modifiedCount = 0;
files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  replacements.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Modified: ${file}`);
  }
});

console.log(`\nFinished! Modified ${modifiedCount} files.`);
