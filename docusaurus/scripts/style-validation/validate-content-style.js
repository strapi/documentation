#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const Strapi12RulesParser = require('./rule-parser');

class DocumentationValidator {
  constructor(options = {}) {
    this.options = {
      configPath: options.configPath || path.join(__dirname, 'style-rules.yml'),
      verbose: options.verbose || false,
      specificFiles: options.files || null
    };

    this.results = {
      errors: [],
      warnings: [],
      suggestions: [],
      summary: {
        filesProcessed: 0,
        totalIssues: 0,
        criticalIssues: 0
      }
    };

    // Initialize the rule parser
    try {
      this.ruleParser = new Strapi12RulesParser(this.options.configPath);
      this.log('✅ Strapi 12 Rules loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load rules:', error.message);
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
    this.log('🚀 Starting Strapi documentation validation...');

    const files = this.getFilesToValidate();
    this.log(`📁 Found ${files.length} files to validate`);

    if (files.length === 0) {
      this.log('⚠️ No files found to validate', 'warn');
      return this.results;
    }

    // Process each file
    for (const filePath of files) {
      await this.validateFile(filePath);
    }

    // Generate summary and report
    this.generateSummary();
    this.outputResults();

    return this.results;
  }

  getFilesToValidate() {
    if (this.options.specificFiles) {
      return this.options.specificFiles.filter(file => {
        if (!fs.existsSync(file)) {
          this.log(`⚠️ File not found: ${file}`, 'warn');
          return false;
        }
        return file.endsWith('.md') || file.endsWith('.mdx');
      });
    }

    // Get all markdown files in docs directory
    const docsPath = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(docsPath)) {
      this.log('❌ docs/ directory not found', 'error');
      return [];
    }

    const pattern = path.join(docsPath, '**/*.{md,mdx}');
    return glob.sync(pattern);
  }

  async validateFile(filePath) {
    this.log(`🔍 Validating: ${path.relative(process.cwd(), filePath)}`, 'debug');

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.results.summary.filesProcessed++;

      // Apply all rules
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

  applyAllRules(content, filePath) {
    const allIssues = [];
    const allRules = this.ruleParser.getAllRules();

    // Apply critical rules first
    const criticalRules = this.ruleParser.getCriticalRules();
    this.log(`🚨 Applying ${criticalRules.length} critical rules...`, 'debug');

    criticalRules.forEach(rule => {
      try {
        const issues = rule.validator(content, filePath);
        issues.forEach(issue => {
          issue.category = rule.category;
          issue.ruleId = rule.id;
          issue.ruleDescription = rule.description;
        });
        allIssues.push(...issues);
      } catch (error) {
        this.log(`❌ Error in critical rule ${rule.id}: ${error.message}`, 'error');
      }
    });

    // Apply other rules
    const otherRules = allRules.filter(rule => rule.category !== 'critical');
    this.log(`📋 Applying ${otherRules.length} additional rules...`, 'debug');

    otherRules.forEach(rule => {
      try {
        const issues = rule.validator(content, filePath);
        issues.forEach(issue => {
          issue.category = rule.category;
          issue.ruleId = rule.id;
          issue.ruleDescription = rule.description;
        });
        allIssues.push(...issues);
      } catch (error) {
        this.log(`❌ Error in rule ${rule.id}: ${error.message}`, 'error');
      }
    });

    return allIssues;
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
      console.log('\n🎉 All validations passed! Your documentation follows Strapi\'s 12 rules.\n');
      return;
    }

    console.log('\n📋 Strapi Documentation Validation Results\n');

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
    files: args.filter(arg => !arg.startsWith('--') && !arg.startsWith('-'))
  };

  const validator = new DocumentationValidator(options);
  await validator.validate();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DocumentationValidator;