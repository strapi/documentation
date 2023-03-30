import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './card.module.scss';
import IconArrow from '@site/static/img/assets/icons/arrow-right.svg';

export function CardTitle({
  as,
  children,
  className,
  withArrow,
  ...rest
}) {
  const TitleElement = (as || 'h3');

  return (
    <TitleElement
      className={clsx(
        styles.card__title,
        className,
      )}
      {...rest}
    >
      {children}
      {withArrow && (
        <span className={styles.card__title__arrow}>
          <IconArrow />
        </span>
      )}
    </TitleElement>
  );
}

export function CardDescription({
  as,
  className,
  ...rest
}) {
  const DescriptionElement = (as || 'div');

  return (
    <DescriptionElement
      className={clsx(
        styles.card__description,
        className,
      )}
      {...rest}
    />
  );
}

export function CardImgBg({
  className,
  ...rest
}) {
  return (
    <img
      className={clsx(
        styles['card__img-bg'],
        className,
      )}
      {...rest}
    />
  );
}

export function CardImg({
  className,
  ...rest
}) {
  return (
    <img
      className={clsx(
        styles['card__img'],
        className,
      )}
      {...rest}
    />
  );
}

export function Card({
  className,
  href,
  isContentDelimited,
  to,
  variant,
  ...rest
}) {
  const asCallToAction = !!(href || to);
  const CardElement = (to ? Link : (href ? 'a' : 'div'));

  return (
    <CardElement
      {...(!href ? {} : { href, target: '_blank' })}
      {...(!to ? {} : { to })}
      className={clsx(
        styles.card,
        (asCallToAction && styles['card--cta']),
        (isContentDelimited && styles['card--content-delimited']),
        (variant && styles[`card--${variant}`]),
        className,
      )}
      {...rest}
    />
  );
}
