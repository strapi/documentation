#!/usr/bin/env node

import { Octokit } from '@octokit/rest';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';

config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const STRAPI_REPO_OWNER = 'strapi';
const STRAPI_REPO_NAME = 'strapi';
const DOC_REPO_OWNER = 'strapi';
const DOC_REPO_NAME = 'documentation';
const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929';

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

const PR_CATEGORIES = {
  feature: '🚀 New feature',
  bug: '🔥 Bug fix',
  enhancement: '💅 Enhancement',
  chore: '⚙️ Chore',
  other: '📝 Other',
};

const EXCLUDED_CATEGORIES = ['chore', 'test', 'ci'];

async function parseReleaseNotes(releaseUrl) {
  const match = releaseUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/releases\/tag\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub release URL format');
  }

  const [, owner, repo, tag] = match;
  
  console.log(`📦 Fetching release: ${tag}`);
  
  const { data: release } = await octokit.repos.getReleaseByTag({
    owner,
    repo,
    tag,
  });

  const prNumbers = extractPRNumbers(release.body);
  
  console.log(`✅ Found ${prNumbers.length} PRs in release notes`);
  
  return {
    tag,
    name: release.name,
    body: release.body,
    prNumbers,
  };
}

function extractPRNumbers(body) {
  const prRegex = /#(\d+)/g;
  const matches = body.matchAll(prRegex);
  const prNumbers = [...new Set([...matches].map(m => parseInt(m[1])))];
  return prNumbers;
}

function categorizePR(title, body, labels) {
  const lowerTitle = title.toLowerCase();
  const lowerBody = (body || '').toLowerCase();
  const labelNames = labels.map(l => l.toLowerCase());
  
  if (lowerTitle.includes('chore') || lowerTitle.startsWith('chore:') || 
      lowerTitle.startsWith('chore(') || labelNames.includes('chore')) {
    return 'chore';
  }
  
  if (lowerTitle.includes('test') || lowerTitle.startsWith('test:') || 
      lowerTitle.startsWith('test(') || lowerTitle.includes('spec.') ||
      labelNames.includes('test')) {
    return 'test';
  }
  
  if (lowerTitle.includes('ci:') || lowerTitle.startsWith('ci(') || 
      lowerTitle.includes('github actions') || lowerTitle.includes('workflow') ||
      labelNames.includes('ci')) {
    return 'ci';
  }
  
  if (lowerBody.includes('### 🚀 new feature') || lowerTitle.includes('feat:') || 
      lowerTitle.includes('feat(') || lowerTitle.includes('feature')) {
    return 'feature';
  }
  
  if (lowerBody.includes('### 🔥 bug fix') || lowerTitle.includes('fix:') || 
      lowerTitle.includes('fix(') || lowerTitle.includes('bug')) {
    return 'bug';
  }
  
  if (lowerBody.includes('### 💅 enhancement') || lowerTitle.includes('enhancement') ||
      lowerTitle.includes('improve')) {
    return 'enhancement';
  }
  
  return 'other';
}

async function analyzePR(prNumber) {
  console.log(`  🔍 Analyzing PR #${prNumber}...`);
  
  try {
    const { data: pr } = await octokit.pulls.get({
      owner: STRAPI_REPO_OWNER,
      repo: STRAPI_REPO_NAME,
      pull_number: prNumber,
    });

    const category = categorizePR(pr.title, pr.body, pr.labels.map(l => l.name));
    
    if (EXCLUDED_CATEGORIES.includes(category)) {
      console.log(`  ⏭️  Skipping PR #${prNumber} (${category})`);
      return null;
    }

    const { data: files } = await octokit.pulls.listFiles({
      owner: STRAPI_REPO_OWNER,
      repo: STRAPI_REPO_NAME,
      pull_number: prNumber,
    });

    const analysis = {
      number: prNumber,
      title: pr.title,
      url: pr.html_url,
      body: pr.body || '',
      category,
      files: files.map(f => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch || '',
      })),
      labels: pr.labels.map(l => l.name),
    };

    return analysis;
  } catch (error) {
    console.error(`  ❌ Error analyzing PR #${prNumber}: ${error.message}`);
    return null;
  }
}

