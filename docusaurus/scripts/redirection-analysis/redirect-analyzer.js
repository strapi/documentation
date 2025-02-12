const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const stringSimilarity = require('string-similarity');
const cliProgress = require('cli-progress');

// Script configuration
const VERBOSE = true;
const OLD_STRUCTURE_PATH = './scripts/redirection-analysis/old-structure';
const NEW_STRUCTURE_PATH = './scripts/redirection-analysis/new-structure';
const PATH_PREFIX = '/docusaurus/docs';

// Path configurations
const RESULTS_DIR = './scripts/redirection-analysis/results';
const ARCHIVES_DIR = path.join(RESULTS_DIR, 'archives');
const DETAILED_LOG_FILE = path.join(RESULTS_DIR, 'redirect-analysis-detailed.log');
const REPORT_FILE = path.join(RESULTS_DIR, 'redirect-analysis-report.md');
const VERCEL_FILE = path.join(RESULTS_DIR, 'vercel.json');

// 'Multibar' progression bar creation
const multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: '{bar} {percentage}% | {title}'
}, cliProgress.Presets.shades_grey);

// Directories to ignore 
const IGNORED_DIRECTORIES = [
  '.github',
  'archive',
  'snippets',
  'node_modules',
  '.git'
];

// Files to ignore
const IGNORED_FILES = [
  'README.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'SECURITY.md'
];

function initializeLogs() {
  fs.writeFileSync(DETAILED_LOG_FILE, `# Detailed analysis log\nDate: ${new Date().toISOString()}\n\n`, 'utf8');
  fs.writeFileSync(REPORT_FILE, `# Redirections analysis report\nDate: ${new Date().toISOString()}\n\n`, 'utf8');
}

function initializeDirectories() {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(ARCHIVES_DIR)) {
    fs.mkdirSync(ARCHIVES_DIR, { recursive: true });
  }
}

const OLD_STRUCTURE = {
  'dev-docs': '/dev-docs',
  'user-docs': '/user-docs',
  'cloud': '/cloud'
};

const NEW_STRUCTURE = {
  'cms': '/cms',
  'cloud': '/cloud'
};

