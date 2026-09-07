const fs = require('fs');

const rawCode = fs.readFileSync('/Users/kdkids/Desktop/aptis-main/Reading/reading_question1.js', 'utf8');

let modifiedCode = rawCode.replace(/document\.addEventListener\('DOMContentLoaded', function\(\) \{[\s\S]*$/, '');
modifiedCode += '\nmodule.exports = { questionsArrays };\n';

fs.writeFileSync('temp_part1.cjs', modifiedCode);

const { questionsArrays } = require('./temp_part1.cjs');

const jsonOutput = questionsArrays.map((qArray, index) => {
  const options = [];
  const answers = [];
  const textParts = [];

  qArray.forEach((q, i) => {
    options.push(q.answerOptions);
    const correctIdx = q.answerOptions.indexOf(q.correctAnswer);
    answers.push(correctIdx !== -1 ? correctIdx : 0);
    
    textParts.push(`${q.questionStart} [${i}] ${q.questionEnd}`);
  });

  return {
    id: `part1_${index + 1}`,
    topic: `Set ${index + 1}`,
    text: textParts.join('\n'),
    options,
    answers,
    translatedText: ""
  };
});

fs.writeFileSync('/Users/kdkids/Desktop/aptis-main/aptis-reading-app/src/data/part1.json', JSON.stringify(jsonOutput, null, 2));
fs.unlinkSync('temp_part1.cjs');
console.log('Successfully wrote part1.json with ' + jsonOutput.length + ' sets.');
