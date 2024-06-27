import React from 'react'
import { useFeatureFlagVariantKey } from 'posthog-js/react'

export default function PostHogAdminPanelBasic({ wording = "user guide" }) {

  const variantKey = useFeatureFlagVariantKey('userguide_adminpanel')
  // let wording = ''
  console.log("variantKey: ", variantKey);

  if (variantKey === 'userguide') {
    wording = 'user guide'
  } else if (variantKey === 'adminpanel') {
    wording = 'admin panel'
  }

  console.log("wording: ", wording);

  return (
    <span id="posthog-adminpanel">{wording}</span>
  );
}
