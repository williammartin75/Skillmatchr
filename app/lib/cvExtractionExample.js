/**
 * Exemple d'utilisation de la fonction extractCvText
 * dans différents contextes d'application
 */

import extractCvText, { extractCvTextSimple } from './extractCvText.js';
import extractCvTextWithOCR from './extractCvTextWithOCR.js';

/**
 * Exemple 1: Extraction simple dans un formulaire d'upload
 */
export async function handleCvUpload(fileInput) {
  const file = fileInput.files[0];
  
  if (!file || !file.type.includes('pdf')) {
    throw new Error('Veuillez sélectionner un fichier PDF');
  }
  
  try {
    // Extraction simple du texte
    const cvText = await extractCvTextSimple(file);
    
    // Analyse du CV pour pré-remplir un formulaire
    const personalInfo = extractPersonalInfo(cvText);
    
    return {
      success: true,
      text: cvText,
      personalInfo
    };
  } catch (error) {
    console.error('Erreur extraction CV:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Exemple 2: Extraction avec analyse structurée
 */
export async function analyzeCvStructure(file) {
  try {
    // Extraction complète avec structure
    const result = await extractCvText(file);
    
    // Analyser les sections détectées
    const analysis = {
      totalPages: result.metadata.numPages,
      totalCharacters: result.text.length,
      sections: {}
    };
    
    // Compter le contenu de chaque section
    Object.entries(result.structuredData.sections).forEach(([sectionName, content]) => {
      analysis.sections[sectionName] = {
        lines: content.length,
        characters: content.join(' ').length,
        keywords: extractKeywords(content.join(' '))
      };
    });
    
    return analysis;
  } catch (error) {
    throw new Error(`Analyse échouée: ${error.message}`);
  }
}

/**
 * Exemple 3: Extraction avec gestion des PDFs scannés
 */
export async function extractCvSmartly(file, options = {}) {
  try {
    console.log(`📄 Traitement du CV: ${file.name}`);
    
    // Utiliser la version avec OCR qui détecte automatiquement
    const result = await extractCvTextWithOCR(file, {
      checkScanned: true,
      autoOCR: options.enableOCR || false,
      ocrLanguages: options.languages || ['fra', 'eng']
    });
    
    // Vérifier la qualité de l'extraction
    if (result.metadata.lowTextWarning) {
      console.warn('⚠️  Peu de texte extrait - le PDF pourrait être scanné');
    }
    
    if (result.metadata.ocrUsed) {
      console.log('🔍 OCR utilisé pour l\'extraction');
    }
    
    return result;
  } catch (error) {
    throw new Error(`Extraction échouée: ${error.message}`);
  }
}

/**
 * Utilitaire: Extraire les informations personnelles
 */
function extractPersonalInfo(text) {
  const info = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    skills: []
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
  
  // Nom (première ligne qui ressemble à un nom)
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  for (const line of lines.slice(0, 10)) {
    const nameMatch = line.match(patterns.name);
    if (nameMatch) {
      info.firstName = nameMatch[1];
      info.lastName = nameMatch[2];
      break;
    }
  }
  
  // Compétences communes
  const skillKeywords = ['Python', 'Django', 'JavaScript', 'React', 'Node.js', 
                        'Java', 'C++', 'SQL', 'Git', 'Docker', 'AWS'];
  
  info.skills = skillKeywords.filter(skill => 
    new RegExp(`\\b${skill}\\b`, 'i').test(text)
  );
  
  return info;
}

/**
 * Utilitaire: Extraire les mots-clés d'un texte
 */
function extractKeywords(text) {
  // Mots vides à ignorer
  const stopWords = new Set(['de', 'le', 'la', 'les', 'un', 'une', 'et', 
                            'ou', 'dans', 'pour', 'avec', 'sur', 'à']);
  
  // Nettoyer et diviser le texte
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
  
  // Compter les occurrences
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Retourner les 10 mots les plus fréquents
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

/**
 * Exemple d'intégration complète dans une page
 */
export function setupCvUploadForm() {
  const form = document.getElementById('cv-upload-form');
  const fileInput = document.getElementById('cv-file');
  const resultDiv = document.getElementById('cv-result');
  
  if (!form || !fileInput || !resultDiv) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!fileInput.files[0]) {
      alert('Veuillez sélectionner un fichier CV');
      return;
    }
    
    // Afficher un loader
    resultDiv.innerHTML = '<p>🔄 Extraction en cours...</p>';
    
    try {
      // Extraire le CV
      const result = await extractCvSmartly(fileInput.files[0], {
        enableOCR: false // Activer si nécessaire
      });
      
      // Analyser la structure
      const analysis = await analyzeCvStructure(fileInput.files[0]);
      
      // Afficher les résultats
      resultDiv.innerHTML = `
        <h3>✅ CV extrait avec succès</h3>
        <div class="cv-stats">
          <p>📄 Pages: ${analysis.totalPages}</p>
          <p>📝 Caractères: ${analysis.totalCharacters}</p>
          <p>📑 Sections: ${Object.keys(analysis.sections).length}</p>
        </div>
        <div class="cv-sections">
          <h4>Sections détectées:</h4>
          <ul>
            ${Object.entries(analysis.sections).map(([name, data]) => `
              <li>${name} (${data.lines} lignes)</li>
            `).join('')}
          </ul>
        </div>
        <div class="cv-preview">
          <h4>Aperçu:</h4>
          <pre>${result.text.substring(0, 500)}...</pre>
        </div>
      `;
      
      // Pré-remplir le formulaire si présent
      const personalInfo = extractPersonalInfo(result.text);
      if (personalInfo.email) {
        const emailField = document.getElementById('email');
        if (emailField) emailField.value = personalInfo.email;
      }
      
    } catch (error) {
      resultDiv.innerHTML = `
        <div class="error">
          ❌ Erreur: ${error.message}
        </div>
      `;
    }
  });
}

// Auto-initialiser si dans le navigateur
if (typeof window !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCvUploadForm);
}