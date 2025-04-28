import React, { useState, useRef, useCallback } from "react";
import { InkeepModalSearchAndChat } from "@inkeep/cxkit-react";

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const searchFunctionsRef = useRef(null);
  const chatFunctionsRef = useRef(null);

  const handleOpenChange = useCallback((newOpen) => {
    setIsOpen(newOpen);
  }, []);

  const config = {
    baseSettings: {
      apiKey: "YOUR_API_KEY",
      primaryBrandColor: "#000000",
    },
    searchSettings: {
      placeholder: "Search...",
      searchFunctionsRef,
    },
    aiChatSettings: {
      aiAssistantName: "Keepie",
      chatFunctionsRef,
    },
    modalSettings: {
      isOpen,
      onOpenChange: handleOpenChange,
    },
  };

  // Access search methods
  const updateQuery = () => {
    searchFunctionsRef.current?.updateQuery("Hello!");
  };

  // Access chat methods
  const clearChat = () => {
    chatFunctionsRef.current?.clearChat();
  };

  return (
    <>
      {/* Custom Trigger */}
      <button onClick={() => setIsOpen(true)}>
        Open Search and Chat Modal
      </button>

      {/* Modal Component */}
      <InkeepModalSearchAndChat {...config} />

      {/* Update Query */}
      <button onClick={updateQuery}>Update Query</button>

      {/* Clear Chat */}
      <button onClick={clearChat}>Clear Chat</button>
    </>
  );
};

export default App;
