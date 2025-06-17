import React, { useState, useCallback, useEffect } from 'react';
import { DocSearch } from '@docsearch/react';
import { useThemeConfig } from '@docusaurus/theme-common';
import { filterResultsByContentType, getEnhancedContentType } from '../../utils/searchConfig';
import Icon from '../../components/Icon.js';

const SEARCH_FILTERS = [
  { 
    value: '', 
    label: 'All content', 
    icon: '🔍', 
    color: 'neutral' 
  },
  { 
    value: 'cms', 
    label: 'CMS Docs', 
    icon: '⚙️', 
    color: 'primary'
  },
  { 
    value: 'cloud', 
    label: 'Cloud Docs', 
    icon: '☁️', 
    color: 'secondary'
  },
  { 
    value: 'features', 
    label: 'CMS Features', 
    icon: '✨', 
    color: 'success'
  },
  { 
    value: 'development', 
    label: 'Development', 
    icon: '🔧', 
    color: 'warning'
  },
  { 
    value: 'api', 
    label: 'APIs', 
    icon: '🔌', 
    color: 'info'
  },
  { 
    value: 'configuration', 
    label: 'Configuration', 
    icon: '🛠️', 
    color: 'alternative'
  }
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
  }, [selectedFilter]);

  // Transform and filter items based on global filter
  const transformItems = useCallback((items) => {
    // Apply original transform from config if it exists
    const originalTransform = algolia.transformItems;
    let transformedItems = originalTransform ? originalTransform(items) : items;
    
    // Add contentType to each item
    const itemsWithTypes = transformedItems.map(item => {
      const detectedType = getEnhancedContentType(item);
      return { ...item, contentType: detectedType };
    });
    
    // Apply content type filter using global variable
    const filteredItems = filterResultsByContentType(itemsWithTypes, globalSelectedFilter);
    
    return filteredItems;
  }, [algolia.transformItems]);

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
              
              // Update React state and global variable immediately
              setSelectedFilter(filter.value);
              globalSelectedFilter = filter.value;
              
              // Update button styles immediately
              buttonsContainer.querySelectorAll('.filter-pill').forEach(btn => {
                const isActiveBtn = btn.dataset.filterValue === filter.value;
                btn.style.background = isActiveBtn ? 'var(--docsearch-primary-color)' : 'transparent';
                btn.style.color = isActiveBtn ? 'white' : 'var(--docsearch-text-color)';
                btn.style.borderColor = isActiveBtn ? 'var(--docsearch-primary-color)' : 'var(--docsearch-muted-color)';
                btn.style.fontWeight = isActiveBtn ? '600' : '500';
                btn.style.opacity = isActiveBtn ? '1' : '0.7';
              });
              
              // Force search refresh by modifying input value
              const searchInput = document.querySelector('.DocSearch-Input');
              if (searchInput && searchInput.value) {
                const currentValue = searchInput.value;
                
                // Keep input focused throughout the process
                searchInput.focus();
                
                // Add then remove character to trigger new search
                searchInput.value = currentValue + 'x';
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                
                setTimeout(() => {
                  searchInput.value = currentValue;
                  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                  
                  // Ensure input stays focused and cursor is at the end
                  searchInput.focus();
                  searchInput.setSelectionRange(currentValue.length, currentValue.length);
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
            setSelectedFilter('');
            globalSelectedFilter = '';
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="my-custom-search-bar">
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
      
      <button className="kapa-widget-button">
        <span className="kapa-widget-button-text">
          <Icon name="sparkle"/>Ask AI
        </span>
      </button>
    </div>
  );
}