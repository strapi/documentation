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

    const handleKeyDown = (e) => {
      const kapaContainer = document.getElementById('kapa-widget-container');
      
      if (!kapaContainer || !kapaContainer.shadowRoot) {
        return;
      }

      const shadowActiveElement = kapaContainer.shadowRoot.activeElement;
      
      if (shadowActiveElement && 
          (shadowActiveElement.tagName === 'INPUT' || 
           shadowActiveElement.tagName === 'TEXTAREA' || 
           shadowActiveElement.isContentEditable)) {
        
        const allowedKeys = ['Enter', 'Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        
        if (!allowedKeys.includes(e.key)) {
          e.stopImmediatePropagation();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    if (searchInstanceRef.current) {
      searchInstanceRef.current.destroy?.();
      searchInstanceRef.current = null;
    }
    
    searchButtonRef.current.innerHTML = '';

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
            
            if (item.url && item.url.includes('/cms/')) {
              section = 'CMS';
            } else if (item.url && item.url.includes('/cloud/')) {
              section = 'Cloud';
            }
            
            return {
              ...item,
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
      document.removeEventListener('keydown', handleKeyDown, true);
      if (searchInstanceRef.current) {
        searchInstanceRef.current.destroy?.();
        searchInstanceRef.current = null;
      }
    };
  }, [colorMode, siteConfig]);

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