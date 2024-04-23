import clsx from 'clsx';
import React from 'react';
import styles from './features-list.module.scss';
import { LinkWithArrow } from '../LinkWithArrow/LinkWithArrow';

export function FeatureListItem({
  children,
  className,
  href,
  icon: Icon,
  iconColor,
  label,
  to,
  ...rest
}) {
  const ContentElement = ((href || to) ? LinkWithArrow : 'span');
  const IconElement = ((href || to) ? 'a' : 'span');

  return (
    <li
      className={clsx(
        styles['features-list__item'],
        className,
      )}
    >
      {Icon && (
        <IconElement
          className={clsx(
            styles['features-list__item__icon'],
            (iconColor && styles[`features-list__item__icon--${iconColor}`]),
          )}
          href={href}
          to={to}
          {...(IconElement === 'a' ? { href: to || href } : {})}
        >
          <Icon />
        </IconElement>
      )}
      <ContentElement
        className={styles['features-list__item__content']}
        href={href}
        to={to}
        {...rest}
      >
        {children || label}
      </ContentElement>
    </li>
  );
}

export function FeaturesList({
  className,
  id,
  icon,
  iconColor,
  items,
  ...rest
}) {
  const defaultId = `featureListItem${Math.random()}`;

  return (
    <ul
      className={clsx(
        styles['features-list'],
        className,
      )}
      {...rest}
    >
      {items?.map((featureListItem, featureListItemIndex) => {
        return (
          <FeatureListItem
            key={`${id || defaultId}${featureListItemIndex}`}
            icon={icon}
            iconColor={iconColor}
            {...featureListItem}
          />
        );
      })}
    </ul>
  );
}
