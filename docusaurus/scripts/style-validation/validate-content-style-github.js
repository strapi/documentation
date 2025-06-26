#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const Strapi12RulesParser = require('./rule-parser');
const GitHubURLDiffParser = require('./github-diff-parser');

class GitHubDocumentationValidator {
  constructor(options = {}) {
    this.options = {
      configPath: options.configPath || path.join(__dirname, 'style-rules.yml'),
      verbose: options.verbose || false,
      specificFiles: options.files || null,
      prNumber: options.prNumber || null,
      repoOwner: options.repoOwner || 'strapi',
      repoName: options.repoName || 'documentation',
      diffMode: options.diffMode || false
    };

    this.results = {
      errors: [],
      warnings: [],
      suggestions: [],
      summary: {
        filesProcessed: 0,
        totalIssues: 0,
        criticalIssues: 0,
        prNumber: this.options.prNumber,
        mode: this.options.diffMode ? 'PR diff' : 'standard'
      }
    };

    // Initialize parsers
    try {
      this.ruleParser = new Strapi12RulesParser(this.options.configPath);
      this.diffParser = new GitHubURLDiffParser({
        contextLines: 5,
        verbose: this.options.verbose
      });
      this.log('✅ Strapi 12 Rules and GitHub Diff Parser loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load parsers:', error.message);
      process.exit(1);
    }
  }

  log(message, level = 'info') {
    if (this.options.verbose || level === 'error') {
      const timestamp = new Date().toISOString().substring(11, 19);
      const prefix = {
        info: 'ℹ️',
        debug: '🔍',
        warn: '⚠️',
        error: '❌',
        success: '✅'
      }[level] || 'ℹ️';
      
      console.log(`[${timestamp}] ${prefix} ${message}`);
    }
  }

  async validate() {
    this.log('🚀 Starting GitHub-enhanced Strapi documentation validation...');
    
    if (this.options.diffMode && this.options.prNumber) {
      this.log(`📊 PR mode enabled: analyzing PR #${this.options.prNumber}`);
      await this.validateWithPRDiff();
    } else if (this.options.specificFiles && this.options.specificFiles.length > 0) {
      this.log('📄 File mode: validating specific files');
      await this.validateSpecificFiles();
    } else {
      this.log('📁 Standard mode: validating all documentation');
      await this.validateStandard();
    }

    this.generateSummary();
    this.outputResults();
    return this.results;
  }

  async validateWithPRDiff() {
    try {
      // Fetch PR diff from GitHub
      this.log(`🔍 Fetching PR #${this.options.prNumber} diff from GitHub...`);
      const diffContent = await this.diffParser.fetchPRDiff(
        this.options.repoOwner, 
        this.options.repoName, 
        this.options.prNumber
      );

      // Parse the diff
      const parsedDiff = this.diffParser.parsePRDiff(diffContent);
      
      if (parsedDiff.totalFiles === 0) {
        this.log('📝 No markdown files changed in this PR');
        return;
      }

      this.log(`📄 Found ${parsedDiff.totalFiles} changed markdown files in PR`);

      // Validate each changed file
      for (const [filePath, diffInfo] of Object.entries(parsedDiff.files)) {
        await this.validateFileWithDiff(filePath, diffInfo);
      }

    } catch (error) {
      this.log(`❌ Error fetching/parsing PR diff: ${error.message}`, 'error');
      this.results.errors.push({
        file: 'PR_FETCH_ERROR',
        line: 1,
        message: `Failed to fetch PR #${this.options.prNumber}: ${error.message}`,
        severity: 'error',
        rule: 'system_error'
      });
    }
  }

