---
title: Admin panel customization
description: The administration panel of Strapi can be customized according to your needs, so you can make it reflect your identity.
toc_max_heading_level: 4
tags:
- admin panel 
- admin panel customization
---

# Admin panel customization

The front-end part of Strapi is called the admin panel. The admin panel presents a graphical user interface to help you structure and manage the content that will be accessible through the Content API. The admin panel is a React-based single-page application that encapsulates all the features and installed plugins of a Strapi application.

Admin panel customization is a broad topic in Strapi and covers the following aspects:

- Some parts of the admin panel can be customized to better reflect your brand identity or to modify some default Strapi behaviors.
- Some other parts of the admin panel, such as the WYSIWYG editor and the bundler, can be replaced.
- The admin panel can also be extended to add new features or customize the existing user interface.

Depending on what you want to achieve, you might need to update different parts of Strapi, as summarized in the following table:

| Customization use case | How to customize it | Related documentation |
|---------------------------|-----------------------|-----------------------|
| Update the admin panel's host, port, and path  | By updating the code of the <code>config/admin.ts&#124;js</code> file | [ Host, port, and path configuration](/cms/admin-panel-customization/host-port-path) |
| <ul><li>Replace the logos and favicon</li><li>Disable video tutorials or notifications about new Strapi releases</li><li>Define locales and extend translations</li><li>Extend the theme</li></ul> | By updating the code of the <code>src/admin/app.ts&#124;js</code> file | [Customization options](/cms/admin-panel-customization/options) |
| Choose and configure a bundler | By writing some code in dedicated configuration files found in the `src/admin` folder | [Bundlers](/cms/admin-panel-customization/bundlers) |
| Replace or customize the WYSIWYG editor | _(Various strategies available, see related documentation)_ | [WYSIWYG editor](/cms/admin-panel-customization/wysiwyg-editor) |
| Extend the admin panel | _(Various strategies available, see related documentation)_ | [Extension](/cms/admin-panel-customization/extension) |
| Deploy the admin panel | _(Various strategies available, see related documentation)_ | [Deployment](/cms/admin-panel-customization/deployment) |
| Customize the email templates | Directly from the admin panel through the settings for the Users & Permissions plugin | [User Guide for the Users&nbsp;&&nbsp;Permissions plugin](/cms/settings/configuring-users-permissions-plugin-settings#configuring-email-templates) |
