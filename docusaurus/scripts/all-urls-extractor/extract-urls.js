const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            if (file.endsWith('.html')) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}

function extractUrls() {
    try {
        const buildPath = path.resolve(__dirname, '../../build');
        const outputStream = fs.createWriteStream(path.join(__dirname, 'all-urls.txt'));

        // Trouver tous les fichiers HTML
        const htmlFiles = getAllFiles(buildPath);

        // Pour chaque fichier HTML
        htmlFiles.forEach(file => {
            // Extraire l'URL relative
            const route = file
                .replace(buildPath, '')
                .replace('/index.html', '')
                .replace('.html', '')
                .replace(/\\/g, '/');
            
            // Écrire l'URL de la page
            outputStream.write(route + '\n');

            // Extraire les IDs des headings
            const content = fs.readFileSync(file, 'utf8');
            const matches = content.match(/<h[2-6][^>]+id="([^"]+)"/g);
            
            if (matches) {
                matches.forEach(match => {
                    const id = match.match(/id="([^"]+)"/)[1];
                    outputStream.write(`${route}#${id}\n`);
                });
            }
        });

        outputStream.end();
        console.log('Extraction terminée ! Les URLs ont été sauvegardées dans all-urls.txt');

    } catch (error) {
        console.error('Erreur lors de l\'extraction :', error);
        console.error(error.stack);
        if (error.code === 'ENOENT') {
            console.error('\nIl semble que le dossier build n\'existe pas.');
            console.error('Assurez-vous d\'avoir fait un build avec : npm run build');
        }
    }
}

extractUrls();