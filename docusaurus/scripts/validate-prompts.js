#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROMPT_FILE = path.join(__dirname, '..', 'src', 'components', 'AiToolbar', 'config', 'aiPromptTemplates.js');
const REQUIRED_PLACEHOLDERS = ['{{url}}'];

function loadPromptMap(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/export const aiPromptTemplates = (\{[\s\S]*?\});/);
  if (!match) {
    throw new Error('Unable to locate aiPromptTemplates export.');
  }
  // eslint-disable-next-line no-new-func
  const factory = new Function(`return (${match[1]});`);
  return factory();
}

function main() {
  try {
    const prompts = loadPromptMap(PROMPT_FILE);
    const languages = Object.keys(prompts);

    if (languages.length === 0) {
      throw new Error('No prompt translations found.');
    }

    for (const lang of languages) {
      const value = prompts[lang];
      if (typeof value !== 'string') {
        throw new Error(`Prompt for language "${lang}" must be a string.`);
      }

      const trimmed = value.trim();
      if (trimmed.length === 0) {
        throw new Error(`Prompt for language "${lang}" is empty.`);
      }

      if (trimmed !== value) {
        console.warn(`Warning: prompt for "${lang}" has leading/trailing whitespace.`);
      }

      for (const placeholder of REQUIRED_PLACEHOLDERS) {
        if (!value.includes(placeholder)) {
          throw new Error(`Prompt for "${lang}" is missing placeholder ${placeholder}.`);
        }
      }
    }

    console.log(`Validated ${languages.length} prompt translations.`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

main();
