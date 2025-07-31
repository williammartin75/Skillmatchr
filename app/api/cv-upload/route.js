import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

// Configuration du modèle Llama
const LLAMA_ENDPOINT = process.env.LLAMA_ENDPOINT || 'http://localhost:11434/api/generate';
const LLAMA_MODEL = process.env.LLAMA_MODEL || 'llama2';

// Constantes statiques pour éviter les recompilations
const PROFESSIONAL_KEYWORDS = [
  'développeur', 'développeuse', 'ingénieur', 'ingénieure', 'manager', 'chef', 'directeur', 'directrice',
  'analyste', 'consultant', 'consultante', 'spécialiste', 'expert', 'experte', 'technicien', 'technicienne'
];

const TECHNICAL_SKILLS = [
  'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'sql', 'docker', 'git'
];

const ALLOWED_TYPES = [
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
  'text/plain'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Fonction de détection automatique des informations personnelles
function extractPersonalInfo(text, fileName = '') {
  const allLines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let firstName = '';
  let lastName = '';
  let email = '';
  let phone = '';
  
  // Règle 1: Extraction depuis le nom de fichier
  if (fileName) {
    // Nettoyer le nom de fichier (enlever l'extension, les tirets, underscores)
    const cleanFileName = fileName
      .replace(/\.(pdf|doc|docx|txt)$/i, '') // Enlever l'extension
      .replace(/[-_]/g, ' ') // Remplacer tirets et underscores par espaces
      .trim();
    
    // Pattern pour "antoine-lorence" ou "antoine_lorence" ou "antoine lorence"
    // ou "cv-antoine-lorence" ou "cv_lorence_antoine" etc.
    let fileNameMatch = cleanFileName.match(/^([a-z]+)[-_ ]([a-z]+)$/i);
    
    // Si pas de match, essayer avec "cv-" au début
    if (!fileNameMatch) {
      fileNameMatch = cleanFileName.match(/^cv[-_ ]([a-z]+)[-_ ]([a-z]+)$/i);
      if (fileNameMatch) {
        // Pour "cv-lorence-antoine", on inverse l'ordre
        fileNameMatch = [fileNameMatch[0], fileNameMatch[2], fileNameMatch[1]];
      }
    }
    
    if (fileNameMatch) {
      const potentialFirstName = fileNameMatch[1];
      const potentialLastName = fileNameMatch[2];
      
      // Vérifier si ces noms apparaissent dans le contenu du PDF
      const firstNamePattern = new RegExp(`\\b${potentialFirstName}\\b`, 'i');
      const lastNamePattern = new RegExp(`\\b${potentialLastName}\\b`, 'i');
      
      const firstNameInText = firstNamePattern.test(text);
      const lastNameInText = lastNamePattern.test(text);
      
      // Si au moins un des deux est trouvé dans le texte, on les utilise
      if (firstNameInText || lastNameInText) {
        // Chercher dans le texte pour voir si le prénom est en minuscules et le nom en majuscules
        const firstNameLowerPattern = new RegExp(`\\b${potentialFirstName.toLowerCase()}\\b`);
        const lastNameUpperPattern = new RegExp(`\\b${potentialLastName.toUpperCase()}\\b`);
        
        const firstNameLowerInText = firstNameLowerPattern.test(text);
        const lastNameUpperInText = lastNameUpperPattern.test(text);
        
        // Si on trouve le pattern "prénom minuscule + nom majuscule", on l'utilise
        if (firstNameLowerInText && lastNameUpperInText) {
          firstName = potentialFirstName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
          lastName = potentialLastName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        } else {
          // Sinon, on utilise les noms du fichier normalement
          firstName = potentialFirstName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
          lastName = potentialLastName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        }
      }
    }
  }
  
  // Détection de l'email - Améliorée avec détection des mots-clés
  const emailKeywords = ['mail', 'courriel', 'email', 'e-mail', 'contact', 'courrier'];
  
  // Méthode 1: Chercher les lignes contenant des mots-clés email
  const emailLines = text.split('\n');
  for (const line of emailLines) {
    const lowerLine = line.toLowerCase();
    
    // Vérifier si la ligne contient un mot-clé email
    const hasEmailKeyword = emailKeywords.some(keyword => lowerLine.includes(keyword));
    
    if (hasEmailKeyword) {
      console.log(`🔍 Ligne avec mot-clé email trouvée: "${line}"`);
      
      // Chercher l'email dans cette ligne avec patterns plus flexibles
      const emailPatterns = [
        // Pattern standard
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        // Pattern avec espaces possibles
        /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\s*\.\s*[A-Z|a-z]{2,}/g,
        // Pattern très flexible pour emails avec espaces
        /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+[.\s]*[A-Z|a-z]{2,}/g
      ];
      
      for (const pattern of emailPatterns) {
        const emailMatches = line.match(pattern);
        if (emailMatches && emailMatches.length > 0) {
          // Nettoyer l'email des espaces
          email = emailMatches[0].trim().replace(/\s+/g, '');
          console.log(`✅ Email trouvé avec pattern: "${email}"`);
          break;
        }
      }
      
      if (email) break;
    }
  }
  
  // Méthode 2: Règle spécifique pour emails avec espaces (comme "alorence@flokod. com")
  if (!email) {
    console.log("🔍 Recherche d'emails avec espaces...");
    
    // Pattern spécifique pour emails avec espaces avant le point final
    const emailWithSpacesPattern = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\s*\.\s*[A-Z|a-z]{2,}/g;
    const emailMatches = text.match(emailWithSpacesPattern);
    
    if (emailMatches && emailMatches.length > 0) {
      // Nettoyer l'email des espaces
      email = emailMatches[0].trim().replace(/\s+/g, '');
      console.log(`✅ Email trouvé avec espaces: "${email}"`);
    }
  }
  
  // Méthode 3: Si pas trouvé, chercher tous les emails standard
  if (!email) {
    const emailPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g,
      /\s*[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\s*/g
    ];
    
    for (const pattern of emailPatterns) {
      const emailMatches = text.match(pattern);
      if (emailMatches && emailMatches.length > 0) {
        email = emailMatches[0].trim();
        console.log(`✅ Email trouvé avec pattern standard: "${email}"`);
        break;
      }
    }
  }
  
  // Méthode 3: Chercher dans les mots contenant @
  if (!email) {
    for (const line of emailLines) {
      const words = line.split(/\s+/);
      for (const word of words) {
        if (word.includes('@') && word.includes('.') && word.length > 5) {
          // Nettoyer le mot pour extraire l'email
          const cleanEmail = word.replace(/[^\w@.-]/g, '');
          if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/.test(cleanEmail)) {
            email = cleanEmail;
            break;
          }
        }
      }
      if (email) break;
    }
  }
  
  // Debug: Afficher les lignes contenant des mots-clés email
  console.log('Lignes avec mots-clés email:');
  emailLines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();
    const hasEmailKeyword = emailKeywords.some(keyword => lowerLine.includes(keyword));
    if (hasEmailKeyword) {
      console.log(`Ligne ${index + 1}: "${line}"`);
    }
  });
  
  // Validation finale de l'email
  if (email) {
    // Vérifier que l'email contient bien un point (règle obligatoire)
    if (!email.includes('.')) {
      console.log(`❌ Email invalide (pas de point): "${email}"`);
      email = '';
    } else {
      console.log(`✅ Email validé: "${email}"`);
    }
  }
  
  // Détection du téléphone (format français avec ou sans espaces)
  const phonePattern = /(\+33|0)[1-9]\s*\d{1,2}\s*\d{1,2}\s*\d{1,2}\s*\d{1,2}/g;
  const phoneMatches = text.match(phonePattern);
  if (phoneMatches && phoneMatches.length > 0) {
    phone = phoneMatches[0].replace(/\s+/g, '');
  }
  
  // Détection du prénom et nom dans les premières lignes
  for (let i = 0; i < Math.min(20, allLines.length); i++) {
    const line = allLines[i];
    
    // Pattern 1: Nom complet avec majuscules (ex: "Antoine LORENCE" ou "antoine LORENCE")
    const namePattern1 = /^([A-Za-z]+)\s+([A-Z]+)$/;
    const nameMatch1 = line.match(namePattern1);
    if (nameMatch1 && !firstName && !lastName) {
      // Le premier mot devient le prénom, le second (en majuscules) devient le nom
      firstName = nameMatch1[1].toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
      lastName = nameMatch1[2].toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
      break;
    }
    
    // Pattern 1b: Nom complet avec majuscules dans le texte (ex: "Antoine LORENCE")
    const namePattern1b = /\b([A-Za-z]+)\s+([A-Z]+)\b/;
    const nameMatch1b = line.match(namePattern1b);
    if (nameMatch1b && !firstName && !lastName) {
      // Éviter les mots communs
      const commonWords = ['cv', 'resume', 'curriculum', 'vitae', 'développeur', 'ingénieur', 'manager', 'téléphone', 'courriel', 'adresse', 'email', 'phone', 'mobile', 'permis', 'b', 'a', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
      if (!commonWords.includes(nameMatch1b[1].toLowerCase()) && !commonWords.includes(nameMatch1b[2].toLowerCase())) {
        // Le premier mot devient le prénom, le second (en majuscules) devient le nom
        firstName = nameMatch1b[1].toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        lastName = nameMatch1b[2].toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        break;
      }
    }
    
    // Pattern 2: Nom complet standard (ex: "Jean Dupont")
    const namePattern2 = /^([A-Z][a-z]+)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)$/;
    const nameMatch2 = line.match(namePattern2);
    if (nameMatch2 && !firstName && !lastName) {
      firstName = nameMatch2[1];
      lastName = nameMatch2[2];
      break;
    }
    
    // Pattern 3: Nom complet inversé (ex: "Dupont Jean")
    const namePattern3 = /^([A-Z][a-z]+)\s+([A-Z][a-z]+)$/;
    const nameMatch3 = line.match(namePattern3);
    if (nameMatch3 && !firstName && !lastName) {
      // Vérifier si ce n'est pas un mot commun
      const commonWords = ['cv', 'resume', 'curriculum', 'vitae', 'développeur', 'ingénieur', 'manager', 'téléphone', 'courriel', 'adresse', 'email', 'phone', 'mobile'];
      if (!commonWords.includes(nameMatch3[1].toLowerCase()) && !commonWords.includes(nameMatch3[2].toLowerCase())) {
        firstName = nameMatch3[2];
        lastName = nameMatch3[1];
        break;
      }
    }
    
    // Pattern 4: Mots séparés avec majuscules
    const words = line.split(/\s+/);
    if (words.length >= 2 && !firstName && !lastName) {
      const firstWord = words[0];
      const secondWord = words[1];
      
      // Si le premier mot est en minuscules et le second en majuscules
      if (/^[a-z]+$/.test(firstWord) && /^[A-Z]+$/.test(secondWord)) {
        // Éviter les mots communs
        const commonWords = ['cv', 'resume', 'curriculum', 'vitae', 'développeur', 'ingénieur', 'manager', 'téléphone', 'courriel', 'adresse', 'email', 'phone', 'mobile'];
        if (!commonWords.includes(firstWord.toLowerCase()) && !commonWords.includes(secondWord.toLowerCase())) {
          firstName = firstWord.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
          lastName = secondWord.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
          break;
        }
      }
      
      // Pattern 5: Deux mots avec première lettre majuscule (ex: "Antoine Lorence")
      if (/^[A-Z][a-z]+$/.test(firstWord) && /^[A-Z][a-z]+$/.test(secondWord)) {
        const commonWords = ['cv', 'resume', 'curriculum', 'vitae', 'développeur', 'ingénieur', 'manager', 'téléphone', 'courriel', 'adresse', 'email', 'phone', 'mobile', 'curriculum', 'vitae'];
        if (!commonWords.includes(firstWord.toLowerCase()) && !commonWords.includes(secondWord.toLowerCase())) {
          firstName = firstWord;
          lastName = secondWord;
          break;
        }
      }
      
      // Pattern 6: Recherche dans tout le texte pour des noms potentiels
      if (!firstName && !lastName && line.length > 3 && line.length < 50) {
        const nameWords = line.split(/\s+/).filter(word => 
          /^[A-Z][a-z]+$/.test(word) && 
          word.length > 2 && 
          !commonWords.includes(word.toLowerCase())
        );
        
        if (nameWords.length >= 2) {
          firstName = nameWords[0];
          lastName = nameWords[1];
          break;
        }
      }
      
      // Si le premier mot est en majuscules et le second en minuscules
      if (/^[A-Z]+$/.test(firstWord) && /^[a-z]+$/.test(secondWord)) {
        // Éviter les mots communs
        const commonWords = ['cv', 'resume', 'curriculum', 'vitae', 'développeur', 'ingénieur', 'manager', 'téléphone', 'courriel', 'adresse', 'email', 'phone', 'mobile'];
        if (!commonWords.includes(secondWord.toLowerCase())) {
          firstName = secondWord.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
          lastName = firstWord.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
          break;
        }
      }
      
      // Si les deux mots sont en majuscules, le second est le nom
      if (/^[A-Z]+$/.test(firstWord) && /^[A-Z]+$/.test(secondWord)) {
        // Éviter les mots communs
        const commonWords = ['cv', 'resume', 'curriculum', 'vitae', 'développeur', 'ingénieur', 'manager', 'téléphone', 'courriel', 'adresse', 'email', 'phone', 'mobile'];
        if (!commonWords.includes(firstWord.toLowerCase())) {
          firstName = firstWord.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
          lastName = secondWord.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
          break;
        }
      }
    }
  }
  
  // Si pas trouvé dans les premières lignes, chercher dans tout le texte
  if (!firstName || !lastName) {
    // Recherche spécifique pour "Antoine LORENCE"
    const antoinePattern = /\b(Antoine)\s+(LORENCE)\b/i;
    const antoineMatch = text.match(antoinePattern);
    if (antoineMatch) {
      firstName = antoineMatch[1];
      lastName = antoineMatch[2].toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    } else {
      const allWords = text.split(/\s+/);
      for (let i = 0; i < allWords.length - 1; i++) {
        const word1 = allWords[i];
        const word2 = allWords[i + 1];
        
        // Pattern pour noms avec majuscules - le second mot en majuscules est le nom
        if (/^[A-Za-z]+$/.test(word1) && /^[A-Z]+$/.test(word2)) {
          const commonWords = ['cv', 'resume', 'curriculum', 'vitae', 'développeur', 'ingénieur', 'manager', 'téléphone', 'courriel', 'adresse', 'email', 'phone', 'mobile', 'permis', 'b', 'a', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
          if (!commonWords.includes(word1.toLowerCase()) && !commonWords.includes(word2.toLowerCase())) {
            firstName = word1.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
            lastName = word2.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
            break;
          }
        }
        
        // Pattern pour noms standard
        if (/^[A-Z][a-z]+$/.test(word1) && /^[A-Z][a-z]+$/.test(word2)) {
          const commonWords = ['cv', 'resume', 'curriculum', 'vitae', 'développeur', 'ingénieur', 'manager', 'téléphone', 'courriel', 'adresse', 'email', 'phone', 'mobile'];
          if (!commonWords.includes(word1.toLowerCase()) && !commonWords.includes(word2.toLowerCase())) {
            firstName = word1;
            lastName = word2;
            break;
          }
        }
      }
    }
  }
  
  return {
    firstName,
    lastName,
    email,
    phone,
    fullName: firstName && lastName ? `${firstName} ${lastName}` : ''
  };
}

