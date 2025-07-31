const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Configuration
const extensionDir = __dirname;
const outputDir = path.join(__dirname, '..', 'public', 'extensions');
const extensionName = 'skillmatchr-extension.zip';

// Créer le dossier de sortie s'il n'existe pas
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Créer un fichier ZIP
const output = fs.createWriteStream(path.join(outputDir, extensionName));
const archive = archiver('zip', {
    zlib: { level: 9 } // Niveau de compression maximum
});

output.on('close', () => {
    console.log(`Extension créée: ${archive.pointer()} bytes`);
    console.log(`Fichier: ${path.join(outputDir, extensionName)}`);
});

archive.on('error', (err) => {
    throw err;
});

archive.pipe(output);

// Ajouter les fichiers de l'extension
const filesToInclude = [
    'manifest.json',
    'popup.html',
    'popup.css',
    'popup.js',
    'content.js',
    'content.css',
    'background.js'
];

// Ajouter les fichiers principaux
filesToInclude.forEach(file => {
    const filePath = path.join(extensionDir, file);
    if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: file });
        console.log(`Ajouté: ${file}`);
    } else {
        console.warn(`Fichier manquant: ${file}`);
    }
});

// Ajouter les icônes
const iconsDir = path.join(extensionDir, 'icons');
if (fs.existsSync(iconsDir)) {
    archive.directory(iconsDir, 'icons');
    console.log('Ajouté: dossier icons/');
}

// Finaliser l'archive
archive.finalize(); 