import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {isActiveSidebarItem} from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';
import isInternalUrl from '@docusaurus/isInternalUrl';
import IconExternalLink from '@theme/Icon/ExternalLink';
import { NewBadge, UpdatedBadge } from '../../../components/Badge';
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
  
  // Si l'élément contient noticeType mais n'est pas destiné à être cliquable
  if (customProps?.noticeType && customProps?.noticeNoLink) {
    return (
      <li
        className={clsx(
          ThemeClassNames.docs.docSidebarItemLink,
          ThemeClassNames.docs.docSidebarItemLinkLevel(level),
          'menu__list-item',
          'sidebar-notice-item',
          className,
        )}
        key={label}>
        <div className={clsx(
          "sidebar-notice",
          customProps.noticeType && `sidebar-notice--${customProps.noticeType}`
        )}>
          <i className={clsx(
            "ph-fill",
            customProps.noticeIcon ? `ph-${customProps.noticeIcon}` : "ph-info", 
            "sidebar-notice-icon"
          )}></i>
          <div className="sidebar-notice-content">
            {customProps.noticeText || label} {customProps.noticeLink && (
              <a href={customProps.noticeLink} className="sidebar-notice-link">
                {customProps.noticeLinkText || 'Voir ici'}
              </a>
            )}
          </div>
        </div>
        {customProps?.new && <NewBadge />}
        {customProps?.updated && <UpdatedBadge />}
      </li>
    );
  }
  
  // Si l'élément est une notice mais aussi un lien
  if (customProps?.noticeType) {
    return (
      <li
        className={clsx(
          ThemeClassNames.docs.docSidebarItemLink,
          ThemeClassNames.docs.docSidebarItemLinkLevel(level),
          'menu__list-item',
          'sidebar-notice-item',
          className,
        )}
        key={label}>
        <Link
          className={clsx(
            'menu__link',
            'sidebar-notice',
            customProps.noticeType && `sidebar-notice--${customProps.noticeType}`,
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
          <i className={clsx(
            "ph-fill",
            customProps.noticeIcon ? `ph-${customProps.noticeIcon}` : "ph-info", 
            "sidebar-notice-icon"
          )}></i>
          <div className="sidebar-notice-content">
            {customProps.noticeText || label}
          </div>
          {!isInternalLink && <IconExternalLink />}
        </Link>
        {customProps?.new && <NewBadge />}
        {customProps?.updated && <UpdatedBadge />}
      </li>
    );
  }
  
  // Comportement normal pour les éléments 'doc' standards
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
        {label}
        {!isInternalLink && <IconExternalLink />}
        {customProps?.new && <NewBadge />}
        {customProps?.updated && <UpdatedBadge />}
      </Link>
    </li>
  );
}