import React, { useState, useCallback, useEffect } from 'react';
import { DocSearch } from '@docsearch/react';
import { useThemeConfig } from '@docusaurus/theme-common';
import { filterResultsByContentType } from '../../utils/searchConfig';
import Icon from '../../components/Icon.js';

const SEARCH_FILTERS = [
  { value: '', label: 'All content', icon: '🔍', color: 'neutral' },
  { value: 'cms', label: 'CMS Docs', icon: '⚙️', color: 'primary' },
  { value: 'cloud', label: 'Cloud Docs', icon: '☁️', color: 'secondary' },
  { value: 'api', label: 'API Reference', icon: '🔌', color: 'success' },
  { value: 'guides', label: 'Guides', icon: '📖', color: 'warning' },
  { value: 'features', label: 'Features', icon: '✨', color: 'info' }
];

export default function CustomSearchBarWrapper(props) {
  const { algolia } = useThemeConfig();
  const [selectedFilter, setSelectedFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Transform and filter items based on selected filter
  const transformItems = useCallback((items) => {
    // First, apply the original transform from config if it exists
    const originalTransform = algolia.transformItems;
    let transformedItems = originalTransform ? originalTransform(items) : items;
    
    // Then apply our content type filter
    const filteredItems = filterResultsByContentType(transformedItems, selectedFilter);
    
    return filteredItems;
  }, [selectedFilter, algolia.transformItems]);

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
            border-bottom: 1px solid var(--strapi-neutral-200, #dcdce4);
            background: var(--strapi-neutral-50, #f6f6f9);
          `;

          // Create filter title
          const filterTitle = document.createElement('div');
          filterTitle.textContent = 'Filter by content type:';
          filterTitle.style.cssText = `
            font-size: 12px;
            color: var(--strapi-neutral-600, #666687);
            margin-bottom: 8px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          `;

          // Create filter buttons container
          const buttonsContainer = document.createElement('div');
          buttonsContainer.style.cssText = `
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          `;

          // Create filter buttons
          SEARCH_FILTERS.forEach((filter) => {
            const button = document.createElement('button');
            button.textContent = `${filter.icon} ${filter.label}`;
            button.style.cssText = `
              padding: 6px 12px;
              border: 1px solid var(--strapi-neutral-200, #dcdce4);
              border-radius: 20px;
              background: ${selectedFilter === filter.value ? 'var(--strapi-primary-600, #4945ff)' : 'var(--strapi-neutral-0, #ffffff)'};
              color: ${selectedFilter === filter.value ? 'white' : 'var(--strapi-neutral-700, #32324d)'};
              font-size: 12px;
              cursor: pointer;
              transition: all 0.2s ease;
              font-weight: ${selectedFilter === filter.value ? '600' : '500'};
              border: none;
              outline: none;
            `;

            button.addEventListener('mouseenter', () => {
              if (selectedFilter !== filter.value) {
                button.style.background = 'var(--strapi-neutral-100, #eaeaef)';
              }
            });

            button.addEventListener('mouseleave', () => {
              if (selectedFilter !== filter.value) {
                button.style.background = 'var(--strapi-neutral-0, #ffffff)';
              }
            });

            button.addEventListener('click', () => {
              setSelectedFilter(filter.value);
              // Update all buttons
              buttonsContainer.querySelectorAll('button').forEach(btn => {
                const isActive = btn === button;
                btn.style.background = isActive ? 'var(--strapi-primary-600, #4945ff)' : 'var(--strapi-neutral-0, #ffffff)';
                btn.style.color = isActive ? 'white' : 'var(--strapi-neutral-700, #32324d)';
                btn.style.fontWeight = isActive ? '600' : '500';
              });
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
              background: var(--strapi-primary-100, #f0f0ff);
              border-bottom: 1px solid var(--strapi-primary-200, #d9d8ff);
              font-size: 12px;
              color: var(--strapi-primary-700, #271fe0);
              display: flex;
              align-items: center;
              gap: 8px;
            `;
            indicator.innerHTML = `
              <span>Filtering by: <strong>${selectedFilterConfig.label}</strong></span>
              <button style="background: none; border: none; color: var(--strapi-primary-600, #4945ff); cursor: pointer; font-size: 14px; padding: 0;" onclick="this.parentElement.style.display='none';">✕</button>
            `;
            
            filterContainer.appendChild(indicator);
          }
        }
      };

      // Try to inject immediately and also after a small delay for modal animation
      setTimeout(injectFilterUI, 100);
      setTimeout(injectFilterUI, 300);
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
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const selectedFilterConfig = SEARCH_FILTERS.find(f => f.value === selectedFilter) || SEARCH_FILTERS[0];

  return (
    <div className="my-custom-search-bar">
      {/* Clean DocSearch without extra UI */}
      <DocSearch
        {...algolia}
        transformItems={transformItems}
        placeholder={`Search ${selectedFilter ? selectedFilterConfig.label.toLowerCase() : 'documentation'}...`}
        translations={{
          button: {
            buttonText: `Search ${selectedFilter ? selectedFilterConfig.label.toLowerCase() : 'documentation'}...`,
            buttonAriaLabel: 'Search documentation'
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