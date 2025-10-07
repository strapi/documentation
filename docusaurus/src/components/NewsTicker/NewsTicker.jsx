import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import Icon from '../Icon';
import styles from './news-ticker.module.scss';

export function NewsTicker({ announcements = [], isDarkTheme = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (announcements.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements.length, isPaused]);

  if (!announcements || announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  const handleClick = () => {
    if (currentAnnouncement.link) {
      window.open(currentAnnouncement.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className={clsx(
        styles.newsTicker,
        isDarkTheme && styles.newsTickerDark,
        currentAnnouncement.link && styles.newsTickerClickable
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={handleClick}
    >
      <div className={styles.newsTickerLabel}>
        <Icon name="information" />
        Latest news:
      </div>
      <div className={styles.newsTickerContent}>
        {currentAnnouncement.icon && (
          <div className={styles.newsTickerIcon}>
            <Icon name={currentAnnouncement.icon} />
          </div>
        )}
        <span className={styles.newsTickerText}>
          {currentAnnouncement.text}
        </span>
      </div>
      {announcements.length > 1 && (
        <div className={styles.newsTickerDots}>
          {announcements.map((_, index) => (
            <button
              key={index}
              className={clsx(
                styles.newsTickerDot,
                index === currentIndex && styles.newsTickerDotActive
              )}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              aria-label={`Go to announcement ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}