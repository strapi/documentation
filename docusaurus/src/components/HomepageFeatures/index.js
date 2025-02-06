import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Content Manager',
    Svg: require('@site/static/img/persona1.svg').default,
    description: (
      <>
        Learn how to play with Strapi's Admin Panel and quickly build and add content by reading the User Guide.
      </>
    ),
    link: '/docs/cms/intro'
  },
  {
    title: 'Developer',
    Svg: require('@site/static/img/persona2.svg').default,
    description: (
      <>
        Learn how to setup and customize Strapi's core, create plugins, and more by reading the Developer Documentation.
      </>
    ),
    link: '/docs/'
  },
  {
    title: 'API consumer',
    Svg: require('@site/static/img/persona3.svg').default,
    description: (
      <>
        Learn how to consume Strapi's REST APIs by reading our API reference documentation.
      </>
    ),
    link: '/docs/cms/api/rest'
  },
];

function Feature({Svg, title, description, link}) {
  return (
      <div className={clsx('col col--4')}>
        <div className="text--center">
          <Svg className={styles.featureSvg} role="img" />
        </div>
        <div className="text--center padding-horiz--md">
          <h3><a href={link}>{title}</a></h3>
          <p>{description}</p>
        </div>
      </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
