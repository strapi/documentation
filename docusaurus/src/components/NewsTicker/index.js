import React, { useState, useEffect } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import Icon from '@site/src/components/Icon';

const NewsTicker = ({ newsItems, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const handleNavigation = (newIndex) => {
    const isWrapping = 
      (currentIndex === newsItems.length - 1 && newIndex === 0) ||
      (currentIndex === 0 && newIndex === newsItems.length - 1);

    if (isWrapping) {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex(newIndex);
        setIsFading(false);
      }, 250); // Half of the fade animation duration
    } else {
      setCurrentIndex(newIndex);
    }
  };

  // Auto-rotation effect
  useEffect(() => {
    if (newsItems.length <= 1) return;

    const timer = setInterval(() => {
      handleNavigation((currentIndex + 1) % newsItems.length);
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, newsItems, interval]);

  if (!newsItems || newsItems.length === 0) {
    return null;
  }

  return (
    <div className={clsx(styles.newsTicker, isFading && styles.isFading)}>
      <div className={styles.contentViewport}>
        <div className={styles.filmStrip} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {newsItems.map((item, index) => (
            <div key={index} className={styles.newsItem}>
              {item.icon && <Icon name={item.icon} classes="ph-fill" />}
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                {item.text}
              </a>
            </div>
          ))}
        </div>
      </div>

      {newsItems.length > 1 && (
        <div className={styles.dotsContainer}>
          {newsItems.map((_, index) => (
            <button
              key={index}
              className={clsx(styles.dot, { [styles.active]: currentIndex === index })}
              onClick={() => handleNavigation(index)}
              aria-label={`Go to news item ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsTicker;
