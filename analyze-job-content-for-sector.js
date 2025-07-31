const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Mots-clés sectoriels avec scores
const sectorKeywords = {
  'Informatique & Digital': {
    title: ['développeur', 'ingénieur informatique', 'data scientist', 'devops', 'fullstack', 'frontend', 'backend', 'software', 'programmeur'],
    skills: ['java', 'python', 'javascript', 'react', 'angular', 'vue', 'node.js', 'sql', 'mongodb', 'docker', 'kubernetes', 'aws', 'azure'],
    description: ['développement', 'application', 'logiciel', 'web', 'mobile', 'api', 'base de données', 'cloud']
  },
  'BTP & Construction': {
    title: ['ingénieur btp', 'conducteur de travaux', 'chef de chantier', 'géomètre', 'architecte', 'maçon', 'charpentier'],
    skills: ['autocad', 'revit', 'sketchup', 'bim', 'planification', 'gestion de chantier'],
    description: ['chantier', 'construction', 'bâtiment', 'travaux', 'maçonnerie', 'gros œuvre']
  },
  'Banque & Assurance': {
    title: ['conseiller bancaire', 'analyste financier', 'actuaire', 'gestionnaire de sinistres', 'courtier'],
    skills: ['excel', 'vba', 'sas', 'r', 'risk management', 'compliance'],
    description: ['banque', 'assurance', 'financier', 'crédit', 'investissement', 'risque']
  },
  'Distribution & Commerce': {
    title: ['commercial', 'vendeur', 'chef de rayon', 'responsable commercial', 'business developer'],
    skills: ['crm', 'salesforce', 'hubspot', 'excel', 'powerpoint'],
    description: ['vente', 'commercial', 'client', 'marché', 'business development']
  },
  'Santé & Pharma': {
    title: ['infirmier', 'médecin', 'pharmacien', 'chercheur', 'technicien de laboratoire'],
    skills: ['laboratoire', 'recherche', 'médical', 'pharmaceutique'],
    description: ['santé', 'médical', 'pharmaceutique', 'laboratoire', 'recherche']
  },
  'Automobile': {
    title: ['mécanicien', 'ingénieur automobile', 'technicien diagnostic', 'vendeur automobile'],
    skills: ['diagnostic', 'mécanique', 'électrique', 'automobile'],
    description: ['automobile', 'véhicule', 'mécanique', 'réparation']
  }
};

async function analyzeJobContent() {
  try {
    console.log('🔍 Analyse du contenu des offres d\'emploi...\n');
    
    // Récupérer un échantillon d'offres avec leur contenu
    const query = `
      SELECT 
        company,
        title,
        description,
        skills,
        COUNT(*) as job_count
      FROM jobs 
      WHERE company IS NOT NULL 
        AND company != ''
        AND LENGTH(company) > 3
        AND (title IS NOT NULL OR description IS NOT NULL OR skills IS NOT NULL)
      GROUP BY company, title, description, skills
      ORDER BY job_count DESC
      LIMIT 20
    `;
    
    const result = await pool.query(query);
    const companies = result.rows;
    
    console.log(`📊 Analyse de ${companies.length} entreprises\n`);
    
    for (const company of companies) {
      console.log(`🏢 ${company.company} (${company.job_count} offres)`);
      
      // Analyser le titre
      if (company.title) {
        const titleScore = analyzeText(company.title, 'title');
        console.log(`  📝 Titre: "${company.title.substring(0, 50)}..."`);
        console.log(`     Score: ${JSON.stringify(titleScore, null, 6)}`);
      }
      
      // Analyser la description
      if (company.description) {
        const descScore = analyzeText(company.description, 'description');
        console.log(`  📄 Description: "${company.description.substring(0, 50)}..."`);
        console.log(`     Score: ${JSON.stringify(descScore, null, 6)}`);
      }
      
      // Analyser les skills
      if (company.skills) {
        const skillsText = Array.isArray(company.skills) ? company.skills.join(' ') : company.skills;
        const skillsScore = analyzeText(skillsText, 'skills');
        const skillsDisplay = Array.isArray(company.skills) ? company.skills.slice(0, 3).join(', ') : company.skills.substring(0, 50);
        console.log(`  🛠️  Skills: ${skillsDisplay}...`);
        console.log(`     Score: ${JSON.stringify(skillsScore, null, 6)}`);
      }
      
      // Score global
      const globalScore = calculateGlobalScore(company);
      console.log(`  🎯 Score global: ${JSON.stringify(globalScore, null, 6)}`);
      
      console.log(''); // Ligne vide pour séparer
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

function analyzeText(text, type) {
  if (!text) return {};
  
  const textLower = text.toLowerCase();
  const scores = {};
  
  for (const [sector, keywords] of Object.entries(sectorKeywords)) {
    let score = 0;
    
    // Analyser selon le type (title, skills, description)
    const relevantKeywords = keywords[type] || [];
    
    for (const keyword of relevantKeywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    
    if (score > 0) {
      scores[sector] = score;
    }
  }
  
  return scores;
}

function calculateGlobalScore(company) {
  const scores = {};
  
  // Pondération : titre (3), skills (2), description (1)
  if (company.title) {
    const titleScore = analyzeText(company.title, 'title');
    for (const [sector, score] of Object.entries(titleScore)) {
      scores[sector] = (scores[sector] || 0) + (score * 3);
    }
  }
  
  if (company.skills) {
    const skillsText = Array.isArray(company.skills) ? company.skills.join(' ') : company.skills;
    const skillsScore = analyzeText(skillsText, 'skills');
    for (const [sector, score] of Object.entries(skillsScore)) {
      scores[sector] = (scores[sector] || 0) + (score * 2);
    }
  }
  
  if (company.description) {
    const descScore = analyzeText(company.description, 'description');
    for (const [sector, score] of Object.entries(descScore)) {
      scores[sector] = (scores[sector] || 0) + score;
    }
  }
  
  // Trouver le secteur avec le score le plus élevé
  const maxScore = Math.max(...Object.values(scores));
  const bestSector = Object.keys(scores).find(sector => scores[sector] === maxScore);
  
  return {
    scores,
    bestSector: maxScore > 0 ? bestSector : 'Autres secteurs',
    confidence: maxScore > 0 ? Math.min(maxScore / 5, 1) : 0 // Normaliser entre 0 et 1
  };
}

// Exécuter l'analyse
analyzeJobContent(); 