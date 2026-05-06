import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import PageFeedback from '@site/src/components/PageFeedback';
import { useDoc } from '@docusaurus/plugin-content-docs/client';

export default function FooterWrapper(props) {
  const { metadata } = useDoc();

  return (
    <>
      <PageFeedback
        pagePath={metadata.permalink}
        pageId={metadata.id}
        pageTitle={metadata.title}
      />
      <Footer {...props} />
    </>
  );
}
