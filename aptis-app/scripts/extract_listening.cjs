const fs = require('fs');
const path = require('path');

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

// 1. Part 1 (Questions 1 - 13)
console.log('Extracting Part 1...');
const q1_13_file = fs.readFileSync('../Listening/listening_question1_13.js', 'utf8');
const q1_13_raw = extractArray(q1_13_file, 'listeningQuestions1');
const part1Data = q1_13_raw.map((item, index) => {
  return {
    id: `listening_p1_${index + 1}`,
    heading: item.heading || `Question ${index + 1}`,
    audioUrl: item.audioUrl || '',
    question: item.question.trim(),
    options: item.options.map(o => o.trim()),
    correctAnswer: item.correctAnswer.trim(),
    transcript: item.transcript.trim()
  };
});
fs.writeFileSync('src/data/listening_part1.json', JSON.stringify(part1Data, null, 2));
console.log(`Part 1 saved: ${part1Data.length} questions.`);

// 2. Part 2 (Question 14)
console.log('Extracting Part 2...');
const q14_file = fs.readFileSync('../Listening/listening_question14.js', 'utf8');
const q14_items = [];
const q14_match = q14_file.match(/const question14Data_(\d+)\s*=\s*\{([\s\S]*?)\n\};/g);
if (q14_match) {
  q14_match.forEach((block, idx) => {
    try {
      const objStr = block.replace(/^const question14Data_\d+\s*=\s*/, '').replace(/;\s*$/, '');
      const obj = eval('(' + objStr + ')');
      
      // In question 14, Person A -> options[0], Person B -> options[1], Person C -> options[2], Person D -> options[3]
      const speakers = [
        { id: 'A', name: 'Person A', answer: obj.options[0] },
        { id: 'B', name: 'Person B', answer: obj.options[1] },
        { id: 'C', name: 'Person C', answer: obj.options[2] },
        { id: 'D', name: 'Person D', answer: obj.options[3] }
      ];

      q14_items.push({
        id: `listening_p2_${idx + 1}`,
        topic: obj.topic.replace(/^Topic:\s*/i, '').trim(),
        audioUrl: obj.audioUrl || '',
        options: obj.options.map(o => o.trim()),
        speakers: speakers,
        correctAnswers: {
          A: obj.options[0].trim(),
          B: obj.options[1].trim(),
          C: obj.options[2].trim(),
          D: obj.options[3].trim()
        },
        transcript: obj.transcript.trim()
      });
    } catch(e) {
      console.error('Error parsing Q14 item ' + idx, e.message);
    }
  });
}
fs.writeFileSync('src/data/listening_part2.json', JSON.stringify(q14_items, null, 2));
console.log(`Part 2 saved: ${q14_items.length} sets.`);

// 3. Part 3 (Question 15)
console.log('Extracting Part 3...');
const q15_file = fs.readFileSync('../Listening/listening_question15.js', 'utf8');
const q15_items = [];
const q15_match = q15_file.match(/const question15Data_(\d+)\s*=\s*\{([\s\S]*?)\n\};/g);
if (q15_match) {
  q15_match.forEach((block, idx) => {
    try {
      const objStr = block.replace(/^const question15Data_\d+\s*=\s*/, '').replace(/;\s*$/, '');
      const obj = eval('(' + objStr + ')');

      // Questions are strings like "1. Continuity is important..."
      const statements = obj.questions.map((qStr, qIdx) => {
        const cleanText = qStr.replace(/^\d+\.\s*/, '').trim();
        const correct = obj.correctAnswer[qIdx] ? obj.correctAnswer[qIdx].trim() : 'Man';
        return {
          id: `p3_${idx + 1}_${qIdx + 1}`,
          statement: cleanText,
          correctAnswer: correct // "Man" | "Woman" | "Both"
        };
      });

      q15_items.push({
        id: `listening_p3_${idx + 1}`,
        topic: obj.topic.replace(/^Topic:\s*/i, '').trim(),
        audioUrl: obj.audioUrl || '',
        statements: statements,
        options: ["Man", "Woman", "Both"],
        transcript: obj.transcript.trim()
      });
    } catch(e) {
      console.error('Error parsing Q15 item ' + idx, e.message);
    }
  });
}
fs.writeFileSync('src/data/listening_part3.json', JSON.stringify(q15_items, null, 2));
console.log(`Part 3 saved: ${q15_items.length} sets.`);

// 4. Part 4 (Questions 16 & 17)
console.log('Extracting Part 4...');
const q16_file = fs.readFileSync('../Listening/listening_question16_17.js', 'utf8');
const q16_raw = extractArray(q16_file, 'question16Data');
const part4Data = q16_raw.map((item, index) => {
  const questions = item.questions.map(q => {
    return {
      id: q.id,
      question: q.question.trim(),
      options: q.options.map(o => o.trim()),
      correctAnswer: q.options[0].trim() // The first option is always the correct one
    };
  });

  return {
    id: `listening_p4_${index + 1}`,
    topic: item.topic.replace(/^Topic:\s*/i, '').trim(),
    audioUrl: item.audioUrl || '',
    questions: questions,
    transcript: item.transcript.trim()
  };
});
fs.writeFileSync('src/data/listening_part4.json', JSON.stringify(part4Data, null, 2));
console.log(`Part 4 saved: ${part4Data.length} sets.`);

console.log('ALL LISTENING DATA EXTRACTED SUCCESSFULLY!');
