#!/usr/bin/env node

/**
 * Strapi documentation style validation (12 Rules subset).
 * Public API unchanged — implementation uses Vale via scripts/vale/run.sh.
 */

const path = require('path');
const { DOCUSAURUS_DIR, validateFiles } = require('./lib/vale-runner');
const { printResults, writeResultsJson } = require('./lib/console-report');

class DocumentationValidator {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      files: options.files || null,
    };

    this.results = {
      errors: [],
      warnings: [],
      suggestions: [],
      summary: {
        filesProcessed: 0,
        totalIssues: 0,
        criticalIssues: 0,
      },
    };
  }

  log(message, level = 'info') {
    if (this.options.verbose || level === 'error') {
      const timestamp = new Date().toISOString().substring(11, 19);
      const prefix =
        {
          info: 'ℹ️',
          debug: '🔍',
          warn: '⚠️',
          error: '❌',
          success: '✅',
        }[level] || 'ℹ️';

      console.log(`[${timestamp}] ${prefix} ${message}`);
    }
  }

  async validate() {
    this.log('🚀 Starting Strapi documentation validation...');

    const files = this.options.files && this.options.files.length > 0 ? this.options.files : null;

    if (files) {
      this.log(`🎯 Validating specific files: ${files.join(', ')}`, 'debug');
    } else {
      this.log('📁 No specific files provided, scanning docs directory...', 'debug');
    }

    try {
      this.log('✅ Strapi 12 Rules loaded successfully (Vale)', 'info');
      const results = validateFiles(files, { cwd: DOCUSAURUS_DIR, verbose: this.options.verbose });
      this.results = results;
    } catch (error) {
      this.log(`❌ Validation failed: ${error.message}`, 'error');
      process.exit(1);
    }

    writeResultsJson(this.results, path.join(DOCUSAURUS_DIR, 'style-check-results.json'));
    this.log('📊 Validation Summary:', 'info');
    this.log(`   Files processed: ${this.results.summary.filesProcessed}`, 'info');
    this.log(`   Total issues: ${this.results.summary.totalIssues}`, 'info');
    this.log(`   🚨 Critical errors: ${this.results.errors.length}`, 'info');
    this.log(`   ⚠️  Warnings: ${this.results.warnings.length}`, 'info');
    this.log(`   💡 Suggestions: ${this.results.suggestions.length}`, 'info');

    printResults(this.results, { cwd: DOCUSAURUS_DIR });

    if (this.results.errors.length > 0) {
      process.exit(1);
    }

    process.exit(0);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    files: [],
  };

  for (const arg of args) {
    if (!arg.startsWith('--') && !arg.startsWith('-')) {
      options.files.push(arg);
    }
  }

  console.log(`🎯 Command line arguments: ${JSON.stringify(args)}`);
  console.log(`📁 Files to validate: ${JSON.stringify(options.files)}`);

  const validator = new DocumentationValidator(options);
  await validator.validate();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = DocumentationValidator;
