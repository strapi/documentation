import React, { useRef, useCallback } from 'react';
import Footer from '@theme-original/DocItem/Footer';
import PageFeedback from '@site/src/components/PageFeedback';
import SelectionFeedback from '@site/src/components/PageFeedback/SelectionFeedback';
import HeadingAnchor from '@site/src/components/PageFeedback/SelectionFeedback/HeadingAnchor';
import StepProgress from '@site/src/components/StepProgress/StepProgress';
import { useDoc } from '@docusaurus/plugin-content-docs/client';

export default function FooterWrapper(props) {
  const { metadata } = useDoc();
  const feedbackRef = useRef(null);

  const handleSelectionFeedback = useCallback((data) => {
    feedbackRef.current?.onSelectionFeedback(data);
  }, []);

  return (
    <>
      <SelectionFeedback onFeedback={handleSelectionFeedback} />
      <HeadingAnchor onFeedback={handleSelectionFeedback} />
      <PageFeedback
        ref={feedbackRef}
        pagePath={metadata.permalink}
        pageId={metadata.id}
        pageTitle={metadata.title}
      />
      <Footer {...props} />
      <StepProgress />
    </>
  );
}
