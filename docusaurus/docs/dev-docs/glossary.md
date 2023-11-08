---
title: Glossary
# description: todo
displayed_sidebar: devDocsSidebar
---

# Glossary

## Application

An application is a unique Strapi instance. It's a set of *Content Types*, components, settings, data, and an *Administration Panel*.

→ Example: FoodAdvisor

## Releases

Releases are a way to plan and schedule the publication of a set of documents’ drafts. A release can be *Pending, Scheduled, or Published*.

→ Example: New Year’s Eve event

## Document

A document contains all the variations (draft / published, i18N locales) of a unique piece of content across locales and publication state.

→ Example: One restaurant / one article with all the dimensions

## Publication state

The publication state can be *Draft* or *Published*. A Document can contain only one Published entry and/or one Draft entry.

## Document Locale

A document locale is the content of a Document created for a specific locale.

→ Example: One restaurant in a specific locale, with multiple entries, published or not

## Content History

The content history is the ability to see all the updates made by someone within a field within an entry (when, who, what) and to restore the entry to a previous state.

## Entry

An entry is a specific variation of a Document’s content across locales and publication state.

→ Example: One restaurant in a specific locale, either the published version or the draft version

## Content Type

A content type is the description/blueprint of a content structure. The structure is composed of attributes.

## Attribute

An attribute is the description of a field.

## Field

A field is the most basic unit of content.

## Plugin

A plugin is a package that can be installed or uninstalled from a Strapi application. Some plugins can be pre-installed. It allows adding new features, or extending existing ones.

## Collection Type

A collection type contains several documents.

## Single Type

A single type contains a single document.

## Relation

A relation allows linking documents together.

## Component

A component is the blueprint of a reusable content structure that can be used inside Content Types.

## Component Attribute

A component attribute is the use of a component inside a specific Content Type.

## Dynamic Zone

A dynamic zone is a combination of components that can be added to content-types. It allows the creation of flexible content in the Content Manager.

## Schema

A schema is the blueprint of a ContentType or a Component.

## Content Type Builder

The content type builder is the feature where users can manage the blueprints of Content Types or Components (the schemas).

## Link

A link is a uni-directional relation.
