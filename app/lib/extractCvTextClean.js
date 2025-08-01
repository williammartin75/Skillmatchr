/**
 * Fonction d'extraction de texte PDF nettoyé
 * Version simplifiée qui se concentre sur le nettoyage du texte
 */

// Fonction de nettoyage du texte
function cleanText(text) {
  return text
    .replace(/[﴾﴿]/g, (match) => match === '﴾' ? '(' : ')') // Parenthèses Unicode
    .replace(/[–—‐]/g, '-') // Tirets Unicode
    .replace(/[\u2018\u2019]/g, "'") // Apostrophes courbes
    .replace(/[\u201C\u201D]/g, '"') // Guillemets courbes
    .replace(/\u00A0/g, ' ') // Espaces insécables
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '') // Caractères invisibles
    .replace(/[•▪▫◦‣⁃]/g, '-') // Uniformiser les puces
    .replace(/\n{3,}/g, '\n\n') // Supprimer les sauts de ligne excessifs
    .replace(/\s{3,}/g, '  ') // Normaliser les espaces multiples
    .trim();
}

// Extraction simple pour le navigateur
export async function extractPDFTextClean(file) {
  if (file.type !== 'application/pdf') {
    throw new Error('Le fichier doit être un PDF');
  }

  try {
    console.log("📄 Extraction PDF avec nettoyage...");
    
    // Importer pdfjs-dist dynamiquement
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configurer le worker pour éviter l'erreur
    if (typeof window !== 'undefined') {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      } catch (e) {
        // Si le CDN ne fonctionne pas, désactiver le worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = false;
      }
    }
    
    // Lire le fichier comme ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Charger le PDF
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    // Extraire le texte de chaque page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Nettoyer chaque élément de texte individuellement
      const pageText = textContent.items
        .map(item => cleanText(item.str))
        .filter(text => text.length > 0)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    // Nettoyage final du texte complet
    fullText = cleanText(fullText);
    
    console.log("✅ Extraction PDF réussie avec nettoyage");
    console.log("📝 Texte extrait (premiers 300 caractères):", fullText.substring(0, 300));
    
    return fullText;
  } catch (error) {
    console.error("❌ Erreur extraction PDF:", error);
    throw error;
  }
}

// Fonction pour extraire les informations personnelles du texte nettoyé
export function extractPersonalInfoFromCleanText(text) {
  const info = {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  };
  
  // Patterns de détection
  const patterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    phone: /(\+33|0)[1-9]\s*\d{1,2}\s*\d{1,2}\s*\d{1,2}\s*\d{1,2}/,
    name: /^([A-Z][a-zàâäéèêëïîôùûç]+)\s+([A-Z]+)$/m
  };
  
  // Email
  const emailMatch = text.match(patterns.email);
  if (emailMatch) {
    info.email = emailMatch[0];
  }
  
  // Téléphone
  const phoneMatch = text.match(patterns.phone);
  if (phoneMatch) {
    info.phone = phoneMatch[0].replace(/\s+/g, '');
  }
  
  // Recherche du nom dans les premières lignes
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  for (const line of lines.slice(0, 10)) {
    const nameMatch = line.match(patterns.name);
    if (nameMatch) {
      info.firstName = nameMatch[1];
      info.lastName = nameMatch[2];
      break;
    }
  }
  
  return info;
}

// Export par défaut
export default extractPDFTextClean;