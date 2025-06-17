import React, { useState, useCallback } from 'react';
import { DocSearch } from '@docsearch/react';
import { useThemeConfig } from '@docusaurus/theme-common';
import { filterResultsByContentType } from '../../utils/searchConfig';
import './search-bar.scss';

const SEARCH_FILTERS = [
  { value: '', label: 'All content', icon: '🔍', color: 'neutral' },
  { value: 'cms', label: 'CMS Docs', icon: '⚙️', color: 'primary' },
  { value: 'cloud', label: 'Cloud Docs', icon: '☁️', color: 'secondary' },
  { value: 'api', label: 'API Reference', icon: '🔌', color: 'success' },
  { value: 'guides', label: 'Guides', icon: '📖', color: 'warning' },
  { value: 'features', label: 'Features', icon: '✨', color: 'info' }
];

export default function SearchBar() {
  const { algolia } = useThemeConfig();
  const [selectedFilter, setSelectedFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Transform and filter items based on selected filter
  const transformItems = useCallback((items) => {
    // First, apply the original transform from config if it exists
    const originalTransform = algolia.transformItems;
    let transformedItems = originalTransform ? originalTransform(items) : items;
    
    // Then apply our content type filter
    const filteredItems = filterResultsByContentType(transformedItems, selectedFilter);
    
    return filteredItems;
  }, [selectedFilter, algolia.transformItems]);

  const selectedFilterConfig = SEARCH_FILTERS.find(f => f.value === selectedFilter) || SEARCH_FILTERS[0];

  return (
    <div className="enhanced-search-container">
      {/* Filter Section */}
      <div className="filter-section">
        <button 
          className="filter-toggle"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          aria-expanded={isFilterOpen}
          title={`Currently filtering: ${selectedFilterConfig.label}`}
        >
          <span className="filter-icon">
            {selectedFilterConfig.icon}
          </span>
          <span className="filter-label">
            {selectedFilterConfig.label}
          </span>
          <span className="chevron">
            {isFilterOpen ? '▲' : '▼'}
          </span>
        </button>
        
        {/* Filter Dropdown */}
        {isFilterOpen && (
          <div className="filter-dropdown">
            {SEARCH_FILTERS.map((filter) => (
              <button
                key={filter.value}
                className={`filter-option ${
                  selectedFilter === filter.value ? 'active' : ''
                } ${filter.color}`}
                onClick={() => {
                  setSelectedFilter(filter.value);
                  setIsFilterOpen(false);
                }}
              >
                <span className="filter-option-icon">{filter.icon}</span>
                <span>{filter.label}</span>
                {selectedFilter === filter.value && (
                  <span className="checkmark">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced DocSearch */}
      <div className="search-bar-wrapper">
        <DocSearch
          {...algolia}
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
        />
      </div>

      {/* Filter indicator when active */}
      {selectedFilter && (
        <div className="active-filter-indicator">
          <span className="indicator-text">
            Filtering by: <strong>{selectedFilterConfig.label}</strong>
          </span>
          <button 
            className="clear-filter"
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