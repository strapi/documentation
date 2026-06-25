const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
// Shared JSX/prop scanners (single source of truth, also used by
// generate-llms-code.js). These supersede the previously-duplicated helpers
// and additionally fix a template-literal interpolation bug.
const apiComponents = require('./lib/api-components');

class DocusaurusLlmsGenerator {
  constructor(config = {}) {
    this.docsDir = config.docsDir || 'docs';
    this.sidebarPath = config.sidebarPath || 'sidebars.js';
    this.baseUrl = config.baseUrl || 'https://docs.strapi.io';
    this.outputDir = config.outputDir || 'static';
    this.siteName = config.siteName || 'Documentation';
  }

  async generate() {
    try {
      console.log('🔍 Extracting documentation pages...');
      const pages = await this.extractAllPages();
      console.log(`📄 ${pages.length} pages found`);

      console.log('📝 Generating llms.txt...');
      const llmsTxt = this.generateLlmsTxt(pages);
      await fs.ensureDir(this.outputDir);
      await fs.writeFile(path.join(this.outputDir, 'llms.txt'), llmsTxt);

      console.log('📚 Generating llms-full.txt...');
      const llmsFullTxt = this.generateLlmsFullTxt(pages);
      await fs.writeFile(path.join(this.outputDir, 'llms-full.txt'), llmsFullTxt);

      console.log('📄 Generating per-page Markdown (.md)...');
      const mdCount = await this.writePerPageMarkdown(pages);

      console.log('✅ LLMs files successfully generated !');
      console.log(`   - ${this.outputDir}/llms.txt`);
      console.log(`   - ${this.outputDir}/llms-full.txt`);
      console.log(`   - ${mdCount} per-page .md files`);
    } catch (error) {
      console.error('❌ Error while trying to generate LLMs files:', error);
      throw error;
    }
  }

