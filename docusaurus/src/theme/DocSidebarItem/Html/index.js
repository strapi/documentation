import React, { useState } from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import { NewBadge, UpdatedBadge } from '../../../components/Badge';
import styles from './styles.module.css';
import Icon from '@site/src/components/Icon';

export default function DocSidebarItemHtml({item, level, index}) {
  const {value, defaultStyle, className, customProps} = item;
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Notice (replaces HTML content)
  if (customProps?.text) {
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
        <div className={clsx("sidebar-notice", { 'sidebar-notice--expanded': isExpanded })}>
          <div className="sidebar-notice__header" onClick={handleToggle}>
            <Icon name="info" />
            <span className="sidebar-notice__content">
              {customProps.text}
            </span>
            {customProps?.tooltip && (
              <button 
                className="sidebar-notice__toggle"
                aria-expanded={isExpanded}
                aria-label={isExpanded ? "Collapse info" : "Expand info"}
              >
                <Icon name={isExpanded ? "caret-down" : "caret-right"} />
              </button>
            )}
          </div>
          
          {customProps?.tooltip && (
            <div 
              className={clsx("sidebar-notice__expandable", {
                'sidebar-notice__expandable--visible': isExpanded
              })}
              dangerouslySetInnerHTML={{ __html: customProps.tooltip }}
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
      key={index}
      dangerouslySetInnerHTML={{__html: value}}
    >
      {customProps?.new && <NewBadge />}
      {customProps?.updated && <UpdatedBadge />}
    </li>
  );
}