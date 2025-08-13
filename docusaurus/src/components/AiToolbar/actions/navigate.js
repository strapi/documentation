export const navigateAction = (context) => {
  const { url, closeDropdown } = context;
  
  if (!url) {
    console.error('Navigate action requires a URL');
    return;
  }
  
  // Open URL in new tab
  window.open(url, '_blank');
  
  // Close dropdown immediately for navigation actions
  if (closeDropdown) {
    closeDropdown();
  }
};