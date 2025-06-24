#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Simplified Rule Parser for Strapi's 12 Rules of Technical Writing
 * Focused on the most critical validations for quick implementation
 */
class Strapi12RulesParser {
  constructor(configPath) {
    this.config = this.loadConfig(configPath);
    this.parsedRules = [];
    this.parseRules();
  }

  loadConfig(configPath) {
    try {
      const fileContents = fs.readFileSync(configPath, 'utf8');
      return yaml.load(fileContents);
    } catch (error) {
      throw new Error(`Failed to load configuration: ${error.message}`);
    }
  }

  parseRules() {
    // Parse the most critical rules first
    this.parseCriticalRules();
    this.parseContentRules();
    this.parseStructureRules();
  }

  parseCriticalRules() {
    const criticalRules = this.config.critical_violations;
    if (!criticalRules) return;

    Object.entries(criticalRules).forEach(([ruleKey, ruleConfig]) => {
      if (!ruleConfig.enabled) return;

      const rule = this.createCriticalRule(ruleKey, ruleConfig);
      if (rule) this.parsedRules.push(rule);
    });
  }

  createCriticalRule(ruleKey, config) {
    switch (ruleKey) {
      case 'procedures_must_be_numbered':
        return {
          id: ruleKey,
          category: 'critical',
          description: config.rule,
          severity: 'error',
          validator: (content, filePath) => {
            const errors = [];
            
            // Clean content by removing React components and their props
            const cleanContent = this.cleanContentFromReactComponents(content);
            
            // Detect procedure indicators
            const procedurePatterns = [
              /follow these steps/gi,
              /to do this/gi,
              /procedure/gi,
              /instructions/gi,
              /how to.*:/gi,
              /steps to/gi,
              /first.*then.*next/gi,
              /1\..*2\..*3\./g  // Already has numbers - this is good!
            ];

            const hasProceduralContent = procedurePatterns.some(pattern => 
              pattern.test(cleanContent) && !/1\..*2\..*3\./.test(cleanContent)
            );

            if (hasProceduralContent) {
              // Check if content has numbered lists
              const hasNumberedLists = /^\d+\.\s+/gm.test(cleanContent);
              
              if (!hasNumberedLists) {
                const lineNumber = this.findLineWithPattern(content, procedurePatterns);
                errors.push({
                  file: filePath,
                  line: lineNumber,
                  message: 'CRITICAL: Step-by-step instructions must use numbered lists (Rule 7)',
                  severity: 'error',
                  rule: 'procedures_must_be_numbered',
                  suggestion: 'Convert instructions to numbered list format:\n1. First action\n2. Second action\n3. Third action'
                });
              }
            }

            return errors;
          }
        };

      case 'easy_difficult_words':
        return {
          id: ruleKey,
          category: 'critical',
          description: config.rule,
          severity: 'error',
          validator: (content, filePath) => {
            const errors = [];
            const forbiddenWords = config.words;
            
            // Clean content by removing React components and their props
            const cleanContent = this.cleanContentFromReactComponents(content);
            const lines = cleanContent.split('\n');

            forbiddenWords.forEach(word => {
              lines.forEach((line, index) => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                if (regex.test(line)) {
                  // Get the original line number by counting non-removed lines
                  const originalLineNumber = this.getOriginalLineNumber(content, line, index);
                  errors.push({
                    file: filePath,
                    line: originalLineNumber,
                    message: `CRITICAL: Never use "${word}" - it can discourage readers (Rule 6)`,
                    severity: 'error',
                    rule: 'easy_difficult_words',
                    suggestion: 'Remove subjective difficulty assessment and provide clear instructions instead'
                  });
                }
              });
            });

            return errors;
          }
        };

      case 'jokes_and_casual_tone':
        return {
          id: ruleKey,
          category: 'critical', 
          description: config.rule,
          severity: 'error',
          validator: (content, filePath) => {
            const errors = [];
            const casualPatterns = config.patterns;

            // Clean content by removing React components and their props
            const cleanContent = this.cleanContentFromReactComponents(content);

            casualPatterns.forEach(pattern => {
              const regex = new RegExp(pattern, 'gi');
              let match;

              while ((match = regex.exec(cleanContent)) !== null) {
                const lineNumber = cleanContent.substring(0, match.index).split('\n').length;
                const originalLineNumber = this.getOriginalLineNumber(content, cleanContent.split('\n')[lineNumber - 1], lineNumber - 1);
                errors.push({
                  file: filePath,
                  line: originalLineNumber,
                  message: 'CRITICAL: Maintain professional tone - avoid casual language (Rule 3)',
                  severity: 'error',
                  rule: 'jokes_and_casual_tone',
                  suggestion: 'Use professional, neutral language in technical documentation'
                });
              }
            });

            return errors;
          }
        };

      default:
        return null;
    }
  }

  parseContentRules() {
    const contentRules = this.config.content_rules;
    if (!contentRules) return;

    Object.entries(contentRules).forEach(([ruleKey, ruleConfig]) => {
      if (!ruleConfig.enabled) return;

      const rule = this.createContentRule(ruleKey, ruleConfig);
      if (rule) this.parsedRules.push(rule);
    });
  }

  createContentRule(ruleKey, config) {
    switch (ruleKey) {
      case 'minimize_pronouns':
        return {
          id: ruleKey,
          category: 'content',
          description: config.rule,
          severity: config.severity,
          validator: (content, filePath) => {
            const errors = [];
            const pronouns = config.discouraged_pronouns;
            
            // Clean content by removing React components and their props
            const cleanContent = this.cleanContentFromReactComponents(content);
            const lines = cleanContent.split('\n');

            lines.forEach((line, index) => {
              let pronounCount = 0;
              pronouns.forEach(pronoun => {
                const regex = new RegExp(`\\b${pronoun}\\b`, 'gi');
                const matches = line.match(regex);
                if (matches) pronounCount += matches.length;
              });

              if (pronounCount > (config.max_pronouns_per_paragraph || 3)) {
                const originalLineNumber = this.getOriginalLineNumber(content, line, index);
                errors.push({
                  file: filePath,
                  line: originalLineNumber,
                  message: `Too many pronouns (${pronounCount}) - avoid "you/we" in technical docs (Rule 11)`,
                  severity: config.severity,
                  rule: ruleKey,
                  suggestion: 'Focus on actions and explanations rather than addressing the reader directly'
                });
              }
            });

            return errors;
          }
        };

      case 'simple_english_vocabulary':
        return {
          id: ruleKey,
          category: 'content',
          description: config.rule,
          severity: config.severity,
          validator: (content, filePath) => {
            const errors = [];
            const complexWords = config.complex_words || [];
            const replacements = config.replacement_suggestions || {};

            // Clean content by removing React components and their props
            const cleanContent = this.cleanContentFromReactComponents(content);

            complexWords.forEach(word => {
              const regex = new RegExp(`\\b${word}\\b`, 'gi');
              let match;

              while ((match = regex.exec(cleanContent)) !== null) {
                const lineNumber = cleanContent.substring(0, match.index).split('\n').length;
                const originalLineNumber = this.getOriginalLineNumber(content, cleanContent.split('\n')[lineNumber - 1], lineNumber - 1);
                const suggestion = replacements[word] ? 
                  `Use "${replacements[word]}" instead of "${word}"` :
                  `Use simpler language instead of "${word}"`;

                errors.push({
                  file: filePath,
                  line: originalLineNumber,
                  message: `Complex word detected: "${word}" - stick to simple English (Rule 4)`,
                  severity: config.severity,
                  rule: ruleKey,
                  suggestion: suggestion
                });
              }
            });

            return errors;
          }
        };

      default:
        return null;
    }
  }

  parseStructureRules() {
    const structureRules = this.config.structure_rules;
    if (!structureRules) return;

    Object.entries(structureRules).forEach(([ruleKey, ruleConfig]) => {
      if (!ruleConfig.enabled) return;

      const rule = this.createStructureRule(ruleKey, ruleConfig);
      if (rule) this.parsedRules.push(rule);
    });
  }

  createStructureRule(ruleKey, config) {
    switch (ruleKey) {
      case 'use_bullet_lists':
        return {
          id: ruleKey,
          category: 'structure',
          description: config.rule,
          severity: config.severity,
          validator: (content, filePath) => {
            const errors = [];
            
            // Clean content by removing React components and their props
            const cleanContent = this.cleanContentFromReactComponents(content);
            
            // Detect inline enumerations like "features include A, B, C, and D"
            const enumerationPattern = /(\w+\s+(include|are|consists?\s+of))?\s*([A-Za-z]+,\s*[A-Za-z]+,\s*(and\s+)?[A-Za-z]+)/gi;
            let match;

            while ((match = enumerationPattern.exec(cleanContent)) !== null) {
              const lineNumber = cleanContent.substring(0, match.index).split('\n').length;
              const originalLineNumber = this.getOriginalLineNumber(content, cleanContent.split('\n')[lineNumber - 1], lineNumber - 1);
              
              // Count items in enumeration
              const items = match[3].split(',').length;
              
              if (items >= (config.max_inline_list_items || 3)) {
                errors.push({
                  file: filePath,
                  line: originalLineNumber,
                  message: `Long enumeration detected (${items} items) - use bullet list instead (Rule 8)`,
                  severity: config.severity,
                  rule: ruleKey,
                  suggestion: 'Convert to bullet list format:\n- Item 1\n- Item 2\n- Item 3'
                });
              }
            }

            return errors;
          }
        };

      default:
        return null;
    }
  }

  // Helper method to find line number for patterns
  findLineWithPattern(content, patterns) {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of patterns) {
        if (pattern.test(line)) {
          return i + 1;
        }
      }
    }
    
    return 1; // Default to first line if not found
  }

  // Helper method to clean content from React components and their properties
  cleanContentFromReactComponents(content) {
    let cleanContent = content;
    
    // Remove React components with their props (single line)
    // Matches: <ComponentName prop="value" prop2={value} />
    cleanContent = cleanContent.replace(/<[A-Z][a-zA-Z0-9]*[^>]*\/>/g, '');
    
    // Remove React components with opening and closing tags
    // Matches: <ComponentName prop="value">content</ComponentName>
    cleanContent = cleanContent.replace(/<[A-Z][a-zA-Z0-9]*[^>]*>.*?<\/[A-Z][a-zA-Z0-9]*>/gs, '');
    
    // Remove specific MDX components commonly used in documentation
    // Icon components: <Icon name="..." />
    cleanContent = cleanContent.replace(/<Icon[^>]*\/>/g, '');
    
    // Remove JSX expressions in curly braces that might contain words
    cleanContent = cleanContent.replace(/\{[^}]*\}/g, '');
    
    // Remove HTML attributes that might contain false positive words
    // Matches: name="pencil-simple", className="simple-class", etc.
    cleanContent = cleanContent.replace(/\w+="[^"]*"/g, '');
    cleanContent = cleanContent.replace(/\w+='[^']*'/g, '');
    
    return cleanContent;
  }

  // Helper method to get original line number after content cleaning
  getOriginalLineNumber(originalContent, cleanedLine, cleanedLineIndex) {
    const originalLines = originalContent.split('\n');
    
    // Try to find the line in original content by matching text
    for (let i = 0; i < originalLines.length; i++) {
      const originalLine = originalLines[i];
      const cleanedOriginalLine = this.cleanContentFromReactComponents(originalLine);
      
      if (cleanedOriginalLine.trim() === cleanedLine.trim()) {
        return i + 1;
      }
    }
    
    // Fallback: estimate based on cleaned line index
    return Math.min(cleanedLineIndex + 1, originalLines.length);
  }

  // Get all parsed rules
  getAllRules() {
    return this.parsedRules;
  }

  // Get rules by category
  getRulesByCategory(category) {
    return this.parsedRules.filter(rule => rule.category === category);
  }

  // Get critical rules only
  getCriticalRules() {
    return this.getRulesByCategory('critical');
  }
}

module.exports = Strapi12RulesParser;
