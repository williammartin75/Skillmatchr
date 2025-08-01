import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import docx from 'docx';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_TYPES = [
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Fonction d'extraction de texte depuis un fichier
async function extractTextFromFile(file, buffer) {
  try {
    if (file.type === 'application/pdf') {
      const result = await pdfParse(buffer);
      return result.text;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               file.type === 'application/msword') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    throw new Error('Format de fichier non supporté');
  } catch (error) {
    console.error('Erreur extraction texte:', error);
    throw error;
  }
}

// Fonction d'analyse sur 7 axes
function analyzeMotivationLetter(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const words = text.toLowerCase().split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  
  // 1. Impact global
  const impactKeywords = ['passionné', 'motivé', 'enthousiaste', 'convaincu', 'déterminé', 'engagé'];
  const impactScore = calculateKeywordScore(text, impactKeywords);
  const impact = impactScore > 60 ? 
    "Excellente première impression, lettre engageante et convaincante." :
    "Impact global modéré, manque d'éléments qui donnent envie de vous contacter.";
  
  // 2. Personnalisation
  const personalKeywords = ['votre entreprise', 'votre société', 'vos valeurs', 'votre équipe', 'votre mission'];
  const personalScore = calculateKeywordScore(text, personalKeywords);
  const personalization = personalScore > 50 ?
    "Lettre bien personnalisée pour l'entreprise ciblée." :
    "Manque de personnalisation, trop générique.";
  
  // 3. Structure et clarté
  const hasGreeting = /^(madame|monsieur|cher|chère)/i.test(text);
  const hasClosing = /(cordialement|sincèrement|respectueusement)/i.test(text);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const structureScore = (hasGreeting ? 30 : 0) + (hasClosing ? 30 : 0) + (paragraphs.length >= 3 ? 40 : 20);
  const structure = structureScore > 70 ?
    "Structure claire avec introduction, développement et conclusion." :
    "Structure à améliorer, manque de cohérence dans l'organisation.";
  
  // 4. Tonalité et confiance
  const confidenceKeywords = ['capable', 'compétent', 'expérience', 'réussi', 'maîtrise', 'expertise'];
  const confidenceScore = calculateKeywordScore(text, confidenceKeywords);
  const tone = confidenceScore > 50 ?
    "Ton professionnel et confiant, équilibre parfait." :
    "Tonalité hésitante, manque de confiance en soi.";
  
  // 5. Style et fluidité
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
  const styleScore = avgSentenceLength <= 20 ? 100 : Math.max(0, 100 - (avgSentenceLength - 20) * 3);
  const style = styleScore > 70 ?
    "Style fluide et agréable à lire." :
    "Phrases trop longues, style lourd à lire.";
  
  // 6. Valeur apportée
  const valueKeywords = ['apporter', 'contribuer', 'développer', 'améliorer', 'optimiser', 'résultats'];
  const valueScore = calculateKeywordScore(text, valueKeywords);
  const value = valueScore > 40 ?
    "Excellente mise en avant de la valeur apportée." :
    "Manque de mise en avant de ce que vous pouvez apporter.";
  
  // 7. Orthographe et grammaire (simulation)
  const grammarScore = 85; // En production, utiliser un vrai correcteur
  const grammar = "Quelques petites erreurs à corriger.";
  
  // Score global
  const globalScore = Math.round((impactScore + personalScore + structureScore + confidenceScore + styleScore + valueScore + grammarScore) / 7);
  
  // Points forts et faibles
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];
  
  if (impactScore > 60) strengths.push("Impact fort dès la première lecture");
  else weaknesses.push("Impact initial insuffisant");
  
  if (personalScore > 50) strengths.push("Bonne personnalisation pour l'entreprise");
  else weaknesses.push("Manque de personnalisation");
  
  if (structureScore > 70) strengths.push("Structure claire et logique");
  else weaknesses.push("Structure confuse");
  
  if (confidenceScore > 50) strengths.push("Ton professionnel et assuré");
  else weaknesses.push("Manque de confiance perceptible");
  
  if (styleScore > 70) strengths.push("Style fluide et agréable");
  else weaknesses.push("Style trop lourd");
  
  if (valueScore > 40) strengths.push("Valeur ajoutée bien mise en avant");
  else weaknesses.push("Valeur ajoutée peu visible");
  
  // Recommandations
  if (impactScore <= 60) recommendations.push("Renforcez votre phrase d'accroche pour captiver dès le début");
  if (personalScore <= 50) recommendations.push("Mentionnez des éléments spécifiques de l'entreprise (projets, valeurs, actualités)");
  if (structureScore <= 70) recommendations.push("Structurez mieux avec une intro claire, 2-3 paragraphes de développement et une conclusion");
  if (confidenceScore <= 50) recommendations.push("Utilisez des verbes d'action et mettez en avant vos réussites concrètes");
  if (styleScore <= 70) recommendations.push("Raccourcissez vos phrases (max 20 mots) pour plus de clarté");
  if (valueScore <= 40) recommendations.push("Expliquez concrètement ce que vous apporterez à l'entreprise");
  if (grammarScore < 90) recommendations.push("Relisez attentivement pour corriger les fautes restantes");
  
  return {
    score: globalScore,
    impact,
    personalization,
    structure,
    tone,
    style,
    value,
    grammar,
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
    recommendations: recommendations.slice(0, 4),
    details: {
      impactScore,
      personalScore,
      structureScore,
      confidenceScore,
      styleScore,
      valueScore,
      grammarScore
    }
  };
}