// Manual mappings (fill if needed, otherwise leave as an empty object) 
const MANUAL_REDIRECTS = {
  // '/dev-docs/old-path': '/cms/new-path',
  '/dev-docs/advanced-features': '/cms/customization',
  '/dev-docs/plugins/users-permissions': '/cms/features/users-and-permissions',
  '/dev-docs/plugins/using-plugins': '/cms/plugins-development/developing-plugins',
  '/dev-docs/plugins': '/cms/plugins-development/developing-plugins',
  '/status': '/',
  '/user-docs/content-manager/adding-content-to-releases': '/cms/features/releases#including-content-in-a-release',
  '/user-docs/content-manager/configuring-view-of-content-type': '/cms/features/content-manager#configuration',
  '/user-docs/content-manager/managing-relational-fields': '/cms/features/content-manager#relational-fields',
  '/user-docs/content-manager/reviewing-content': '/cms/features/review-workflows',
  '/user-docs/content-manager/translating-content': '/cms/features/internationalization',
  '/user-docs/content-manager/writing-content': '/cms/features/content-manager',
  '/user-docs/content-type-builder/creating-new-content-type': '/cms/features/content-type-builder#creating-content-types',
  '/user-docs/content-type-builder/introduction-to-content-types-builder': '/cms/features/content-type-builder',
  '/user-docs/content-type-builder/managing-content-types': '/cms/features/content-type-builder#editing-content-types',
  '/user-docs/intro': '/cms/intro',
  '/user-docs/media-library/adding-assets': '/cms/features/media-library#adding-assets',
  '/user-docs/media-library/introduction-to-the-media-library': '/cms/features/media-library',
  '/user-docs/media-library/managing-assets': '/cms/features/media-library#managing-individual-assets',
  '/user-docs/media-library/organizing-assets-with-folders': '/cms/features/media-library#organizing-assets-with-folders',
  '/user-docs/settings/admin-panel': '/cms/features/admin-panel',
  '/user-docs/settings/configuring-users-permissions-plugin-settings': '/cms/features/users-permissions#admin-panel-configuration',
  '/user-docs/settings/internationalization': '/cms/features/internationalization#settings',
  '/user-docs/settings/introduction': '/cms/features/admin-panel',
  '/user-docs/settings/media-library-settings': '/cms/features/media-library#configuration',
  '/user-docs/settings/releases': '/cms/features/releases#configuration',
  '/user-docs/settings/single-sign-on': '/cms/features/sso',
  '/user-docs/users-roles-permissions/configuring-end-users-roles': '/cms/features/users-permissions#roles',
  '/user-docs/users-roles-permissions/introduction-to-users-roles-permissions': '/cms/features/users-permissions',
  '/user-docs/users-roles-permissions/managing-administrators': '/cms/features/rbac#usage',
  '/user-docs/users-roles-permissions/managing-end-users': '/cms/features/users-permissions#usage',
  "/dev-docs/integrations/11ty": "https://strapi.io/integrations/11ty-cms",
"/dev-docs/integrations/angular": "https://strapi.io/integrations/angular-cms",
"/dev-docs/integrations/dart": "https://strapi.io/integrations/dart-cms",
"/dev-docs/integrations/flutter": "https://strapi.io/integrations/flutter-cms",
"/dev-docs/integrations/gatsby": "https://strapi.io/integrations/gatsby-cms",
"/dev-docs/integrations/go": "https://strapi.io/integrations/go-cms",
"/dev-docs/integrations/graphql": "/cms/plugins/graphql",
"/dev-docs/integrations/gridsome": "https://strapi.io/integrations/gridsome-cms",
"/dev-docs/integrations/jekyll": "https://strapi.io/integrations/jekyll-cms",
"/dev-docs/integrations/laravel": "https://strapi.io/integrations/laravel-cms",
"/dev-docs/integrations/next-js": "https://strapi.io/integrations/nextjs-cms",
"/dev-docs/integrations/nuxt-js": "https://strapi.io/integrations/nuxtjs-cms",
"/dev-docs/integrations/php": "https://strapi.io/integrations/php-cms",
"/dev-docs/integrations/python": "https://strapi.io/integrations/python-cms",
"/dev-docs/integrations/react": "https://strapi.io/integrations/react-cms",
"/dev-docs/integrations/ruby": "https://strapi.io/integrations/ruby-cms",
"/dev-docs/integrations/sapper": "https://strapi.io/integrations/sapper-cms",
"/dev-docs/integrations/svelte": "https://strapi.io/integrations/svelte-cms",
"/dev-docs/integrations/vue-js": "https://strapi.io/integrations/vuejs-cms",
"/dev-docs/integrations": "https://strapi.io/integrations",
"/developer-docs/latest/setup-deployment-guides/installation/digitalocean-one-click.html": "https://strapi.io/integrations/digital-ocean",
"/developer-docs/latest/setup-deployment-guides/installation/digitalocean-one-click": "https://strapi.io/integrations/digital-ocean",
"/dev-docs/deployment/digitalocean": "https://strapi.io/integrations/digital-ocean",
"/dev-docs/deployment/digitalocean-app-platform": "https://strapi.io/integrations/digital-ocean",
"/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/digitalocean-app-platform.html": "https://strapi.io/integrations/digital-ocean",
"/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/google-app-engine.html": "https://forum.strapi.io/t/strapi-v4-on-google-app-engine/28629",
"/dev-docs/deployment/google-app-engine": "https://forum.strapi.io/t/strapi-v4-on-google-app-engine/28629",
"/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/heroku.html": "https://strapi.io/integrations/heroku",
"/dev-docs/deployment/heroku": "https://strapi.io/integrations/heroku",
"/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/amazon-aws.html": "https://strapi.io/integrations/aws",
"/dev-docs/deployment/amazon-aws": "https://strapi.io/integrations/aws",
"/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/azure.html": "https://strapi.io/integrations/azure",
"/dev-docs/deployment/azure": "https://strapi.io/integrations/azure",
"/developer-docs/latest/setup-deployment-guides/deployment/optional-software/process-manager.html": "https://forum.strapi.io/t/how-to-use-pm2-process-manager-with-strapi/",
"/dev-docs/deployment/process-manager": "https://forum.strapi.io/t/how-to-use-pm2-process-manager-with-strapi/",
"/dev-docs/deployment/nginx-proxy": "https://forum.strapi.io/t/nginx-proxing-with-strapi/",
"/developer-docs/latest/setup-deployment-guides/deployment/optional-software/nginx-proxy.html": "https://forum.strapi.io/t/nginx-proxing-with-strapi/",
"/developer-docs/latest/setup-deployment-guides/deployment/optional-software/haproxy-proxy.html": "https://forum.strapi.io/t/haproxy-proxying-with-strapi/",
"/dev-docs/deployment/haproxu-proxy": "https://forum.strapi.io/t/haproxy-proxying-with-strapi/",
"/developer-docs/latest/setup-deployment-guides/deployment/optional-software/caddy-proxy.html": "https://forum.strapi.io/t/caddy-proxying-with-strapi/",
"/dev-docs/deployment/caddy-proxy": "https://forum.strapi.io/t/caddy-proxying-with-strapi/",
"/developer-docs/latest/guides/process-manager.html": "https://forum.strapi.io/t/how-to-use-pm2-process-manager-with-strapi/",
"/developer-docs/latest/guides/external-data.html": "https://strapi.io/integrations",
"/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/qovery.html": "https://forum.strapi.io/t/qovery-deployment/21931",
"/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/render.html": "https://forum.strapi.io/t/render-deployment/21932",
"/dev-docs/migration/v3-to-v4/code/configuration": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/configuration",
"/dev-docs/migration/v3-to-v4/code/content-type-schema": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/content-type-schema",
"/dev-docs/migration/v3-to-v4/code/controllers": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/controllers",
"/dev-docs/migration/v3-to-v4/code/dependencies": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/dependencies",
"/dev-docs/migration/v3-to-v4/code/global-middlewares": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/global-middlewares",
"/dev-docs/migration/v3-to-v4/code/graphql": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/graphql",
"/dev-docs/migration/v3-to-v4/code/policies": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/policies",
"/dev-docs/migration/v3-to-v4/code/route-middlewares": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/route-middlewares",
"/dev-docs/migration/v3-to-v4/code/routes": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/routes",
"/dev-docs/migration/v3-to-v4/code/services": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/services",
"/dev-docs/migration/v3-to-v4/code-migration": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code-migration",
"/dev-docs/migration/v3-to-v4/code/backend": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/backend",
"/dev-docs/migration/v3-to-v4/code/frontend": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/frontend",
"/dev-docs/migration/v3-to-v4/code/strapi-global": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/strapi-global",
"/dev-docs/migration/v3-to-v4/code/theming": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/theming",
"/dev-docs/migration/v3-to-v4/code/translations": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/translations",
"/dev-docs/migration/v3-to-v4/code/webpack": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/webpack",
"/dev-docs/migration/v3-to-v4/code/wysiwyg": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/wysiwyg"
};

