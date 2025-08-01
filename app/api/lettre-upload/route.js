import { NextResponse } from 'next/server';

// Constantes pour l'analyse des lettres de motivation
const MOTIVATION_KEYWORDS = [
  'motivé', 'motivée', 'passionné', 'passionnée', 'intéressé', 'intéressée', 'souhaite', 'désire', 'aimerais',
  'opportunité', 'challenge', 'défi', 'projet', 'équipe', 'entreprise', 'poste', 'fonction', 'mission'
];

const PROFESSIONAL_TONE_KEYWORDS = [
  'professionnel', 'professionnelle', 'expérience', 'compétences', 'formation', 'diplôme', 'certification',
  'réalisations', 'projets', 'responsabilités', 'gestion', 'coordination', 'développement'
];

const STRUCTURE_KEYWORDS = [
  'madame', 'monsieur', 'cher', 'chère', 'objet', 'référence', 'candidature', 'poste', 'entreprise',
  'expérience', 'formation', 'motivation', 'disponibilité', 'entretien', 'remerciements', 'cordialement'
];

const ALLOWED_TYPES = [
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
  'text/plain'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Fonction d'analyse du contenu de la lettre de motivation
function analyzeLettreContent(text, file, buffer) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const words = text.toLowerCase().split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  
  // Analyse de la structure
  let structureScore = 0;
  let hasIntroduction = false;
  let hasDevelopment = false;
  let hasConclusion = false;
  let hasProfessionalGreeting = false;
  let hasProfessionalClosing = false;
  
  // Vérifier la présence d'une formule de politesse d'ouverture
  const greetingPatterns = [
    /madame,/i, /monsieur,/i, /cher monsieur/i, /chère madame/i, /objet:/i, /référence:/i
  ];
  
  for (const pattern of greetingPatterns) {
    if (pattern.test(text)) {
      hasProfessionalGreeting = true;
      structureScore += 15;
      break;
    }
  }
  
  // Vérifier la présence d'une formule de politesse de fermeture
  const closingPatterns = [
    /cordialement/i, /sincèrement/i, /respectueusement/i, /veuillez agréer/i, /je vous prie/i
  ];
  
  for (const pattern of closingPatterns) {
    if (pattern.test(text)) {
      hasProfessionalClosing = true;
      structureScore += 15;
      break;
    }
  }
  
  // Analyser la structure en paragraphes
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  if (paragraphs.length >= 3) {
    // Premier paragraphe - introduction
    if (paragraphs[0].length > 50) {
      hasIntroduction = true;
      structureScore += 20;
    }
    
    // Paragraphes du milieu - développement
    if (paragraphs.length >= 2 && paragraphs.slice(1, -1).some(p => p.length > 100)) {
      hasDevelopment = true;
      structureScore += 20;
    }
    
    // Dernier paragraphe - conclusion
    if (paragraphs[paragraphs.length - 1].length > 30) {
      hasConclusion = true;
      structureScore += 20;
    }
  }
  
  // Analyse du contenu
  let contentScore = 0;
  let motivationScore = 0;
  let personalizationScore = 0;
  
  // Compter les mots-clés de motivation
  const motivationCount = MOTIVATION_KEYWORDS.filter(keyword => 
    text.toLowerCase().includes(keyword)
  ).length;
  motivationScore = Math.min(100, (motivationCount / MOTIVATION_KEYWORDS.length) * 100);
  
  // Compter les mots-clés professionnels
  const professionalCount = PROFESSIONAL_TONE_KEYWORDS.filter(keyword => 
    text.toLowerCase().includes(keyword)
  ).length;
  contentScore = Math.min(100, (professionalCount / PROFESSIONAL_TONE_KEYWORDS.length) * 100);
  
  // Analyser la personnalisation (présence de mots spécifiques à l'entreprise)
  const specificWords = ['votre', 'entreprise', 'société', 'groupe', 'équipe', 'projet', 'mission'];
  const specificCount = specificWords.filter(word => 
    text.toLowerCase().includes(word)
  ).length;
  personalizationScore = Math.min(100, (specificCount / specificWords.length) * 100);
  
  // Score de lisibilité (longueur des phrases)
  const avgSentenceLength = sentences.reduce((sum, sentence) => sum + sentence.split(' ').length, 0) / sentences.length;
  const readabilityScore = avgSentenceLength <= 20 ? 100 : Math.max(0, 100 - (avgSentenceLength - 20) * 2);
  
  // Score ATS (présence de mots-clés pertinents)
  const atsKeywords = [...MOTIVATION_KEYWORDS, ...PROFESSIONAL_TONE_KEYWORDS];
  const atsCount = atsKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword)
  ).length;
  const atsScore = Math.min(100, (atsCount / atsKeywords.length) * 100);
  
  // Score global
  const globalScore = Math.round((structureScore + contentScore + motivationScore + personalizationScore) / 4);
  
  // Générer les feedbacks
  const strengths = [];
  const weaknesses = [];
  const suggestions = [];
  
  if (hasProfessionalGreeting) {
    strengths.push("Formule de politesse d'ouverture appropriée");
  } else {
    weaknesses.push("Formule de politesse d'ouverture manquante ou inappropriée");
    suggestions.push("Ajouter une formule de politesse professionnelle en début de lettre");
  }
  
  if (hasProfessionalClosing) {
    strengths.push("Formule de politesse de fermeture appropriée");
  } else {
    weaknesses.push("Formule de politesse de fermeture manquante");
    suggestions.push("Terminer par une formule de politesse professionnelle");
  }
  
  if (hasIntroduction) {
    strengths.push("Introduction présente et bien structurée");
  } else {
    weaknesses.push("Introduction trop courte ou absente");
    suggestions.push("Développer l'introduction pour présenter votre candidature");
  }
  
  if (hasDevelopment) {
    strengths.push("Développement du contenu bien équilibré");
  } else {
    weaknesses.push("Développement insuffisant");
    suggestions.push("Développer davantage vos arguments et expériences");
  }
  
  if (hasConclusion) {
    strengths.push("Conclusion présente et appropriée");
  } else {
    weaknesses.push("Conclusion manquante ou trop courte");
    suggestions.push("Ajouter une conclusion qui récapitule votre motivation");
  }
  
  if (motivationScore > 70) {
    strengths.push("Motivation bien exprimée");
  } else {
    weaknesses.push("Motivation insuffisamment exprimée");
    suggestions.push("Renforcer l'expression de votre motivation pour le poste");
  }
  
  if (personalizationScore > 60) {
    strengths.push("Lettre personnalisée pour l'entreprise");
  } else {
    weaknesses.push("Manque de personnalisation");
    suggestions.push("Personnaliser davantage le contenu pour l'entreprise ciblée");
  }
  
  if (readabilityScore > 80) {
    strengths.push("Lisibilité excellente");
  } else {
    weaknesses.push("Phrases trop longues");
    suggestions.push("Raccourcir les phrases pour améliorer la lisibilité");
  }
  
  // Ajouter des suggestions générales si pas assez de suggestions
  if (suggestions.length < 3) {
    suggestions.push("Ajouter des exemples concrets de vos réalisations");
    suggestions.push("Mentionner des projets ou technologies spécifiques");
  }
  
  return {
    score: globalScore,
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 3),
    suggestions: suggestions.slice(0, 3),
    atsScore: Math.round(atsScore),
    readabilityScore: Math.round(readabilityScore),
    feedbackCategories: [
      {
        category: "Structure",
        score: Math.round(structureScore),
        feedback: hasIntroduction && hasDevelopment && hasConclusion ? 
          "Excellente organisation avec introduction, développement et conclusion" :
          "Structure à améliorer - vérifiez l'introduction, le développement et la conclusion"
      },
      {
        category: "Contenu",
        score: Math.round(contentScore),
        feedback: contentScore > 70 ? 
          "Contenu professionnel et pertinent" :
          "Contenu à enrichir avec plus d'éléments professionnels"
      },
      {
        category: "Motivation",
        score: Math.round(motivationScore),
        feedback: motivationScore > 70 ? 
          "Bonne expression de la motivation pour le poste" :
          "Motivation à renforcer dans le contenu"
      },
      {
        category: "Personnalisation",
        score: Math.round(personalizationScore),
        feedback: personalizationScore > 60 ? 
          "Lettre bien adaptée à l'entreprise ciblée" :
          "Manque de lien spécifique avec l'entreprise ciblée"
      }
    ]
  };
}

