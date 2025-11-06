#!/usr/bin/env node

// Prefer optional deps; fall back to built-ins for sandboxed runs
let fs = null;
try {
  fs = require('fs-extra');
} catch (e) {
  fs = require('fs');
  // polyfills to mimic fs-extra subset used here
  fs.ensureDir = async (dir) => fs.promises.mkdir(dir, { recursive: true });
  fs.pathExistsSync = (p) => fs.existsSync(p);
  fs.writeFile = fs.promises.writeFile.bind(fs.promises);
  fs.readFile = fs.promises.readFile.bind(fs.promises);
}
const path = require('path');

let matter = null;
try {
  matter = require('gray-matter');
} catch (e) {
  // Minimal frontmatter parser fallback
  matter = (raw) => {
    if (raw.startsWith('---')) {
      const end = raw.indexOf('\n---', 3);
      if (end !== -1) {
        const body = raw.slice(end + 4);
        return { data: {}, content: body };
      }
    }
    return { data: {}, content: raw };
  };
}

const DEFAULT_DOCS = [
  'cms/admin-panel-customization/bundlers',
  'cms/backend-customization/middlewares',
  'cms/features/api-tokens',
];

const DEFAULT_OUTPUT = path.join('static', 'llms-code.txt');
const BASE_URL = 'https://docs.strapi.io';
const HEADING_REGEX = /^(#{1,6})\s+(.*)/;

const cleanInlineText = (value) => {
  if (!value) {
    return '';
  }

  return value
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const summarizeDescription = (raw, fallback) => {
  const cleaned = cleanInlineText(raw)
    .replace(/^[0-9]+[.)]\s*/, '')
    .replace(/^[-*•]\s*/, '')
    .trim();

  if (!cleaned || !/[a-zA-Z]/.test(cleaned)) {
    return { description: fallback, useCase: null, fallbackUsed: true };
  }

  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  const description = (sentences[0] || cleaned).trim();
  let useCase = null;

  for (const sentence of sentences.slice(1)) {
    const lower = sentence.toLowerCase();
    if (lower.includes('use ') || lower.includes('when ') || lower.includes('recommended')) {
      useCase = sentence.trim();
      break;
    }
  }

  return { description, useCase, fallbackUsed: false };
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const docs = [];
  let output = DEFAULT_OUTPUT;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === '--docs') {
      const value = args[i + 1];
      i += 1;
      if (value) {
        value.split(',').map((item) => item.trim()).filter(Boolean).forEach((item) => docs.push(item));
      }
    } else if (arg === '--output') {
      const value = args[i + 1];
      i += 1;
      if (value) {
        output = value;
      }
    } else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node generate-llms-code.js [--docs docA,docB] [--output path/to/file]');
      process.exit(0);
    } else {
      docs.push(arg);
    }
  }

  return {
    docs: docs.length > 0 ? docs : DEFAULT_DOCS,
    output,
  };
};

class DocusaurusLlmsCodeGenerator {
  constructor(config = {}) {
    this.docsDir = config.docsDir || 'docs';
    this.sidebarPath = config.sidebarPath || 'sidebars.js';
    this.outputPath = config.outputPath || DEFAULT_OUTPUT;
    this.docIds = config.docIds || DEFAULT_DOCS;
  }

  normalizeTitlePath(value) {
    if (!value || typeof value !== 'string') return null;
    let v = value.trim();
    if (/^path\s*:/i.test(v)) {
      v = v.replace(/^path\s*:\s*/i, '');
    }
    if (v.includes(' or ')) {
      v = v.split(' or ')[0].trim();
    }
    return v || null;
  }

  parseFenceInfo(info = '') {
    const options = {};
    if (!info) {
      return { language: '', options };
    }

    const tokens = info.split(/\s+/).filter(Boolean);
    const language = tokens.shift() || '';

    tokens.forEach((token) => {
      const [key, rawValue] = token.split('=');
      if (!key) {
        return;
      }
      if (rawValue === undefined) {
        options[key] = true;
        return;
      }
      const value = rawValue.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
      options[key] = value;
    });

    return { language, options };
  }

  async generate() {
    try {
      console.log('🔍 Collecting code snippets...');

      const pages = [];

      for (const docId of this.docIds) {
        const filePath = this.findDocFile(docId);
        if (!filePath) {
          console.warn(`⚠️  Unable to locate file for ${docId}`);
          continue;
        }

        const parsed = await this.parseDocument(filePath);
        const fm = parsed.data || parsed.frontmatter || {};
        const title = fm.title || this.deriveTitleFromId(docId);
        const snippets = this.extractCodeSnippets(docId, title, parsed.content);

        if (snippets.length === 0) {
          console.warn(`ℹ️  Skipping ${docId}: no code snippets found.`);
          continue;
        }

        pages.push({ docId, title, snippets });
      }

      if (pages.length === 0) {
        console.warn('⚠️  No pages with code snippets were collected.');
      }

      const output = this.formatOutput(pages);

      await fs.ensureDir(path.dirname(this.outputPath));
      await fs.writeFile(this.outputPath, output, 'utf-8');

      console.log(`✅ Wrote ${this.outputPath}`);
    } catch (error) {
      console.error('❌ Error while generating llms-code:', error);
      throw error;
    }
  }

