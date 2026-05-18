const {
  cleanContentFromReactComponents,
  getOriginalLineNumber,
  countPronounsOnLine,
} = require('./legacy-content-clean');

const FORBIDDEN_WORDS = [
  'easy',
  'simple',
  'difficult',
  'hard',
  'straightforward',
  'trivial',
  'complex',
  'complicated',
];

const CASUAL_WORDS = ['😂', 'lol', 'haha', 'funny', 'joke', 'kidding'];

const COMPLEX_WORDS = [
  'utilize',
  'facilitate',
  'demonstrate',
  'aforementioned',
  'subsequent',
  'therefore',
  'furthermore',
  'moreover',
  'consequently',
];

const SIMPLE_ENGLISH_REPLACEMENTS = {
  utilize: 'use',
  facilitate: 'help',
  demonstrate: 'show',
  aforementioned: 'previous',
  subsequent: 'next',
  therefore: 'so',
  furthermore: 'also',
  moreover: 'also',
  consequently: 'so',
};

const PRONOUN_MAX = 3;

function issueKey(issue) {
  const match = (issue.match || '').toLowerCase();
  if (issue.ruleId === 'minimize_pronouns') {
    return `${issue.file}:${issue.line}:${issue.ruleId}`;
  }
  return `${issue.file}:${issue.line}:${issue.ruleId}:${match}`;
}

function formatIssue({ filePath, line, ruleId, severity, message, suggestion, match }) {
  return {
    file: filePath,
    line,
    message,
    severity,
    rule: ruleId,
    ruleId,
    ruleDescription: message,
    suggestion,
    match,
  };
}

/**
 * Legacy rule-parser validators (5 rules). Enumeration is handled by Vale only (5-item fix).
 */
function runLegacyStyleRules(content, filePath) {
  const issues = [];
  const cleanContent = cleanContentFromReactComponents(content);
  const lines = cleanContent.split('\n');

  for (const word of FORBIDDEN_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    lines.forEach((line, index) => {
      if (regex.test(line)) {
        const lineNumber = getOriginalLineNumber(content, line, index);
        issues.push(
          formatIssue({
            filePath,
            line: lineNumber,
            ruleId: 'easy_difficult_words',
            severity: 'error',
            message: `CRITICAL: Never use "${word}" - it can discourage readers (Rule 6)`,
            suggestion:
              'Remove subjective difficulty assessment and provide clear instructions instead',
            match: word,
          })
        );
      }
    });
  }

  for (const word of CASUAL_WORDS) {
    const regex = word === '😂' ? /😂/g : new RegExp(`\\b${word}\\b`, 'gi');
    let match;
    while ((match = regex.exec(cleanContent)) !== null) {
      const cleanedLineIndex = cleanContent.substring(0, match.index).split('\n').length - 1;
      issues.push(
        formatIssue({
          filePath,
          line: getOriginalLineNumber(content, lines[cleanedLineIndex], cleanedLineIndex),
          ruleId: 'jokes_and_casual_tone',
          severity: 'error',
          message: 'CRITICAL: Maintain professional tone - avoid casual language (Rule 3)',
          suggestion: 'Use professional, neutral language in technical documentation',
          match: word,
        })
      );
    }
  }

  for (const word of COMPLEX_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    let match;
    while ((match = regex.exec(cleanContent)) !== null) {
      const cleanedLineIndex = cleanContent.substring(0, match.index).split('\n').length - 1;
      const replacement = SIMPLE_ENGLISH_REPLACEMENTS[word.toLowerCase()];
      issues.push(
        formatIssue({
          filePath,
          line: getOriginalLineNumber(content, lines[cleanedLineIndex], cleanedLineIndex),
          ruleId: 'simple_english_vocabulary',
          severity: 'suggestion',
          message: `Complex word detected: "${word}" - stick to simple English (Rule 4)`,
          suggestion: replacement
            ? `Use "${replacement}" instead of "${word}"`
            : `Use simpler language instead of "${word}"`,
          match: word,
        })
      );
    }
  }

  lines.forEach((line, index) => {
    const pronounCount = countPronounsOnLine(line);
    if (pronounCount > PRONOUN_MAX) {
      issues.push(
        formatIssue({
          filePath,
          line: getOriginalLineNumber(content, line, index),
          ruleId: 'minimize_pronouns',
          severity: 'suggestion',
          message: `Too many pronouns (${pronounCount}) - avoid "you/we" in technical docs (Rule 11)`,
          suggestion:
            'Focus on actions and explanations rather than addressing the reader directly',
          match: String(pronounCount),
        })
      );
    }
  });

  return issues;
}

module.exports = {
  issueKey,
  runLegacyStyleRules,
  PRONOUN_MAX,
};
