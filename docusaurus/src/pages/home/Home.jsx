import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import styles from './home.module.scss';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {
  Button,
  Card,
  CardCta,
  CardIcon,
  CardDescription,
  CardImg,
  CardImgBg,
  CardTitle,
  Container,
  Hero,
  HeroDescription,
  HeroTitle,
  HomepageAIButton,
} from '../../components';
import Icon from '../../components/Icon';
import content from './_home.content';

const NAVBAR_TRANSLUCENT_UNTIL_SCROLL_Y = 36;

export default function PageHome() {
  const [isNavbarTranslucent, setIsNavbarTranslucent] = useState(true);
  const isBrowser = useIsBrowser();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  
  const themeColors = isDarkTheme 
    ? content.darkMode.colors 
    : content.lightMode.colors;

  useEffect(() => {
    if (isBrowser) {
      // Détecte le thème initial
      setIsDarkTheme(document.documentElement.getAttribute('data-theme') === 'dark');
      
      // Configure un observateur pour détecter les changements de thème
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'data-theme') {
            setIsDarkTheme(document.documentElement.getAttribute('data-theme') === 'dark');
          }
        });
      });
      
      observer.observe(document.documentElement, { attributes: true });
      
      return () => {
        observer.disconnect();
      };
    }
  }, [isBrowser]);

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
      wrapperClassName={isDarkTheme ? 'dark-theme-layout' : 'light-theme-layout'}
    >
      {isNavbarTranslucent && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .navbar {
                --ifm-navbar-background-color: ${isDarkTheme ? 'rgba(24, 24, 38, 0.8)' : 'transparent'};
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
              --ifm-background-color: ${themeColors.background};
              --ifm-navbar-background-color: ${themeColors.background};
              --ifm-color-primary: ${themeColors.primary};
              --ifm-heading-color: ${themeColors.text};
              --ifm-font-color-base: ${themeColors.textSecondary};
              --ifm-card-background-color: ${themeColors.cardBackground};
              --ifm-card-border-color: ${themeColors.borderColor};

              --strapi-primary-600: #4945FF;
            }

            html[data-theme='dark'] .navbar .DocSearch-Button {
              background: var(--strapi-neutral-0);
            }
            
            html[data-theme='dark'] .heroTitle, 
            html[data-theme='dark'] .heroDescription {
              color: ${themeColors.text};
            }
            
            html[data-theme='dark'] .category-cms {
              border-color: var(--ifm-card-border-color);
              background-color: var(--ifm-card-background-color);
            }
            
            html[data-theme='dark'] .category-cloud {
              border-color: var(--ifm-card-border-color);
              background-color: var(--ifm-card-background-color);
            }
            
            html[data-theme='dark'] .card-cta--dark {
              color: var(--ifm-color-primary);
            }
            
            html[data-theme='light'] {
              --ifm-background-color: ${content.lightMode.colors.background};
              --ifm-navbar-background-color: ${content.lightMode.colors.background};
              --ifm-color-primary: ${content.lightMode.colors.primary};
              --ifm-heading-color: ${content.lightMode.colors.text};
              --ifm-font-color-base: ${content.lightMode.colors.textSecondary};
              --ifm-card-background-color: ${content.lightMode.colors.cardBackground};
              --ifm-card-border-color: ${content.lightMode.colors.borderColor};
            }
          `,
        }}
      />
      <main className={clsx(styles.home, isDarkTheme ? styles.homeDark : '')}>
        <Hero id="homeHero" className={isDarkTheme ? styles.heroDark : ''}>
          <Container>
            <HeroTitle className="heroTitle">
              {content.page.title}
            </HeroTitle>
            <HeroDescription className="heroDescription">
              {content.page.description}
            </HeroDescription>
          </Container>
        </Hero>
        <HomepageAIButton className={isDarkTheme ? styles.aiButtonDark : ''} />
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
                cardIconName: categoryItemCardIconName,
                cardIconColor: categoryItemCardIconColor,
                cardCtaText: categoryItemCardCtaText,
                categoryType,
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
                    <Card 
                      categoryType={categoryType} 
                      href={categoryItemCardLink} 
                      asCallToAction
                      isDarkTheme={isDarkTheme}
                    >
                      {categoryItemCardIconName && <CardIcon name={categoryItemCardIconName} color={categoryItemCardIconColor} isDarkTheme={isDarkTheme} />}
                      {categoryItemCardTitle && <CardTitle>{categoryItemCardTitle}</CardTitle>}
                      {categoryItemCardDescription && <CardDescription>{categoryItemCardDescription}</CardDescription>}
                      {categoryItemCardLink && 
                        <CardCta 
                          asPlainContent={true} 
                          withArrow={true} 
                          to={categoryItemCardLink} 
                          text={categoryItemCardCtaText} 
                          color={categoryItemCardIconColor} 
                          className="category-card-cta"
                          isDarkTheme={isDarkTheme}
                        />
                      }
                      {isDarkTheme && categoryItem.cardImgSrcDark 
                        ? <CardImg src={categoryItem.cardImgSrcDark} isDarkTheme={isDarkTheme} /> 
                        : categoryItemCardImgSrc && <CardImg src={categoryItemCardImgSrc} isDarkTheme={isDarkTheme} />}
                    </Card>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      </main>
    </Layout>
  );
}