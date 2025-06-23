import React, { useEffect, useRef } from 'react';
import SearchBar from '@theme-original/SearchBar';
import { useThemeConfig } from '@docusaurus/theme-common';
import { getEnhancedContentType, filterResultsByContentType } from '../../utils/searchConfig';
import Icon from '../../components/Icon.js'

const SEARCH_FILTERS = [
  { value: '', label: 'All content', icon: '🔍' },
  { value: 'cms', label: 'CMS Docs', icon: '⚙️' },
  { value: 'cloud', label: 'Cloud Docs', icon: '☁️' },
  { value: 'features', label: 'CMS Features', icon: '✨' },
  { value: 'development', label: 'Development', icon: '🔧' },
  { value: 'api', label: 'APIs', icon: '🔌' },
  { value: 'configuration', label: 'Configuration', icon: '🛠️' }
];

// Store all results from Algolia API
let allAlgoliaResults = [];
let lastSearchQuery = '';

export default function CustomSearchBarWrapper(props) {
  const { algolia } = useThemeConfig();
  const searchClientRef = useRef(null);

  // Initialize Algolia search client
  useEffect(() => {
    if (window.docsearch) {
      // Try to get the search client from DocSearch
      console.log('🔌 Initializing Algolia client...');
    }
  }, []);

  // Function to search Algolia directly and get ALL results
  const searchAlgoliaDirectly = async (query) => {
    if (!query || query === lastSearchQuery) return;
    
    try {
      console.log(`🔍 Searching Algolia directly for: "${query}"`);
      
      // Use fetch to call Algolia directly
      const response = await fetch(`https://${algolia.appId}-dsn.algolia.net/1/indexes/${algolia.indexName}/query`, {
        method: 'POST',
        headers: {
          'X-Algolia-Application-Id': algolia.appId,
          'X-Algolia-API-Key': algolia.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          hitsPerPage: 1000, // Get up to 1000 results
          ...algolia.searchParameters
        })
      });

      const data = await response.json();
      
      if (data.hits) {
        // Add contentType to each result
        const resultsWithTypes = data.hits.map(hit => ({
          ...hit,
          contentType: getEnhancedContentType(hit)
        }));
        
        allAlgoliaResults = resultsWithTypes;
        lastSearchQuery = query;
        
        console.log(`✅ Got ${allAlgoliaResults.length} results from Algolia API`);
        
        // Show content type breakdown
        const typeCounts = {};
        allAlgoliaResults.forEach(result => {
          typeCounts[result.contentType] = (typeCounts[result.contentType] || 0) + 1;
        });
        console.log('📊 Full content types:', typeCounts);
        
        return allAlgoliaResults;
      }
    } catch (error) {
      console.error('❌ Algolia API error:', error);
    }
    
    return [];
  };

  // Monitor search input to trigger our API search
  const monitorSearchInput = () => {
    const searchInput = document.querySelector('.DocSearch-Input');
    if (!searchInput) return;

    // Remove any existing listener
    searchInput.removeEventListener('input', handleSearchInput);
    
    // Add new listener
    searchInput.addEventListener('input', handleSearchInput);
  };

  // Handle search input changes
  const handleSearchInput = async (event) => {
    const query = event.target.value.trim();
    if (query.length >= 2) { // Start searching after 2 characters
      await searchAlgoliaDirectly(query);
    }
  };

  // Function to apply filter using our complete Algolia results
  const applyFilter = (filterValue) => {
    console.log(`🔍 Applying filter: "${filterValue}" on ${allAlgoliaResults.length} total results`);
    
    if (allAlgoliaResults.length === 0) {
      console.log('⚠️ No Algolia results available for filtering');
      return;
    }

    // Get DOM elements for the results currently shown
    const currentHits = document.querySelectorAll('.DocSearch-Hit');
    if (currentHits.length === 0) {
      console.log('⚠️ No DOM results to filter');
      return;
    }

    console.log(`🔍 Debug: Found ${currentHits.length} DOM elements to work with`);

    if (!filterValue || filterValue === '') {
      // Show all current DOM results
      currentHits.forEach(hit => hit.style.display = '');
      updateResultCount(allAlgoliaResults.length);
      console.log(`👁️ Showing all results (${currentHits.length} in DOM, ${allAlgoliaResults.length} total)`);
      return;
    }

    // Filter the complete Algolia results
    const filteredResults = filterResultsByContentType(allAlgoliaResults, filterValue);
    
    console.log(`📊 Filter "${filterValue}": ${filteredResults.length} of ${allAlgoliaResults.length} results match`);
    
    // Debug: Log some sample URLs for comparison
    console.log('🔍 Sample Algolia URLs:', filteredResults.slice(0, 3).map(r => r.url));
    
    const domUrls = Array.from(currentHits).map(hit => {
      const link = hit.querySelector('a');
      return link ? link.href : null;
    }).filter(Boolean);
    
    console.log('🔍 Sample DOM URLs:', domUrls.slice(0, 3));

    // Create flexible URL matching
    const getUrlKey = (url) => {
      try {
        const urlObj = new URL(url);
        return urlObj.pathname + urlObj.hash; // Use pathname + hash for matching
      } catch {
        return url;
      }
    };

    // Create sets for faster lookup
    const filteredUrlKeys = new Set(filteredResults.map(r => getUrlKey(r.url)));

    // Show/hide DOM elements based on filtered URLs
    let visibleCount = 0;
    currentHits.forEach(hit => {
      const link = hit.querySelector('a');
      if (link) {
        const domUrlKey = getUrlKey(link.href);
        if (filteredUrlKeys.has(domUrlKey)) {
          hit.style.display = '';
          visibleCount++;
        } else {
          hit.style.display = 'none';
        }
      } else {
        hit.style.display = 'none';
      }
    });

    updateResultCount(filteredResults.length); // Use total filtered count
    updateEmptyState(filterValue, visibleCount);
    
    console.log(`👁️ Showing ${visibleCount} DOM elements (${filteredResults.length} total match filter)`);
    
    // If no DOM elements are visible but we have filtered results, log for debugging
    if (visibleCount === 0 && filteredResults.length > 0) {
      console.log('🚨 URL mismatch detected:');
      console.log('Expected URLs (from filter):', filteredResults.slice(0, 3).map(r => getUrlKey(r.url)));
      console.log('Available URLs (from DOM):', domUrls.slice(0, 3).map(url => getUrlKey(url)));
    }
  };

  // Update result count
  const updateResultCount = (count) => {
    const modal = document.querySelector('.DocSearch-Modal');
    if (!modal) return;
    
    const allElements = modal.querySelectorAll('*');
    for (const element of allElements) {
      if (element.textContent.includes('See all') && 
          element.textContent.includes('results') &&
          !element.querySelector('*')) {
        if (count === 0) {
          element.style.display = 'none';
        } else {
          element.style.display = '';
          element.textContent = `See all ${count} result${count === 1 ? '' : 's'}`;
        }
        break;
      }
    }
  };

  // Show empty state
  const updateEmptyState = (filterValue, visibleCount) => {
    const modal = document.querySelector('.DocSearch-Modal');
    if (!modal) return;

    const existingEmptyState = modal.querySelector('.custom-empty-state');
    if (existingEmptyState) {
      existingEmptyState.remove();
    }

    if (visibleCount === 0 && filterValue) {
      const hitsContainer = modal.querySelector('.DocSearch-Hits') || 
                           modal.querySelector('.DocSearch-NoResults')?.parentElement;
      
      if (hitsContainer) {
        const filterLabel = SEARCH_FILTERS.find(f => f.value === filterValue)?.label || filterValue;
        
        const emptyState = document.createElement('div');
        emptyState.className = 'custom-empty-state';
        emptyState.innerHTML = `
          <div class="empty-icon">📄</div>
          <h3 class="empty-title">No ${filterLabel} results found</h3>
          <p class="empty-description">
            Try searching for something else or use a different filter.
          </p>
          <button class="show-all-button" id="show-all-results-btn">
            Show all results
          </button>
        `;

        const showAllBtn = emptyState.querySelector('#show-all-results-btn');
        if (showAllBtn) {
          showAllBtn.style.color = 'white';
          showAllBtn.style.background = 'var(--docsearch-primary-color, #5468ff)';
          
          showAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const allContentButton = document.querySelector('[data-filter=""]');
            if (allContentButton) {
              allContentButton.click();
            }
          });
        }

        hitsContainer.appendChild(emptyState);
      }
    }
  };

  // Inject filter buttons
  const injectFilterButtons = () => {
    const searchBar = document.querySelector('.DocSearch-SearchBar');
    if (!searchBar || document.querySelector('.filter-buttons-container')) {
      return;
    }

    const container = document.createElement('div');
    container.className = 'filter-buttons-container';

    const title = document.createElement('div');
    title.className = 'filter-title';
    title.textContent = 'FILTER BY CONTENT TYPE:';

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'filter-buttons';

    SEARCH_FILTERS.forEach(filter => {
      const button = document.createElement('button');
      button.textContent = `${filter.icon} ${filter.label}`;
      button.className = 'filter-button';
      button.dataset.filter = filter.value;

      if (filter.value === '') {
        button.classList.add('active');
      }

      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log(`🎯 Filter clicked: ${filter.value} (${filter.label})`);
        
        // Update active button
        buttonsDiv.querySelectorAll('.filter-button').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.filter === filter.value);
        });

        // Apply filter
        applyFilter(filter.value);
        
        return false;
      });

      buttonsDiv.appendChild(button);
    });

    container.appendChild(title);
    container.appendChild(buttonsDiv);
    searchBar.parentNode.insertBefore(container, searchBar.nextSibling);
  };

  // Monitor for modal and setup
  useEffect(() => {
    let hasInjected = false;
    
    const checkForModal = () => {
      const modal = document.querySelector('.DocSearch-Modal');
      
      if (modal && !hasInjected) {
        // Modal opened
        setTimeout(() => {
          injectFilterButtons();
          monitorSearchInput(); // Setup search monitoring
          hasInjected = true;
        }, 100);
      } else if (!modal && hasInjected) {
        // Modal closed
        hasInjected = false;
        allAlgoliaResults = [];
        lastSearchQuery = '';
        console.log('🔄 Modal closed, reset Algolia results');
      }
    };

    const interval = setInterval(checkForModal, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="my-custom-search-bar">
      <SearchBar {...props} />
      <button className="kapa-widget-button">
        <span className="kapa-widget-button-text">
          <Icon name="sparkle"/>Ask AI
        </span>
      </button>
    </div>
  );
}