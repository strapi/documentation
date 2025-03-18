(function() {
  // Fonction pour déterminer le type de dossier à partir de l'URL
  function detectFolderFromURL() {
    const path = window.location.pathname;
    
    if (path.includes('/cms/')) {
      return 'cms';
    } else if (path.includes('/cloud/')) {
      return 'cloud';
    }
    
    return 'default';
  }
  
  // Fonction pour appliquer l'attribut data-folder-source
  function applyFolderAttribute() {
    const folderType = detectFolderFromURL();
    document.documentElement.setAttribute('data-folder-source', folderType);
  }
  
  // Appliquer immédiatement
  applyFolderAttribute();
  
  // Pour une Single Page Application, écouter les changements de route
  if (typeof window !== 'undefined') {
    // Mutation Observer pour détecter les changements sur l'élément html
    const observer = new MutationObserver(function(mutations) {
      applyFolderAttribute();
    });
    
    // Observer les changements de classe qui pourraient indiquer un changement de page
    observer.observe(document.documentElement, { 
      attributes: true,
      attributeFilter: ['class']
    });
  }
})();