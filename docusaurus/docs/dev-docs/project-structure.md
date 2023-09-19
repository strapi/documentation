---
title: Project structure
displayed_sidebar: devDocsSidebar
description: Discover the project structure of any default Strapi application.

---

import InteractiveProjectStructure from '@site/src/components/ProjectStructure.js'

# Project structure

:::note
If the Strapi project was created with the [starter CLI](https://strapi.io/blog/announcing-the-strapi-starter-cli), its structure includes both a `frontend` and `backend` folder, where the `backend` folder has the default structure.

<details>
<summary> Structure of a project created with the starter CLI</summary>

```sh
my-project
├─── frontend # starter folder
├─── backend  # template folder, has the default structure of a project
└─── node_modules
```

</details>

:::

The default structure of a Strapi project created without the starter CLI depends on whether the project was created with vanilla JavaScript or with [TypeScript](/dev-docs/typescript), and looks like the following:

<InteractiveProjectStructure />
