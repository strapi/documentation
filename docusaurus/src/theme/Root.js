import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { PostHogProvider } from 'posthog-js/react';

// Default implementation, that you can customize
export default function Root({children}) {
  console.log("I am root");
  const {
    siteConfig: {customFields},
  } = useDocusaurusContext();
  console.log('customFields', customFields);

  return <>
    <PostHogProvider
      apiKey={customFields.postHogApiKey}
      options={{
        api_host: customFields.postHogApiHost,
      }}
      test={customFields.test}
    >
      {children}
    </PostHogProvider>
  </>;
}