  async validateFileWithDiff(filePath, diffInfo) {
    this.log(`🔍 Validating: ${filePath}`, 'debug');

    try {
      // Handle different change types
      if (diffInfo.isDeletedFile) {
        this.log(`⏭️  Skipping deleted file: ${filePath}`, 'debug');
        return;
      }

      if (!fs.existsSync(filePath)) {
        this.log(`⚠️  File not found locally: ${filePath}`, 'warn');
        // File might be new in PR but not checked out locally
        if (diffInfo.isNewFile) {
          this.log(`📄 New file in PR: ${filePath} (skipping - not available locally)`, 'debug');
          return;
        }
      }

      const originalContent = fs.readFileSync(filePath, 'utf8');
      this.results.summary.filesProcessed++;

      // Generate filtered content based on diff
      const { content: filteredContent, lineMapping, changedLines } = 
        this.diffParser.generateFilteredContent(originalContent, diffInfo);

      if (diffInfo.isNewFile || diffInfo.analyzeEntireFile) {
        this.log(`📄 New file: analyzing entire content`, 'debug');
      } else {
        this.log(`📝 Modified file: analyzing ${diffInfo.addedLines.size + diffInfo.modifiedLines.size} changed lines with context`, 'debug');
      }

      // Apply rules to filtered content
      const allIssues = this.applyAllRules(filteredContent, filePath, {
        lineMapping,
        changedLines,
        diffInfo
      });

      // Filter issues to only include those on actually changed lines
      const relevantIssues = this.filterIssuesForChangedLines(allIssues, changedLines, lineMapping, diffInfo);
      
      this.categorizeIssues(relevantIssues);

      this.log(`✅ Completed: ${path.basename(filePath)} (${relevantIssues.length} relevant issues)`, 'debug');

    } catch (error) {
      this.log(`❌ Error validating ${filePath}: ${error.message}`, 'error');
      this.results.errors.push({
        file: filePath,
        line: 1,
        message: `File validation failed: ${error.message}`,
        severity: 'error',
        rule: 'system_error'
      });
    }
  }

  async validateSpecificFiles() {
    for (const filePath of this.options.specificFiles) {
      await this.validateFile(filePath);
    }
  }

  async validateStandard() {
    const files = this.getFilesToValidate();
    this.log(`📁 Found ${files.length} files to validate`);

    for (const filePath of files) {
      await this.validateFile(filePath);
    }
  }

