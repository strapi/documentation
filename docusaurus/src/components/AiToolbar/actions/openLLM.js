import {
    buildPromptFromTemplate,
    buildUrlWithPrompt,
    selectLocalizedTemplate,
  } from '../utils/docContext';

  const DEFAULT_PROMPT_TEMPLATE = 'Read from {{url}} so I can ask questions about it.';

  const resolveTemplate = (defaultTemplate, selectedTemplate, includeDefaultPrompt) => {
    const safeDefault = defaultTemplate || DEFAULT_PROMPT_TEMPLATE;
    const safeSelected = selectedTemplate || safeDefault;

    if (!includeDefaultPrompt) {
      return safeSelected;
    }

    if (safeSelected === safeDefault) {
      return safeDefault;
    }

    return `${safeSelected}\n\n---\n${safeDefault}`;
  };

  export const openLLMAction = async (context) => {
    const {
      targetUrl,
      promptTemplate = DEFAULT_PROMPT_TEMPLATE,
      localizedPromptTemplates = {},
      includeDefaultPrompt = false,
      copyPromptToClipboard = false,
      promptParam = 'prompt',
      openIn = '_blank',
      closeDropdown,
    } = context;

    if (!targetUrl) {
      console.error('open-llm action requires a targetUrl');
      return;
    }

    const selectedTemplate = selectLocalizedTemplate(promptTemplate, localizedPromptTemplates);
    const template = resolveTemplate(promptTemplate, selectedTemplate, includeDefaultPrompt);
    const prompt = buildPromptFromTemplate(template);
    const fullUrl = buildUrlWithPrompt({
      targetUrl,
      prompt,
      promptParam,
    });

    if (copyPromptToClipboard && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(prompt);
      } catch (error) {
        console.warn('Unable to copy prompt to clipboard:', error);
      }
    }

    window.open(fullUrl || targetUrl, openIn);

    if (closeDropdown) {
      closeDropdown();
    }
  };