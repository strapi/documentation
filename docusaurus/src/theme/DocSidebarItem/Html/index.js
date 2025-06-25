import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import { NewBadge, UpdatedBadge } from '../../../components/Badge';
import styles from './styles.module.css';

export default function DocSidebarItemHtml({item, level, index}) {
  const {value, defaultStyle, className, customProps} = item;
  
  // Notice sobre (remplace le contenu HTML)
  if (customProps?.noticeText) {
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
        <div className="sidebar-notice">
          <i className="ph-fill ph-info sidebar-notice__icon"></i>
          <div 
            className="sidebar-notice__content"
            dangerouslySetInnerHTML={{ __html: customProps.noticeText }}
          />
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
      dangerouslySetInnerHTML={{__html: value}}
    >
      {customProps?.new && <NewBadge />}
      {customProps?.updated && <UpdatedBadge />}
    </li>
  );
}