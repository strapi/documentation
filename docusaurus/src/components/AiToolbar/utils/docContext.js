const RAW_BASE_URL = 'https://raw.githubusercontent.com/strapi/documentation/main/docusaurus';

const isBrowser = () => typeof window !== 'undefined';

export const getCurrentDocId = () => {
  if (!isBrowser()) return null;
  const path = window.location.pathname;
  const segments = path.replace(/^\/|\/$/g, '').split('/');
  return segments.length >= 2 ? segments.join('/') : null;
};

export const getCurrentDocPath = () => {
  if (!isBrowser()) return null;
  const path = window.location.pathname;
  const cleanPath = path.replace(/^\/|\/$/g, '');
  return cleanPath ? `docs/${cleanPath}.md` : null;
};

export const getCurrentDocUrl = () => {
  if (!isBrowser()) return null;
  return window.location.href;
};

export const resolveDocContext = (docId, docPath) => {
  return {
    docId: docId || getCurrentDocId(),
    docPath: docPath || getCurrentDocPath(),
  };
};

export const getRawMarkdownUrl = ({ docId, docPath }) => {
  if (docPath) {
    return `${RAW_BASE_URL}/${docPath}`;
  }
  if (docId) {
    return `${RAW_BASE_URL}/docs/${docId}.md`;
  }
  return null;
};

const TEMPLATE_PATTERN = /\{\{\s*(\w+)\s*\}\}/g;

export const applyTemplate = (template, values) => {
  if (typeof template !== 'string') return '';
  return template.replace(TEMPLATE_PATTERN, (match, key) => {
    const value = values[key];
    return value == null ? '' : String(value);
  });
};

export const buildPromptFromTemplate = (template, extraValues = {}) => {
  const values = {
    url: getCurrentDocUrl(),
    docId: getCurrentDocId(),
    docPath: getCurrentDocPath(),
    ...extraValues,
  };
  return applyTemplate(template, values);
};

export const buildUrlWithPrompt = ({ targetUrl, prompt, promptParam = 'prompt' }) => {
  if (!targetUrl) return null;
  if (!promptParam || !prompt) return targetUrl;

  try {
    const url = new URL(targetUrl, isBrowser() ? window.location.origin : undefined);
    url.searchParams.set(promptParam, prompt);
    return url.toString();
  } catch (error) {
    const encodedPrompt = encodeURIComponent(prompt);
    const encodedParam = encodeURIComponent(promptParam);
    const separator = targetUrl.includes('?') ? '&' : '?';
    return `${targetUrl}${separator}${encodedParam}=${encodedPrompt}`;
  }
};

export const getUserLanguagePreferences = () => {
  if (!isBrowser()) {
    return [];
  }

  const languages = Array.isArray(navigator.languages) ? navigator.languages : [];
  const fallback = navigator.language ? [navigator.language] : [];
  const merged = [...languages, ...fallback];

  return merged
    .map((lang) => (typeof lang === 'string' ? lang.toLowerCase() : null))
    .filter(Boolean);
};

export const selectLocalizedTemplate = (defaultTemplate, localizedTemplates = {}) => {
  const userLanguages = getUserLanguagePreferences();
  const availableLanguages = Object.keys(localizedTemplates);

  const tryMatch = (languageTag) => {
    if (!languageTag) {
      return null;
    }

    if (localizedTemplates[languageTag]) {
      return localizedTemplates[languageTag];
    }

    const base = languageTag.split('-')[0];
    if (localizedTemplates[base]) {
      return localizedTemplates[base];
    }

    return null;
  };

  for (const lang of userLanguages) {
    const match = tryMatch(lang);
    if (match) {
      return match;
    }
  }

  if (localizedTemplates.en) {
    return localizedTemplates.en;
  }

  return defaultTemplate;
};