  /**
   * Write one clean-Markdown file per page next to its HTML in the build, so
   * agents can fetch e.g. /cms/api/rest.md. Reuses the same cleaned content as
   * llms-full.txt (lots A–H), so there is a single Markdown source of truth.
   *
   * Only runs against a real build output dir — skipped when writing to
   * `static/` (the dev/standalone path) to avoid polluting the source tree with
   * hundreds of generated files. Returns the number of files written.
   */
  async writePerPageMarkdown(pages) {
    // Guard: don't scatter .md files into the source `static/` folder (dev runs
    // and `node scripts/generate-llms.js` default there). Only emit for builds.
    const outName = path.basename(this.outputDir);
    if (outName === 'static') {
      console.log('   (skipped per-page .md: output dir is static/, not a build)');
      return 0;
    }

    let count = 0;
    for (const page of pages) {
      const relPath = page.url
        .replace(/^https?:\/\/[^/]+\//, '') // strip origin
        .replace(/^\/+/, '')                // leading slashes
        .replace(/\/+$/, '');               // trailing slash
      if (!relPath) continue;               // homepage: handled by HTML only

      const outFile = path.join(this.outputDir, `${relPath}.md`);
      // The cleaned content often already starts with the page's H1 (kept from
      // the markdown). Drop a leading H1 so we don't print the title twice.
      const contentNoH1 = page.content.replace(/^\s*#\s+.+\n+/, '');
      const body = [
        `# ${page.title}`,
        '',
        `> Source: ${page.url}`,
        '',
        contentNoH1,
        '',
      ].join('\n');

      try {
        await fs.ensureDir(path.dirname(outFile));
        await fs.writeFile(outFile, body, 'utf-8');
        count++;
      } catch (error) {
        console.warn(`⚠️ Failed to write ${outFile}: ${error.message}`);
      }
    }
    return count;
  }

  async extractAllPages() {
    const pages = [];
    // Track which docIds were already emitted so the filesystem sweep below
    // doesn't duplicate pages already pulled in via the sidebar.
    this.seenDocIds = new Set();

    // Load sidebar configuration
    const sidebarConfig = this.loadSidebarConfig();

    // Parses every sidebar (gives a sensible primary ordering/structure)
    for (const [sidebarName, sidebarItems] of Object.entries(sidebarConfig)) {
      await this.processItems(sidebarItems, pages);
    }

    // The sidebar only lists a subset of pages: many docs are surfaced through
    // generated-index categories or summary tables (e.g. the 52 v4→v5
    // breaking-change pages), so they never appear in the sidebar tree and were
    // missing from the output entirely. Sweep the filesystem and emit any page
    // not already covered, so llms-full.txt reflects the whole docs set.
    await this.processUncoveredFiles(pages);

    // Sort pages by URL for a consistent and clear order
    return pages.sort((a, b) => a.url.localeCompare(b.url));
  }

  /**
   * Emit every cms/ and cloud/ doc file not already covered by the sidebar
   * walk. Skips AGENTS guides and templates. Handles both .md and .mdx and
   * index files (dir/index.md → docId = dir).
   */
  async processUncoveredFiles(pages) {
    const docIds = await this.discoverAllDocIds();
    for (const docId of docIds) {
      if (this.seenDocIds.has(docId)) continue;
      await this.processDocPage(docId, pages);
    }
  }

  /** Recursively list docIds under cms/ and cloud/ (no extension, no /index). */
  async discoverAllDocIds() {
    const roots = ['cms', 'cloud'];
    const ids = [];
    for (const root of roots) {
      const rootDir = path.join(this.docsDir, root);
      if (!(await fs.pathExists(rootDir))) continue;
      const files = await this.getAllMdFiles(rootDir, root);
      for (const file of files) {
        let id = file.replace(/\\/g, '/').replace(/\.mdx?$/i, '');
        id = id.replace(/\/index$/i, '');
        ids.push(id);
      }
    }
    return ids;
  }

  loadSidebarConfig() {
    try {
      // Deletes cache to reload config
      delete require.cache[require.resolve(path.resolve(this.sidebarPath))];
      return require(path.resolve(this.sidebarPath));
    } catch (error) {
      console.warn(`⚠️ Failed to load ${this.sidebarPath}, using folder scan`);
      return this.fallbackToDirectoryScan();
    }
  }

  async fallbackToDirectoryScan() {
    // Direct scan of docs/ folder if sidebar.js is not available
    const allFiles = await this.getAllMdFiles(this.docsDir);
    return { docs: allFiles.map(file => file.replace('.md', '')) };
  }

  async getAllMdFiles(dir, prefix = '') {
    const files = [];
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        const subFiles = await this.getAllMdFiles(fullPath, path.join(prefix, item));
        files.push(...subFiles);
      } else if (/\.mdx?$/i.test(item)) {
        // Skip agent guides and templates
        const rel = path.join(prefix, item).replace(/\\/g, '/');
        if (/(^|\/)AGENTS(\.|\.mdx?$)/.test(rel) || /(^|\/)templates\//.test(rel)) {
          continue;
        }
        files.push(path.join(prefix, item));
      }
    }
    
    return files;
  }

  async processItems(items, pages) {
    if (!Array.isArray(items)) return;

    for (const item of items) {
      if (typeof item === 'string') {
        await this.processDocPage(item, pages);
      } else if (item.type === 'doc') {
        await this.processDocPage(item.id, pages);
      } else if (item.type === 'category' && item.items) {
        await this.processItems(item.items, pages);
      } else if (item.items) {
        // Gère les groupes ou autres structures
        await this.processItems(item.items, pages);
      }
    }
  }

  async processDocPage(docId, pages) {
    const possiblePaths = [
      path.join(this.docsDir, `${docId}.md`),
      path.join(this.docsDir, `${docId}.mdx`),
      path.join(this.docsDir, docId, 'index.md'),
      path.join(this.docsDir, docId, 'index.mdx')
    ];

    for (const filePath of possiblePaths) {
      if (await fs.pathExists(filePath)) {
        try {
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const { data: frontmatter, content } = matter(fileContent);
          
          const pageUrl = this.generatePageUrl(docId, frontmatter.slug);
          const tldr = this.extractTldr(content);

          pages.push({
            id: docId,
            title: frontmatter.title || this.getTitleFromContent(content) || docId,
            description:
              tldr || frontmatter.description || this.extractDescription(content),
            url: pageUrl,
            content: this.cleanContent(content),
            frontmatter
          });
          if (this.seenDocIds) this.seenDocIds.add(docId);

          break; // Stops once a file is found
        } catch (error) {
          console.warn(`⚠️ Error while handling file ${filePath}:`, error.message);
        }
      }
    }
  }

