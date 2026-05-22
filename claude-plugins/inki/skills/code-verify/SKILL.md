---
name: code-verify
description: "Verify code blocks in a documentation file: check syntax, references, and consistency with the underlying Strapi APIs."
argument-hint: "<file path>"
user-invocable: true
---

# /inki:code-verify — verify code blocks

## Step 1: Read the target file

`$ARGUMENTS` is a relative path to a `.md` or `.mdx` file under `docusaurus/docs/`.

## Step 2: Extract all fenced code blocks

Parse the file and list every fenced code block with its language and content.

## Step 3: Apply the migrated code-verifier prompt

Read `../../references/prompts/integrity-code-verifier.md` and use it as the system prompt to evaluate each code block for:
- Syntax validity for the declared language
- References to functions/types that exist in the version of Strapi this page targets
- Consistency with surrounding prose

## Step 4: Report

For each code block, output:

```
Block <N> (lang=<lang>, lines <start>-<end>):
- Status: ok | suspicious | broken
- Notes: <short explanation>
```