async function generateDocSuggestionsWithClaude(prAnalysis) {
  console.log(`  🤖 Generating documentation suggestions with Claude for PR #${prAnalysis.number}...`);
  
  const diffSummary = prAnalysis.files
    .filter(f => f.patch)
    .map(f => `### File: ${f.filename}\n\`\`\`diff\n${f.patch}\n\`\`\``)
    .join('\n\n');
  
  const diffSize = new Blob([diffSummary]).size;
  if (diffSize > 100000) {
    console.log(`  ⚠️  Diff too large (${Math.round(diffSize / 1024)}KB), truncating...`);
  }
  
  const truncatedDiff = diffSize > 100000 
    ? diffSummary.substring(0, 100000) + '\n\n... (diff truncated due to size)'
    : diffSummary;

  const prompt = `You are a technical documentation analyst for Strapi CMS. Your expertise is in identifying documentation gaps and suggesting precise updates.

Analyze this pull request and provide specific, actionable documentation update suggestions.

## PR Information
- **Title**: ${prAnalysis.title}
- **Category**: ${prAnalysis.category}
- **Description**: ${prAnalysis.body.substring(0, 1000)}
- **URL**: ${prAnalysis.url}

## Code Changes (Diff)

${truncatedDiff}

## Your Task

**Important**: Strapi documentation structure:
- The old /user-docs and /dev-docs folders have been replaced
- Current structure: /cms for CMS documentation, /cloud for Cloud documentation
- Features are now in /cms/features/ (e.g., content-manager, media-library, internationalization)
- API docs are in /cms/api/
- Configurations are in /cms/configurations/

Analyze the changes and determine:
1. Does this PR affect user-facing functionality, APIs, or configuration?
2. What parts of the Strapi documentation need updates?
3. What specific content should be added, updated, or clarified?

Respond with a JSON object following this exact structure:

{
  "priority": "high" | "medium" | "low",
  "affectedAreas": ["area1", "area2"],
  "suggestedChanges": [
    {
      "file": "path/to/doc/file.md",
      "section": "Section title or heading",
      "changeType": "add" | "update" | "clarify" | "add-note",
      "description": "Clear explanation of what needs to be changed and why",
      "suggestedContent": "Complete markdown content ready to be added/inserted. Be specific and actionable. Include code examples if relevant."
    }
  ],
  "reasoning": "Brief explanation of why these documentation changes are needed (2-3 sentences)"
}

## Guidelines

1. **Priority Determination**: 
   - **HIGH**: New features, breaking changes, API modifications, new configuration options, significant behavior changes
   - **MEDIUM**: Important bug fixes affecting user workflows, UI/UX changes, plugin modifications, i18n changes
   - **LOW**: Minor fixes, cosmetic changes, internal refactoring with minimal user impact

2. **Affected Areas**: Be specific. Examples:
   - "Admin Panel - Content Manager"
   - "API Reference - Upload Plugin"
   - "User Guide - Internationalization"
   - "Configuration - Media Library Settings"
   - "Developer Guide - Plugin Development"

3. **File Paths**: Use the current Strapi documentation structure:
   - CMS docs: "docs/cms/[topic]/[page].md" (e.g., "docs/cms/features/content-manager.md")
   - Cloud docs: "docs/cloud/[topic]/[page].md" (e.g., "docs/cloud/getting-started/deployment.md")
   - API reference: "docs/cms/api/[type]/[endpoint].md"
   - Configuration: "docs/cms/configurations/[topic].md"
   - Features: "docs/cms/features/[feature].md"

4. **Suggested Content**: 
   - Write complete, ready-to-use markdown content
   - Include code examples where appropriate
   - Use proper markdown formatting (headers, code blocks, lists)
   - Be concise but comprehensive
   - Match Strapi's documentation tone (clear, friendly, technical)

5. **When NOT to suggest changes**:
   - Internal code refactoring with no external impact
   - Test file changes only
   - CI/CD pipeline changes
   - Minor typo fixes in code comments
   - Changes to development tooling

If no documentation changes are needed, return empty suggestedChanges array with reasoning explaining why.

Respond ONLY with valid JSON, no markdown formatting, no additional text.`;

  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.log(`  ⚠️  Could not parse Claude response as JSON`);
      return null;
    }

    const suggestions = JSON.parse(jsonMatch[0]);
    
    console.log(`  ✅ Generated ${suggestions.suggestedChanges?.length || 0} suggestions (priority: ${suggestions.priority})`);
    
    return suggestions;
  } catch (error) {
    console.error(`  ❌ Error calling Claude API: ${error.message}`);
    return null;
  }
}

