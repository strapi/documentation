const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Extract all markdown links from content
 * Looks for links in the format [text](/path)
 */
function getMarkdownLinks(content) {
  const pattern = /\[([^\]]+)\]\((\/[^)]+)\)/g;
  const matches = [...content.matchAll(pattern)];
  return new Set(matches.map(match => match[2]));
}

/**
 * Remove base URL from sitemap URLs to get path only
 */
function normalizeUrl(url) {
  return url.replace('https://docs.strapi.io', '');
}

/**
 * Compare sitemap URLs with markdown links to find orphaned pages
 */
function findOrphanPages(sitemapUrls, markdownContents) {
  const sitemapPaths = new Set(sitemapUrls.map(normalizeUrl));
  const allLinks = new Set();

  markdownContents.forEach(content => {
    const links = getMarkdownLinks(content);
    links.forEach(link => allLinks.add(link));
  });

  console.log('\nSample links found:', [...allLinks].slice(0, 5));

  const orphans = [...sitemapPaths].filter(path => !allLinks.has(path));
  return orphans;
}

const markdownContents = [];

/**
 * Recursively read all markdown files in directory
 */
function readMarkdownFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      readMarkdownFiles(fullPath);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      markdownContents.push(fs.readFileSync(fullPath, 'utf8'));
      console.log(`Read: ${fullPath}`);
    }
  });
}

/**
 * Fetch and parse sitemap from docs.strapi.io
 */
function fetchSitemap() {
  return new Promise((resolve, reject) => {
    https.get('https://docs.strapi.io/sitemap.xml', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const urls = data.match(/<loc>(.*?)<\/loc>/g)
          .map(loc => loc.replace(/<\/?loc>/g, ''));
        resolve(urls);
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    const sitemapUrls = await fetchSitemap();
    console.log('URLs found in sitemap:', sitemapUrls.length);

    readMarkdownFiles('.');
    console.log(`\nMarkdown files analyzed: ${markdownContents.length}`);

    const orphanPages = findOrphanPages(sitemapUrls, markdownContents);
    console.log('\nOrphaned pages:', orphanPages);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
