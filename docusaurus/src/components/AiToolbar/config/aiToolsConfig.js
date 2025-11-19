import { aiPromptTemplates } from './aiPromptTemplates';

export const aiToolsConfig = {
  primaryActionId: 'copy-markdown',

  actions: [
    {
      id: 'copy-markdown',
      label: 'Copy Markdown',
      description: 'Copy the raw markdown content of this page',
      icon: 'copy',
      actionType: 'copy-markdown',
    },
    {
      id: 'open-chatgpt',
      label: 'Open with ChatGPT',
      icon: 'open-ai-logo',
      actionType: 'open-llm',
      targetUrl: 'https://chat.openai.com/',
      promptTemplate: 'Read from {{url}} so I can ask questions about it.',
      localizedPromptTemplates: aiPromptTemplates,
      promptParam: 'prompt',
      openIn: '_blank',
    },
    {
      id: 'open-claude',
      label: 'Open with Claude',
      icon: 'chat-teardrop-text',
      actionType: 'open-llm',
      targetUrl: 'https://claude.ai/new',
      promptTemplate: 'Read from {{url}} so I can ask questions about it.',
      localizedPromptTemplates: aiPromptTemplates,
      copyPromptToClipboard: true,
      promptParam: 'q',
      openIn: '_blank',
    },
    {
      id: 'view-llms',
      label: 'View LLMs.txt',
      description: 'Lightweight version for AI models',
      icon: 'file-text',
      actionType: 'navigate',
      url: '/llms.txt',
    },
    {
      id: 'view-llms-code',
      label: 'View LLMs-code.txt',
      description: 'Code examples extracted for AI models',
      icon: 'file-code',
      actionType: 'navigate',
      url: '/llms-code.txt',
    },
    {
      id: 'view-llms-full',
      label: 'View LLMs-full.txt',
      description: 'Complete documentation for AI models',
      icon: 'file-text',
      actionType: 'navigate',
      url: '/llms-full.txt',
    },
  ],
};
