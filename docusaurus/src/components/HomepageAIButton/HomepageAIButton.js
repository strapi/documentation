import React, { useState, useCallback } from 'react';
import { InkeepModalSearchAndChat } from "@inkeep/cxkit-react";
import styles from './homepageaibutton.module.scss';
import Icon from '../Icon';

export default function HomepageAIButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("chat"); // Always open initially in "chat"

  const handleOpenChange = useCallback((newOpen) => {
    setIsOpen(newOpen);
    if (!newOpen) {
      setView("chat"); // Reset to chat when closing
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

  const openChatModal = () => {
    setView("chat"); // Always set chat view
    setIsOpen(true);
  };

  return (
    <>
      <div className={styles['homepage-ai-button-container']}>
        <button
          className={`${styles['homepage-ai-button']} kapa-widget-button`}
          onClick={openChatModal}
        >
          <Icon name="sparkle" />
          <p>Ask AI anything</p>
        </button>
      </div>

      {/* Modal Inkeep */}
      <InkeepModalSearchAndChat key={view} {...baseConfig} />
    </>
  );
}
