import { useLayoutEffect, useRef } from 'react';

/**
 * Adapted from https://usehooks.com/useclickaway
 *
 * Helper function to control component state, like
 * "when clicking outside this modal, it should close it"
 **/

export function useClickAway(cb) {
  const ref = useRef(null);
  const refCb = useRef(cb);

  useLayoutEffect(() => {
    const handler = (e) => {
      const element = ref.current;
      if (element && !element.contains(e.target)) {
        refCb.current(e);
      }
    };

    window.addEventListener('mousedown', handler);
    window.addEventListener('touchstart', handler);

    return () => {
      window.removeEventListener('mousedown', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, []);

  return ref;
}
