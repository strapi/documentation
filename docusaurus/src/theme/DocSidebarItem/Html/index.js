import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import styles from './styles.module.css';
import { NewBadge, UpdatedBadge } from '../../../components/Badge';

export default function DocSidebarItemHtml({item, level, index}) {
  const {value, defaultStyle, className, customProps} = item;
  
  // Gestion des notices (renommé de migration à notice)
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
        key={index}>
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
            {value} {customProps.noticeLink && (
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
  
  // Comportement original pour les items HTML standards
  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        defaultStyle && [styles.menuHtmlItem, 'menu__list-item'],
        className,
      )}
      key={index}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{__html: value}}
    >
      {customProps?.new && <NewBadge />}
      {customProps?.updated && <UpdatedBadge />}
    </li>
  );
}