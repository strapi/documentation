/** This component was inspired by this gist given by Andrew from Prefab team:
 *  https://gist.github.com/ayip8/f996997cba8d288dd63b82460ae87471
 */
import React, { useEffect, useState } from "react";
import useIsBrowser from "@docusaurus/useIsBrowser";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import { PrefabProvider, usePrefab } from "@prefab-cloud/prefab-cloud-react";

// setup for the usePrefab hook
const PrefabWrapper = ({ children }) => {
  const isBrowser = useIsBrowser();
  const [userId, setUserId] = useState(null);
  const {siteConfig} = useDocusaurusContext();
  const { prefabApiKey } = siteConfig.customFields;

  useEffect(() => {
    if (isBrowser) {
      // trying to get the user id from google analytics, but I'm stuck here…
      const checkGaGlobal = () => {
        if (window.gaGlobal && window.gaGlobal.vid) {
          setUserId(window.gaGlobal.vid);
          console.log('window.gaGlobal.vid:', window.gaGlobal.vid);
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
      // trying to get the user id from hotjar, but not working either… 🤷
      hj('identify', userId, {
        // Add other user properties here if required
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
        // at some point we'll need to get prefabApiKey from the docusaurus config
        apiKey={"398-Development-P435-E907-FRONTEND-b3f733ec-b1b7-464f-8b6f-9cf91d23a434"}
        // apiKey={prefabApiKey}
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
    // default state — could also be used for a loading spinner or something
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
