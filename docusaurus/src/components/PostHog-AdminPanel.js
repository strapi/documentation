import React from 'react'
import { useFeatureFlagVariantKey } from 'posthog-js/react'

export default function PostHogAdminPanelBasic({ wording = "user guide" }) {

  const variantKey = useFeatureFlagVariantKey('userguide_adminpanel')

  if (variantKey === 'user-guide') {
    wording = 'user guide'
  } else if (variantKey === 'admin-panel') {
    wording = 'admin panel'
  }

  return (
    <span id="posthog-adminpanel">{wording}</span>
  );
}
