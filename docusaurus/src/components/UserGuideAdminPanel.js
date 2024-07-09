import React, { useEffect, useState } from "react";
import useIsBrowser from "@docusaurus/useIsBrowser";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import { PrefabProvider, usePrefab } from "@prefab-cloud/prefab-cloud-react";

// setup for the usePrefab hook
const PrefabWrapper = ({ children }) => {
  const isBrowser = useIsBrowser();
  const [userId, setUserId] = useState(null);
  const {siteConfig} = useDocusaurusContext();
  console.log(siteConfig);
  const { prefabApiKey } = siteConfig.customFields;

  useEffect(() => {
    if (isBrowser) {
      const checkGaGlobal = () => {
        if (window.gaGlobal && window.gaGlobal.vid) {
          setUserId(window.gaGlobal.vid);
        } else {
          // Retry after a delay if gaGlobal.vid is not yet available
          setTimeout(checkGaGlobal, 500);
        }
      };

      checkGaGlobal();
    }
  }, [isBrowser]);

  useEffect(() => {
    if (isBrowser && userId) {
      hj('identify', userId, {
        // Ajoutez ici d'autres propriétés utilisateur si nécessaire
        userProperty: 'value'
      });
    }
  }, [isBrowser, userId]);

  if (isBrowser && userId) {
    const onError = (error) => {
      console.log(error);
    };

    return (
      <PrefabProvider
        // apiKey={"398-Development-P435-E907-FRONTEND-b3f733ec-b1b7-464f-8b6f-9cf91d23a434"}
        apiKey={prefabApiKey}
        contextAttributes={{
          // pass the hotjar user id to prefab
          // or you could use the google analytics id
          user: { key: userId },
        }}
        onError={onError}
      >
        {children}
      </PrefabProvider>
    );
  }

  return <>{children}</>;
};

// your actual component that will render the user guide or admin panel
const InnerComponent = () => {
  const { get, loading } = usePrefab();

  if (loading) {
    // show a spinner while the prefab flag data is loading
    return <span>user guide</span>;
  }

  switch (get("user-guide-vs-admin-panel")) {
    case "user-guide":
      return <span>user guide</span>;
    case "admin-panel":
    default:
      return <span>admin panel</span>;
  }
};

export const UserGuideVsAdminPanel = () => {
  // wrap the actual conmponent so that the usePrefab hook can be used
  return (
    <PrefabWrapper>
      <InnerComponent />
    </PrefabWrapper>
  );
};
