import React, { useState, useCallback } from 'react';
import { DocSearch } from '@docsearch/react';
import docusaurusConfig from '../../../docusaurus.config';
import { filterResultsByContentType } from '../../utils/searchConfig';
import styles from './search-bar.module.scss';

const SEARCH_FILTERS = [
  { value: '', label: 'All content', icon: '🔍', color: 'neutral' },
  { value: 'cms', label: 'CMS Docs', icon: '⚙️', color: 'primary' },
  { value: 'cloud', label: 'Cloud Docs', icon: '☁️', color: 'secondary' },
  { value: 'api', label: 'API Reference', icon: '🔌', color: 'success' },
  { value: 'guides', label: 'Guides', icon: '📖', color: 'warning' },
  { value: 'features', label: 'Features', icon: '✨', color: 'info' }
];

export function SearchBar(props) {
  const [selectedFilter, setSelectedFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Transform and filter items based on selected filter
  const transformItems = useCallback((items) => {
    // First, apply the original transform from docusaurus config
    const originalTransform = docusaurusConfig.themeConfig.algolia.transformItems;
    let transformedItems = originalTransform ? originalTransform(items) : items;
    
    // Then apply our content type filter
    const filteredItems = filterResultsByContentType(transformedItems, selectedFilter);
    
    return filteredItems;
  }, [selectedFilter]);

  const selectedFilterConfig = SEARCH_FILTERS.find(f => f.value === selectedFilter) || SEARCH_FILTERS[0];

  return (
    <div className={styles['enhanced-search-container']}>
      {/* Filter Section */}
      <div className={styles['filter-section']}>
        <button 
          className={styles['filter-toggle']}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          aria-expanded={isFilterOpen}
          title={`Currently filtering: ${selectedFilterConfig.label}`}
        >
          <span className={styles['filter-icon']}>
            {selectedFilterConfig.icon}
          </span>
          <span className={styles['filter-label']}>
            {selectedFilterConfig.label}
          </span>
          <span className={styles['chevron']}>
            {isFilterOpen ? '▲' : '▼'}
          </span>
        </button>
        
        {/* Filter Dropdown */}
        {isFilterOpen && (
          <div className={styles['filter-dropdown']}>
            {SEARCH_FILTERS.map((filter) => (
              <button
                key={filter.value}
                className={`${styles['filter-option']} ${
                  selectedFilter === filter.value ? styles['active'] : ''
                } ${styles[filter.color]}`}
                onClick={() => {
                  setSelectedFilter(filter.value);
                  setIsFilterOpen(false);
                }}
              >
                <span className={styles['filter-option-icon']}>{filter.icon}</span>
                <span>{filter.label}</span>
                {selectedFilter === filter.value && (
                  <span className={styles['checkmark']}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced DocSearch */}
      <div className={styles['search-bar']}>
        <DocSearch
          {...docusaurusConfig.themeConfig.algolia}
          transformItems={transformItems}
          placeholder={`Search ${selectedFilter ? selectedFilterConfig.label.toLowerCase() : 'documentation'}...`}
          translations={{
            button: {
              buttonText: `Search ${selectedFilter ? selectedFilterConfig.label.toLowerCase() : 'documentation'}...`,
              buttonAriaLabel: 'Search documentation'
            },
            modal: {
              searchBox: {
                resetButtonTitle: 'Clear the query',
                resetButtonAriaLabel: 'Clear the query',
                cancelButtonText: 'Cancel',
                cancelButtonAriaLabel: 'Cancel'
              },
              startScreen: {
                recentSearchesTitle: 'Recent',
                noRecentSearchesText: 'No recent searches',
                saveRecentSearchButtonTitle: 'Save this search',
                removeRecentSearchButtonTitle: 'Remove this search from history',
                favoriteSearchesTitle: 'Favorite',
                removeFavoriteSearchButtonTitle: 'Remove this search from favorites'
              },
              errorScreen: {
                titleText: 'Unable to fetch results',
                helpText: 'You might want to check your network connection.'
              },
              footer: {
                selectText: 'to select',
                selectKeyAriaLabel: 'Enter key',
                navigateText: 'to navigate',
                navigateUpKeyAriaLabel: 'Arrow up',
                navigateDownKeyAriaLabel: 'Arrow down',
                closeText: 'to close',
                closeKeyAriaLabel: 'Escape key',
                searchByText: 'Search by'
              },
              noResultsScreen: {
                noResultsText: 'No results for',
                suggestedQueryText: 'Try searching for',
                reportMissingResultsText: 'Believe this query should return results?',
                reportMissingResultsLinkText: 'Let us know.'
              }
            }
          }}
          {...props}
        />
      </div>

      {/* Filter indicator when active */}
      {selectedFilter && (
        <div className={styles['active-filter-indicator']}>
          <span className={styles['indicator-text']}>
            Filtering by: <strong>{selectedFilterConfig.label}</strong>
          </span>
          <button 
            className={styles['clear-filter']}
            onClick={() => setSelectedFilter('')}
            title="Clear filter"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}