const fs = require('fs');
const path = require('path');

function loadUrls() {
    const urlsFile = path.join(__dirname, 'all-urls.txt');
    return fs.readFileSync(urlsFile, 'utf8')
        .split('\n')
        .filter(Boolean) // Remove empty lines
        .map(url => url.trim());
}

function loadRedirects() {
    const configPath = path.join(__dirname, '../docusaurus.config.js');
    const config = require(configPath);
    
    // Get redirects from config
    const redirects = config.redirects || [];
    
    // Create a map for easier lookup
    const redirectMap = new Map();
    
    redirects.forEach(redirect => {
        // Handle both object and array format
        const to = typeof redirect === 'object' ? redirect.to : redirect[1];
        const from = typeof redirect === 'object' ? redirect.from : redirect[0];
        
        // Handle multiple 'from' paths if it's an array
        if (Array.isArray(from)) {
            from.forEach(f => redirectMap.set(f, to));
        } else {
            redirectMap.set(from, to);
        }
    });
    
    return redirectMap;
}

function checkRedirects() {
    try {
        const urls = loadUrls();
        const redirects = loadRedirects();
        
        console.log(`Found ${urls.length} URLs and ${redirects.size} redirects\n`);
        
        // URLs without redirects
        const missingRedirects = [];
        
        // Check each URL
        urls.forEach(url => {
            if (!redirects.has(url)) {
                missingRedirects.push(url);
            }
        });
        
        // Output results
        if (missingRedirects.length > 0) {
            console.log(`Found ${missingRedirects.length} URLs without redirects:\n`);
            missingRedirects.forEach(url => {
                console.log(`  ${url}`);
            });
            
            // Generate redirect config
            console.log('\nSuggested redirect configuration:\n');
            console.log('module.exports = {');
            console.log('  redirects: [');
            missingRedirects.forEach(url => {
                console.log(`    {`);
                console.log(`      from: '${url}',`);
                console.log(`      to: '${url}',  // TODO: Update with correct destination`);
                console.log(`    },`);
            });
            console.log('  ],');
            console.log('};');
        } else {
            console.log('All URLs have corresponding redirects! 🎉');
        }
        
    } catch (error) {
        console.error('Error during redirect check:', error);
        if (error.code === 'MODULE_NOT_FOUND') {
            console.error('\nMake sure you are running this script from the scripts folder and docusaurus.config.js exists.');
        }
    }
}

checkRedirects();