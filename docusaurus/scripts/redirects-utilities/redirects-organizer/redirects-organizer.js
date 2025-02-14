/**
 * This script automatically organizes redirections from a redirects.js file
 * by analyzing URL patterns and grouping similar redirections together.
 * It preserves the original header comment and creates a new organized file.
 */

const fs = require('fs');

/**
 * Extract meaningful segments from a URL by removing file extensions
 * and filtering out segments with special characters
 */
function extractUrlSegments(url) {
    return url.replace(/\.(html|js)$/, '')
              .split('/')
              .filter(segment => segment && !segment.includes('%') && !segment.includes('#'));
}

/**
 * Analyze all URLs to find common patterns and their frequency
 * Returns an array of [segment, frequency] pairs sorted by frequency
 */
function findCommonPatterns(redirects) {
    const segmentFrequency = new Map();
    
    redirects.forEach(redirect => {
        const segments = extractUrlSegments(redirect.from);
        segments.forEach(segment => {
            segmentFrequency.set(segment, (segmentFrequency.get(segment) || 0) + 1);
        });
    });

    return Array.from(segmentFrequency.entries())
        .filter(([_, count]) => count > 1)
        .sort((a, b) => b[1] - a[1]);
}

/**
 * Create a category name based on URL patterns
 * Handles special cases for documentation sections and formats the category name
 */
function createCategory(url, significantSegments) {
    const segments = extractUrlSegments(url);
    
    for (const [segment] of significantSegments) {
        if (segments.includes(segment)) {
            // Special handling for documentation sections
            if (segment === 'dev-docs' || segment === 'developer-docs') {
                const nextSegment = segments[segments.indexOf(segment) + 1];
                if (nextSegment) {
                    return `Developer Documentation - ${nextSegment.replace(/-/g, ' ').toUpperCase()}`;
                }
                return 'Developer Documentation';
            }
            if (segment === 'user-docs') {
                const nextSegment = segments[segments.indexOf(segment) + 1];
                if (nextSegment) {
                    return `User Documentation - ${nextSegment.replace(/-/g, ' ').toUpperCase()}`;
                }
                return 'User Documentation';
            }
            
            // Format other categories (e.g., "backend-customization" -> "Backend Customization")
            return segment.split('-')
                         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                         .join(' ');
        }
    }
    
    return 'Core Redirections';
}

try {
    // Read the original redirects.js file
    const fileContent = fs.readFileSync('redirects.js', 'utf8');

    // Extract the header comment
    const headerCommentMatch = fileContent.match(/\/\*\*[\s\S]*?\*\//);
    const headerComment = headerCommentMatch ? headerCommentMatch[0] : '';

    // Extract and parse the redirections array
    const redirectsMatch = fileContent.match(/module\.exports\s*=\s*(\[[\s\S]*\]);/);
    if (!redirectsMatch) {
        throw new Error('Could not parse redirects array');
    }

    const redirects = eval(redirectsMatch[1]);
    const significantSegments = findCommonPatterns(redirects);
    const groupedRedirects = {};

    // Group redirections by category
    redirects.forEach(redirect => {
        const category = createCategory(redirect.from, significantSegments);
        if (!groupedRedirects[category]) {
            groupedRedirects[category] = [];
        }
        groupedRedirects[category].push(redirect);
    });

    // Sort categories by number of redirections
    const sortedCategories = Object.entries(groupedRedirects)
        .sort((a, b) => b[1].length - a[1].length);

    // Generate the new content
    let newContent = headerComment + '\nmodule.exports = [\n';

    // Add each group with its category comment
    sortedCategories.forEach(([category, redirects]) => {
        newContent += `\n  // ${category}\n`;
        redirects.forEach(redirect => {
            newContent += `  {\n    "from": "${redirect.from}",\n    "to": "${redirect.to}"\n  },\n`;
        });
    });

    // Finalize the file
    newContent = newContent.slice(0, -2);
    newContent += '\n];\n';

    // Write the organized file
    fs.writeFileSync('redirects.organized.js', newContent);

    // Display statistics in console
    console.log('Redirections have been organized automatically by URL patterns');
    console.log('\nCategories detected:');
    sortedCategories.forEach(([category, redirects]) => {
        console.log(`- ${category}: ${redirects.length} redirections`);
    });

} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}