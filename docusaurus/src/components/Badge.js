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
  const variantNormalized = variant.toLowerCase().replace(/\W/g, '');

  return (
    <span
      className={clsx(
        'badge',
        'badge--feature',
        (variantNormalized && `badge--${variantNormalized.toLowerCase()}`),
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

export function FutureBadge(props) {
  return (
    <Badge
      variant="Future"
      link="/dev-docs/configurations/features"
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

export function CloudProBadge(props) {
  return (
    <Badge
      variant="Strapi Cloud Pro"
      link="https://strapi.io/pricing-cloud"
      {...props}
    />
  );
}

export function CloudTeamBadge(props) {
  return (
    <Badge
      variant="Strapi Cloud Team"
      link="https://strapi.io/pricing-cloud"
      {...props}
    />
  );
}
export function CloudDevBadge(props) {
  return (
    <Badge
      variant="Strapi Cloud Dev"
      link="https://strapi.io/pricing-cloud"
      {...props}
    />
  );
}

export function NewBadge(props) {
  return (
    <Badge
      variant="New ✨"
      {...props}
    />
  );
}


export function UpdatedBadge(props) {
  return (
    <Badge
      variant="Updated ️🖌"
      {...props}
    />
  );
}
