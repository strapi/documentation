module.exports = {
	title: 'Strapi User Guide',
	port: 8080,
	description: 'The headless CMS developers love.',
	base: '/documentation/user-docs/',
	plugins: {
		'@vuepress/medium-zoom': {},
		'vuepress-plugin-element-tabs': {},
		'@vuepress/google-analytics': {
			ga: 'UA-54313258-1',
		},
		seo: {
			siteTitle: (_, $site) => $site.title,
			title: ($page) => $page.title,
		},
	},
	head: [
		[
			'link',
			{
				rel: 'icon',
				href: 'https://strapi.io/assets/favicon-32x32.png',
			},
		],

		[
			'meta',
			{
				property: 'og:title',
				content: 'Strapi User Guide',
			},
		],
		[
			'meta',
			{
				property: 'og:type',
				content: 'article',
			},
		],
		[
			'meta',
			{
				property: 'og:url',
				content: 'https://strapi.io/documentation/user-docs/',
			},
		],
		[
			'meta',
			{
				property: 'og:description',
				content: 'The headless CMS developers love.',
			},
		],
		[
			'meta',
			{
				property: 'og:image',
				content: 'https://strapi.io/documentation/user-docs/assets/meta.png',
			},
		],
		[
			'meta',
			{
				property: 'og:article:author',
				content: 'strapi',
			},
		],

		[
			'meta',
			{
				property: 'twitter:card',
				content: 'summary_large_image',
			},
		],
		[
			'meta',
			{
				property: 'twitter:url',
				content: 'https://strapi.io/documentation/user-docs/',
			},
		],
		[
			'meta',
			{
				property: 'twitter:site',
				content: '@strapijs',
			},
		],
		[
			'meta',
			{
				property: 'twitter:title',
				content: 'Strapi User Documentation',
			},
		],
		[
			'meta',
			{
				property: 'twitter:description',
				content: 'The headless CMS developers love.',
			},
		],
		[
			'meta',
			{
				property: 'twitter:image',
				content: 'http://strapi.io/assets/images/strapi-website-preview.png',
			},
		],
	],
	themeConfig: {
		logo: '/assets/logo.png',
		nav: [
			{
				text: 'Strapi Version',
				items: [
					{
						text: 'Latest',
						link: '/latest/',
					},
				],
			},
			{
				text: 'Documentation',
				items: [
					{
						text: 'Developer Docs',
						items: [
							{
								text: 'Getting Started',
								link:
									'https://strapi.io/documentation/developer-docs/latest/getting-started/introduction.html',
							},
							{
								text: 'Content API',
								link:
									'https://strapi.io/documentation/developer-docs/latest/content-api/parameters.html',
							},
							{
								text: 'Configuration',
								link:
									'https://strapi.io/documentation/developer-docs/latest/concepts/configurations.html',
							},
						],
					},
					{
						text: 'User Guide',
						items: [
							{
								text: 'Getting Started',
								link: '/latest/getting-started/introduction.html',
							},
							{
								text: 'Content Manager',
								link: '/latest/content-manager/introduction-to-content-manager.html',
							},
							// {
							// 	text: 'Content-Types Builder',
							// 	link: '',
							// },
							// {
							// 	text: 'Users, Roles, and Permissions',
							// 	link: '',
							// },
							// {
							// 	text: 'Plugins',
							// 	link: '',
							// },
							// {
							// 	text: 'Settings',
							// 	link: '',
							// },
						],
					},
				],
			},
			{
				text: 'Ecosystem',
				items: [
					{
						text: 'Strapi',
						items: [
							{
								text: 'Website',
								link: 'https://strapi.io',
							},
							{
								text: 'Blog',
								link: 'https://strapi.io/blog',
							},
						],
					},
					{
						text: 'Community',
						items: [
							{
								text: 'Forum',
								link: 'https://forum.strapi.io',
							},
							{
								text: 'Slack',
								link: 'https://slack.strapi.io',
							},
							{
								text: 'Awesome-Strapi',
								link: 'https://github.com/strapi/awesome-strapi',
							},
						],
					},
					{
						text: 'Resources',
						items: [
							{
								text: 'Tutorials',
								link: 'https://strapi.io/tutorials',
							},
							{
								text: 'Academy',
								link: 'https://academy.strapi.io/',
							},
						],
					},
				],
			},
		],
		repo: 'strapi/documentation',
		docsDir: 'user-docs',
		docsBranch: 'documentation',
		algolia: {
			apiKey: 'a93451de224096fb34471c8b8b049de7',
			indexName: 'strapi',
		},
		editLinks: true,
		editLinkText: 'Improve this page',
		serviceWorker: true,
		sidebarDepth: 2,
		sidebar: {
      '/latest/': [
        {
          collapsable: false,
          title: '',
          children: [
            ['/latest/getting-started/introduction', 'Welcome to the Strapi user guide!'],
          ],
        },
        {
          collapsable: false,
          title: 'Content Manager',
          children: [
            ['/latest/content-manager/introduction-to-content-manager', 'Introduction to the Content Manager'],
            ['/latest/content-manager/configuring-view-of-content-type', 'Configuring the view of a content type'],
            ['/latest/content-manager/writing-content', 'Writing content'],
            ['/latest/content-manager/managing-relational-fields', 'Managing relational fields'],
            ['/latest/content-manager/saving-and-publishing-content', 'Saving, publishing and deleting content'],
          ],
        },
        {
          collapsable: false,
          title: 'Content-Types Builder',
          children: [
            ['/latest/content-types-builder/introduction-to-content-types-builder', 'Introduction to the Content-Types Builder'],
          ],
        },
        {
          collapsable: false,
          title: 'Users, roles & permissions',
          children: [
            ['/latest/users-roles-permissions/introduction-to-users-roles-permissions', 'Introduction to users, roles & permissions'],
          ],
        },
        {
          collapsable: false,
          title: 'Plugins',
          children: [
            ['/latest/plugins/introduction-to-plugins', 'Introduction to plugins'],
          ],
        },
      ],
    }
  },
};
