(function() {
  // Configuration
  const COOKIE_NAME = 'docusaurus.announcement.dismiss';
  const STORAGE_KEY = 'docusaurus.announcement.version';
  // Change this value whenever you want to force banner display for all users
  const BANNER_VERSION = '2025-02-20';
  
  // Use localStorage instead of cookies for version tracking
  function getStorageItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      // Handle errors (private mode, etc.)
      return null;
    }
  }
  
  function setStorageItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      // Handle errors (private mode, storage full, etc.)
      return false;
    }
  }
  
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  
  function removeCookie(name) {
    // Remove the cookie that hides the banner
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  }
  
  function resetAnnouncementBanner() {
    // Remove the cookie that hides the banner (if it exists)
    removeCookie(COOKIE_NAME);
    
    // Update the stored version
    setStorageItem(STORAGE_KEY, BANNER_VERSION);
    
    // Optional: minimalist notification, commented out by default
    /*
    const notificationElement = document.createElement('div');
    notificationElement.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#f8f9fa; padding:10px; border-radius:5px; box-shadow:0 2px 5px rgba(0,0,0,0.2); z-index:1000; font-size:12px;';
    notificationElement.innerHTML = 'We\'ve updated important announcements. <button style="background:none; border:none; text-decoration:underline; cursor:pointer; font-size:12px;">OK</button>';
    document.body.appendChild(notificationElement);
    
    notificationElement.querySelector('button').addEventListener('click', function() {
      document.body.removeChild(notificationElement);
    });
    
    setTimeout(() => {
      if (document.body.contains(notificationElement)) {
        document.body.removeChild(notificationElement);
      }
    }, 5000);
    */
  }
  
  function checkBannerVersion() {
    const storedVersion = getStorageItem(STORAGE_KEY);
    const dismissCookie = getCookie(COOKIE_NAME);
    
    // Only reset if:
    // 1. The banner has been dismissed (cookie exists)
    // 2. The stored version is different from current version (or doesn't exist)
    if (dismissCookie && storedVersion !== BANNER_VERSION) {
      resetAnnouncementBanner();
    } else if (!storedVersion) {
      // Just store the current version if not already stored
      setStorageItem(STORAGE_KEY, BANNER_VERSION);
    }
  }
  
  // Execute after page load
  if (document.readyState === 'complete') {
    checkBannerVersion();
  } else {
    window.addEventListener('load', checkBannerVersion);
  }
})();