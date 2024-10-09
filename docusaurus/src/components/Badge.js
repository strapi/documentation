import React from 'react';
import clsx from 'clsx';
import Icon from '../components/Icon'

export default function Badge({
  children,
  className,
  link = '',
  noLink = false,
  variant = '',
  icon,
  feature,
  version,
  ...rest
}) {
  const variantNormalized = variant.toLowerCase().replace(/\W/g, '');

  return (
    <div
      className={clsx(
        'badge',
        'badge--feature',
        (variantNormalized && `badge--${variantNormalized.toLowerCase()}`),
        (version && `badge--version`),
        (feature && `badge--featureflag`),
      )}
      {...rest}
    >
      {(noLink || !link) ? (
        <>
          {variant}
        </>
      ) : (
        <a className="badge__link" href={link}>
          {icon && <Icon name={icon} />}{variant}
        </a>
      )}
      {children}
    </div>
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

export function FeatureFlagBadge(props) {
  return (
    <Badge
      variant={props.feature && "Feature Flag"}
      link="/dev-docs/configurations/features"
      icon="toggle-right"
      {...props}
    />
  );
}

export function EnterpriseBadge(props) {
  return (
    <Badge
      variant="Enterprise"
      link="https://strapi.io/pricing-self-hosted"
      icon="feather"
      {...props}
    />
  );
}

export function CloudProBadge(props) {
  return (
    <Badge
      variant="Pro"
      link="https://strapi.io/pricing-cloud"
      icon="cloud"
      {...props}
    />
  );
}

export function CloudTeamBadge(props) {
  return (
    <Badge
      variant="Team"
      link="https://strapi.io/pricing-cloud"
      icon="cloud"
      {...props}
    />
  );
}

export function CloudDevBadge(props) {
  return (
    <Badge
      variant="Developer"
      link="https://strapi.io/pricing-cloud"
      icon="cloud"
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

export function VersionBadge(props) {
  return (
    <Badge
      variant={props.version}
      {...props}
    />
  )
}
