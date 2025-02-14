const fs = require('fs');
const path = require('path');

// Configuration par défaut
const DEFAULT_CONFIG = {
    exclude: [],
    excludeFolders: []
};

function loadConfig() {
    try {
        const configPath = path.join(__dirname, 'redirect-config.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return { ...DEFAULT_CONFIG, ...config };
        }
    } catch (error) {
        console.log('No custom configuration found, using defaults');
    }
    return DEFAULT_CONFIG;
}

function isUrlExcluded(url, config) {
    const isExcludedFolder = config.excludeFolders.some(folder => 
        url.startsWith(`/${folder}/`) || url === `/${folder}`
    );
    
    const isExcludedPattern = config.exclude.some(pattern => {
        if (pattern instanceof RegExp) {
            return pattern.test(url);
        }
        return url.includes(pattern);
    });

    return isExcludedFolder || isExcludedPattern;
}

function loadUrls() {
    const urlsFile = path.join(__dirname, 'all-urls.txt');
    const config = loadConfig();
    
    return fs.readFileSync(urlsFile, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map(url => url.trim())
        .filter(url => !isUrlExcluded(url, config));
}

function loadVercelRedirects() {
    try {
        const vercelPath = path.join(__dirname, '../vercel.json');
        const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
        const redirectMap = new Map();

        if (vercelConfig.redirects) {
            vercelConfig.redirects.forEach(redirect => {
                redirectMap.set(redirect.source, redirect.destination);
            });
        }

        return redirectMap;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('No vercel.json file found');
            return new Map();
        }
        throw error;
    }
}

function loadDocusaurusRedirects() {
    try {
        const configPath = path.join(__dirname, '../docusaurus.config.js');
        const config = require(configPath);
        const redirectMap = new Map();
        
        const redirects = config.redirects || [];
        
        redirects.forEach(redirect => {
            const to = typeof redirect === 'object' ? redirect.to : redirect[1];
            const from = typeof redirect === 'object' ? redirect.from : redirect[0];
            
            if (Array.isArray(from)) {
                from.forEach(f => redirectMap.set(f, to));
            } else {
                redirectMap.set(from, to);
            }
        });
        
        return redirectMap;
    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
            console.log('No docusaurus.config.js file found');
            return new Map();
        }
        throw error;
    }
}

function writeToFile(content) {
    const outputPath = path.join(__dirname, 'redirect-analysis.md');
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`Analysis written to: ${outputPath}`);
}

function generateReport(urls, docusaurusRedirects, vercelRedirects, missingRedirects) {
    const config = loadConfig();
    let report = `# Redirect Analysis Report\n\n`;
    
    // Configuration section
    report += `## Configuration\n\n`;
    report += `### Excluded Folders\n\n`;
    if (config.excludeFolders.length > 0) {
        report += `\`\`\`\n${config.excludeFolders.join('\n')}\n\`\`\`\n\n`;
    } else {
        report += `No folders excluded\n\n`;
    }
    
    report += `### Excluded Patterns\n\n`;
    if (config.exclude.length > 0) {
        report += `\`\`\`\n${config.exclude.join('\n')}\n\`\`\`\n\n`;
    } else {
        report += `No patterns excluded\n\n`;
    }
    
    // Summary
    report += `## Summary\n\n`;
    report += `- Total URLs found: ${urls.length}\n`;
    report += `- Existing redirects in docusaurus.config.js: ${docusaurusRedirects.size}\n`;
    report += `- Existing redirects in vercel.json: ${vercelRedirects.size}\n`;
    report += `- URLs without redirects: ${missingRedirects.length}\n\n`;

    // List of URLs without redirects
    if (missingRedirects.length > 0) {
        report += `## URLs Without Redirects\n\n`;
        report += `\`\`\`\n${missingRedirects.join('\n')}\n\`\`\`\n\n`;
        
        // Docusaurus configuration template
        report += `## Suggested Docusaurus Configuration\n\n`;
        report += `Add this to your \`docusaurus.config.js\`:\n\n`;
        report += '```js\nmodule.exports = {\n  redirects: [\n';
        missingRedirects.forEach(url => {
            report += `    {\n`;
            report += `      from: '${url}',\n`;
            report += `      to: '${url}',  // TODO: Update with correct destination\n`;
            report += `    },\n`;
        });
        report += '  ],\n};\n```\n\n';

        // Vercel configuration template
        report += `## Suggested Vercel Configuration\n\n`;
        report += `Add this to your \`vercel.json\`:\n\n`;
        report += '```json\n{\n  "redirects": [\n';
        missingRedirects.forEach(url => {
            report += `    {\n`;
            report += `      "source": "${url}",\n`;
            report += `      "destination": "${url}",  // TODO: Update with correct destination\n`;
            report += `      "permanent": true\n`;
            report += `    },\n`;
        });
        report += '  ]\n}\n```\n';
    } else {
        report += `\n🎉 Great news! All URLs have corresponding redirects!\n`;
    }

    // List of existing redirects
    report += `\n## Existing Redirects\n\n`;
    
    report += `### In docusaurus.config.js\n\n`;
    report += `\`\`\`\n`;
    for (const [from, to] of docusaurusRedirects) {
        report += `${from} -> ${to}\n`;
    }
    report += `\`\`\`\n\n`;

    report += `### In vercel.json\n\n`;
    report += `\`\`\`\n`;
    for (const [from, to] of vercelRedirects) {
        report += `${from} -> ${to}\n`;
    }
    report += `\`\`\`\n`;

    return report;
}

function checkRedirects() {
    try {
        const urls = loadUrls();
        const docusaurusRedirects = loadDocusaurusRedirects();
        const vercelRedirects = loadVercelRedirects();
        
        const missingRedirects = urls.filter(url => 
            !docusaurusRedirects.has(url) && !vercelRedirects.has(url)
        );
        
        const report = generateReport(
            urls, 
            docusaurusRedirects, 
            vercelRedirects, 
            missingRedirects
        );
        writeToFile(report);
        
    } catch (error) {
        console.error('Error during redirect check:', error);
        if (error.code === 'MODULE_NOT_FOUND') {
            console.error('\nMake sure you are running this script from the scripts folder and configuration files exist.');
        }
    }
}

checkRedirects();