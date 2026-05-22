---
name: coverage
description: "Audit the documentation coverage of a Strapi feature or module: list what is documented vs missing."
argument-hint: "<feature or module name>"
user-invocable: true
---

# /inki:coverage — feature documentation gap audit

## Step 1: Identify the feature

`$ARGUMENTS` is a Strapi feature name (e.g., "Users & Permissions plugin", "Document Service API"). Resolve to a set of source files in a local checkout of `strapi/strapi` (or, if absent, in a local checkout of `strapi/strapi-docs-product-merger`). Ask the user for the local path if neither is available.

## Step 2: Enumerate the public surface

List the public APIs, methods, hooks, configuration options, and CLI commands of the feature.

## Step 3: Cross-reference with docs

For each public element, search `docusaurus/docs/cms` and `docusaurus/docs/cloud` for mentions. Bucket as:
- documented
- partially documented
- undocumented

## Step 4: Report

```
Feature: <name>
Documented (N/M):
- <element>: <doc path>

Partially documented:
- <element>: <doc path> (notes)

Undocumented:
- <element>: <suggested doc path>
```
