#!/usr/bin/env node

/**
 * PR-focused style validation (public API unchanged).
 * Uses Vale via lib/vale-runner.js; reports via style-check-results.json.
 */

const fs = require('fs');
const path = require('path');
const GitHubURLDiffParser = require('./github-diff-parser');
const { DOCUSAURUS_DIR, validateFiles } = require('./lib/vale-runner');
const { writeResultsJson } = require('./lib/console-report');
const { generateFriendlyComment, prepareInlineComments } = require('./lib/github-pr-report');

class EnhancedGitHubDocumentationValidator {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      prNumber: options.prNumber,
      repoOwner: options.repoOwner || 'strapi',
      repoName: options.repoName || 'documentation',
      maxInlineComments: options.maxInlineComments || 10,
    };

    this.diffParser = new GitHubURLDiffParser({ verbose: this.options.verbose });
    this.results = {
      summary: { filesProcessed: 0, totalIssues: 0, criticalIssues: 0 },
      issues: { errors: [], warnings: [], suggestions: [] },
      inlineComments: [],
      mode: 'PR diff',
    };
  }

  log(message, level = 'info') {
    if (this.options.verbose || level === 'error') {
      const timestamp = new Date().toISOString().substring(11, 19);
      const prefix = { info: '💙', debug: '🔍', warn: '⚠️', error: '❌' }[level] || '💙';
      console.log(`[${timestamp}] ${prefix} ${message}`);
    }
  }

  async validatePR() {
    if (!this.options.prNumber) {
      throw new Error('PR number is required for validation');
    }

    const diffContent = await this.diffParser.fetchPRDiff(
      this.options.repoOwner,
      this.options.repoName,
      this.options.prNumber,
    );

    const parsedDiff = this.diffParser.parsePRDiff(diffContent);
    this.log(`📊 Found ${parsedDiff.totalFiles} markdown files to analyze`, 'info');

    if (parsedDiff.totalFiles === 0) {
      this.generateNoFilesResult();
      return;
    }

    for (const [filePath, diffInfo] of Object.entries(parsedDiff.files)) {
      await this.validateFileInPR(filePath, diffInfo);
    }

    this.results.summary.totalIssues =
      this.results.issues.errors.length +
      this.results.issues.warnings.length +
      this.results.issues.suggestions.length;

    const { inlineComments, hasMoreIssues, remainingIssues } = prepareInlineComments(
      this.results.issues,
      this.options.maxInlineComments,
    );
    this.results.inlineComments = inlineComments;
    this.results.hasMoreIssues = hasMoreIssues;
    this.results.remainingIssues = remainingIssues;

    this.outputResults();
  }

  async validateFileInPR(relativePath, diffInfo) {
    if (diffInfo.isDeletedFile) {
      return;
    }

    const diskPath = path.join(DOCUSAURUS_DIR, relativePath);
    if (!fs.existsSync(diskPath)) {
      this.log(`⚠️ File not in workspace, skipping: ${relativePath}`, 'warn');
      return;
    }

    const repoPath = `docusaurus/${relativePath}`;
    const addedLines = diffInfo.addedLines || new Set();
    const isNewFile = diffInfo.isNewFile;

    const lineFilter = (_filePath, line) => {
      if (isNewFile) {
        return true;
      }
      return addedLines.has(line);
    };

    const fileResults = validateFiles([relativePath], {
      cwd: DOCUSAURUS_DIR,
      verbose: this.options.verbose,
      lineFilter,
    });

    const attachRepoPath = (issue) => ({
      ...issue,
      repoPath,
      lineContent: issue.match,
    });

    this.results.issues.errors.push(...fileResults.errors.map(attachRepoPath));
    this.results.issues.warnings.push(...fileResults.warnings.map(attachRepoPath));
    this.results.issues.suggestions.push(...fileResults.suggestions.map(attachRepoPath));

    if (
      fileResults.errors.length ||
      fileResults.warnings.length ||
      fileResults.suggestions.length
    ) {
      this.results.summary.filesProcessed += 1;
    }
  }

  generateNoFilesResult() {
    const friendlyComment =
      "## 👋 Thanks for contributing to Strapi's documentation!\n\n" +
      '📝 No markdown documentation files were changed in this PR.\n';

    writeResultsJson(
      {
        errors: [],
        warnings: [],
        suggestions: [],
        summary: { filesProcessed: 0, totalIssues: 0, criticalIssues: 0 },
      },
      path.join(DOCUSAURUS_DIR, 'style-check-results.json'),
      {
        prNumber: this.options.prNumber,
        repoOwner: this.options.repoOwner,
        repoName: this.options.repoName,
        mode: this.results.mode,
        inlineComments: [],
        githubComment: friendlyComment,
      },
    );
  }

  outputResults() {
    const githubComment = generateFriendlyComment(this.results);
    const flatResults = {
      summary: this.results.summary,
      errors: this.results.issues.errors,
      warnings: this.results.issues.warnings,
      suggestions: this.results.issues.suggestions,
    };
    writeResultsJson(flatResults, path.join(DOCUSAURUS_DIR, 'style-check-results.json'), {
      prNumber: this.options.prNumber,
      repoOwner: this.options.repoOwner,
      repoName: this.options.repoName,
      mode: this.results.mode,
      inlineComments: this.results.inlineComments,
      hasMoreIssues: this.results.hasMoreIssues,
      remainingIssues: this.results.remainingIssues,
      githubComment,
    });

    this.log('✅ Enhanced validation completed', 'info');
    this.log(`📝 Generated ${this.results.inlineComments.length} inline comments`, 'info');
    this.log('💾 Results saved to style-check-results.json', 'info');

    if (this.results.summary.totalIssues === 0) {
      console.log('\n🎉 Perfect! All validations passed!');
    } else {
      console.log(`\n📊 Found ${this.results.summary.totalIssues} items for improvement`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options = { verbose: args.includes('--verbose') || args.includes('-v') };

  const prIndex = args.findIndex((arg) => arg === '--pr');
  if (prIndex !== -1 && args[prIndex + 1]) {
    options.prNumber = parseInt(args[prIndex + 1], 10);
  }

  const repoIndex = args.findIndex((arg) => arg === '--repo');
  if (repoIndex !== -1 && args[repoIndex + 1]) {
    const [owner, name] = args[repoIndex + 1].split('/');
    options.repoOwner = owner;
    options.repoName = name;
  }

  if (!options.prNumber) {
    console.error('❌ PR number is required. Use: --pr <number> --repo owner/repo');
    process.exit(1);
  }

  const validator = new EnhancedGitHubDocumentationValidator(options);
  await validator.validatePR();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

module.exports = EnhancedGitHubDocumentationValidator;
