import React from 'react';

export default {
  page: {
    title: 'Strapi’s documentation',
    description: 'Get set up in minutes to build any projects in hours instead of weeks.',
  },
  carousel: [
    {
      title: 'Can’t wait to use Strapi?',
      description: (
        <>
          {'If demos are more your thing, we have a '}
          <a href="https://youtu.be/h9vETeRiulY" target="_blank">video demo</a>
          {', or you can request a '}
          <a href="https://strapi.io/demo" target="_blank">live demo</a>!
        </>
      ),
      button: {
        label: 'Quick start',
        decorative: '🚀',
        to: '/dev-docs/quick-start',
      },
    },
    {
      backgroundImgSrc: require('@site/static/img/assets/home/carousel-background--cloud.png').default,
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
      button: {
        label: 'Strapi Cloud',
        decorative: '☁️',
        to: '/cloud/intro',
      },
    },
  ],
  categories: [
    {
      cardLink: '/dev-docs/intro',
      cardTitle: 'Developer Documentation',
      cardDescription: 'All you need to get your project up-and-running, and become a Strapi expert',
      cardImgSrc: require('@site/static/img/assets/home/preview--dev-docs.jpg').default,
      linksIconSrc: require('@site/static/img/assets/icons/code.svg').default,
      linksIconColor: 'green',
      links: [
        {
          label: 'Installation guides',
          to: '/dev-docs/installation',
        },
        {
          label: 'Database configuration',
          to: '/dev-docs/configurations/database',
        },
        {
          label: 'Deployment guides',
          to: '/dev-docs/deployment',
        },
        {
          label: 'REST API',
          to: '/dev-docs/api/rest',
        },
        {
          label: 'GraphQL API',
          to: '/dev-docs/api/graphql',
        },
      ],
    },
    {
      cardLink: '/user-docs/intro',
      cardTitle: 'User Guide',
      cardDescription: 'Get the most out of the admin panel with our user guide',
      cardImgSrc: require('@site/static/img/assets/home/preview--user-guides.jpg').default,
      linksIconSrc: require('@site/static/img/assets/icons/feather.svg').default,
      linksIconColor: 'blue',
      links: [
        {
          label: 'Getting started in the admin panel',
          to: '/user-docs/intro#accessing-the-admin-panel',
        },
        {
          label: 'Creating content-types',
          to: '/user-docs/content-type-builder/creating-new-content-type',
        },
        {
          label: 'Configuring content-types fields',
          to: '/user-docs/content-type-builder/configuring-fields-content-type',
        },
        {
          label: 'Writing content',
          to: '/user-docs/content-manager/writing-content',
        },
        {
          label: 'Setting up the admin panel',
          to: '/user-docs/settings/managing-global-settings',
        },
      ],
    },
  ],

  /** Help us to improve the documentation */
  huitd: {
    label: 'Help us improve the documentation',
    href: 'https://github.com/strapi/documentation',
  },
};
