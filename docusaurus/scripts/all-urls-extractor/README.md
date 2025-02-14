# Docusaurus URL Extraction Script

A Node.js script to extract all URLs from your Docusaurus documentation, including anchors to headings (H2-H6) on each page.

## Prerequisites

- Node.js installed
- A Docusaurus project with a generated build

## Installation

1. Create a `scripts` folder at the root of your Docusaurus project if it doesn't exist yet:
```bash
mkdir scripts
```

2. Copy the `extract-urls.js` file into this folder.

## Usage

1. First, generate a build of your documentation:
```bash
npm run build
# or
yarn build
```

2. Run the script:
```bash
node scripts/extract-urls.js
```

The script will generate an `all-urls.txt` file in the `scripts/` folder containing:
- One URL per line
- Main page URLs
- URLs with anchors to each heading (H2-H6)

Example output:
```
/docs/intro
/docs/intro#getting-started
/docs/intro#installation
/docs/advanced
/docs/advanced#configuration
```

## How it Works

The script:
1. Walks through all HTML files generated in the `build/` folder
2. Extracts each page URL based on the file structure
3. Parses the HTML content to find all headings with IDs
4. Generates corresponding anchor URLs

## Troubleshooting

If you get a "no such file or directory" error, check that:
1. You are at the root of your Docusaurus project
2. You have run `npm run build` before executing the script
3. The `build/` folder exists and contains HTML files