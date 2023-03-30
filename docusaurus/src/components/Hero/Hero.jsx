import clsx from 'clsx';
import React from 'react';
import styles from './hero.module.scss';

export function HeroTitle({
  className,
  ...rest
}) {
  return (
    <h1
      className={clsx(
        styles.hero__title,
        className,
      )}
      {...rest}
    />
  );
}

export function HeroDescription({
  className,
  ...rest
}) {
  return (
    <div
      className={clsx(
        styles.hero__description,
        className,
      )}
      {...rest}
    />
  );
}

export function Hero({
  className,
  ...rest
}) {
  return (
    <header
      className={clsx(
        styles.hero,
        className,
      )}
      {...rest}
    />
  );
}
