#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Dynamic path resolution to work from any directory
const scriptDir = __dirname;
const gitHubDiffParserPath = path.join(scriptDir, 'github-diff-parser');
const validateGitHubPath = path.join(scriptDir, 'validate-content-style-github');
const ruleParserPath = path.join(scriptDir, 'rule-parser');
const styleRulesPath = path.join(scriptDir, 'style-rules.yml');

const GitHubURLDiffParser = require(gitHubDiffParserPath);
const GitHubDocumentationValidator = require(validateGitHubPath);

/**
 * Local test script for validating documentation with a diff file
 * Usage: node test-local-diff.js path/to/diff-file.patch [PR_NUMBER]
 */
class LocalDiffTester {
  constructor(diffFilePath, prNumber = null) {
    this.diffFilePath = diffFilePath;
    this.prNumber = prNumber;
    this.diffParser = new GitHubURLDiffParser({ verbose: true });
  }

  async testValidation() {
    try {
      console.log('🎯 Local Diff Validation Test');
      console.log('============================');
      console.log(`📄 Diff file: ${this.diffFilePath}`);
      if (this.prNumber) {
        console.log(`🔍 PR number: #${this.prNumber}`);
      }
      console.log('');

      // Read the diff file
      if (!fs.existsSync(this.diffFilePath)) {
        throw new Error(`Diff file not found: ${this.diffFilePath}`);
      }

      const diffContent = fs.readFileSync(this.diffFilePath, 'utf8');
      console.log(`✅ Diff file loaded (${diffContent.length} characters)`);

      // Parse the diff
      const parsedDiff = this.diffParser.parsePRDiff(diffContent);
      console.log(`📊 Found ${parsedDiff.totalFiles} markdown files in diff`);
      
      if (parsedDiff.totalFiles === 0) {
        console.log('📝 No markdown files found in diff');
        return;
      }

      // Display files found
      console.log('\n📋 Files to validate:');
      Object.keys(parsedDiff.files).forEach(filePath => {
        const info = parsedDiff.files[filePath];
        if (info.isNewFile) {
          console.log(`  📄 ${filePath} (new file)`);
        } else if (info.isDeletedFile) {
          console.log(`  🗑️  ${filePath} (deleted)`);
        } else {
          console.log(`  📝 ${filePath} (${info.addedLines.size} added, ${info.deletedLines.size} deleted lines)`);
        }
      });

      // Create a mock validator to test our logic
      const validator = new MockGitHubValidator({
        prNumber: this.prNumber,
        verbose: true
      });

      // Process each file
      let totalIssues = 0;
      for (const [filePath, diffInfo] of Object.entries(parsedDiff.files)) {
        console.log(`\n🔍 Validating: ${filePath}`);
        
        const issues = await validator.validateFileWithDiff(filePath, diffInfo);
        totalIssues += issues.length;
        
        if (issues.length === 0) {
          console.log(`  ✅ No issues found`);
        } else {
          console.log(`  ⚠️  ${issues.length} issues found:`);
          issues.forEach(issue => {
            console.log(`    - Line ${issue.line}: ${issue.message}`);
          });
        }
      }

      // Generate mock GitHub comment
      console.log('\n📝 Mock GitHub Comment:');
      console.log('========================');
      const mockComment = this.generateMockGitHubComment(parsedDiff, totalIssues);
      console.log(mockComment);

      // Save results to file
      const results = {
        timestamp: new Date().toISOString(),
        prNumber: this.prNumber,
        mode: 'local-diff-test',
        summary: {
          filesProcessed: parsedDiff.totalFiles,
          totalIssues: totalIssues
        },
        diffFile: this.diffFilePath
      };
      
      fs.writeFileSync('local-test-results.json', JSON.stringify(results, null, 2));
      console.log('\n💾 Results saved to: local-test-results.json');

    } catch (error) {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    }
  }

