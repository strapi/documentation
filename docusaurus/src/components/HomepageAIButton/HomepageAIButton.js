import React, { useState } from 'react';
import styles from './homepageaibutton.module.scss';
import clsx from 'clsx';
import Icon from '../Icon'

const HomepageAIButton = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={styles.container}>
      <button
        className={clsx(
          styles.button,
          isHovered && styles.buttonHovered,
          'kapa-widget-button'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Icon name="sparkle" />&nbsp;<span className={styles.text}>Ask anything to AI</span>
      </button>
    </div>
  );
};

export default HomepageAIButton;