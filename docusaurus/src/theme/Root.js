import React from 'react';
import { InkeepSimpleProvider } from '../components/Inkeep';

// Root component that wraps the entire app
export default function Root({ children }) {
  return (
    <InkeepSimpleProvider>
      {children}
    </InkeepSimpleProvider>
  );
}