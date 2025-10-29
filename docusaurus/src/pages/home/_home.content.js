import React from 'react';

export default {
  page: {
    title: 'Strapi 5 Docs',
    description: 'Get set up in minutes to build any project in hours instead of weeks.',
  },
  newsTicker: [
    {
      icon: 'heart',
      text: 'Docs Contribution Program: Improve the docs and get rewarded!',
      link: 'https://strapi.notion.site/Documentation-Contribution-Program-1d08f359807480d480fdde68bb7a5a71?pvs=74'
    },
    // {
    //   icon: 'hand-heart',
    //   text: 'Feedback wanted: Take our documentation survey',
    //   link: 'https://docs.google.com/forms/d/e/1FAIpQLSceA85j2C5iGcAhDUPkezy408JI4jjUQgS5SfEm8obnqTY2Hw/viewform',
    // },
    {
      icon: 'newspaper-clipping',
      text: 'New Docs release - See what\'s new this week',
      link: '/release-notes#6100',
    },
  ],
  carousel: [
    {
      title: "Can't wait to use Strapi?",
      description: (
        <>
          {'Learn Strapi in a nutshell with our '}
          <a href="https://docs.strapi.io/cms/quick-start" target="_blank">quick start guide</a>
          {', or request a '}
          <a href="https://strapi.io/demo" target="_blank">live demo</a>!
        </>
      ),
      button: {
        label: 'Quick start',
        decorative: '🚀',
        to: '/cms/quick-start',
      },
    },
    {
      title: "Learn what's new in Strapi 5",
      description: (
        <>
          {'Have a quick tour of the new and updated features available in the Strapi 5 documentation!'}
        </>
      ),
      button: {
        label: "What's new?",
        decorative: '✨',
        to: '/whats-new',
      },
    },
    {
      backgroundImgSrc: require('@site/static/img/assets/home/carousel-background--cloud.png').default,
      variant: 'cloud',
      title: 'Strapi Cloud CLI',
      description: (
        <>
          {'Learn how to deploy your project on '}
          <a href="https://strapi.io/cloud" target="_blank">Strapi Cloud</a>
          {' directly from the CLI!'}
        </>
      ),
      button: {
        label: 'Cloud CLI docs',
        decorative: '☁️',
        to: '/cloud/getting-started/deployment-cli',
      },
    },
  ],
  categories: [
    {
      categoryType: "cms",
      cardLink: '/cms/intro',
      cardIconName: 'feather',
      cardIconColor: '#7B79FF',
      cardTitle: 'CMS docs',
      cardDescription: 'Learn how to set up, configure, use, and customize the Strapi headless CMS',
      cardCtaText: 'Read CMS docs',
      cardImgSrc: require('@site/static/img/assets/home/cms-screenshot-for-homepage.png').default,
      cardImgSrcDark: require('@site/static/img/assets/home/cms-screenshot-for-homepage_DARK.png').default, // Optionally use a darker version of the image
      linksIconSrc: require('@site/static/img/assets/icons/feather.svg').default,
      linksIconColor: 'blue',
      links: [
        {
          label: 'Installation',
          to: '/cms/installation',
        },
        {
          label: 'Content Manager',
          to: '/cms/features/content-manager',
        },
        {
          label: 'Content-type Builder',
          to: '/cms/features/content-type-builder',
        },
        {
          label: 'APIs',
          to: '/cms/api/content-api',
        },
        {
          label: 'Customization',
          to: '/cms/customization',
        },
      ],
    },
    {
      categoryType: "cloud",
      cardLink: '/cloud/intro',
      cardIconName: 'cloud',
      cardIconColor: '#66B7F1',
      cardTitle: 'Cloud docs',
      cardDescription: 'Learn how to deploy and manage your Strapi projects hosted on Strapi Cloud',
      cardCtaText: 'Read Cloud docs',
      cardImgSrc: require('@site/static/img/assets/home/cloud-screenshot-for-homepage.png').default,
      cardImgSrcDark: require('@site/static/img/assets/home/cloud-screenshot-for-homepage_DARK.png').default, // Optionally use a darker version of the image
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
  
  // Ajout des palettes de couleurs pour le mode sombre
  darkMode: {
    colors: {
      primary: '#4945FF',
      background: '#181826',
      cardBackground: '#232338',
      text: '#FFFFFF',
      textSecondary: '#A5A5BA',
      borderColor: '#2F2F47',
    }
  },
  
  // Palettes pour le mode clair
  lightMode: {
    colors: {
      primary: '#4945FF',
      background: '#FFFFFF',
      cardBackground: '#F5F5F5',
      text: '#000000',
      textSecondary: '#666666',
      borderColor: '#EEEEEE',
    }
  }
};
