import React, { useEffect } from 'react';
import SearchBar from '@theme-original/SearchBar';
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

export default function CustomSearchBarWrapper(props) {
  
  // Function to inject filter buttons (visual only for now)
  const injectFilterButtons = () => {
    const searchBar = document.querySelector('.DocSearch-SearchBar');
    if (!searchBar || document.querySelector('.filter-buttons-container')) {
      return; // Already injected or search bar not found
    }

    // Create container for filter buttons
    const container = document.createElement('div');
    container.className = 'filter-buttons-container';
    container.style.cssText = `
      padding: 16px;
      border-bottom: 1px solid #e1e5e9;
      background: #f8f9fa;
    `;

    // Create title
    const title = document.createElement('div');
    title.textContent = 'FILTER BY CONTENT TYPE:';
    title.style.cssText = `
      font-size: 12px;
      font-weight: 600;
      color: #656d76;
      text-transform: uppercase;
      margin-bottom: 12px;
      letter-spacing: 0.05em;
    `;

    // Create buttons container
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    `;

    // Create each filter button
    SEARCH_FILTERS.forEach(filter => {
      const button = document.createElement('button');
      button.textContent = `${filter.icon} ${filter.label}`;
      button.className = 'filter-button';
      button.dataset.filter = filter.value;
      button.style.cssText = `
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid #ccc;
        background: white;
        color: #333;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      `;

      // Add hover effect
      button.addEventListener('mouseenter', () => {
        button.style.borderColor = '#5468ff';
        button.style.transform = 'translateY(-1px)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.borderColor = '#ccc';
        button.style.transform = 'translateY(0)';
      });

      // For now, just console.log when clicked (no filtering yet)
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`Filter clicked: ${filter.value} (${filter.label})`);
        
        // Visual feedback - highlight the clicked button
        buttonsDiv.querySelectorAll('.filter-button').forEach(btn => {
          btn.style.background = 'white';
          btn.style.color = '#333';
        });
        button.style.background = '#5468ff';
        button.style.color = 'white';
      });

      buttonsDiv.appendChild(button);
    });

    container.appendChild(title);
    container.appendChild(buttonsDiv);

    // Insert the container after the search bar
    searchBar.parentNode.insertBefore(container, searchBar.nextSibling);
  };

  // Monitor for DocSearch modal opening
  useEffect(() => {
    const checkForModal = () => {
      const modal = document.querySelector('.DocSearch-Modal');
      if (modal) {
        // Modal is open, inject buttons after a small delay
        setTimeout(injectFilterButtons, 100);
      }
    };

    // Check periodically for modal
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