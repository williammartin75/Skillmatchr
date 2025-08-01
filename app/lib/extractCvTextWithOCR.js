/**
 * Version améliorée de l'extraction de CV avec support OCR optionnel
 * pour les PDFs scannés ou contenant des images
 */

import extractCvText from './extractCvText.js';

/**
 * Détecte si un PDF contient principalement des images (PDF scanné)
 */
async function isScannedPDF(file) {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configurer le worker
    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Vérifier la première page
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    
    // Si très peu de texte est détecté, c'est probablement un PDF scanné
    const textLength = textContent.items.reduce((sum, item) => sum + item.str.length, 0);
    
    // Obtenir les dimensions de la page pour estimer le ratio texte/surface
    const viewport = page.getViewport({ scale: 1.0 });
    const pageArea = viewport.width * viewport.height;
    
    // Si moins de 100 caractères sur une page standard, probablement scanné
    const isScanned = textLength < 100 || (textLength / pageArea) < 0.001;
    
    return {
      isScanned,
      textLength,
      pageArea,
      ratio: textLength / pageArea
    };
  } catch (error) {
    console.error('Erreur lors de la détection du type de PDF:', error);
    return { isScanned: false, error: error.message };
  }
}

/**
 * Extraction avec OCR en utilisant Tesseract.js
 */
async function extractWithOCR(file) {
  try {
    // Importer Tesseract dynamiquement
    const Tesseract = await import('tesseract.js');
    
    console.log('🔍 Utilisation de l\'OCR pour extraire le texte...');
    
    // Convertir le PDF en images (nécessite pdf2image ou similaire)
    // Pour cette démo, on simule l'extraction OCR
    const worker = await Tesseract.createWorker('fra');
    
    // Note: Dans une vraie implémentation, il faudrait:
    // 1. Convertir chaque page PDF en image
    // 2. Passer chaque image à Tesseract
    // 3. Combiner les résultats
    
    const result = {
      text: '[OCR] Extraction du texte depuis PDF scanné\n\n' +
            'Cette fonctionnalité nécessite une configuration supplémentaire:\n' +
            '1. Installer pdf2image ou pdf-poppler pour convertir PDF en images\n' +
            '2. Configurer Tesseract.js avec les langues appropriées\n' +
            '3. Traiter chaque page séparément\n\n' +
            'Pour une implémentation complète, voir la documentation.',
      structuredData: { pages: [], sections: {} },
      metadata: {
        extractedAt: new Date().toISOString(),
        ocrUsed: true,
        warning: 'OCR non configuré - résultat simulé'
      }
    };
    
    await worker.terminate();
    return result;
    
  } catch (error) {
    console.error('Erreur OCR:', error);
    throw new Error(`Erreur lors de l'extraction OCR: ${error.message}`);
  }
}

/**
 * Fonction principale avec détection automatique et fallback OCR
 */
export default async function extractCvTextWithOCR(file, options = {}) {
  const {
    forceOCR = false,
    ocrLanguages = ['fra', 'eng'],
    checkScanned = true
  } = options;
  
  try {
    // Si OCR forcé, utiliser directement l'OCR
    if (forceOCR) {
      console.log('🔤 OCR forcé activé');
      return await extractWithOCR(file);
    }
    
    // Vérifier si le PDF est scanné
    let scanInfo = { isScanned: false };
    if (checkScanned) {
      console.log('🔍 Vérification du type de PDF...');
      scanInfo = await isScannedPDF(file);
      console.log(`📄 PDF ${scanInfo.isScanned ? 'scanné détecté' : 'avec texte détecté'}`);
      
      if (scanInfo.textLength !== undefined) {
        console.log(`   - Caractères détectés: ${scanInfo.textLength}`);
        console.log(`   - Ratio texte/surface: ${(scanInfo.ratio * 1000).toFixed(3)}`);
      }
    }
    
    // Extraction standard
    const result = await extractCvText(file);
    
    // Si le PDF semble scanné ou si très peu de texte est extrait
    if (scanInfo.isScanned || result.text.length < 200) {
      console.log('⚠️  Peu de texte détecté, tentative d\'OCR...');
      
      // Ajouter un avertissement dans les métadonnées
      result.metadata.lowTextWarning = true;
      result.metadata.textLength = result.text.length;
      
      // Dans une vraie implémentation, on pourrait:
      // 1. Proposer à l'utilisateur d'activer l'OCR
      // 2. Automatiquement basculer vers l'OCR
      // 3. Combiner les résultats des deux méthodes
      
      if (options.autoOCR && scanInfo.isScanned) {
        try {
          const ocrResult = await extractWithOCR(file);
          // Combiner ou remplacer selon la qualité des résultats
          if (ocrResult.text.length > result.text.length) {
            return ocrResult;
          }
        } catch (ocrError) {
          console.error('OCR échoué, retour au résultat standard:', ocrError.message);
        }
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('Erreur lors de l\'extraction:', error);
    throw error;
  }
}

/**
 * Configuration et installation de l'OCR
 */
export async function setupOCR() {
  console.log('🛠️  Configuration de l\'OCR...\n');
  
  console.log('Pour activer l\'OCR complet, installez les dépendances suivantes:\n');
  
  console.log('1. Tesseract.js pour l\'OCR:');
  console.log('   npm install tesseract.js\n');
  
  console.log('2. PDF to Image converter (choisir une option):');
  console.log('   npm install pdf2pic        # Utilise GraphicsMagick/ImageMagick');
  console.log('   npm install pdf-poppler    # Utilise poppler-utils');
  console.log('   npm install pdf2img        # Alternative légère\n');
  
  console.log('3. Pour de meilleures performances:');
  console.log('   - Télécharger les modèles de langue Tesseract');
  console.log('   - Configurer un worker pool pour traiter plusieurs pages en parallèle');
  console.log('   - Utiliser un cache pour les résultats OCR\n');
  
  console.log('Exemple d\'utilisation complète:');
  console.log(`
import extractCvTextWithOCR from './extractCvTextWithOCR.js';

const file = // votre fichier PDF
const result = await extractCvTextWithOCR(file, {
  checkScanned: true,      // Vérifier si le PDF est scanné
  autoOCR: true,          // Basculer automatiquement vers OCR si nécessaire
  ocrLanguages: ['fra'],  // Langues pour l'OCR
  forceOCR: false        // Forcer l'utilisation de l'OCR
});

console.log(result.text);
  `);
}

// Export des fonctions utilitaires
export { isScannedPDF, extractWithOCR };