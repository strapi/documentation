/**
 * JSON-LD for the homepage: the documentation website, the Strapi product it
 * documents, and the Strapi organization that publishes both. Profiles and
 * the contact address are the ones listed on strapi.io (contact page footer
 * and privacy policy).
 */
const ORGANIZATION_ID = 'https://strapi.io/#organization';

export default function homeStructuredData(siteUrl, description) {
  const origin = siteUrl.replace(/\/+$/, '');

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: 'Strapi',
        url: 'https://strapi.io',
        logo: `${origin}/img/strapi-logo.png`,
        sameAs: [
          'https://github.com/strapi',
          'https://x.com/strapijs',
          'https://www.linkedin.com/company/strapi',
          'https://www.youtube.com/c/Strapi',
          'https://www.facebook.com/strapijs/',
          'https://www.instagram.com/strapijs/',
          'https://www.twitch.tv/strapijs',
          'https://discord.strapi.io',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'privacy',
          email: 'privacy@strapi.io',
          url: 'https://strapi.io/contact',
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${origin}/#software`,
        name: 'Strapi',
        alternateName: 'Strapi CMS',
        description: 'Strapi 5 is an open-source headless CMS where developers build custom applications and manage content through an extensible admin panel.',
        applicationCategory: 'DeveloperApplication',
        url: 'https://strapi.io',
        softwareHelp: { '@id': `${origin}/#website` },
        publisher: { '@id': ORGANIZATION_ID },
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        name: 'Strapi 5 Documentation',
        alternateName: 'Strapi Docs',
        description,
        url: `${origin}/`,
        inLanguage: 'en',
        about: { '@id': `${origin}/#software` },
        publisher: { '@id': ORGANIZATION_ID },
      },
    ],
  };
}
