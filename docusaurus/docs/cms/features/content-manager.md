---
title: Content Manager
description: Learn to use the Content Manager.
toc_max_heading_level: 4
tags:
  - admin panel
  - content manager
  - list view
  - edit view
  - component
  - dynamic zone
  - relational field
---
# Content Manager

## Search Input Behavior

The Search Input component now includes an improved blur behavior to enhance the user experience when searching in the Content Manager. 

### Search Field Closing Mechanism

When using the search functionality, the search field will now automatically close under specific conditions:

- If the search input is empty and the user clicks outside the search field (blurs the input), the search field will close.
- If the search input contains text, the search field will remain open.

#### Example Behavior

```javascript
// Search field closes when:
// - Input is empty
// - User clicks outside the search field
setIsOpen(false);

// Search field remains open when:
// - Input contains text
setIsOpen(true);
```

### Implementation Details

The new implementation adds an `onBlur` event handler to the Searchbar component that checks two conditions:
1. The event is triggered outside the current input element
2. The input value is an empty string

This ensures a more intuitive search experience by automatically closing the search field when it is no longer needed.

:::tip
The search field can be reopened by clicking the search icon, allowing for quick and easy access to search functionality.
:::
