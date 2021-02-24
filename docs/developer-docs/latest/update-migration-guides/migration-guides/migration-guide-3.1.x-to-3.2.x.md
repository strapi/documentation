# Migration guide from 3.1.x to 3.2.3

**Make sure your server is not running until the end of the migration**

:::warning
If you are using **extensions** to create custom code or modifying existing code, you will need to update your code and compare your version to the new changes on the repository.
<br>
Not updating your **extensions** can break your app in unexpected ways that we cannot predict.
:::

## Disclaimer

This version requires some migration in the following cases:

- You are using a `published_at` field in some of your models.
- You followed the [Scheduled publication guide](/developer-docs/latest/guides/scheduled-publication.md) and used a `published_at` field.
- You have extended the **Strapi-admin** **admin/src/translations/index.js**, so you have a `./admin/src/translations/index.js`

Otherwise you can follow the basic [version update guide](/developer-docs/latest/update-migration-guides/update-version.md).

## Migration

**Draft & Publish**

The new **Draft & Publish** feature will add a `published_at` field to your **content types** if you enable the feature.
If you have been using this field name on your **content types** you will need to first rename or delete it before being able to use the feature on those **content types**.

**Strapi-admin Translations**

If you have customized the admin's translation system, you will need to add the `languageNativeNames` object in `/admin/src/translations/index.js`.

_Before_:

```js
import en from './en.json';
import fr from './fr.json';

const trads = {
  en,
  fr,
};

export default trads;
```

_After_:

```js
import en from './en.json';
import fr from './fr.json';

const trads = {
  en,
  fr,
};

export const languageNativeNames = {
  en: 'English',
  fr: 'Français',
};

export default trads;
```