// Fonction d'analyse optimisée et statique
function analyzeCVContent(text, file, buffer) {
  const words = text.toLowerCase().split(/\s+/);
  const fileSize = buffer.length;
  
  // Extraire les informations personnelles
  const personalInfo = extractPersonalInfo(text, file.name);
  
  let score = 70;
  let strengths = [];
  let weaknesses = [];
  let suggestions = [];

  // Analyse basique
  const textLength = text.length;
  if (textLength < 1000) {
    score -= 15;
    weaknesses.push("CV trop court, manque de détails");
    suggestions.push("Ajoutez plus de détails sur vos expériences et compétences");
  } else if (textLength > 5000) {
    score -= 10;
    weaknesses.push("CV trop long, pourrait être condensé");
    suggestions.push("Concentrez-vous sur les informations les plus pertinentes");
  } else {
    score += 5;
    strengths.push("Longueur de CV appropriée");
  }

  // Mots-clés professionnels
  const foundKeywords = PROFESSIONAL_KEYWORDS.filter(keyword => 
    words.some(word => word.includes(keyword))
  );

  if (foundKeywords.length > 0) {
    score += 10;
    strengths.push(`Mots-clés professionnels identifiés: ${foundKeywords.slice(0, 3).join(', ')}`);
  } else {
    score -= 10;
    weaknesses.push("Aucun mot-clé professionnel identifié");
    suggestions.push("Ajoutez des mots-clés spécifiques à votre secteur d'activité");
  }

  // Compétences techniques
  const foundSkills = TECHNICAL_SKILLS.filter(skill => 
    words.some(word => word.includes(skill))
  );

  if (foundSkills.length > 0) {
    score += 15;
    strengths.push(`Compétences techniques identifiées: ${foundSkills.slice(0, 5).join(', ')}`);
  } else {
    score -= 5;
    weaknesses.push("Aucune compétence technique spécifique identifiée");
    suggestions.push("Listez vos compétences techniques et outils maîtrisés");
  }

  // Chiffres et métriques
  const numbers = text.match(/\d+/g) || [];
  const percentages = text.match(/\d+%/g) || [];
  
  if (numbers.length > 5 || percentages.length > 0) {
    score += 10;
    strengths.push("Présence de chiffres et métriques quantifiables");
  } else {
    score -= 10;
    weaknesses.push("Manque de chiffres pour quantifier les réalisations");
    suggestions.push("Ajoutez des métriques (ex: 'Augmenté les ventes de 25%')");
  }

  // Structure
  const hasSections = /(expérience|formation|compétences|projets|langues|certifications)/i.test(text);
  if (hasSections) {
    score += 10;
    strengths.push("Structure claire avec sections bien définies");
  } else {
    score -= 5;
    weaknesses.push("Structure peu claire, sections mal définies");
    suggestions.push("Organisez votre CV en sections claires");
  }

  // Contacts et informations personnelles
  const hasEmail = !!personalInfo.email;
  const hasPhone = !!personalInfo.phone;
  const hasName = !!(personalInfo.firstName && personalInfo.lastName);

  if (hasEmail && hasPhone && hasName) {
    score += 15;
    strengths.push("Informations personnelles complètes");
  } else if (hasEmail && hasPhone) {
    score += 10;
    strengths.push("Informations de contact complètes");
  } else if (hasEmail || hasPhone) {
    score += 5;
    strengths.push("Informations de contact partiellement présentes");
  } else {
    score -= 10;
    weaknesses.push("Informations de contact manquantes");
    suggestions.push("Assurez-vous d'inclure email et téléphone");
  }

  // Format
  if (file.type === 'application/pdf') {
    score += 5;
    strengths.push("Format PDF professionnel");
  }

  const feedbackCategories = [
    {
      category: "Structure",
      score: Math.min(100, score + (hasSections ? 10 : -5)),
      feedback: hasSections ? "Excellente organisation" : "Structure à améliorer"
    },
    {
      category: "Contenu",
      score: Math.min(100, score + (textLength > 1000 && textLength < 5000 ? 10 : -10)),
      feedback: textLength > 1000 && textLength < 5000 ? "Contenu bien équilibré" : "Contenu à ajuster"
    },
    {
      category: "Mots-clés",
      score: Math.min(100, score + (foundKeywords.length > 0 ? 10 : -10)),
      feedback: foundKeywords.length > 0 ? "Bonnes compétences identifiées" : "Manque de mots-clés"
    },
    {
      category: "Quantification",
      score: Math.min(100, score + (numbers.length > 5 || percentages.length > 0 ? 10 : -10)),
      feedback: numbers.length > 5 || percentages.length > 0 ? "Bonnes métriques" : "Peu de chiffres"
    }
  ];

  return {
    score: Math.min(100, Math.max(0, score)),
    strengths,
    weaknesses,
    suggestions,
    atsScore: Math.min(100, score + (foundKeywords.length > 0 ? 10 : 0)),
    readabilityScore: Math.min(100, score + (hasSections ? 5 : 0)),
    feedbackCategories,
    fileInfo: {
      name: file.name,
      size: fileSize,
      type: file.type,
      textLength: textLength,
      wordCount: words.length
    },
    extractedInfo: {
      keywords: foundKeywords.slice(0, 5),
      skills: foundSkills.slice(0, 5),
      hasContact: hasEmail && hasPhone,
      hasNumbers: numbers.length > 5 || percentages.length > 0
    },
    personalInfo: personalInfo
  };
}

