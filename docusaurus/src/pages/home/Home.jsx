import React, { useState, useCallback, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import styles from './home.module.scss';
import { HomepageAIButton } from '../../components';
import ApiExplorer from '../../components/ApiExplorer/ApiExplorer';
import content from './_home.content';

/**
 * Copiable code block with copy button
 */
function CopyCodeBlock({ command, children }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [command]);

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeContent}>{children}</div>
      <button
        className={`${styles.codeCopyBtn} ${copied ? styles.codeCopyBtnCopied : ''}`}
        onClick={handleCopy}
        title="Copy to clipboard"
        aria-label="Copy to clipboard"
      >
        {copied ? '✓' : '⧉'}
      </button>
    </div>
  );
}

/**
 * Animated counter that counts up from 0 to target when visible
 */
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1600;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className={styles.animatedCounter}>
      {count}{suffix}
    </span>
  );
}

/**
 * Scroll-reveal wrapper — fades in children when they enter the viewport
 */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${visible ? styles.revealVisible : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Explore link cards — categorized documentation navigation
 */
const EXPLORE_SECTIONS = [
  {
    label: 'Getting Started',
    links: [
      { icon: 'ph-compass', title: 'Quick Start Guide', desc: 'Discover Strapi in 5 minutes.', to: '/cms/quick-start' },
      { icon: 'ph-download-simple', title: 'Installation', desc: 'Install Strapi with your preferred method.', to: '/cms/installation' },
      { icon: 'ph-layout', title: 'Admin Panel', desc: 'Navigate and customize your dashboard.', to: '/cms/features/admin-panel' },
    ],
  },
  {
    label: 'Build Your Content',
    links: [
      { icon: 'ph-table', title: 'Content-Type Builder', desc: 'Define your data structure visually.', to: '/cms/features/content-type-builder' },
      { icon: 'ph-pencil-simple-line', title: 'Content Manager', desc: 'Create, edit, and publish content.', to: '/cms/features/content-manager' },
      { icon: 'ph-translate', title: 'Internationalization', desc: 'Manage content in multiple locales.', to: '/cms/features/internationalization' },
    ],
  },
];

/**
 * Powerful Features — Growth/Enterprise features with bold card design
 */
const POWERFUL_FEATURES = [
  {
    icon: 'ph-eye',
    title: 'Live Preview',
    desc: 'See your content changes in real time on your front end before publishing.',
    to: '/cms/features/preview',
  },
  {
    icon: 'ph-clock-counter-clockwise',
    title: 'Content History',
    desc: 'Track every change to your content and restore any previous version in one click.',
    to: '/cms/features/content-history',
  },
  {
    icon: 'ph-clipboard-text',
    title: 'Audit Logs',
    desc: 'Monitor who did what and when. Full activity trail for your team.',
    to: '/cms/features/audit-logs',
  },
];

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
            <div className={styles.heroLabel}>Strapi 5 Documentation</div>

            <h1 className={styles.heroTitle}>
              Build <span className={styles.heroAccent}>anything</span>
              <br />
              <span className={styles.heroDim}>with Strapi.</span>
            </h1>
            <p className={styles.heroSub}>
              The open-source headless CMS with instant APIs,
              full extensibility,{' '}
              <span style={{ whiteSpace: 'nowrap' }}>and AI built in.</span>
            </p>
            <HomepageAIButton />
          </div>
        </section>

        {/* ═══ 1. QUICK START ═══ */}
        <Reveal>
          <section className={styles.quickstart}>
            <div className={styles.sectionLabel}>Quick Start</div>
            <a href="/cms/quick-start" className={styles.quickstartCard}>
              <div className={styles.quickstartLeft}>
                <div className={styles.quickstartIcon}>
                  <i className="ph ph-rocket-launch" />
                </div>
                <div>
                  <div className={styles.quickstartTitle}>Scaffold a project in one minute</div>
                  <div className={styles.quickstartDesc}>
                    One command to scaffold, install, and start your Strapi backend.
                  </div>
                </div>
              </div>
              <CopyCodeBlock command="npx create-strapi@latest my-project --quickstart">
                <span className={styles.codeCm}>$</span>{' '}
                <span className={styles.codeFn}>npx</span> create-strapi@latest my-project{' '}
                <span className={styles.codeKw}>--quickstart</span>
              </CopyCodeBlock>
            </a>
          </section>
        </Reveal>

        {/* ═══ 2. EXPLORE SECTIONS ═══ */}
        <section className={styles.explore}>
          {EXPLORE_SECTIONS.map((section, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className={styles.exploreSection}>
                <div className={styles.exploreLabel}>{section.label}</div>
                <div className={styles.exploreGrid}>
                  {section.links.map((link, j) => (
                    <a key={j} href={link.to} className={styles.exploreCard}>
                      <div className={styles.exploreCardIcon}>
                        <i className={`ph ${link.icon}`} />
                      </div>
                      <div className={styles.exploreCardBody}>
                        <div className={styles.exploreCardTitle}>
                          {link.title}
                          <span className={styles.exploreCardArrow}>→</span>
                        </div>
                        <div className={styles.exploreCardDesc}>{link.desc}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </section>

        {/* ═══ 3. POWERFUL FEATURES ═══ */}
        <section className={styles.features}>
          <div className={styles.sectionLabel}>Powerful Features</div>
          <div className={styles.featuresGrid}>
            {POWERFUL_FEATURES.map((feature, i) => (
              <Reveal key={i} delay={i * 100}>
                <a href={feature.to} className={styles.featureCard}>
                  <div className={styles.featureCardIcon}>
                    <i className={`ph ${feature.icon}`} />
                  </div>
                  <div className={styles.featureCardTitle}>{feature.title}</div>
                  <div className={styles.featureCardDesc}>{feature.desc}</div>
                  <div className={styles.featureCardCta}>
                    Learn more <span>→</span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ═══ 4. API EXPLORER ═══ */}
        <Reveal>
          <section className={styles.apiExplorerSection}>
            <ApiExplorer />
          </section>
        </Reveal>

        {/* ═══ 5. PLUGINS + CUSTOMIZE + OPEN SOURCE — three cards ═══ */}
        <section className={styles.showcase}>
          <div className={styles.sectionLabel}>Extend & Customize</div>
          <div className={styles.showcaseGrid}>
            {/* Plugins */}
            <Reveal delay={0}>
              <a href="/cms/plugins/installing-plugins-via-marketplace" className={styles.showcaseCard}>
                <div className={styles.showcaseCardIcon}>
                  <i className="ph ph-puzzle-piece" />
                </div>
                <div className={styles.showcaseCardStat}>
                  <AnimatedCounter target={274} suffix="+" />
                </div>
                <div className={styles.showcaseCardStatLabel}>plugins on the Marketplace</div>
                <div className={styles.showcaseCardDesc}>
                  GraphQL, Sentry, Documentation, and dozens of community plugins.
                  Build your own or install from the Marketplace.
                </div>
                <div className={styles.showcaseCardCta}>
                  Browse plugins <span>→</span>
                </div>
              </a>
            </Reveal>

            {/* Customization */}
            <Reveal delay={80}>
              <a href="/cms/customization" className={styles.showcaseCard}>
                <div className={styles.showcaseCardIcon}>
                  <i className="ph ph-wrench" />
                </div>
                <div className={styles.showcaseCardTitle}>Fully Customizable</div>
                <div className={styles.showcaseCardDesc}>
                  Lifecycle hooks, custom controllers, services, policies, and middlewares.
                  Extend every layer of Strapi to fit your exact needs.
                </div>
                <div className={styles.showcaseCardCode}>
                  <span className={styles.codeCm}>// lifecycles.js</span><br />
                  <span className={styles.codeKw}>module.exports</span> = {'{'}<br />
                  {'  '}<span className={styles.codeFn}>beforeCreate</span>(event) {'{'}<br />
                  {'    '}event.params.data.price *= <span className={styles.codeStr}>0.8</span>;<br />
                  {'  '}{'}'},{'\n'}
                  {'}'};
                </div>
                <div className={styles.showcaseCardCta}>
                  Explore customization <span>→</span>
                </div>
              </a>
            </Reveal>

            {/* Open Source */}
            <Reveal delay={160}>
              <a
                href="https://github.com/strapi/strapi"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.showcaseCard}
              >
                <div className={styles.showcaseCardIcon}>
                  <i className="ph ph-github-logo" />
                </div>
                <div className={styles.showcaseCardStat}>
                  <AnimatedCounter target={71} suffix="k+" />
                </div>
                <div className={styles.showcaseCardStatLabel}>stars on GitHub</div>
                <div className={styles.showcaseCardDesc}>
                  100% open source, MIT licensed. Join thousands of contributors
                  building the leading headless CMS.
                </div>
                <div className={styles.showcaseCardCta}>
                  Star on GitHub <span>→</span>
                </div>
              </a>
            </Reveal>
          </div>
        </section>

        {/* ═══ 6. DEPLOY ═══ */}
        <Reveal>
          <section className={styles.deploy}>
            <div className={styles.sectionLabel}>Deploy</div>
            <a href="/cloud/getting-started/deployment" className={styles.deployCard}>
              <div className={styles.deployLeft}>
                <div className={styles.deployIcon}>
                  <i className="ph ph-cloud-arrow-up" />
                </div>
                <div>
                  <div className={styles.deployTitle}>Deploy to Strapi Cloud</div>
                  <div className={styles.deployDesc}>
                    Login and deploy from your terminal. Or push to GitHub for automatic deploys.
                    Also supports AWS, Heroku, DigitalOcean, and any Node.js host.
                  </div>
                </div>
              </div>
              <div className={styles.codeBlock}>
                <div className={styles.codeContent}>
                  <span className={styles.codeCm}>$</span>{' '}
                  <span className={styles.codeFn}>strapi</span> login<br />
                  <span className={styles.codeStr}>✓ Successfully logged in</span><br />
                  <span className={styles.codeCm}>$</span>{' '}
                  <span className={styles.codeFn}>strapi</span> deploy<br />
                  <span className={styles.codeStr}>✓ Project deployed to https://my-project.strapiapp.com</span>
                </div>
              </div>
            </a>
          </section>
        </Reveal>
      </main>
    </Layout>
  );
}
