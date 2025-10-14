import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import Icon from '@site/src/components/Icon';

const NewsTicker = ({ newsItems, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const intervalRef = useRef(null);

  const startRotation = useCallback(() => {
    if (newsItems.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
        setIsFading(false);
      }, 500); // Corresponds to the fade animation duration
    }, interval);
  }, [newsItems, interval]);

  const resetRotation = useCallback(() => {
    clearInterval(intervalRef.current);
    startRotation();
  }, [startRotation]);

  useEffect(() => {
    startRotation();
    return () => clearInterval(intervalRef.current);
  }, [startRotation]);

  if (!newsItems || newsItems.length === 0) {
    return null;
  }

  const handleDotClick = (index) => {
    if (index === currentIndex) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsFading(false);
      resetRotation();
    }, 500);
  };

  const currentItem = newsItems[currentIndex];

  return (
    <div className={styles.newsTicker}>
      <div className={clsx(styles.newsItem, isFading && styles.fading)}>
        {currentItem.icon && <Icon name={currentItem.icon} classes="ph-fill" />}
        <a href={currentItem.link} target="_blank" rel="noopener noreferrer">
          {currentItem.text}
        </a>
      </div>
      {newsItems.length > 1 && (
        <div className={styles.dotsContainer}>
          {newsItems.map((_, index) => (
            <button
              key={index}
              className={clsx(styles.dot, { [styles.active]: currentIndex === index })}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to news item ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsTicker;