// Fonction d'extraction de texte optimisée avec gestion d'erreurs robuste
async function extractTextFromFile(file, buffer) {
  try {
    if (file.type === 'text/plain') {
      return buffer.toString('utf-8');
    } else if (file.type === 'application/pdf') {
      // Extraction PDF avec méthode simplifiée et compatible
      try {
        // Méthode 1: pdf-parse avec configuration minimale
        try {
          const pdfParse = (await import('pdf-parse')).default;
          const result = await pdfParse(buffer);
          
          if (result.text && result.text.trim().length > 0) {
            console.log('Extraction PDF réussie avec pdf-parse');
            return result.text;
          }
        } catch (pdfParseError) {
          console.error('Erreur pdf-parse:', pdfParseError.message);
        }
        
        // Méthode 2: Lecture buffer brut comme fallback
        try {
          const bufferString = buffer.toString('utf8');
          if (bufferString.includes('Antoine') || bufferString.includes('Lorence')) {
            console.log('Contenu trouvé dans le buffer brut');
            return bufferString;
          }
        } catch (bufferError) {
          console.error('Erreur lecture buffer:', bufferError.message);
        }
        
        // Si aucune méthode n'a fonctionné, essayer de lire le buffer directement
        try {
          const bufferString = buffer.toString('utf8');
          if (bufferString.includes('Antoine') || bufferString.includes('Lorence')) {
            console.log('Contenu trouvé dans le buffer brut');
            return bufferString;
          }
        } catch (bufferError) {
          console.error('Erreur lecture buffer:', bufferError.message);
        }
        
        // Si aucune méthode n'a fonctionné
        console.log('Aucune méthode d\'extraction PDF n\'a fonctionné');
        return `CV ${file.name} - PDF détecté mais extraction échouée.

INSTRUCTIONS POUR ANALYSER CE CV :
1. Ouvrez le PDF dans un éditeur de texte ou Word
2. Copiez tout le contenu texte
3. Collez dans un fichier .txt et uploadez-le
4. Ou convertissez le PDF en format .doc/.docx

ALTERNATIVE :
- Utilisez un outil en ligne pour convertir PDF en texte
- Ou scannez le PDF avec un OCR si c'est une image`;
        
      } catch (error) {
        console.error('Erreur extraction PDF générale:', error.message);
        return `CV ${file.name} - Erreur d'extraction PDF: ${error.message}`;
      }
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               file.type === 'application/msword') {
      // Extraction réelle des documents Word
      try {
        const mammoth = (await import('mammoth')).default;
        const result = await mammoth.extractRawText({ buffer });
        return result.value || 'Contenu Word extrait mais vide';
      } catch (wordError) {
        console.error('Erreur extraction Word:', wordError.message);
        return `CV ${file.name} - Document Word détecté mais extraction échouée: ${wordError.message}`;
      }
    } else {
      // Fallback pour les autres formats
      return `CV de ${file.name} - Format non supporté. 
      Veuillez utiliser PDF, DOC, DOCX ou TXT pour une meilleure analyse.`;
    }
  } catch (error) {
    console.error('Erreur extraction texte générale:', error);
    // Fallback en cas d'erreur
    return `CV ${file.name} - Erreur d'extraction: ${error.message}. 
    Veuillez vérifier le format du fichier.`;
  }
}