  generatePageUrl(docId, slug) {
    // A `slug` in the front matter overrides the doc-id-based path (e.g.
    // cloud/getting-started/cloud-fundamentals is served at /cloud/cloud-fundamentals).
    // Honor it so the URL — and the per-page .md path / llms.txt link — match
    // the real page location. An absolute slug starts with '/'.
    if (slug) {
      const cleanSlug = String(slug).replace(/^\/+/, '').replace(/\/+$/, '');
      return `${this.baseUrl}/${cleanSlug}`;
    }
    const cleanId = docId.replace(/^(docs\/|pages\/)/, '');
    return `${this.baseUrl}/${cleanId}`;
  }

  getTitleFromContent(content) {
    // Extracts first h1 from content
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  }

  extractDescription(content) {
    // Extracts first non-empty paragraph
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
        return trimmed.substring(0, 150) + (trimmed.length > 150 ? '...' : '');
      }
    }
    return '';
  }

  extractTldr(content) {
    const match = content.match(/<Tldr>([\s\S]*?)<\/Tldr>/i);

    if (!match) {
      return null;
    }

    const raw = match[1].trim();

    if (!raw) {
      return null;
    }

    return this.sanitizeInlineMarkdown(raw);
  }

  sanitizeInlineMarkdown(text) {
    return text
      // Remove fenced code blocks inside TLDR (rare but safe)
      .replace(/```[\s\S]*?```/g, '')
      // Strip inline code
      .replace(/`([^`]+)`/g, '$1')
      // Turn markdown links into plain text
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      // Bold and italic markers
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Strip residual HTML tags (including MDX components)
      .replace(/<[^>]+>/g, ' ')
      // Collapse whitespace and trim
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Inline components imported from /docs/snippets/*.md. These are used
   * self-closing (e.g. <Intro/>, <Prerequisite/>, <MigrationIntro/>) and would
   * otherwise be deleted by the generic stripper, dropping their snippet
   * content (which never appears elsewhere since snippets aren't in the
   * sidebar). Reads the import lines, resolves each snippet file, strips its
   * frontmatter, and substitutes the Markdown wherever the component is used.
   */
  inlineSnippetComponents(content) {
    // Build a map: ComponentName -> resolved snippet file path.
    const importRe = /^import\s+([A-Za-z0-9_]+)\s+from\s+['"]([^'"]*snippets\/[^'"]+\.mdx?)['"]\s*;?\s*$/gm;
    const snippetMap = {};
    let m;
    while ((m = importRe.exec(content)) !== null) {
      snippetMap[m[1]] = m[2];
    }
    const names = Object.keys(snippetMap);
    if (names.length === 0) return content;

    let result = content;
    for (const name of names) {
      const importPath = snippetMap[name];
      // Resolve: paths are like '/docs/snippets/foo.md' (root-absolute) or
      // relative ('../snippets/foo.md'). Map to a real file under the repo.
      let snippetContent = this.readSnippetFile(importPath);
      if (snippetContent === null) continue;
      // Strip the snippet's own frontmatter and import/export lines.
      snippetContent = snippetContent
        .replace(/^---[\s\S]*?---\n/, '')
        .replace(/^import\s+.*$/gm, '')
        .replace(/^export\s+.*$/gm, '')
        .trim();

      // Replace both self-closing (<Name ... />) and paired (<Name>...</Name>)
      // usages with the snippet content. Props (e.g. components={...}) are
      // dropped — the textual content is what matters for the LLM output.
      const selfClosing = new RegExp(`<${name}\\b[^>]*?/>`, 'g');
      const paired = new RegExp(`<${name}\\b[^>]*?>[\\s\\S]*?<\\/${name}>`, 'g');
      result = result
        .replace(paired, `\n\n${snippetContent}\n\n`)
        .replace(selfClosing, `\n\n${snippetContent}\n\n`);
    }

    return result;
  }

  /** Read a snippet file referenced by an import path, or null if not found. */
  readSnippetFile(importPath) {
    // Candidate locations, in order of likelihood.
    const idx = importPath.indexOf('snippets/');
    const relFromSnippets = idx !== -1 ? importPath.slice(idx) : importPath; // snippets/foo.md
    const candidates = [
      // '/docs/snippets/foo.md' → docsDir/snippets/foo.md
      path.join(this.docsDir, relFromSnippets),
      // already-absolute-ish '/docs/...' resolved from repo root (docsDir parent)
      path.join(this.docsDir, importPath.replace(/^\/?docs\//, '')),
      importPath.replace(/^\//, ''),
    ];
    for (const c of candidates) {
      try {
        if (fs.existsSync(c)) {
          return fs.readFileSync(c, 'utf-8');
        }
      } catch (e) { /* try next */ }
    }
    return null;
  }

  cleanContent(content) {
    // Inline snippet-backed components BEFORE imports are stripped: components
    // imported from /docs/snippets/*.md are used self-closing (e.g. <Intro/>,
    // <Prerequisite/>), so the stripper would delete them and their snippet
    // content — which is never emitted otherwise, as snippets aren't in the
    // sidebar. Resolve the imports and inline the snippet Markdown in place.
    content = this.inlineSnippetComponents(content);

    let cleaned = content
      // Deletes frontmatter metadata
      .replace(/^---[\s\S]*?---\n/, '')
      // Deletes imports
      .replace(/^import\s+.*$/gm, '')
      // Deletes exports
      .replace(/^export\s+.*$/gm, '');

    // Transform <Endpoint> components into readable text
    cleaned = this.transformEndpointComponents(cleaned);

    // Transform legacy <ApiCall>/<Request>/<Response> into readable text
    cleaned = this.transformApiCallComponents(cleaned);

    // Transform inline content-bearing components (e.g. <ExternalLink>) into
    // Markdown BEFORE the generic stripper deletes them along with their props.
    cleaned = this.transformInlineComponents(cleaned);

    // Preserve the `title=` prop of title-bearing paired components (their
    // children survive the stripper, but the title — a section/step heading —
    // would otherwise be lost).
    cleaned = this.transformTitledComponents(cleaned);

    // Remove remaining React/MDX components (balanced tag matching)
    cleaned = this.stripJsxComponents(cleaned);

    // Cleans up empty lines
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

    return cleaned;
  }

  /**
   * Transform <Endpoint ...props /> or <Endpoint ...props>children</Endpoint>
   * into structured, LLM-readable text.
   */
  transformEndpointComponents(content) {
    const result = [];
    let remaining = content;

    while (true) {
      const startIdx = remaining.indexOf('<Endpoint');
      if (startIdx === -1) {
        result.push(remaining);
        break;
      }

      // Push everything before the component
      result.push(remaining.substring(0, startIdx));

      // Extract the full component tag (handling nested braces, brackets, template literals)
      const extracted = this.extractJsxBlock(remaining, startIdx, 'Endpoint');
      if (!extracted) {
        // Couldn't parse — skip past the opening tag
        result.push(remaining.substring(startIdx, startIdx + 10));
        remaining = remaining.substring(startIdx + 10);
        continue;
      }

      const { fullMatch, propsString, children } = extracted;

      // Parse the props and generate readable text
      const readable = this.endpointToText(propsString, children);
      result.push(readable);

      remaining = remaining.substring(startIdx + fullMatch.length);
    }

    return result.join('');
  }

  /**
   * Transform legacy <ApiCall>...<Request>...<Response>...</ApiCall>
   * into structured, LLM-readable text.
   */
  transformApiCallComponents(content) {
    const result = [];
    let remaining = content;

    while (true) {
      const startIdx = remaining.indexOf('<ApiCall');
      if (startIdx === -1) {
        result.push(remaining);
        break;
      }

      result.push(remaining.substring(0, startIdx));

      const extracted = this.extractJsxBlock(remaining, startIdx, 'ApiCall');
      if (!extracted) {
        result.push(remaining.substring(startIdx, startIdx + 8));
        remaining = remaining.substring(startIdx + 8);
        continue;
      }

      const { fullMatch, children } = extracted;

      // Extract markdown code blocks from children (Request/Response blocks contain ```...``` )
      const readable = this.apiCallToText(children);
      result.push(readable);

      remaining = remaining.substring(startIdx + fullMatch.length);
    }

    return result.join('');
  }

  /**
   * Extract a full JSX block starting at `startIdx` for a given component name.
   * Handles nested braces/brackets/template literals in props and children.
   * Returns { fullMatch, propsString, children } or null.
   */
  extractJsxBlock(text, startIdx, componentName) {
    // Delegates to the shared module (single source of truth, also used by
    // generate-llms-code.js). The shared scanner fixes a template-literal
    // interpolation bug that left brace depth unbalanced on `${...}`.
    return apiComponents.extractJsxBlock(text, startIdx, componentName);
  }

  /**
   * Parse Endpoint props and produce readable text.
   */
  endpointToText(propsString, children) {
    const method = this.extractStringProp(propsString, 'method') || 'GET';
    const epPath = this.extractStringProp(propsString, 'path') || '';
    const title = this.extractStringProp(propsString, 'title') || '';
    const description = this.extractStringProp(propsString, 'description') || '';

    const lines = [];

    // Header
    lines.push(`#### ${method} ${epPath}${title ? ' — ' + title : ''}`);
    lines.push('');

    // Description (strip HTML tags for readability)
    if (description) {
      lines.push(description.replace(/<[^>]+>/g, '').trim());
      lines.push('');
    }

    // Parameters
    const params = this.extractArrayProp(propsString, 'params');
    if (params) {
      lines.push('**Parameters:**');
      const paramItems = this.parseSimpleArray(params);
      for (const param of paramItems) {
        const name = this.getObjectField(param, 'name');
        const type = this.getObjectField(param, 'type');
        const required = param.includes("required: true") || param.includes("required:true");
        const desc = this.extractHtmlDescription(param, 'description');
        lines.push(`- \`${name}\` (${type}${required ? ', required' : ''}): ${desc}`);
      }
      lines.push('');
    }

    // Code examples
    const codeTabs = this.extractArrayProp(propsString, 'codeTabs');
    if (codeTabs) {
      const tabs = this.parseSimpleArray(codeTabs);
      for (const tab of tabs) {
        const label = this.getObjectField(tab, 'label') || 'Example';
        const code = this.extractTemplateLiteral(tab, 'code') || this.getObjectField(tab, 'code') || '';
        lines.push(`**${label}:**`);
        lines.push('```');
        lines.push(code.trim());
        lines.push('```');
        lines.push('');
      }
    }

    // Responses
    const responses = this.extractArrayProp(propsString, 'responses');
    if (responses) {
      const respItems = this.parseSimpleArray(responses);
      for (const resp of respItems) {
        const status = this.getObjectField(resp, 'status') || '200';
        const statusText = this.getObjectField(resp, 'statusText') || 'OK';

        lines.push(`**Response ${status} ${statusText}:**`);
        lines.push('```json');

        // Try to extract body — could be a JSON.stringify call or a template literal
        const body = this.extractResponseBody(resp);
        lines.push(body.trim());
        lines.push('```');
        lines.push('');
      }
    }

    // Children (extra notes, admonitions, etc.)
    if (children && children.trim()) {
      lines.push(children.trim());
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Transform legacy <ApiCall> children into readable text.
   * Children typically contain <Request title="...">```code```</Request>
   * and <Response title="...">```code```</Response>.
   */
  apiCallToText(children) {
    if (!children || !children.trim()) return '';

    const lines = [];

    // Extract Request blocks
    const requestMatch = children.match(/<Request[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/Request>/);
    if (requestMatch) {
      lines.push(`**${requestMatch[1] || 'Request'}:**`);
      // The content is typically markdown with code blocks — keep it
      lines.push(requestMatch[2].trim());
      lines.push('');
    }

    // Extract Response blocks
    const responseMatch = children.match(/<Response[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/Response>/);
    if (responseMatch) {
      lines.push(`**${responseMatch[1] || 'Response'}:**`);
      lines.push(responseMatch[2].trim());
      lines.push('');
    }

    // If no Request/Response found, just return the children with tags stripped
    if (lines.length === 0) {
      return children.replace(/<\/?(?:Request|Response)[^>]*>/g, '').trim();
    }

    return lines.join('\n');
  }

  /**
   * Remove remaining JSX components that weren't specially handled.
   * Uses bracket-counting instead of broken regex.
   */
  stripJsxComponents(content) {
    // Match self-closing components: <ComponentName ... />
    // Use iterative approach to handle nested angle brackets in props
    let result = content;

    // Simple self-closing tags (no nested < in props)
    result = result.replace(/<[A-Z][a-zA-Z]*\s[^<]*?\/>/g, '');
    // Self-closing tags with no props
    result = result.replace(/<[A-Z][a-zA-Z]*\s*\/>/g, '');

    // Opening + closing pairs: iteratively remove innermost first
    let prev = '';
    while (prev !== result) {
      prev = result;
      // Match components that don't contain other uppercase components inside
      result = result.replace(/<([A-Z][a-zA-Z]*)[^>]*>([^<]*(?:<(?![A-Z/])[^<]*)*)<\/\1>/g, (match, tag, inner) => {
        // Keep the inner text content (strip the wrapper tags)
        return inner.trim();
      });
    }

    // Clean up any remaining bare closing tags
    result = result.replace(/<\/[A-Z][a-zA-Z]*>/g, '');

    return result;
  }

  /**
   * Transform inline content-bearing components into Markdown before the
   * generic stripper removes them. Currently handles <ExternalLink>, whose
   * label + URL live in props (so it is otherwise deleted wholesale, losing
   * ~530 links across the docs).
   */
  transformInlineComponents(content) {
    let result = content;

    // <ExternalLink to="URL" text="LABEL" /> → [LABEL](URL). Props may appear in
    // either order, with single or double quotes, optional trailing slash, and
    // arbitrary whitespace/newlines. Match the whole self-closing tag, then pull
    // `to` and `text` out individually.
    result = result.replace(/<ExternalLink\b([^>]*?)\/>/g, (match, props) => {
      const to = this.extractStringProp(props, 'to');
      const text = this.extractStringProp(props, 'text');
      if (to && text) return `[${text}](${to})`;
      if (to) return `[${to}](${to})`;
      if (text) return text;
      return '';
    });

    // <CustomDocCard title="..." description="..." link="..." /> → a Markdown
    // bullet linking to the page. These navigation cards (148 of them, all
    // self-closing) are otherwise deleted, dropping the landing-page structure.
    result = result.replace(/<CustomDocCard\b([^>]*?)\/>/g, (match, props) => {
      const title = this.extractStringProp(props, 'title');
      const description = this.extractStringProp(props, 'description');
      const link = this.extractStringProp(props, 'link');
      if (!title && !link) return '';
      const label = title || link;
      const linked = link ? `[${label}](${link})` : label;
      return description ? `- ${linked}: ${description}` : `- ${linked}`;
    });

    // <BreakingChangeIdCard plugins codemodName="..." codemodLink="..." info="..." />
    // Carries the "affects plugins? / handled by a codemod?" facts in props (52
    // uses on v4→v5 breaking-change pages). Render them as a short fact list.
    result = result.replace(/<BreakingChangeIdCard\b([^>]*?)\/>/g, (match, props) => {
      // Boolean props can appear bare (e.g. `plugins`) or as plugins={true}.
      const hasFlag = (name) =>
        new RegExp(`(?:^|\\s)${name}(?=\\s|$|=)`).test(props) &&
        !new RegExp(`${name}=\\{?false`).test(props);
      const plugins = hasFlag('plugins');
      const codemodPartly = hasFlag('codemodPartly');
      const codemod = hasFlag('codemod');
      const codemodName = this.extractStringProp(props, 'codemodName');
      const codemodLink = this.extractStringProp(props, 'codemodLink');
      const info = this.extractStringProp(props, 'info');

      const pluginsAnswer = plugins ? 'Yes' : 'No';
      let codemodAnswer = 'No';
      if (codemodPartly) codemodAnswer = 'Partly';
      else if (codemod || codemodName) codemodAnswer = 'Yes';

      const lines = [
        `- Is this breaking change affecting plugins? ${pluginsAnswer}`,
        `- Is this breaking change automatically handled by a codemod? ${codemodAnswer}`,
      ];
      if (codemodName && codemodLink) {
        lines.push(`  - Codemod: [${codemodName}](${codemodLink})`);
      } else if (codemodName) {
        lines.push(`  - Codemod: \`${codemodName}\``);
      } else if (codemodLink) {
        lines.push(`  - Codemod: [the codemod's code](${codemodLink})`);
      }
      if (info) lines.push(`- ${info}`);
      return lines.join('\n');
    });

    return result;
  }

  /**
   * For paired components that carry a heading/label in a `title=` prop
   * (StepDetails, SubtleCallout, IdentityCardItem), surface that title as a
   * bold line before the children. The generic stripper keeps the children but
   * drops the title, losing the step/section heading. Uses the bracket-aware
   * extractJsxBlock so nested components and braces in props are handled.
   */
  transformTitledComponents(content) {
    const TITLED = ['StepDetails', 'SubtleCallout', 'IdentityCardItem'];
    let result = content;

    for (const name of TITLED) {
      const out = [];
      let remaining = result;
      while (true) {
        const startIdx = remaining.indexOf(`<${name}`);
        if (startIdx === -1) { out.push(remaining); break; }
        out.push(remaining.substring(0, startIdx));

        const extracted = this.extractJsxBlock(remaining, startIdx, name);
        if (!extracted) {
          out.push(remaining.substring(startIdx, startIdx + name.length + 1));
          remaining = remaining.substring(startIdx + name.length + 1);
          continue;
        }

        const { propsString, children, fullMatch } = extracted;
        const title = this.extractStringProp(propsString, 'title');
        const body = (children || '').trim();
        const pieces = [];
        if (title) pieces.push(`**${title}**`);
        if (body) pieces.push(body);
        // Surround with blank lines so the title reads as its own block.
        out.push(pieces.length ? `\n${pieces.join('\n\n')}\n` : body);

        remaining = remaining.substring(startIdx + fullMatch.length);
      }
      result = out.join('');
    }

    return result;
  }

  // ---- Prop extraction helpers ----

  // These prop scanners now delegate to the shared module (single source of
  // truth, also used by generate-llms-code.js). The shared versions fix a
  // template-literal interpolation bug present in the old inline copies.
  extractStringProp(propsString, propName) {
    return apiComponents.extractStringProp(propsString, propName);
  }

  extractArrayProp(propsString, propName) {
    return apiComponents.extractArrayProp(propsString, propName);
  }

  parseSimpleArray(arrayContent) {
    return apiComponents.parseSimpleArray(arrayContent);
  }

  getObjectField(objString, fieldName) {
    return apiComponents.getObjectField(objString, fieldName);
  }

  /**
   * Extract an HTML-rich description field from a JSX object string.
   * Handles descriptions containing <a>, <code>, etc. by finding the matching quote
   * through bracket counting instead of simple regex.
   */
  extractHtmlDescription(objString, fieldName) {
    const patterns = [
      `${fieldName}: '`,
      `${fieldName}: "`,
      `${fieldName}:'`,
      `${fieldName}:"`,
    ];

    let startIdx = -1;
    let quote = "'";

    for (const pat of patterns) {
      const idx = objString.indexOf(pat);
      if (idx !== -1) {
        startIdx = idx + pat.length;
        quote = pat[pat.length - 1];
        break;
      }
    }

    if (startIdx === -1) return '';

    // Find the matching closing quote, accounting for escaped quotes
    let i = startIdx;
    const len = objString.length;
    while (i < len) {
      if (objString[i] === quote && objString[i - 1] !== '\\') {
        break;
      }
      i++;
    }

    const raw = objString.substring(startIdx, i);

    // Convert HTML to readable text
    return raw
      .replace(/<a\s+href="([^"]*)"[^>]*>([^<]*)<\/a>/g, '$2 ($1)')
      .replace(/<code>([^<]*)<\/code>/g, '`$1`')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Extract a template literal field: field: `value` (delegates to shared module). */
  extractTemplateLiteral(objString, fieldName) {
    return apiComponents.extractTemplateLiteral(objString, fieldName);
  }

  /** Extract response body — handles JSON.stringify(...) calls and template literals */
  extractResponseBody(respString) {
    // Check for JSON.stringify call
    const stringifyIdx = respString.indexOf('JSON.stringify(');
    if (stringifyIdx !== -1) {
      // Extract the first argument to JSON.stringify
      let i = stringifyIdx + 'JSON.stringify('.length;
      let depth = 1;
      let inString = null;
      const len = respString.length;
      const start = i;

      while (i < len && depth > 0) {
        const ch = respString[i];
        const prev = i > 0 ? respString[i - 1] : '';

        if (inString) {
          if (ch === inString && prev !== '\\') inString = null;
          i++; continue;
        }
        if (ch === '"' || ch === "'") { inString = ch; i++; continue; }
        if (ch === '(' || ch === '{' || ch === '[') { depth++; i++; continue; }
        if (ch === ')' || ch === '}' || ch === ']') {
          depth--;
          if (depth === 0) break;
          i++;
          continue;
        }
        i++;
      }

      // Get the object literal, try to format it as JSON
      const objLiteral = respString.substring(start, i).trim();
      // Remove trailing ", null, 2" args if the closing paren was for stringify
      const firstArgEnd = this.findFirstArgEnd(objLiteral);
      const firstArg = firstArgEnd !== -1 ? objLiteral.substring(0, firstArgEnd) : objLiteral;

      // Convert JS object literal to approximate JSON
      return this.jsObjectToReadableJson(firstArg);
    }

    // Check for template literal body
    const body = this.extractTemplateLiteral(respString, 'body');
    if (body) return body;

    // Check for string body
    const strBody = this.getObjectField(respString, 'body');
    if (strBody) return strBody;

    return '(response body)';
  }

  /** Find end of first argument in a potentially multi-arg string like "obj, null, 2" */
  findFirstArgEnd(str) {
    let depth = 0;
    let inString = null;

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const prev = i > 0 ? str[i - 1] : '';

      if (inString) {
        if (ch === inString && prev !== '\\') inString = null;
        continue;
      }
      if (ch === '"' || ch === "'") { inString = ch; continue; }
      if (ch === '{' || ch === '[' || ch === '(') { depth++; continue; }
      if (ch === '}' || ch === ']' || ch === ')') { depth--; continue; }
      if (ch === ',' && depth === 0) return i;
    }

    return -1;
  }

  /** Convert a JS object literal to readable JSON-like text */
  jsObjectToReadableJson(jsObj) {
    try {
      // Simple transforms: unquoted keys -> quoted, single quotes -> double quotes
      let json = jsObj
        // Add quotes around unquoted keys
        .replace(/(\s)(\w+)\s*:/g, '$1"$2":')
        // Handle keys at start of line
        .replace(/^(\s*)(\w+)\s*:/gm, '$1"$2":')
        // Single quotes to double quotes (simple cases)
        .replace(/:\s*'([^']*)'/g, ': "$1"')
        // Remove trailing commas
        .replace(/,(\s*[}\]])/g, '$1');

      // Try to parse and re-format
      const parsed = JSON.parse(json);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // If parsing fails, return the raw object literal cleaned up
      return jsObj.trim();
    }
  }

  generateLlmsTxt(pages) {
    const lines = [`# ${this.siteName}`, ''];

    pages.forEach(page => {
      const description = page.description || 'No description available';
      // Point at the clean Markdown twin (<page>.md) rather than the HTML page,
      // so agents following llms.txt fetch parseable Markdown directly. Pages
      // without a path (e.g. the homepage) keep their original URL.
      const mdUrl = this.toMarkdownUrl(page.url);
      lines.push(`- [${page.title}](${mdUrl}): ${description}`);
    });

    return lines.join('\n');
  }

  /** Map a page URL to its .md twin, leaving path-less URLs (homepage) as-is. */
  toMarkdownUrl(url) {
    if (!url) return url;
    if (/\.md$/i.test(url)) return url;
    // Has a path beyond the origin? (e.g. https://docs.strapi.io/cms/api/rest)
    const m = url.match(/^(https?:\/\/[^/]+)(\/.+?)\/?$/);
    if (!m) return url; // origin only → homepage, no .md
    return `${m[1]}${m[2]}.md`;
  }

  generateLlmsFullTxt(pages) {
    const sections = [];
    
    pages.forEach(page => {
      sections.push(`# ${page.title}`);
      sections.push(`Source: ${page.url}`);
      sections.push('');
      sections.push(page.content);
      sections.push('\n\n');
    });
    
    return sections.join('\n');
  }
}

module.exports = DocusaurusLlmsGenerator;

// If script is not directly executed
if (require.main === module) {
  const generator = new DocusaurusLlmsGenerator({
    docsDir: 'docs',
    sidebarPath: 'sidebars.js',
    baseUrl: 'https://docs.strapi.io',
    outputDir: 'static',
    siteName: 'Strapi Documentation'
  });
  
  generator.generate().catch(console.error);
}
