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
  let docsDir = 'docs';
  let anchors = false;
  let checkFiles = false;
  let projectRoot = process.cwd();
  let allDocs = false;
  let includeFilters = [];
  let excludeFilters = [];
  let lineNumbers = false;
  let verbose = false;
  let logFile = null;

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
    } else if (arg === '--anchors' || arg === '--with-anchors') {
      anchors = true;
    } else if (arg === '--docs-dir') {
      const value = args[i + 1];
      i += 1;
      if (value) {
        docsDir = value;
      }
    } else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node generate-llms-code.js [--docs docA,docB] [--output path/to/file]');
      process.exit(0);
    } else if (arg === '--check-files') {
      checkFiles = true;
    } else if (arg === '--project-root') {
      const value = args[i + 1];
      i += 1;
      if (value) {
        projectRoot = value;
      }
    } else if (arg === '--all') {
      allDocs = true;
    } else if (arg === '--include') {
      const value = args[i + 1];
      i += 1;
      if (value) includeFilters = value.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (arg === '--exclude') {
      const value = args[i + 1];
      i += 1;
      if (value) excludeFilters = value.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (arg === '--line-numbers') {
      lineNumbers = true;
    } else if (arg === '--verbose') {
      verbose = true;
    } else if (arg === '--log-file') {
      const value = args[i + 1];
      i += 1;
      if (value) logFile = value;
    } else {
      docs.push(arg);
    }
  }

  return {
    docs: docs.length > 0 ? docs : DEFAULT_DOCS,
    output,
    docsDir,
    anchors,
    checkFiles,
    projectRoot,
    allDocs,
    includeFilters,
    excludeFilters,
    lineNumbers,
    verbose,
    logFile,
  };
};

class DocusaurusLlmsCodeGenerator {
  constructor(config = {}) {
    // Start with provided or default docs dir
    this.docsDir = config.docsDir || 'docs';
    // If the provided docsDir does not exist, attempt a smart fallback
    try {
      const exists = fs.pathExistsSync ? fs.pathExistsSync(this.docsDir) : fs.existsSync(this.docsDir);
      if (!exists) {
        const alt = path.join('docusaurus', 'docs');
        const altExists = fs.pathExistsSync ? fs.pathExistsSync(alt) : fs.existsSync(alt);
        if (altExists) {
          this.docsDir = alt;
        }
      }
    } catch (e) {
      // ignore and keep default
    }
    this.sidebarPath = config.sidebarPath || 'sidebars.js';
    this.outputPath = config.outputPath || DEFAULT_OUTPUT;
    this.docIds = config.docIds || DEFAULT_DOCS;
    this.includeSectionAnchors = Boolean(config.includeSectionAnchors);
    this.includeFileChecks = Boolean(config.includeFileChecks);
    this.projectRoot = config.projectRoot || process.cwd();
    this.allDocs = Boolean(config.allDocs);
    this.includeFilters = Array.isArray(config.includeFilters) ? config.includeFilters : [];
    this.excludeFilters = Array.isArray(config.excludeFilters) ? config.excludeFilters : [];
    this.includeLineNumbers = Boolean(config.lineNumbers);
    this.verbose = Boolean(config.verbose);
    this.logFile = config.logFile || null;
  }

