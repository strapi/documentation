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
import { useCurrentSidebarCategory, useDocById } from '@docusaurus/plugin-content-docs/client';
import useBaseUrl from '@docusaurus/useBaseUrl';
import DocPaginator from '@theme/DocPaginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import Heading from '@theme/Heading';
import CustomDocCard from '@site/src/components/CustomDocCard';
import CustomDocCardsWrapper from '@site/src/components/CustomDocCardsWrapper';
import WidthToggle from '@site/src/components/WidthToggle/WidthToggle';
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

// One card per sidebar item. Pulls the real page description from its
// frontmatter (via useDocById) so the cards are not empty; falls back to the
// item's own description, or a child count for sub-categories.
function GeneratedIndexCard({ item }) {
  // useDocById returns the doc metadata (incl. its frontmatter description)
  // for a link item; undefined for categories or unknown ids.
  const doc = useDocById(item.docId ?? undefined);
  let description = doc?.description ?? item.description;
  if (!description && item.type === 'category' && Array.isArray(item.items)) {
    const count = item.items.length;
    description = `${count} ${count === 1 ? 'item' : 'items'}`;
  }
  return (
    <CustomDocCard title={item.label} link={item.href} description={description} />
  );
}

function DocCategoryGeneratedIndexPageContent({ categoryGeneratedIndex }) {
  const category = useCurrentSidebarCategory();
  const items = category.items.filter((item) => item.href);

  return (
    <div className={styles.generatedIndexPage}>
      {/* Content-width selector, so these pages can be widened/narrowed like
          regular doc pages (they follow --doc-content-max-width). */}
      <div className={styles.widthToggleRow}>
        <WidthToggle />
      </div>
      <DocVersionBanner />
      <DocBreadcrumbs />
      <DocVersionBadge />
      <header>
        <Heading as="h1" className={styles.title}>
          {categoryGeneratedIndex.title}
        </Heading>
        <p>
          This is an auto-generated page listing all the pages belonging to the
          {' '}&quot;{categoryGeneratedIndex.title}&quot; topic. Click on any item
          {' '}to explore the topic.
        </p>
        {categoryGeneratedIndex.description && (
          <p>{categoryGeneratedIndex.description}</p>
        )}
      </header>
      <article className="margin-top--lg">
        <CustomDocCardsWrapper>
          {items.map((item, i) => (
            <GeneratedIndexCard key={i} item={item} />
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
