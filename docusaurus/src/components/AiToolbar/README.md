---
id: ai-toolbar-translations
title: Update AI Toolbar Prompts
---

The AI toolbar (ChatGPT and Claude buttons) uses a set of translated prompt strings. If you want to tweak a translation or add a new language, use this guide.

## Location

- Edit `src/components/AiToolbar/config/aiPromptTemplates.js` in this repository.
- Keys are ISO language tags (use lowercase, include region if needed, e.g. `pt-BR`).
- Values are plain strings with placeholders like `{{url}}`.

```js
export const aiPromptTemplates = {
  'en': 'Read from {{url}} so I can ask questions about it.',
  'fr': 'Lis {{url}} pour que je puisse poser des questions à son sujet.',
  // …
};
```

## Contribution Rules

1. **Keep placeholders**: `{{url}}` is mandatory so the current page URL is injected.
2. **Preserve meaning**: Translate the English prompt faithfully; keep a neutral tone.
3. **Avoid duplicates**: one entry per language tag.
4. **Use UTF-8 characters** wherever possible; avoid HTML entities.

## Testing Your Translation

1. Override `navigator.language` via DevTools (Chrome Sensors panel or Firefox locale settings).
2. Reload any docs page with the toolbar.
3. Click “Open with ChatGPT/Claude” and confirm your translation appears in the prompt or clipboard.

## Validation Script

Before opening a pull request, run the placeholder check:

```bash
node scripts/validate-prompts.js
# If Node isn’t available, run:
python scripts/validate-prompts.py
```

The script ensures that each translation keeps the required placeholders and isn’t empty.

## Adding a New Language

1. Add your entry in `aiPromptTemplates.js`.
2. Run the validation script.
3. Include a screenshot or clip in your PR showing the translation in action (optional but helpful).
4. Update this doc if you want to note any language-specific tips.

Thanks for helping improve the AI tooling experience! 🙌
