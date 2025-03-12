import React, { useState } from 'react';
import styles from './homepageaibutton.module.scss'
import Icon from '../Icon'

export default function HomepageAIButton() {
  return (
    <div className={styles['homepage-ai-button-container']}>
      <button className={styles['homepage-ai-button']}>
        <Icon name="sparkle" />
        <p>Ask anything to AI</p>
      </button>
    </div>
  );
}
