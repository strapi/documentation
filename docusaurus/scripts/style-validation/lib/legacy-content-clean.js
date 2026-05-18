/**
 * Same JSX / attribute stripping as legacy rule-parser.js (cleanContentFromReactComponents).
 * Used to filter Vale false positives and to run parity supplements.
 */
function cleanContentFromReactComponents(content) {
  let cleanContent = content;

  cleanContent = cleanContent.replace(/<[A-Z][a-zA-Z0-9]*[^>]*\/>/g, '');
  cleanContent = cleanContent.replace(/<[A-Z][a-zA-Z0-9]*[^>]*>.*?<\/[A-Z][a-zA-Z0-9]*>/gs, '');
  cleanContent = cleanContent.replace(/<Icon[^>]*\/>/g, '');
  cleanContent = cleanContent.replace(/\{[^}]*\}/g, '');
  cleanContent = cleanContent.replace(/\w+="[^"]*"/g, '');
  cleanContent = cleanContent.replace(/\w+='[^']*'/g, '');

  return cleanContent;
}

function getOriginalLineNumber(originalContent, cleanedLine, cleanedLineIndex) {
  const originalLines = originalContent.split('\n');

  for (let i = 0; i < originalLines.length; i++) {
    const cleanedOriginalLine = cleanContentFromReactComponents(originalLines[i]);
    if (cleanedOriginalLine.trim() === cleanedLine.trim()) {
      return i + 1;
    }
  }

  return Math.min(cleanedLineIndex + 1, originalLines.length);
}

function cleanLine(originalContent, lineNumber) {
  const line = originalContent.split('\n')[lineNumber - 1] || '';
  return cleanContentFromReactComponents(line);
}

function countPronounsOnLine(cleanedLine) {
  const pronouns = ['you', 'we', 'us', 'our', 'your', 'yours'];
  let count = 0;

  for (const pronoun of pronouns) {
    const matches = cleanedLine.match(new RegExp(`\\b${pronoun}\\b`, 'gi'));
    if (matches) {
      count += matches.length;
    }
  }

  return count;
}

module.exports = {
  cleanContentFromReactComponents,
  getOriginalLineNumber,
  cleanLine,
  countPronounsOnLine,
};
