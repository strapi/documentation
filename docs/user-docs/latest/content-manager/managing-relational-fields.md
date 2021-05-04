---
title: Managing Relational Fields - Strapi User Guide
description: Instructions to manage relation-type fields, called "relational fields", which establish a relation between two content-types.
---

# Managing relational fields

Relation-type fields added to a content-type from the Content-Types Builder allow to establish a relation with another content-type -mandatorily a collection type. These fields are called "relational fields".

Relational fields are before all else regular fields, meaning that their content is written from the edit view of the content-type they belong to (see [Writing content](writing-content.md)).

However, relational fields can point to one or several entries of the other content-type, this is why in the Content Manager it is possible to manage a content-type's relational fields to choose which entries are relevant.

::: details Example
In my Strapi admin panel I have created 2 collection types:

- Restaurant, where each entry is a restaurant
- Category, where each entry is a type of restaurant

I want to assign a category to each of my restaurants, therefore I have established a relation between my 2 collection types: restaurants can have one category.

In the Content Manager, from the edit view of my Restaurant entries, I can manage the Category relational field, and choose which entry of Category is relevant for my restaurant.
:::

![Relational fields box in the edit view](../assets/content-manager/edit-view_relational-fields.png)

The relational fields of a content-type are managed from the Relational fields box, located in the right side of the edit view interface. It lists the names of the relational fields. Under each relational field name is displayed a drop-down list containing all available entry titles.

The Relational fields box allows to choose which entries the relational fields should point to. You can either choose one or several entries depending on the type of relation that was established.

::: tip 💡 TIP
Instead of choosing an entry by scrolling the list, you can click any drop-down list from the Relational fields box and type to search a specific entry.
:::

::: tip NOTE
If the Draft & Publish feature (see [Saving, publishing and deleting content](saving-and-publishing-content.md)) is activated for the content-type the relational field belongs to, you will notice blue or green dots next to the entries names in the drop-down list. They indicate the status of the entry, respectively draft or published content.
:::

::: warning IMPORTANT
If the [Internationalization plugin](/user-docs/latest/plugins/strapi-plugins.md#internationalization-plugin) is installed, the list of entries may be limited or differ from one locale to another. Only relevant entries that can possibly be chosen for a relational field will be listed.
:::

## Managing one-choice relational fields

Many-to-one, one-to-one, and one-way types of relation only allow to choose one entry per relational field.

<img src="../assets/content-manager/RF_one-choice.png" alt="One-choice relational fields" width="45%">

To select the only relevant relational field's entry:

1. In the Relational fields box of your content-type's edit view, click on the drop-down list of the relational field.
2. Among the list of entries, choose one.

::: tip 💡 TIP
Click on **Details** to be redirected to the edit view of the content-type the relational field originally belongs to. Make sure you save your page first, to avoid losing your last modifications.
:::

To remove the entry selected in the drop-down list, click on the ![icon delete](../assets/content-manager/icon_delete6.png) button.

## Managing multiple-choices relational fields

Many-to-many, one-to-many, and many-ways types of relation allow to choose several entries per relational field.

<img src="../assets/content-manager/RF_multiple-choices.png" alt="Multiple choices relational fields" width="40%">

To select the relevant relational field's entries:

1. In the Relational fields box of your content-type's edit view, click on the drop-down list of the relational field.
2. Among the list of entries, choose one.
3. Repeat step 2 until all relevant entries have been chosen.

::: tip 💡 TIP
All selected entries are listed right below the drop-down list. Click on the name of an entry to be redirected to the edit view of the content-type the relational field originally belongs to.
:::

To remove an entry, click on the ![icon delete](../assets/content-manager/icon_delete5.png) button in the selected entries list.
