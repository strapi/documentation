const fs = require('fs');

// Fonction pour normaliser les chemins (évite les problèmes de comparaison avec/sans slash final)
const normalizePath = (path) => {
    return path.replace(/\/$/, '');
};

// Fonction pour comparer deux redirections
const areRedirectsEqual = (redirect1, redirect2) => {
    const from = normalizePath(redirect1.from || redirect1.source);
    const to = normalizePath(redirect1.to || redirect1.destination);
    const source = normalizePath(redirect2.source || redirect2.from);
    const destination = normalizePath(redirect2.destination || redirect2.to);
    
    return from === source && to === destination;
};

try {
    // Lire les fichiers source
    const redirectsJS = fs.readFileSync('redirects.js', 'utf8');
    const vercelJSON = fs.readFileSync('vercel.json', 'utf8');

    // Parser le fichier redirects.js en évaluant le module.exports
    const redirectsList = eval(redirectsJS.replace('module.exports =', ''));

    // Parser le fichier vercel.json
    const vercelConfig = JSON.parse(vercelJSON);

    // Filtrer les redirections uniques (celles qui n'existent pas dans redirects.js)
    const uniqueRedirects = vercelConfig.redirects.filter(redirect2 => 
        !redirectsList.some(redirect1 => areRedirectsEqual(redirect1, redirect2))
    );

    // Créer le nouveau fichier vercel avec uniquement les redirections uniques
    const newVercelConfig = {
        ...vercelConfig,
        redirects: uniqueRedirects
    };

    // Sauvegarder le nouveau fichier
    fs.writeFileSync(
        'vercel.unique.json',
        JSON.stringify(newVercelConfig, null, 2),
        'utf8'
    );

    // Afficher les statistiques
    console.log('Statistiques:');
    console.log(`Redirections dans redirects.js: ${redirectsList.length}`);
    console.log(`Redirections initiales dans vercel.json: ${vercelConfig.redirects.length}`);
    console.log(`Redirections conservées dans vercel.unique.json: ${uniqueRedirects.length}`);
    console.log(`Redirections supprimées: ${vercelConfig.redirects.length - uniqueRedirects.length}`);

} catch (error) {
    console.error('Erreur lors du traitement des fichiers:', error.message);
}