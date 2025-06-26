#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

/**
 * GitHub Diff Parser using GitHub's .diff URL
 * Much simpler and more reliable than git commands
 */
class GitHubURLDiffParser {
  constructor(options = {}) {
    this.options = {
      contextLines: options.contextLines || 5,
      verbose: options.verbose || false
    };
  }

  log(message, level = 'info') {
    if (this.options.verbose || level === 'error') {
      const timestamp = new Date().toISOString().substring(11, 19);
      const prefix = {
        info: 'ℹ️',
        debug: '🔍',
        warn: '⚠️',
        error: '❌'
      }[level] || 'ℹ️';
      
      console.log(`[${timestamp}] ${prefix} [GitHubDiffParser] ${message}`);
    }
  }

  /**
   * Fetch diff from GitHub's .diff URL
   */
  async fetchPRDiff(repoOwner, repoName, prNumber) {
    const url = `https://patch-diff.githubusercontent.com/raw/${repoOwner}/${repoName}/pull/${prNumber}.diff`;
    
    this.log(`Fetching diff from: ${url}`, 'debug');

    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          if (response.statusCode === 200) {
            this.log(`Successfully fetched diff (${data.length} characters)`, 'debug');
            resolve(data);
          } else {
            reject(new Error(`HTTP ${response.statusCode}: Failed to fetch PR diff`));
          }
        });

      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Parse the GitHub diff content
   */
  parsePRDiff(diffContent) {
    const result = {
      files: {},
      totalFiles: 0,
      totalAdditions: 0,
      totalDeletions: 0
    };

    // Split by files
    const fileDiffs = this.splitDiffByFile(diffContent);
    
    fileDiffs.forEach(({ filePath, diffContent: singleFileDiff, isNewFile, isDeletedFile }) => {
      if (this.isMarkdownFile(filePath)) {
        result.files[filePath] = this.parseSingleFileDiff(singleFileDiff, filePath, isNewFile, isDeletedFile);
        result.totalFiles++;
      }
    });

    this.log(`Parsed ${result.totalFiles} markdown files from PR diff`, 'debug');
    
    return result;
  }

  /**
   * Check if file is markdown
   */
  isMarkdownFile(filePath) {
    return /\.(md|mdx)$/i.test(filePath);
  }

  /**
   * Split diff into individual file changes
   */
  splitDiffByFile(diffContent) {
    const lines = diffContent.split('\n');
    const fileDiffs = [];
    let currentFile = null;
    let currentDiff = [];
    let isNewFile = false;
    let isDeletedFile = false;

    for (const line of lines) {
      if (line.startsWith('diff --git')) {
        // Save previous file
        if (currentFile && currentDiff.length > 0) {
          fileDiffs.push({
            filePath: this.cleanFilePath(currentFile),
            diffContent: currentDiff.join('\n'),
            isNewFile,
            isDeletedFile
          });
        }
        
        // Extract file path from: diff --git a/docs/file.md b/docs/file.md
        const match = line.match(/diff --git a\/(.+) b\/(.+)/);
        currentFile = match ? match[2] : null; // Use 'b' path (new version)
        currentDiff = [line];
        isNewFile = false;
        isDeletedFile = false;
      } else if (line.startsWith('new file mode')) {
        isNewFile = true;
        currentDiff.push(line);
      } else if (line.startsWith('deleted file mode')) {
        isDeletedFile = true;
        currentDiff.push(line);
      } else {
        currentDiff.push(line);
      }
    }

    // Don't forget the last file
    if (currentFile && currentDiff.length > 0) {
      fileDiffs.push({
        filePath: this.cleanFilePath(currentFile),
        diffContent: currentDiff.join('\n'),
        isNewFile,
        isDeletedFile
      });
    }

    return fileDiffs;
  }

  /**
   * Clean file path (remove docusaurus/ prefix if present)
   */
  cleanFilePath(filePath) {
    return filePath.replace(/^docusaurus\//, '');
  }

  /**
   * Parse a single file's diff
   */
  parseSingleFileDiff(diffContent, filePath, isNewFile, isDeletedFile) {
    const result = {
      filePath,
      isNewFile,
      isDeletedFile,
      addedLines: new Set(),
      modifiedLines: new Set(),
      contextLines: new Set(),
      deletedLines: new Set(),
      chunks: []
    };

    if (isDeletedFile) {
      this.log(`File deleted: ${filePath}`, 'debug');
      return result;
    }

    if (isNewFile) {
      this.log(`New file: ${filePath}`, 'debug');
      // For new files, we'll analyze the entire content
      result.analyzeEntireFile = true;
      return result;
    }

    // Parse diff chunks
    const chunks = this.extractDiffChunks(diffContent);
    
    chunks.forEach(chunk => {
      const parsedChunk = this.parseChunk(chunk);
      result.chunks.push(parsedChunk);
      
      // Aggregate line numbers
      parsedChunk.addedLines.forEach(line => result.addedLines.add(line));
      parsedChunk.modifiedLines.forEach(line => result.modifiedLines.add(line));
      parsedChunk.contextLines.forEach(line => result.contextLines.add(line));
      parsedChunk.deletedLines.forEach(line => result.deletedLines.add(line));
    });

    this.log(`File ${filePath}: ${result.addedLines.size} added, ${result.deletedLines.size} deleted lines`, 'debug');
    
    return result;
  }

  /**
   * Extract diff chunks from diff content
   */
  extractDiffChunks(diffContent) {
    const lines = diffContent.split('\n');
    const chunks = [];
    let currentChunk = [];
    let inChunk = false;

    for (const line of lines) {
      if (line.startsWith('@@')) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.join('\n'));
        }
        currentChunk = [line];
        inChunk = true;
        continue;
      }

      if (inChunk) {
        currentChunk.push(line);
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'));
    }

    return chunks;
  }

  /**
   * Parse a single diff chunk
   */
  parseChunk(chunkContent) {
    const lines = chunkContent.split('\n');
    const headerLine = lines[0];
    
    // Parse chunk header: @@ -10,6 +10,8 @@
    const headerMatch = headerLine.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
    if (!headerMatch) {
      this.log(`Invalid chunk header: ${headerLine}`, 'warn');
      return {
        addedLines: new Set(),
        modifiedLines: new Set(), 
        contextLines: new Set(),
        deletedLines: new Set()
      };
    }

    const [, oldStart, oldCount = '1', newStart, newCount = '1'] = headerMatch;
    
    const result = {
      oldStart: parseInt(oldStart),
      oldCount: parseInt(oldCount),
      newStart: parseInt(newStart),
      newCount: parseInt(newCount),
      addedLines: new Set(),
      modifiedLines: new Set(),
      contextLines: new Set(),
      deletedLines: new Set()
    };

    let currentNewLine = result.newStart;
    let currentOldLine = result.oldStart;

    // Process chunk content (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('+')) {
        // Added line
        result.addedLines.add(currentNewLine);
        this.addContextAroundLine(currentNewLine, result.contextLines);
        currentNewLine++;
      } else if (line.startsWith('-')) {
        // Deleted line
        result.deletedLines.add(currentOldLine);
        currentOldLine++;
      } else if (line.startsWith(' ') || line === '') {
        // Context line (unchanged)
        result.contextLines.add(currentNewLine);
        currentNewLine++;
        currentOldLine++;
      }
    }

    return result;
  }

  /**
   * Add context lines around a changed line
   */
  addContextAroundLine(lineNumber, contextSet) {
    const start = Math.max(1, lineNumber - this.options.contextLines);
    const end = lineNumber + this.options.contextLines;
    
    for (let i = start; i <= end; i++) {
      contextSet.add(i);
    }
  }

  /**
   * Generate filtered content for validation
   */
  generateFilteredContent(originalContent, diffInfo) {
    if (diffInfo.analyzeEntireFile || diffInfo.isNewFile) {
      const lines = originalContent.split('\n');
      const lineMapping = {};
      
      for (let i = 0; i < lines.length; i++) {
        lineMapping[i + 1] = i + 1;
      }

      return {
        content: originalContent,
        lineMapping,
        changedLines: {
          added: diffInfo.addedLines,
          modified: diffInfo.modifiedLines,
          context: diffInfo.contextLines
        }
      };
    }

    const lines = originalContent.split('\n');
    const linesToInclude = new Set([
      ...diffInfo.addedLines,
      ...diffInfo.modifiedLines,
      ...diffInfo.contextLines
    ]);

    // Expand for contextual rules
    const expandedLines = this.expandForContextualRules(lines, linesToInclude);
    
    const filteredLines = [];
    const lineMapping = {};
    let filteredLineNumber = 1;

    expandedLines.forEach(originalLineNumber => {
      if (originalLineNumber > 0 && originalLineNumber <= lines.length) {
        filteredLines.push(lines[originalLineNumber - 1]);
        lineMapping[filteredLineNumber] = originalLineNumber;
        filteredLineNumber++;
      }
    });

    return {
      content: filteredLines.join('\n'),
      lineMapping,
      changedLines: {
        added: diffInfo.addedLines,
        modified: diffInfo.modifiedLines,
        context: diffInfo.contextLines
      }
    };
  }

  /**
   * Expand line selection for contextual rules
   */
  expandForContextualRules(lines, linesToInclude) {
    const expandedLines = new Set(linesToInclude);
    
    linesToInclude.forEach(lineNum => {
      const paragraphRange = this.findParagraphRange(lines, lineNum);
      
      for (let i = paragraphRange.start; i <= paragraphRange.end; i++) {
        expandedLines.add(i);
      }
    });
    
    return Array.from(expandedLines).sort((a, b) => a - b);
  }

  /**
   * Find paragraph boundaries
   */
  findParagraphRange(lines, lineNumber) {
    let start = lineNumber;
    let end = lineNumber;
    
    // Go backwards to find paragraph start
    while (start > 1) {
      const prevLine = lines[start - 2];
      if (!prevLine || prevLine.trim() === '') {
        break;
      }
      start--;
    }
    
    // Go forwards to find paragraph end
    while (end < lines.length) {
      const nextLine = lines[end];
      if (!nextLine || nextLine.trim() === '') {
        break;
      }
      end++;
    }
    
    return { start, end };
  }
}

module.exports = GitHubURLDiffParser;