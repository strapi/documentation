import React, { useEffect, useRef, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useColorMode } from '@docusaurus/theme-common';
import BrowserOnly from '@docusaurus/BrowserOnly';

function SearchBarContent() {
  const { siteConfig } = useDocusaurusContext();
  const { colorMode } = useColorMode();
  const searchButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInstanceRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!searchButtonRef.current) {
      return;
    }

    // Clean up previous instance and clear container
    if (searchInstanceRef.current) {
      searchInstanceRef.current.destroy?.();
      searchInstanceRef.current = null;
    }
    
    // Clear the container content
    searchButtonRef.current.innerHTML = '';

    // Dynamic import to avoid SSR issues with solid-js
    Promise.all([
      import('meilisearch-docsearch'),
      import('meilisearch-docsearch/css')
    ]).then(([{ docsearch }]) => {
      const search = docsearch({
        container: searchButtonRef.current,
        host: siteConfig.customFields.meilisearch.host,
        apiKey: siteConfig.customFields.meilisearch.apiKey,
        indexUid: siteConfig.customFields.meilisearch.indexUid,
        
        transformItems: (items) => {
          return items.map((item) => {
            let section = item.hierarchy_lvl0 || 'Documentation';
            
            // Override section based on URL path
            if (item.url && item.url.includes('/cms/')) {
              section = 'CMS';
            } else if (item.url && item.url.includes('/cloud/')) {
              section = 'Cloud';
            }
            
            return {
              ...item,
              // Remove domain from URLs to make them relative
              url: item.url.replace('https://docs-next.strapi.io', ''),
              hierarchy: {
                lvl0: section,
                lvl1: item.hierarchy_lvl0,
                lvl2: item.hierarchy_lvl1,
                lvl3: item.hierarchy_lvl2
              }
            };
          });
        },

        searchParams: {
          attributesToHighlight: ['hierarchy', 'content'],
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
          matchingStrategy: 'all',
          attributesToSearchOn: ['hierarchy_lvl1', 'hierarchy_lvl2', 'content']
        },

        placeholder: 'Search documentation...',
        // Disable all hotkeys to prevent conflicts with Kapa.ai widget
        searchHotkeys: [],

        translations: {
          button: {
            buttonText: 'Search',
            buttonAriaLabel: 'Search',
          },
          modal: {
            searchBox: {
              resetButtonTitle: 'Clear the query',
              resetButtonAriaLabel: 'Clear the query',
              cancelButtonText: 'Cancel',
              cancelButtonAriaLabel: 'Cancel',
            },
            startScreen: {
              recentSearchesTitle: 'Recent',
              noRecentSearchesText: 'No recent searches',
              saveRecentSearchButtonTitle: 'Save this search',
              removeRecentSearchButtonTitle: 'Remove this search',
              favoriteSearchesTitle: 'Favorite',
              removeFavoriteSearchButtonTitle: 'Remove this search from favorites',
            },
            errorScreen: {
              titleText: 'Unable to fetch results',
              helpText: 'You might want to check your network connection.',
            },
            footer: {
              selectText: 'to select',
              selectKeyAriaLabel: 'Enter key',
              navigateText: 'to navigate',
              navigateUpKeyAriaLabel: 'Arrow up',
              navigateDownKeyAriaLabel: 'Arrow down',
              closeText: 'to close',
              closeKeyAriaLabel: 'Escape key',
              searchByText: 'Search by',
            },
            noResultsScreen: {
              noResultsText: 'No results for',
              suggestedQueryText: 'Try searching for',
              reportMissingResultsText: 'Believe this query should return results?',
              reportMissingResultsLinkText: 'Let us know.',
            },
          },
        },

        getMissingResultsUrl: ({ query }) => {
          return `https://github.com/strapi/documentation/issues/new?title=Missing+search+results+for+${query}`;
        },

        // Track clicks for Meilisearch Cloud analytics
        onItemClick: ({ item, event }) => {
          // Send click event to Meilisearch Cloud analytics
          fetch(`${siteConfig.customFields.meilisearch.host}/events`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${siteConfig.customFields.meilisearch.apiKey}`
            },
            body: JSON.stringify({
              eventType: 'click',
              eventName: 'Documentation Search Result Clicked',
              indexUid: siteConfig.customFields.meilisearch.indexUid,
              objectId: item.objectID,
              position: item.__position
            })
          }).catch((error) => {
            console.error('Failed to send analytics event:', error);
          });
        },
      });

      searchInstanceRef.current = search;
      setIsLoaded(true);

      if (colorMode === 'dark') {
        dropdownRef.current?.classList.add('dark');
      } else {
        dropdownRef.current?.classList.remove('dark');
      }
    }).catch((error) => {
      console.error('Failed to load MeiliSearch:', error);
    });

    return () => {
      if (searchInstanceRef.current) {
        searchInstanceRef.current.destroy?.();
        searchInstanceRef.current = null;
      }
    };
  }, [colorMode, siteConfig]);

  /**
   * Block 'S' key globally to prevent conflicts between MeiliSearch and Kapa.ai widget.
   * 
   * Problem: Users reported that pressing 'S' while in the Kapa modal
   * triggers the opening of the MeiliSearch modal.
   * 
   * Solution: Intercept all 'S' key presses in the capture phase (before any widget sees them),
   * then manually insert the character only in text inputs where it's expected.
   * 
   * Note: Kapa.ai uses a Shadow DOM, so we need special handling to detect and insert
   * characters into its input field (shadowRoot.activeElement).
   */
  useEffect(() => {
    const blockSKey = (e) => {
      if (e.key === 's' || e.key === 'S') {
        // Always block the original event first to prevent both MeiliSearch and Kapa.ai from seeing it
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Case 1: Allow 'S' in regular input fields (outside Shadow DOM)
        if (e.target.tagName === 'INPUT' || 
            e.target.tagName === 'TEXTAREA' ||
            e.target.isContentEditable) {
          
          // Manually insert the character at cursor position
          const char = e.shiftKey ? 'S' : 's';
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const value = e.target.value;
            e.target.value = value.substring(0, start) + char + value.substring(end);
            e.target.selectionStart = e.target.selectionEnd = start + 1;
            // Trigger input event so frameworks can detect the change
            e.target.dispatchEvent(new Event('input', { bubbles: true }));
          }
          return false;
        }

        // Case 2: Allow 'S' in Kapa.ai widget input (inside Shadow DOM)
        const kapaContainer = document.getElementById('kapa-widget-container');
        if (kapaContainer && kapaContainer.shadowRoot) {
          // Check which element has focus inside the Shadow DOM
          const shadowActiveElement = kapaContainer.shadowRoot.activeElement;
          if (shadowActiveElement && 
              (shadowActiveElement.tagName === 'INPUT' || 
               shadowActiveElement.tagName === 'TEXTAREA' ||
               shadowActiveElement.isContentEditable)) {
            
            // Manually insert the character at cursor position in Shadow DOM input
            const char = e.shiftKey ? 'S' : 's';
            if (shadowActiveElement.tagName === 'INPUT' || shadowActiveElement.tagName === 'TEXTAREA') {
              const start = shadowActiveElement.selectionStart;
              const end = shadowActiveElement.selectionEnd;
              const value = shadowActiveElement.value;
              shadowActiveElement.value = value.substring(0, start) + char + value.substring(end);
              shadowActiveElement.selectionStart = shadowActiveElement.selectionEnd = start + 1;
              
              // Trigger events so Kapa.ai can detect the change
              shadowActiveElement.dispatchEvent(new Event('input', { bubbles: true }));
              shadowActiveElement.dispatchEvent(new Event('change', { bubbles: true }));
            }
            return false;
          }
        }
        
        // Case 3: Block 'S' everywhere else (prevent any modal from opening)
        return false;
      }
    };

    // Use capture phase to intercept the event before it reaches any widget
    document.addEventListener('keydown', blockSKey, { capture: true, passive: false });

    return () => {
      document.removeEventListener('keydown', blockSKey, { capture: true });
    };
  }, []);

  return (
    <div className="navbar__search" ref={dropdownRef}>
      <div ref={searchButtonRef}></div>
    </div>
  );
}

export default function SearchBar() {
  return (
    <BrowserOnly fallback={<div className="navbar__search"><div></div></div>}>
      {() => <SearchBarContent />}
    </BrowserOnly>
  );
}