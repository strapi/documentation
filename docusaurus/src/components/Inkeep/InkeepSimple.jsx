import React, { useState, useRef, useCallback, createContext, useContext } from "react";
import {
  InkeepModalSearchAndChat
} from "@inkeep/cxkit-react";

const InkeepContext = createContext(null);

// Provider component wrapping the application
export function InkeepSimpleProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("search"); // "search" or "chat"
  const searchFunctionsRef = useRef(null);
  const chatFunctionsRef = useRef(null);

  // Fonction to handle opening/closing the modal
  const handleOpenChange = useCallback((newOpen) => {
    setIsOpen(newOpen);
  }, []);

  // Functions to handle opening the modal in search or chat mode 
  const openSearch = useCallback(() => {
    setActiveTab("search");
    setIsOpen(true);
  }, []);

  const openChat = useCallback(() => {
    setActiveTab("chat");
    setIsOpen(true);
  }, []);

  // Configuration for InkeepModalSearchAndChat component
  const config = {
    baseSettings: {
      apiKey: "f4154c2f6dea81c2d345ba760fb87e3b3f453bfa33ac8655",
      primaryBrandColor: "#4945FF",
    },
    searchSettings: {
      placeholder: "Search…",
      searchFunctionsRef,
    },
    aiChatSettings: {
      aiAssistantName: "Assistant Strapi",
      botAvatarSrc: "https://strapi.io/assets/favicon-32x32.png",
      exampleQuestions: [
        "How to install Strapi?",
        "What's new in Strapi 5?",
        "How to host my project on Strapi Cloud?",
      ],
      chatFunctionsRef,
    },
    modalSettings: {
      isOpen,
      onOpenChange: handleOpenChange,
      defaultTab: activeTab, // Control active tab when opening
      startOnMode: activeTab, // Forces initial mode
    },
  };

  const contextValue = {
    openSearch,
    openChat,
    isOpen,
    setIsOpen,
  };

  return (
    <InkeepContext.Provider value={contextValue}>
      <InkeepModalSearchAndChat {...config} />
      
      {children}
    </InkeepContext.Provider>
  );
}

// Custom hook to use Inkeep context
export function useInkeepSimple() {
  const context = useContext(InkeepContext);
  if (!context) {
    throw new Error("useInkeepSimple must be used within an InkeepSimpleProvider");
  }
  return context;
}

// Buttons to use Inkeep
export function InkeepSearchButton({ className }) {
  const { openSearch } = useInkeepSimple();
  
  return (
    <div 
      className={`DocSearch DocSearch-Button ${className || ''}`}
      onClick={openSearch}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}
    >
      <span className="DocSearch-Button-Container" style={{ display: 'flex', alignItems: 'center' }}>
        <span className="DocSearch-Button-Placeholder">Search</span>
      </span>
    </div>
  );
}

export function InkeepChatButton({ className }) {
  const { openChat } = useInkeepSimple();
  
  return (
    <button
      className={`kapa-widget-button ${className || ''}`}
      onClick={openChat}
    >
      <span className="kapa-widget-button-text">
        <i className="ph-fill ph-sparkle"></i>
        Ask AI
      </span>
    </button>
  );
}

export function InkeepHomepageButton({ className }) {
  const { openChat } = useInkeepSimple();
  
  return (
    <div className={`homepage-ai-button-container ${className || ''}`}>
      <button 
        className="homepage-ai-button"
        onClick={openChat}
      >
        <i className="ph-fill ph-sparkle"></i>
        <p>Ask AI anything</p>
      </button>
    </div>
  );
}