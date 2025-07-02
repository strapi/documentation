import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import { NewBadge, UpdatedBadge } from '../../../components/Badge';
import styles from './styles.module.css';
import Icon from '@site/src/components/Icon';

export default function DocSidebarItemHtml({item, level, index}) {
  const {value, defaultStyle, className, customProps} = item;
  
  // Notice (replaces HTML content)
  if (customProps?.tooltipTitle) {
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
          <div className="sidebar-notice__header">
            <Icon name="info"/>
            <span className="sidebar-notice__content">
              {customProps.tooltipTitle} 
            </span>
            {customProps?.tooltipContent && ( 
              <div className="sidebar-notice__toggle">
                <Icon name="caret-right" />
              </div>
            )}
          </div>
          
          {customProps?.tooltipContent && (
            <div 
              className="sidebar-notice__expandable"
              dangerouslySetInnerHTML={{ __html: customProps.tooltipContent }}
            /> 
          )}
          
          <div className="sidebar-notice__badges">
            {customProps?.new && <NewBadge />}
            {customProps?.updated && <UpdatedBadge />}
          </div>
        </div>
      </li>
    );
  }
  
  // Original behavior for standard HTML items 
  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        defaultStyle && [styles.menuHtmlItem, 'menu__list-item'],
        className,
      )}
      key={index}>
      <div dangerouslySetInnerHTML={{__html: value}} />
      <div className="sidebar-badges">
        {customProps?.new && <NewBadge />}
        {customProps?.updated && <UpdatedBadge />}
      </div>
    </li>
  );
}