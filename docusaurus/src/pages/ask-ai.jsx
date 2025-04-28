import React, { useEffect } from "react";
import Layout from "@theme/Layout";
import useIsBrowser from "@docusaurus/useIsBrowser";
import { useInkeepModal } from "../hooks/useInkeepModal"

export default function AskAIPage() {
  const isBrowser = useIsBrowser();
  const { openChat, modal } = useInkeepModal(); 

  useEffect(() => {
    if (isBrowser) {
      openChat(); 
    }
  }, [isBrowser, openChat]);

  return (
    <Layout title="Ask AI" description="Ask your questions to our AI assistant">
      {modal}
    </Layout>
  );
}
