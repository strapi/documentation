import React from 'react'

export default function PostHogAdminPanelBasic({ wording = "Admin Panel" }) {

  // wording = "user guide"

  return (
    <span id="posthog-adminpanel">{wording}</span>
  );
}
