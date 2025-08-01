// Module pour l'extraction de texte des PDFs
// Compatible avec Next.js App Router

async function extractPDFText(buffer) {
  try {
    // Pour Next.js App Router, on doit utiliser l'import dynamique
    const pdfParse = (await import('pdf-parse')).default || (await import('pdf-parse'));
    
    const options = {
      max: 0, // Pas de limite de pages
      version: 'v2.0.550'
    };
    
    const result = await pdfParse(buffer, options);
    
    if (result && result.text) {
      console.log('Extraction PDF réussie');
      console.log('Pages:', result.numpages);
      console.log('Texte extrait:', result.text.length, 'caractères');
      return result.text;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur extraction PDF:', error);
    return null;
  }
}

// Fonction de nettoyage du texte
function cleanText(text) {
  if (!text) return '';
  
  // Remplacer les caractères non imprimables par des espaces
  let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
  
  // Remplacer les multiples espaces par un seul espace
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Supprimer les espaces en début et fin de ligne
  cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');
  
  // Supprimer les lignes vides multiples
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Supprimer les caractères de formatage PDF
  cleaned = cleaned.replace(/[∞®™©]/g, '');
  
  // Nettoyer la ponctuation
  cleaned = cleaned.replace(/\s+([.,;:!?])/g, '$1');
  cleaned = cleaned.replace(/([.,;:!?])\s*([.,;:!?])/g, '$1$2');
  
  // Supprimer les caractères de contrôle Unicode
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '');
  
  // Nettoyer les guillemets et tirets
  cleaned = cleaned.replace(/[""''„"«»]/g, '"');
  cleaned = cleaned.replace(/[–—−]/g, '-');
  
  return cleaned.trim();
}

module.exports = { extractPDFText, cleanText };