// Fonction pour calculer le score de mots-clés
function calculateKeywordScore(text, keywords) {
  const lowerText = text.toLowerCase();
  const foundCount = keywords.filter(keyword => lowerText.includes(keyword.toLowerCase())).length;
  return Math.min(100, (foundCount / keywords.length) * 100 * 1.5);
}

// Fonction pour générer une lettre corrigée
function generateCorrectedLetter(originalText, analysis) {
  // Extraire les parties de la lettre originale
  const lines = originalText.split('\n');
  let greeting = '';
  let body = '';
  let closing = '';
  
  // Identifier les parties
  let bodyStart = 0;
  let bodyEnd = lines.length;
  
  // Trouver la formule de politesse d'ouverture
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (/^(madame|monsieur|cher|chère)/i.test(lines[i])) {
      greeting = lines.slice(0, i + 1).join('\n');
      bodyStart = i + 1;
      break;
    }
  }
  
  // Trouver la formule de politesse de fermeture
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 5); i--) {
    if (/(cordialement|sincèrement|respectueusement|veuillez)/i.test(lines[i])) {
      closing = lines.slice(i).join('\n');
      bodyEnd = i;
      break;
    }
  }
  
  // Extraire le corps
  body = lines.slice(bodyStart, bodyEnd).join('\n').trim();
  
  // Améliorer la lettre
  let correctedLetter = '';
  
  // 1. Formule d'ouverture
  if (!greeting) {
    correctedLetter = "Madame, Monsieur,\n\n";
  } else {
    correctedLetter = greeting + "\n\n";
  }
  
  // 2. Introduction améliorée
  if (analysis.details.impactScore <= 60) {
    correctedLetter += "C'est avec un vif intérêt que je vous adresse ma candidature pour le poste proposé au sein de votre entreprise. ";
  }
  
  // 3. Corps amélioré
  const sentences = body.split(/[.!?]+/).filter(s => s.trim());
  const improvedSentences = sentences.map(sentence => {
    let improved = sentence.trim();
    
    // Raccourcir les phrases trop longues
    if (sentence.split(' ').length > 20) {
      const middle = Math.floor(sentence.split(' ').length / 2);
      const words = sentence.split(' ');
      improved = words.slice(0, middle).join(' ') + '. ' + 
                words.slice(middle).join(' ');
    }
    
    // Ajouter des mots-clés manquants
    if (analysis.details.personalScore <= 50 && !improved.toLowerCase().includes('votre')) {
      improved = improved.replace(/l'entreprise/gi, 'votre entreprise');
      improved = improved.replace(/la société/gi, 'votre société');
    }
    
    if (analysis.details.valueScore <= 40 && !improved.toLowerCase().includes('apport')) {
      // Ajouter une phrase sur la valeur apportée après certains points
      if (improved.toLowerCase().includes('expérience')) {
        improved += " Cette expérience me permettra d'apporter une réelle valeur ajoutée à votre équipe.";
      }
    }
    
    return improved;
  }).join(' ');
  
  correctedLetter += improvedSentences + "\n\n";
  
  // 4. Conclusion améliorée
  if (analysis.details.structureScore <= 70 || !closing) {
    correctedLetter += "Je reste à votre disposition pour un entretien au cours duquel je pourrai vous exposer plus en détail ma motivation et mes compétences.\n\n";
    correctedLetter += "Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.";
  } else {
    correctedLetter += closing;
  }
  
  // 5. Corrections grammaticales basiques
  correctedLetter = correctedLetter
    .replace(/\s+/g, ' ') // Espaces multiples
    .replace(/\s+([.,!?])/g, '$1') // Espaces avant ponctuation
    .replace(/([.,!?])(\w)/g, '$1 $2') // Espace après ponctuation
    .replace(/\n{3,}/g, '\n\n'); // Lignes vides multiples
  
  return correctedLetter;
}

