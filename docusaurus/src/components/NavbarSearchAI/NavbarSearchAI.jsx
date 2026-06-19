import React from 'react';
import SearchBar from '@theme/SearchBar';
import Icon from '../Icon';
import styles from './NavbarSearchAI.module.scss';

export default function NavbarSearchAI() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.searchSlot}>
        <SearchBar />
      </div>
      <div className={styles.divider} />
      <button
        className={`${styles.askAI} kapa-widget-button`}
        aria-label="Ask AI"
        title="Ask AI"
      >
        <i className="ph ph-sparkle" />
        <span className={styles.askAILabel}>Ask AI</span>
      </button>
    </div>
  );
}
