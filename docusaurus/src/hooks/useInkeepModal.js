import { useState, useCallback } from 'react';
import { InkeepModalSearchAndChat } from '@inkeep/cxkit-react';

export function getInkeepBaseConfig() {
  const isBrowser = typeof document !== 'undefined';

  return {
    baseSettings: {
      apiKey: "c43431665c4e336c02def65c6f90a1e0d943dfe8066dcf43",
      primaryBrandColor: "#4945FF",
      organizationDisplayName: "Strapi",
      colorMode: isBrowser
        ? {
            sync: {
              target: document.documentElement,
              attributes: ["data-theme"],
              isDarkMode: (attributes) => {
                const currentTheme = attributes["data-theme"];
                return currentTheme === "dracula" || currentTheme === "dark";
              },
            },
          }
        : undefined, // ➡️ undefined on server side, no error
      transformSource: (source) => {
        const { url } = source;
        if (!url) {
          return source;
        }
        const urlPatterns = {
          docs: 'docs.strapi.io',
          docs_next: 'docs-next.strapi.io',
          blog: 'strapi.io/blog',
          strapi: 'strapi.io',
          youtube: 'youtube.com',
        }
        const tabConfig = {
          [urlPatterns.docs]: {
            tab: 'Docs',
          },
          [urlPatterns.docs_next]: {
            tab: 'Docs',
          },
          [urlPatterns.blog]: {
            tab: 'Blog',
          },
          [urlPatterns.strapi]: {
            tab: 'Strapi',
          },
          [urlPatterns.youtube]: {
            tab: 'YouTube',
          }
        }
        const matchingPattern = Object.keys(tabConfig).find((pattern) => url.includes(pattern))
        const config = matchingPattern ? tabConfig[matchingPattern] : null
        if (!config) {
          return source;
        }
        const existingTabs = source.tabs ?? []
        const tabExists = existingTabs.some((existingTab) =>
          typeof existingTab === 'string'
            ? existingTab === config.tab
            : Array.isArray(existingTab) && existingTab[0] === config.tab,
        )
        const tabs = tabExists
          ? existingTabs
          : [
            ...existingTabs,
            [config.tab, { breadcrumbs: source.breadcrumbs }],
          ]
        return {
          ...source,
          tabs,
        }
      },
    },
    aiChatSettings: {
      aiAssistantAvatar: "/img/logo-monogram.png",
      introMessage: "Hi! I'm the Strapi Docs AI assistant.<br/>How can I help?",
      getHelpOptions: [
        {
          name: "GitHub",
          icon: {
            builtIn: "FaGithub"
          },
          action: {
            type: "open_link",
            url: "https://github.com/strapi/strapi"
          }
        },
        {
          name: "Contact",
          icon: {
            builtIn: "IoChatbubblesOutline"
          },
          action: {
            type: "open_link",
            url: "https://strapi.io/contact"
          }
        }
      ],
      exampleQuestions: [
        "How to install Strapi?",
        "How to host my project on Strapi Cloud?",
        "What's new in Strapi 5?",
        "What are the breaking changes in Strapi 5?"
      ],
      isShareButtonVisible: true,
      shareChatUrlBasePath: "https://docs-next.strapi.io/ask-ai",
    },
    searchSettings: {
      placeholder: "Search...",
      view: "dual-pane",
      tabs: [["Docs", { isAlwaysVisible: true }], "Blog", "Strapi", "GitHub", "YouTube", "All"],
    }
  };
}

export function useInkeepModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("search"); // "search" or "chat"

  const handleOpenChange = useCallback((newOpen) => {
    setIsOpen(newOpen);
    if (!newOpen) {
      setView("search"); // Reset to search when closing
    }
  }, []);

  const openSearch = () => {
    setView("search");
    setIsOpen(true);
  };

  const openChat = () => {
    setView("chat");
    setIsOpen(true);
  };

  const modal = (
    <InkeepModalSearchAndChat
      key={view}
      {...getInkeepBaseConfig()}
      modalSettings={{
        isOpen,
        onOpenChange: handleOpenChange,
      }}
      defaultView={view}
      forceDefaultView={true}
    />
  );

  return {
    openSearch,
    openChat,
    modal,
  };
}