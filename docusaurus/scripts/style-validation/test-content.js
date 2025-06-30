#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Dynamic path resolution
const scriptDir = __dirname;
const ruleParserPath = path.join(scriptDir, 'rule-parser');
const styleRulesPath = path.join(scriptDir, 'style-rules.yml');

/**
 * Flexible content tester for Strapi 12 Rules
 * Usage:
 *   node test-content.js --file path/to/file.md
 *   node test-content.js --text "Some text to test"
 *   node test-content.js --stdin (then paste content)
 */
class FlexibleContentTester {
  constructor() {
    try {
      const Strapi12RulesParser = require(ruleParserPath);
      this.ruleParser = new Strapi12RulesParser(styleRulesPath);
      console.log('✅ Strapi 12 Rules loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load rules:', error.message);
      process.exit(1);
    }
  }

  async testFile(filePath) {
    console.log('🎯 File Validation Test');
    console.log('======================');
    console.log(`📄 File: ${filePath}`);
    console.log('');

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    await this.validateContent(content, filePath);
  }

  async testText(text) {
    console.log('🎯 Text Validation Test');
    console.log('======================');
    console.log(`📝 Content length: ${text.length} characters`);
    console.log(`📄 Lines: ${text.split('\n').length}`);
    console.log('');

    await this.validateContent(text, '<text-input>');
  }

  async testStdin() {
    console.log('🎯 Interactive Text Validation');
    console.log('==============================');
    console.log('📝 Paste your content below (Ctrl+D when finished):');
    console.log('');

    let content = '';
    process.stdin.setEncoding('utf8');
    
    for await (const chunk of process.stdin) {
      content += chunk;
    }

    if (content.trim() === '') {
      console.log('❌ No content provided');
      return;
    }

    console.log(`✅ Content received (${content.length} characters)`);
    console.log('');
    await this.validateContent(content, '<stdin>');
  }

  async validateContent(content, source) {
    try {
      const allRules = this.ruleParser.getAllRules();
      console.log(`🔍 Applying ${allRules.length} validation rules...`);
      console.log('');

      let totalIssues = 0;
      const issuesByRule = {};
      const issuesBySeverity = { error: [], warning: [], suggestion: [] };

      // Apply all rules
      allRules.forEach(rule => {
        try {
          const issues = rule.validator(content, source);
          
          if (issues.length > 0) {
            issuesByRule[rule.id] = {
              rule: rule,
              issues: issues
            };
            
            issues.forEach(issue => {
              issue.ruleId = rule.id;
              issue.ruleDescription = rule.description;
              totalIssues++;
              
              if (issuesBySeverity[issue.severity]) {
                issuesBySeverity[issue.severity].push(issue);
              } else {
                issuesBySeverity.warning.push(issue);
              }
            });
          }
        } catch (error) {
          console.log(`⚠️  Rule ${rule.id} failed: ${error.message}`);
        }
      });

      // Display results
      this.displayResults(totalIssues, issuesBySeverity, issuesByRule, source);
      
      // Save results
      const results = {
        timestamp: new Date().toISOString(),
        source: source,
        contentLength: content.length,
        totalIssues: totalIssues,
        issuesBySeverity: {
          errors: issuesBySeverity.error.length,
          warnings: issuesBySeverity.warning.length,
          suggestions: issuesBySeverity.suggestion.length
        },
        issues: issuesBySeverity
      };
      
      fs.writeFileSync('content-validation-results.json', JSON.stringify(results, null, 2));
      console.log('💾 Detailed results saved to: content-validation-results.json');

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
    }
  }

