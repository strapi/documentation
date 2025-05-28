const DocusaurusLlmsGenerator = require('../scripts/generate-llms');

function llmsGeneratorPlugin(context, options) {
  return {
    name: 'llms-generator-plugin',
    
    async postBuild({ outDir, baseUrl }) {
      console.log('🚀 Génération des fichiers LLMs...');
      
      const generator = new DocusaurusLlmsGenerator({
        docsDir: options.docsDir || 'docs',
        sidebarPath: options.sidebarPath || 'sidebars.js',
        baseUrl: baseUrl || context.siteConfig.url,
        outputDir: outDir,
        siteName: options.siteName || context.siteConfig.title
      });
      
      try {
        await generator.generate();
        console.log('✅ Fichiers LLMs générés avec succès dans le build !');
      } catch (error) {
        console.error('❌ Erreur lors de la génération des fichiers LLMs:', error);
        // Ne pas faire échouer le build pour cette erreur
      }
    },

    async loadContent() {
      // Génère aussi pendant le développement si nécessaire
      if (process.env.NODE_ENV === 'development' && options.generateInDev) {
        const generator = new DocusaurusLlmsGenerator({
          docsDir: options.docsDir || 'docs',
          sidebarPath: options.sidebarPath || 'sidebars.js',
          baseUrl: context.siteConfig.url,
          outputDir: 'static',
          siteName: options.siteName || context.siteConfig.title
        });
        
        try {
          await generator.generate();
        } catch (error) {
          console.warn('⚠️ Génération LLMs en développement échouée:', error.message);
        }
      }
    },

    configureWebpack(config, isServer) {
      // Ajoute des routes pour servir les fichiers LLMs en développement
      if (!isServer && process.env.NODE_ENV === 'development') {
        return {
          devServer: {
            setupMiddlewares: (middlewares, devServer) => {
              // Middleware pour servir llms.txt
              devServer.app.get('/llms.txt', async (req, res) => {
                try {
                  const generator = new DocusaurusLlmsGenerator({
                    docsDir: options.docsDir || 'docs',
                    sidebarPath: options.sidebarPath || 'sidebars.js',
                    baseUrl: context.siteConfig.url,
                    outputDir: 'static',
                    siteName: options.siteName || context.siteConfig.title
                  });
                  
                  const pages = await generator.extractAllPages();
                  const content = generator.generateLlmsTxt(pages);
                  
                  res.type('text/plain');
                  res.send(content);
                } catch (error) {
                  res.status(500).send('Erreur lors de la génération de llms.txt');
                }
              });

              // Middleware pour servir llms-full.txt
              devServer.app.get('/llms-full.txt', async (req, res) => {
                try {
                  const generator = new DocusaurusLlmsGenerator({
                    docsDir: options.docsDir || 'docs',
                    sidebarPath: options.sidebarPath || 'sidebars.js',
                    baseUrl: context.siteConfig.url,
                    outputDir: 'static',
                    siteName: options.siteName || context.siteConfig.title
                  });
                  
                  const pages = await generator.extractAllPages();
                  const content = generator.generateLlmsFullTxt(pages);
                  
                  res.type('text/plain');
                  res.send(content);
                } catch (error) {
                  res.status(500).send('Erreur lors de la génération de llms-full.txt');
                }
              });

              return middlewares;
            }
          }
        };
      }
      return {};
    }
  };
}

module.exports = llmsGeneratorPlugin;