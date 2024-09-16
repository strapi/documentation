---
title: Managing relational fields
description: Instructions to manage relation-type fields, called "relational fields", which establish a relation between two content-types.
sidebar_position: 4
tags:
- Content-type Builder
- collection type
- components
- relations
- one-choice relational fields
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Managing relational fields

Relation-type fields added to a content-type from the Content-type Builder allow establishing a relation with another collection type. These fields are called "relational fields". 

The content of relational fields is written from the edit view of the content-type they belong to (see [Writing content](writing-content.md)). However, relational fields can point to one or several entries of the other collection type, this is why in the Content Manager it is possible to manage a content-type's relational fields to choose which entries are relevant.

<details>
<summary>Example</summary>

In my Strapi admin panel I have created 2 collection types:

- Restaurant, where each entry is a restaurant
- Category, where each entry is a type of restaurant

I want to assign a category to each of my restaurants, therefore I have established a relation between my 2 collection types: restaurants can have one category.

In the Content Manager, from the edit view of my Restaurant entries, I can manage the Category relational field, and choose which entry of Category is relevant for my restaurant.
</details>

<ThemedImage
  alt="Relational fields in the edit view"
  sources={{
    light: '/img/assets/content-manager/edit-view_relational-fields2.png',
    dark: '/img/assets/content-manager/edit-view_relational-fields2_DARK.png',
  }}
/>

The relational fields of a content-type are displayed among regular fields. For each relational field is displayed a drop-down list containing all available entry titles. It allows to choose which entry the relational fields should point to. You can either choose one or several entries depending on the type of relation that was established.

:::tip
Not all entries are listed by default: more can be displayed by clicking on the **Load more** button. Also, instead of choosing an entry by scrolling the list, you can click any relational field drop-down list and type to search a specific entry.
:::

:::note
If the Draft & Publish feature (see [Saving, publishing and deleting content](saving-and-publishing-content.md)) is activated for the content-type the relational field belongs to, you will notice blue or green dots next to the entries names in the drop-down list. They indicate the status of the entry, respectively draft or published content.
:::

:::caution
If the [Internationalization plugin](/user-docs/plugins/strapi-plugins#-internationalization-plugin) is installed, the list of entries may be limited or differ from one locale to another. Only relevant entries that can possibly be chosen for a relational field will be listed.
:::

## Managing one-choice relational fields

Many-to-one, one-to-one, and one-way types of relation only allow to choose one entry per relational field.

<ThemedImage
  alt="One-choice relational fields"
  width="40%"
  sources={{
    light: '/img/assets/content-manager/RF_one-choice2.png',
    dark: '/img/assets/content-manager/RF_one-choice2_DARK.png',
  }}
/>

To select the only relevant relational field's entry:

1. In the content-type's edit view, click on the drop-down list of the relational field.
2. Among the list of entries, choose one.

:::tip
You can click on the name of the selected entry to be redirected to the edit view of the relational field's content type. Make sure you save your page first, to avoid losing your last modifications.
:::

To remove the entry selected in the drop-down list, click on the delete button ![Clear icon](/img/assets/icons/v5/Cross.svg).

## Managing multiple-choice relational fields

Many-to-many, one-to-many, and many-ways types of relation allow to choose several entries per relational field.

<ThemedImage
  alt="Multiple choices relational fields"
  width="40%"
  sources={{
    light: '/img/assets/content-manager/RF_multiple-choices2.png',
    dark: '/img/assets/content-manager/RF_multiple-choices2_DARK.png',
  }}
/>

To select the relevant relational field's entries:

1. In the content-type's edit view, click on the drop-down list of the relational field.
2. Among the list of entries, choose one.
3. Repeat step 2 until all relevant entries have been chosen.

:::tip
All selected entries are listed right below the drop-down list. Click on the name of an entry to be redirected to the edit view of the relational field's content-type. Make sure you save your page first, to avoid losing your last modifications.
:::

To remove an entry, click on the cross button ![Cross icon](/img/assets/icons/v5/Cross.svg) in the selected entries list.

Entries from multiple-choice relational fields can be reordered, indicated by a drag button ![Drag icon](/img/assets/icons/v5/Drag.svg). To move an entry, click and hold it, drag it to the desired position, then release it.
