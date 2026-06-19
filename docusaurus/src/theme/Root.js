import React from 'react';
import ReadingProgressBar from '@site/src/components/ReadingProgressBar/ReadingProgressBar';
import KapaThemeInjector from '@site/src/components/KapaThemeInjector/KapaThemeInjector';
import { ViewModeProvider } from '@site/src/components/ViewMode/ViewModeContext';

export default function Root({ children }) {
  return (
    <ViewModeProvider>
      <ReadingProgressBar />
      <KapaThemeInjector />
      {children}
    </ViewModeProvider>
  );
}
