const path = require('path');

function llmsGeneratorPlugin(context, options) {
  return {
    name: 'llms-generator-plugin',
    
    async postBuild({ outDir, baseUrl }) {
      console.log('🚀 Génération des fichiers LLMs...');
      
      try {
        // Import dynamique côté serveur avec le bon chemin
        const DocusaurusLlmsGenerator = require(path.resolve(__dirname, '../../scripts/generate-llms'));
        
        const generator = new DocusaurusLlmsGenerator({
          docsDir: options.docsDir || 'docs',
          sidebarPath: options.sidebarPath || 'sidebars.js',
          baseUrl: baseUrl || context.siteConfig.url,
          outputDir: outDir,
          siteName: options.siteName || context.siteConfig.title
        });
        
        await generator.generate();
        console.log('✅ Fichiers LLMs générés avec succès dans le build !');
      } catch (error) {
        console.error('❌ Erreur lors de la génération des fichiers LLMs:', error);
        // Ne pas faire échouer le build pour cette erreur
      }
    },

    async loadContent() {
      // Génère pendant le développement - UNIQUEMENT côté serveur
      if (process.env.NODE_ENV === 'development') {
        try {
          // Import avec chemin absolu pour éviter les problèmes
          const DocusaurusLlmsGenerator = require(path.resolve(process.cwd(), 'scripts/generate-llms'));
          
          const generator = new DocusaurusLlmsGenerator({
            docsDir: options.docsDir || 'docs',
            sidebarPath: options.sidebarPath || 'sidebars.js',
            baseUrl: context.siteConfig.url,
            outputDir: path.resolve(process.cwd(), 'static'),
            siteName: options.siteName || context.siteConfig.title
          });
          
          await generator.generate();
          console.log('✅ Fichiers LLMs générés pour le développement dans /static/');
        } catch (error) {
          console.warn('⚠️ Génération LLMs en développement échouée:', error.message);
        }
      }
      
      return {}; // loadContent doit retourner quelque chose
    },

    configureWebpack(config, isServer) {
      // Ajoute les fallbacks pour éviter les erreurs Webpack côté client
      if (!isServer) {
        return {
          resolve: {
            fallback: {
              "fs": false,
              "path": false,
              "util": false,
              "assert": false,
              "stream": false,
              "constants": false,
              "os": false,
              "crypto": false,
              "http": false,
              "https": false,
              "url": false,
              "buffer": false,
              "process": false,
              "fs-extra": false,
              "gray-matter": false
            }
          }
        };
      }
      return {};
    },

    async contentLoaded({ content, actions }) {
      const { addRoute } = actions;
      
      // Ajoute les routes pour servir les fichiers
      addRoute({
        path: '/llms.txt',
        component: '@site/src/components/LlmsRoute',
        exact: true
      });

      addRoute({
        path: '/llms-full.txt', 
        component: '@site/src/components/LlmsFullRoute',
        exact: true
      });
    }
  };
}

module.exports = llmsGeneratorPlugin;