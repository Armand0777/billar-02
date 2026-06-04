const fs = require('fs');
const path = require('path');

const directory = 'c:\\Billanga\\src';

const replacements = [
  { regex: /211,47,47/g, replacement: '0,230,118' },
  { regex: /logo\.png/g, replacement: 'logo_transparente.png' }
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

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  replacements.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