  findDocFile(docId) {
    const candidates = [
      path.join(this.docsDir, `${docId}.md`),
      path.join(this.docsDir, `${docId}.mdx`),
      path.join(this.docsDir, docId, 'index.md'),
      path.join(this.docsDir, docId, 'index.mdx'),
    ];

    for (const candidate of candidates) {
      if (fs.pathExistsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  async parseDocument(filePath) {
    const raw = await fs.readFile(filePath, 'utf-8');
    return matter(raw);
  }

  deriveTitleFromId(docId) {
    const parts = docId.split('/');
    return parts[parts.length - 1]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }

  formatLanguageName(language = '') {
    const lower = language.toLowerCase();
    switch (lower) {
      case 'js':
      case 'javascript':
        return 'JavaScript';
      case 'ts':
      case 'typescript':
        return 'TypeScript';
      case 'bash':
      case 'sh':
        return 'Bash';
      case 'yaml':
      case 'yml':
        return 'YAML';
      case 'json':
        return 'JSON';
      case 'tsx':
        return 'TSX';
      case 'jsx':
        return 'JSX';
      default:
        return language.toUpperCase();
    }
  }

  buildFallbackDescription(snippet) {
    const langLabel = snippet.language ? this.formatLanguageName(snippet.language) : 'code';
    const section = snippet.section || 'this section';
    return `Example showing how to work with ${section} using ${langLabel}.`;
  }

  currentSection(sections, defaultTitle) {
    if (!sections || sections.length === 0) {
      return defaultTitle;
    }
    return sections[sections.length - 1];
  }

  extractContextDescription(buffer, sections, defaultTitle) {
    const descriptionLines = [];

    for (let index = buffer.length - 1; index >= 0 && descriptionLines.length < 5; index -= 1) {
      const entry = buffer[index];

      if (entry === '\n') {
        if (descriptionLines.length > 0) {
          break;
        }
        continue;
      }

      if (entry.startsWith('```')) {
        break;
      }

      if (entry.trim().startsWith('#')) {
        break;
      }

      if (entry.trim()) {
        descriptionLines.push(entry);
      }
    }

    descriptionLines.reverse();
    const rawDescription = descriptionLines.join('\n');
    const fallback = `Code example from "${this.currentSection(sections, defaultTitle)}"`;

    return summarizeDescription(rawDescription, fallback);
  }

  extractCodeSnippets(docId, title, content) {
    const sections = [];
    const contextBuffer = [];
    const snippets = [];

    let inCode = false;
    let codeLanguage = '';
    let codeLines = [];

    const lines = content.split('\n');

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('```')) {
        const info = trimmed.slice(3).trim();
        const { language, options } = this.parseFenceInfo(info);
        if (!inCode) {
          inCode = true;
          codeLines = [];
          codeLanguage = language || '';

          const { description, useCase, fallbackUsed } = this.extractContextDescription(
            contextBuffer,
            sections,
            title,
          );

          snippets.push({
            section: this.currentSection(sections, title),
            language: codeLanguage,
            options,
            description,
            useCase,
            fallbackUsed,
            code: null,
            filePath: this.normalizeTitlePath(options?.title) || null,
            context: [...contextBuffer],
          });
        } else {
          inCode = false;
          if (snippets.length > 0) {
            const current = snippets[snippets.length - 1];
            current.code = codeLines.join('\n').trimEnd();
            if (!current.filePath) {
              const titleAttr = this.normalizeTitlePath(current.options?.title);
              if (titleAttr) {
                current.filePath = titleAttr;
              } else {
                // Prefer nearby "path:" hints before generic filename regex
                const ctxPath = this.inferFilePathFromContext(current.context, { preferHints: true });
                current.filePath = ctxPath;
              }
            }
          }
          codeLines = [];
          codeLanguage = '';
        }
        return;
      }

      if (inCode) {
        codeLines.push(line);
        return;
      }

      const headingMatch = trimmed.match(HEADING_REGEX);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const headingText = cleanInlineText(headingMatch[2]) || `Heading level ${level}`;

        while (sections.length >= level) {
          sections.pop();
        }

        sections.push(headingText);
        contextBuffer.push('\n');
        return;
      }

      if (trimmed === '') {
        contextBuffer.push('\n');
      } else {
        contextBuffer.push(trimmed);
      }

      if (contextBuffer.length > 50) {
        contextBuffer.splice(0, contextBuffer.length - 50);
      }
    });

