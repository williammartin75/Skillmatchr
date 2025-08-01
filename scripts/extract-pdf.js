#!/usr/bin/env node

const fs = require('fs');
const pdfParse = require('pdf-parse');

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

async function extractPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    
    const data = await pdfParse(dataBuffer, {
      max: 0,
      version: 'v2.0.550'
    });
    
    if (data && data.text) {
      const cleanedText = cleanText(data.text);
      // Sortir le résultat en JSON pour l'API
      console.log(JSON.stringify({
        success: true,
        text: cleanedText,
        pages: data.numpages,
        info: data.info
      }));
    } else {
      console.log(JSON.stringify({
        success: false,
        error: 'Aucun texte extrait du PDF'
      }));
    }
  } catch (error) {
    console.log(JSON.stringify({
      success: false,
      error: error.message
    }));
  }
}

// Récupérer le chemin du fichier depuis les arguments
const filePath = process.argv[2];

if (!filePath) {
  console.log(JSON.stringify({
    success: false,
    error: 'Aucun fichier spécifié'
  }));
  process.exit(1);
}

extractPDF(filePath);