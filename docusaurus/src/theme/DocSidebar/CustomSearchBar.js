import React, { useState, useCallback } from "react";
import { InkeepModalSearchAndChat } from "@inkeep/cxkit-react";
import Icon from '../../components/Icon.js';

const CustomSearchBarWrapper = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("search"); // "search" or "chat"

  const handleOpenChange = useCallback((newOpen) => {
    setIsOpen(newOpen);
    if (!newOpen) {
      setView("search"); // Reset to search when closing
    }
  }, []);

  const baseConfig = {
    baseSettings: {
      apiKey: "f4154c2f6dea81c2d345ba760fb87e3b3f453bfa33ac8655",
      primaryBrandColor: "#4945FF",
    },
    modalSettings: {
      isOpen,
      onOpenChange: handleOpenChange,
    },
    aiChatSettings: {
      aiAssistantName: "the Strapi Docs AI assistant",
      exampleQuestions: [
        "How to install Strapi?",
        "What's new in Strapi 5?",
        "How to host my project on Strapi Cloud?"
      ],
    },
    searchSettings: {
      placeholder: "Search...",
    },
    defaultView: view,
    forceDefaultView: true,
  };

  const openSearch = () => {
    setView("search");
    setIsOpen(true);
  };

  const openChat = () => {
    setView("chat");
    setIsOpen(true);
  };

  return (
    <>
      <div className="my-custom-search-bar">
        {/* Search Button */}
        <button onClick={openSearch} className="DocSearch DocSearch-Button">
          <span className="DocSearch-Button-Placeholder">Search</span>
        </button>

        {/* Ask AI Button */}
        <button onClick={openChat} className="kapa-widget-button">
          <span className="kapa-widget-button-text">
            <Icon name="sparkle" />
            Ask AI
          </span>
        </button>
      </div>

      {/* Single Inkeep Modal */}
      <InkeepModalSearchAndChat key={view} {...baseConfig} />
    </>
  );
};

export default CustomSearchBarWrapper;
