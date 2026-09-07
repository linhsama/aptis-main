const fs = require('fs');

function extractArray(content, varName) {
  const marker = 'const ' + varName + ' = [';
  const startIdx = content.indexOf(marker);
  if (startIdx === -1) return null;
  const arrayStart = startIdx + marker.length - 1;
  let depth = 0;
  let inString = false;
  let quote = '';
  let escape = false;
  for (let i = arrayStart; i < content.length; i++) {
    const ch = content[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (inString) {
      if (ch === quote) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      quote = ch;
      continue;
    }
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) {
        const rawArray = content.slice(arrayStart, i + 1);
        return eval('(' + rawArray + ')');
      }
    }
  }
  return null;
}

// 1. Check Question 1-13
const q1_13_file = fs.readFileSync('../Listening/listening_question1_13.js', 'utf8');
const q1_13 = extractArray(q1_13_file, 'listeningQuestions1');
console.log('Q1_13 items count:', q1_13 ? q1_13.length : 0);

// 2. Check Question 14
const q14_file = fs.readFileSync('../Listening/listening_question14.js', 'utf8');
const q14_items = [];
const q14_match = q14_file.match(/const question14Data_(\d+)\s*=\s*\{([\s\S]*?)\n\};/g);
if (q14_match) {
  q14_match.forEach((block, idx) => {
    try {
      const objStr = block.replace(/^const question14Data_\d+\s*=\s*/, '').replace(/;\s*$/, '');
      const obj = eval('(' + objStr + ')');
      q14_items.push(obj);
    } catch(e) {
      console.log('Q14 parse err item ' + idx, e.message);
    }
  });
}
console.log('Q14 extracted items:', q14_items.length);
if (q14_items.length > 0) {
  console.log('Q14 sample:', q14_items[0]);
}

// 3. Check Question 15
const q15_file = fs.readFileSync('../Listening/listening_question15.js', 'utf8');
const q15_items = [];
const q15_match = q15_file.match(/const question15Data_(\d+)\s*=\s*\{([\s\S]*?)\n\};/g);
if (q15_match) {
  q15_match.forEach((block, idx) => {
    try {
      const objStr = block.replace(/^const question15Data_\d+\s*=\s*/, '').replace(/;\s*$/, '');
      const obj = eval('(' + objStr + ')');
      q15_items.push(obj);
    } catch(e) {
      console.log('Q15 parse err item ' + idx, e.message);
    }
  });
}
console.log('Q15 extracted items:', q15_items.length);
if (q15_items.length > 0) {
  console.log('Q15 sample:', q15_items[0]);
}

// 4. Check Question 16_17
const q16_file = fs.readFileSync('../Listening/listening_question16_17.js', 'utf8');
const q16 = extractArray(q16_file, 'question16Data');
console.log('Q16_17 items count:', q16 ? q16.length : 0);
if (q16 && q16.length > 0) {
  console.log('Q16 sample 0:', JSON.stringify(q16[0], null, 2));
}