function generateMarkdownReport(releaseInfo, analyses) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  let markdown = `# Documentation Analysis for Strapi ${releaseInfo.tag}\n\n`;
  markdown += `**Generated on:** ${timestamp}\n\n`;
  markdown += `**Release:** [${releaseInfo.name || releaseInfo.tag}](https://github.com/${STRAPI_REPO_OWNER}/${STRAPI_REPO_NAME}/releases/tag/${releaseInfo.tag})\n\n`;
  markdown += `**Total PRs analyzed:** ${analyses.length}\n\n`;
  markdown += `---\n\n`;
  
  markdown += `## 📊 Summary\n\n`;
  
  const categoryCounts = {};
  const priorityCounts = { high: 0, medium: 0, low: 0 };
  
  analyses.forEach(a => {
    categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    if (a.claudeSuggestions) {
      priorityCounts[a.claudeSuggestions.priority]++;
    }
  });
  
  markdown += `### By Category\n\n`;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    markdown += `- **${PR_CATEGORIES[cat] || cat}**: ${count}\n`;
  });
  
  markdown += `\n### By Documentation Priority\n\n`;
  markdown += `- 🔴 **High priority**: ${priorityCounts.high}\n`;
  markdown += `- 🟡 **Medium priority**: ${priorityCounts.medium}\n`;
  markdown += `- 🟢 **Low priority**: ${priorityCounts.low}\n\n`;
  
  markdown += `---\n\n`;
  
  Object.entries(PR_CATEGORIES).forEach(([catKey, catLabel]) => {
    const categoryPRs = analyses.filter(a => a.category === catKey);
    
    if (categoryPRs.length === 0) return;
    
    markdown += `## ${catLabel}\n\n`;
    
    categoryPRs.forEach(analysis => {
      const { number, title, url, claudeSuggestions, body } = analysis;
      
      if (!claudeSuggestions) {
        return;
      }
      
      const priorityEmoji = claudeSuggestions.priority === 'high' ? '🔴' : 
                           claudeSuggestions.priority === 'medium' ? '🟡' : '🟢';
      
      markdown += `### ${priorityEmoji} PR #${number}: ${title}\n\n`;
      markdown += `**Link:** ${url}\n\n`;
      markdown += `**Priority:** ${claudeSuggestions.priority.toUpperCase()}\n\n`;
      
      if (claudeSuggestions.affectedAreas && claudeSuggestions.affectedAreas.length > 0) {
        markdown += `**Affected Documentation Areas:**\n`;
        claudeSuggestions.affectedAreas.forEach(area => {
          markdown += `- ${area}\n`;
        });
        markdown += `\n`;
      }
      
      if (body && body.trim()) {
        const summary = body.split('\n').slice(0, 3).join('\n').trim();
        if (summary) {
          markdown += `**PR Description:**\n`;
          markdown += `> ${summary.substring(0, 300)}${summary.length > 300 ? '...' : ''}\n\n`;
        }
      }
      
      if (claudeSuggestions.reasoning) {
        markdown += `**Analysis:**\n`;
        markdown += `${claudeSuggestions.reasoning}\n\n`;
      }
      
      if (claudeSuggestions.suggestedChanges && claudeSuggestions.suggestedChanges.length > 0) {
        markdown += `**Suggested Documentation Changes:**\n\n`;
        claudeSuggestions.suggestedChanges.forEach((change, idx) => {
          markdown += `#### ${idx + 1}. ${change.changeType.toUpperCase()}: ${change.section || change.file}\n\n`;
          markdown += `**File:** \`${change.file}\`\n\n`;
          markdown += `**What to do:** ${change.description}\n\n`;
          if (change.suggestedContent) {
            markdown += `**Suggested content:**\n\n`;
            markdown += `\`\`\`markdown\n${change.suggestedContent}\n\`\`\`\n\n`;
          }
        });
      } else {
        markdown += `**Documentation Impact:**\n`;
        markdown += `No documentation changes required for this PR.\n\n`;
      }
      
      markdown += `---\n\n`;
    });
  });
  
  markdown += `## 📝 Notes\n\n`;
  markdown += `- This analysis is generated using Claude AI (${CLAUDE_MODEL})\n`;
  markdown += `- All suggestions should be reviewed and validated by the documentation team\n`;
  markdown += `- Priority levels are determined by analyzing the actual code changes\n`;
  markdown += `- PRs categorized as chores, tests, or CI/CD changes are automatically excluded\n`;
  markdown += `- Some suggestions may need refinement based on your documentation style guide\n`;
  
  return markdown;
}

async function main() {
  const releaseUrl = process.argv[2];
  
  if (!releaseUrl) {
    console.error('❌ Usage: node index.js <github-release-url>');
    console.error('Example: node index.js https://github.com/strapi/strapi/releases/tag/v5.29.0');
    process.exit(1);
  }

  if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN environment variable is not set');
    console.error('Please create a .env file with: GITHUB_TOKEN=your_token_here');
    process.exit(1);
  }

  if (!ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY environment variable is not set');
    console.error('Please create a .env file with: ANTHROPIC_API_KEY=your_api_key_here');
    process.exit(1);
  }

  console.log('🚀 Starting Strapi Release Documentation Analysis\n');
  console.log(`🤖 Using Claude ${CLAUDE_MODEL} for intelligent analysis\n`);
  
  try {
    const releaseInfo = await parseReleaseNotes(releaseUrl);
    
    console.log(`\n📝 Analyzing ${releaseInfo.prNumbers.length} PRs...\n`);
    
    const analyses = [];
    let skipped = 0;
    
    for (const prNumber of releaseInfo.prNumbers) {
      const prAnalysis = await analyzePR(prNumber);
      
      if (!prAnalysis) {
        skipped++;
        continue;
      }
      
      const claudeSuggestions = await generateDocSuggestionsWithClaude(prAnalysis);
      
      analyses.push({
        ...prAnalysis,
        claudeSuggestions,
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n✅ Analysis complete!`);
    console.log(`   📊 Analyzed: ${analyses.length} PRs`);
    console.log(`   ⏭️  Skipped: ${skipped} PRs (chores, tests, CI)\n`);
    
    const report = generateMarkdownReport(releaseInfo, analyses);
    
    const outputDir = path.join(process.cwd(), 'release-analysis');
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputFile = path.join(outputDir, `${releaseInfo.tag}-doc-analysis.md`);
    await fs.writeFile(outputFile, report);
    
    console.log(`📄 Report generated: ${outputFile}\n`);
    console.log('🎉 Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();