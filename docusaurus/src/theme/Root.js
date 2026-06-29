import React from 'react';
import ReadingProgressBar from '@site/src/components/ReadingProgressBar/ReadingProgressBar';
import KapaThemeInjector from '@site/src/components/KapaThemeInjector/KapaThemeInjector';
import HashScrollFix from '@site/src/components/HashScrollFix/HashScrollFix';
import { ViewModeProvider } from '@site/src/components/ViewMode/ViewModeContext';

export default function Root({ children }) {
  return (
    <ViewModeProvider>
      <ReadingProgressBar />
      <KapaThemeInjector />
      <HashScrollFix />
      {children}
    </ViewModeProvider>
  );
}
