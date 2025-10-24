# Slack Integration Guide (Future)

Ce guide explique comment automatiser l'analyse lors de la publication d'une nouvelle release Strapi.

## Architecture proposée

```
GitHub Release Published
        ↓
  GitHub Webhook
        ↓
   Slack Workflow
        ↓
 Trigger Analysis Script
        ↓
 Post Report to Channel
```

## Option 1 : GitHub Actions + Slack (Recommandé)

### 1. Créer un workflow GitHub Actions

Fichier : `.github/workflows/analyze-release.yml`

```yaml
name: Analyze Strapi Release

on:
  workflow_dispatch:
    inputs:
      release_url:
        description: 'Strapi release URL'
        required: true
        type: string

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd scripts/strapi-release-analyzer
          npm install
      
      - name: Run analysis
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_KEY }}
        run: |
          node scripts/strapi-release-analyzer/index.js ${{ inputs.release_url }}
      
      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: release-analysis
          path: release-analysis/*.md
      
      - name: Post to Slack
        uses: slackapi/slack-github-action@v1.24.0
        with:
          channel-id: 'your-channel-id'
          payload-file-path: './release-analysis/latest.md'
        env:
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

### 2. Configurer les secrets GitHub

Dans `Settings > Secrets and variables > Actions` :
- `GH_TOKEN` : Ton token GitHub
- `ANTHROPIC_KEY` : Ta clé Anthropic
- `SLACK_BOT_TOKEN` : Token du bot Slack

### 3. Déclencher manuellement

Via l'interface GitHub Actions :
1. Va dans l'onglet "Actions"
2. Sélectionne "Analyze Strapi Release"
3. Clique sur "Run workflow"
4. Entre l'URL de la release

## Option 2 : Webhook direct depuis Strapi

### 1. Créer un endpoint dans votre infrastructure

```javascript
// api/analyze-release.js (exemple avec Vercel)
import { exec } from 'child_process';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { release_url } = req.body;
  
  // Validate webhook signature
  const signature = req.headers['x-hub-signature-256'];
  // ... validation logic

  // Run analysis
  exec(`node /path/to/script/index.js ${release_url}`, (error, stdout) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Analysis failed' });
    }
    
    // Post to Slack
    postToSlack(stdout);
    
    res.status(200).json({ success: true });
  });
}
```

### 2. Configurer le webhook sur strapi/strapi

Dans les settings du repo Strapi :
- URL : Votre endpoint
- Event : Release published
- Secret : Un token sécurisé

## Option 3 : Zapier / Make.com (Sans code)

### Avec Zapier

1. **Trigger** : GitHub "New Release in Repository"
   - Repository : strapi/strapi
   
2. **Action** : Webhooks by Zapier
   - URL : Votre endpoint d'exécution du script
   - Payload : `{ "release_url": "{{release_url}}" }`
   
3. **Action** : Slack "Send Channel Message"
   - Channel : #documentation
   - Message : Résumé + lien vers le rapport

### Avec Make.com

Même logique :
1. Watch GitHub releases
2. HTTP request vers votre API
3. Post to Slack

## Message Slack recommandé

```markdown
🚀 **Nouvelle release Strapi : v5.29.0**

📊 **Résumé de l'analyse :**
• 15 PRs analysées
• 8 suggestions haute priorité
• 4 suggestions moyenne priorité
• 3 suggestions basse priorité

📄 **Rapport complet :**
https://github.com/strapi/documentation/blob/main/release-analysis/v5.29.0-doc-analysis.md

🔗 **Release note originale :**
https://github.com/strapi/strapi/releases/tag/v5.29.0

---
_Analyse générée automatiquement par Claude AI_
```

## Coûts estimés

### GitHub Actions (gratuit)
- 2,000 minutes/mois gratuits
- Une analyse = ~5 minutes
- **→ ~400 analyses gratuites/mois**

### Anthropic API
- ~$1.30 par release
- 2-4 releases/mois
- **→ ~$3-5/mois**

### Slack (gratuit)
- Bot API gratuite

**Total : ~$3-5/mois** 💰

## Timeline de mise en place

1. **Phase 1** (maintenant) : Utilisation manuelle
   - Lancer le script à la main après chaque release
   - Valider la qualité des suggestions
   
2. **Phase 2** (dans 1-2 mois) : Semi-automatique
   - GitHub Actions avec déclenchement manuel
   - Post automatique sur Slack
   
3. **Phase 3** (quand stable) : Full auto
   - Webhook automatique depuis strapi/strapi
   - Notification immédiate sur Slack

## Questions à décider

1. **Qui doit recevoir les notifications ?**
   - Canal #documentation ?
   - Canal privé équipe doc ?
   - DM aux personnes concernées ?

2. **Format du rapport dans Slack ?**
   - Résumé + lien vers rapport complet ?
   - Rapport inline (peut être long) ?
   - Thread avec détails par PR ?

3. **Workflow de review ?**
   - Qui valide les suggestions avant implémentation ?
   - Comment tracker ce qui a été fait vs à faire ?
   - Intégration avec vos issues GitHub ?