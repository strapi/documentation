import React from 'react';
import Layout from '@theme-original/DocItem/Layout';
import WidthToggle from '@site/src/components/WidthToggle/WidthToggle';

export default function LayoutWrapper(props) {
  return (
    <>
      <WidthToggle />
      <Layout {...props} />
    </>
  );
}
