const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');

class DocusaurusLlmsGenerator {
  constructor(config = {}) {
    this.docsDir = config.docsDir || '.';
    this.sidebarPath = config.sidebarPath || 'sidebars.js';
    this.baseUrl = config.baseUrl || 'https://docs-v4.strapi.io';
    this.outputDir = config.outputDir || 'static';
    this.siteName = config.siteName || 'Strapi v4 Documentation';
  }

  async generate() {
    try {
      console.log('🔍 Extracting documentation pages...');
      const pages = await this.extractAllPages();
      console.log(`📄 ${pages.length} pages found`);

      console.log('📝 Generating llms-v4.txt...');
      const llmsTxt = this.generateLlmsTxt(pages);
      await fs.ensureDir(this.outputDir);
      await fs.writeFile(path.join(this.outputDir, 'llms-v4.txt'), llmsTxt);

      console.log('📚 Generating llms-v4-full.txt...');
      const llmsFullTxt = this.generateLlmsFullTxt(pages);
      await fs.writeFile(path.join(this.outputDir, 'llms-v4-full.txt'), llmsFullTxt);

      console.log('✅ LLMs files successfully generated !');
      console.log(`   - ${this.outputDir}/llms-v4.txt`);
      console.log(`   - ${this.outputDir}/llms-v4-full.txt`);
    } catch (error) {
      console.error('❌ Error while trying to generate LLMs files:', error);
      throw error;
    }
  }

  async extractAllPages() {
    const pages = [];
    
    // Load sidebar configuration
    const sidebarConfig = this.loadSidebarConfig();
    
    // Process every sidebar
    for (const [sidebarName, sidebarItems] of Object.entries(sidebarConfig)) {
      await this.processItems(sidebarItems, pages);
    }

    // Sort pages by URL for a consistent and clear order
    return pages.sort((a, b) => a.url.localeCompare(b.url));
  }

  loadSidebarConfig() {
    try {
      // Delete cache to reload config
      delete require.cache[require.resolve(path.resolve(this.sidebarPath))];
      return require(path.resolve(this.sidebarPath));
    } catch (error) {
      console.warn(`⚠️ Failed to load ${this.sidebarPath}, using folder scan`);
      return this.fallbackToDirectoryScan();
    }
  }

  async fallbackToDirectoryScan() {
    // Direct scan of v4 docs folders if sidebars.js is not available
    const folders = ['docs/dev-docs', 'docs/user-docs', 'docs/cloud'];
    const allFiles = [];
    
    for (const folder of folders) {
      if (await fs.pathExists(folder)) {
        const files = await this.getAllMdFiles(folder);
        allFiles.push(...files.map(file => file.replace('.md', '').replace('docs/', '')));
      }
    }
    
    return { docs: allFiles };
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
      } else if (item.type === 'link') {
        // Skip link items as they point to external resources
        continue;
      } else if (item.items) {
        // Handle groups or other structures
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
          
          pages.push({
            id: docId,
            title: frontmatter.title || this.getTitleFromContent(content) || docId,
            description: frontmatter.description || this.extractDescription(content),
            url: pageUrl,
            content: this.cleanContent(content),
            frontmatter
          });
          
          break; // Stop once a file is found
        } catch (error) {
          console.warn(`⚠️ Error while handling file ${filePath}:`, error.message);
        }
      }
    }
  }

  generatePageUrl(docId) {
    // Delete common prefixes and generate proper URL
    const cleanId = docId.replace(/^(docs\/|pages\/)/, '');
    return `${this.baseUrl}/${cleanId}`;
  }

  getTitleFromContent(content) {
    // Extract first h1 from content
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  }

  extractDescription(content) {
    // Extract first non-empty paragraph
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
        return trimmed.substring(0, 150) + (trimmed.length > 150 ? '...' : '');
      }
    }
    return '';
  }

  cleanContent(content) {
    return content
      // Delete frontmatter metadata
      .replace(/^---[\s\S]*?---\n/, '')
      // Delete React/MDX components
      .replace(/<[A-Z][a-zA-Z]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z]*>/g, '')
      .replace(/<[A-Z][a-zA-Z]*[^>]*\/>/g, '')
      // Delete imports
      .replace(/^import\s+.*$/gm, '')
      // Delete exports
      .replace(/^export\s+.*$/gm, '')
      // Clean up empty lines
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
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

// If script is executed directly
if (require.main === module) {
  const generator = new DocusaurusLlmsGenerator({
    docsDir: 'docs',           // Les docs sont dans docs/
    sidebarPath: 'sidebars.js', // sidebars.js est ici même
    baseUrl: 'https://docs-v4.strapi.io',
    outputDir: 'static',
    siteName: 'Strapi v4 Documentation'
  });
  
  generator.generate().catch(console.error);
}