import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import styles from './ProductSwitcher.module.scss';

const products = [
  {
    id: 'cms',
    label: 'CMS Docs',
    href: '/cms/intro',
    icon: 'ph-fill ph-feather',
    color: 'var(--strapi-primary-600)',
  },
  {
    id: 'cloud',
    label: 'Cloud Docs',
    href: '/cloud/intro',
    icon: 'ph-fill ph-cloud',
    color: 'var(--strapi-secondary-500)',
  },
];

export default function ProductSwitcher() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = pathname.startsWith('/cloud/') ? products[1] : products[0];
  const other = current === products[0] ? products[1] : products[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className={styles.productSwitcher} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={styles.dot} style={{ background: current.color }} />
        <span className={styles.label}>{current.label}</span>
        <i className={`ph ph-caret-up-down ${styles.caret}`} />
      </button>
      {open && (
        <div className={styles.dropdown}>
          <a
            href={other.href}
            className={styles.option}
            onClick={() => setOpen(false)}
          >
            <span className={styles.dot} style={{ background: other.color }} />
            <span>{other.label}</span>
          </a>
        </div>
      )}
    </div>
  );
}