  displayResults(totalIssues, issuesBySeverity, issuesByRule, source) {
    console.log('📊 Validation Results');
    console.log('====================');
    console.log(`Total issues found: ${totalIssues}`);
    console.log(`🚨 Critical errors: ${issuesBySeverity.error.length}`);
    console.log(`⚠️  Warnings: ${issuesBySeverity.warning.length}`);
    console.log(`💡 Suggestions: ${issuesBySeverity.suggestion.length}`);
    console.log('');

    if (totalIssues === 0) {
      console.log('🎉 Perfect! Your content follows all 12 Strapi rules!');
      console.log('');
      return;
    }

    // Show critical errors first
    if (issuesBySeverity.error.length > 0) {
      console.log('🚨 CRITICAL ERRORS (must fix):');
      console.log('================================');
      issuesBySeverity.error.forEach(issue => {
        console.log(`📍 Line ${issue.line}: ${issue.message}`);
        if (issue.suggestion) {
          console.log(`   💡 ${issue.suggestion}`);
        }
        console.log(`   📚 Rule: ${issue.ruleId}`);
        console.log('');
      });
    }

    // Show warnings
    if (issuesBySeverity.warning.length > 0) {
      console.log('⚠️  WARNINGS (should address):');
      console.log('===============================');
      issuesBySeverity.warning.forEach(issue => {
        console.log(`📍 Line ${issue.line}: ${issue.message}`);
        if (issue.suggestion) {
          console.log(`   💡 ${issue.suggestion}`);
        }
        console.log(`   📚 Rule: ${issue.ruleId}`);
        console.log('');
      });
    }

    // Show suggestions
    if (issuesBySeverity.suggestion.length > 0) {
      console.log('💡 SUGGESTIONS (nice to have):');
      console.log('===============================');
      issuesBySeverity.suggestion.forEach(issue => {
        console.log(`📍 Line ${issue.line}: ${issue.message}`);
        if (issue.suggestion) {
          console.log(`   💡 ${issue.suggestion}`);
        }
        console.log(`   📚 Rule: ${issue.ruleId}`);
        console.log('');
      });
    }

    // Summary by rule
    console.log('📋 Issues by Rule:');
    console.log('==================');
    Object.entries(issuesByRule).forEach(([ruleId, data]) => {
      console.log(`${data.rule.category === 'critical' ? '🚨' : '⚠️'} ${ruleId}: ${data.issues.length} issue(s)`);
    });
    console.log('');

    // GitHub-style comment
    console.log('📝 GitHub Comment Preview:');
    console.log('===========================');
    const comment = this.generateGitHubComment(totalIssues, issuesBySeverity);
    console.log(comment);
  }

  generateGitHubComment(totalIssues, issuesBySeverity) {
    let comment = `## 🎯 Strapi Documentation Style Review (LOCAL TEST)\n\n`;
    comment += `*Automated analysis using Strapi's 12 Rules of Technical Writing*\n\n`;
    
    comment += '### 📊 Analysis Results\n';
    comment += `- **Total issues:** ${totalIssues}\n`;
    comment += `- **Critical errors:** ${issuesBySeverity.error.length} 🚨\n`;
    comment += `- **Warnings:** ${issuesBySeverity.warning.length} ⚠️\n`;
    comment += `- **Suggestions:** ${issuesBySeverity.suggestion.length} 💡\n\n`;
    
    if (totalIssues === 0) {
      comment += '🎉 **Perfect!** Your content follows all 12 technical writing rules.\n\n';
    } else {
      comment += `⚠️ Found ${totalIssues} issues that should be addressed.\n\n`;
      
      // Show top 3 issues
      const allIssues = [...issuesBySeverity.error, ...issuesBySeverity.warning, ...issuesBySeverity.suggestion];
      if (allIssues.length > 0) {
        comment += '**Top Issues:**\n';
        allIssues.slice(0, 3).forEach(issue => {
          comment += `- Line ${issue.line}: ${issue.message}\n`;
        });
        comment += '\n';
      }
    }
    
    comment += '**📚 Resources:**\n';
    comment += '- [Strapi\'s 12 Rules of Technical Writing](https://strapi.notion.site/12-Rules-of-Technical-Writing-c75e080e6b19432287b3dd61c2c9fa04)\n';
    comment += '- [Documentation Style Guide](https://github.com/strapi/documentation/blob/main/STYLE_GUIDE.pdf)\n\n';
    comment += '*🧪 This is a local test simulation.*\n';
    
    return comment;
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const tester = new FlexibleContentTester();
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('🎯 Strapi Content Validation Tester');
    console.log('====================================');
    console.log('');
    console.log('Usage:');
    console.log('  node test-content.js --file <path>     Test a specific file');
    console.log('  node test-content.js --text "<text>"   Test provided text');
    console.log('  node test-content.js --stdin           Test content from stdin');
    console.log('');
    console.log('Examples:');
    console.log('  node test-content.js --file docs/api/content-types.md');
    console.log('  node test-content.js --text "This is easy to understand"');
    console.log('  echo "Some content" | node test-content.js --stdin');
    console.log('  node test-content.js --stdin  # then paste content manually');
    console.log('');
    return;
  }

  if (args.includes('--file') || args.includes('-f')) {
    const fileIndex = args.findIndex(arg => arg === '--file' || arg === '-f');
    const filePath = args[fileIndex + 1];
    
    if (!filePath) {
      console.error('❌ Please provide a file path after --file');
      return;
    }
    
    await tester.testFile(filePath);
    
  } else if (args.includes('--text') || args.includes('-t')) {
    const textIndex = args.findIndex(arg => arg === '--text' || arg === '-t');
    const text = args[textIndex + 1];
    
    if (!text) {
      console.error('❌ Please provide text after --text');
      return;
    }
    
    await tester.testText(text);
    
  } else if (args.includes('--stdin') || args.includes('-s')) {
    await tester.testStdin();
    
  } else {
    console.error('❌ Unknown option. Use --help for usage information.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = FlexibleContentTester;