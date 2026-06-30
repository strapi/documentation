import React, { useState, useEffect, useCallback } from 'react';
import { findClosestHeading, findClosestAnchor, isInsideExcludedElement, isInsideCodeBlock } from './selectionHelpers';

/**
 * Floating bubble that appears when the user selects text inside <article>.
 * Clicking it opens a feedback form pre-filled with the selected text.
 */
export default function SelectionFeedback({ onFeedback }) {
  const [bubble, setBubble] = useState(null);
  const [copied, setCopied] = useState(false);

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

    // Skip inputs, search, Kapa modal, and our own widget
    if (isInsideExcludedElement(range.commonAncestorContainer)) {
      setBubble(null);
      return;
    }

    // Code blocks get a dedicated bar with an extra "Copy code" action.
    const insideCode = isInsideCodeBlock(range.commonAncestorContainer);

    const rect = range.getBoundingClientRect();
    setBubble({
      text: text.slice(0, 500),
      // Keep the full selected code for the clipboard (no 500-char trim)
      rawText: text,
      isCodeBlock: insideCode,
      sectionHeading: insideCode ? null : findClosestHeading(range.commonAncestorContainer),
      anchor: insideCode ? null : findClosestAnchor(range.commonAncestorContainer),
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

  // Reset the copied state whenever the bubble changes (new selection)
  useEffect(() => {
    setCopied(false);
  }, [bubble]);

  // Dismiss on click outside
  useEffect(() => {
    if (!bubble) return;
    function handleClick(e) {
      if (!e.target.closest('.selectionFeedback__bar')) {
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

  const handleLeaveFeedback = useCallback(() => {
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
  }, [bubble, onFeedback]);

  const handleCopyCode = useCallback(() => {
    const code = bubble?.rawText ?? '';
    const done = () => {
      setCopied(true);
      // Briefly show the confirmation, then dismiss the bar
      setTimeout(() => {
        setBubble(null);
        window.getSelection()?.removeAllRanges();
      }, 1200);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).then(done).catch(done);
    } else {
      done();
    }
  }, [bubble]);

  if (!bubble) return null;

  const barStyle = {
    position: 'absolute',
    left: `${bubble.x}px`,
    top: `${bubble.y}px`,
    transform: 'translateX(-50%)',
    zIndex: 100,
  };

  return (
    <div className="selectionFeedback__bar" style={barStyle}>
      <button
        className="selectionFeedback__bubble"
        onClick={handleLeaveFeedback}
        aria-label="Leave feedback on selected text"
      >
        <i className="ph ph-chat-text" aria-hidden="true" />
        <span>Leave feedback</span>
      </button>
      {bubble.isCodeBlock && (
        <button
          className="selectionFeedback__bubble"
          onClick={handleCopyCode}
          aria-label="Copy the selected code"
        >
          <i className={`ph ${copied ? 'ph-check' : 'ph-copy'}`} aria-hidden="true" />
          <span>{copied ? 'Copied!' : 'Copy code'}</span>
        </button>
      )}
    </div>
  );
}
