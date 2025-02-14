# Redirect Deduplication Script

A Node.js script that removes duplicate redirects between `redirects.js` and `vercel.json` files. The script identifies and removes redirects from `vercel.json` that already exist in `redirects.js`.

## Features

- Normalizes paths by removing trailing slashes for consistent comparison
- Handles both Docusaurus (`from/to`) and Vercel (`source/destination`) redirect formats
- Preserves other configurations in `vercel.json`
- Generates statistics about the deduplication process
- Creates a new file instead of overwriting the original

## Prerequisites

- Node.js installed
- Source files:
  - `redirects.js`: A JavaScript file with Docusaurus-style redirects
  - `vercel.json`: A JSON file with Vercel redirect configurations

## Usage

1. Place your source files in the same directory as the script:

`redirects.js` example:
```js
module.exports = [
  {
    from: '/old-path',
    to: '/new-path'
  }
]
```

`vercel.json` example:
```json
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

2. Run the script:
```bash
node dedupe-redirects.js
```

## Output

The script will:
1. Create a new file `vercel.unique.json` containing only unique redirects
2. Print statistics about the deduplication process:
```
Statistics:
Redirections in redirects.js: 10
Initial redirections in vercel.json: 15
Redirections kept in vercel.unique.json: 8
Redirections removed: 7
```

## How it Works

1. Reads and parses both input files
2. Normalizes all paths by removing trailing slashes
3. Compares redirects using both `from/to` and `source/destination` formats
4. Creates a new Vercel config file with only unique redirects
5. Preserves all other Vercel configurations
6. Reports statistics about the process

## Supported Redirect Formats

### Docusaurus Format (`redirects.js`)
```js
{
  from: '/old-path',
  to: '/new-path'
}
```

### Vercel Format (`vercel.json`)
```json
{
  "source": "/old-path",
  "destination": "/new-path",
  "permanent": true
}
```

## Error Handling

The script includes error handling for common issues:
- File reading errors
- JSON parsing errors
- JavaScript evaluation errors

If an error occurs, it will be displayed with a descriptive message.

## Best Practices

1. Always backup your files before running the script
2. Verify the contents of `vercel.unique.json` before using it
3. Keep your redirect formats consistent within each file
4. Use absolute paths in your redirects

## Troubleshooting

If you encounter errors:
1. Ensure both source files exist in the same directory as the script
2. Verify that `redirects.js` exports a valid array of redirects
3. Check that `vercel.json` is valid JSON
4. Confirm that all paths use the correct format (starting with `/`)
