import clsx from 'clsx';
import React from 'react';
import Link from '@docusaurus/Link';
import styles from './button.module.scss';

export function Button({
  href,
  to,
  children,
  className,
  decorative,
  size = '',
  variant = 'primary',
  ...rest
}) {
  const ButtonElement = (to ? Link : (href ? 'a' : 'button'));

  return (
    <ButtonElement
      {...rest}
      {...(!href ? {} : { href, target: '_blank' })}
      {...(!to ? {} : { to })}
      className={clsx(
        'button',
        (variant && styles[`button--${variant}`]),
        (size && styles[`button--${size}`]),
        styles.button,
        styles[variant],
        className,
      )}
    >
      {children}
      {decorative && (
        <span className={styles.button__decorative}>
          {decorative}
        </span>
      )}
    </ButtonElement>
  );
}
