import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';

export default function Guideflow({ lightId, darkId }) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === "dark";

  if (!lightId) return null;

  const iframeStyle = {
    overflow: 'hidden',
    position: 'absolute',
    border: 'none',
    width: '100%',
    height: '100%',
    transition: 'opacity 0.2s'
  };

  return (
    <div style={{
      position: 'relative',
      paddingBottom: 'calc(69.3342776203966% + 50px)',
      height: '0'
    }}>
      <iframe
        src={`https://app.guideflow.com/embed/${lightId}`}
        style={{
          ...iframeStyle,
          opacity: isDarkTheme ? 0 : 1,
          zIndex: isDarkTheme ? 1 : 2
        }}
        scrolling="no"
        allow="clipboard-read; clipboard-write"
        allowFullScreen
      />
      {darkId && (
        <iframe
          src={`https://app.guideflow.com/embed/${darkId}`}
          style={{
            ...iframeStyle,
            opacity: isDarkTheme ? 1 : 0,
            zIndex: isDarkTheme ? 2 : 1
          }}
          scrolling="no"
          allow="clipboard-read; clipboard-write"
          allowFullScreen
        />
      )}
    </div>
  );
}