    return snippets.filter((snippet) => Boolean(snippet.code));
  }

  deriveSnippetTitle(snippet, index) {
    const baseDescription = snippet.description || '';

    if (!snippet.fallbackUsed && baseDescription) {
      const sentence = baseDescription.split(/(?<=[.!?])/)[0].trim();
      if (sentence) {
        return sentence.length > 80 ? `${sentence.slice(0, 77)}…` : sentence;
      }
    }

    if (snippet.language) {
      const langName = this.formatLanguageName(snippet.language);
      return `Code example ${index + 1}: ${langName} version`;
    }

    return `Code example ${index + 1}`;
  }

  formatOutput(pages) {
    const lines = [];

    pages.forEach((page) => {
      lines.push(`# ${page.title}`);
      lines.push(`Source: ${BASE_URL}/${page.docId}`);
      lines.push('');

      const snippetsBySection = page.snippets.reduce((acc, snippet) => {
        if (!acc.has(snippet.section)) {
          acc.set(snippet.section, []);
        }
        acc.get(snippet.section).push(snippet);
        return acc;
      }, new Map());

      snippetsBySection.forEach((sectionSnippets, sectionName) => {
        lines.push(`## ${sectionName}`);
        lines.push('');

        const groups = this.groupVariantSnippets(sectionSnippets);

        groups.forEach((group, index) => {
          const primary = group.find((snippet) => !snippet.fallbackUsed) || group[0];
          const description = primary.fallbackUsed
            ? this.buildFallbackDescription(primary)
            : primary.description;

          lines.push(`### Example ${index + 1}`);
          lines.push(`Description: ${description}`);

          const primaryFile = primary.filePath || this.inferFilePathFromContext(primary.context);
          if (primaryFile) {
            lines.push(`File: ${primaryFile}`);
          }

          if (primary.useCase) {
            lines.push(`Use Case: ${primary.useCase}`);
          }

          lines.push('');

          group.forEach((variant, variantIndex) => {
            if (variantIndex > 0) {
              lines.push('---');
            }

            const language = variant.language
              ? `Language: ${this.formatLanguageName(variant.language)}`
              : 'Language: (unspecified)';
            lines.push(language);

            const resolvedFile = variant.filePath
              || this.inferFilePathFromContext(variant.context)
              || primaryFile;
            if (resolvedFile && resolvedFile !== primaryFile) {
              lines.push(`File: ${resolvedFile}`);
            }

            // Proper fenced code block without spurious leading newlines
            const fence = variant.language ? `\`\`\`${variant.language}` : '```';
            lines.push(fence);
            lines.push(variant.code);
            lines.push('```');
            lines.push('');
          });

          lines.push('');
        });

        lines.push('');
      });

      lines.push('');
    });

    return lines.join('\n').trim() + '\n';
  }

  groupVariantSnippets(snippets) {
    const groups = [];
    let currentGroup = [];

    snippets.forEach((snippet) => {
      if (currentGroup.length === 0) {
        currentGroup.push(snippet);
        return;
      }

      const previous = currentGroup[currentGroup.length - 1];
      const sameDescription = (snippet.description || '') === (previous.description || '');
      const sameFile = (snippet.filePath || '') === (previous.filePath || '');

      if (sameDescription && sameFile) {
        currentGroup.push(snippet);
      } else {
        groups.push(currentGroup);
        currentGroup = [snippet];
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  inferFilePathFromContext(buffer = [], opts = { preferHints: false }) {
    // 1) Prefer explicit "path:" hints nearby (last ~20 lines)
    if (opts && opts.preferHints) {
      const start = Math.max(0, buffer.length - 20);
      for (let index = buffer.length - 1; index >= start; index -= 1) {
        const entry = buffer[index];
        if (typeof entry !== 'string') {
          continue;
        }
        const hint = entry.match(/(?:^|\b)path\s*:\s*([^\s,;]+[^\s]*)/i);
        if (hint && hint[1]) {
          const normalized = this.normalizeTitlePath(hint[0]);
          if (normalized) {
            return normalized;
          }
          // Fallback to raw capture
          return hint[1];
        }
      }
    }

    // 2) Fallback: scan for any obvious file-like tokens with known extensions
    for (let index = buffer.length - 1; index >= 0; index -= 1) {
      const entry = buffer[index];
      if (typeof entry !== 'string') {
        continue;
      }
      const match = entry.match(/(?:\.|\/)[^\s]*\.(?:js|ts|jsx|tsx|json|ya?ml)/i);
      if (match) {
        return match[0];
      }
    }
    return null;
  }
}

if (require.main === module) {
  const { docs, output } = parseArgs();
  const generator = new DocusaurusLlmsCodeGenerator({
    docIds: docs,
    outputPath: output,
  });

  generator.generate().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = DocusaurusLlmsCodeGenerator;
