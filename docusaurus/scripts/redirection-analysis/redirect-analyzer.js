const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const stringSimilarity = require('string-similarity');
const cliProgress = require('cli-progress');

// Script configuration
const VERBOSE = true;
const OLD_STRUCTURE_PATH = './old-structure';
const NEW_STRUCTURE_PATH = './new-structure';
const PATH_PREFIX = '/docusaurus/docs';

// Path configurations
const RESULTS_DIR = './results';
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
      const newFilename = path.join(ARCHIVES_DIR, `${timestamp}-${baseFilename}-${extension}`);
      
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