// Similarity threshold (0 to 1)
const SIMILARITY_THRESHOLD = 0.7;

function cleanPath(filePath) {
  if (filePath.startsWith(PATH_PREFIX)) {
    return filePath.substring(PATH_PREFIX.length);
  }
  return filePath;
}

function archiveOldReports() {
  if (!fs.existsSync(ARCHIVES_DIR)) {
    fs.mkdirSync(ARCHIVES_DIR, { recursive: true });
    console.log(`Created archive folder : ${ARCHIVES_DIR}`);
  }

  function archiveFile(filename) {
    if (fs.existsSync(filename)) {
      const stats = fs.statSync(filename);
      const creationDate = stats.birthtime;
      const timestamp = creationDate.toISOString().replace(/[:.]/g, '-');
      const baseFilename = path.basename(filename, path.extname(filename));
      const extension = path.extname(filename);
      const newFilename = path.join(ARCHIVES_DIR, `${timestamp}-${baseFilename}${extension}`);
      
      fs.renameSync(filename, newFilename);
      console.log(`Archived file ${filename} → ${newFilename}`);
    }
  }

  // Archive old reports and logs
  archiveFile(DETAILED_LOG_FILE);
  archiveFile(REPORT_FILE);
}

// Utility function for logs
function log(message, type = 'info') {
  if (!VERBOSE && type === 'verbose') return;
  
  const prefix = {
    'info': '📃',
    'success': '✅',
    'warning': '⚠️',
    'error': '❌',
    'verbose': '🔍'
  }[type] || '🔹';

  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const logMessage = `${timestamp} ${prefix} ${message}`;
  
  // Only console.log errors
  if (type === 'error') {
    console.error(logMessage);
  }
  
  // Always write to detailed log
  fs.appendFileSync(DETAILED_LOG_FILE, logMessage + '\n', 'utf8');
}

// Writes final report
function writeToReport(content) {
  fs.appendFileSync(REPORT_FILE, content + '\n', 'utf8');
}

function shouldIgnorePath(filePath) {
  const containsIgnoredDir = IGNORED_DIRECTORIES.some(dir => 
    filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`)
  );
  
  const fileName = path.basename(filePath);
  const isIgnoredFile = IGNORED_FILES.includes(fileName);

  return containsIgnoredDir || isIgnoredFile;
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  log(`Analysis of folder : ${dirPath}`, 'verbose');
  
  try {
    const files = fs.readdirSync(dirPath);
    log(`${files.length} files/folders found in ${dirPath}`, 'verbose');

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      
      if (shouldIgnorePath(filePath)) {
        log(`Ignored: ${filePath}`, 'verbose');
        return;
      }

      if (fs.statSync(filePath).isDirectory()) {
        log(`Exploring sub-folder : ${file}`, 'verbose');
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
        log(`Markdown file found: ${file}`, 'verbose');
        arrayOfFiles.push(filePath);
      }
    });

    return arrayOfFiles;
  } catch (error) {
    log(`Error reading folder ${dirPath}: ${error.message}`, 'error');
    return arrayOfFiles;
  }
}

function extractContent(filePath) {
  log(`Extracting content from: ${filePath}`, 'verbose');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: markdownContent } = matter(content);
    
    return {
      frontmatter,
      cleanContent: markdownContent
        .replace(/\s+/g, ' ')
        .replace(/[#*_`]/g, '')
        .trim()
    };
  } catch (error) {
    log(`Error reading file ${filePath}: ${error.message}`, 'error');
    return {
      frontmatter: {},
      cleanContent: ''
    };
  }
}

function findSimilarContent(oldFile, newFiles) {  
  log(`Looking for similar content for: ${oldFile}`, 'verbose');
  
  const { cleanContent: oldContent } = extractContent(oldFile);
  let bestMatch = {
    file: null,
    similarity: 0
  };

  for (const newFile of newFiles) {
    const { cleanContent: newContent } = extractContent(newFile);
    const similarity = stringSimilarity.compareTwoStrings(oldContent, newContent);

    log(`Comparison with ${newFile} : ${(similarity * 100).toFixed(1)}% similarity`, 'verbose');

    if (similarity > bestMatch.similarity) {
      bestMatch = {
        file: newFile,
        similarity
      };
      log(`New best match found: ${newFile}`, 'verbose');
    }
  }

  return bestMatch;
}

function calculateProgress(current, total, startProgress, endProgress) {
  return startProgress + ((current / total) * (endProgress - startProgress));
}

