import React, { useEffect, useState } from "react";
import Layout from "@theme/Layout";
import useIsBrowser from "@docusaurus/useIsBrowser";
import BrowserOnly from "@docusaurus/BrowserOnly";

export default function AskAIPage() {
  const isBrowser = useIsBrowser();

  return (
    <Layout title="Ask AI" description="Ask your questions to our AI assistant">
      {isBrowser && (
        <BrowserOnly fallback={<div>Loading...</div>}>
          {() => {
            const { useInkeepModal } = require("../hooks/useInkeepModal");
            const { openChat, modal } = useInkeepModal();

            useEffect(() => {
              openChat();
            }, [openChat]);

            return <>{modal}</>;
          }}
        </BrowserOnly>
      )}
    </Layout>
  );
}
