import { buildPromptFromTemplate, buildUrlWithPrompt } from '../utils/docContext';

const DEFAULT_PROMPT_TEMPLATE = 'Read from {{url}} so I can ask questions about it.';

export const openLLMAction = (context) => {
  const {
    targetUrl,
    promptTemplate = DEFAULT_PROMPT_TEMPLATE,
    promptParam = 'prompt',
    openIn = '_blank',
    closeDropdown,
  } = context;

  if (!targetUrl) {
    console.error('open-llm action requires a targetUrl');
    return;
  }

  const prompt = buildPromptFromTemplate(promptTemplate);
  const fullUrl = buildUrlWithPrompt({
    targetUrl,
    prompt,
    promptParam,
  });

  window.open(fullUrl || targetUrl, openIn);

  if (closeDropdown) {
    closeDropdown();
  }
};
