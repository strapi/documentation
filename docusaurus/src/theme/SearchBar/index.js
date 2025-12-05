import React, { useEffect, useRef, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useColorMode } from '@docusaurus/theme-common';
import BrowserOnly from '@docusaurus/BrowserOnly';

function SearchBarContent() {
  const { siteConfig } = useDocusaurusContext();
  const { colorMode } = useColorMode();
  const searchButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInstanceRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const originalFetchRef = useRef(null);

  function isDoNotTrackEnabled() {
    try {
      const dnt = (navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack || '').toString();
      return dnt === '1' || dnt.toLowerCase() === 'yes';
    } catch (_) {
      return false;
    }
  }

  function getOrCreateMonthlyUserId() {
    if (isDoNotTrackEnabled()) return null;
    try {
      const key = 'msUserId';
      const now = new Date();
      const monthKey = now.toISOString().slice(0, 7); // YYYY-MM (UTC)
      const raw = window.localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.id && parsed.month === monthKey) {
            return parsed.id;
          }
        } catch {}
      }
      const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
      const value = JSON.stringify({ id: uuid, month: monthKey });
      window.localStorage.setItem(key, value);
      return uuid;
    } catch (_) {
      return null;
    }
  }

  function shouldAttachUserIdHeader(urlStr) {
    try {
      const meiliHost = siteConfig?.customFields?.meilisearch?.host;
      if (!meiliHost) return false;
      const u = new URL(urlStr, window.location.origin);
      const meili = new URL(meiliHost);
      if (u.origin !== meili.origin) return false;
      // Only for search requests
      return /\/indexes\/[^/]+\/search$/.test(u.pathname);
    } catch {
      return false;
    }
  }

  useEffect(() => {

    const handleKeyDown = (e) => {
      const kapaContainer = document.getElementById('kapa-widget-container');
      
      if (!kapaContainer || !kapaContainer.shadowRoot) {
        return;
      }

      const shadowActiveElement = kapaContainer.shadowRoot.activeElement;
      
      if (shadowActiveElement && 
          (shadowActiveElement.tagName === 'INPUT' || 
           shadowActiveElement.tagName === 'TEXTAREA' || 
           shadowActiveElement.isContentEditable)) {
        
        const allowedKeys = ['Enter', 'Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        
        if (!allowedKeys.includes(e.key)) {
          e.stopImmediatePropagation();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    // Prepare pseudonymous monthly user id (respects DNT)
    const userId = getOrCreateMonthlyUserId();

    // Scoped fetch interceptor to add X-MS-USER-ID for Meilisearch search requests
    if (typeof window !== 'undefined' && window.fetch && !originalFetchRef.current) {
      originalFetchRef.current = window.fetch.bind(window);
      window.fetch = async (input, init) => {
        try {
          const url = typeof input === 'string' ? input : (input && input.url) ? input.url : '';
          if (!userId || !shouldAttachUserIdHeader(url)) {
            return originalFetchRef.current(input, init);
          }

          // Attach header depending on input type
          if (typeof input === 'string' || input instanceof URL) {
            const headers = new Headers(init && init.headers ? init.headers : undefined);
            if (!headers.has('X-MS-USER-ID')) headers.set('X-MS-USER-ID', userId);
            return originalFetchRef.current(input, { ...(init || {}), headers });
          }

          // input is Request
          const req = input;
          const headers = new Headers(req.headers);
          if (!headers.has('X-MS-USER-ID')) headers.set('X-MS-USER-ID', userId);
          const newReq = new Request(req, { headers });
          return originalFetchRef.current(newReq);
        } catch (_) {
          return originalFetchRef.current(input, init);
        }
      };
    }

    // Also patch XMLHttpRequest for libraries that use XHR under the hood
    const originalXHROpen = (typeof XMLHttpRequest !== 'undefined' && XMLHttpRequest.prototype.open) ? XMLHttpRequest.prototype.open : null;
    const originalXHRSend = (typeof XMLHttpRequest !== 'undefined' && XMLHttpRequest.prototype.send) ? XMLHttpRequest.prototype.send : null;
    let xhrPatched = false;
    if (originalXHROpen && originalXHRSend) {
      try {
        XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
          try { this.__ms_url = url; } catch {}
          return originalXHROpen.apply(this, arguments);
        };
        XMLHttpRequest.prototype.send = function(body) {
          try {
            if (userId && this && typeof this.setRequestHeader === 'function') {
              const url = this.__ms_url || '';
              if (shouldAttachUserIdHeader(url)) {
                // Only set if not already set
                try { this.setRequestHeader('X-MS-USER-ID', userId); } catch {}
              }
            }
          } catch {}
          return originalXHRSend.apply(this, arguments);
        };
        xhrPatched = true;
      } catch {}
    }

    if (searchInstanceRef.current) {
      searchInstanceRef.current.destroy?.();
      searchInstanceRef.current = null;
    }

    if (searchButtonRef.current) {
      searchButtonRef.current.innerHTML = '';
    }

    // Initialize docsearch only when container is ready
    if (searchButtonRef.current) {
      Promise.all([
        import('meilisearch-docsearch'),
        import('meilisearch-docsearch/css')
      ]).then(([{ docsearch }]) => {
        const meiliHost = siteConfig.customFields.meilisearch.host;
        // Always call Meili directly (no proxy) since env config isn’t accessible
        const useProxy = false;
        const baseOptions = {
          container: searchButtonRef.current,
          host: useProxy ? `${window.location.origin}/api` : meiliHost,
          apiKey: siteConfig.customFields.meilisearch.apiKey,
          indexUid: siteConfig.customFields.meilisearch.indexUid,
        
        transformItems: (items) => {
          return items.map((item) => {
            let section = item.hierarchy_lvl0 || 'Documentation';
            
            if (item.url && item.url.includes('/cms/')) {
              section = 'CMS';
            } else if (item.url && item.url.includes('/cloud/')) {
              section = 'Cloud';
            }
            
            return {
              ...item,
              url: item.url.replace('https://docs-next.strapi.io', ''),
              hierarchy: {
                lvl0: section,
                lvl1: item.hierarchy_lvl0,
                lvl2: item.hierarchy_lvl1,
                lvl3: item.hierarchy_lvl2
              }
            };
          });
        },

        searchParams: {
          attributesToHighlight: ['hierarchy', 'content'],
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
          matchingStrategy: 'all',
          attributesToSearchOn: ['hierarchy_lvl1', 'hierarchy_lvl2', 'content']
        },

        placeholder: 'Search documentation...',
        translations: {
          button: {
            buttonText: 'Search',
            buttonAriaLabel: 'Search',
          },
          modal: {
            searchBox: {
              resetButtonTitle: 'Clear the query',
              resetButtonAriaLabel: 'Clear the query',
              cancelButtonText: 'Cancel',
              cancelButtonAriaLabel: 'Cancel',
            },
            startScreen: {
              recentSearchesTitle: 'Recent',
              noRecentSearchesText: 'No recent searches',
              saveRecentSearchButtonTitle: 'Save this search',
              removeRecentSearchButtonTitle: 'Remove this search',
              favoriteSearchesTitle: 'Favorite',
              removeFavoriteSearchButtonTitle: 'Remove this search from favorites',
            },
            errorScreen: {
              titleText: 'Unable to fetch results',
              helpText: 'You might want to check your network connection.',
            },
            footer: {
              selectText: 'to select',
              selectKeyAriaLabel: 'Enter key',
              navigateText: 'to navigate',
              navigateUpKeyAriaLabel: 'Arrow up',
              navigateDownKeyAriaLabel: 'Arrow down',
              closeText: 'to close',
              closeKeyAriaLabel: 'Escape key',
              searchByText: 'Search by',
            },
            noResultsScreen: {
              noResultsText: 'No results for',
              suggestedQueryText: 'Try searching for',
              reportMissingResultsText: 'Believe this query should return results?',
              reportMissingResultsLinkText: 'Let us know.',
            },
          },
        },

        getMissingResultsUrl: ({ query }) => {
          return `https://github.com/strapi/documentation/issues/new?title=Missing+search+results+for+${query}`;
        },
        };

        // Prefer official header wiring if library supports it
        if (userId) {
          // Some versions accept requestConfig.headers, others accept headers; set both safely
          baseOptions.requestConfig = {
            ...(baseOptions.requestConfig || {}),
            headers: { 'X-MS-USER-ID': userId }
          };
          baseOptions.headers = { ...(baseOptions.headers || {}), 'X-MS-USER-ID': userId };
        }

        const search = docsearch(baseOptions);

        // If using proxy, docsearch will call `${origin}/api/indexes/<uid>/search`

        searchInstanceRef.current = search;
        setIsLoaded(true);

        if (colorMode === 'dark') {
          dropdownRef.current?.classList.add('dark');
        } else {
          dropdownRef.current?.classList.remove('dark');
        }
      }).catch((error) => {
        console.error('Failed to load MeiliSearch:', error);
      });
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      if (originalFetchRef.current) {
        try {
          window.fetch = originalFetchRef.current;
        } catch {}
        originalFetchRef.current = null;
      }
      if (xhrPatched && originalXHROpen && originalXHRSend) {
        try {
          XMLHttpRequest.prototype.open = originalXHROpen;
          XMLHttpRequest.prototype.send = originalXHRSend;
        } catch {}
      }
      if (searchInstanceRef.current) {
        searchInstanceRef.current.destroy?.();
        searchInstanceRef.current = null;
      }
    };
  }, [colorMode, siteConfig]);

  return (
    <div className="navbar__search" ref={dropdownRef}>
      <div ref={searchButtonRef}></div>
    </div>
  );
}

export default function SearchBar() {
  return (
    <BrowserOnly fallback={<div className="navbar__search"><div></div></div>}>
      {() => <SearchBarContent />}
    </BrowserOnly>
  );
}
