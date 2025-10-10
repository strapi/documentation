import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import Icon from '../Icon';
import styles from './news-ticker.module.scss';

export function NewsTicker({ 
  announcements = [], 
  isDarkTheme = false,
  rotationInterval = 8000 // milliseconds
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (announcements.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
        setTimeout(() => {
          setIsAnimating(false);
        }, 50);
      }, 300);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [announcements.length, isPaused, rotationInterval]);

  if (!announcements || announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  const handleClick = () => {
    if (currentAnnouncement.link) {
      window.open(currentAnnouncement.link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDotClick = (index) => {
    if (index !== currentIndex) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setTimeout(() => {
          setIsAnimating(false);
        }, 50);
      }, 300);
    }
  };

  const renderText = (text) => {
    return text.split('<br>').map((line, index, array) => (
      <React.Fragment key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </React.Fragment>
    ));
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
          <div 
            className={clsx(
              styles.newsTickerIcon,
              isAnimating && styles.newsTickerIconSlide
            )}
          >
            <Icon name={currentAnnouncement.icon} />
          </div>
        )}
        <span 
          className={clsx(
            styles.newsTickerText,
            isAnimating && styles.newsTickerTextSlide
          )}
        >
          {renderText(currentAnnouncement.text)}
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
                handleDotClick(index);
              }}
              aria-label={`Go to announcement ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}