import React, { useState, useRef, useCallback, createContext, useContext } from "react";
import {
  InkeepModalSearchAndChat
} from "@inkeep/cxkit-react";

// Créer un contexte pour Inkeep
const InkeepContext = createContext(null);

// Composant Provider qui va envelopper l'application
export function InkeepSimpleProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("search"); // "search" ou "chat"
  const searchFunctionsRef = useRef(null);
  const chatFunctionsRef = useRef(null);

  // Fonction pour gérer l'ouverture/fermeture de la modale
  const handleOpenChange = useCallback((newOpen) => {
    setIsOpen(newOpen);
  }, []);

  // Fonctions pour ouvrir la modale en mode recherche ou chat
  const openSearch = useCallback(() => {
    setActiveTab("search");
    setIsOpen(true);
  }, []);

  const openChat = useCallback(() => {
    setActiveTab("chat");
    setIsOpen(true);
  }, []);

  // Configuration pour le composant InkeepModalSearchAndChat
  const config = {
    baseSettings: {
      apiKey: "f4154c2f6dea81c2d345ba760fb87e3b3f453bfa33ac8655",
      primaryBrandColor: "#4945FF", // Couleur principale de Strapi
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
        "Host to host my project on Strapi Cloud?",
      ],
      chatFunctionsRef,
    },
    modalSettings: {
      isOpen,
      onOpenChange: handleOpenChange,
      defaultTab: activeTab, // Control active tab when opening
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
    >
      <span className="DocSearch-Button-Placeholder">Search</span>
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