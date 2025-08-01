# Extraction de texte depuis des CVs PDF

## 📚 Vue d'ensemble

Ce module fournit des fonctions avancées pour extraire le texte de fichiers PDF de CV tout en préservant la structure et la lisibilité. Il inclut :

- **Extraction de base** : Utilise `pdfjs-dist` pour extraire le texte avec préservation de la mise en page
- **Détection de structure** : Identifie automatiquement les sections du CV (expériences, formation, compétences, etc.)
- **Support OCR** : Détecte les PDFs scannés et peut utiliser l'OCR si nécessaire
- **Analyse intelligente** : Extraction des informations personnelles et mots-clés

## 🚀 Installation

```bash
npm install pdfjs-dist

# Optionnel pour l'OCR
npm install tesseract.js
npm install pdf2pic  # ou pdf-poppler
```

## 📖 Guide d'utilisation

### Extraction simple

```javascript
import { extractCvTextSimple } from './app/lib/extractCvText.js';

// Dans un gestionnaire d'événement
const fileInput = document.getElementById('cv-file');
const file = fileInput.files[0];

const cvText = await extractCvTextSimple(file);
console.log(cvText);
```

### Extraction avec structure

```javascript
import extractCvText from './app/lib/extractCvText.js';

const result = await extractCvText(file);

console.log(result.text);           // Texte complet
console.log(result.structuredData); // Données structurées par section
console.log(result.metadata);       // Métadonnées (nb pages, date, etc.)
```

### Extraction avec support OCR

```javascript
import extractCvTextWithOCR from './app/lib/extractCvTextWithOCR.js';

const result = await extractCvTextWithOCR(file, {
  checkScanned: true,    // Vérifier si le PDF est scanné
  autoOCR: true,        // Basculer vers OCR automatiquement
  ocrLanguages: ['fra'] // Langues pour l'OCR
});

if (result.metadata.ocrUsed) {
  console.log('OCR utilisé pour l\'extraction');
}
```

## 🔧 Exemples pratiques

### Formulaire d'upload de CV

```html
<form id="cv-upload-form">
  <input type="file" id="cv-file" accept=".pdf" />
  <button type="submit">Analyser le CV</button>
</form>
<div id="cv-result"></div>
```

```javascript
import { setupCvUploadForm } from './app/lib/cvExtractionExample.js';

// L'initialisation se fait automatiquement au chargement de la page
// ou manuellement :
setupCvUploadForm();
```

### Extraction d'informations personnelles

```javascript
import { handleCvUpload } from './app/lib/cvExtractionExample.js';

const result = await handleCvUpload(fileInput);
if (result.success) {
  console.log('Email:', result.personalInfo.email);
  console.log('Téléphone:', result.personalInfo.phone);
  console.log('Compétences:', result.personalInfo.skills);
}
```

### Analyse de structure

```javascript
import { analyzeCvStructure } from './app/lib/cvExtractionExample.js';

const analysis = await analyzeCvStructure(file);
console.log(`Pages: ${analysis.totalPages}`);
console.log(`Sections: ${Object.keys(analysis.sections).length}`);

// Afficher les mots-clés de chaque section
Object.entries(analysis.sections).forEach(([name, data]) => {
  console.log(`${name}: ${data.keywords.map(k => k.word).join(', ')}`);
});
```

## 📊 Format de sortie

### Structure de base

```javascript
{
  text: "Antoine LORENCE\nDéveloppeur Python...",
  structuredData: {
    pages: [
      {
        pageNumber: 1,
        text: "Contenu de la page 1..."
      }
    ],
    sections: {
      "🔧 EXPÉRIENCES PROFESSIONNELLES": [
        "LA POSTE – Développeur Django (Freelance)",
        "2023 – 2024",
        "- Maintenance applicative..."
      ],
      "🛠 COMPÉTENCES TECHNIQUES": [
        "Python, Django, Flask, FastAPI",
        "Vue.js, Vanilla JS"
      ]
    }
  },
  metadata: {
    numPages: 2,
    extractedAt: "2024-01-15T10:30:00.000Z",
    ocrUsed: false,
    fallbackUsed: false
  }
}
```

## 🔍 Détection des PDFs scannés

La fonction `isScannedPDF` détermine automatiquement si un PDF contient du texte extractible ou s'il s'agit d'images scannées :

```javascript
import { isScannedPDF } from './app/lib/extractCvTextWithOCR.js';

const scanInfo = await isScannedPDF(file);
if (scanInfo.isScanned) {
  console.log('Ce PDF semble être scanné');
  console.log(`Ratio texte/surface: ${scanInfo.ratio}`);
}
```

## ⚡ Optimisations et performances

### Conseils pour de meilleures performances

1. **Utiliser la version simple** si vous n'avez besoin que du texte :
   ```javascript
   const text = await extractCvTextSimple(file);
   ```

2. **Désactiver la vérification OCR** si vous savez que vos PDFs contiennent du texte :
   ```javascript
   const result = await extractCvTextWithOCR(file, {
     checkScanned: false
   });
   ```

3. **Mettre en cache les résultats** pour éviter de retraiter les mêmes fichiers

### Gestion des erreurs

```javascript
try {
  const result = await extractCvText(file);
  // Traiter le résultat
} catch (error) {
  if (error.message.includes('PDF')) {
    console.error('Erreur PDF:', error);
  } else {
    console.error('Erreur générale:', error);
  }
}
```

## 🛠️ Configuration avancée

### Personnaliser la détection des sections

Modifiez la fonction `detectSections` dans `extractCvText.js` pour ajouter vos propres patterns :

```javascript
const sectionPatterns = [
  /^(EXPÉRIENCES? PROFESSIONNELLES?|PROFESSIONAL EXPERIENCE)/i,
  /^(FORMATION|ÉDUCATION|EDUCATION)/i,
  // Ajouter vos patterns ici
  /^(CERTIFICATIONS?)/i,
  /^(PUBLICATIONS?)/i
];
```

### Ajuster le regroupement par ligne

Le paramètre `threshold` contrôle la sensibilité du regroupement :

```javascript
// Dans extractCvText.js
const lines = groupTextByLine(content.items, threshold = 5);
// Augmenter pour regrouper plus de lignes ensemble
// Diminuer pour un regroupement plus strict
```

## 📝 Notes importantes

1. **Compatibilité navigateur** : Les fonctions utilisent des APIs modernes (FileReader, async/await). Vérifiez la compatibilité pour IE11.

2. **Taille des fichiers** : Pour des PDFs très volumineux (>10MB), considérez un traitement côté serveur.

3. **Sécurité** : Validez toujours les fichiers côté serveur avant de faire confiance au contenu extrait.

4. **OCR** : L'OCR nécessite plus de ressources et de temps. Utilisez-le uniquement quand nécessaire.

## 🆘 Dépannage

### "Cannot find module 'pdfjs-dist'"
```bash
npm install pdfjs-dist
```

### "Worker not configured"
Assurez-vous que le worker PDF.js est correctement configuré :
```javascript
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
```

### Extraction vide ou incomplète
- Vérifiez si le PDF est scanné avec `isScannedPDF()`
- Essayez avec `forceOCR: true`
- Vérifiez l'encodage du PDF

## 📄 Licence

Ce module est fourni tel quel pour usage dans le projet. Consultez les licences de pdfjs-dist et tesseract.js pour leurs conditions d'utilisation respectives.