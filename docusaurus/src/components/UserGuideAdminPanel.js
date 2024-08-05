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

  const {siteConfig} = useDocusaurusContext();
  const { prefabApiKey } = siteConfig.customFields;

  if (isBrowser) {
    const onError = (error) => {
      console.log(error);
    };

    const getCookie = (name) => {
      let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      if (match) return match[2];
    }

    let gaCookie = getCookie('_ga');

    return (
      <PrefabProvider
        apiKey={prefabApiKey}
        contextAttributes={{
          //  pass the google analytics id
          user: { key: gaCookie },
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
  const [variant, setVariant] = useState(null);

  useEffect(() => {
    if (!loading) {
      setVariant(get("flag.user-guide-name"));
    }
  }, [loading, get]);

  if (loading) {
    // default state — could also be used for a loading spinner or something
    return <span>user guide</span>;
  }

  switch (variant) {
    case "user guide":
      return <span>user guide</span>;
    case "admin panel":
      return <span>admin panel guide</span>;
    default:
      return <span>user guide</span>;
  }
};

export const UserGuideAdminPanel = () => {
  // wrap the actual component so that the usePrefab hook can be used
  return (
    <PrefabWrapper>
      <InnerComponent />
    </PrefabWrapper>
  );
};
