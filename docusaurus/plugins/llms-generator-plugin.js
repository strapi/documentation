const path = require('path');

function llmsGeneratorPlugin(context, options) {
  return {
    name: 'llms-generator-plugin',
    
    async postBuild({ outDir, baseUrl }) {
      console.log('🚀 Generating LLM files...');
      
      try {
        // Dynamic import server-side with the right path
        const DocusaurusLlmsGenerator = require(path.resolve(__dirname, '../scripts/generate-llms'));
        
        const generator = new DocusaurusLlmsGenerator({
          docsDir: options.docsDir || 'docs',
          sidebarPath: options.sidebarPath || 'sidebars.js',
          baseUrl: baseUrl || context.siteConfig.url,
          outputDir: outDir,
          siteName: options.siteName || context.siteConfig.title
        });
        
        await generator.generate();
        console.log('✅ Successfully generated LLMs files in build !');
      } catch (error) {
        console.error('❌ Error while trying to generate LLM files:', error);
        // Don't make the build fail because of this error
      }
    },

    async loadContent() {
      // Generate while development - only server-side
      if (process.env.NODE_ENV === 'development') {
        try {
          // Absolute path import to avoid issues
          const DocusaurusLlmsGenerator = require(path.resolve(process.cwd(), 'scripts/generate-llms'));
          
          const generator = new DocusaurusLlmsGenerator({
            docsDir: options.docsDir || 'docs',
            sidebarPath: options.sidebarPath || 'sidebars.js',
            baseUrl: context.siteConfig.url,
            outputDir: path.resolve(process.cwd(), 'static'),
            siteName: options.siteName || context.siteConfig.title
          });
          
          await generator.generate();
          console.log('✅ Successfully generated LLMs files for development in /static/');
        } catch (error) {
          console.warn('⚠️ Failed generating LLMs files for development:', error.message);
        }
      }
      
      return {}; // loadContent should return something
    },

    configureWebpack(config, isServer) {
      // Add fallbacks to avoid Webpack errors client side
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
    }

    // Files are served directly from /static/ while on dev mode
    // and from /build/ in production
  };
}

module.exports = llmsGeneratorPlugin;
