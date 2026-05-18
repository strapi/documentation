const path = require('path');

function printResults(results, { cwd = process.cwd() } = {}) {
  const { errors, warnings, suggestions, summary } = results;

  if (summary.totalIssues === 0) {
    console.log("\n🎉 All validations passed! Your documentation follows Strapi's 12 rules.\n");
    return;
  }

  console.log('\n📋 Strapi Documentation Validation Results\n');

  if (errors.length > 0) {
    console.log('🚨 CRITICAL ERRORS (must fix):');
    errors.forEach((error) => {
      console.log(`  ❌ ${path.relative(cwd, error.file)}:${error.line}`);
      console.log(`     ${error.message}`);
      if (error.suggestion) {
        console.log(`     💡 ${error.suggestion}`);
      }
      console.log('');
    });
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS (should fix):');
    warnings.slice(0, 5).forEach((warning) => {
      console.log(`  ⚠️  ${path.relative(cwd, warning.file)}:${warning.line}`);
      console.log(`     ${warning.message}`);
      console.log('');
    });
    if (warnings.length > 5) {
      console.log(`     ... and ${warnings.length - 5} more warnings\n`);
    }
  }

  if (suggestions.length > 0) {
    console.log('💡 SUGGESTIONS (improvements):');
    suggestions.slice(0, 3).forEach((suggestion) => {
      console.log(`  💡 ${path.relative(cwd, suggestion.file)}:${suggestion.line}`);
      console.log(`     ${suggestion.message}`);
      console.log('');
    });
    if (suggestions.length > 3) {
      console.log(`     ... and ${suggestions.length - 3} more suggestions\n`);
    }
  }

  if (errors.length > 0) {
    console.log('💥 VALIDATION FAILED: Critical errors must be fixed before merging.\n');
  } else {
    console.log('✅ No critical errors found. Review warnings and suggestions.\n');
  }
}

function writeResultsJson(results, outputPath, extra = {}) {
  const fs = require('fs');
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: results.summary,
    issues: {
      errors: results.errors,
      warnings: results.warnings,
      suggestions: results.suggestions,
    },
    ...extra,
  };
  fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));
  return reportData;
}

module.exports = { printResults, writeResultsJson };
