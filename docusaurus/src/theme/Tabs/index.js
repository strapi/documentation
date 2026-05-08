import React from 'react';
import OriginalTabs from '@theme-original/Tabs';
import { useViewMode } from '@site/src/components/ViewMode/ViewModeContext';

/**
 * Flat rendering of all tab panels for markdown mode.
 * Instead of a tabbed UI, shows all panels sequentially with headings.
 */
function FlatTabs({ children }) {
  const items = React.Children.toArray(children);

  return (
    <div className="tabs-flat">
      {items.map((child, i) => {
        const label = child.props?.label || child.props?.value || `Tab ${i + 1}`;
        return (
          <div key={child.props?.value || i} className="tabs-flat__section">
            <h4 className="tabs-flat__heading">{label}</h4>
            <div className="tabs-flat__content">
              {child.props?.children}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TabsWrapper(props) {
  const { viewMode } = useViewMode();

  if (viewMode === 'markdown') {
    return <FlatTabs {...props}>{props.children}</FlatTabs>;
  }

  return <OriginalTabs {...props} />;
}
