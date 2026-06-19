import React, { useState, useEffect, useCallback } from 'react';
import { findClosestHeading, findClosestAnchor, isInsideExcludedElement } from './selectionHelpers';

/**
 * Floating bubble that appears when the user selects text inside <article>.
 * Clicking it opens a feedback form pre-filled with the selected text.
 */
export default function SelectionFeedback({ onFeedback }) {
  const [bubble, setBubble] = useState(null);

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setBubble(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const text = selection.toString().trim();
    if (!text || text.length < 3) {
      setBubble(null);
      return;
    }

    // Only trigger inside the article content area
    const article = document.querySelector('article');
    if (!article || !article.contains(range.commonAncestorContainer)) {
      setBubble(null);
      return;
    }

    // Skip code blocks, inputs, search, Kapa modal, and our own widget
    if (isInsideExcludedElement(range.commonAncestorContainer)) {
      setBubble(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    setBubble({
      text: text.slice(0, 500),
      sectionHeading: findClosestHeading(range.commonAncestorContainer),
      anchor: findClosestAnchor(range.commonAncestorContainer),
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY - 44,
    });
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);
    return () => {
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('keyup', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Dismiss on click outside
  useEffect(() => {
    if (!bubble) return;
    function handleClick(e) {
      if (!e.target.closest('.selectionFeedback__bubble')) {
        setBubble(null);
      }
    }
    // Delay to avoid catching the mouseup that created the bubble
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [bubble]);

  if (!bubble) return null;

  return (
    <button
      className="selectionFeedback__bubble"
      style={{
        position: 'absolute',
        left: `${bubble.x}px`,
        top: `${bubble.y}px`,
        transform: 'translateX(-50%)',
        zIndex: 100,
      }}
      onClick={() => {
        onFeedback({
          kind: 'selection',
          selection: {
            text: bubble.text,
            sectionHeading: bubble.sectionHeading,
            anchor: bubble.anchor,
          },
        });
        setBubble(null);
        window.getSelection()?.removeAllRanges();
      }}
      aria-label="Leave feedback on selected text"
    >
      <i className="ph ph-chat-text" aria-hidden="true" />
      <span>Leave feedback</span>
    </button>
  );
}
