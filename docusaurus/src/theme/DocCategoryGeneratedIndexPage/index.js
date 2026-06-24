/**
 * Swizzled DocCategoryGeneratedIndexPage.
 *
 * These pages back the generated-index categories (e.g. /cms/features,
 * /cms/ai). The default theme renders plain Docusaurus DocCardList cards; this
 * version reuses the site's CustomDocCard design and adds a short intro line
 * under the H1 explaining the page is auto-generated.
 */
import React from 'react';
import { PageMetadata } from '@docusaurus/theme-common';
import { useCurrentSidebarCategory } from '@docusaurus/plugin-content-docs/client';
import useBaseUrl from '@docusaurus/useBaseUrl';
import DocPaginator from '@theme/DocPaginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import Heading from '@theme/Heading';
import CustomDocCard from '@site/src/components/CustomDocCard';
import CustomDocCardsWrapper from '@site/src/components/CustomDocCardsWrapper';
import styles from './styles.module.css';

function DocCategoryGeneratedIndexPageMetadata({ categoryGeneratedIndex }) {
  return (
    <PageMetadata
      title={categoryGeneratedIndex.title}
      description={categoryGeneratedIndex.description}
      keywords={categoryGeneratedIndex.keywords}
      image={useBaseUrl(categoryGeneratedIndex.image)}
    />
  );
}

// Derive a CustomDocCard description from a sidebar item: explicit description
// first, then a child count for sub-categories, else nothing.
function itemDescription(item) {
  if (item.description) return item.description;
  if (item.type === 'category' && Array.isArray(item.items)) {
    const count = item.items.length;
    return `${count} ${count === 1 ? 'item' : 'items'}`;
  }
  return undefined;
}

function DocCategoryGeneratedIndexPageContent({ categoryGeneratedIndex }) {
  const category = useCurrentSidebarCategory();
  const items = category.items.filter((item) => item.href);

  return (
    <div className={styles.generatedIndexPage}>
      <DocVersionBanner />
      <DocBreadcrumbs />
      <DocVersionBadge />
      <header>
        <Heading as="h1" className={styles.title}>
          {categoryGeneratedIndex.title}
        </Heading>
        <p>
          This is an auto-generated page listing all the pages belonging to the
          {' '}&quot;{categoryGeneratedIndex.title}&quot; topic.
        </p>
        {categoryGeneratedIndex.description && (
          <p>{categoryGeneratedIndex.description}</p>
        )}
      </header>
      <article className="margin-top--lg">
        <CustomDocCardsWrapper>
          {items.map((item, i) => (
            <CustomDocCard
              key={i}
              title={item.label}
              link={item.href}
              description={itemDescription(item)}
            />
          ))}
        </CustomDocCardsWrapper>
      </article>
      <footer className="margin-top--lg">
        <DocPaginator
          previous={categoryGeneratedIndex.navigation.previous}
          next={categoryGeneratedIndex.navigation.next}
        />
      </footer>
    </div>
  );
}

export default function DocCategoryGeneratedIndexPage(props) {
  return (
    <>
      <DocCategoryGeneratedIndexPageMetadata {...props} />
      <DocCategoryGeneratedIndexPageContent {...props} />
    </>
  );
}
