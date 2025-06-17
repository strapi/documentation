import React, { useState, useCallback, useEffect } from 'react';
import { DocSearch } from '@docsearch/react';
import { useThemeConfig } from '@docusaurus/theme-common';
import { filterResultsByContentType, getContentTypeFromPath } from '../../utils/searchConfig';
import Icon from '../../components/Icon.js';

const SEARCH_FILTERS = [
  { value: '', label: 'All content', icon: '🔍', color: 'neutral' },
  { value: 'cms', label: 'CMS Docs', icon: '⚙️', color: 'primary' },
  { value: 'cloud', label: 'Cloud Docs', icon: '☁️', color: 'secondary' },
  { value: 'api', label: 'API Reference', icon: '🔌', color: 'success' },
  { value: 'guides', label: 'Guides', icon: '📖', color: 'warning' },
  { value: 'features', label: 'Features', icon: '✨', color: 'info' }
];

// Global variable to store current filter - accessible by transformItems
let globalSelectedFilter = '';

export default function CustomSearchBarWrapper(props) {
  const { algolia } = useThemeConfig();
  const [selectedFilter, setSelectedFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update global variable when local state changes
  useEffect(() => {
    globalSelectedFilter = selectedFilter;
    console.log('🌍 Global filter updated to:', globalSelectedFilter);
  }, [selectedFilter]);

  // Transform and filter items based on GLOBAL filter
  const transformItems = useCallback((items) => {
    console.log('🔍 transformItems called with:', { 
      globalSelectedFilter, 
      localSelectedFilter: selectedFilter,
      itemsCount: items.length, 
      firstItemUrl: items[0]?.url 
    });
    
    // First, apply the original transform from config if it exists
    const originalTransform = algolia.transformItems;
    let transformedItems = originalTransform ? originalTransform(items) : items;
    
    console.log('📝 After original transform:', transformedItems.length);
    
    // DEBUG: Check what contentTypes we detect
    const itemsWithTypes = transformedItems.map(item => {
      const url = new URL(item.url);
      const detectedType = getContentTypeFromPath(url.pathname);
      return { ...item, contentType: detectedType };
    });
    
    console.log('🔬 Content types detected:', {
      sample: itemsWithTypes.slice(0, 5).map(item => ({ 
        url: item.url, 
        pathname: new URL(item.url).pathname,
        contentType: item.contentType 
      }))
    });
    
    // Then apply our content type filter using GLOBAL variable
    const filteredItems = filterResultsByContentType(itemsWithTypes, globalSelectedFilter);
    
    console.log('✅ After our filter:', { 
      filteredCount: filteredItems.length, 
      usedFilter: globalSelectedFilter,
      originalCount: itemsWithTypes.length,
      VISIBLE_DIFFERENCE: itemsWithTypes.length !== filteredItems.length ? '🎯 FILTERING WORKED!' : '😐 No visual change expected',
      sampleTypes: filteredItems.slice(0, 3).map(item => ({ url: item.url, contentType: item.contentType }))
    });
    
    return filteredItems;
  }, [algolia.transformItems]); // Remove selectedFilter from deps

  // Inject filter UI into DocSearch modal
  useEffect(() => {
    if (isModalOpen) {
      const injectFilterUI = () => {
        const searchBar = document.querySelector('.DocSearch-SearchBar');
        if (searchBar && !document.querySelector('.injected-filters')) {
          // Create filter container
          const filterContainer = document.createElement('div');
          filterContainer.className = 'injected-filters';
          filterContainer.style.cssText = `
            padding: 12px 16px;
            border-bottom: 1px solid var(--docsearch-muted-color);
            background: var(--docsearch-modal-background);
          `;

          // Create filter title
          const filterTitle = document.createElement('div');
          filterTitle.textContent = 'FILTER BY CONTENT TYPE:';
          filterTitle.style.cssText = `
            font-size: 12px;
            color: var(--docsearch-muted-color);
            margin-bottom: 8px;
            font-weight: 600;
            letter-spacing: 0.5px;
          `;

          // Create filter buttons container
          const buttonsContainer = document.createElement('div');
          buttonsContainer.style.cssText = `
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
          `;

          // Create filter buttons
          SEARCH_FILTERS.forEach((filter) => {
            const button = document.createElement('button');
            button.textContent = `${filter.icon} ${filter.label}`;
            button.className = 'filter-pill';
            button.dataset.filterValue = filter.value;
            
            const isActive = selectedFilter === filter.value;
            button.style.cssText = `
              padding: 4px 12px;
              border-radius: 16px;
              background: ${isActive ? 'var(--docsearch-primary-color)' : 'transparent'};
              color: ${isActive ? 'white' : 'var(--docsearch-text-color)'};
              border: 1px solid ${isActive ? 'var(--docsearch-primary-color)' : 'var(--docsearch-muted-color)'};
              font-size: 12px;
              cursor: pointer;
              transition: all 0.2s ease;
              font-weight: ${isActive ? '600' : '500'};
              outline: none;
              opacity: ${isActive ? '1' : '0.7'};
            `;

            button.addEventListener('mouseenter', () => {
              if (selectedFilter !== filter.value) {
                button.style.opacity = '1';
                button.style.borderColor = 'var(--docsearch-primary-color)';
              }
            });

            button.addEventListener('mouseleave', () => {
              if (selectedFilter !== filter.value) {
                button.style.opacity = '0.7';
                button.style.borderColor = 'var(--docsearch-muted-color)';
              }
            });

            button.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              console.log('🎯 Filter button clicked:', filter.value);
              
              // Update React state AND global variable immediately
              setSelectedFilter(filter.value);
              globalSelectedFilter = filter.value;
              console.log('🔄 Both filters updated to:', filter.value);
              
              // Update button styles immediately
              buttonsContainer.querySelectorAll('.filter-pill').forEach(btn => {
                const isActiveBtn = btn.dataset.filterValue === filter.value;
                btn.style.background = isActiveBtn ? 'var(--docsearch-primary-color)' : 'transparent';
                btn.style.color = isActiveBtn ? 'white' : 'var(--docsearch-text-color)';
                btn.style.borderColor = isActiveBtn ? 'var(--docsearch-primary-color)' : 'var(--docsearch-muted-color)';
                btn.style.fontWeight = isActiveBtn ? '600' : '500';
                btn.style.opacity = isActiveBtn ? '1' : '0.7';
              });
              
              // Force a character change to trigger new search
              const searchInput = document.querySelector('.DocSearch-Input');
              if (searchInput && searchInput.value) {
                const currentValue = searchInput.value;
                console.log('🔄 Forcing re-search by adding/removing character');
                
                // Keep the input focused throughout the process
                searchInput.focus();
                
                // Add a character, then remove it
                searchInput.value = currentValue + 'x';
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                
                setTimeout(() => {
                  searchInput.value = currentValue;
                  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                  
                  // Ensure input stays focused and cursor is at the end
                  searchInput.focus();
                  searchInput.setSelectionRange(currentValue.length, currentValue.length);
                  
                  console.log('✅ Character trick completed with focus maintained');
                }, 100);
              }
            });

            buttonsContainer.appendChild(button);
          });

          filterContainer.appendChild(filterTitle);
          filterContainer.appendChild(buttonsContainer);

          // Insert after search bar
          searchBar.parentNode.insertBefore(filterContainer, searchBar.nextSibling);

          // Add active filter indicator if one is selected
          if (selectedFilter) {
            const selectedFilterConfig = SEARCH_FILTERS.find(f => f.value === selectedFilter);
            const indicator = document.createElement('div');
            indicator.className = 'active-filter-indicator';
            indicator.style.cssText = `
              padding: 8px 16px;
              background: var(--docsearch-primary-color);
              color: white;
              font-size: 12px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              opacity: 0.9;
            `;
            indicator.innerHTML = `
              <span>Filtering by: <strong>${selectedFilterConfig.label}</strong></span>
              <button class="clear-filter-btn" style="background: none; border: none; color: white; cursor: pointer; font-size: 16px; padding: 0; opacity: 0.8;" title="Clear filter">✕</button>
            `;
            
            // Add clear filter functionality
            indicator.querySelector('.clear-filter-btn').addEventListener('click', () => {
              setSelectedFilter('');
              globalSelectedFilter = '';
              indicator.remove();
            });
            
            filterContainer.appendChild(indicator);
          }
        }
      };

      // Try to inject with multiple attempts as modal loads
      const attempts = [50, 150, 300];
      attempts.forEach(delay => {
        setTimeout(injectFilterUI, delay);
      });
    }
  }, [isModalOpen, selectedFilter]);

  // Monitor modal state
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList?.contains('DocSearch-Container')) {
            setIsModalOpen(true);
          }
        });
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList?.contains('DocSearch-Container')) {
            setIsModalOpen(false);
            setSelectedFilter(''); // Reset filter when modal closes
            globalSelectedFilter = ''; // Reset global too
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="my-custom-search-bar">
      {/* Clean DocSearch */}
      <DocSearch
        {...algolia}
        transformItems={transformItems}
        translations={{
          button: {
            buttonText: 'Search',
            buttonAriaLabel: 'Search'
          }
        }}
      />
      
      {/* Kapa AI Button */}
      <button className="kapa-widget-button">
        <span className="kapa-widget-button-text">
          <Icon name="sparkle"/>Ask AI
        </span>
      </button>
    </div>
  );
}