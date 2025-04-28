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
        : undefined, // ➡️ undefined côté serveur, pas d'erreur
    },
    aiChatSettings: {
      aiAssistantAvatar: "/img/logo-monogram.png",
      introMessage: "Hi! I'm the Strapi Docs AI assistant.<br/>How can I help?",
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
