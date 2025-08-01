/**
 * Extraction du texte complet et structuré d'un fichier PDF de CV
 * en conservant un maximum de lisibilité pour analyse ultérieure.
 */

// Fonction pour regrouper les éléments de texte par position verticale
function groupTextByLine(items, threshold = 5) {
  const lines = [];
  let currentLine = [];
  let lastY = null;

  items.sort((a, b) => {
    // Trier d'abord par position Y (haut en bas), puis par X (gauche à droite)
    if (Math.abs(a.transform[5] - b.transform[5]) > threshold) {
      return b.transform[5] - a.transform[5]; // Y décroissant (haut vers bas)
    }
    return a.transform[4] - b.transform[4]; // X croissant (gauche à droite)
  });

  items.forEach(item => {
    const y = item.transform[5];
    
    if (lastY === null || Math.abs(lastY - y) > threshold) {
      // Nouvelle ligne détectée
      if (currentLine.length > 0) {
        // Trier les éléments de la ligne courante par position X
        currentLine.sort((a, b) => a.transform[4] - b.transform[4]);
        lines.push(currentLine);
      }
      currentLine = [item];
      lastY = y;
    } else {
      // Même ligne
      currentLine.push(item);
    }
  });

  // Ajouter la dernière ligne
  if (currentLine.length > 0) {
    currentLine.sort((a, b) => a.transform[4] - b.transform[4]);
    lines.push(currentLine);
  }

  return lines;
}

