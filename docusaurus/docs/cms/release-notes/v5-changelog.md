# Strapi 5 Changelog

## Improvements

### Search Field Behavior in Content Manager

#### Issue Fixed
Resolved an issue where the search field in the Content Manager could not be closed when manually clearing the field.

#### Details
- **Affected Component**: Search Input in Content Manager
- **Issue Number**: [#21357](https://github.com/strapi/strapi/issues/21357)

#### Changes
- Added a new `onBlur` event handler to the search input
- The search field will now automatically close when:
  - The field is empty
  - Focus moves outside the search input

#### How to Test
1. Open the Content Manager
2. Click on the search icon
3. Type a search query
4. Clear the search field manually
5. Click outside the search field

#### Code Example
```typescript
onBlur={(e) => {
  if (!e.currentTarget.contains(e.relatedTarget) && e.currentTarget.value === '') {
    setIsOpen(false);
  }
}}
```

#### Impact
- Improves user experience in the Content Manager
- Provides more intuitive search field interaction

### Changelog Metadata
- **Pull Request**: [#22415](https://github.com/strapi/strapi/pull/22415)
- **Contributor**: @Manoj-M-S