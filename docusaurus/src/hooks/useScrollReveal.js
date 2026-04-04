import { useEffect, useRef } from 'react';

/**
 * IntersectionObserver-based scroll reveal hook.
 * Adds 'is-visible' class when element enters viewport.
 * Fire-once by default.
 */
export function useScrollReveal({ threshold = 0.1, rootMargin = '0px 0px -40px 0px', once = true } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (once) observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}

export default useScrollReveal;
