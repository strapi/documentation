import React, { useEffect, useRef } from 'react';
import { docsearch } from 'meilisearch-docsearch';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useColorMode } from '@docusaurus/theme-common';
import 'meilisearch-docsearch/css';

export default function SearchBar() {
  const { siteConfig } = useDocusaurusContext();
  const { colorMode } = useColorMode();
  const searchButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInstanceRef = useRef(null);

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

    const search = docsearch({
      container: searchButtonRef.current,
      host: siteConfig.customFields.meilisearch.host,
      apiKey: siteConfig.customFields.meilisearch.apiKey,
      indexUid: siteConfig.customFields.meilisearch.indexUid,
      
      transformItems: (items) => {
        return items.map((item) => ({
          ...item,
          url: item.url.replace('https://docs.strapi.io', ''),
        }));
      },

      searchParams: {
        // attributesToHighlight: ['hierarchy', 'content'],
        // highlightPreTag: '<mark>',
        // highlightPostTag: '</mark>',
        matchingStrategy: 'all',
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

    // Store the search instance
    searchInstanceRef.current = search;

    // Add dark mode class when needed
    if (colorMode === 'dark') {
      dropdownRef.current?.classList.add('dark');
    } else {
      dropdownRef.current?.classList.remove('dark');
    }

    return () => {
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