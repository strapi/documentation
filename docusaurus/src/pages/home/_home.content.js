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
          <a href="https://youtu.be/zd0_S_FPzKg" target="_blank">video demo</a>
          {', or you can request a '}
          <a href="https://strapi.io/demo" target="_blank">live demo</a>!
        </>
      ),
      button: {
        children: 'Quick start',
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
        children: 'Strapi Cloud',
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
      cardLink: '/user-docs/intro',
      cardTitle: 'User Guide',
      cardDescription: 'Get the most out of the admin panel with our user guide',
      cardImgSrc: require('@site/static/img/assets/home/preview--user-guides.jpg').default,
      linksIconSrc: require('@site/static/img/assets/icons/feather.svg').default,
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
  ],

  /** Help us to improve the documentation */
  huitd: {
    children: 'Help us improve the documentation',
    href: 'https://github.com/strapi/documentation',
  },
};
