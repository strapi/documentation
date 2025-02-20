(function() {
  // Configuration
  const COOKIE_NAME = 'docusaurus.announcement.dismiss';
  const RESET_INTERVAL_DAYS = 30; // Reinit every 30 days
  const STORAGE_KEY = 'docusaurus.last.announcement.reset';
  
  // Use localStorage instead of cookies
  function getStorageItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      // In case of error (private mode, etc.)
      return null;
    }
  }
  
  function setStorageItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      // In case of errors (private mode, localStorage full, etc.)
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
    // Supprimer le cookie qui masque la bannière
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  }
  
  function resetAnnouncementBanner() {
    // Delete cookie hiding banner (if existing)
    removeCookie(COOKIE_NAME);
    
    // Store last reinitialization date
    setStorageItem(STORAGE_KEY, new Date().toISOString());
    
    // Option: small non-intrusive notification, hidden by default
    /*
    const notificationElement = document.createElement('div');
    notificationElement.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#f8f9fa; padding:10px; border-radius:5px; box-shadow:0 2px 5px rgba(0,0,0,0.2); z-index:1000; font-size:12px;';
    notificationElement.innerHTML = 'Nous avons mis à jour les annonces importantes. <button style="background:none; border:none; text-decoration:underline; cursor:pointer; font-size:12px;">OK</button>';
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
  
  function checkAndResetBanner() {
    const lastReset = getStorageItem(STORAGE_KEY);
    const dismissCookie = getCookie(COOKIE_NAME);
    
    // If announcementBar was hidden
    if (dismissCookie) {
      if (!lastReset) {
        // First execution
        setStorageItem(STORAGE_KEY, new Date().toISOString());
      } else {
        // Check time interval
        const lastResetDate = new Date(lastReset);
        const currentDate = new Date();
        const daysDifference = Math.floor((currentDate - lastResetDate) / (1000 * 60 * 60 * 24));
        
        if (daysDifference >= RESET_INTERVAL_DAYS) {
          resetAnnouncementBanner();
        }
      }
    }
  }
  
  // Execute after page load
  if (document.readyState === 'complete') {
    checkAndResetBanner();
  } else {
    window.addEventListener('load', checkAndResetBanner);
  }
})();