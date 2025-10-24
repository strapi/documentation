# Strapi Release Documentation Analyzer

Automated analysis tool for Strapi releases that generates intelligent documentation update suggestions using Claude AI.

## 📋 Overview

This tool analyzes Strapi release notes, examines each mentioned Pull Request, and uses Claude AI to generate precise, actionable documentation update suggestions. It helps the documentation team quickly identify what needs to be updated after each release.

## ✨ Features

- **Automated PR Analysis**: Fetches and analyzes all PRs mentioned in a release note
- **Intelligent Categorization**: Automatically categorizes PRs (features, bugs, enhancements)
- **Smart Filtering**: Excludes chores, tests, and CI/CD changes that don't need documentation
- **AI-Powered Suggestions**: Uses Claude Sonnet 4.5 to generate specific, actionable documentation updates
- **Complete Diff Analysis**: Examines actual code changes to understand impact
- **Ready-to-Use Content**: Provides markdown content that can be directly added to documentation
- **Priority Assessment**: Automatically determines urgency (high/medium/low)
- **Comprehensive Reports**: Generates detailed markdown reports organized by category

## 🚀 Installation

### Prerequisites

- Node.js >= 18.0
- Yarn (the project uses yarn as package manager)

### Dependencies

The script requires:
- `@octokit/rest` (GitHub API client) - already in root project
- `dotenv` (environment variables) - already in root project  
- `@anthropic-ai/sdk` (Claude AI) - needs to be installed

Install the Anthropic SDK dependency:

```bash
cd scripts/strapi-release-analyzer
yarn install
```

## 🔑 Configuration

### 1. GitHub Token

Create a GitHub Personal Access Token:
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scope: `public_repo` (read access to public repositories)
4. Copy the token

### 2. Anthropic API Key

Get your Claude API key:
1. Go to https://console.anthropic.com/settings/keys
2. Create a new API key
3. Copy the key

### 3. Environment Variables

Create a `.env` file at the project root:

```bash
GITHUB_TOKEN=ghp_your_github_token_here
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
```

## 📖 Usage

From the documentation repository root:

```bash
node scripts/strapi-release-analyzer/index.js <release-url>
```

### Example

```bash
node scripts/strapi-release-analyzer/index.js https://github.com/strapi/strapi/releases/tag/v5.29.0
```

### Output

The script generates a markdown file in `release-analysis/`:

```
release-analysis/
└── v5.29.0-doc-analysis.md
```

## 📊 Report Structure

The generated report includes:

### 1. Summary
- Total PRs analyzed
- Breakdown by category (features, bugs, enhancements)
- Breakdown by priority (high, medium, low)

### 2. Detailed Analysis per PR
For each analyzed PR, you get:

- **Priority Level**: Visual indicator (🔴 high, 🟡 medium, 🟢 low)
- **PR Link**: Direct link to the pull request
- **Affected Areas**: Specific documentation sections impacted
- **Analysis**: Claude's reasoning about why documentation needs updates
- **Suggested Changes**: Concrete, actionable suggestions including:
  - File path to update (using current structure: /cms/ and /cloud/)
  - Section to modify
  - Change type (add/update/clarify/add-note)
  - Description of what to change
  - **Ready-to-use markdown content**

**Note**: The analyzer is aware of Strapi's current documentation structure:
- `/cms/` folder for CMS documentation (replaces old /user-docs and /dev-docs)
- `/cloud/` folder for Cloud documentation
- Features in `/cms/features/`
- API docs in `/cms/api/`
- Configurations in `/cms/configurations/`

### 3. Notes
- Methodology information
- Disclaimer about manual review
- Usage recommendations

## 🎯 Priority Logic

The AI determines priority based on:

- **🔴 High Priority**:
  - New features
  - Breaking changes
  - API modifications
  - New configuration options
  - Significant behavior changes

- **🟡 Medium Priority**:
  - Important bug fixes affecting workflows
  - UI/UX changes
  - Plugin modifications
  - Internationalization changes

- **🟢 Low Priority**:
  - Minor fixes
  - Cosmetic changes
  - Internal refactoring with minimal user impact

## 💰 Cost Estimation

Using Claude Sonnet 4.5:
- **Per PR**: ~8,000 tokens on average (varies 2K-30K based on diff size)
- **Per Release**: ~180,000 tokens (~$1.50 total)
  - Input: ~$0.54
  - Output: ~$0.75

The cost is minimal compared to the time saved (estimated 2-3 hours of manual work per release).

## 🔍 What Gets Analyzed

The script examines:
- ✅ Pull request title and description
- ✅ Complete diff of all code changes
- ✅ Files modified (type and location)
- ✅ PR labels and categories
- ❌ Automatically excludes: chores, tests, CI/CD changes

## 🛠️ Advanced Usage

### Custom Analysis

You can modify detection rules in the `generateDocSuggestionsWithClaude()` function to:
- Adjust priority thresholds
- Add new documentation areas
- Customize the AI prompt
- Change output format

### Rate Limiting

The script includes:
- 1-second delay between API calls
- Automatic diff truncation for very large PRs (>100KB)
- Error handling with detailed logging

## ⚠️ Limitations

- AI suggestions require manual review and validation
- Some internal changes may not need documentation despite being flagged
- Very large PRs may have truncated diffs
- API calls respect GitHub and Anthropic rate limits

## 🔮 Future Integration

This tool is designed to be integrated into an automated workflow:
1. New Strapi release is published
2. Webhook triggers Slack notification
3. Script automatically runs and generates report
4. Report is posted to dedicated Slack channel
5. Documentation team reviews and acts on suggestions

## 📝 Example Output

```markdown
### 🔴 PR #24554: feat(upload): fixing ordering issue

**Link:** https://github.com/strapi/strapi/pull/24554
**Priority:** HIGH
**Affected Documentation Areas:**
- Media Library documentation
- User Guide - Upload Plugin

**Analysis:**
This PR fixes a critical ordering issue in the upload functionality that affects 
how users see their media files in the Media Library. Documentation should be 
updated to reflect the correct behavior.

**Suggested Documentation Changes:**

#### 1. UPDATE: Media Library - Sorting and Ordering

**File:** `docs/user-docs/media-library/organizing-assets.md`

**What to do:** Add a note about the fix for ordering consistency and update 
any screenshots showing the file list.

**Suggested content:**
\`\`\`markdown
:::note Fix in v5.29.0
As of version 5.29.0, the ordering of uploaded files has been fixed to maintain 
consistent display order in the Media Library. Files now appear in the correct 
chronological order based on their upload time.
:::
\`\`\`
```

## 🤝 Contributing

To improve the analyzer:
1. Add new detection patterns in `categorizePR()`
2. Enhance the AI prompt in `generateDocSuggestionsWithClaude()`
3. Improve report formatting in `generateMarkdownReport()`
4. Test with multiple releases to validate accuracy

## 📄 License

MIT