  async validateFile(filePath) {
    this.log(`🔍 Validating: ${path.relative(process.cwd(), filePath)}`, 'debug');

    try {
      if (!fs.existsSync(filePath)) {
        this.log(`⚠️  File not found: ${filePath}`, 'warn');
        return;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      this.results.summary.filesProcessed++;

      const allIssues = this.applyAllRules(content, filePath);
      this.categorizeIssues(allIssues);

      this.log(`✅ Completed: ${path.basename(filePath)} (${allIssues.length} issues)`, 'debug');

    } catch (error) {
      this.log(`❌ Error validating ${filePath}: ${error.message}`, 'error');
      this.results.errors.push({
        file: filePath,
        line: 1,
        message: `File validation failed: ${error.message}`,
        severity: 'error',
        rule: 'system_error'
      });
    }
  }

  applyAllRules(content, filePath, diffContext = null) {
    const allIssues = [];
    const allRules = this.ruleParser.getAllRules();

    allRules.forEach(rule => {
      try {
        const issues = rule.validator(content, filePath);
        
        issues.forEach(issue => {
          issue.category = rule.category;
          issue.ruleId = rule.id;
          issue.ruleDescription = rule.description;
          
          // Map line numbers back to original file if we have diff context
          if (diffContext && diffContext.lineMapping) {
            const originalLine = diffContext.lineMapping[issue.line];
            if (originalLine) {
              issue.originalLine = issue.line;
              issue.line = originalLine;
            }
          }
        });
        
        allIssues.push(...issues);
      } catch (error) {
        this.log(`❌ Error in rule ${rule.id}: ${error.message}`, 'error');
      }
    });

    return allIssues;
  }

  filterIssuesForChangedLines(issues, changedLines, lineMapping, diffInfo) {
    if (!changedLines || !lineMapping) {
      // No diff context, return all issues
      return issues;
    }

    // For new files, return all issues
    if (diffInfo && (diffInfo.isNewFile || diffInfo.analyzeEntireFile)) {
      return issues;
    }

    // STRICT: Only include lines that were actually added or modified
    const actuallyChangedLines = new Set([
      ...changedLines.added,
      ...changedLines.modified
      // NOTE: Deliberately NOT including changedLines.context
    ]);

    return issues.filter(issue => {
      // STRICT: Only include issues on lines that were actually changed
      if (actuallyChangedLines.has(issue.line)) {
        this.log(`✅ Issue on changed line ${issue.line}: ${issue.ruleId}`, 'debug');
        return true;
      }

      // For contextual rules, check if the issue is in a paragraph that contains actual changes
      if (this.isContextualRule(issue.ruleId)) {
        const isInChangedParagraph = this.isIssueInChangedParagraph(issue, actuallyChangedLines);
        if (isInChangedParagraph) {
          this.log(`✅ Contextual issue near changed lines ${issue.line}: ${issue.ruleId}`, 'debug');
          return true;
        }
      }

      this.log(`❌ Filtered out issue on unchanged line ${issue.line}: ${issue.ruleId}`, 'debug');
      return false;
    });
  }

  isIssueInChangedParagraph(issue, actuallyChangedLines) {
    // Check if there's an actual change within ±2 lines (smaller threshold)
    const proximityThreshold = 2; // Reduced from 3 to 2
    
    for (const changedLine of actuallyChangedLines) {
      if (Math.abs(issue.line - changedLine) <= proximityThreshold) {
        return true;
      }
    }
    
    return false;
  }

  isContextualRule(ruleId) {
    const contextualRules = [
      'procedures_must_be_numbered',
      'use_bullet_lists',
      'minimize_pronouns'
    ];
    
    return contextualRules.includes(ruleId);
  }

  getFilesToValidate() {
    const docsPath = path.join(process.cwd(), 'docs');
    
    if (!fs.existsSync(docsPath)) {
      this.log('❌ docs/ directory not found', 'error');
      return [];
    }

    const pattern = path.join(docsPath, '**/*.{md,mdx}');
    return glob.sync(pattern);
  }

  categorizeIssues(issues) {
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'error':
          this.results.errors.push(issue);
          this.results.summary.criticalIssues++;
          break;
        case 'warning':
          this.results.warnings.push(issue);
          break;
        case 'suggestion':
          this.results.suggestions.push(issue);
          break;
        default:
          this.results.warnings.push(issue);
      }
    });
  }

  generateSummary() {
    this.results.summary.totalIssues = 
      this.results.errors.length + 
      this.results.warnings.length + 
      this.results.suggestions.length;

    this.log('📊 Validation Summary:', 'info');
    if (this.options.prNumber) {
      this.log(`   PR: #${this.options.prNumber}`, 'info');
    }
    this.log(`   Mode: ${this.results.summary.mode}`, 'info');
    this.log(`   Files processed: ${this.results.summary.filesProcessed}`, 'info');
    this.log(`   Total issues: ${this.results.summary.totalIssues}`, 'info');
    this.log(`   🚨 Critical errors: ${this.results.errors.length}`, 'info');
    this.log(`   ⚠️  Warnings: ${this.results.warnings.length}`, 'info');
    this.log(`   💡 Suggestions: ${this.results.suggestions.length}`, 'info');
  }

  outputResults() {
    // Write JSON for GitHub Actions
    const reportData = {
      timestamp: new Date().toISOString(),
      prNumber: this.options.prNumber,
      mode: this.results.summary.mode,
      repoOwner: this.options.repoOwner,
      repoName: this.options.repoName,
      summary: this.results.summary,
      issues: {
        errors: this.results.errors,
        warnings: this.results.warnings,
        suggestions: this.results.suggestions
      }
    };

    fs.writeFileSync('style-check-results.json', JSON.stringify(reportData, null, 2));

    // Console output
    if (this.results.summary.totalIssues === 0) {
      if (this.options.prNumber) {
        console.log(`\n🎉 PR #${this.options.prNumber} follows all Strapi 12 rules!\n`);
      } else {
        console.log('\n🎉 All validations passed! Your documentation follows Strapi\'s 12 rules.\n');
      }
      return;
    }

    console.log('\n📋 Strapi Documentation Validation Results\n');

    if (this.options.prNumber) {
      console.log(`🔍 PR #${this.options.prNumber} Analysis\n`);
    }

    // Show critical errors first
    if (this.results.errors.length > 0) {
      console.log('🚨 CRITICAL ERRORS (must fix):');
      this.results.errors.forEach(error => {
        console.log(`  ❌ ${path.relative(process.cwd(), error.file)}:${error.line}`);
        console.log(`     ${error.message}`);
        if (error.suggestion) {
          console.log(`     💡 ${error.suggestion}`);
        }
        console.log('');
      });
    }

    // Show warnings
    if (this.results.warnings.length > 0) {
      console.log('⚠️  WARNINGS (should fix):');
      this.results.warnings.slice(0, 5).forEach(warning => {
        console.log(`  ⚠️  ${path.relative(process.cwd(), warning.file)}:${warning.line}`);
        console.log(`     ${warning.message}`);
        console.log('');
      });
      
      if (this.results.warnings.length > 5) {
        console.log(`     ... and ${this.results.warnings.length - 5} more warnings\n`);
      }
    }

    // Show suggestions
    if (this.results.suggestions.length > 0) {
      console.log('💡 SUGGESTIONS (improvements):');
      this.results.suggestions.slice(0, 3).forEach(suggestion => {
        console.log(`  💡 ${path.relative(process.cwd(), suggestion.file)}:${suggestion.line}`);
        console.log(`     ${suggestion.message}`);
        console.log('');
      });
      
      if (this.results.suggestions.length > 3) {
        console.log(`     ... and ${this.results.suggestions.length - 3} more suggestions\n`);
      }
    }

    if (this.options.prNumber) {
      console.log(`ℹ️  Only issues on lines changed in PR #${this.options.prNumber} are shown\n`);
    }

    // Exit with error code if critical issues found
    if (this.results.errors.length > 0) {
      console.log('💥 VALIDATION FAILED: Critical errors must be fixed before merging.\n');
      process.exit(1);
    } else {
      console.log('✅ No critical errors found. Review warnings and suggestions.\n');
      process.exit(0);
    }
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    diffMode: false,
    prNumber: null,
    repoOwner: 'strapi',
    repoName: 'documentation',
    files: []
  };

  // Parse PR number
  const prIndex = args.findIndex(arg => arg === '--pr');
  if (prIndex !== -1 && args[prIndex + 1]) {
    options.prNumber = parseInt(args[prIndex + 1]);
    options.diffMode = true;
  }

  // Parse repo info
  const repoIndex = args.findIndex(arg => arg === '--repo');
  if (repoIndex !== -1 && args[repoIndex + 1]) {
    const repoInfo = args[repoIndex + 1].split('/');
    if (repoInfo.length === 2) {
      options.repoOwner = repoInfo[0];
      options.repoName = repoInfo[1];
    }
  }

  // Get file arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('--') && !arg.startsWith('-') && 
        !['--pr', '--repo'].includes(args[i - 1])) {
      options.files.push(arg);
    }
  }

  if (options.prNumber) {
    console.log(`🎯 GitHub PR validation mode: PR #${options.prNumber}`);
    console.log(`📊 Repository: ${options.repoOwner}/${options.repoName}`);
  } else if (options.files.length > 0) {
    console.log(`🎯 File validation mode: ${options.files.length} files`);
  } else {
    console.log('🎯 Standard validation mode: all documentation');
  }

  const validator = new GitHubDocumentationValidator(options);
  await validator.validate();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = GitHubDocumentationValidator;
