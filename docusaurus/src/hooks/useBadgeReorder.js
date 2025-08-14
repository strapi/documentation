/**
 * Hook to reorder badges that appear after h1 elements with AiToolbar.
 * 
 * Problem: In Docusaurus MDX rendering, badges (GrowthBadge, EnterpriseBadge, etc.) 
 * are positioned absolutely in the gutter and appear after the AiToolbar in the DOM,
 * creating a visual hierarchy issue where badges come after the toolbar instead of
 * between the h1 title and the toolbar.
 * 
 * Solution: This hook detects badges that follow a header containing an h1 + AiToolbar,
 * hides the original badges to prevent visual flash, clones them with proper relative
 * positioning, and inserts them between the h1 and AiToolbar for correct visual order.
 * 
 * The reordered badges maintain their original styling and functionality while being
 * positioned in the expected location in the visual hierarchy.
 */

import { useEffect } from 'react';

export function useBadgeReorder() {
  useEffect(() => {
    // Hide badges immediately to prevent flash
    const hideBadgesImmediately = () => {
      const header = document.querySelector('header');
      if (header) {
        let current = header.nextElementSibling;
        while (current && current.classList?.contains('badge')) {
          current.style.visibility = 'hidden';
          current = current.nextElementSibling;
        }
      }
    };
    
    hideBadgesImmediately();
    
    const reorderBadges = () => {
      const h1Elements = document.querySelectorAll('h1');
      
      h1Elements.forEach(h1 => {
        const toolbar = h1.nextElementSibling?.classList?.contains('ai-toolbar') 
          ? h1.nextElementSibling 
          : null;
        
        if (!toolbar) return;
        
        if (document.querySelector('.h1-badges-container')) {
          return;
        }
        
        const header = h1.closest('header');
        if (!header) return;
        
        const badgesAfterHeader = [];
        let current = header.nextElementSibling;
        
        while (current && current.classList?.contains('badge')) {
          badgesAfterHeader.push(current);
          current = current.nextElementSibling;
        }
        
        if (badgesAfterHeader.length > 0) {
          const badgeContainer = document.createElement('div');
          badgeContainer.className = 'h1-badges-container';
          badgeContainer.style.margin = '-1rem 0 2rem 0';
          badgeContainer.style.display = 'flex';
          badgeContainer.style.gap = '0.5rem';
          badgeContainer.style.flexWrap = 'wrap';
          badgeContainer.style.opacity = '0';
          badgeContainer.style.transition = 'opacity 0.2s ease';
          
          badgesAfterHeader.forEach(badge => {
            const clone = badge.cloneNode(true);
            
            clone.style.position = 'relative';
            clone.style.left = 'auto';
            clone.style.top = 'auto';
            clone.style.right = 'auto';
            clone.style.display = 'inline-flex';
            clone.style.alignItems = 'center';
            clone.style.minWidth = 'auto';
            clone.style.maxWidth = 'none';
            clone.style.visibility = 'visible';
            
            const badgeText = clone.querySelector('.badge__text');
            if (badgeText) {
              badgeText.style.display = 'inline';
            }
            
            const icon = clone.querySelector('.strapi-icons');
            if (icon) {
              icon.style.left = 'auto';
              icon.style.top = 'auto';
              icon.style.position = 'relative';
              icon.style.marginRight = '0.25rem';
            }
            
            badgeContainer.appendChild(clone);
            badge.style.display = 'none';
          });
          
          h1.parentNode.insertBefore(badgeContainer, toolbar);
          
          requestAnimationFrame(() => {
            badgeContainer.style.opacity = '1';
          });
        }
      });
    };
    
    const timer = setTimeout(reorderBadges, 50);
    
    return () => clearTimeout(timer);
  }, []);
}