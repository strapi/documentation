import clsx from 'clsx';
import React from 'react';
import Link from '@docusaurus/Link';
import IconArrow from '@site/static/img/assets/icons/arrow-right.svg';
import styles from './link-with-arrow.module.scss';

export function LinkWithArrow({
  apart = false,
  children,
  className,
  href,
  to,
  ...rest
}) {
  const LinkElement = (to ? Link : 'a');

  return (
    <LinkElement
      className={clsx(
        styles.lwa,
        (apart && styles['lwa--apart']),
        className,
      )}
      {...(href && { href, target: '_blank' })}
      {...(to && { to })}
      {...rest}
    >
      <span className={styles.lwa__content}>
        {children}
      </span>
      <IconArrow
        className={styles.lwa__icon}
      />
    </LinkElement>
  )
}
