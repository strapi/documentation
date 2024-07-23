import React from 'react';

export default {
  page: {
    title: 'Strapi 5 Documentation',
    description: 'Get set up in minutes to build any projects in hours instead of weeks.',
  },
  carousel: [
    {
      title: 'Learn what’s new in Strapi 5',
      description: (
        <>
          {'Have a quick tour of the new and updated features available in the Strapi 5 documentation!'}
        </>
      ),
      button: {
        label: 'What’s new?',
        decorative: '✨',
        to: '/dev-docs/whats-new',
      },
    },
    // {
    //   backgroundImgSrc: require('@site/static/img/assets/home/carousel-background--cloud.png').default,
    //   variant: 'cloud',
    //   title: 'Strapi Cloud CLI',
    //   description: (
    //     <>
    //       {'Learn how to deploy your project on '}
    //       <a href="https://strapi.io/cloud" target="_blank">Strapi Cloud</a>
    //       {' directly from the CLI!'}
    //     </>
    //   ),
    //   button: {
    //     label: 'Cloud CLI docs',
    //     decorative: '☁️',
    //     to: '/cloud/getting-started/deployment-cli',
    //   },
    // },
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
  ],
  categories: [
    {
      cardLink: '/user-docs/intro',
      cardTitle: 'User Guide',
      cardDescription: 'Get the most out of the admin panel with our user guide',
      cardImgSrc: require('@site/static/img/assets/home/preview--user-guides.jpg').default,
      linksIconSrc: require('@site/static/img/assets/icons/feather.svg').default,
      linksIconColor: 'blue',
      links: [
        {
          label: 'Content-Types Builder',
          to: '/user-docs/content-type-builder/creating-new-content-type',
        },
        {
          label: 'Content Manager',
          to: '/user-docs/content-manager/writing-content',
        },
        {
          label: 'Draft & Publish',
          to: '/user-docs/content-manager/saving-and-publishing-content',
        },
        {
          label: 'Releases',
          to: '/user-docs/releases/introduction',
        },
        {
          label: 'Settings',
          to: '/user-docs/settings/introduction',
        },
      ],
    },
    {
      cardLink: '/dev-docs/intro',
      cardTitle: 'Developer Docs',
      cardDescription: 'All you need to get your project up-and-running, and become a Strapi expert',
      cardImgSrc: require('@site/static/img/assets/home/preview--dev-docs.jpg').default,
      linksIconSrc: require('@site/static/img/assets/icons/code.svg').default,
      linksIconColor: 'green',
      links: [
        {
          label: 'REST API',
          to: '/dev-docs/api/rest',
        },
        {
          label: 'GraphQL API',
          to: '/dev-docs/api/graphql',
        },
        {
          label: 'Document Service API',
          to: '/dev-docs/api/document-service',
        },
        {
          label: 'Plugin CLI',
          to: '/dev-docs/plugins/guides/use-the-plugin-cli',
        },
        {
          label: 'Upgrade to Strapi 5',
          to: '/dev-docs/migration/v4-to-v5/introduction-and-faq',
        },
      ],
    },
    {
      cardLink: '/dev-docs/intro',
      cardTitle: 'Cloud Documentation',
      cardDescription: 'Learn how to deploy and manage projects on Strapi Cloud',
      cardImgSrc: require('@site/static/img/assets/home/preview--cloud-docs.png').default,
      linksIconSrc: require('@site/static/img/assets/icons/cloud.svg').default,
      linksIconColor: 'purple',
      links: [
        {
          label: 'Project creation',
          to: '/cloud/getting-started/deployment',
        },
        {
          label: 'Usage & Billing',
          to: '/cloud/getting-started/usage-billing',
        },
        {
          label: 'Project settings',
          to: '/cloud/projects/settings',
        },
        {
          label: 'Deployments management',
          to: '/cloud/projects/deploys',
        },
        {
          label: 'Profile settings',
          to: '/cloud/account/account-settings',
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