// Fonction d'extraction de texte depuis un fichier
async function extractTextFromFile(file, buffer) {
  try {
    if (file.type === 'text/plain') {
      return buffer.toString('utf-8');
    } else if (file.type === 'application/pdf') {
      // Extraction PDF
      try {
        const pdfParse = (await import('pdf-parse')).default;
        const result = await pdfParse(buffer);
        
        if (result.text && result.text.trim().length > 0) {
          console.log('Extraction PDF réussie avec pdf-parse');
          return result.text;
        }
      } catch (pdfParseError) {
        console.error('Erreur pdf-parse:', pdfParseError.message);
        // Fallback - retourner un texte par défaut
        return `Lettre de motivation ${file.name} - PDF détecté mais extraction échouée. Veuillez utiliser un fichier TXT ou DOCX pour une meilleure analyse.`;
      }
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               file.type === 'application/msword') {
      // Extraction Word
      try {
        const mammoth = (await import('mammoth')).default;
        const result = await mammoth.extractRawText({ buffer });
        return result.value || 'Contenu Word extrait mais vide';
      } catch (wordError) {
        console.error('Erreur extraction Word:', wordError.message);
        return `Lettre de motivation ${file.name} - Document Word détecté mais extraction échouée: ${wordError.message}`;
      }
    } else {
      // Fallback pour les autres formats
      return `Lettre de motivation de ${file.name} - Format non supporté. 
      Veuillez utiliser PDF, DOC, DOCX ou TXT pour une meilleure analyse.`;
    }
  } catch (error) {
    console.error('Erreur extraction texte générale:', error);
    // Fallback en cas d'erreur
    return `Lettre de motivation ${file.name} - Erreur d'extraction: ${error.message}. 
    Veuillez vérifier le format du fichier.`;
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('lettre');
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
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
        { error: 'Fichier trop volumineux. Taille maximale : 10MB.' },
        { status: 400 }
      );
    }
    
    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Extraire le texte du fichier
    const text = await extractTextFromFile(file, buffer);
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Impossible d\'extraire le texte du fichier' },
        { status: 400 }
      );
    }
    
    // Analyser le contenu de la lettre
    const analysis = analyzeLettreContent(text, file, buffer);
    
    return NextResponse.json({
      success: true,
      analysis: analysis,
      extractedText: text,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    });
    
  } catch (error) {
    console.error('Erreur lors du traitement de la lettre:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la lettre de motivation' },
      { status: 500 }
    );
  }
} 