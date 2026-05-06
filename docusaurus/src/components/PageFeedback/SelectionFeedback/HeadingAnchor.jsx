import React, { useEffect, useState, useCallback } from 'react';

/**
 * Injects a small feedback button in the gutter next to each H2/H3 heading
 * inside <article>. Clicking opens the feedback form pre-filled with the
 * heading text and anchor.
 */
export default function HeadingAnchor({ onFeedback }) {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    const article = document.querySelector('article');
    if (!article) return;

    const found = Array.from(article.querySelectorAll('h2[id], h3[id]')).map((el) => ({
      id: el.id,
      text: el.textContent.trim(),
      el,
    }));
    setHeadings(found);
  }, []);

  const handleClick = useCallback(
    (heading) => {
      onFeedback({
        kind: 'element',
        selection: {
          text: heading.text,
          sectionHeading: heading.text,
          anchor: heading.id,
        },
      });
    },
    [onFeedback],
  );

  if (headings.length === 0) return null;

  return (
    <>
      {headings.map((heading) => (
        <HeadingButton key={heading.id} heading={heading} onClick={handleClick} />
      ))}
    </>
  );
}

function HeadingButton({ heading, onClick }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    function updatePosition() {
      const rect = heading.el.getBoundingClientRect();
      setPos({
        top: rect.top + window.scrollY + rect.height / 2 - 12,
      });
    }
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [heading.el]);

  if (!pos) return null;

  return (
    <button
      className="headingAnchor__button"
      style={{
        position: 'absolute',
        top: `${pos.top}px`,
        left: '-36px',
      }}
      onClick={() => onClick(heading)}
      aria-label={`Give feedback on section: ${heading.text}`}
      title="Give feedback on this section"
    >
      <i className="ph ph-chat-text" aria-hidden="true" />
    </button>
  );
}