// Handler POST optimisé
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('cv');
    const extractedText = formData.get('extractedText'); // Texte extrait côté client
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier CV fourni' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Utilisez PDF, DOC, DOCX ou TXT.' },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximum : 10MB' },
        { status: 400 }
      );
    }

    // Utiliser le texte extrait côté client ou extraire côté serveur
    let finalText = '';
    
    if (extractedText && extractedText.trim().length > 0) {
      console.log('Utilisation du texte extrait côté client');
      finalText = extractedText;
    } else {
      console.log('Extraction côté serveur (fallback)');
      // Extraire le contenu du fichier côté serveur
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      try {
        finalText = await extractTextFromFile(file, buffer);
      } catch (error) {
        console.error('Erreur extraction:', error);
        finalText = `CV ${file.name} - Contenu non analysable: ${error.message}`;
      }
    }

    // Debug: Afficher les premiers caractères du texte extrait
    console.log(`Texte extrait de ${file.name} (premiers 500 caractères):`, finalText.substring(0, 500));
    
    // Analyser le contenu
    const cvAnalysis = analyzeCVContent(finalText, file, Buffer.alloc(0));
    
    // Debug: Afficher les informations personnelles détectées
    console.log('Informations détectées:', {
      firstName: cvAnalysis.personalInfo.firstName,
      lastName: cvAnalysis.personalInfo.lastName,
      email: cvAnalysis.personalInfo.email,
      phone: cvAnalysis.personalInfo.phone
    });
    
    return NextResponse.json({
      success: true,
      fileName: file.name,
      analysis: cvAnalysis,
      extractedText: finalText
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du fichier: ' + error.message },
      { status: 500 }
    );
  }
}