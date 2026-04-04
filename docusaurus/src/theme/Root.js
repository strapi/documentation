import React from 'react';
import ReadingProgressBar from '@site/src/components/ReadingProgressBar/ReadingProgressBar';

export default function Root({ children }) {
  return (
    <>
      <ReadingProgressBar />
      {children}
    </>
  );
}
