import { useState, useCallback } from 'react';
import { InkeepModalSearchAndChat } from '@inkeep/cxkit-react';

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
      baseSettings={{
        apiKey: "f4154c2f6dea81c2d345ba760fb87e3b3f453bfa33ac8655",
        primaryBrandColor: "#4945FF",
        organizationDisplayName: "Strapi",
        colorMode: {
          sync: {
            target: document.documentElement,
            attributes: ["data-theme"],
            isDarkMode: (attributes) => {
              const currentTheme = attributes["data-theme"];
              return currentTheme === "dracula" || currentTheme === "dark";
            },
          },
        },
      }}
      modalSettings={{
        isOpen,
        onOpenChange: handleOpenChange,
      }}
      aiChatSettings={{
        aiAssistantAvatar: "/img/logo-monogram.png",
        introMessage: "Hi! I'm the Strapi Docs AI assistant.<br/>How can I help?",
        exampleQuestions: [
          "How to install Strapi?",
          "What's new in Strapi 5?",
          "How to host my project on Strapi Cloud?"
        ],
      }}
      searchSettings={{
        placeholder: "Search...",
        view: "dual-pane"
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
