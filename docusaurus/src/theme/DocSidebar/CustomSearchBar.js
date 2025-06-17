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
  const [selectedHit, setSelectedHit] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Update global variable when local state changes
  useEffect(() => {
    globalSelectedFilter = selectedFilter;
  }, [selectedFilter]);

  // Inject filter UI into DocSearch modal
  const injectFilterUI = useCallback(() => {
    const searchBar = document.querySelector('.DocSearch-SearchBar');
    if (!searchBar || document.querySelector('.injected-filters')) return true;

    console.log('Injecting filter UI...');

    // Create filter container
    const filterContainer = document.createElement('div');
    filterContainer.className = 'injected-filters';

    // Create filter title
    const filterTitle = document.createElement('div');
    filterTitle.className = 'filter-title';
    filterTitle.textContent = 'FILTER BY CONTENT TYPE:';

    // Create filter buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'filter-buttons';

    // Create filter buttons with improved styling
    SEARCH_FILTERS.forEach((filter) => {
      const button = document.createElement('button');
      button.textContent = `${filter.icon} ${filter.label}`;
      button.className = 'filter-pill';
      button.dataset.filterValue = filter.value;
      
      const isActive = selectedFilter === filter.value;
      if (isActive) {
        button.classList.add('active');
        button.dataset.active = 'true';
      }

      // Enhanced hover effects
      button.addEventListener('mouseenter', () => {
        if (selectedFilter !== filter.value) {
          button.style.transform = 'translateY(-1px)';
        }
      });

      button.addEventListener('mouseleave', () => {
        if (selectedFilter !== filter.value) {
          button.style.transform = 'translateY(0)';
        }
      });

      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Update React state and global variable immediately
        setSelectedFilter(filter.value);
        globalSelectedFilter = filter.value;
        
        // Update button states immediately with improved visual feedback
        buttonsContainer.querySelectorAll('.filter-pill').forEach(btn => {
          const isActiveBtn = btn.dataset.filterValue === filter.value;
          btn.classList.toggle('active', isActiveBtn);
          btn.dataset.active = isActiveBtn.toString();
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

    return true;
  }, [selectedFilter]);

  // Fetch preview content for a selected hit
  const fetchPreviewContent = useCallback(async (hit) => {
    if (!hit?.url) return;
    
    setPreviewLoading(true);
    try {
      const response = await fetch(hit.url);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract the main content
      const mainContent = doc.querySelector('article.markdown, .theme-doc-markdown, main article, .markdown');
      
      if (mainContent) {
        // Clean up the content
        const clonedContent = mainContent.cloneNode(true);
        
        // Remove navigation elements, edit links, etc.
        const elementsToRemove = clonedContent.querySelectorAll(
          '.pagination-nav, .theme-edit-this-page, .theme-last-updated, ' +
          '.breadcrumbs, .theme-doc-version-banner, .theme-doc-version-badge, ' +
          '.theme-doc-breadcrumbs, nav, .DocSearch, .navbar'
        );
        elementsToRemove.forEach(el => el.remove());
        
        // Convert relative links to absolute
        const links = clonedContent.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
        links.forEach(link => {
          const href = link.getAttribute('href');
          if (href?.startsWith('/')) {
            link.setAttribute('href', `${window.location.origin}${href}`);
          }
        });
        
        // Convert relative images to absolute
        const images = clonedContent.querySelectorAll('img[src^="/"], img[src^="./"], img[src^="../"]');
        images.forEach(img => {
          const src = img.getAttribute('src');
          if (src?.startsWith('/')) {
            img.setAttribute('src', `${window.location.origin}${src}`);
          }
        });
        
        setPreviewContent({
          title: hit.hierarchy?.title || hit.hierarchy?.lvl0 || 'Untitled',
          breadcrumb: Object.values(hit.hierarchy || {}).filter(Boolean).join(' › '),
          content: clonedContent.innerHTML,
          url: hit.url
        });
      } else {
        throw new Error('Content not found');
      }
    } catch (error) {
      console.warn('Failed to load preview:', error);
      setPreviewContent({
        title: hit.hierarchy?.title || hit.hierarchy?.lvl0 || 'Untitled',
        breadcrumb: Object.values(hit.hierarchy || {}).filter(Boolean).join(' › '),
        content: '<p>Preview not available. <a href="' + hit.url + '" target="_blank">View full page →</a></p>',
        url: hit.url
      });
    } finally {
      setPreviewLoading(false);
    }
  }, []);
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

  // Inject preview panel into DocSearch modal
  const injectPreviewPanel = useCallback(() => {
    const hitsContainer = document.querySelector('.DocSearch-Hits');
    if (!hitsContainer || document.querySelector('.preview-panel')) return;

    // Create the two-column structure
    const resultsColumn = document.createElement('div');
    resultsColumn.className = 'search-results-column';
    
    const previewPanel = document.createElement('div');
    previewPanel.className = 'preview-panel';
    
    // Move existing hits to results column
    const existingHits = hitsContainer.innerHTML;
    resultsColumn.innerHTML = existingHits;
    
    // Create preview content
    const previewContentArea = document.createElement('div');
    previewContentArea.className = 'preview-content-area';
    
    // Initial placeholder
    previewContentArea.innerHTML = `
      <div class="preview-placeholder">
        <div class="preview-placeholder-icon">📄</div>
        <div class="preview-placeholder-text">
          <strong>Hover over a result to preview</strong><br>
          Move your mouse over any search result to see a preview of the page content.
        </div>
      </div>
    `;
    
    previewPanel.appendChild(previewContentArea);
    
    // Clear hits container and add columns
    hitsContainer.innerHTML = '';
    hitsContainer.appendChild(resultsColumn);
    hitsContainer.appendChild(previewPanel);
    
    // Add hover handlers to results with debouncing
    let hoverTimeout;
    let currentHoveredHit = null;
    
    const addHitHoverHandlers = () => {
      const hits = resultsColumn.querySelectorAll('.DocSearch-Hit');
      hits.forEach((hit) => {
        // Don't add multiple listeners to the same element
        if (hit.hasAttribute('data-preview-enabled')) return;
        hit.setAttribute('data-preview-enabled', 'true');
        
        hit.addEventListener('mouseenter', (e) => {
          // Clear any pending hover timeout
          clearTimeout(hoverTimeout);
          
          // Remove previous hover state
          hits.forEach(h => h.removeAttribute('data-hovered'));
          
          // Mark as hovered
          hit.setAttribute('data-hovered', 'true');
          currentHoveredHit = hit;
          
          // Debounce the preview loading (wait 300ms)
          hoverTimeout = setTimeout(() => {
            if (currentHoveredHit === hit) {
              const link = hit.querySelector('a');
              if (link) {
                const url = link.href;
                const titleElement = hit.querySelector('.DocSearch-Hit-title');
                const pathElement = hit.querySelector('.DocSearch-Hit-path');
                
                const hitData = {
                  url: url,
                  hierarchy: {
                    title: titleElement?.textContent || '',
                    lvl0: pathElement?.textContent || ''
                  }
                };
                
                setSelectedHit(hitData);
                fetchPreviewContent(hitData);
              }
            }
          }, 300);
        });
        
        hit.addEventListener('mouseleave', (e) => {
          // Clear timeout if mouse leaves before delay
          clearTimeout(hoverTimeout);
          hit.removeAttribute('data-hovered');
          
          // Only clear if we're not moving to another hit
          setTimeout(() => {
            const hoveredHit = resultsColumn.querySelector('[data-hovered="true"]');
            if (!hoveredHit) {
              currentHoveredHit = null;
              // Don't clear preview immediately, let user read it
            }
          }, 100);
        });
        
        // Preserve original click behavior (navigation)
        hit.addEventListener('click', (e) => {
          // Let the default DocSearch behavior handle navigation
          // This will close the modal and navigate to the page
        });
      });
    };
    
    // Initial setup
    setTimeout(addHitHoverHandlers, 100);
    
    // Use a more robust observer that handles dynamic content
    const observer = new MutationObserver((mutations) => {
      let shouldUpdateHandlers = false;
      
      mutations.forEach((mutation) => {
        // Check if new hits were added
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && 
              (node.classList?.contains('DocSearch-Hit') || 
               node.querySelector?.('.DocSearch-Hit'))) {
            shouldUpdateHandlers = true;
          }
        });
      });
      
      if (shouldUpdateHandlers) {
        // Debounce the handler addition to avoid too many calls
        setTimeout(addHitHoverHandlers, 50);
      }
    });
    
    observer.observe(resultsColumn, { 
      childList: true, 
      subtree: true,
      attributes: false 
    });
    
    return () => observer.disconnect();
  }, [fetchPreviewContent]);

  // Update preview content when it changes
  useEffect(() => {
    const previewContentArea = document.querySelector('.preview-content-area');
    if (!previewContentArea) return;
    
    if (previewLoading) {
      previewContentArea.innerHTML = `
        <div class="preview-loading">
          <div style="animation: spin 1s linear infinite; display: inline-block;">⏳</div>
          Loading preview...
        </div>
      `;
    } else if (previewContent) {
      previewContentArea.innerHTML = `
        <div class="preview-header">
          <h3 class="preview-title">${previewContent.title}</h3>
          <div class="preview-breadcrumb">${previewContent.breadcrumb}</div>
          <div class="preview-link">
            <a href="${previewContent.url}" target="_blank">
              Open full page →
            </a>
          </div>
        </div>
        <div class="preview-content">${previewContent.content}</div>
      `;
    }
    
    // Add CSS for loading animation
    if (previewLoading && !document.querySelector('#preview-loading-styles')) {
      const style = document.createElement('style');
      style.id = 'preview-loading-styles';
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, [previewContent, previewLoading]);

  // Monitor modal state with MutationObserver since onOpen/onClose might not work reliably
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
            setSelectedHit(null);
            setPreviewContent(null);
            setPreviewLoading(false);
            globalSelectedFilter = '';
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // More robust injection that handles DOM reconstruction
  useEffect(() => {
    if (isModalOpen) {
      let injectionAttempts = 0;
      const maxAttempts = 20; // Try for 2 seconds max
      
      const injectEverything = () => {
        const hasFilters = document.querySelector('.injected-filters');
        const hasPreview = document.querySelector('.preview-panel');
        
        if (!hasFilters) {
          injectFilterUI();
        }
        if (!hasPreview) {
          injectPreviewPanel();
        }
        
        return hasFilters && hasPreview;
      };
      
      // Initial injection
      const initialSuccess = injectEverything();
      
      if (!initialSuccess) {
        // Retry with increasing intervals
        const retryInjection = () => {
          injectionAttempts++;
          const success = injectEverything();
          
          if (!success && injectionAttempts < maxAttempts) {
            setTimeout(retryInjection, 100);
          }
        };
        
        retryInjection();
      }
      
      // Continuous monitoring for DOM changes that break our layout
      const monitorAndRestore = () => {
        const hitsContainer = document.querySelector('.DocSearch-Hits');
        const previewPanel = document.querySelector('.preview-panel');
        
        // If hits container exists but preview panel is missing, we need to re-inject
        if (hitsContainer && !previewPanel) {
          console.log('Preview panel missing, re-injecting...');
          injectPreviewPanel();
        }
        
        // If we don't have the two-column layout, restore it
        const resultsColumn = document.querySelector('.search-results-column');
        if (hitsContainer && !resultsColumn && hitsContainer.children.length > 0) {
          console.log('Two-column layout missing, restoring...');
          injectPreviewPanel();
        }
      };
      
      // Monitor every 200ms while modal is open
      const monitorInterval = setInterval(monitorAndRestore, 200);
      
      return () => {
        clearInterval(monitorInterval);
      };
    }
  }, [isModalOpen, injectFilterUI, injectPreviewPanel]);

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
        {...props}
      />
      
      <button className="kapa-widget-button">
        <span className="kapa-widget-button-text">
          <Icon name="sparkle"/>Ask AI
        </span>
      </button>
    </div>
  );
}