async function generateRedirections(oldFiles, newFiles, progressBars) {
  const { analysisBar, generationBar } = progressBars;
  
  log('Starting redirections generation', 'info');
  writeToReport('## Analysis results\n');
  generationBar.update(5);

  const redirects = [];
  const processedFiles = new Set();
  const unmatchedFiles = [];
  const redirectsByFolder = {};
  generationBar.update(10);

  // Phase 1: Manual redirections (10-20%)
  writeToReport('### Manual redirections\n');
  const manualRedirects = Object.entries(MANUAL_REDIRECTS);
  let currentProgress = 10;
  
  for (let i = 0; i < manualRedirects.length; i++) {
    const [oldPath, newPath] = manualRedirects[i];
    const cleanOldPath = cleanPath(oldPath);
    const cleanNewPath = cleanPath(newPath);
    
    if (cleanOldPath !== cleanNewPath) {
      redirects.push({
        source: cleanOldPath,
        destination: cleanNewPath,
        permanent: true,
        manual: true
      });
      const folder = cleanOldPath.split('/')[1];
      if (!redirectsByFolder[folder]) redirectsByFolder[folder] = [];
      redirectsByFolder[folder].push({ source: cleanOldPath, destination: cleanNewPath, manual: true });
      
      writeToReport(`- ✓ \`${cleanOldPath}\`\n  → \`${cleanNewPath}\`\n`);
    }
    processedFiles.add(cleanOldPath);
    
    currentProgress = calculateProgress(i + 1, manualRedirects.length, 10, 20);
    generationBar.update(currentProgress);
  }

  // Phase 2: Analyzing files (20-60%)
  writeToReport('\n### Automatic redirections\n');
  for (let i = 0; i < oldFiles.length; i++) {
    const oldFile = oldFiles[i];
    const relativePath = cleanPath('/' + path.relative(OLD_STRUCTURE_PATH, oldFile).replace(/\.mdx?$/, ''));
    log(`\nAnalysis of: ${relativePath}`, 'verbose');
    
    if (processedFiles.has(relativePath)) {
      log(`Fichier déjà traité : ${relativePath}`, 'verbose');
      if (analysisBar) {
        analysisBar.increment();
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      continue;
    }

    const { frontmatter } = extractContent(oldFile);
    const folder = relativePath.split('/')[1];
    if (!redirectsByFolder[folder]) redirectsByFolder[folder] = [];
    
    // Check frontmatter
    if (frontmatter.redirect_to) {
      const cleanRedirectTo = cleanPath(frontmatter.redirect_to);
      if (relativePath !== cleanRedirectTo) {
        redirects.push({
          source: relativePath,
          destination: cleanRedirectTo,
          permanent: true,
          fromFrontmatter: true
        });
        redirectsByFolder[folder].push({
          source: relativePath,
          destination: cleanRedirectTo,
          fromFrontmatter: true
        });
        processedFiles.add(relativePath);
        if (analysisBar) {
          analysisBar.increment();
          await new Promise(resolve => setTimeout(resolve, 0));
        }
        continue;
      }
    }

    // Find similar content
    const similarContent = findSimilarContent(oldFile, newFiles);
    
    if (similarContent.similarity >= SIMILARITY_THRESHOLD) {
      const newPath = cleanPath('/' + path.relative(NEW_STRUCTURE_PATH, similarContent.file).replace(/\.mdx?$/, ''));
      if (relativePath !== newPath) {
        redirects.push({
          source: relativePath,
          destination: newPath,
          permanent: true,
          similarity: similarContent.similarity
        });
        redirectsByFolder[folder].push({
          source: relativePath,
          destination: newPath,
          similarity: similarContent.similarity
        });
      }
      processedFiles.add(relativePath);
    } else {
      unmatchedFiles.push({
        path: relativePath,
        bestMatch: similarContent
      });
    }

    if (analysisBar) {
      analysisBar.increment();
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    currentProgress = calculateProgress(i + 1, oldFiles.length, 20, 60);
    generationBar.update(currentProgress);
  }

  // Phase 3: Grouping per folder (60-70%)
  const folders = Object.entries(redirectsByFolder);
  folders.forEach((folderEntry, index) => {
    const [folder, folderRedirects] = folderEntry;
    if (folderRedirects.length > 0) {
      writeToReport(`\n#### ${folder}\n`);
      folderRedirects.forEach(redirect => {
        if (redirect.manual) {
          writeToReport(`- ✓ \`${redirect.source}\`\n  → \`${redirect.destination}\` (manuel)\n`);
        } else if (redirect.fromFrontmatter) {
          writeToReport(`- ✓ \`${redirect.source}\`\n  → \`${redirect.destination}\` (frontmatter)\n`);
        } else {
          writeToReport(`- ✓ \`${redirect.source}\`\n  → \`${redirect.destination}\` (similarité : ${(redirect.similarity * 100).toFixed(1)}%)\n`);
        }
      });
    }
    currentProgress = calculateProgress(index + 1, folders.length, 60, 70);
    generationBar.update(currentProgress);
  });

  // Phase 4 : Handling files without match (70-80%)
  if (unmatchedFiles.length > 0) {
    writeToReport('\n### Files without match\n');
    unmatchedFiles.forEach((unmatchedFile, index) => {
      const { path: filePath, bestMatch } = unmatchedFile;
      if (bestMatch.file) {
        const suggestedPath = cleanPath('/' + path.relative(NEW_STRUCTURE_PATH, bestMatch.file).replace(/\.mdx?$/, ''));
        writeToReport(`- ⚠️ \`${filePath}\`\n  - Suggestion : \`${suggestedPath}\` (similarity : ${(bestMatch.similarity * 100).toFixed(1)}%)\n  - Action : Ajouter une redirection manuelle si pertinent\n`);
      } else {
        writeToReport(`- ⚠️ \`${filePath}\`\n  - No suggestion\n  - Action : Manual verification required\n`);
      }
      currentProgress = calculateProgress(index + 1, unmatchedFiles.length, 70, 80);
      generationBar.update(currentProgress);
    });
  } else {
    generationBar.update(80);
  }

  // Phase 5 : Génération des statistiques (80-90%)
  generationBar.update(85);
  const stats = {
    totalProcessed: redirects.length + unmatchedFiles.length,
    redirectsGenerated: redirects.length,
    unmatchedFiles: unmatchedFiles.length,
    redirectionsByType: {
      manual: redirects.filter(r => r.manual).length,
      frontmatter: redirects.filter(r => r.fromFrontmatter).length,
      similarity: redirects.filter(r => !r.fromFrontmatter && !r.manual).length
    }
  };

  const summary = `\n### Final statistics

- Files processed : ${stats.totalProcessed}
- Redirections generated : ${stats.redirectsGenerated}
- Files without match : ${stats.unmatchedFiles}

Redirections details:
- Manual : ${stats.redirectionsByType.manual}
- Via frontmatter : ${stats.redirectionsByType.frontmatter}
- By similarity : ${stats.redirectionsByType.similarity}`;

  writeToReport(summary);
  generationBar.update(90);

  // Phase 6 : Finalization and required actions (90-100%)
  if (stats.unmatchedFiles > 0) {
    writeToReport('\n### Required actions\n');
    writeToReport('1. Check files without match above');
    writeToReport('2. Add necessary manual redirections in MANUAL_REDIRECTS');
    writeToReport('3. Run the script again to validate modifications');
  }
  generationBar.update(95);

  await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to see progression
  return redirects;
}

async function main() {
  try {
  console.log('Starting redirections analysis...\n');

    initializeDirectories();
    archiveOldReports();
    initializeLogs();
    
    // Create progression bars 
    const progressBars = {
      scan: multibar.create(2, 0, { title: 'Scanning files          ' }),
      analysis: multibar.create(100, 0, { title: 'Analyzing matches      ' }),
      generation: multibar.create(100, 0, { title: 'Generating redirections' })
    };

    // Force initial display
    progressBars.scan.update(0);
    progressBars.analysis.update(0);
    progressBars.generation.update(0);
    
    // Scanning files
    const oldFiles = getAllFiles(OLD_STRUCTURE_PATH);
    progressBars.scan.increment();
    const newFiles = getAllFiles(NEW_STRUCTURE_PATH);
    progressBars.scan.increment();
    
    // Configuring analysis bar
    progressBars.analysis.setTotal(oldFiles.length);
    
    // Generating redirections
    progressBars.generation.update(10);
    const redirects = await generateRedirections(oldFiles, newFiles, {
      analysisBar: progressBars.analysis,
      generationBar: progressBars.generation
    });
    
    // Creating vercel.json file
    progressBars.generation.update(75);
    const vercelConfig = {
      redirects: redirects.map(redirect => ({
        source: redirect.source,
        destination: redirect.destination,
        permanent: redirect.permanent
      }))
    };
    
    fs.writeFileSync(
      VERCEL_FILE,
      JSON.stringify(vercelConfig, null, 2),
      'utf8'
    );
    
    progressBars.generation.update(90);
    progressBars.generation.update(100);
    
    // Stop progression bar
    multibar.stop();
    
    console.log('\nSuccessfully finished analysis! ✅\nHere are the available files:\n');
    console.log(`- 🔎 Detailed log: ${path.relative('.', DETAILED_LOG_FILE)}`);
    console.log(`- 💁 Final report: ${path.relative('.', REPORT_FILE)}`);
    console.log(`- 📝 Redirections file for Vercel: ${path.relative('.', VERCEL_FILE)}\n`);
  } catch (error) {
    multibar.stop();
    console.error('\nError :', error.message);
    log(`Error while executing script: ${error.message}`, 'error');
  }
}

main();