  generateMockGitHubComment(parsedDiff, totalIssues) {
    let comment = `## 🎯 Strapi Documentation Style Review (LOCAL TEST)\n\n`;
    comment += `*Automated analysis using Strapi's 12 Rules of Technical Writing*\n\n`;
    comment += `**🚀 Test Mode:** Local diff file analysis\n`;
    comment += `**📊 Source:** ${this.diffFilePath}\n`;
    if (this.prNumber) {
      comment += `**🎯 PR:** #${this.prNumber}\n`;
    }
    comment += '\n';
    
    comment += '### 📊 Analysis Results\n';
    comment += `- **Files analyzed:** ${parsedDiff.totalFiles}\n`;
    comment += `- **Total issues:** ${totalIssues}\n\n`;
    
    if (totalIssues === 0) {
      comment += '🎉 **Perfect!** Your documentation changes follow all 12 technical writing rules.\n\n';
    } else {
      comment += `⚠️ Found ${totalIssues} issues that should be addressed.\n\n`;
    }
    
    comment += '**📚 Resources:**\n';
    comment += '- [Strapi\'s 12 Rules of Technical Writing](https://strapi.notion.site/12-Rules-of-Technical-Writing-c75e080e6b19432287b3dd61c2c9fa04)\n';
    comment += '- [Documentation Style Guide](https://github.com/strapi/documentation/blob/main/STYLE_GUIDE.pdf)\n\n';
    comment += '*🧪 This is a local test simulation of what would be posted on GitHub.*\n';
    
    return comment;
  }
}

// Mock validator for local testing
class MockGitHubValidator {
  constructor(options) {
    this.options = options;
    // Import the real rule parser with correct path
    const Strapi12RulesParser = require(ruleParserPath);
    this.ruleParser = new Strapi12RulesParser(styleRulesPath);
    this.diffParser = new GitHubURLDiffParser({ verbose: options.verbose });
  }

  async validateFileWithDiff(filePath, diffInfo) {
    try {
      if (diffInfo.isDeletedFile) {
        return [];
      }

      if (!fs.existsSync(filePath)) {
        console.log(`    ⚠️  File not found locally: ${filePath}`);
        return [{
          file: filePath,
          line: 1,
          message: `File not found locally (this is normal for local testing)`,
          severity: 'warning'
        }];
      }

      const originalContent = fs.readFileSync(filePath, 'utf8');
      
      // Generate filtered content
      const { content: filteredContent, lineMapping, changedLines } = 
        this.diffParser.generateFilteredContent(originalContent, diffInfo);

      // Apply all rules
      const allIssues = this.applyAllRules(filteredContent, filePath, { lineMapping, changedLines, diffInfo });
      
      // Filter for changed lines only
      return this.filterIssuesForChangedLines(allIssues, changedLines, lineMapping, diffInfo);

    } catch (error) {
      return [{
        file: filePath,
        line: 1,
        message: `Validation error: ${error.message}`,
        severity: 'error'
      }];
    }
  }

  applyAllRules(content, filePath, diffContext) {
    const allIssues = [];
    const allRules = this.ruleParser.getAllRules();

    allRules.forEach(rule => {
      try {
        const issues = rule.validator(content, filePath);
        issues.forEach(issue => {
          issue.ruleId = rule.id;
          // Map line numbers if we have diff context
          if (diffContext && diffContext.lineMapping) {
            const originalLine = diffContext.lineMapping[issue.line];
            if (originalLine) {
              issue.line = originalLine;
            }
          }
        });
        allIssues.push(...issues);
      } catch (error) {
        // Ignore rule errors for simplicity
      }
    });

    return allIssues;
  }

  filterIssuesForChangedLines(issues, changedLines, lineMapping, diffInfo) {
    if (!changedLines || diffInfo.isNewFile) {
      return issues;
    }

    const actuallyChangedLines = new Set([
      ...changedLines.added,
      ...changedLines.modified
    ]);

    return issues.filter(issue => {
      if (actuallyChangedLines.has(issue.line)) {
        return true;
      }
      
      // Simple proximity check for contextual rules
      for (const changedLine of actuallyChangedLines) {
        if (Math.abs(issue.line - changedLine) <= 2) {
          return true;
        }
      }
      
      return false;
    });
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node test-local-diff.js <diff-file> [pr-number]');
    console.log('');
    console.log('Examples:');
    console.log('  node test-local-diff.js pr-2439.diff');
    console.log('  node test-local-diff.js pr-2439.diff 2439');
    console.log('');
    console.log('To get a diff file:');
    console.log('  curl https://patch-diff.githubusercontent.com/raw/strapi/documentation/pull/2439.diff > pr-2439.diff');
    process.exit(1);
  }

  const diffFile = args[0];
  const prNumber = args[1] ? parseInt(args[1]) : null;

  const tester = new LocalDiffTester(diffFile, prNumber);
  await tester.testValidation();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = LocalDiffTester;