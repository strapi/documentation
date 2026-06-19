import React from 'react';
import styles from './homepageaibutton.module.scss'

export default function HomepageAIButton() {
  return (
    <div className={styles['homepage-ai-button-container']}>
      <button className={`${styles['homepage-ai-button']} kapa-widget-button`}>
        <span className={styles['sparkle']}>✦</span>
        <span className={styles['placeholder']}>Ask AI anything about Strapi...</span>
      </button>
    </div>
  );
}
