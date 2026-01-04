const fs = require('fs');

const data = fs.readFileSync('didida/data/words.js', 'utf8');
const match = data.match(/kindergartenWords:\s*\[([\s\S]*?)\],\s*\/\/\s*小学单词/);

if (match) {
  const content = match[1];
  const lines = content.split('\n').filter(line => line.trim() !== '' && !line.trim().startsWith('//'));
  
  const entries = [];
  let currentEntry = null;
  let entryLines = [];
  
  lines.forEach((line, idx) => {
    if (line.trim().startsWith('{')) {
      if (currentEntry) {
        entries.push({ lines: entryLines.join('\n'), id: currentEntry });
      }
      currentEntry = null;
      entryLines = [line];
    } else if (line.trim().endsWith('},') || line.trim().endsWith('}')) {
      entryLines.push(line);
      const fullEntry = entryLines.join('\n');
      const idMatch = fullEntry.match(/id:\s*'([^']+)'/);
      if (idMatch) {
        currentEntry = idMatch[1];
      }
      entries.push({ lines: fullEntry, id: currentEntry });
      entryLines = [];
      currentEntry = null;
    } else {
      entryLines.push(line);
    }
  });

  // 检查重复
  const seenWords = new Map();
  const duplicates = [];
  
  entries.forEach(entry => {
    const wordMatch = entry.lines.match(/word:\s*'([^']+)'/);
    if (wordMatch) {
      const word = wordMatch[1];
      if (seenWords.has(word)) {
        duplicates.push({ word: word, firstId: seenWords.get(word), currentId: entry.id, lines: entry.lines });
      } else {
        seenWords.set(word, entry.id);
      }
    }
  });

  console.log('Total entries:', entries.length);
  console.log('Total duplicates:', duplicates.length);
  console.log('\nDuplicate entries to remove:');
  duplicates.forEach(d => {
    console.log(`  ${d.currentId}: '${d.word}' (duplicate of ${d.firstId})`);
  });

  // 写入文件用于删除
  const duplicateIds = duplicates.map(d => d.currentId);
  fs.writeFileSync('/Users/dulin03/work/wtest/duplicate_ids.txt', duplicateIds.join('\n'));
  console.log('\nDuplicate IDs written to duplicate_ids.txt');
} else {
  console.log('Pattern not found');
}
