---
name: coverage
description: "Audit the documentation coverage of a Strapi feature or module: list what is documented vs missing."
argument-hint: "[--no-log] <feature or module name>"
user-invocable: true
---

# /inki:coverage — feature documentation gap audit

## Prerequisites

This skill compares a Strapi feature's public surface against the documentation. It needs access to the Strapi codebase, in one of these forms (by preference):

1. **A local clone of `strapi/strapi`.** Fastest and most reliable. Pass the path as input or ask the user.
2. **Raw GitHub fetch** (`https://raw.githubusercontent.com/strapi/strapi/develop/<path>`). Works without a local clone but rate-limited and slower.

If neither is available, ask the user for a path or fall back to GitHub fetches.

## Step 1: Identify the feature

`$ARGUMENTS` is a Strapi feature name (e.g., "Users & Permissions plugin", "Document Service API"). Resolve to a set of source files using one of the sources listed in Prerequisites.

Logging: unless `--no-log` is passed, write this skill's report to the run log per `../../references/logging.md` (`--log-dir <path>` and `--short-log` are also accepted). When invoked as part of an orchestrator (e.g. `/inki:research`), write into that run's existing directory instead of creating a new one.

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
