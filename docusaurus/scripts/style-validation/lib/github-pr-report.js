const RULE_META = {
  easy_difficult_words: {
    number: '6',
    name: 'Avoid "easy/difficult" language',
    short: 'Never say something is "easy" or "difficult" - this can discourage readers',
    suggestion: 'To configure this setting:',
  },
  jokes_and_casual_tone: {
    number: '3',
    name: 'Maintain professional tone',
    short: 'Maintain professional tone - avoid emojis and casual language',
    suggestion: 'Follow these steps:',
  },
  procedures_must_be_numbered: {
    number: '7',
    name: 'Use numbered lists for procedures',
    short: 'Use numbered lists for step-by-step procedures',
    suggestion: '1. First step\n2. Second step',
  },
  minimize_pronouns: {
    number: '11',
    name: 'Minimize pronouns',
    short: 'Minimize pronouns like "you" and "we"',
    suggestion: 'Configure the setting by...',
  },
  simple_english_vocabulary: {
    number: '4',
    name: 'Use simple English',
    short: 'Use simple, clear vocabulary',
    suggestion: 'Use this feature',
  },
  use_bullet_lists: {
    number: '8',
    name: 'Use bullet lists for enumerations',
    short: 'Use bullet lists instead of long enumerations',
    suggestion: 'Features include:\n- Feature A\n- Feature B',
  },
};

function getRuleMeta(ruleId) {
  return (
    RULE_META[ruleId] || {
      number: '?',
      name: 'Technical writing best practice',
      short: 'Follow technical writing best practices',
      suggestion: 'Rewrite using clear, professional language',
    }
  );
}

function getHighestSeverity(issues) {
  const order = { error: 0, warning: 1, suggestion: 2 };
  return issues.reduce((highest, issue) => {
    return order[issue.severity] < order[highest] ? issue.severity : highest;
  }, 'suggestion');
}

function generateCombinedSuggestion(sortedIssues) {
  const ruleIds = sortedIssues.map((issue) => issue.ruleId);
  if (ruleIds.includes('procedures_must_be_numbered')) {
    return '1. First step\n2. Second step\n3. Third step';
  }
  if (ruleIds.includes('easy_difficult_words') && ruleIds.includes('jokes_and_casual_tone')) {
    return 'the same content in a professional tone without casual language and emojis, or simply remove this sentence.';
  }
  return 'Follow the steps below:';
}

function generateInlineComment(issues, repoPath, lineNumber) {
  const severity = getHighestSeverity(issues);
  const emoji = { error: '🚨', warning: '⚠️', suggestion: '💡' }[severity] || '💡';

  const sortedIssues = [...issues].sort((a, b) => {
    const order = { error: 0, warning: 1, suggestion: 2 };
    return (order[a.severity] || 2) - (order[b.severity] || 2);
  });

  const lineContent = sortedIssues[0].lineContent || sortedIssues[0].match || '[content on this line]';
  const displayContent =
    lineContent.length > 240 ? `"${String(lineContent).substring(0, 77)}..."` : `"${lineContent}"`;

  let comment = `${emoji} **Strapi Documentation Review**\n\n`;

  if (sortedIssues.length === 1) {
    const issue = sortedIssues[0];
    const meta = getRuleMeta(issue.ruleId);
    comment += `On file \`${repoPath}\`, line ${lineNumber}, you wrote ${displayContent}. `;
    comment += `This content doesn't follow Rule ${meta.number} (${meta.short}). `;
    comment += `It would be better to write "${meta.suggestion}" for instance, instead.\n\n`;
  } else {
    comment += `On file \`${repoPath}\`, line ${lineNumber}, you wrote ${displayContent}. `;
    comment += `This content doesn't follow ${sortedIssues.length} rules:\n\n`;
    sortedIssues.forEach((issue) => {
      const meta = getRuleMeta(issue.ruleId);
      comment += `• **Rule ${meta.number}**: ${meta.short}\n`;
    });
    comment += `\nIt would be better to write "${generateCombinedSuggestion(sortedIssues)}" instead.\n\n`;
  }

  comment +=
    '📚 [Learn more about our writing guidelines](https://strapi.notion.site/12-Rules-of-Technical-Writing-c75e080e6b19432287b3dd61c2c9fa04)';

  return { path: repoPath, line: lineNumber, body: comment };
}

