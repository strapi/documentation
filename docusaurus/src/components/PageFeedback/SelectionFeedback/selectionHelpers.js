/**
 * DOM helpers for selection-based feedback.
 */

/**
 * Walk up the DOM from a node and return the text content of the closest
 * H2 or H3 heading, or null if none found within the article.
 */
export function findClosestHeading(node) {
  let current = node;
  while (current && current.tagName !== 'ARTICLE') {
    if (current.previousElementSibling) {
      let sibling = current.previousElementSibling;
      while (sibling) {
        if (/^H[23]$/.test(sibling.tagName)) {
          return sibling.textContent.trim();
        }
        sibling = sibling.previousElementSibling;
      }
    }
    current = current.parentElement;
  }
  return null;
}

/**
 * Find the closest heading's anchor ID for deep-linking.
 */
export function findClosestAnchor(node) {
  let current = node;
  while (current && current.tagName !== 'ARTICLE') {
    if (current.previousElementSibling) {
      let sibling = current.previousElementSibling;
      while (sibling) {
        if (/^H[23]$/.test(sibling.tagName) && sibling.id) {
          return sibling.id;
        }
        sibling = sibling.previousElementSibling;
      }
    }
    current = current.parentElement;
  }
  return null;
}

/**
 * Check if a node is inside an element that should not trigger selection feedback:
 * code blocks (<pre>), inputs, textareas, the search overlay, or the Kapa modal.
 */
export function isInsideExcludedElement(node) {
  let current = node;
  while (current) {
    if (current.nodeType === 1) {
      const tag = current.tagName;
      if (tag === 'PRE' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'CODE') {
        return true;
      }
      // Kapa modal or search overlay
      if (
        current.classList &&
        (current.classList.contains('kapa-modal') ||
          current.classList.contains('DocSearch-Modal') ||
          current.id === 'feedback-comment')
      ) {
        return true;
      }
      // Our own feedback widget
      if (current.getAttribute('aria-label') === 'Page feedback') {
        return true;
      }
    }
    current = current.parentElement;
  }
  return false;
}
