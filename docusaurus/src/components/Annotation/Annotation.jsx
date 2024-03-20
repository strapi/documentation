import clsx from 'clsx';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { useClickAway } from '../../hooks';
import styles from './annotation.module.scss';

export function Annotation({ children, id, width = 320 }) {
  const [isWindowXS, setIsWindowXS] = useState(true);
  const [open, setOpen] = useState(false);

  /**
   * Close the Annotation if it is open.
   */
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  /**
   * Toggle the Annotation visibility state, switching open/close.
   */
  const handleToggleClick = useCallback(() => {
    setOpen(!open);
  }, [open]);

  /**
   * Helper values definitions
   */
  const defineHelperValues = useCallback(() => {
    setIsWindowXS(window.innerWidth < 768);
  }, []);

  const annotationRef = useClickAway(handleClose);
  const annotationId = ('annotation' + (id ? `-${id}-` : '-') + (Math.random() * 10));

  /**
   * Close the Annotation content if it is open,
   * when the escape-key is pressed.
   */
  useLayoutEffect(() => {
    function _escapeListener(event) {
      if (open && (event.key.toLowerCase() === 'escape')) {
        handleClose();
      }
    }

    if (open) {
      defineHelperValues();
      window.addEventListener('keydown', _escapeListener);
    } else {
      window.removeEventListener('keydown', _escapeListener);
    }

    return () => {
      window.removeEventListener('keydown', _escapeListener);
    };
  }, [defineHelperValues, handleClose, open]);

  /**
   * Helper values definitions trigger
   */
  useLayoutEffect(() => {
    defineHelperValues();
    window.addEventListener('resize', defineHelperValues);

    return () => {
      window.removeEventListener('resize', defineHelperValues);
    };
  }, [defineHelperValues]);

  return (
    <span
      ref={annotationRef}
      id={annotationId}
      className={clsx(
        'annotation',
        styles['annotation'],
      )}
      style={{
        '--strapi-docs-annotation-tooltip-width': (isWindowXS ? undefined : `${(width / 16)}rem`),
      }}
    >
      <button
        id={`${annotationId}-toggle`}
        type="button"
        className={clsx(
          'annotation__toggle',
          styles['annotation__toggle'],
        )}
        onClick={() => handleToggleClick()}
        title={open ? undefined : 'Click for more info'}
        aria-expanded={open}
        aria-controls={open ? `${annotationId}-tooltip` : undefined}
        style={{
          '--strapi-docs-annotation-toggle-icon-rotation': open ? '0deg' : undefined,
          '--strapi-docs-annotation-toggle-background': open ? 'var(--strapi-docs-annotation-toggle-background-active)' : undefined,
          '--strapi-docs-annotation-toggle-z-index': open ? 'calc(var(--strapi-docs-annotation-z-index) + 2)' : undefined,
        }}
      >
        <svg
          id={`${annotationId}-icon`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden={true}
          className={clsx(
            'annotation__toggle__icon',
            styles['annotation__toggle__icon'],
          )}
        >
          <path
            fill="currentColor"
            d="M24 2.417 21.583 0 12 9.583 2.417 0 0 2.417 9.583 12 0 21.583 2.417 24 12 14.417 21.583 24 24 21.583 14.417 12 24 2.417Z"
          />
        </svg>
      </button>
      {open && (
        <span
          id={`${annotationId}-tooltip`}
          role="tooltip"
          tabIndex="-1"
          hidden={!open}
          aria-hidden={!open}
          aria-labelledby={`${annotationId}-toggle`}
          aria-relevant={open}
          className={clsx(
            'annotation__tooltip',
            styles['annotation__tooltip'],
          )}
        >
          {children}
        </span>
      )}
    </span>
  );
}
