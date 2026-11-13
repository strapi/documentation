# Troubleshooting section format

Every Troubleshooting section uses the same shape: a heading with the bug icon, one sentence of introduction, then a bulleted list where each entry gives a symptom in bold, its cause, and the fix.

## When to use

- Any page with a Troubleshooting section: guides, plugin pages, feature pages, configuration pages.
- Add the section when readers can predictably hit a failure, for instance when the setup depends on something outside the project (a proxy, a registry, a provider API key).

## Format

1. The heading is an H2 with the `bug` icon before the word: `## <Icon name="bug" /> Troubleshooting`.
2. One sentence introduces the list and tells the reader how to read an entry.
3. A bulleted list follows, one entry per symptom. Each entry:
   - starts with the symptom in **bold**, phrased as what the reader observes and ending with a period;
   - continues, in plain text, with the cause;
   - ends with the fix.

## Canonical example

```md
## <Icon name="bug" /> Troubleshooting

Each of the following symptoms points at one side of the setup. The symptom is in bold, followed by what causes it and what to change:

- **Nginx returns `502 Bad Gateway`.** Nginx cannot reach Strapi. Confirm the Strapi process is running and listening on the port used in `proxy_pass`.

- **Uploads fail with `413 Request Entity Too Large`.** The request exceeded a size limit. Raise `client_max_body_size` in Nginx and `formidable.maxFileSize` in the Strapi `body` middleware.
```

## Rules

- Do not use one H3 per symptom, a table, or bold run-in paragraphs without bullets. The list is the only accepted shape.
- The bold symptom lead-in is the one allowed use of bold outside UI button names. Style checks must not flag it.
- Quote error messages and status codes in inline code inside the bold symptom, as in the example.
- No import line: `<Icon>` is a global MDX component (see `icon.md`).