function prepareInlineComments(issuesBundle, maxInlineComments = 10) {
  const allIssues = [
    ...issuesBundle.errors,
    ...issuesBundle.warnings,
    ...issuesBundle.suggestions,
  ];

  const grouped = {};
  allIssues.forEach((issue) => {
    const key = `${issue.repoPath}:${issue.line}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(issue);
  });

  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const order = { error: 0, warning: 1, suggestion: 2 };
    const minA = Math.min(...grouped[a].map((i) => order[i.severity] ?? 2));
    const minB = Math.min(...grouped[b].map((i) => order[i.severity] ?? 2));
    return minA - minB;
  });

  const limitedKeys = sortedKeys.slice(0, maxInlineComments);
  const inlineComments = limitedKeys.map((key) => {
    const [repoPath, lineNumber] = key.split(':');
    return generateInlineComment(grouped[key], repoPath, parseInt(lineNumber, 10));
  });

  return {
    inlineComments,
    hasMoreIssues: sortedKeys.length > maxInlineComments,
    remainingIssues: Math.max(0, sortedKeys.length - maxInlineComments),
  };
}

function generateFriendlyComment(results) {
  const { summary, issues, hasMoreIssues, remainingIssues } = results;
  let comment = "## 👋 Thanks for contributing to Strapi's documentation!\n\n";

  if (summary.filesProcessed === 1) {
    comment += "I've reviewed the changes in your file, and here's what I found:\n\n";
  } else {
    comment += `I've reviewed the changes across ${summary.filesProcessed} files, and here's what I found:\n\n`;
  }

  if (summary.totalIssues === 0) {
    comment += '🎉 **Excellent work!** Your documentation perfectly follows all our writing guidelines.\n\n';
    comment +=
      'Your contribution is ready to help developers worldwide! 🌍\n\n';
  } else {
    comment += `Your contribution looks great! I've spotted ${summary.totalIssues} small improvement${summary.totalIssues > 1 ? 's' : ''} that will make your documentation even better.\n\n`;
    comment += '### 📊 Summary\n';
    comment += `- **Files reviewed:** ${summary.filesProcessed}\n`;
    comment += `- **Critical errors:** ${issues.errors.length} 🚨\n`;
    comment += `- **Warnings:** ${issues.warnings.length} ⚠️\n`;
    comment += `- **Suggestions:** ${issues.suggestions.length} 💡\n\n`;

    if (issues.errors.length > 0) {
      comment += '### 🚨 Critical issues (please fix)\n\n';
      issues.errors.slice(0, 5).forEach((error) => {
        comment += `**${error.repoPath}:${error.line}** — ${error.message}\n`;
      });
      if (issues.errors.length > 5) {
        comment += `\n*... and ${issues.errors.length - 5} more critical issues*\n`;
      }
      comment += '\n';
    }

    if (hasMoreIssues) {
      comment += `*💬 ${remainingIssues} additional inline comment${remainingIssues > 1 ? 's' : ''} could not be posted due to GitHub limits.*\n\n`;
    }
  }

  comment += '---\n';
  comment +=
    '*🤖 Automated review based on [Strapi\'s 12 Rules of Technical Writing](https://strapi.notion.site/12-Rules-of-Technical-Writing-c75e080e6b19432287b3dd61c2c9fa04)*\n';

  return comment;
}

module.exports = {
  generateFriendlyComment,
  prepareInlineComments,
  getRuleMeta,
};
