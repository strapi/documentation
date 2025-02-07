#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration par défaut
const DEFAULT_CONFIG = {
    docsDir: './docs',
    includeExtensions: ['.md', '.mdx'],
    sidebarsPath: './sidebars.js',
    docusaurusConfigPath: './docusaurus.config.js',
    outputFormat: 'text'
};

/**
 * Parse les arguments de la ligne de commande
 */
function parseArguments() {
    const args = process.argv.slice(2);
    const config = { ...DEFAULT_CONFIG };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--docs-dir':
                config.docsDir = args[++i];
                break;
            case '--sidebar':
                config.sidebarsPath = args[++i];
                break;
            case '--json':
                config.outputFormat = 'json';
                break;
            case '--report':
                config.outputFormat = 'report';
                break;
            case '--help':
                console.log(`
Usage: find-orphans [options]

Options:
  --docs-dir <path>    Chemin vers le dossier de documentation (défaut: ./docs)
  --sidebar <path>     Chemin vers le fichier sidebars.js (défaut: ./sidebars.js)
  --json              Sortie au format JSON
  --report           Génère un rapport texte formaté
  --help              Affiche cette aide
`);
                process.exit(0);
        }
    }
    return config;
}

/**
 * Trouve tous les fichiers markdown dans le répertoire donné
 */
function findMarkdownFiles(rootDir) {
    const files = [];

    function traverse(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                traverse(fullPath);
            } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
                files.push(fullPath);
            }
        }
    }

    traverse(rootDir);
    return files;
}

/**
 * Extrait tous les liens d'un fichier markdown
 */
function extractLinksFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const links = new Set();

    // Liste des patterns à chercher
    const patterns = [
        // Liens Markdown standards [texte](lien)
        /\[([^\]]+)\]\(([^)]+)\)/g,

        // Liens dans les tables Markdown | [texte](/lien) |
        /\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|/g,

        // Liens dans les listes - [texte](/lien)
        /^\s*[-*]\s*\[([^\]]+)\]\(([^)]+)\)/gm,

        // Liens @site/docs/
        /@site\/docs\/([^'\s]+)/g,

        // Liens dans les admonitions :::tip [texte](/lien)
        /:{3}[a-z]+\s+\[([^\]]+)\]\(([^)]+)\)/g,

        // Liens dans les composants Docusaurus (attribut link)
        /link="([^"]+)"/g,

        // Liens dans les imports MDX
        /from\s+['"]([^'"]+)['"]/g,

        // Attributs href des liens
        /href="([^"]+)"/g,

        // Liens dans les composants CustomDocCard
        /<CustomDocCard[^>]+link="([^"]+)"/g,

        // Liens dans les redirections
        /to="([^"]+)"/g
    ];

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            let link;

            if (pattern.source.includes('@site')) {
                // Pour les liens @site/docs/
                link = match[1];
            } else if (pattern.source.includes('from') ||
                      pattern.source.includes('link=') ||
                      pattern.source.includes('href=') ||
                      pattern.source.includes('to=')) {
                // Pour les imports et attributs
                link = match[1];
            } else {
                // Pour tous les autres types de liens
                link = match[2] || match[1];
            }

            if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
                // Nettoie les liens qui commencent par /docs/
                link = link.replace(/^\/docs\//, '');
                // Nettoie les liens qui commencent par @site/docs/
                link = link.replace(/^@site\/docs\//, '');
                links.add(cleanPath(link));
            }
        }
    });

    return links;
}

/**
 * Nettoie et normalise un chemin de fichier
 */
function cleanPath(filepath) {
    if (!filepath) return filepath;

    let cleaned = filepath.split('#')[0]; // Enlève les anchors
    cleaned = cleaned.trim();

    // Ajoute .md si pas d'extension et si ce n'est pas un dossier
    if (!path.extname(cleaned) && !cleaned.endsWith('/')) {
        cleaned = cleaned + '.md';
    }

    // Normalise les slashes et enlève les slashes au début
    cleaned = cleaned.replace(/\\/g, '/').replace(/^\/+/, '');

    return cleaned;
}

