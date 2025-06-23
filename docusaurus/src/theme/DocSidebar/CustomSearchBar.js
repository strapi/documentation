import React, { useEffect } from 'react';
import SearchBar from '@theme-original/SearchBar';
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

// Store all results for filtering
let allResults = [];

export default function CustomSearchBarWrapper(props) {
  
  // Function to store all search results when they appear
  const storeSearchResults = () => {
    const hits = document.querySelectorAll('.DocSearch-Hit');
    if (hits.length === 0) return;

    allResults = Array.from(hits).map(hit => {
      const link = hit.querySelector('a');
      const url = link ? link.href : '';
      
      return {
        element: hit,
        url: url,
        contentType: getEnhancedContentType({ url })
      };
    });
    
    console.log(`Stored ${allResults.length} results for filtering`);
  };

  // Function to apply filter by hiding/showing results
  const applyFilter = (filterValue) => {
    console.log(`Applying filter: ${filterValue}`);
    
    if (allResults.length === 0) {
      storeSearchResults();
    }

    if (!filterValue || filterValue === '') {
      // Show all results
      allResults.forEach(result => {
        result.element.style.display = '';
      });
      
      // Show all sections
      document.querySelectorAll('.DocSearch-Hit-source').forEach(section => {
        section.style.display = '';
      });
      
      // Update result count
      updateResultCount(allResults.length);
      
      // Update empty state (clear it since we're showing all results)
      updateEmptyState('', allResults.length);
      
      console.log(`Showing all ${allResults.length} results`);
      return;
    }

    // Filter results based on content type
    const resultsData = allResults.map(r => ({ url: r.url, contentType: r.contentType }));
    const filteredData = filterResultsByContentType(resultsData, filterValue);
    const filteredUrls = filteredData.map(r => r.url);

    // Show/hide results
    let visibleCount = 0;
    const visibleSections = new Set();
    
    allResults.forEach(result => {
      if (filteredUrls.includes(result.url)) {
        result.element.style.display = '';
        visibleCount++;
        
        // Track which sections have visible results
        const section = result.element.closest('.DocSearch-Hit-source');
        if (section) {
          visibleSections.add(section);
        }
      } else {
        result.element.style.display = 'none';
      }
    });

    // Hide sections that have no visible results
    document.querySelectorAll('.DocSearch-Hit-source').forEach(section => {
      if (!visibleSections.has(section)) {
        section.style.display = 'none';
      } else {
        section.style.display = '';
      }
    });
    
    // Update result count
    updateResultCount(visibleCount);
    
    // Update empty state
    updateEmptyState(filterValue, visibleCount);
    
    console.log(`Filter "${filterValue}": showing ${visibleCount} of ${allResults.length} results`);
  };

    // Function to show/hide empty state message
  const updateEmptyState = (filterValue, visibleCount) => {
    const modal = document.querySelector('.DocSearch-Modal');
    if (!modal) return;

    // Remove existing empty state message
    const existingEmptyState = modal.querySelector('.custom-empty-state');
    if (existingEmptyState) {
      existingEmptyState.remove();
    }

    if (visibleCount === 0 && filterValue) {
      // Find the hits container to insert the empty state message
      const hitsContainer = modal.querySelector('.DocSearch-Hits') || 
                           modal.querySelector('.DocSearch-NoResults')?.parentElement;
      
      if (hitsContainer) {
        const filterLabel = SEARCH_FILTERS.find(f => f.value === filterValue)?.label || filterValue;
        
        // Create empty state message using CSS classes
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

        // Add event listener to the button
        const showAllBtn = emptyState.querySelector('#show-all-results-btn');
        if (showAllBtn) {
          showAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Find and click the "All content" filter button
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
  const updateResultCount = (count) => {
    // Search ONLY within the DocSearch modal for the result count
    const modal = document.querySelector('.DocSearch-Modal');
    if (!modal) return;
    
    // Look for the result count specifically within the modal
    const possibleSelectors = [
      '.DocSearch-Footer p',
      '.DocSearch-Footer [role="button"]',
      'p[role="button"]'
    ];
    
    let resultCountElement = null;
    for (const selector of possibleSelectors) {
      const elements = modal.querySelectorAll(selector);
      for (const element of elements) {
        if (element.textContent.includes('See all')) {
          resultCountElement = element;
          break;
        }
      }
      if (resultCountElement) break;
    }
    
    // Fallback: find any element within modal containing "See all"
    if (!resultCountElement) {
      const allElements = modal.querySelectorAll('*');
      for (const element of allElements) {
        if (element.textContent.includes('See all') && 
            element.textContent.includes('results') &&
            !element.querySelector('*')) { // Make sure it's a leaf element
          resultCountElement = element;
          break;
        }
      }
    }
    
    if (resultCountElement) {
      if (count === 0) {
        // Hide the "See all X results" when there are no results
        resultCountElement.style.display = 'none';
        console.log('Hidden result count (0 results)');
      } else {
        // Show and update the count
        resultCountElement.style.display = '';
        resultCountElement.textContent = `See all ${count} result${count === 1 ? '' : 's'}`;
        console.log(`Updated count to: ${count} result${count === 1 ? '' : 's'}`);
      }
    } else {
      console.log('Could not find result count element within modal');
    }
  };

  // Function to inject filter buttons with filtering functionality
  const injectFilterButtons = () => {
    const searchBar = document.querySelector('.DocSearch-SearchBar');
    if (!searchBar || document.querySelector('.filter-buttons-container')) {
      return; // Already injected or search bar not found
    }

    // Create container for filter buttons
    const container = document.createElement('div');
    container.className = 'filter-buttons-container';

    // Create title
    const title = document.createElement('div');
    title.className = 'filter-title';
    title.textContent = 'FILTER BY CONTENT TYPE:';

    // Create buttons container
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'filter-buttons';

    let activeFilter = '';

    // Create each filter button
    SEARCH_FILTERS.forEach(filter => {
      const button = document.createElement('button');
      button.textContent = `${filter.icon} ${filter.label}`;
      button.className = 'filter-button';
      button.dataset.filter = filter.value;

      // Set "All content" as default active
      if (filter.value === '') {
        button.classList.add('active');
        activeFilter = '';
      }

      // Add click handler with actual filtering
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log(`Filter clicked: ${filter.value} (${filter.label})`);
        
        // Update active filter
        activeFilter = filter.value;
        
        // Update button states using CSS classes
        buttonsDiv.querySelectorAll('.filter-button').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.filter === filter.value);
        });

        // Apply the filter
        setTimeout(() => {
          applyFilter(filter.value);
        }, 100);
        
        return false;
      });

      buttonsDiv.appendChild(button);
    });

    container.appendChild(title);
    container.appendChild(buttonsDiv);

    // Insert the container after the search bar
    searchBar.parentNode.insertBefore(container, searchBar.nextSibling);

    // Store results when buttons are injected
    setTimeout(storeSearchResults, 200);
  };

  // Monitor for DocSearch modal opening and results appearing
  useEffect(() => {
    let hasInjected = false;
    
    const checkForModal = () => {
      const modal = document.querySelector('.DocSearch-Modal');
      const hits = document.querySelectorAll('.DocSearch-Hit');
      
      if (modal && !hasInjected) {
        // Modal is open, inject buttons
        setTimeout(() => {
          injectFilterButtons();
          hasInjected = true;
        }, 100);
      } else if (!modal && hasInjected) {
        // Modal closed, reset
        hasInjected = false;
        allResults = [];
      }

      // Store results when they appear/change
      if (hits.length > 0) {
        setTimeout(storeSearchResults, 100);
      }
    };

    // Check periodically for modal and results
    const interval = setInterval(checkForModal, 200);

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