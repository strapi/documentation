---
title: Project structure
displayed_sidebar: devDocsSidebar
description: Discover the project structure of any default Strapi application.
tags:
- project structure
- typescript
---

import InteractiveProjectStructure from '@site/src/components/ProjectStructure.js'
import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Project structure

<NotV5 />

<!-- :::note
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

::: -->

The structure of a Strapi project depends on whether the project was created with [TypeScript](/dev-docs/typescript) (which is the default if you used the `--quickstart` option while creating the project) or with vanilla JavaScript, and looks like the following:

<InteractiveProjectStructure />
