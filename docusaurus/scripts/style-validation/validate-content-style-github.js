#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Dynamic path resolution
const scriptDir = __dirname;
const styleRulesPath = path.join(scriptDir, 'style-rules.yml');

/**
 * Enhanced GitHub Documentation Validator with inline comments and friendly reporting
 * Implements Strapi's 12 Rules of Technical Writing with human-like feedback
 * Uses diff content directly - no file fetching needed!
 */
class EnhancedGitHubDocumentationValidator {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      prNumber: options.prNumber,
      repoOwner: options.repoOwner || 'strapi',
      repoName: options.repoName || 'documentation',
      maxInlineComments: options.maxInlineComments || 10
    };

    // Import components
    const GitHubURLDiffParser = require('./github-diff-parser');
    const Strapi12RulesParser = require('./rule-parser');
    
    this.diffParser = new GitHubURLDiffParser({ verbose: this.options.verbose });
    this.ruleParser = new Strapi12RulesParser(styleRulesPath);
    
    // Results tracking
    this.results = {
      summary: {
        filesProcessed: 0,
        totalIssues: 0,
        criticalIssues: 0
      },
      issues: {
        errors: [],
        warnings: [],
        suggestions: []
      },
      inlineComments: [],
      mode: 'PR diff'
    };
  }

  log(message, level = 'info') {
    if (this.options.verbose || level === 'error') {
      const timestamp = new Date().toISOString().substring(11, 19);
      const prefix = {
        info: '💙',
        debug: '🔍',
        warn: '⚠️',
        error: '❌'
      }[level] || '💙';
      
      console.log(`[${timestamp}] ${prefix} ${message}`);
    }
  }

  /**
   * Main validation entry point for PR analysis
   */
  async validatePR() {
    try {
      this.log('🎯 Starting enhanced documentation validation...', 'info');
      
      if (!this.options.prNumber) {
        throw new Error('PR number is required for validation');
      }

      // Fetch and parse PR diff
      const diffContent = await this.diffParser.fetchPRDiff(
        this.options.repoOwner, 
        this.options.repoName, 
        this.options.prNumber
      );
      
      const parsedDiff = this.diffParser.parsePRDiff(diffContent);
      this.log(`📊 Found ${parsedDiff.totalFiles} markdown files to analyze`, 'info');

      if (parsedDiff.totalFiles === 0) {
        this.log('📝 No markdown files found in this PR', 'info');
        this.generateNoFilesResult();
        return;
      }

      // Process each file using diff content directly
      for (const [filePath, diffInfo] of Object.entries(parsedDiff.files)) {
        await this.validateFileWithDiffContent(filePath, diffInfo, diffContent);
      }

      // Generate results
      this.generateSummary();
      this.prepareInlineComments();
      this.outputResults();
      
    } catch (error) {
      this.log(`❌ Validation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Validate a single file using content extracted directly from diff
   */
  async validateFileWithDiffContent(filePath, diffInfo, fullDiffContent) {
    try {
      this.log(`🔍 Analyzing: ${filePath}`, 'debug');
      
      if (diffInfo.isDeletedFile) {
        this.log(`🗑️ Skipping deleted file: ${filePath}`, 'debug');
        return;
      }

      // Extract added/modified lines content from the diff
      const addedContent = this.extractAddedLinesFromDiff(filePath, fullDiffContent, diffInfo);
      
      if (!addedContent.trim()) {
        this.log(`📄 No added content to analyze in: ${filePath}`, 'debug');
        return;
      }

      this.log(`📝 Extracted ${addedContent.split('\n').length} lines of added content`, 'debug');

      // Apply all rules to the added content
      const allIssues = this.applyAllRules(addedContent, filePath, { diffInfo });
      
      // Map line numbers back to original file line numbers
      const mappedIssues = this.mapLinesToOriginal(allIssues, diffInfo, addedContent);
      
      // Add line content to issues for better messaging
      const addedLines = addedContent.split('\n');
      const addedLineNumbers = Array.from(diffInfo.addedLines).sort((a, b) => a - b);
      
      mappedIssues.forEach(issue => {
        // Find the content for this line
        const lineIndex = addedLineNumbers.indexOf(issue.line);
        if (lineIndex >= 0 && lineIndex < addedLines.length) {
          issue.lineContent = addedLines[lineIndex].trim();
        }
      });
      
      // Categorize and store issues
      this.categorizeIssues(mappedIssues);
      this.results.summary.filesProcessed++;
      
      this.log(`📊 ${filePath}: ${mappedIssues.length} issues found`, 'debug');
      
    } catch (error) {
      this.log(`⚠️ Error analyzing ${filePath}: ${error.message}`, 'warn');
    }
  }

  /**
   * Extract added lines content from the diff for a specific file
   */
  extractAddedLinesFromDiff(filePath, fullDiffContent, diffInfo) {
    const lines = fullDiffContent.split('\n');
    const addedLines = [];
    let inFileSection = false;
    let inChunk = false;

    for (const line of lines) {
      // Check if we're entering the section for our file
      if (line.startsWith('diff --git') && line.includes(filePath)) {
        inFileSection = true;
        continue;
      }
      
      // Check if we're entering another file's section
      if (line.startsWith('diff --git') && !line.includes(filePath)) {
        inFileSection = false;
        continue;
      }
      
      if (!inFileSection) continue;
      
      // Check if we're in a diff chunk
      if (line.startsWith('@@')) {
        inChunk = true;
        continue;
      }
      
      if (inChunk && line.startsWith('+') && !line.startsWith('+++')) {
        // This is an added line - remove the '+' prefix
        addedLines.push(line.substring(1));
      }
    }
    
    return addedLines.join('\n');
  }

  /**
   * Map line numbers from the extracted content back to original file line numbers
   */
  mapLinesToOriginal(issues, diffInfo, addedContent) {
    const addedContentLines = addedContent.split('\n');
    const addedLineNumbers = Array.from(diffInfo.addedLines).sort((a, b) => a - b);
    
    return issues.map(issue => {
      // Map the line number from the extracted content to the original file
      const extractedLineIndex = issue.line - 1; // Convert to 0-based index
      
      if (extractedLineIndex >= 0 && extractedLineIndex < addedLineNumbers.length) {
        issue.line = addedLineNumbers[extractedLineIndex];
      }
      
      return issue;
    });
  }

  /**
   * Apply all validation rules to content
   */
  applyAllRules(content, filePath, diffContext) {
    const allIssues = [];
    const allRules = this.ruleParser.getAllRules();

    allRules.forEach(rule => {
      try {
        const issues = rule.validator(content, filePath);
        issues.forEach(issue => {
          issue.ruleId = rule.id;
          issue.category = rule.category;
          issue.ruleDescription = rule.description;
        });
        allIssues.push(...issues);
      } catch (error) {
        this.log(`⚠️ Error in rule ${rule.id}: ${error.message}`, 'warn');
      }
    });

    return allIssues;
  }

  /**
   * Categorize issues by severity
   */
  categorizeIssues(issues) {
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'error':
          this.results.issues.errors.push(issue);
          this.results.summary.criticalIssues++;
          break;
        case 'warning':
          this.results.issues.warnings.push(issue);
          break;
        case 'suggestion':
          this.results.issues.suggestions.push(issue);
          break;
        default:
          this.results.issues.warnings.push(issue);
      }
    });
  }

  /**
   * Prepare inline comments for GitHub PR review
   */
  prepareInlineComments() {
    const allIssues = [
      ...this.results.issues.errors,
      ...this.results.issues.warnings,
      ...this.results.issues.suggestions
    ];

    // Group issues by file and line
    const groupedIssues = {};
    
    allIssues.forEach(issue => {
      const key = `${issue.file}:${issue.line}`;
      if (!groupedIssues[key]) {
        groupedIssues[key] = [];
      }
      groupedIssues[key].push(issue);
    });

    // Create inline comments (limit to maxInlineComments)
    const sortedKeys = Object.keys(groupedIssues).sort((a, b) => {
      // Sort by severity (errors first, then warnings, then suggestions)
      const issuesA = groupedIssues[a];
      const issuesB = groupedIssues[b];
      
      const severityOrder = { error: 0, warning: 1, suggestion: 2 };
      const minSeverityA = Math.min(...issuesA.map(i => severityOrder[i.severity] || 2));
      const minSeverityB = Math.min(...issuesB.map(i => severityOrder[i.severity] || 2));
      
      return minSeverityA - minSeverityB;
    });

    const limitedKeys = sortedKeys.slice(0, this.options.maxInlineComments);
    
    limitedKeys.forEach(key => {
      const issues = groupedIssues[key];
      const [filePath, lineNumber] = key.split(':');
      
      const inlineComment = this.generateInlineComment(issues, filePath, parseInt(lineNumber));
      this.results.inlineComments.push(inlineComment);
    });

    // Check if we need to truncate
    if (sortedKeys.length > this.options.maxInlineComments) {
      this.results.hasMoreIssues = true;
      this.results.remainingIssues = sortedKeys.length - this.options.maxInlineComments;
    }
  }

  /**
   * Generate a friendly inline comment for grouped issues on a line
   */
  generateInlineComment(issues, filePath, lineNumber) {
    const severity = this.getHighestSeverity(issues);
    const emoji = {
      error: '🚨',
      warning: '⚠️',
      suggestion: '💡'
    }[severity] || '💡';

    // Sort issues by severity (errors first, then warnings, then suggestions)
    const sortedIssues = issues.sort((a, b) => {
      const severityOrder = { error: 0, warning: 1, suggestion: 2 };
      return (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2);
    });

    // Extract the actual line content from the first issue
    const lineContent = sortedIssues[0].lineContent || '[content on this line]';
    const displayContent = lineContent.length > 80 ? 
      `"${lineContent.substring(0, 77)}..."` : 
      `"${lineContent}"`;
    
    let comment = `${emoji} **Strapi Documentation Review**\n\n`;
    
    // Start with the natural, conversational format
    if (sortedIssues.length === 1) {
      const issue = sortedIssues[0];
      const ruleNumber = this.getRuleNumber(issue.ruleId);
      const ruleName = this.getRuleShortDescription(issue.ruleId);
      
      comment += `On file \`${filePath}\`, line ${lineNumber}, you wrote ${problematicContent}. `;
      comment += `This content doesn't follow Rule ${ruleNumber} (${ruleName}). `;
      
      if (issue.suggestion) {
        comment += `It would be better to write "${this.generateSpecificSuggestion(issue.ruleId)}" instead.\n\n`;
      }
    } else {
      // Multiple rules violated
      comment += `On file \`${filePath}\`, line ${lineNumber}, you wrote ${problematicContent}. `;
      comment += `This content doesn't follow ${sortedIssues.length} rules:\n\n`;
      
      sortedIssues.forEach(issue => {
        const ruleNumber = this.getRuleNumber(issue.ruleId);
        const ruleName = this.getRuleShortDescription(issue.ruleId);
        comment += `• **Rule ${ruleNumber}**: ${ruleName}\n`;
      });
      
      comment += `\nIt would be better to write "${this.generateCombinedSuggestion(sortedIssues)}" instead.\n\n`;
    }

    // Add footer
    comment += `📚 [Learn more about our writing guidelines](https://strapi.notion.site/12-Rules-of-Technical-Writing-c75e080e6b19432287b3dd61c2c9fa04)`;

    return {
      path: filePath,
      line: lineNumber,
      body: comment
    };
  }

  /**
   * Get short, clear rule descriptions
   */
  getRuleShortDescription(ruleId) {
    const descriptions = {
      'easy_difficult_words': 'Never say something is "easy" or "difficult" - this can discourage readers',
      'jokes_and_casual_tone': 'Maintain professional tone - avoid emojis and casual language',
      'procedures_must_be_numbered': 'Use numbered lists for step-by-step procedures',
      'minimize_pronouns': 'Minimize pronouns like "you" and "we"',
      'simple_english_vocabulary': 'Use simple, clear vocabulary',
      'use_bullet_lists': 'Use bullet lists instead of long enumerations'
    };
    return descriptions[ruleId] || 'Follow technical writing best practices';
  }

  /**
   * Generate specific suggestion for a single rule violation
   */
  generateSpecificSuggestion(ruleId) {
    const suggestions = {
      'easy_difficult_words': 'To configure this setting:',
      'jokes_and_casual_tone': 'Follow these steps:',
      'procedures_must_be_numbered': '1. First step\n2. Second step',
      'minimize_pronouns': 'Configure the setting by...',
      'simple_english_vocabulary': 'Use this feature',
      'use_bullet_lists': 'Features include:\n- Feature A\n- Feature B'
    };
    return suggestions[ruleId] || 'Rewrite using clear, professional language';
  }

  /**
   * Generate combined suggestion that addresses multiple rule violations
   */
  generateCombinedSuggestion(sortedIssues) {
    // Look for the most appropriate combined suggestion based on rule combinations
    const ruleIds = sortedIssues.map(issue => issue.ruleId);
    
    // Common combinations
    if (ruleIds.includes('easy_difficult_words') && ruleIds.includes('jokes_and_casual_tone')) {
      return 'Follow these steps:';
    }
    
    if (ruleIds.includes('procedures_must_be_numbered')) {
      return '1. First step\n2. Second step\n3. Third step';
    }
    
    // Default to neutral, professional language
    return 'Follow the steps below:';
  }

  /**
   * Get highest severity from a group of issues
   */
  getHighestSeverity(issues) {
    const severityOrder = { error: 0, warning: 1, suggestion: 2 };
    return issues.reduce((highest, issue) => {
      return severityOrder[issue.severity] < severityOrder[highest] ? issue.severity : highest;
    }, 'suggestion');
  }

  /**
   * Extract rule number from rule ID
   */
  getRuleNumber(ruleId) {
    const ruleMap = {
      'easy_difficult_words': '6',
      'jokes_and_casual_tone': '3',
      'procedures_must_be_numbered': '7',
      'minimize_pronouns': '11',
      'simple_english_vocabulary': '4',
      'use_bullet_lists': '8'
    };
    return ruleMap[ruleId] || '?';
  }

  /**
   * Get friendly rule name
   */
  getRuleName(ruleId) {
    const nameMap = {
      'easy_difficult_words': 'Avoid "easy/difficult" language',
      'jokes_and_casual_tone': 'Maintain professional tone',
      'procedures_must_be_numbered': 'Use numbered lists for procedures',
      'minimize_pronouns': 'Minimize pronouns',
      'simple_english_vocabulary': 'Use simple English',
      'use_bullet_lists': 'Use bullet lists for enumerations'
    };
    return nameMap[ruleId] || 'Technical writing best practice';
  }

  /**
   * Generate example for rule violation
   */
  generateExample(ruleId, issue) {
    const examples = {
      'easy_difficult_words': '❌ "This is easy to configure"\n✅ "To configure this setting:"',
      'jokes_and_casual_tone': '❌ "This is super cool!"\n✅ "This feature provides..."',
      'procedures_must_be_numbered': '❌ "First do this, then do that"\n✅ "1. Do this\n2. Do that"',
      'minimize_pronouns': '❌ "You need to configure..."\n✅ "Configure the setting..."',
      'simple_english_vocabulary': '❌ "Utilize this feature"\n✅ "Use this feature"',
      'use_bullet_lists': '❌ "Features include A, B, and C"\n✅ "Features include:\n- A\n- B\n- C"'
    };
    
    return examples[ruleId];
  }

  /**
   * Generate summary and prepare results
   */
  generateSummary() {
    this.results.summary.totalIssues = 
      this.results.issues.errors.length + 
      this.results.issues.warnings.length + 
      this.results.issues.suggestions.length;

    this.log('📊 Validation Summary:', 'info');
    this.log(`   Files processed: ${this.results.summary.filesProcessed}`, 'info');
    this.log(`   Total issues: ${this.results.summary.totalIssues}`, 'info');
    this.log(`   🚨 Critical errors: ${this.results.issues.errors.length}`, 'info');
    this.log(`   ⚠️  Warnings: ${this.results.issues.warnings.length}`, 'info');
    this.log(`   💡 Suggestions: ${this.results.issues.suggestions.length}`, 'info');
    this.log(`   💬 Inline comments: ${this.results.inlineComments.length}`, 'info');
  }

  /**
   * Generate friendly GitHub comment
   */
  generateFriendlyComment() {
    const { summary, issues, hasMoreIssues, remainingIssues } = this.results;
    
    let comment = `## 👋 Thanks for contributing to Strapi's documentation!\n\n`;
    
    // Positive opening
    if (summary.filesProcessed === 1) {
      comment += `I've reviewed the changes in your file, and here's what I found:\n\n`;
    } else {
      comment += `I've reviewed the changes across ${summary.filesProcessed} files, and here's what I found:\n\n`;
    }
    
    // Results overview
    if (summary.totalIssues === 0) {
      comment += `🎉 **Excellent work!** Your documentation perfectly follows all our writing guidelines.\n\n`;
      comment += `**What this means:**\n`;
      comment += `✅ Professional, clear tone throughout\n`;
      comment += `✅ Well-structured content that's easy to follow\n`;
      comment += `✅ Inclusive language that welcomes all readers\n\n`;
      comment += `Your contribution is ready to help developers worldwide! 🌍\n\n`;
    } else {
      // Start positive even with issues
      comment += `Your contribution looks great! I've spotted ${summary.totalIssues} small improvement${summary.totalIssues > 1 ? 's' : ''} that will make your documentation even better.\n\n`;
      
      // Summary with emojis
      comment += `**📊 Quick Overview:**\n`;
      if (issues.errors.length > 0) {
        comment += `🚨 ${issues.errors.length} critical item${issues.errors.length > 1 ? 's' : ''} to address\n`;
      }
      if (issues.warnings.length > 0) {
        comment += `⚠️ ${issues.warnings.length} recommendation${issues.warnings.length > 1 ? 's' : ''}\n`;
      }
      if (issues.suggestions.length > 0) {
        comment += `💡 ${issues.suggestions.length} suggestion${issues.suggestions.length > 1 ? 's' : ''} to consider\n`;
      }
      comment += `\n`;
      
      // Inline comments explanation
      if (this.results.inlineComments.length > 0) {
        comment += `I've added ${this.results.inlineComments.length} detailed comment${this.results.inlineComments.length > 1 ? 's' : ''} directly on the relevant lines with specific suggestions and examples.\n\n`;
      }
      
      // Truncation message if needed
      if (hasMoreIssues) {
        comment += `💙 To keep things manageable, I'm showing the most important ${this.options.maxInlineComments} items first. Once you address these, I'll review again and help with any remaining improvements! 😊\n\n`;
      }
      
      // Encouraging message
      if (issues.errors.length > 0) {
        comment += `The critical items are quick fixes that ensure our documentation is welcoming to all skill levels. `;
      }
      comment += `These improvements will make your contribution even more helpful for the Strapi community!\n\n`;
    }
    
    // Resources
    comment += `**📚 Helpful Resources:**\n`;
    comment += `📖 [Strapi's 12 Rules of Technical Writing](https://strapi.notion.site/12-Rules-of-Technical-Writing-c75e080e6b19432287b3dd61c2c9fa04)\n`;
    comment += `🎨 [Documentation Style Guide](https://github.com/strapi/documentation/blob/main/STYLE_GUIDE.pdf)\n\n`;
    
    // Footer
    comment += `---\n`;
    comment += `*🤖 This review focuses only on the lines you've changed. Questions? Feel free to ask in the comments!*`;
    
    return comment;
  }

  /**
   * Handle case when no markdown files are found
   */
  generateNoFilesResult() {
    this.results.summary.filesProcessed = 0;
    this.results.summary.totalIssues = 0;
  }

  /**
   * Output results to file and console
   */
  outputResults() {
    // Generate the friendly comment
    const friendlyComment = this.generateFriendlyComment();
    
    // Prepare data for GitHub Actions
    const reportData = {
      timestamp: new Date().toISOString(),
      prNumber: this.options.prNumber,
      repoOwner: this.options.repoOwner,
      repoName: this.options.repoName,
      mode: this.results.mode,
      summary: this.results.summary,
      issues: this.results.issues,
      inlineComments: this.results.inlineComments,
      hasMoreIssues: this.results.hasMoreIssues || false,
      remainingIssues: this.results.remainingIssues || 0,
      githubComment: friendlyComment
    };

    // Write results file
    fs.writeFileSync('style-check-results.json', JSON.stringify(reportData, null, 2));
    
    this.log('✅ Enhanced validation completed', 'info');
    this.log(`📝 Generated ${this.results.inlineComments.length} inline comments`, 'info');
    this.log('💾 Results saved to style-check-results.json', 'info');
    
    // Console output
    if (this.results.summary.totalIssues === 0) {
      console.log('\n🎉 Perfect! All validations passed!');
    } else {
      console.log(`\n📊 Found ${this.results.summary.totalIssues} items for improvement`);
      console.log(`💬 Generated ${this.results.inlineComments.length} inline comments`);
    }
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v')
  };

  // Parse PR number
  const prIndex = args.findIndex(arg => arg === '--pr');
  if (prIndex !== -1 && args[prIndex + 1]) {
    options.prNumber = parseInt(args[prIndex + 1]);
  }

  // Parse repository
  const repoIndex = args.findIndex(arg => arg === '--repo');
  if (repoIndex !== -1 && args[repoIndex + 1]) {
    const [owner, name] = args[repoIndex + 1].split('/');
    options.repoOwner = owner;
    options.repoName = name;
  }

  if (!options.prNumber) {
    console.error('❌ PR number is required. Use: --pr <number>');
    console.error('Example: node enhanced-validator.js --pr 2565 --repo strapi/documentation');
    process.exit(1);
  }

  const validator = new EnhancedGitHubDocumentationValidator(options);
  await validator.validatePR();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

module.exports = EnhancedGitHubDocumentationValidator;