  // Recursively walk docs directory to find all .md/.mdx files and map to docIds
  discoverAllDocIds() {
    const root = this.docsDir;
    const results = [];
    const walk = (dir) => {
      let entries = [];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch (e) {
        return;
      }
      for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
          walk(full);
        } else if (ent.isFile() && /\.mdx?$/i.test(ent.name)) {
          let rel = path.relative(root, full).replace(/\\/g, '/');
          rel = rel.replace(/\.(md|mdx)$/i, '');
          rel = rel.replace(/\/(index)$/i, '');
          if (rel) results.push(rel);
        }
      }
    };
    walk(root);
    const uniq = Array.from(new Set(results)).sort();

    // Restrict discovery to cms/ and cloud/ trees only
    const allowedRoots = ['cms/', 'cloud/'];
    const inAllowedRoots = uniq.filter((id) => allowedRoots.some((r) => id.startsWith(r)));

    const filtered = inAllowedRoots.filter((id) => {
      if (this.includeFilters.length > 0 && !this.includeFilters.some((f) => id.includes(f))) return false;
      if (this.excludeFilters.length > 0 && this.excludeFilters.some((f) => id.includes(f))) return false;
      return true;
    });
    return filtered;
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

      // Decide which docIds to process
      let docIds = this.docIds;
      if (this.allDocs) {
        let discovered = this.discoverAllDocIds();
        if (discovered.length === 0) {
          console.warn('⚠️  --all requested but no docs found under', this.docsDir);
          // Try one more time with fallback if not already using it
          const fallbackDir = this.docsDir === 'docs' ? path.join('docusaurus', 'docs') : 'docs';
          try {
            const exists = fs.pathExistsSync ? fs.pathExistsSync(fallbackDir) : fs.existsSync(fallbackDir);
            if (exists) {
              this.docsDir = fallbackDir;
              discovered = this.discoverAllDocIds();
            }
          } catch (e) {
            // ignore
          }
        }
        if (discovered.length === 0) {
          console.warn('⚠️  No docs discovered. Skipping code snippet extraction.');
        }
        docIds = discovered;
      }

      const skipped = [];

      for (const docId of docIds) {
        const filePath = this.findDocFile(docId);
        if (!filePath) {
          console.warn(`⚠️  Unable to locate file for ${docId}`);
          continue;
        }

        const parsed = await this.parseDocument(filePath);
        const fm = parsed.data || parsed.frontmatter || {};
        const title = fm.title || this.deriveTitleFromId(docId);
        const extracted = this.extractCodeSnippets(docId, title, parsed.content);
        const snippets = extracted.snippets || [];
        const sectionAnchors = extracted.sectionAnchors || {};

        if (snippets.length === 0) {
          if (this.verbose) {
            console.warn(`ℹ️  Skipping ${docId}: no code snippets found.`);
          } else {
            skipped.push(docId);
          }
          continue;
        }

        pages.push({ docId, title, snippets, sectionAnchors });
      }

      if (pages.length === 0) {
        console.warn('⚠️  No pages with code snippets were collected.');
      }

      const output = this.formatOutput(pages);

      // Support stdout preview when --output - is provided
      if (this.outputPath === '-' || this.outputPath === '/dev/stdout') {
        process.stdout.write(output);
        console.log('\n✅ Printed llms-code to stdout');
        return;
      }

      await fs.ensureDir(path.dirname(this.outputPath));
      await fs.writeFile(this.outputPath, output, 'utf-8');

      console.log(`✅ Wrote ${this.outputPath}`);

      if (skipped.length > 0 && !this.verbose) {
        console.log(`Skipped code generation for ${skipped.length} files. Use --verbose for a more detailed output.`);
      }

      // Auto-enable log file when verbose and no logFile provided
      if (this.verbose && !this.logFile) {
        this.logFile = path.join('static', 'llms-code-skip.log');
      }

      // Optional: write skip log if requested (or auto in verbose)
      if (this.logFile) {
        const content = [
          `Skipped files: ${skipped.length}`,
          ...skipped.map((id) => `- ${id}`),
          '',
        ].join('\n');
        try {
          await fs.ensureDir(path.dirname(this.logFile));
          await fs.writeFile(this.logFile, content, 'utf-8');
          console.log(`📝 Wrote skip log to ${this.logFile}`);
        } catch (err) {
          console.warn(`⚠️  Failed to write skip log to ${this.logFile}: ${err.message}`);
        }
      }
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
      case 'powershell':
      case 'pwsh':
        return 'PowerShell';
      case 'fish':
        return 'Fish';
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

  // Resolve language from fence, file path, and code content (content-first heuristics)
  resolveLanguage(fenceLanguage = '', filePath = '', code = '') {
    const ext = (filePath || '').split('/').pop() || '';
    const extLower = (ext.split('.').pop() || '').toLowerCase();
    const fence = (fenceLanguage || '').toLowerCase();
    const head = (code || '').split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 10);

    // Content-first heuristics
    const first = head[0] || '';
    if (/^#!\/.+\b(bash|sh|env\s+bash|env\s+sh)\b/.test(first)) return 'bash';
    if (/^FROM\s+\S+/i.test(first) || head.some((l) => /^(RUN|CMD|ENTRYPOINT|COPY|ADD|WORKDIR|ENV|EXPOSE|USER)\b/i.test(l))) return 'dockerfile';
    // SQL: require clear SQL shape; avoid JS objects like `delete:` keys
    if (head.some((l) => /(^select\b.+\bfrom\b)|(^insert\b\s+into\b)|(^update\b\s+\w+\b)|(^delete\b\s+from\b)|(^create\b\s+(table|index|view)\b)|(^alter\b\s+table\b)|(^drop\b\s+(table|index|view)\b)|(^with\b\s+\w+\s+as\b)/i.test(l))) return 'sql';
    if (/^(query|mutation|subscription|fragment|schema)\b/.test(first)) return 'graphql';
    // JS/TS module cues before YAML/JSON
    if (/(?:^|\b)(module\.exports|require\(["']|exports?\.|console\.log\()/.test(code)) return extLower.startsWith('ts') ? 'ts' : 'js';
    if (/(?:^|\b)(import\s+[^;]+from\s+["'][^"']+["']|export\s+(default|const|function|class)\b)/.test(code)) return extLower.startsWith('ts') ? 'ts' : 'js';
    // YAML detection: frontmatter or multiple key: value lines without JS syntax
    const yamlKeyLines = head.filter((l) => /^\w[\w-]*\s*:\s*\S/.test(l)).length;
    if (first === '---' || (yamlKeyLines >= 2 && !/[{}();]/.test(head.join(' ')))) return 'yaml';
    // JSON detection: leading brace/bracket and key: value patterns, but avoid JS/TS
    if (/^[\[{]/.test(first) && head.some((l) => /"?\w+"?\s*:\s*/.test(l)) && !/(module\.exports|import\s|export\s)/.test(code)) return 'json';
    if (head.length > 0 && head.every((l) => /^(?:\$\s+)?(npm|yarn|pnpm|npx|strapi|node|cd|cp|mv|rm|mkdir|curl|wget|git|docker|kubectl|helm|openssl|grep|sed|awk|touch|chmod|chown|tee|cat)\b/.test(l) || l.startsWith('#'))) return 'bash';
    if (head.some((l) => /^(param\s*\(|Write-Host\b|Get-Item\b|Set-Item\b|New-Object\b)/i.test(l))) return 'powershell';
    if (head.some((l) => /^(function\s+\w+|set\s+-l\s+\w+|end\s*$)/.test(l))) return 'fish';
    if (/(export\s+(interface|type)\b|:\s*\w+<|\bimplements\b|\bas\s+const\b)/.test(code)) return 'ts';
    if (/from\s+['"][^'"\n]+\.ts['"]/i.test(code)) return 'ts';

    // Extension-derived mapping
    const extToLang = {
      js: 'js', jsx: 'jsx',
      ts: 'ts', tsx: 'tsx',
      json: 'json', yml: 'yaml', yaml: 'yaml',
      sh: 'bash', bash: 'bash', zsh: 'bash',
      graphql: 'graphql', gql: 'graphql',
      sql: 'sql',
      env: 'dotenv',
      dockerfile: 'dockerfile', ps1: 'powershell', psm1: 'powershell', fish: 'fish',
      html: 'html', css: 'css', scss: 'scss',
      py: 'python', rb: 'ruby', go: 'go', php: 'php', java: 'java',
      c: 'c', h: 'c', cc: 'cpp', cpp: 'cpp', cxx: 'cpp', cs: 'csharp',
      ini: 'ini', toml: 'toml', md: 'md', mdx: 'mdx',
    };
    

    let preferred = '';
    if (/^dockerfile$/i.test(ext)) preferred = 'dockerfile';
    else if (/^\.env(\..+)?$/i.test(ext)) preferred = 'dotenv';
    else preferred = extToLang[extLower] || '';

    // If no fence language, adopt the extension-derived language
    if (!fence && preferred) return preferred;

    // JS/TS family resolution: prefer file extension if it contradicts fence
    const family = (lang) => (lang.startsWith('ts') ? 'ts' : (lang.startsWith('js') ? 'js' : lang));
    if (preferred && family(fence) !== family(preferred)) return preferred;

    // Fall back to fence or preferred
    return fenceLanguage || preferred || '';
  }

  // Slugify heading text similarly to GitHub/Docusaurus and dedupe within a page
  slugify(text, seen) {
    if (!text) return '';
    let slug = String(text)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '') // strip diacritics
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
    if (!seen.has(slug)) {
      seen.set(slug, 0);
      return slug;
    }
    const n = seen.get(slug) + 1;
    seen.set(slug, n);
    return `${slug}-${n}`;
  }

  normalizeOutputPath(p) {
    if (!p) return p;
    if (/^https?:\/\//i.test(p)) return p;
    let out = p;
    if (out.startsWith('//')) out = out.replace(/^\/+/, '/');
    out = out.replace(/([^:])\/\/+/, '$1/');
    return out;
  }

  resolveAbsolutePathForCheck(relPath = '') {
    if (!relPath) return null;
    const clean = relPath.replace(/^\/+/, '');
    const candidate = path.join(this.projectRoot, clean);
    return candidate;
  }

  fileExists(relPath = '') {
    try {
      const abs = this.resolveAbsolutePathForCheck(relPath);
      if (!abs) return false;
      return fs.pathExistsSync ? fs.pathExistsSync(abs) : fs.existsSync(abs);
    } catch (e) {
      return false;
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
    const sectionAnchors = {};
    // Track MDX Tabs/TabItem context to group language variants
    let inTabs = false;
    let tabsCounter = 0;
    let currentTabsGroupId = null; // from <Tabs groupId="...">
    let currentTabLabel = null; // from <TabItem label="...">
    let currentTabValue = null; // from <TabItem value="...">
    let currentVariantGroupId = null; // computed group key for variants

    let inCode = false;
    let codeLanguage = '';
    let codeLines = [];

    const lines = content.split('\n');
    let openingFenceIndex = null; // 0-based index of opening fence line

    lines.forEach((line, i) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('```')) {
        const info = trimmed.slice(3).trim();
        const { language, options } = this.parseFenceInfo(info);
        if (!inCode) {
          inCode = true;
          codeLines = [];
          codeLanguage = language || '';
          openingFenceIndex = i; // 0-based index of the fence line

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
            variantGroupId: currentVariantGroupId,
            tabLabel: currentTabLabel,
            tabValue: currentTabValue,
            context: [...contextBuffer],
            // Record 1-based code line start (first line after opening fence)
            startLine: (i + 2),
            endLine: null,
          });
        } else {
          inCode = false;
          if (snippets.length > 0) {
            const current = snippets[snippets.length - 1];
            current.code = codeLines.join('\n').trimEnd();
            // Record 1-based code line end (line before closing fence)
            current.endLine = i; // because closing fence is i+1 (1-based), so code end is i
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
          openingFenceIndex = null;
        }
        return;
      }

      if (inCode) {
        codeLines.push(line);
        return;
      }

      // Detect MDX Tabs and TabItem wrappers to group variants
      // <Tabs groupId="..."> start
      const tabsOpen = trimmed.match(/^<Tabs\b([^>]*)>/);
      if (tabsOpen) {
        inTabs = true;
        tabsCounter += 1;
        const attrs = tabsOpen[1] || '';
        const gidMatch = attrs.match(/groupId\s*=\s*(?:"([^"]+)"|'([^']+)')/);
        const gid = gidMatch ? (gidMatch[1] || gidMatch[2]) : 'default';
        currentTabsGroupId = gid;
        currentVariantGroupId = `${docId}::${this.currentSection(sections, title)}::tabs${tabsCounter}:${gid}`;
        return;
      }
      // </Tabs> end
      if (/^<\/Tabs>\s*$/.test(trimmed)) {
        inTabs = false;
        currentTabsGroupId = null;
        currentVariantGroupId = null;
        return;
      }
      // <TabItem ...> start
      const tabItemOpen = trimmed.match(/^<TabItem\b([^>]*)>/);
      if (tabItemOpen) {
        const attrs = tabItemOpen[1] || '';
        const labelMatch = attrs.match(/label\s*=\s*(?:"([^"]+)"|'([^']+)')/);
        const valueMatch = attrs.match(/value\s*=\s*(?:"([^"]+)"|'([^']+)')/);
        currentTabLabel = labelMatch ? (labelMatch[1] || labelMatch[2]) : null;
        currentTabValue = valueMatch ? (valueMatch[1] || valueMatch[2]) : null;
        // Ensure we have a variant group during TabItem even if <Tabs> attrs missing
        if (!currentVariantGroupId) {
          tabsCounter += 1;
          currentVariantGroupId = `${docId}::${this.currentSection(sections, title)}::tabs${tabsCounter}:${currentTabsGroupId || 'default'}`;
        }
        return;
      }
      // </TabItem> end
      if (/^<\/TabItem>\s*$/.test(trimmed)) {
        currentTabLabel = null;
        currentTabValue = null;
        return;
      }

      const headingMatch = trimmed.match(HEADING_REGEX);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const rawHeading = headingMatch[2];
        const customAnchorMatch = rawHeading.match(/\{#([A-Za-z0-9\-_]+)\}/);
        const customAnchor = customAnchorMatch ? customAnchorMatch[1] : null;
        const headingBase = rawHeading.replace(/\{#([A-Za-z0-9\-_]+)\}/, '').trim();
        const headingText = cleanInlineText(headingBase) || `Heading level ${level}`;

        while (sections.length >= level) {
          sections.pop();
        }

        sections.push(headingText);
        if (customAnchor) {
          sectionAnchors[headingText] = customAnchor;
        }
        // Reset any ongoing Tabs grouping when changing section
        inTabs = false;
        currentTabsGroupId = null;
        currentVariantGroupId = null;
        currentTabLabel = null;
        currentTabValue = null;
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

    return { snippets: snippets.filter((snippet) => Boolean(snippet.code)), sectionAnchors };
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

      const seenSlugs = new Map();
      snippetsBySection.forEach((sectionSnippets, sectionName) => {
        // Build groups first and filter out empty variants
        const groups = this.groupVariantSnippets(sectionSnippets)
          .map((g) => g.filter((v) => v && v.code && String(v.code).trim()))
          .filter((g) => g.length > 0);

        // Skip sections that yield no valid variants
        if (groups.length === 0) {
          return;
        }

        lines.push(`## ${sectionName}`);

        // Section-level description: derive from the first meaningful snippet
        const firstMeaningful = sectionSnippets.find((s) => !s.fallbackUsed && (s.description || '').trim()) || sectionSnippets[0];
        const sectionDesc = (firstMeaningful && (firstMeaningful.description || '').trim())
          ? firstMeaningful.description
          : this.buildFallbackDescription(firstMeaningful || { section: sectionName, language: '' });
        lines.push(`Description: ${sectionDesc}`);

        // Section-level source line (wrapped in parentheses, with optional anchor)
        if (this.includeSectionAnchors) {
          const custom = page.sectionAnchors && page.sectionAnchors[sectionName];
          const anchor = custom || this.slugify(sectionName, seenSlugs);
          lines.push(`(Source: ${BASE_URL}/${page.docId}#${anchor})`);
        } else {
          lines.push(`(Source: ${BASE_URL}/${page.docId})`);
        }

        lines.push('');

        groups.forEach((group) => {
          group.forEach((variant, variantIndex) => {
            // Skip variants with no code to avoid emitting metadata without fences
            if (!variant.code || !String(variant.code).trim()) {
              return;
            }
            if (variantIndex > 0) {
              lines.push('---');
            }

            const resolvedFile = this.normalizeOutputPath(
              variant.filePath || this.inferFilePathFromContext(variant.context)
            );

            const chosenLang = this.resolveLanguage(variant.language, resolvedFile, variant.code);
            const language = chosenLang
              ? `Language: ${this.formatLanguageName(chosenLang)}`
              : 'Language: JavaScript';
            lines.push(language);

            const fileSuffix = (this.includeFileChecks && resolvedFile && !this.fileExists(resolvedFile)) ? ' (missing)' : '';
            lines.push(`File path: ${resolvedFile || 'N/A'}${fileSuffix}`);
            if (this.includeLineNumbers && variant.startLine && variant.endLine) {
              lines.push(`Lines: ${variant.startLine}-${variant.endLine}`);
            }

            lines.push('');

            const fence = chosenLang ? '```' + chosenLang : '```';
            lines.push(fence);
            lines.push(variant.code);
            lines.push('```');
            lines.push('');
          });
        });

        lines.push('');
      });

      lines.push('');
    });

    return lines.join('\n').trim() + '\n';
  }

  groupVariantSnippets(snippets) {
    // First, group by explicit variantGroupId when present (MDX Tabs),
    // otherwise fall back to old behavior of grouping consecutive snippets
    const explicitGroups = new Map();
    const sequentialGroups = [];
    let currentGroup = [];

    snippets.forEach((snippet) => {
      if (snippet.variantGroupId) {
        if (!explicitGroups.has(snippet.variantGroupId)) {
          explicitGroups.set(snippet.variantGroupId, []);
        }
        explicitGroups.get(snippet.variantGroupId).push(snippet);
        // Flush any ongoing sequential group before switching context
        if (currentGroup.length > 0) {
          sequentialGroups.push(currentGroup);
          currentGroup = [];
        }
        return;
      }

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
        sequentialGroups.push(currentGroup);
        currentGroup = [snippet];
      }
    });

    if (currentGroup.length > 0) {
      sequentialGroups.push(currentGroup);
    }

    const groups = [...explicitGroups.values(), ...sequentialGroups];
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
  const {
    docs,
    output,
    anchors,
    checkFiles,
    projectRoot,
    allDocs,
    includeFilters,
    excludeFilters,
    lineNumbers,
  } = parseArgs();

  const generator = new DocusaurusLlmsCodeGenerator({
    docIds: docs,
    outputPath: output,
    includeSectionAnchors: anchors,
    includeFileChecks: checkFiles,
    projectRoot,
    allDocs,
    includeFilters,
    excludeFilters,
    lineNumbers,
  });

  generator.generate().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = DocusaurusLlmsCodeGenerator;
