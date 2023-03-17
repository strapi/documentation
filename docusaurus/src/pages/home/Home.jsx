import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import styles from './home.module.scss';
import {
  Button,
  Card,
  CardDescription,
  CardImg,
  CardImgBg,
  CardTitle,
  Carousel,
  CarouselSlide,
  Container,
  FeaturesList,
  Hero,
  HeroDescription,
  HeroTitle,
  LinkWithArrow,
} from '../../components';

const pageTitle = 'Strapi’s documentation';
const pageDescription = 'Get set up in minutes to build any projects in hours instead of weeks.';
const NAVBAR_TRANSLUCENT_UNTIL_SCROLL_Y = 36;

export default function PageHome() {
  const [isNavbarTranslucent, setIsNavbarTranslucent] = useState(true);

  /**
   * Scroll Listener to apply the "translucent" visual effect to navbar,
   * behavior which happens only at Home Page.
   */
  useEffect(() => {
    function scrollListener() {
      setIsNavbarTranslucent(window.scrollY <= NAVBAR_TRANSLUCENT_UNTIL_SCROLL_Y);
    }

    window.addEventListener('scroll', scrollListener);

    return () => {
      window.removeEventListener('scroll', scrollListener);
    };
  }, [isNavbarTranslucent]);

  return (
    <Layout
      title={pageTitle}
      description={pageDescription}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            ${isNavbarTranslucent && `
              .navbar {
                --ifm-navbar-background-color: transparent;
                --ifm-navbar-shadow: none;
              }
            `}

            html[data-theme='dark'] {
              --ifm-background-color: #181826;
              --ifm-navbar-background-color: #181826;

              --strapi-primary-600: #4945FF;
            }

            html[data-theme='dark'] .navbar .DocSearch-Button {
              background: var(--strapi-neutral-0);
            }
          `,
        }}
      />
      <main className={clsx('font-poppins', styles.home)}>
        <Hero id="homeHero">
          <Container>
            <HeroTitle>
              {pageTitle}
            </HeroTitle>
            <HeroDescription>
              {pageDescription}
            </HeroDescription>
          </Container>
        </Hero>
        <section
          id="homeCarousel"
          className={styles.home__carousel}
        >
          <Container>
            <Carousel>
              {[
                {
                  isContentDelimited: true,
                  title: 'Can’t wait to use Strapi?',
                  description: (
                    <>
                      {'If demos are more your thing, we have a '}
                      <a href="https://youtu.be/zd0_S_FPzKg" target="_blank">video demo</a>
                      {', or you can request a '}
                      <a href="https://strapi.io/demo" target="_blank">live demo</a>!
                    </>
                  ),
                  children: (
                    <div className={styles.home__carousel__cta}>
                      <Button
                        to="/dev-docs/quick-start"
                        size="huge"
                        decorative="🚀"
                      >
                        Quick start
                      </Button>
                    </div>
                  ),
                },
                {
                  imgBgSrc: require('@site/static/img/assets/home/carousel-background--cloud.png').default,
                  isContentDelimited: true,
                  variant: 'cloud',
                  title: 'Strapi Cloud',
                  description: (
                    <>
                      {'If demos are more your thing, we have a '}
                      <a href="https://youtu.be/zd0_S_FPzKg" target="_blank">video demo</a>
                      {', or you can request a '}
                      <a href="https://strapi.io/demo" target="_blank">live demo</a>!
                    </>
                  ),
                  children: (
                    <div className={styles.home__carousel__cta}>
                      <Button
                        to="/cloud/intro"
                        size="huge"
                        decorative="☁️"
                      >
                        Strapi Cloud
                      </Button>
                    </div>
                  ),
                },
              ].map(({
                children,
                description,
                imgBgSrc,
                imgSrc,
                title,
                ...carouselItem
              }, carouselItemIndex) => (
                <CarouselSlide key={`pageHomeCarouselItem${carouselItemIndex}`}>
                  <Card {...carouselItem}>
                    {imgBgSrc && <CardImgBg src={imgBgSrc} />}
                    {title && <CardTitle as="h2">{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                    {children}
                  </Card>
                </CarouselSlide>
              ))}
            </Carousel>
          </Container>
        </section>
        <section
          id="homeCategories"
          className={styles.home__categories}
        >
          <Container>
            <div className="row row--huge">
              {[
                {
                  card: {
                    to: '/dev-docs/intro',
                    title: 'Developer Documentation',
                    description: 'All you need to get your project up-and-running, and become a Strapi expert',
                    imgSrc: require('@site/static/img/assets/home/preview--dev-docs.jpg').default,
                  },
                  linksIcon: require('@site/static/img/assets/icons/code.svg').default,
                  linksIconColor: 'green',
                  links: [
                    {
                      children: 'Installation guides',
                      to: '/dev-docs/installation',
                    },
                    {
                      children: 'Database configuration',
                      to: '/dev-docs/configurations/database',
                    },
                    {
                      children: 'Deployment guides',
                      to: '/dev-docs/deployment',
                    },
                    {
                      children: 'REST API',
                      to: '/dev-docs/api/rest',
                    },
                    {
                      children: 'GraphQL API',
                      to: '/dev-docs/api/graphql',
                    },
                  ],
                },
                {
                  card: {
                    to: '/user-docs/intro',
                    title: 'User Guide',
                    description: 'Get the most out of the admin panel with our user guide',
                    imgSrc: require('@site/static/img/assets/home/preview--user-guides.jpg').default,
                  },
                  linksIcon: require('@site/static/img/assets/icons/feather.svg').default,
                  linksIconColor: 'blue',
                  links: [
                    {
                      children: 'Getting started in the admin panel',
                      to: '/user-docs/intro#accessing-the-admin-panel',
                    },
                    {
                      children: 'Creating content-types',
                      to: '/user-docs/content-type-builder/creating-new-content-type',
                    },
                    {
                      children: 'Configuring content-types fields',
                      to: '/user-docs/content-type-builder/configuring-fields-content-type',
                    },
                    {
                      children: 'Writing content',
                      to: '/user-docs/content-manager/writing-content',
                    },
                    {
                      children: 'Setting up the admin panel',
                      to: '/user-docs/settings/managing-global-settings',
                    },
                  ],
                },
              ].map(({ card, ...categoryItem }, categoryItemIndex) => {
                const {
                  title: cardTitle,
                  description: cardDescription,
                  imgSrc: cardImgSrc,
                  ...cardRest
                } = (card || {});

                return (
                  <div
                    key={`pageHomeCategoryItem${categoryItemIndex}`}
                    className={clsx(
                      'col',
                      'col--6',
                      styles.home__categories__item,
                    )}
                  >
                    {card && (
                      <Card {...cardRest}>
                        {cardTitle && <CardTitle withArrow>{cardTitle}</CardTitle>}
                        {cardDescription && <CardDescription>{cardDescription}</CardDescription>}
                        {cardImgSrc && <CardImg src={cardImgSrc} />}
                      </Card>
                    )}
                    {categoryItem.links && (
                      <FeaturesList
                        icon={categoryItem.linksIcon}
                        iconColor={categoryItem.linksIconColor}
                        items={categoryItem.links}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
        <section
          id="homeHelpUsToImprove"
          className={styles.home__huitd}
        >
          <Container>
            <LinkWithArrow
              apart
              className={styles.home__huitd__link}
              href="https://github.com/strapi/documentation"
            >
              Help us improve the documentation
            </LinkWithArrow>
          </Container>
        </section>
      </main>
    </Layout>
  );
}
