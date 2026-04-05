import React from 'react';
import ReadingProgressBar from '@site/src/components/ReadingProgressBar/ReadingProgressBar';
import KapaThemeInjector from '@site/src/components/KapaThemeInjector/KapaThemeInjector';

export default function Root({ children }) {
  return (
    <>
      <ReadingProgressBar />
      <KapaThemeInjector />
      {children}
    </>
  );
}
