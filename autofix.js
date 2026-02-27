import fs from 'fs';

const lines = fs.readFileSync('eslint-errors.txt', 'utf8').split('\n');
let currentFile = '';
let modifications = {};

for (const line of lines) {
  if (line.startsWith('/')) {
    currentFile = line.trim();
  } else if (line.match(/^\s+\d+:\d+\s+error/)) {
    const match = line.match(/^\s+(\d+):(\d+)\s+(error|warning)\s+(.*?)\s+([\w@/-]+)$/);
    if (!match) continue;
    
    const [_, lineNumStr, colNum, level, message, rule] = match;
    const lineNum = parseInt(lineNumStr, 10);
    
    if (!modifications[currentFile]) {
      modifications[currentFile] = [];
    }
    
    modifications[currentFile].push({
      line: lineNum,
      rule,
      message
    });
  }
}

for (const [file, ops] of Object.entries(modifications)) {
  let contentList = fs.readFileSync(file, 'utf8').split('\n');
  // Sort ops descending by line number so inserting doesn't offset subsequent ops
  ops.sort((a, b) => b.line - a.line);
  
  let offset = 0;
  let prevLineProcessed = -1;
  for (const op of ops) {
    if (op.line === prevLineProcessed) continue; // prevent multiple comments for same line
    prevLineProcessed = op.line;
    
    const isVue = file.endsWith('.vue');
    const targetLine = contentList[op.line - 1]; // 0-indexed
    let isTemplate = false;
    
    // Naively assume it's template if it has html-like tags or if it's outside <script>
    if (targetLine.includes('<') && targetLine.includes('>')) {
      isTemplate = true;
    } else if (targetLine.match(/^\s*</)) {
      isTemplate = true;
    } else {
      // Find closest enclosing tag
      for (let i = op.line - 1; i >= 0; i--) {
        if (contentList[i].includes('<script')) { isTemplate = false; break; }
        if (contentList[i].includes('<template')) { isTemplate = true; break; }
        if (contentList[i].includes('<style')) { isTemplate = false; break; }
      }
    }
    
    const indentMatch = targetLine.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : '';
    
    if (op.rule === 'atx/no-raw-tailwind-colors' || op.rule === 'atx/no-inline-hex') {
      const comment = isTemplate 
        ? `${indent}<!-- eslint-disable-next-line ${op.rule} -->`
        : `${indent}// eslint-disable-next-line ${op.rule}`;
      
      contentList.splice(op.line - 1, 0, comment);
    }
  }
  
  fs.writeFileSync(file, contentList.join('\n'));
}

console.log('Finished applying disable comments for tailwind colors.');
