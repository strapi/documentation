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

  // Function to create a DOM element for an Algolia result
  const createResultElement = (result) => {
    const hit = document.createElement('div');
    hit.className = 'DocSearch-Hit';
    
    const link = document.createElement('a');
    link.href = result.url;
    link.className = 'DocSearch-Hit-Container';
    
    // Create the result content structure
    link.innerHTML = `
      <div class="DocSearch-Hit-Content">
        <div class="DocSearch-Hit-Title">
          ${result.hierarchy?.lvl0 || result.hierarchy?.title || 'Untitled'}
        </div>
        <div class="DocSearch-Hit-Path">
          ${Object.values(result.hierarchy || {}).filter(Boolean).join(' › ')}
        </div>
      </div>
    `;
    
    hit.appendChild(link);
    return hit;
  };

  // Function to apply filter using our complete Algolia results
  const applyFilter = (filterValue) => {
    console.log(`🔍 Applying filter: "${filterValue}" on ${allAlgoliaResults.length} total results`);
    
    if (allAlgoliaResults.length === 0) {
      console.log('⚠️ No Algolia results available for filtering');
      return;
    }

    // Find the hits container
    const hitsContainer = document.querySelector('.DocSearch-Hits');
    if (!hitsContainer) {
      console.log('⚠️ No hits container found');
      return;
    }

    console.log(`🔍 Ready to inject results into DOM`);

    let resultsToShow = allAlgoliaResults;

    if (filterValue && filterValue !== '') {
      // Filter the complete Algolia results
      resultsToShow = filterResultsByContentType(allAlgoliaResults, filterValue);
      console.log(`📊 Filter "${filterValue}": ${resultsToShow.length} of ${allAlgoliaResults.length} results match`);
    } else {
      console.log(`👁️ Showing all ${allAlgoliaResults.length} results`);
    }

    // Clear existing results
    hitsContainer.innerHTML = '';

    if (resultsToShow.length === 0) {
      updateResultCount(0);
      updateEmptyState(filterValue, 0);
      console.log(`👁️ No results to display`);
      return;
    }

    // Create and inject new result elements
    const fragment = document.createDocumentFragment();
    
    // Limit to reasonable number for performance
    const maxResults = Math.min(resultsToShow.length, 50);
    
    for (let i = 0; i < maxResults; i++) {
      const resultElement = createResultElement(resultsToShow[i]);
      fragment.appendChild(resultElement);
    }
    
    hitsContainer.appendChild(fragment);

    updateResultCount(resultsToShow.length);
    updateEmptyState(filterValue, resultsToShow.length > 0 ? maxResults : 0);
    
    console.log(`👁️ Injected ${maxResults} DOM elements (${resultsToShow.length} total results match)`);
    
    // Show content type breakdown of displayed results
    const displayedTypeCounts = {};
    resultsToShow.slice(0, maxResults).forEach(result => {
      displayedTypeCounts[result.contentType] = (displayedTypeCounts[result.contentType] || 0) + 1;
    });
    console.log('📊 Displayed content types:', displayedTypeCounts);
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