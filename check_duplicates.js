const fs = require('fs');

const data = fs.readFileSync('didida/data/words.js', 'utf8');
const match = data.match(/kindergartenWords:\s*\[([\s\S]*?)\],\s*\/\/\s*小学单词/);
if (match) {
  const content = match[1];
  const lines = content.split('\n').filter(line => line.trim() !== '' && !line.trim().startsWith('//'));
  console.log('Total lines:', lines.length);

  const words = [];
  lines.forEach((line, idx) => {
    const wordMatch = line.match(/word:\s*'([^']+)'/);
    const idMatch = line.match(/id:\s*'([^']+)'/);
    if (wordMatch && idMatch) {
      words.push({ id: idMatch[1], word: wordMatch[1], line: idx + 1 });
    }
  });

  const wordMap = new Map();
  const duplicates = [];
  words.forEach(w => {
    if (wordMap.has(w.word)) {
      duplicates.push({ word: w.word, first: wordMap.get(w.word), current: w });
    } else {
      wordMap.set(w.word, w);
    }
  });

  console.log('\nDuplicates found:');
  duplicates.forEach(d => {
    console.log(`  '${d.word}' - ${d.first.id} (line ${d.first.line}) and ${d.current.id} (line ${d.current.line})`);
  });
  console.log('\nTotal duplicates:', duplicates.length);
} else {
  console.log('Pattern not found');
}
