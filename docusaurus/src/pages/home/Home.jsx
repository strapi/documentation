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
import content from './_home.content';

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

    scrollListener();
    window.addEventListener('scroll', scrollListener);

    return () => {
      window.removeEventListener('scroll', scrollListener);
    };
  }, []);

  return (
    <Layout
      title={content.page.title}
      description={content.page.description}
    >
      {isNavbarTranslucent && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .navbar {
                --ifm-navbar-background-color: transparent;
                --ifm-navbar-shadow: none;
              }
            `
          }}
        />
      )}
      <style
        dangerouslySetInnerHTML={{
          __html: `
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
              {content.page.title}
            </HeroTitle>
            <HeroDescription>
              {content.page.description}
            </HeroDescription>
          </Container>
        </Hero>
        <section
          id="homeCarousel"
          className={styles.home__carousel}
        >
          <Container>
            <Carousel>
              {content.carousel.map(({
                backgroundImgSrc: carouselCardBackgroundImgSrc,
                title: carouselCardTitle,
                description: carouselCardDescription,
                button: carouselCardButtonProps,
                ...carouselCardRest
              }, carouselItemIndex) => (
                <CarouselSlide key={`pageHomeCarouselItem${carouselItemIndex}`}>
                  <Card isContentDelimited {...carouselCardRest}>
                    {carouselCardBackgroundImgSrc && (
                      <CardImgBg src={carouselCardBackgroundImgSrc} />
                    )}
                    {carouselCardTitle && (
                      <CardTitle as="h2">{carouselCardTitle}</CardTitle>
                    )}
                    {carouselCardDescription && (
                      <CardDescription>{carouselCardDescription}</CardDescription>
                    )}
                    {carouselCardButtonProps && (
                      <div className={styles.home__carousel__cta}>
                        <Button size="huge" {...carouselCardButtonProps}>
                          {carouselCardButtonProps.children || carouselCardButtonProps.label}
                        </Button>
                      </div>
                    )}
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
              {content.categories.map(({
                cardTitle: categoryItemCardTitle,
                cardDescription: categoryItemCardDescription,
                cardImgSrc: categoryItemCardImgSrc,
                cardLink: categoryItemCardLink,
                ...categoryItem
              }, categoryItemIndex) => {
                return (
                  <div
                    key={`pageHomeCategoryItem${categoryItemIndex}`}
                    className={clsx(
                      'col',
                      'col--6',
                      styles.home__categories__item,
                    )}
                  >
                    <Card to={categoryItemCardLink}>
                      {categoryItemCardTitle && <CardTitle withArrow>{categoryItemCardTitle}</CardTitle>}
                      {categoryItemCardDescription && <CardDescription>{categoryItemCardDescription}</CardDescription>}
                      {categoryItemCardImgSrc && <CardImg src={categoryItemCardImgSrc} />}
                    </Card>
                    {categoryItem.links && (
                      <FeaturesList
                        icon={categoryItem.linksIconSrc}
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
          id="homeHelpUsImproveTheDocumentation"
          className={styles.home__huitd}
        >
          <Container>
            <LinkWithArrow
              apart
              className={styles.home__huitd__link}
              {...content.huitd}
            >
              {content.huitd.label}
            </LinkWithArrow>
          </Container>
        </section>
      </main>
    </Layout>
  );
}
