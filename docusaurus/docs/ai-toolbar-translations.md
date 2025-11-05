# AI Toolbar Prompt Translations

The AI toolbar (ChatGPT/Claude buttons) relies on a shared set of translated prompt strings. If you’d like to tweak an existing translation or contribute a new language, follow this guide.

## Where prompts live

- Edit `src/components/AiToolbar/config/aiPromptTemplates.js`.
- Keys are ISO language tags (e.g., `en`, `fr`, `pt-BR`).
- Values are strings that may contain placeholders such as `{{url}}`.

```js
export const aiPromptTemplates = {
  'en': 'Read from {{url}} so I can ask questions about it.',
  'fr': 'Lis {{url}} pour que je puisse poser des questions à son sujet.',
  // Add new entries here …
};
```

## Rules to follow

1. **Keep placeholders intact.** `{{url}}` is required.
2. **Use clear, neutral tone.** Mirror the English template.
3. **One translation per language.** No duplicates.
4. **Prefer UTF-8 text.** Don’t escape unless necessary.

## Testing locally

1. Change `navigator.language` via browser DevTools.
2. Reload the docs page and click the toolbar button.
3. Confirm the new tab or copied prompt shows your translation.

## Validation script

Run the built-in check before opening a PR:

```bash
node scripts/validate-prompts.js
# or, if Node isn’t available in your environment:
python scripts/validate-prompts.py
```

Both ensure the `{{url}}` placeholder is present and no translation is empty.

## Adding a new language

1. Add the entry in `aiPromptTemplates.js`.
2. Update this document if helpful (e.g., to credit contributors).
3. (Optional) Add a test case if you create one in the future.
4. Include a screenshot/gif in your PR showing the prompt in action.

Thanks for helping improve the AI tooling experience! 🙌