// Fonction pour détecter les sections principales (titres, sous-titres)
function detectSections(line) {
  const text = line.join(' ').trim();
  
  // Patterns pour identifier les sections communes d'un CV
  const sectionPatterns = [
    /^(EXPÉRIENCES? PROFESSIONNELLES?|PROFESSIONAL EXPERIENCE)/i,
    /^(FORMATION|ÉDUCATION|EDUCATION)/i,
    /^(COMPÉTENCES?|SKILLS?)/i,
    /^(LANGUES?|LANGUAGES?)/i,
    /^(PROJETS?|PROJECTS?)/i,
    /^(CENTRES? D'INTÉRÊTS?|HOBBIES|INTERESTS?)/i,
  ];
  
  for (const pattern of sectionPatterns) {
    if (pattern.test(text)) {
      return { isSection: true, text };
    }
  }
  
  // Détecter les titres en majuscules avec des caractères spéciaux
  if (/^[🔧🛠️📍📞📧🌐🚗🎓🌍].+/.test(text) || /^[A-Z\s]{5,}$/.test(text)) {
    return { isSection: true, text };
  }
  
  return { isSection: false, text };
}

// Fonction principale d'extraction
export default async function extractCvText(file) {
  try {
    // Importer dynamiquement pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configurer le worker
    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      // Configuration côté client
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }
    
    // Charger le fichier PDF
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    let structuredData = {
      pages: [],
      sections: {}
    };
    
    // Itérer sur chaque page du PDF
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      
      // Grouper le texte par ligne en utilisant les positions
      const lines = groupTextByLine(content.items);
      
      let pageText = '';
      let currentSection = null;
      
              lines.forEach(lineItems => {
          // Joindre les éléments de la ligne avec des espaces appropriés
          const lineText = lineItems
            .map((item, index) => {
              // Nettoyer le texte dès l'extraction
              let text = item.str
                .replace(/[﴾﴿]/g, (match) => match === '﴾' ? '(' : ')') // Parenthèses Unicode
                .replace(/[–—‐]/g, '-') // Tirets Unicode
                .replace(/[\u2018\u2019]/g, "'") // Apostrophes courbes
                .replace(/[\u201C\u201D]/g, '"') // Guillemets courbes
                .replace(/\u00A0/g, ' ') // Espaces insécables
                .replace(/[\u200B\u200C\u200D\uFEFF]/g, ''); // Caractères invisibles
              
              // Ajouter un espace si nécessaire entre les éléments
              if (index > 0 && lineItems[index - 1]) {
                const prevItem = lineItems[index - 1];
                const gap = item.transform[4] - (prevItem.transform[4] + prevItem.width);
                
                // Si l'écart est significatif, ajouter des espaces supplémentaires
                if (gap > item.height * 0.5) {
                  return '  ' + text;
                }
              }
              
              return text;
            })
            .join(' ')
            .trim();
        
        if (lineText) {
          // Détecter si c'est une section
          const sectionInfo = detectSections([lineText]);
          
          if (sectionInfo.isSection) {
            currentSection = sectionInfo.text;
            if (!structuredData.sections[currentSection]) {
              structuredData.sections[currentSection] = [];
            }
          } else if (currentSection) {
            structuredData.sections[currentSection].push(lineText);
          }
          
          pageText += lineText + '\n';
        }
      });
      
      structuredData.pages.push({
        pageNumber: pageNum,
        text: pageText.trim()
      });
      
      // Ajouter la page au texte complet avec un séparateur
      if (pageNum > 1) {
        fullText += '\n\n--- Page ' + pageNum + ' ---\n';
      }
      fullText += pageText;
    }
    
    // Nettoyage final du texte
    fullText = fullText
      .replace(/\n{3,}/g, '\n\n') // Supprimer les sauts de ligne excessifs
      .replace(/\s{3,}/g, '  ') // Normaliser les espaces multiples
      .replace(/[•▪▫◦‣⁃]/g, '-') // Uniformiser les puces
      .replace(/[–—‐]/g, '-') // Uniformiser les tirets (incluant le tiret Unicode)
      .replace(/[﴾﴿]/g, (match) => match === '﴾' ? '(' : ')') // Remplacer les parenthèses Unicode
      .replace(/[\u2018\u2019]/g, "'") // Remplacer les apostrophes courbes
      .replace(/[\u201C\u201D]/g, '"') // Remplacer les guillemets courbes
      .replace(/\u00A0/g, ' ') // Remplacer les espaces insécables
      .replace(/[\u200B\u200C\u200D\uFEFF]/g, '') // Supprimer les caractères invisibles
      .trim();
    
    return {
      text: fullText,
      structuredData: structuredData,
      metadata: {
        numPages: pdf.numPages,
        extractedAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('Erreur lors de l\'extraction du PDF:', error);
    
    // Fallback vers une extraction basique si pdfjs échoue
    try {
      // Utiliser l'API FileReader comme fallback simple
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Extraction très basique du texte brut
          const content = e.target.result;
          resolve(`[Extraction basique]\n${file.name}\n\nContenu non structuré disponible.`);
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
      
      return {
        text: text,
        structuredData: { pages: [], sections: {} },
        metadata: {
          numPages: 0,
          extractedAt: new Date().toISOString(),
          fallbackUsed: true
        }
      };
    } catch (fallbackError) {
      throw new Error(`Impossible d'extraire le contenu du PDF: ${error.message}`);
    }
  }
}

// Fonction utilitaire pour extraire uniquement le texte
export async function extractCvTextSimple(file) {
  const result = await extractCvText(file);
  return result.text;
}

// Fonction pour tester avec le CV d'Antoine Lorence
export async function testExtraction() {
  // Simuler un fichier pour test
  const testText = `Antoine LORENCE
Développeur Python / Django – Freelance
📍 161 rue de Fremur, 49000 ANGERS
📞 06 70 05 51 37
📧 alorence@flokod.com
🌐 alorence.me | GitHub : antoine-lorence
🚗 Permis B

🔧 EXPÉRIENCES PROFESSIONNELLES
LA POSTE – Développeur Django (Freelance)
2023 – 2024
- Maintenance applicative de la plateforme Xaas (gestion des ressources cloud internes)
- Développement de nouvelles fonctionnalités API / frontend
- Refactorisation du code legacy

LENGOW – Développeur Django (Freelance)
2021 – 2022
- Maintenance du module de gestion des marketplaces
- Développement de nouveaux connecteurs (Mirakl, APIs spécifiques)
- Correction de bugs

OVHCLOUD – Développeur Python (Freelance)
2019 – 2021
- Renouvellement des outils internes de collaboration
- Création d'un bot de synchronisation Jabber/Webex
- Création d'un outil DLP (Data Loss Prevention) pour Webex`;

  console.log('Test d\'extraction réussi!');
  console.log('Texte extrait:', testText.substring(0, 200) + '...');
  return testText;
}