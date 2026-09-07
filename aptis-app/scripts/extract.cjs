const fs = require('fs');

const rawData = fs.readFileSync('src/data/raw_data.js', 'utf8');

// We want to extract the definitions of question2Content_1 to question2Content_39
// and questheader1
const extractedVars = [];
let match;
const regex = /const (question2Content_\d+) = \[\s*([\s\S]*?)\s*\];/g;
const questions = [];

while ((match = regex.exec(rawData)) !== null) {
  const varName = match[1];
  const items = match[2].split('\n').map(line => {
    let clean = line.trim().replace(/^['"]|['"],?$/g, '');
    return clean;
  }).filter(line => line.length > 0 && !line.startsWith('//'));
  
  questions.push({
    id: varName,
    sentences: items
  });
}

const headerRegex = /const questheader1 = \{([\s\S]*?)\};/;
const headerMatch = headerRegex.exec(rawData);
const headers = {};
if (headerMatch) {
  const headerLines = headerMatch[1].split('\n');
  headerLines.forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let value = parts.slice(1).join(':').trim();
      value = value.split(',')[0].replace(/^['"]|['"]$/g, '');
      headers[key] = value;
    }
  });
}

const finalData = questions.map((q, index) => {
  return {
    id: q.id,
    topic: headers[q.id] || `Topic ${index + 1}`,
    sentences: q.sentences
  };
});

fs.writeFileSync('src/data/questions.json', JSON.stringify(finalData, null, 2));
console.log('Extracted ' + finalData.length + ' questions');
