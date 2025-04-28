import React, { useEffect, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import Layout from '@theme/Layout'; // toujours utiliser Layout pour Docusaurus pages

export default function AskAIPage() {
  const [isOpen, setIsOpen] = useState(true); // auto-open on page load
  const [ModalSearchAndChat, setModalSearchAndChat] = useState(null);

  useEffect(() => {
    (async () => {
      const { InkeepModalSearchAndChat } = await import("@inkeep/cxkit-react");
      setModalSearchAndChat(() => InkeepModalSearchAndChat);
    })();
  }, []);

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen);
  };

  const inkeepModalSearchAndChatProps = {
    baseSettings: {
      apiKey: "f4154c2f6dea81c2d345ba760fb87e3b3f453bfa33ac8655",
      primaryBrandColor: "#4945FF",
      organizationDisplayName: "Strapi", // optionnel
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
    defaultView: "chat", // always open on chat
    forceDefaultView: true,
  };

  return (
    <Layout title="Ask AI" description="Ask your questions to our AI assistant">
      {/* This will render the modal inside the Layout */}
      <BrowserOnly fallback={<div />}>
        {() => ModalSearchAndChat && <ModalSearchAndChat {...inkeepModalSearchAndChatProps} />}
      </BrowserOnly>
    </Layout>
  );
}
