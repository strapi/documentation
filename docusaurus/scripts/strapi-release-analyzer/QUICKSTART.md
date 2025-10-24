# Quick Start Guide

Get up and running with the Strapi Release Documentation Analyzer in 5 minutes.

## Step 1: Install Dependencies

```bash
cd scripts/strapi-release-analyzer
yarn install
```

## Step 2: Configure API Keys

Create a `.env` file at the project root:

```bash
# In the documentation repo root (not in scripts folder)
cd ../..
touch .env
```

Add your keys to `.env`:

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Getting the Keys

**GitHub Token:**
- Visit: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Select scope: `public_repo`
- Copy the token starting with `ghp_`

**Anthropic API Key:**
- Visit: https://console.anthropic.com/settings/keys  
- Click "Create Key"
- Copy the key starting with `sk-ant-`

## Step 3: Run Your First Analysis

**Basic analysis (markdown only):**
```bash
node scripts/strapi-release-analyzer/index.js https://github.com/strapi/strapi/releases/tag/v5.29.0
```

**With PDF generation:**
```bash
node scripts/strapi-release-analyzer/index.js https://github.com/strapi/strapi/releases/tag/v5.29.0 --pdf
```

You should see:
```
🚀 Starting Strapi Release Documentation Analysis

🤖 Using Claude claude-sonnet-4-5-20250929 for intelligent analysis

📦 Fetching release: v5.29.0
✅ Found 19 PRs in release notes

📝 Analyzing 19 PRs...

  🔍 Analyzing PR #24554...
  🤖 Generating documentation suggestions with Claude for PR #24554...
  ✅ Generated 2 suggestions (priority: high)
  ...
```

## Step 4: View the Report

The report is generated in:
```
release-analysis/v5.29.0-doc-analysis.md
release-analysis/v5.29.0-doc-analysis.pdf  (if you used --pdf)
```

Open it and review the suggestions!

## Step 5: Use in Notion (Optional)

**Copy-paste the markdown into Notion:**

1. Open the `.md` file
2. Select all (Cmd/Ctrl + A) and copy
3. Paste into any Notion page
4. ✨ Checkboxes, formatting, and collapsible sections work perfectly!

**The report is organized by:**
- 🏗️ CMS Documentation → Features, APIs, Configurations, etc.
- ☁️ Cloud Documentation → Getting Started, Projects, etc.

Each PR has interactive checkboxes you can tick off as you complete tasks!

## Common Issues

### "GITHUB_TOKEN is not set"
- Make sure `.env` is in the documentation repo root (not in scripts folder)
- Check that the variable name is exactly `GITHUB_TOKEN`

### "ANTHROPIC_API_KEY is not set"  
- Make sure you've added it to the `.env` file
- Verify the key starts with `sk-ant-`

### "Error [ERR_REQUIRE_ESM]"
- Make sure `package.json` has `"type": "module"`
- This should already be configured

### Rate Limiting
- The script respects API rate limits
- It adds 1-second delays between requests
- If you hit limits, wait a few minutes and try again

## Next Steps

- Review the generated report
- Validate suggestions against actual PRs
- Start creating documentation updates based on suggestions
- Integrate into your release workflow

## Questions?

Check the main [README.md](./README.md) for detailed documentation.