import {
  buildPromptFromTemplate,
  buildUrlWithPrompt,
  selectLocalizedTemplate,
} from '../utils/docContext';

const DEFAULT_PROMPT_TEMPLATE = 'Read from {{url}} so I can ask questions about it.';

const buildLocalizedPromptTemplate = (defaultTemplate, selectedTemplate) => {
  if (!selectedTemplate || selectedTemplate === defaultTemplate) {
    return defaultTemplate;
  }

  return `${selectedTemplate}\n\n---\n${defaultTemplate}`;
};

export const openLLMAction = (context) => {
  const {
    targetUrl,
    promptTemplate = DEFAULT_PROMPT_TEMPLATE,
    localizedPromptTemplates = {},
    promptParam = 'prompt',
    openIn = '_blank',
    closeDropdown,
  } = context;

  if (!targetUrl) {
    console.error('open-llm action requires a targetUrl');
    return;
  }

  const selectedTemplate = selectLocalizedTemplate(promptTemplate, localizedPromptTemplates);
  const template = buildLocalizedPromptTemplate(DEFAULT_PROMPT_TEMPLATE, selectedTemplate);
  const prompt = buildPromptFromTemplate(template);
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
