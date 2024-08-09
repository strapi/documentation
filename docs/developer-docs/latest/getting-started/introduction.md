---
title: Strapi Developer Documentation
description: This documentation contains all technical documentation related to the setup, deployment, update and customization of your Strapi application.
---

# Welcome to the Strapi developer documentation!

This documentation contains all technical documentation related to the setup, deployment, update and customization of your Strapi application.


::: caution
Strapi v3 has reached end-of-life. We encourage you to upgrade to Strapi v4, documented at [docs.strapi.io](https://docs.strapi.io).
:::


::: strapi  Can't wait to start using Strapi?
You can directly head to the [Quick Start](quick-start.md)! <br> If demos are more your thing, we have a [video demo](https://youtu.be/zd0_S_FPzKg), or you can request a [live demo](https://strapi.io/demo)!
:::

The original purpose of the project was to help Boot**strap** your **API**: that's how Strapi was created. Now, Strapi is an open-source headless CMS that gives developers the freedom to choose their favorite tools and frameworks and allows editors to manage and distribute their content using their application's admin panel. Based on a plugin system, Strapi is a flexible CMS whose admin panel and API are extensible - and which every part is customizable to match any use case. Strapi also has a built-in user system to manage in detail what the administrators and end-users have access to.

## Open-source & Contribution

Strapi is an open-source project (see [LICENSE](https://github.com/strapi/strapi/blob/master/LICENSE) file for more information). The core project, as well as the documentation and any related tool can be found in the [Strapi](https://github.com/strapi) GitHub organization.

As it goes hand in hand with the open-source ecosystem, Strapi is open to contributions. The Strapi team appreciates every contribution, be it a feature request, bug report, or pull request. The following GitHub repositories are open-source and contributions-friendly:

- [`strapi/strapi`](https://github.com/strapi/strapi): main repository of Strapi, which contains the core of the project. You can find the admin panel, core plugins, plugin providers, and the whole code that runs your Strapi application. Please read the [`CONTRIBUTING.md`](https://github.com/strapi/strapi/blob/master/CONTRIBUTING.md) file to have more information about contributions to the main repository.
- [`strapi/documentation`](https://github.com/strapi/documentation): contains the whole documentation of Strapi. Please read the [contribution guide](https://github.com/strapi/documentation/blob/main/CONTRIBUTING.md) to have more information about contributions to the Strapi documentation.
- [`strapi/buffet`](https://github.com/strapi/buffet): [Buffet](https://buffetjs.io) is the component library that is used in the admin panel. It brings consistency between the different admin plugins.
- [`strapi/strapi-docker`](https://github.com/strapi/strapi-docker): contains the code used to generate the official Docker images for Strapi (available through our [Docker Hub](https://hub.docker.com/r/strapi/strapi)).
- [`strapi/awesome-strapi`](https://github.com/strapi/awesome-strapi): contains everything the community built and all managed plugins. It is used as a central place to find and submit new packages such as plugins, middlewares, hooks, and general enhancements to the core of Strapi.


## Strapi Community

Strapi is a community-oriented project with an emphasis on transparency. The Strapi team has at heart to share their vision and build the future of Strapi with the Strapi community. This is why the [roadmap](https://portal.productboard.com/strapi) is open: as all insights are very important and will help steer the project in the right direction, any community member is most welcome to share ideas and opinions there.

Community members also take great part in providing the whole community a plethora of resources about Strapi. You can find [tutorials](https://strapi.io/tutorials/) on the Strapi website, where you can also create your own. Also, as an open-source project, the technical documentation of Strapi is open to contributions (see [Open-source & Contribution](#open-source-contribution)).

::: strapi Want to join the community?
You can join [GitHub](https://github.com/strapi/strapi) and the [forum](https://forum.strapi.io/) and share your ideas and opinions with other community members and members of the Strapi team. If you're looking for news and updates about Strapi, [Twitter](https://twitter.com/strapijs) and the [blog](https://strapi.io/blog) are pretty good places to start!
:::


## Support

Strapi is offered as free and open-source for users who wish to self-host the software. When having an issue or a question, the [forum](https://forum.strapi.io) is great first place to reach out for help. Both the Strapi community and core developers often check this platform and answer posts.

For enterprise support, please see our [Enterprise Support platform](https://support.strapi.io/support/home), please note that you will need to have an active enterprise license to place tickets.
