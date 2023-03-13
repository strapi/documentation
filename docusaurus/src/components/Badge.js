import React from 'react';
import clsx from 'clsx';

export default function Badge({
  children,
  className,
  link = '',
  noLink = false,
  variant = '',
  ...rest
}) {
  return (
    <span
      className={clsx(
        'badge',
        'badge--feature',
        (variant && `badge--${variant.toLowerCase()}`),
      )}
      {...rest}
    >
      {(noLink || !link) ? (
        <>
          {variant}
        </>
      ) : (
        <a className="badge__link" href={link}>
          {variant}
        </a>
      )}
      {children}
    </span>
  );
}

export function AlphaBadge(props) {
  return (
    <Badge
      variant="Alpha"
      {...props}
    />
  );
}

export function BetaBadge(props) {
  return (
    <Badge
      variant="Beta"
      {...props}
    />
  );
}

export function EnterpriseBadge(props) {
  return (
    <Badge
      variant="Enterprise"
      link="https://strapi.io/pricing-self-hosted"
      {...props}
    />
  );
}
