# GitHub MCP Usage Guide

This guide explains how to use the GitHub MCP tools to fetch pull request data directly, without asking the user to paste content manually.

## When to use

Use GitHub MCP tools when:
- The user provides a PR URL, number, or reference
- You need to analyze changed files in a pull request
- You need to fetch file contents from a specific branch

## Available tools

| Tool | Purpose |
|------|---------|
| `github:get_pull_request` | Get PR metadata (title, description, state, author) |
| `github:get_pull_request_files` | Get list of changed files with diffs |
| `github:get_file_contents` | Get full content of a specific file |

## Workflow for PR analysis

### Step 1: Clarify the PR reference

If the user provides a PR URL or number, extract or ask for:
- **owner**: Repository owner (e.g., `strapi`)
- **repo**: Repository name (e.g., `documentation` or `strapi`)
- **pull_number**: PR number (e.g., `1542`)

### Step 2: Fetch PR metadata

```
github:get_pull_request(owner, repo, pull_number)
```

Returns:
- PR title and description → understand the intent
- PR state (open, closed, merged)
- Author, labels, milestone

### Step 3: Fetch changed files

```
github:get_pull_request_files(owner, repo, pull_number)
```

Returns:
- List of changed files with status (added, modified, removed)
- File diffs → understand what changed

### Step 4 (optional): Fetch full file content

If you need the complete file (not just the diff):

```
github:get_file_contents(owner, repo, path, branch)
```

Use the PR's head branch to get the proposed version.

## Example

```
User: "Review PR #1542 from strapi/documentation"

Agent workflow:
1. github:get_pull_request("strapi", "documentation", 1542)
   → Title: "Add MCP Server documentation"
   → Description: explains the feature
   
2. github:get_pull_request_files("strapi", "documentation", 1542)
   → docs/cms/features/mcp-server.md (added)
   → docs/cms/configurations/server.md (modified)

3. Proceed with analysis using the fetched data
```

## Fallback if GitHub MCP is unavailable

If you cannot access GitHub MCP tools, ask the user to provide:

1. The PR title and description
2. The list of changed files
3. (Optional) The diff or content for files you need to analyze

Example response:

```
I can't access GitHub directly. Please provide:
1. The PR title and description
2. The list of changed files
3. (Optional) The diff for any new or modified documentation files
```

## Notes

- Always try GitHub MCP first before asking the user to paste content
- For large PRs, focus on documentation-related files (`.md`, `sidebars.js`, etc.)
- If fetching fails, gracefully fall back to asking the user