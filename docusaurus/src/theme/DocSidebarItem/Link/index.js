import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {isActiveSidebarItem} from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';
import isInternalUrl from '@docusaurus/isInternalUrl';
import IconExternalLink from '@theme/Icon/ExternalLink';
import { NewBadge, UpdatedBadge } from '../../../components/Badge';
import InfoIcon from '../../../components/InfoIcon';
import styles from './styles.module.css';

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
          {customProps?.infoTooltip && (
            <InfoIcon tooltip={customProps.infoTooltip} className="sidebar-info-icon" />
          )}
        </span>
        {!isInternalLink && <IconExternalLink />}
        {customProps?.new && <NewBadge />}
        {customProps?.updated && <UpdatedBadge />}
      </Link>
      
      {/* Notice sobre sous le lien si définie */}
      {customProps?.noticeText && (
        <div className="sidebar-notice">
          <i className="ph-fill ph-info sidebar-notice__icon"></i>
          <div 
            className="sidebar-notice__content"
            dangerouslySetInnerHTML={{ __html: customProps.noticeText }}
          />
        </div>
      )}
    </li>
  );
}