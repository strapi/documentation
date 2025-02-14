# Redirects Organizer

This script automatically organizes redirections in a JavaScript file by analyzing URL patterns and grouping similar redirections together. It helps maintain large redirection files by categorizing them in a logical way.

## Features

- Automatically detects URL patterns to create meaningful categories
- Preserves original header comments
- Sorts categories by number of redirections
- Creates a clean, organized output file
- Provides statistics about detected categories

## Prerequisites

- Node.js installed on your system
- A redirects.js file in the same directory as the script

## Installation

1. Place the `organize-redirects.js` script in the same directory as your `redirects.js` file
2. Make sure your `redirects.js` file follows this format:
```javascript
module.exports = [
  {
    "from": "/old-url",
    "to": "/new-url"
  },
  // ... more redirections
];
```

## Usage

Run the script using Node.js:

```bash
node redirects-organizer.js
```

The script will:
1. Read your `redirects.js` file
2. Analyze all URLs to detect patterns
3. Group redirections into categories
4. Create a new file called `redirects.organized.js`
5. Display statistics about the detected categories in the console

## Output

The script creates a new file `redirects.organized.js` with the following structure:

```javascript
/**
 * [Original header comment preserved]
 */
module.exports = [

  // Developer Documentation - API
  {
    "from": "/developer-docs/api/old-path",
    "to": "/dev-docs/api/new-path"
  },

  // Backend Customization
  {
    "from": "/developer-docs/backend/old-path",
    "to": "/dev-docs/backend/new-path"
  },
  // ... more organized redirections
];
```

## Categories

Categories are automatically created based on URL patterns. Common categories include:
- Developer Documentation (with sub-categories like API, Backend, etc.)
- User Documentation
- Backend Customization
- Core Redirections
- And more, depending on your URLs

## Error Handling

The script includes error handling for:
- File reading issues
- Invalid JavaScript syntax
- Parsing errors

If an error occurs, the script will display an error message and exit with code 1.

## Contributing

Feel free to submit issues and enhancement requests!
