import React, { useState, useCallback } from 'react';
import {
  InkeepModalSearch,
} from "@inkeep/cxkit-react";
import Icon from '../../components/Icon.js';

function getInkeepSearchConfig() {
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
        : undefined, // undefined on server side, no error
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
    searchSettings: {
      placeholder: "Search documentation...",
      view: "dual-pane",
      tabs: [["Docs", { isAlwaysVisible: true }], "Blog", "Strapi", "GitHub", "YouTube", "All"],
    }
  };
}

export default function CustomSearchBarWrapper(props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = useCallback((newOpen) => {
    setIsOpen(newOpen);
  }, []);

  const config = {
    ...getInkeepSearchConfig(),
    modalSettings: {
      isOpen,
      onOpenChange: handleOpenChange,
    },
  };

  const handleSearchClick = () => {
    setIsOpen(true);
  };

  return (
    <>
      <div className="my-custom-search-bar">
        {/* Custom Inkeep trigger that replaces SearchBar */}
        <div 
          className="DocSearch DocSearch-Button"
          onClick={handleSearchClick}
          role="button"
          tabIndex="0"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSearchClick();
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <span className="DocSearch-Button-Container">
            <span className="DocSearch-Button-Placeholder">Search</span>
          </span>
        </div>
        
        {/* Keep existing Kapa AI button unchanged */}
        <button className="kapa-widget-button">
          <span className="kapa-widget-button-text">
            <Icon name="sparkle"/>Ask AI
          </span>
        </button>
      </div>

      {/* The Inkeep Modal Component - Search only with advanced config */}
      <InkeepModalSearch {...config} />
    </>
  );
}