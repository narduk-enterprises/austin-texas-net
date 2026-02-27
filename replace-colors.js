import fs from 'fs';
import path from 'path';

function walk(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walk(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.vue') || dirFile.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
}

const files = walk('./app');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace text colors
  content = content.replace(/\btext-[a-z]+-(?:50|100|200|300|400)\b/g, 'text-muted');
  content = content.replace(/\btext-[a-z]+-(?:500|600|700|800|900|950)\b/g, 'text-primary');

  // Replace bg colors
  content = content.replace(/\bbg-[a-z]+-(?:50|100|200|300|400)\b/g, 'bg-muted');
  content = content.replace(/\bbg-[a-z]+-(?:500|600|700|800|900|950)\b/g, 'bg-elevated');
  
  // Replace border colors
  content = content.replace(/\bborder-[a-z]+-\d+\b/g, 'border-default');

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
}
console.log('Colors replaced successfully.');
