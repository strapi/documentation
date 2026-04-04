import React from 'react';
import Layout from '@theme/Layout';
import styles from './api-reference.module.scss';
import ApiSidebar from './ApiSidebar';
import ApiHeader from './ApiHeader';

/**
 * Full API reference page layout.
 * Replaces the standard Docusaurus doc page layout for API reference.
 *
 * <ApiReferencePage
 *   title="REST API — Entries"
 *   description="CRUD operations..."
 *   baseUrl="http://localhost:1337"
 *   sidebarSections={[...]}
 * >
 *   <Endpoint ... />
 *   <Endpoint ... />
 * </ApiReferencePage>
 */
export default function ApiReferencePage({
  title,
  description,
  baseUrl = 'http://localhost:1337',
  sidebarSections = [],
  children,
}) {
  return (
    <Layout title={title} description={description}>
      <div className={styles.apiLayout}>
        <ApiSidebar sections={sidebarSections} />
        <div className={styles.apiMain}>
          <ApiHeader title={title} description={description} baseUrl={baseUrl} />
          {children}
        </div>
      </div>
    </Layout>
  );
}
