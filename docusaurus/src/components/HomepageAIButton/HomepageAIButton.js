import React, { useState, useCallback } from "react";
import { InkeepModalSearchAndChat } from "@inkeep/cxkit-react";

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("search"); // "search" or "chat"

  const handleOpenChange = useCallback((newOpen) => {
    setIsOpen(newOpen);
    if (!newOpen) {
      setView("search"); // Optional: reset view on close
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
      aiAssistantName: "Keepie",
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
      {/* Your Custom Triggers */}
      <button onClick={openSearch}>Open Search</button>
      <button onClick={openChat}>Open Chat</button>

      {/* Single Inkeep Modal */}
      <InkeepModalSearchAndChat key={view} {...baseConfig} />
    </>
  );
};

export default App;
