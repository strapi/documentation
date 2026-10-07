// DocSidebarItemLink.js
import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {isActiveSidebarItem} from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';
import isInternalUrl from '@docusaurus/isInternalUrl';
import IconExternalLink from '@theme/Icon/ExternalLink';
import { NewBadge, UpdatedBadge, EnterpriseBadge, GrowthBadge, AiBadge, SIDEBAR_PLAN_TOOLTIPS } from '../../../components/Badge';
import styles from './styles.module.css';
import Icon from '@site/src/components/Icon'

export default function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  level,
  index,
  ...props
}) {
  const {href, label, className, autoAddBaseUrl, customProps} = item;
  const isActive = isActiveSidebarItem(item, activePath);
  const isInternalLink = isInternalUrl(href);
  
  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        'menu__list-item',
        className,
      )}
      key={label}>
      <Link
        className={clsx(
          'menu__link',
          !isInternalLink && styles.menuExternalLink,
          {
            'menu__link--active': isActive,
          },
        )}
        autoAddBaseUrl={autoAddBaseUrl}
        aria-current={isActive ? 'page' : undefined}
        to={href}
        {...(isInternalLink && {
          onClick: onItemClick ? () => onItemClick(item) : undefined,
        })}
        {...props}>
        <span className="menu__link__content">
          {label}
          {customProps?.growth ? (
            <GrowthBadge iconOnly tooltip={SIDEBAR_PLAN_TOOLTIPS.growth} />
          ) : customProps?.enterprise ? (
            <EnterpriseBadge iconOnly tooltip={SIDEBAR_PLAN_TOOLTIPS.enterprise} />
          ) : null}
          {customProps?.ai && <AiBadge iconOnly />}
          {customProps?.new && <NewBadge iconOnly />}
          {customProps?.updated && <UpdatedBadge iconOnly />}
          {customProps?.tooltip && (
            <Icon name="info" />
          )}
          {customProps?.tooltip && (
            <div 
              className="info-icon__tooltip"
              dangerouslySetInnerHTML={{ __html: customProps.tooltip }}
            /> 
          )} 
        </span>
        {!isInternalLink && <IconExternalLink />}
      </Link>
    </li>
  );
}