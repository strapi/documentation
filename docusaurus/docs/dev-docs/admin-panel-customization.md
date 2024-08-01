---
title: Admin panel customization
description: The administration panel of Strapi can be customized according to your needs, so you can make it reflect your identity.
toc_max_heading_level: 4
tags:
- admin panel 
- admin panel customization
---

# Admin panel customization

Strapi's admin panel is a React-based single-page application. It encapsulates all the features and installed plugins of a Strapi application. Some of its aspects can be [customized](#customization-options), and plugins can also [extend](#extension) it.

## Customization options

Customizing the admin panel is helpful to better reflect your brand identity or to modify some default Strapi behavior. Various customization options are available, and depending on what you want to achieve, you might go to different places, as summarized in the following table:

| Customization options | How to customize it | Related documentation |
|---------------------------|-----------------------|-----------------------|
| <ul><li>Update the access URL</li><li>Update host and port</li></ul>  | By updating the <code>config/admin.ts&#124;js</code> file | [Access URL, host, and port configuration](/dev-docs/admin-panel-customization/url-host-port) |
| <ul><li>Replace the logos and favicon</li><li>Define locales and extend translations</li><li>Extend the theme</li><li>Disable video tutorials or notifications about new Strapi releases</li></ul> | By updating the <code>src/admin/app.ts&#124;js</code> file | |
| Replace or customize the WYSIWYG editor | | |
| Customize the email templates | Users and Permissions plugin | |