/**
 * Extrait toutes les références de fichiers du sidebar
 */
function extractSidebarReferences(sidebarsPath) {
    const references = new Set();

    try {
        const sidebarConfig = require(path.resolve(sidebarsPath));

        function extractRefs(item) {
            if (typeof item === 'string' && !item.startsWith('@')) {
                references.add(item);
                references.add(item + '.md');
            } else if (typeof item === 'object' && item !== null) {
                if (item.id && typeof item.id === 'string') {
                    references.add(item.id);
                    references.add(item.id + '.md');
                }

                if (item.link && item.link.id) {
                    references.add(item.link.id);
                    references.add(item.link.id + '.md');
                }

                if (item.dirName) {
                    references.add(item.dirName);
                }

                if (Array.isArray(item.items)) {
                    item.items.forEach(extractRefs);
                }

                Object.values(item).forEach(value => {
                    if (Array.isArray(value)) {
                        value.forEach(extractRefs);
                    }
                });
            }
        }

        Object.values(sidebarConfig).forEach(sidebar => {
            if (Array.isArray(sidebar)) {
                sidebar.forEach(extractRefs);
            }
        });

    } catch (error) {
        console.warn(chalk.yellow(`⚠️  Attention: Erreur lors du chargement de sidebars.js (${error.message})`));
    }

    return references;
}

/**
 * Analyse la documentation pour trouver les pages orphelines
 */
