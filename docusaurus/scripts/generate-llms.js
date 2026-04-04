const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');

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

      console.log('✅ LLMs files successfully generated !');
      console.log(`   - ${this.outputDir}/llms.txt`);
      console.log(`   - ${this.outputDir}/llms-full.txt`);
    } catch (error) {
      console.error('❌ Error while trying to generate LLMs files:', error);
      throw error;
    }
  }

  async extractAllPages() {
    const pages = [];
    
    // Load sidebar configuration
    const sidebarConfig = this.loadSidebarConfig();
    
    // Parses every sidebar
    for (const [sidebarName, sidebarItems] of Object.entries(sidebarConfig)) {
      await this.processItems(sidebarItems, pages);
    }

    // Sort pages by URL for a consistent and clear order
    return pages.sort((a, b) => a.url.localeCompare(b.url));
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
      } else if (item.endsWith('.md')) {
        // Skip agent guides and templates
        const rel = path.join(prefix, item).replace(/\\/g, '/');
        if (/(^|\/)AGENTS(\.|\.md$)/.test(rel) || /(^|\/)templates\//.test(rel)) {
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
          
          const pageUrl = this.generatePageUrl(docId);
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
          
          break; // Stops once a file is found
        } catch (error) {
          console.warn(`⚠️ Error while handling file ${filePath}:`, error.message);
        }
      }
    }
  }

  generatePageUrl(docId) {
    // Deletes common prefixes and generates proper URL
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

  cleanContent(content) {
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
    let i = startIdx + componentName.length + 1; // skip past `<ComponentName`
    const len = text.length;

    // Phase 1: Find the end of the opening tag (either `/>` or `>`)
    let depth = { brace: 0, bracket: 0, paren: 0 };
    let inString = null; // null, '"', "'", '`'
    let propsStart = i;
    let selfClosing = false;
    let openTagEnd = -1;

    while (i < len) {
      const ch = text[i];
      const prev = i > 0 ? text[i - 1] : '';

      // Handle strings
      if (inString) {
        if (inString === '`') {
          // Template literal: handle ${...}
          if (ch === '$' && i + 1 < len && text[i + 1] === '{') {
            depth.brace++;
            i += 2;
            continue;
          }
          if (ch === '`' && prev !== '\\') {
            inString = null;
          }
        } else if (ch === inString && prev !== '\\') {
          inString = null;
        }
        i++;
        continue;
      }

      if (ch === '"' || ch === "'" || ch === '`') {
        inString = ch;
        i++;
        continue;
      }

      // Track nesting
      if (ch === '{') { depth.brace++; i++; continue; }
      if (ch === '}') { depth.brace--; i++; continue; }
      if (ch === '[') { depth.bracket++; i++; continue; }
      if (ch === ']') { depth.bracket--; i++; continue; }
      if (ch === '(') { depth.paren++; i++; continue; }
      if (ch === ')') { depth.paren--; i++; continue; }

      // Only look for tag end when we're at the top level (no nested braces/brackets)
      if (depth.brace === 0 && depth.bracket === 0 && depth.paren === 0) {
        if (ch === '/' && i + 1 < len && text[i + 1] === '>') {
          // Self-closing tag />
          selfClosing = true;
          openTagEnd = i + 2;
          break;
        }
        if (ch === '>') {
          openTagEnd = i + 1;
          break;
        }
      }

      i++;
    }

    if (openTagEnd === -1) return null;

    const propsString = text.substring(propsStart, selfClosing ? i : i).trim();

    if (selfClosing) {
      return {
        fullMatch: text.substring(startIdx, openTagEnd),
        propsString,
        children: ''
      };
    }

    // Phase 2: Find closing tag </ComponentName>
    const closingTag = `</${componentName}>`;
    let tagDepth = 1;
    let j = openTagEnd;
    const openTag = `<${componentName}`;

    while (j < len && tagDepth > 0) {
      // Check for nested opening tags of same component
      if (text.substring(j, j + openTag.length) === openTag) {
        tagDepth++;
        j += openTag.length;
        continue;
      }
      if (text.substring(j, j + closingTag.length) === closingTag) {
        tagDepth--;
        if (tagDepth === 0) break;
        j += closingTag.length;
        continue;
      }
      j++;
    }

    if (tagDepth !== 0) return null;

    const children = text.substring(openTagEnd, j);
    const fullEnd = j + closingTag.length;

    return {
      fullMatch: text.substring(startIdx, fullEnd),
      propsString,
      children
    };
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

  // ---- Prop extraction helpers ----

  /** Extract a simple string prop: prop="value" */
  extractStringProp(propsString, propName) {
    // Match prop="value" or prop='value'
    const regex = new RegExp(`${propName}=["']([^"']*?)["']`);
    const match = propsString.match(regex);
    return match ? match[1] : null;
  }

  /** Extract an array prop: prop={[...]} — returns the raw string inside [...] */
  extractArrayProp(propsString, propName) {
    const marker = `${propName}={[`;
    const idx = propsString.indexOf(marker);
    if (idx === -1) return null;

    let i = idx + marker.length;
    let depth = 1;
    let inString = null;
    const len = propsString.length;

    while (i < len && depth > 0) {
      const ch = propsString[i];
      const prev = i > 0 ? propsString[i - 1] : '';

      if (inString) {
        if (inString === '`') {
          if (ch === '$' && i + 1 < len && propsString[i + 1] === '{') {
            i += 2; continue;
          }
          if (ch === '`' && prev !== '\\') inString = null;
        } else if (ch === inString && prev !== '\\') {
          inString = null;
        }
        i++; continue;
      }

      if (ch === '"' || ch === "'" || ch === '`') { inString = ch; i++; continue; }
      if (ch === '[' || ch === '{' || ch === '(') { depth++; i++; continue; }
      if (ch === ']') { depth--; if (depth === 0) break; i++; continue; }
      if (ch === '}' || ch === ')') { depth--; i++; continue; }
      i++;
    }

    return propsString.substring(idx + marker.length, i);
  }

  /** Split an array string into individual object items (top-level { ... } blocks) */
  parseSimpleArray(arrayContent) {
    const items = [];
    let depth = 0;
    let inString = null;
    let start = -1;

    for (let i = 0; i < arrayContent.length; i++) {
      const ch = arrayContent[i];
      const prev = i > 0 ? arrayContent[i - 1] : '';

      if (inString) {
        if (inString === '`') {
          if (ch === '$' && i + 1 < arrayContent.length && arrayContent[i + 1] === '{') {
            i++; continue;
          }
          if (ch === '`' && prev !== '\\') inString = null;
        } else if (ch === inString && prev !== '\\') {
          inString = null;
        }
        continue;
      }

      if (ch === '"' || ch === "'" || ch === '`') { inString = ch; continue; }

      if (ch === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          items.push(arrayContent.substring(start, i + 1));
          start = -1;
        }
      }
    }

    return items;
  }

  /** Extract a simple field value from an object string: field: 'value' or field: "value" */
  getObjectField(objString, fieldName) {
    // Match: fieldName: 'value' or fieldName: "value"
    const regex = new RegExp(`${fieldName}:\\s*['"]([\\s\\S]*?)(?<!\\\\)['"]`);
    const match = objString.match(regex);
    return match ? match[1] : null;
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

  /** Extract a template literal field: field: `value` */
  extractTemplateLiteral(objString, fieldName) {
    const marker = `${fieldName}: \``;
    let idx = objString.indexOf(marker);
    if (idx === -1) {
      // Try without space
      const marker2 = `${fieldName}:\``;
      idx = objString.indexOf(marker2);
      if (idx === -1) return null;
      idx += marker2.length;
    } else {
      idx += marker.length;
    }

    let i = idx;
    let depth = 0;
    const len = objString.length;

    while (i < len) {
      const ch = objString[i];
      if (ch === '$' && i + 1 < len && objString[i + 1] === '{') {
        depth++;
        i += 2;
        continue;
      }
      if (ch === '}' && depth > 0) {
        depth--;
        i++;
        continue;
      }
      if (ch === '`' && depth === 0) {
        return objString.substring(idx, i);
      }
      i++;
    }

    return objString.substring(idx);
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
      lines.push(`- [${page.title}](${page.url}): ${description}`);
    });
    
    return lines.join('\n');
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
