# 🎉 Strapi Release Analyzer with Claude AI

Comprehensive tool for automatic analysis of Strapi releases to generate intelligent documentation suggestions.

## 📦 Contents

```
strapi-release-analyzer/
├── 📄 SUMMARY.md              ← START HERE! Complete overview
├── 📘 QUICKSTART.md           ← 5-minute quick start guide
├── ✅ CHECKLIST.md            ← Step-by-step setup checklist
├── 📖 README.md               ← Detailed technical documentation
├── 🔗 SLACK_INTEGRATION.md   ← Automation guide (future)
├── 🚀 analyze.sh              ← Convenient bash script
├── 💻 index.js                ← Main code
├── 📦 package.json            ← Dependencies
├── 🔒 .env.example            ← Configuration template
└── 🙈 .gitignore              ← Secrets protection
```

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd strapi-release-analyzer
npm install
```

### 2. Configure your API keys

Create a `.env` file at the **root** of the repo with:
```bash
GITHUB_TOKEN=ghp_your_token
ANTHROPIC_API_KEY=sk-ant-your_key
```

### 3. Run the analysis
```bash
node index.js https://github.com/strapi/strapi/releases/tag/v5.29.0
```

or with the wrapper:
```bash
./analyze.sh v5.29.0
```

### 4. Check the report
```bash
cat ../release-analysis/v5.29.0-doc-analysis.md
```

## ✨ What it does

- 🔍 Analyzes all PRs from a release
- 🤖 Uses Claude Sonnet 4.5 to understand changes
- 📝 Generates precise and well-written documentation suggestions
- 💰 Cost: ~$1-2 per release
- ⏰ Time saved: 2-3h → 5-10 minutes

## 📚 Documentation

**To get started:**
1. Read **SUMMARY.md** to understand the whole picture
2. Follow **QUICKSTART.md** for your first run
3. Use **CHECKLIST.md** for setup

**To go further:**
4. Check **README.md** for technical details
5. See **SLACK_INTEGRATION.md** for automation

## 🆘 Need help?

Everything is documented! Start with **SUMMARY.md** 😊

---

*Powered by Claude Sonnet 4.5* 🤖