function analyzeDocumentation(config) {
    const allFiles = findMarkdownFiles(config.docsDir);
    const fileReferences = new Map();

    // Collecte toutes les références
    allFiles.forEach(filePath => {
        const links = extractLinksFromFile(filePath);
        links.forEach(link => {
            if (!fileReferences.has(link)) {
                fileReferences.set(link, new Set());
            }
            fileReferences.get(link).add(filePath);
        });
    });

    const sidebarReferences = extractSidebarReferences(config.sidebarsPath);

    let docusaurusConfig = '';
    try {
        docusaurusConfig = fs.readFileSync(config.docusaurusConfigPath, 'utf-8');
    } catch (error) {
        console.warn(chalk.yellow(`⚠️  Attention: Impossible de lire le docusaurus.config.js (${error.message})`));
    }

    const results = allFiles.map(file => {
        const relPath = path.relative(config.docsDir, file).replace(/\\/g, '/');
        const referencedBy = Array.from(fileReferences.entries())
            .filter(([_, refs]) => refs.has(file))
            .map(([source, _]) => source);

        const inSidebar = Array.from(sidebarReferences).some(ref => {
            const refPath = ref.replace(/^\.\//, '');
            const relPathNoExt = relPath.replace(/\.md$/, '');
            return refPath === relPath || refPath === relPathNoExt;
        });

        // Détermination du statut détaillé
        const status = {
            inSidebar,
            inDocusaurusConfig: docusaurusConfig.includes(relPath),
            hasIncomingLinks: referencedBy.length > 0,
            referencedBy: referencedBy,
            category: inSidebar ? 'referenced' :
                     referencedBy.length > 0 ? 'linked_only' :
                     docusaurusConfig.includes(relPath) ? 'config_only' :
                     'fully_orphaned'
        };

        return {
            file: relPath,
            ...status
        };
    });

    // Regroupement par catégorie pour l'affichage
    const categorizedResults = {
        totalFiles: allFiles.length,
        fully_orphaned: results.filter(r => r.category === 'fully_orphaned'),
        linked_only: results.filter(r => r.category === 'linked_only'),
        config_only: results.filter(r => r.category === 'config_only'),
        referenced: results.filter(r => r.category === 'referenced')
    };

    return categorizedResults;
}

/**
 * Génère un rapport texte formaté
 */
function generateTextReport(results) {
    const lines = [];
    const separator = '='.repeat(80);

    // En-tête
    lines.push(separator);
    lines.push('RAPPORT D\'ANALYSE DE LA DOCUMENTATION');
    lines.push(`Généré le ${new Date().toLocaleString()}`);
    lines.push(separator);

    // Statistiques globales
    lines.push('\nSTATISTIQUES GLOBALES');
    lines.push('-'.repeat(30));
    lines.push(`Total des fichiers : ${results.totalFiles}`);
    lines.push(`Pages correctement référencées : ${results.referenced.length}`);
    lines.push(`Pages uniquement dans le sidebar : ${results.config_only.length}`);
    lines.push(`Pages uniquement liées : ${results.linked_only.length}`);
    lines.push(`Pages complètement orphelines : ${results.fully_orphaned.length}`);

    // Pages orphelines
    if (results.fully_orphaned.length > 0) {
        lines.push('\nPAGES COMPLÈTEMENT ORPHELINES');
        lines.push('-'.repeat(30));
        lines.push('Ces pages ne sont référencées nulle part :');
        results.fully_orphaned.forEach(result => {
            lines.push(`• ${result.file}`);
        });
    }

    // Pages liées uniquement
    if (results.linked_only.length > 0) {
        lines.push('\nPAGES RÉFÉRENCÉES UNIQUEMENT PAR DES LIENS');
        lines.push('-'.repeat(30));
        lines.push('Ces pages ne sont pas dans le sidebar mais sont liées depuis d\'autres pages :');
        results.linked_only.forEach(result => {
            lines.push(`\n• ${result.file}`);
            lines.push('  Référencé par :');
            result.referencedBy.forEach(ref => {
                lines.push(`  - ${ref}`);
            });
        });
    }

    // Pages dans config uniquement
    if (results.config_only.length > 0) {
        lines.push('\nPAGES UNIQUEMENT DANS DOCUSAURUS.CONFIG.JS');
        lines.push('-'.repeat(30));
        results.config_only.forEach(result => {
            lines.push(`• ${result.file}`);
        });
    }

    // Pied de page
    lines.push('\n' + separator);
    lines.push('FIN DU RAPPORT');
    lines.push(separator);

    return lines.join('\n');
}

/**
 * Affiche les résultats en mode console avec des couleurs
 */
function displayConsoleResults(results) {
    console.log('\n' + chalk.bold('Analyse de la documentation :'));
    console.log(`Total des fichiers : ${chalk.blue(results.totalFiles)}`);

    console.log('\n📊 ' + chalk.bold('Répartition des pages :'));
    console.log(`- Pages correctement référencées : ${chalk.green(results.referenced.length)}`);
    console.log(`- Pages uniquement dans le sidebar : ${chalk.yellow(results.config_only.length)}`);
    console.log(`- Pages uniquement liées : ${chalk.yellow(results.linked_only.length)}`);
    console.log(`- Pages complètement orphelines : ${chalk.red(results.fully_orphaned.length)}`);

    if (results.fully_orphaned.length > 0) {
        console.log('\n🚫 ' + chalk.red.bold('Pages complètement orphelines (non référencées nulle part) :'));
        results.fully_orphaned.forEach(result => {
            console.log(`\n📄 ${chalk.red(result.file)}`);
        });
    }

    if (results.linked_only.length > 0) {
        console.log('\n⚠️  ' + chalk.yellow.bold('Pages référencées uniquement par des liens (pas dans le sidebar) :'));
        results.linked_only.forEach(result => {
            console.log(`\n📄 ${chalk.yellow(result.file)}`);
            console.log('   Référencé par :');
            result.referencedBy.forEach(ref => console.log(`   • ${chalk.gray(ref)}`));
        });
    }

    if (results.config_only.length > 0) {
        console.log('\n⚠️  ' + chalk.yellow.bold('Pages uniquement dans docusaurus.config.js :'));
        results.config_only.forEach(result => {
            console.log(`\n📄 ${chalk.yellow(result.file)}`);
        });
    }
}

// Fonction principale
function main() {
    const config = parseArguments();
    const results = analyzeDocumentation(config);

    switch (config.outputFormat) {
        case 'json':
            console.log(JSON.stringify
