export const aiToolsConfig = {
  primaryActionId: 'copy-markdown',
  
  actions: [
    {
      id: 'copy-markdown',
      label: 'Copy Markdown',
      description: 'Copy the raw markdown content of this page',
      icon: 'copy',
      actionType: 'copy-markdown'
    },
    {
      id: 'view-llms',
      label: 'View LLMs.txt',
      description: 'Lightweight version for AI models',
      icon: 'file-text',
      actionType: 'navigate',
      url: '/llms.txt'
    },
    {
      id: 'view-llms-full',
      label: 'View LLMs-full.txt', 
      description: 'Complete documentation for AI models',
      icon: 'file-text',
      actionType: 'navigate',
      url: '/llms-full.txt'
    }
  ]
};