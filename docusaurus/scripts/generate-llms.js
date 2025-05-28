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
      console.log('🔍 Extraction des pages de documentation...');
      const pages = await this.extractAllPages();
      console.log(`📄 ${pages.length} pages trouvées`);

      console.log('📝 Génération de llms.txt...');
      const llmsTxt = this.generateLlmsTxt(pages);
      await fs.ensureDir(this.outputDir);
      await fs.writeFile(path.join(this.outputDir, 'llms.txt'), llmsTxt);

      console.log('📚 Génération de llms-full.txt...');
      const llmsFullTxt = this.generateLlmsFullTxt(pages);
      await fs.writeFile(path.join(this.outputDir, 'llms-full.txt'), llmsFullTxt);

      console.log('✅ Fichiers LLMs générés avec succès !');
      console.log(`   - ${this.outputDir}/llms.txt`);
      console.log(`   - ${this.outputDir}/llms-full.txt`);
    } catch (error) {
      console.error('❌ Erreur lors de la génération:', error);
      throw error;
    }
  }

  async extractAllPages() {
    const pages = [];
    
    // Charge la configuration sidebar
    const sidebarConfig = this.loadSidebarConfig();
    
    // Parse chaque sidebar
    for (const [sidebarName, sidebarItems] of Object.entries(sidebarConfig)) {
      await this.processItems(sidebarItems, pages);
    }

    // Trie les pages par URL pour un ordre cohérent
    return pages.sort((a, b) => a.url.localeCompare(b.url));
  }

  loadSidebarConfig() {
    try {
      // Supprime le cache pour recharger la config
      delete require.cache[require.resolve(path.resolve(this.sidebarPath))];
      return require(path.resolve(this.sidebarPath));
    } catch (error) {
      console.warn(`⚠️ Impossible de charger ${this.sidebarPath}, utilisation du scan de dossier`);
      return this.fallbackToDirectoryScan();
    }
  }

  async fallbackToDirectoryScan() {
    // Scan direct du dossier docs si sidebar.js n'est pas accessible
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
          
          pages.push({
            id: docId,
            title: frontmatter.title || this.getTitleFromContent(content) || docId,
            description: frontmatter.description || this.extractDescription(content),
            url: pageUrl,
            content: this.cleanContent(content),
            frontmatter
          });
          
          break; // Arrête dès qu'un fichier est trouvé
        } catch (error) {
          console.warn(`⚠️ Erreur lors du traitement de ${filePath}:`, error.message);
        }
      }
    }
  }

  generatePageUrl(docId) {
    // Supprime les préfixes courants et génère l'URL propre
    const cleanId = docId.replace(/^(docs\/|pages\/)/, '');
    return `${this.baseUrl}/${cleanId}`;
  }

  getTitleFromContent(content) {
    // Extrait le premier h1 du contenu
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  }

  extractDescription(content) {
    // Extrait le premier paragraphe non-vide
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
      // Supprime les métadonnées frontmatter
      .replace(/^---[\s\S]*?---\n/, '')
      // Supprime les composants React/MDX
      .replace(/<[A-Z][a-zA-Z]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z]*>/g, '')
      .replace(/<[A-Z][a-zA-Z]*[^>]*\/>/g, '')
      // Supprime les imports
      .replace(/^import\s+.*$/gm, '')
      // Supprime les exports
      .replace(/^export\s+.*$/gm, '')
      // Nettoie les lignes vides multiples
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

// Si le script est exécuté directement
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