import React from "react";
import useIsBrowser from "@docusaurus/useIsBrowser";
import { PrefabProvider } from "@prefab-cloud/prefab-cloud-react";

export default function Root({ children }) {
  const isBrowser = useIsBrowser();

  // if (window.hj && hj.getUserId) {
  //       const uniqueIdentifier = hj.getUserId();
  // } else {
  //    console.log("Hotjar n'est pas correctement initialisé ou ne supporte pas cette fonction.");
  // }

  const uniqueIdentifier = window.posthog?.get_distinct_id();

  const contextAttributes = {
    user: { key: uniqueIdentifier },
  };

  console.log("contextAttributes", contextAttributes);

  if (isBrowser) {
    const onError = (error) => {
      console.log(error);
    };

    return (
      <PrefabProvider
        apiKey={"398-Development-P435-E907-FRONTEND-b3f733ec-b1b7-464f-8b6f-9cf91d23a434"}
        onError={onError}
        contextAttributes={contextAttributes}
        collectEvaluationSummaries={true}
      >
        {children}
      </PrefabProvider>
    );
  }

  return <>{children}</>;
}
