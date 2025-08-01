/**
 * Extracteur PDF robuste qui combine plusieurs méthodes
 * pour extraire le texte des PDFs difficiles (Scribus, etc.)
 */

// Fonction pour nettoyer le texte extrait
function cleanExtractedText(text) {
  if (!text) return '';
  
  return text
    // Remplacer les caractères Unicode problématiques
    .replace(/[﴾﴿]/g, (match) => match === '﴾' ? '(' : ')')
    .replace(/[–—‐]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
    .replace(/[•▪▫◦‣⁃]/g, '-')
    // Supprimer les caractères de contrôle
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    // Normaliser les espaces et sauts de ligne
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{3,}/g, '  ')
    .trim();
}

// Fonction pour détecter si le texte est valide
function isValidText(text) {
  if (!text || text.trim().length < 10) return false;
  
  // Détecter les données binaires
  const binaryIndicators = ['endstream', 'endobj', '/Type', '/Font', '/Filter'];
  const hasBinaryIndicators = binaryIndicators.some(indicator => text.includes(indicator));
  
  // Compter les caractères non imprimables
  const nonPrintableCount = (text.match(/[^\x20-\x7E\n\r\t\u00A0-\uFFFF]/g) || []).length;
  const nonPrintableRatio = nonPrintableCount / text.length;
  
  // Le texte est invalide s'il contient trop de caractères binaires
  return !hasBinaryIndicators && nonPrintableRatio < 0.1;
}

// Méthode 1: Utiliser pdfjs-dist (meilleure pour la plupart des PDFs)
async function extractWithPdfjs(arrayBuffer) {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configurer le worker
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      if (textContent.items && textContent.items.length > 0) {
        const pageText = textContent.items
          .map(item => item.str)
          .filter(str => str && str.trim().length > 0)
          .join(' ');
        
        if (pageText.trim()) {
          fullText += pageText + '\n';
        }
      }
    }
    
    const cleanedText = cleanExtractedText(fullText);
    if (isValidText(cleanedText)) {
      console.log('✅ Extraction réussie avec pdfjs-dist');
      return cleanedText;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur pdfjs-dist:', error.message);
    return null;
  }
}

// Méthode 2: Utiliser pdf-parse (Node.js uniquement)
// NOTE: Cette méthode est commentée car pdf-parse ne peut pas être utilisé côté client
// Elle reste ici pour référence mais n'est pas utilisée dans le navigateur
/*
async function extractWithPdfParse(buffer) {
  if (typeof window !== 'undefined') {
    return null; // pdf-parse ne fonctionne que côté serveur
  }
  
  try {
    // Importer pdf-parse uniquement côté serveur
    const pdfParse = require('pdf-parse');
    const result = await pdfParse(buffer);
    
    const cleanedText = cleanExtractedText(result.text);
    if (isValidText(cleanedText)) {
      console.log('✅ Extraction réussie avec pdf-parse');
      return cleanedText;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur pdf-parse:', error.message);
    return null;
  }
}
*/

// Méthode 3: Utiliser pdf-lib pour lire les annotations et champs de formulaire
async function extractWithPdfLib(arrayBuffer) {
  try {
    const { PDFDocument } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    
    let extractedText = '';
    
    // Extraire le texte des champs de formulaire
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    fields.forEach(field => {
      const fieldName = field.getName();
      let fieldValue = '';
      
      if (field.constructor.name === 'PDFTextField') {
        fieldValue = field.getText() || '';
      }
      
      if (fieldValue) {
        extractedText += `${fieldName}: ${fieldValue}\n`;
      }
    });
    
    // Extraire les métadonnées
    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const subject = pdfDoc.getSubject();
    const keywords = pdfDoc.getKeywords();
    
    if (title) extractedText += `Titre: ${title}\n`;
    if (author) extractedText += `Auteur: ${author}\n`;
    if (subject) extractedText += `Sujet: ${subject}\n`;
    if (keywords) extractedText += `Mots-clés: ${keywords}\n`;
    
    const cleanedText = cleanExtractedText(extractedText);
    if (cleanedText && cleanedText.length > 20) {
      console.log('✅ Extraction partielle avec pdf-lib (métadonnées/formulaires)');
      return cleanedText;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur pdf-lib:', error.message);
    return null;
  }
}

// Fonction principale d'extraction robuste
export async function extractPDFTextRobust(file) {
  try {
    console.log(`🔍 Tentative d'extraction robuste du PDF: ${file.name}`);
    
    // Convertir le fichier en ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Essayer les différentes méthodes dans l'ordre
    const methods = [
      { name: 'pdfjs-dist', fn: () => extractWithPdfjs(arrayBuffer) },
      { name: 'pdf-lib', fn: () => extractWithPdfLib(arrayBuffer) }
    ];
    
    for (const method of methods) {
      console.log(`📋 Essai avec ${method.name}...`);
      const result = await method.fn();
      
      if (result && isValidText(result)) {
        console.log(`✅ Extraction réussie avec ${method.name}`);
        return result;
      }
    }
    
    // Si toutes les méthodes échouent
    console.error('❌ Toutes les méthodes d\'extraction ont échoué');
    return null;
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction robuste:', error);
    return null;
  }
}

// Export par défaut
export default extractPDFTextRobust;