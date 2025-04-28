// HomepageAIButton.js
import React from 'react';
import styles from './homepageaibutton.module.scss';
import Icon from '../Icon';
import { useInkeepSimple } from '../Inkeep';

export default function HomepageAIButton({ className }) {
  const { openChat } = useInkeepSimple();
  
  return (
    <div className={styles['homepage-ai-button-container']}>
      <button 
        className={styles['homepage-ai-button']}
        onClick={openChat}
      >
        <Icon name="sparkle" />
        <p>Ask AI anything</p>
      </button>
    </div>
  );
}