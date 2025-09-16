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

  useEffect(() => {
    if (!searchButtonRef.current) {
      return;
    }

    const search = docsearch({
      container: searchButtonRef.current,
      host: siteConfig.customFields.meilisearch.host,
      apiKey: siteConfig.customFields.meilisearch.apiKey,
      indexUid: siteConfig.customFields.meilisearch.indexUid,
      
      // Optional: Transform search results
      transformItems: (items) => {
        return items.map((item) => ({
          ...item,
          url: item.url.replace('https://docs.strapi.io', ''),
        }));
      },

      // Optional: Customize search parameters
      searchParams: {
        attributesToHighlight: ['hierarchy', 'content'],
        attributesToSnippet: ['content:30'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
        snippetEllipsisText: '…',
      },

      // Handle dark mode
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

      // Apply dark mode class
      getMissingResultsUrl: ({ query }) => {
        return `https://github.com/strapi/documentation/issues/new?title=Missing+search+results+for+${query}`;
      },
    });

    // Add dark mode class when needed
    if (colorMode === 'dark') {
      dropdownRef.current?.classList.add('dark');
    }

    return () => {
      search.destroy?.();
    };
  }, [colorMode, siteConfig]);

  return (
    <div className="navbar__search" ref={dropdownRef}>
      <div ref={searchButtonRef}></div>
    </div>
  );
}