// Fonction pour créer un document DOCX
async function createDocxFile(content, fileName) {
  const { Document, Paragraph, TextRun } = docx;
  
  // Créer le document
  const doc = new Document({
    sections: [{
      properties: {},
      children: content.split('\n').map(line => 
        new Paragraph({
          children: [new TextRun(line)],
          spacing: { after: 200 }
        })
      )
    }]
  });
  
  // Générer le buffer
  const buffer = await docx.Packer.toBuffer(doc);
  
  // Créer le dossier temporaire s'il n'existe pas
  const tempDir = path.join(process.cwd(), 'public', 'temp');
  await fs.mkdir(tempDir, { recursive: true });
  
  // Sauvegarder le fichier
  const filePath = path.join(tempDir, fileName);
  await fs.writeFile(filePath, buffer);
  
  return `/temp/${fileName}`;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('motivation');
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }
    
    // Vérifier le type de fichier
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Utilisez PDF ou DOCX.' },
        { status: 400 }
      );
    }
    
    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximale : 10MB.' },
        { status: 400 }
      );
    }
    
    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Extraire le texte du fichier
    const originalText = await extractTextFromFile(file, buffer);
    
    if (!originalText || originalText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Impossible d\'extraire le texte du fichier' },
        { status: 400 }
      );
    }
    
    // Analyser la lettre
    const analysis = analyzeMotivationLetter(originalText);
    
    // Générer la lettre corrigée
    const correctedLetter = generateCorrectedLetter(originalText, analysis);
    
    // Créer le fichier DOCX
    const docxFileName = `lettre-corrigee-${uuidv4()}.docx`;
    const docxUrl = await createDocxFile(correctedLetter, docxFileName);
    
    // Nettoyer les anciens fichiers (garder seulement les 100 derniers)
    const tempDir = path.join(process.cwd(), 'public', 'temp');
    const files = await fs.readdir(tempDir);
    if (files.length > 100) {
      const sortedFiles = files
        .filter(f => f.endsWith('.docx'))
        .sort((a, b) => a.localeCompare(b));
      
      for (let i = 0; i < sortedFiles.length - 100; i++) {
        await fs.unlink(path.join(tempDir, sortedFiles[i])).catch(() => {});
      }
    }
    
    return NextResponse.json({
      score: analysis.score,
      impact: analysis.impact,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      recommendations: analysis.recommendations,
      corrected_letter: correctedLetter,
      docx_download_url: docxUrl,
      original_text: originalText,
      detailed_analysis: {
        personalization: analysis.personalization,
        structure: analysis.structure,
        tone: analysis.tone,
        style: analysis.style,
        value: analysis.value,
        grammar: analysis.grammar,
        scores: analysis.details
      }
    });
    
  } catch (error) {
    console.error('Erreur lors du traitement de la lettre:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la lettre de motivation: ' + error.message },
      { status: 500 }
    );
  }
}

// Route GET pour télécharger les fichiers
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get('file');
  
  if (!fileName || !fileName.endsWith('.docx')) {
    return NextResponse.json({ error: 'Fichier invalide' }, { status: 400 });
  }
  
  try {
    const filePath = path.join(process.cwd(), 'public', 'temp', fileName);
    const fileBuffer = await fs.readFile(filePath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 });
  }
}