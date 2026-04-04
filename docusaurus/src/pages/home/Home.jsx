import React from 'react';
import Layout from '@theme/Layout';
import styles from './home.module.scss';
import { HomepageAIButton } from '../../components';
import content from './_home.content';

/**
 * Bento grid items for the "Quick Start" section.
 */
const BENTO_ITEMS = [
  {
    wide: true,
    icon: '🚀',
    title: 'Create a project in 30 seconds',
    desc: 'One command to scaffold, install, and start your Strapi backend.',
    to: '/cms/quick-start',
    code: (key) => (
      <div key={key} className={styles.bentoCardCode}>
        <span className={styles.codeCm}>$</span>{' '}
        <span className={styles.codeFn}>npx</span> create-strapi@latest my-project{' '}
        <span className={styles.codeKw}>--quickstart</span>
      </div>
    ),
  },
  {
    icon: '⚡',
    title: 'Content APIs',
    desc: 'REST and GraphQL APIs auto-generated from your content types.',
    to: '/cms/api/content-api',
    code: (key) => (
      <div key={key} className={styles.bentoCardCode} style={{ marginTop: 'auto' }}>
        <span className={styles.codeFn}>GET</span> /api/articles<br />
        <span className={styles.codeFn}>POST</span> /api/articles<br />
        <span className={styles.codeFn}>PUT</span> /api/articles/<span className={styles.codeStr}>:id</span>
      </div>
    ),
  },
  {
    icon: '🔌',
    title: 'Plugin Ecosystem',
    desc: 'Extend everything. Build custom plugins or use community ones.',
    to: '/cms/plugins',
    stat: '60+',
    statLabel: 'community plugins',
  },
  {
    icon: '🔧',
    title: 'Customization',
    desc: 'Lifecycle hooks, middlewares, policies, and custom controllers.',
    to: '/cms/customization',
  },
  {
    wide: true,
    icon: '🌐',
    title: 'Deploy Anywhere',
    desc: 'Strapi Cloud, AWS, Heroku, DigitalOcean, Vercel, or your own infrastructure. One-click deploy or full control.',
    to: '/cloud/getting-started/deployment',
    code: (key) => (
      <div key={key} className={styles.bentoCardCode} style={{ marginTop: 'auto' }}>
        <span className={styles.codeCm}>$</span>{' '}
        <span className={styles.codeFn}>strapi</span> deploy{' '}
        <span className={styles.codeKw}>--cloud</span><br />
        <span className={styles.codeStr}>✓ Project deployed to https://my-project.strapiapp.com</span>
      </div>
    ),
  },
];

/**
 * REST API Reference preview items
 */
const API_ITEMS = [
  { method: 'GET', path: '/api/:pluralApiId', desc: 'Get entries', to: '/cms/api/rest#get-all' },
  { method: 'GET', path: '/api/:pluralApiId/:documentId', desc: 'Get an entry', to: '/cms/api/rest#get' },
  { method: 'POST', path: '/api/:pluralApiId', desc: 'Create an entry', to: '/cms/api/rest#create' },
  { method: 'PUT', path: '/api/:pluralApiId/:documentId', desc: 'Update an entry', to: '/cms/api/rest#update' },
  { method: 'DEL', path: '/api/:pluralApiId/:documentId', desc: 'Delete an entry', to: '/cms/api/rest#delete' },
];

/**
 * Product cards — CMS + Cloud
 */
const PRODUCT_CARDS = [
  {
    variant: 'cms',
    icon: '📦',
    title: 'CMS Documentation',
    desc: 'Build, customize, and extend your content backend. APIs, plugins, admin panel, and more.',
    to: '/cms/intro',
    tags: ['REST API', 'GraphQL', 'Plugins', 'TypeScript', 'Customization'],
  },
  {
    variant: 'cloud',
    icon: '☁️',
    title: 'Cloud Platform',
    desc: 'Deploy in one click, scale with confidence. Managed hosting built for Strapi.',
    to: '/cloud/intro',
    tags: ['Deploy', 'CLI', 'Domains', 'Environments'],
  },
];

function ApiPath({ path }) {
  return path.split(/(:[\w]+)/).map((segment, i) =>
    segment.startsWith(':')
      ? <span key={i} className={styles.apiParam}>{segment}</span>
      : <span key={i}>{segment}</span>
  );
}

export default function PageHome() {
  return (
    <Layout
      title={content.page.title}
      description={content.page.description}
    >
      <main className={styles.home}>
        {/* ═══ HERO ═══ */}
        <section className={styles.hero}>
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={styles.heroContent}>
            {/* Badge pill */}
            <a href="/release-notes" className={styles.heroBadge}>
              <span className={styles.heroBadgeDot}>
                <span className={styles.heroBadgeDotInner} />
              </span>
              Strapi 5.12 — Read what's new →
            </a>

            <h1 className={styles.heroTitle}>
              Build <span className={styles.heroAccent}>anything</span>
              <br />
              <span className={styles.heroDim}>with Strapi.</span>
            </h1>
            <p className={styles.heroSub}>
              The open-source headless CMS that gives you the freedom
              to choose your tools and frameworks.
            </p>
            <HomepageAIButton />
          </div>
        </section>

        {/* ═══ PRODUCT CARDS ═══ */}
        <section className={styles.products}>
          <div className={styles.productsGrid}>
            {PRODUCT_CARDS.map((card, i) => (
              <a
                key={i}
                href={card.to}
                className={`${styles.productCard} ${styles[`productCard${card.variant.charAt(0).toUpperCase() + card.variant.slice(1)}`]}`}
              >
                <div className={styles.productCardTop}>
                  <div className={styles.productCardIcon}>{card.icon}</div>
                  <div className={styles.productCardArrow}>→</div>
                </div>
                <div className={styles.productCardTitle}>{card.title}</div>
                <div className={styles.productCardDesc}>{card.desc}</div>
                <div className={styles.productCardTags}>
                  {card.tags.map((tag, j) => (
                    <span key={j} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ═══ BENTO GRID ═══ */}
        <section className={styles.bento}>
          <div className={styles.bentoLabel}>Quick Start</div>
          <div className={styles.bentoGrid}>
            {BENTO_ITEMS.map((item, i) => (
              <a
                key={i}
                href={item.to}
                className={`${styles.bentoCard} ${item.wide ? styles.bentoCardWide : ''}`}
              >
                <div className={styles.bentoCardIcon}>{item.icon}</div>
                <div className={styles.bentoCardTitle}>{item.title}</div>
                <div className={styles.bentoCardDesc}>{item.desc}</div>
                {item.stat && (
                  <>
                    <div className={styles.bentoCardStat}>{item.stat}</div>
                    <div className={styles.bentoCardStatLabel}>{item.statLabel}</div>
                  </>
                )}
                {item.code && item.code(`code-${i}`)}
              </a>
            ))}
          </div>
        </section>

        {/* ═══ API PREVIEW ═══ */}
        <section className={styles.apiPreview}>
          <div className={styles.apiPreviewLabel}>REST API Reference</div>
          <div className={styles.apiRow}>
            {API_ITEMS.map((item, i) => (
              <a key={i} href={item.to} className={styles.apiItem}>
                <span className={`${styles.apiMethod} ${styles[`apiMethod${item.method.charAt(0).toUpperCase() + item.method.slice(1).toLowerCase()}`] || styles.apiMethodGet}`}>
                  {item.method}
                </span>
                <span className={styles.apiPath}>
                  <ApiPath path={item.path} />
                </span>
                <span className={styles.apiDesc}>{item.desc}</span>
                <span className={styles.apiArrow}>→</span>
              </a>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
