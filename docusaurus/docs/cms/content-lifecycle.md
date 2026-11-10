---
title: Write, translate, and release content
description: Follow a blog post from its first draft to a release, then check what the Audit Logs recorded.
displayed_sidebar: cmsSidebar
tags:
- guides
- content manager
- internationalization
- releases
- audit logs
---

# Write, translate, and release content

<Tldr>
This guide follows a blog post through the admin panel. You write it, translate it into French, and add both versions to a release that allows partial publication. Then you check what the Audit Logs recorded.
</Tldr>

Several features of the admin panel work together on the same entry. The [Content Manager](/cms/features/content-manager) creates it and [Internationalization](/cms/features/internationalization) translates it. [Releases](/cms/features/releases) publish its versions together, and [Audit Logs](/cms/features/audit-logs) keep track of who did what. This guide uses an Article collection type and a blog post about black holes as an example.

:::prerequisites
- An Article collection type with `title`, `description`, and `slug` fields, with [Internationalization enabled](/cms/features/internationalization#content-type-builder) and [Draft & Publish](/cms/features/draft-and-publish) enabled.
- A French locale, added from the [Internationalization settings](/cms/features/internationalization#adding-a-new-locale).
- A <GrowthBadge /> or <EnterpriseBadge /> plan for Releases, and an <EnterpriseBadge /> plan for Audit Logs.
- A Strapi version that supports partial releases, for the *Release mode* option.
<!-- TODO: Add the Strapi version that introduces partial releases once strapi/strapi#28339 is released. -->
:::

<InteractiveDemo id="content-lifecycle" />

## Write the blog post

**Path:** <Icon name="feather" /> Content Manager

1. Click *Article* in the list of collection types.
2. Click **Create new entry**.
3. Fill in the *title* field, for example `Black holes, explained`, and the *description* field.
4. Click the <Icon name="arrow-clockwise" /> button of the *slug* field to generate the slug from the title.
5. Click **Save**.

The blog post is saved in English, the default locale, as a draft.

## Translate the blog post into French

1. In the locales dropdown at the top right of the edit view, choose *Create French (fr) locale*.
2. Fill in the *title* and *description* fields in French, for example `Les trous noirs, expliqués`.
3. Click **Save**.

The blog post now exists in English and in French. Each version is a draft.

## Add the blog post to a release

### Create a release that allows partial publication

**Path:** <Icon name="paper-plane-tilt" /> Releases

1. Click **New Release**.
2. Type a *Release name*, for example `Space Week`.
3. Tick *I don't have a release date yet* to publish the release manually. To schedule it instead, leave the box unticked and select the date, time, and timezone for publication.
4. In the *Release mode* area, choose *Release all ready items*: when the release is published, entries that are ready are published and the others are skipped. With the default mode, *Require every entry to be ready*, a single entry that is not ready blocks the whole release.
5. Click **Create release**.

### Add both versions to the release

**Path:** <Icon name="feather" /> Content Manager

A release contains locales separately: add the French and the English versions one after the other.

1. Open the French version of the blog post.
2. In the *Entry* area, click <Icon name="dots-three-outline" />.
3. Choose *Add to release*.
4. Select the `Space Week` release in the dialog. Keep the default *Publish* action.
5. Click **Continue**. The *Releases* area of the edit view now lists the release.
6. In the locales dropdown, choose *English (en)* and repeat steps 2 to 5 for the English version.

## Check what the Audit Logs recorded

**Path:** <Icon name="gear-six" /> Settings > Administration Panel - Audit Logs

1. Look at the most recent logs, at the top of the list. The actions of this guide appear newest first: *Create entry (article)* for each locale, *Create release*, and *Add entry to release* for each locale.
2. Click the <Icon name="eye" /> button of a log to display its details: the action, its date, the user who performed it, and the payload, which contains the data of the entry or release.

## Validation

- In <Icon name="paper-plane-tilt" /> Releases, the `Space Week` release lists both versions of the blog post with the `Ready` status.
- In the Audit Logs, each action of this guide has its own log, with your name in the *User* column.

## Next steps

- [Publish the release](/cms/features/releases#publishing-a-release) manually, or [schedule it](/cms/features/releases#scheduling-a-release).
- Learn about [the events recorded by the Audit Logs](/cms/features/audit-logs#understanding-log-details) and how to filter them.
- Add [Review Workflows](/cms/features/review-workflows) to have the blog post reviewed before it is released.
