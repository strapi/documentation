# Redirects Format Converter

A Node.js script that converts redirect rules between different formats:
- source/destination (Vercel format)
- from/to (JavaScript module format)

## Features

- Converts between different redirect formats
- Configurable input and output files
- Supports both JSON and JavaScript module formats
- Preserves redirect rules structure
- Provides conversion statistics

## Prerequisites

- Node.js installed on your system

## Usage

### Basic Usage

From this folder, run:

```bash
node docusaurus-vercel-converter.js
```

This will use default settings:
- Input: `vercel.json`
- Output: `redirects.js`
- Mode: `to-from` (converts from source/destination to from/to)

### Custom Configuration

You can customize the behavior using command line arguments:

```bash
node docusaurus-vercel-converter.js --input=my-redirects.json --output=converted.js --mode=to-source
```

### Available Options

- `--input`: Input file name (default: 'vercel.json')
- `--output`: Output file name (default: 'redirects.js')
- `--mode`: Conversion mode (default: 'to-from')
  - `to-from`: Converts from source/destination to from/to
  - `to-source`: Converts from from/to to source/destination
- `--format`: Output format (default: based on file extension)
  - `js`: JavaScript module format
  - `json`: JSON format

## Input/Output Formats

### Input Format (source/destination)
```json
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path"
    }
  ]
}
```

### Output Format (from/to)
```javascript
module.exports = [
  {
    "from": "/old-path",
    "to": "/new-path"
  }
];
```

## Error Handling

The script includes error handling for:
- File reading/writing issues
- Invalid JSON/JavaScript syntax
- Missing required properties
- Invalid configuration

If an error occurs, the script will display an error message and exit with code 1.

## Examples

1. Convert from Vercel format to module format:
```bash
node docusaurus-vercel-converter.js --input=vercel.json --output=redirects.js --mode=to-from
```

2. Convert from module format to Vercel format:
```bash
node docusaurus-vercel-converter.js --input=redirects.js --output=vercel.json --mode=to-source
```

## Contributing

Feel free to submit issues and enhancement requests!
