import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import styles from './home.module.scss';
import {
  Card,
  CardCta,
  CardIcon,
  CardDescription,
  CardImg,
  CardTitle,
  Container,
  Hero,
  HeroDescription,
  HeroTitle,
  HomepageAIButton,
} from '../../components';
import NewsTicker from '@site/src/components/NewsTicker';
import Icon from '../../components/Icon';
import content from './_home.content';
import useIsBrowser from '@docusaurus/useIsBrowser';

const QUICK_LINKS = [
  {
    icon: 'rocket-launch',
    title: 'Quick Start',
    desc: 'Get up and running in 5 minutes',
    to: '/cms/quick-start',
  },
  {
    icon: 'plugs-connected',
    title: 'REST API',
    desc: 'Create, read, update, delete content',
    to: '/cms/api/rest',
  },
  {
    icon: 'graph',
    title: 'GraphQL API',
    desc: 'Query your content with GraphQL',
    to: '/cms/api/graphql',
  },
  {
    icon: 'puzzle-piece',
    title: 'Plugins',
    desc: 'Extend Strapi with plugins',
    to: '/cms/plugins',
  },
  {
    icon: 'code',
    title: 'Customization',
    desc: 'Tailor Strapi to your needs',
    to: '/cms/customization',
  },
  {
    icon: 'cloud',
    title: 'Deploy to Cloud',
    desc: 'One-click deployment on Strapi Cloud',
    to: '/cloud/getting-started/deployment',
  },
];

export default function PageHome() {
  const isBrowser = useIsBrowser();
  const isDarkTheme = isBrowser
    ? document.documentElement.getAttribute('data-theme') === 'dark'
    : false;

  return (
    <Layout
      title={content.page.title}
      description={content.page.description}
    >
      <main className={styles.home}>
        <NewsTicker newsItems={content.newsTicker} />

        <Hero id="homeHero">
          <Container>
            <HeroTitle className="heroTitle">
              {content.page.title}
            </HeroTitle>
            <HeroDescription className="heroDescription">
              {content.page.description}
            </HeroDescription>
          </Container>
        </Hero>

        <HomepageAIButton />

        <section id="homeCategories" className={styles.home__categories}>
          <Container>
            <div className="row row--huge">
              {content.categories.map(({
                cardTitle: categoryItemCardTitle,
                cardDescription: categoryItemCardDescription,
                cardImgSrc: categoryItemCardImgSrc,
                cardLink: categoryItemCardLink,
                cardIconName: categoryItemCardIconName,
                cardIconColor: categoryItemCardIconColor,
                cardCtaText: categoryItemCardCtaText,
                categoryType,
                ...categoryItem
              }, categoryItemIndex) => (
                <div
                  key={`pageHomeCategoryItem${categoryItemIndex}`}
                  className={clsx('col', 'col--6', styles.home__categories__item)}
                >
                  <Card
                    categoryType={categoryType}
                    href={categoryItemCardLink}
                    asCallToAction
                    isDarkTheme={isDarkTheme}
                  >
                    {categoryItemCardIconName && (
                      <CardIcon name={categoryItemCardIconName} color={categoryItemCardIconColor} isDarkTheme={isDarkTheme} />
                    )}
                    {categoryItemCardTitle && <CardTitle>{categoryItemCardTitle}</CardTitle>}
                    {categoryItemCardDescription && <CardDescription>{categoryItemCardDescription}</CardDescription>}
                    {categoryItemCardLink && (
                      <CardCta
                        asPlainContent
                        withArrow
                        to={categoryItemCardLink}
                        text={categoryItemCardCtaText}
                        color={categoryItemCardIconColor}
                        className="category-card-cta"
                        isDarkTheme={isDarkTheme}
                      />
                    )}
                    {isDarkTheme && categoryItem.cardImgSrcDark
                      ? <CardImg src={categoryItem.cardImgSrcDark} isDarkTheme={isDarkTheme} />
                      : categoryItemCardImgSrc && <CardImg src={categoryItemCardImgSrc} isDarkTheme={isDarkTheme} />
                    }
                  </Card>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className={styles.home__quicklinks}>
          <p className={styles.sectionTitle}>Popular resources</p>
          <div className={styles.quickLinksGrid}>
            {QUICK_LINKS.map((link, i) => (
              <a
                key={link.to}
                href={link.to}
                className={styles.quickLinkItem}
                style={{ '--stagger': i }}
              >
                <span className={styles.quickLinkItem__icon}>
                  <Icon name={link.icon} />
                </span>
                <span className={styles.quickLinkItem__content}>
                  <span className={styles.quickLinkItem__title}>{link.title}</span>
                  <span className={styles.quickLinkItem__desc}>{link.desc}</span>
                </span>
                <span className={styles.quickLinkItem__arrow}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
