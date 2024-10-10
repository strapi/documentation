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
  tooltip,
  ...rest
}) {
  const variantNormalized = variant.toLowerCase().replace(/\W/g, '');

  return (
    <span
      className={clsx(
        'badge',
        'badge--feature',
        ((!feature && !version) && variantNormalized && `badge--${variantNormalized.toLowerCase()}`),
        (version && `badge--version`),
        (feature && `badge--featureflag`),
        ((variant === "Updated" || variant === "New") && `badge--content`)
      )}
      {...rest}
    >
      {(noLink || !link) ? (
        <>
          {(variant === "Updated" || variant === "New") ? (
            <>
              <span><Icon name={icon}/><span className="badge__text">{variant}</span></span>
              <span className="badge__tooltip">{tooltip}</span>
            </>
          ) : (
            <>
            {variant}
            <span className="badge__tooltip">{tooltip}</span>
            </>
          )
        }
        </>
      ) : (
        <a className="badge__link" href={link}>
          {icon && <Icon name={icon} />}{variant}
          <span className="badge__tooltip">{tooltip}</span>
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

export function FeatureFlagBadge(props) {
  return (
    <Badge
      variant={props.feature ?? "Feature Flag"}
      link="/dev-docs/configurations/features"
      icon="toggle-right"
      tooltip={`This feature requires ${props.feature ? 'the ' + props.feature + ' feature flag' : 'a feature flag'} to be enabled.`}
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
      tooltip="This feature is available with an Enterprise licence."
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
      tooltip="This feature is available with a Strapi Cloud Pro plan."
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
      tooltip="This feature is available with a Strapi Cloud Team plan."
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
      tooltip="This feature is available with a Strapi Cloud Dev plan."
      {...props}
    />
  );
}

export function NewBadge(props) {
  return (
    <Badge
      variant="New"
      icon="confetti"
      tooltip="This content is new."
      {...props}
    />
  );
}


export function UpdatedBadge(props) {
  return (
    <Badge
      variant="Updated"
      icon="pencil-simple"
      tooltip="This content was recently updated."
      {...props}
    />
  );
}

export function VersionBadge(props) {
  return (
    <Badge
      variant={props.version}
      tooltip={`This feature requires Strapi version ${props.version} or later.`}
      {...props}
    />
  )
}
