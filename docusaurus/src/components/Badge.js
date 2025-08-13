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
  iconClasses,
  feature,
  version,
  tooltip,
  inline = false,
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
        ((variant === "Updated" || variant === "New") && `badge--content`),
        (inline && 'badge--inline'), 
        className
      )}
      {...rest}
    >
      {(noLink || !link) ? (
        <>
          {(variant === "Updated" || variant === "New") ? (
            <>
              <span>
                <Icon
                  name={icon}
                  {...(iconClasses ? { classes: iconClasses } : {})}
                />
                <span className="badge__text">{variant}</span>
              </span>
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
          {icon && (
            <Icon 
              name={icon} 
              {...(iconClasses ? { classes: iconClasses } : {})}
            />
          )}
          {variant}
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
      link="/cms/configurations/features"
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
      tooltip="This feature is available with an Enterprise plan."
      {...props}
    />
  );
}

export function GrowthBadge(props) {
  return (
    <Badge
      variant="Growth"
      link="https://strapi.io/pricing-self-hosted"
      icon="feather"
      tooltip="This feature is available with a Growth plan."
      {...props}
    />
  );
}

export function SsoBadge(props) {
  return (
    <Badge
      variant="SSO"
      link="https://strapi.io/pricing-self-hosted"
      icon="plus"
      iconClasses="ph ph-plus ph-bold"
      tooltip="This feature is available with the SSO add-on."
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

export function CloudScaleBadge(props) {
  return (
    <Badge
      variant="Scale"
      link="https://strapi.io/pricing-cloud"
      icon="cloud"
      tooltip="This feature is available with a Strapi Cloud Scale plan."
      {...props}
    />
  );
}

export function CloudEssentialBadge(props) {
  return (
    <Badge
      variant="Essential"
      link="https://strapi.io/pricing-cloud"
      icon="cloud"
      tooltip="This feature is available with a Strapi Cloud Essential plan."
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