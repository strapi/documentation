/**
 * Script to convert redirects format between source/destination and from/to
 * Can convert in both directions and allows custom input/output file names
 */

const fs = require('fs');

// Configuration object with default values
const config = {
    inputFile: 'vercel.json',              // Default input file
    outputFile: 'redirects-converted.js',  // Default output file
    mode: 'to-from',                       // 'to-from' or 'to-source'
    outputFormat: 'js'                     // 'js' or 'json'
};

/**
 * Parse command line arguments
 * Example: node convert-redirects.js --input=vercel.json --output=redirects.js --mode=to-from
 */
function parseArguments() {
    process.argv.slice(2).forEach(arg => {
        const [key, value] = arg.replace('--', '').split('=');
        if (key && value) {
            config[key] = value;
        }
    });
}

/**
 * Convert redirects from source/destination to from/to format
 */
function convertToFrom(redirects) {
    return redirects.map(redirect => ({
        from: redirect.source,
        to: redirect.destination
    }));
}

/**
 * Convert redirects from from/to to source/destination format
 */
function convertToSource(redirects) {
    return redirects.map(redirect => ({
        source: redirect.from,
        destination: redirect.to,
        permanent: true
    }));
}

/**
 * Read and parse the input file
 */
function readInputFile() {
    const content = fs.readFileSync(config.inputFile, 'utf8');
    if (config.inputFile.endsWith('.js')) {
        // Handle JS module format
        const cleaned = content.replace('module.exports =', '');
        return eval(cleaned);
    }
    return JSON.parse(content);
}

/**
 * Format the output content based on the configuration
 */
function formatOutput(redirects) {
    const content = JSON.stringify(redirects, null, 2);
    if (config.outputFormat === 'js') {
        return `module.exports = ${content};`;
    }
    // If it's JSON format and contains redirects array
    if (config.mode === 'to-source') {
        return JSON.stringify({ redirects }, null, 2);
    }
    return content;
}

try {
    // Parse command line arguments
    parseArguments();

    // Read input file
    const inputData = readInputFile();
    const redirects = inputData.redirects || inputData;

    // Convert based on mode
    const converted = config.mode === 'to-from' 
        ? convertToFrom(redirects)
        : convertToSource(redirects);

    // Save to output file
    const output = formatOutput(converted);
    fs.writeFileSync(config.outputFile, output, 'utf8');

    // Display statistics
    console.log('Conversion completed successfully!');
    console.log(`Input file: ${config.inputFile}`);
    console.log(`Output file: ${config.outputFile}`);
    console.log(`Mode: ${config.mode}`);
    console.log(`Number of redirects processed: ${converted.length}`);
    console.log(`Format: ${config.mode === 'to-from' ? 'from/to' : 'source/destination'}`);

} catch (error) {
    console.error('Error during conversion:', error.message);
    process.exit(1);
}