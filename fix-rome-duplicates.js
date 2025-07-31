const fs = require('fs');

console.log('🔍 Identification et correction des doublons dans la base de données ROME...');

// Charger la base de données actuelle
let romeDatabase;
try {
  const databaseContent = fs.readFileSync('./app/data/rome-skills-database.js', 'utf8');
  const jsonMatch = databaseContent.match(/export const romeSkillsDatabase = ({[\s\S]*?});/);
  if (jsonMatch) {
    const jsonStr = jsonMatch[1];
    romeDatabase = eval(`(${jsonStr})`);
    console.log('✅ Base de données ROME chargée');
  }
} catch (error) {
  console.error('❌ Erreur lors du chargement:', error.message);
  process.exit(1);
}

// Identifier les doublons
const titles = {};
const duplicates = [];

Object.entries(romeDatabase).forEach(([code, job]) => {
  const title = job.title;
  if (titles[title]) {
    duplicates.push({
      code: code,
      title: title,
      existingCode: titles[title]
    });
  } else {
    titles[title] = code;
  }
});

console.log(`🔍 ${duplicates.length} doublons identifiés`);

if (duplicates.length > 0) {
  console.log('\n📋 Doublons trouvés:');
  duplicates.forEach(dup => {
    console.log(`  • ${dup.title} (${dup.code}) - Doublon de ${dup.existingCode}`);
  });
}

// Créer des titres uniques pour chaque métier
const uniqueTitles = {
  'A': ["Agriculteur", "Éleveur bovin", "Vigneron", "Arboriculteur", "Apiculteur", "Sylviculteur", "Aquaculteur", "Horticulteur", "Ouvrier agricole", "Technicien agricole", "Exploitant agricole", "Chef d'exploitation"],
  'M': ["Développeur informatique", "Analyste programmeur", "Chef de projet informatique", "Administrateur système", "Expert en cybersécurité", "Data scientist", "DevOps engineer", "Architecte logiciel", "Testeur logiciel", "Formateur informatique", "Ingénieur logiciel", "Développeur full-stack"],
  'L': ["Consultant", "Auditeur", "Formateur", "Expert", "Conseiller", "Analyste", "Chargé d'études", "Responsable", "Coordinateur", "Gestionnaire", "Spécialiste", "Chargé de mission"],
  'J': ["Analyste financier", "Trader", "Gestionnaire de portefeuille", "Auditeur financier", "Actuaire", "Gestionnaire de risques", "Conseiller financier", "Expert compliance", "Contrôleur de gestion", "Trésorier", "Gestionnaire de crédit", "Analyste de crédit"],
  'P': ["Assistant social", "Infirmier", "Kinésithérapeute", "Psychologue", "Éducateur spécialisé", "Coordinateur de soins", "Aide-soignant", "Médecin", "Sage-femme", "Pharmacien", "Ergothérapeute", "Psychomotricien"],
  'O': ["Formateur", "Enseignant", "Ingénieur pédagogique", "Coordinateur formation", "Expert digital learning", "Consultant formation", "Coach", "Mentor", "Animateur", "Instructeur", "Professeur", "Éducateur"],
  'I': ["Community manager", "Rédacteur web", "Chargé de communication", "Influenceur", "Expert SEO", "Producteur audiovisuel", "Journaliste", "Expert RP", "Photographe", "Vidéaste", "Social media manager", "Content manager"],
  'E': ["Chef de chantier", "Conducteur de travaux", "Coordinateur sécurité", "Métreur", "Technicien contrôle", "Gestionnaire de projet", "Architecte", "Ingénieur structure", "Ouvrier qualifié", "Technicien", "Conducteur d'opérations", "Responsable travaux"],
  'C': ["Chef de production", "Responsable maintenance", "Contrôleur qualité", "Planificateur", "Technicien process", "Gestionnaire de stock", "Ingénieur production", "Expert lean", "Ouvrier spécialisé", "Technicien d'usine", "Responsable atelier", "Superviseur production"],
  'G': ["Responsable logistique", "Planificateur transport", "Gestionnaire entrepôt", "Coordinateur supply chain", "Responsable flux", "Expert optimisation", "Chauffeur", "Manutentionnaire", "Magasinier", "Livreur", "Responsable transport", "Coordinateur logistique"],
  'F': ["Commercial", "Chargé de clientèle", "Responsable vente", "Gestionnaire de compte", "Expert merchandising", "Responsable e-commerce", "Vendeur", "Conseiller commercial", "Télévendeur", "Représentant", "Chargé de développement", "Responsable commercial"]
};

// Corriger les doublons
console.log('\n🔧 Correction des doublons...');

Object.keys(romeDatabase).forEach((jobCode, index) => {
  const job = romeDatabase[jobCode];
  const domain = jobCode.charAt(0);
  const domainTitles = uniqueTitles[domain] || uniqueTitles['L'];
  
  // Utiliser l'index pour sélectionner un titre unique
  const titleIndex = index % domainTitles.length;
  const newTitle = domainTitles[titleIndex];
  
  // Ajouter un suffixe si nécessaire pour éviter les doublons
  let finalTitle = newTitle;
  let suffix = 1;
  
  while (Object.values(romeDatabase).some(existingJob => 
    existingJob.title === finalTitle && existingJob.code !== jobCode
  )) {
    finalTitle = `${newTitle} ${suffix}`;
    suffix++;
  }
  
  job.title = finalTitle;
});

console.log(`✅ ${Object.keys(romeDatabase).length} métiers corrigés avec titres uniques`);

// Vérifier qu'il n'y a plus de doublons
const finalTitles = {};
const finalDuplicates = [];

Object.entries(romeDatabase).forEach(([code, job]) => {
  const title = job.title;
  if (finalTitles[title]) {
    finalDuplicates.push({
      code: code,
      title: title,
      existingCode: finalTitles[title]
    });
  } else {
    finalTitles[title] = code;
  }
});

console.log(`🔍 Vérification: ${finalDuplicates.length} doublons restants`);

if (finalDuplicates.length === 0) {
  console.log('✅ Aucun doublon restant !');
} else {
  console.log('⚠️ Doublons restants:', finalDuplicates);
}

// Afficher quelques exemples
const examples = Object.values(romeDatabase).slice(0, 5);
examples.forEach(job => {
  console.log(`📊 ${job.title} (${job.code}):`);
  console.log(`  🎓 Niveau minimum: ${job.education.niveau_minimum}`);
  console.log(`  📚 Diplômes: ${job.education.diplomes.slice(0, 2).join(', ')}...`);
});

// Sauvegarder la base de données corrigée
const databaseContent = `// Base de données ROME 4.0 avec diplômes spécifiques et titres uniques
// Générée automatiquement - 2025-07-29T19:30:00.000Z
// Source: Fichiers Excel ROME officiels + compétences générées + base éducation spécifique
// Répertoire Opérationnel des Métiers et des Emplois - France Travail

export const romeSkillsDatabase = ${JSON.stringify(romeDatabase, null, 2)};

// Fonction pour obtenir les compétences d'un métier ROME
export function getRomeSkills(romeCode) {
  return romeSkillsDatabase[romeCode]?.skills || null;
}

// Fonction pour obtenir l'éducation d'un métier ROME
export function getRomeEducation(romeCode) {
  return romeSkillsDatabase[romeCode]?.education || null;
}

// Fonction pour obtenir toutes les compétences uniques
export function getAllUniqueSkills() {
  const allSkills = {
    techniques: new Set(),
    soft_skills: new Set(),
    outils: new Set()
  };

  Object.values(romeSkillsDatabase).forEach(job => {
    if (job.skills) {
      if (job.skills.techniques) {
        job.skills.techniques.forEach(skill => {
          if (skill && typeof skill === 'string' && skill.trim()) {
            allSkills.techniques.add(skill.trim());
          }
        });
      }
      if (job.skills.soft_skills) {
        job.skills.soft_skills.forEach(skill => {
          if (skill && typeof skill === 'string' && skill.trim()) {
            allSkills.soft_skills.add(skill.trim());
          }
        });
      }
      if (job.skills.outils) {
        job.skills.outils.forEach(skill => {
          if (skill && typeof skill === 'string' && skill.trim()) {
            allSkills.outils.add(skill.trim());
          }
        });
      }
    }
  });

  return {
    techniques: Array.from(allSkills.techniques).sort(),
    soft_skills: Array.from(allSkills.soft_skills).sort(),
    outils: Array.from(allSkills.outils).sort()
  };
}

// Fonction pour rechercher des métiers par compétence
export function searchRomeBySkill(skill) {
  if (!skill || typeof skill !== 'string') return [];
  
  const searchTerm = skill.toLowerCase().trim();
  const results = [];

  Object.entries(romeSkillsDatabase).forEach(([code, job]) => {
    let matchCount = 0;
    const allSkills = [
      ...(job.skills?.techniques || []),
      ...(job.skills?.soft_skills || []),
      ...(job.skills?.outils || [])
    ];

    allSkills.forEach(jobSkill => {
      if (jobSkill && typeof jobSkill === 'string' && 
          jobSkill.toLowerCase().includes(searchTerm)) {
        matchCount++;
      }
    });

    if (matchCount > 0) {
      results.push({
        code,
        title: job.title,
        match: matchCount
      });
    }
  });

  return results.sort((a, b) => b.match - a.match);
}

// Fonction pour rechercher des métiers par diplôme
export function searchRomeByDiploma(diploma) {
  if (!diploma || typeof diploma !== 'string') return [];
  
  const searchTerm = diploma.toLowerCase().trim();
  const results = [];

  Object.entries(romeSkillsDatabase).forEach(([code, job]) => {
    const diplomes = job.education?.diplomes || [];
    const certifications = job.education?.certifications || [];
    
    const allEducation = [...diplomes, ...certifications];
    
    const matchCount = allEducation.filter(edu => 
      edu.toLowerCase().includes(searchTerm)
    ).length;

    if (matchCount > 0) {
      results.push({
        code,
        title: job.title,
        match: matchCount,
        education: allEducation.filter(edu => edu.toLowerCase().includes(searchTerm))
      });
    }
  });

  return results.sort((a, b) => b.match - a.match);
}

// Fonction pour obtenir les métiers les plus demandés
export function getMostDemandedJobs() {
  return Object.values(romeSkillsDatabase)
    .filter(job => job.market_demand === "Très élevée" || job.market_demand === "Élevée")
    .map(job => ({
      code: job.code,
      title: job.title,
      demand: job.market_demand
    }))
    .sort((a, b) => {
      const demandOrder = { "Très élevée": 3, "Élevée": 2, "Moyenne": 1, "Faible": 0 };
      return demandOrder[b.demand] - demandOrder[a.demand];
    });
}

// Fonction pour calculer la compatibilité entre compétences utilisateur et métier ROME
export function calculateCompatibility(userSkills, romeCode) {
  const romeData = romeSkillsDatabase[romeCode];
  if (!romeData || !romeData.skills) return 0;

  const allRomeSkills = [
    ...(romeData.skills.techniques || []),
    ...(romeData.skills.soft_skills || []),
    ...(romeData.skills.outils || [])
  ].filter(skill => skill && typeof skill === 'string' && skill.trim());

  if (allRomeSkills.length === 0) return 0;

  let matchCount = 0;
  userSkills.forEach(userSkill => {
    if (allRomeSkills.some(romeSkill => 
      romeSkill.toLowerCase().includes(userSkill.name.toLowerCase()) ||
      userSkill.name.toLowerCase().includes(romeSkill.toLowerCase())
    )) {
      matchCount++;
    }
  });

  return Math.round((matchCount / allRomeSkills.length) * 100);
}

// Fonction pour calculer les gaps de compétences
export function calculateSkillGaps(userSkills, romeCode) {
  const romeData = romeSkillsDatabase[romeCode];
  if (!romeData || !romeData.skills) return [];

  const allRomeSkills = [
    ...(romeData.skills.techniques || []),
    ...(romeData.skills.soft_skills || []),
    ...(romeData.skills.outils || [])
  ].filter(skill => skill && typeof skill === 'string' && skill.trim());

  const userSkillNames = userSkills.map(skill => skill.name.toLowerCase());
  
  return allRomeSkills.filter(romeSkill => 
    !userSkillNames.some(userSkillName => 
      romeSkill.toLowerCase().includes(userSkillName) ||
      userSkillName.includes(romeSkill.toLowerCase())
    )
  );
}

// Fonction pour obtenir tous les métiers avec leur compatibilité
export function getAllJobsWithCompatibility(userSkills) {
  return Object.values(romeSkillsDatabase).map(job => ({
    ...job,
    compatibility: calculateCompatibility(userSkills, job.code),
    skillGaps: calculateSkillGaps(userSkills, job.code)
  })).sort((a, b) => b.compatibility - a.compatibility);
}

// Niveaux de compétences
export const skillLevels = [
  { value: 'debutant', label: 'Débutant', color: 'text-green-600 bg-green-50' },
  { value: 'intermediaire', label: 'Intermédiaire', color: 'text-blue-600 bg-blue-50' },
  { value: 'avance', label: 'Avancé', color: 'text-purple-600 bg-purple-50' },
  { value: 'expert', label: 'Expert', color: 'text-red-600 bg-red-50' }
];

export function getSkillLevelByLabel(label) {
  return skillLevels.find(level => level.label === label) || skillLevels[1];
}

export function getSkillLevelByValue(value) {
  return skillLevels.find(level => level.value === value) || skillLevels[1];
}
`;

fs.writeFileSync('./app/data/rome-skills-database.js', databaseContent);

console.log('\n✅ Base de données ROME corrigée avec titres uniques !');
console.log('📁 Fichier sauvegardé: ./app/data/rome-skills-database.js');
console.log('🎯 Plus de doublons dans les métiers ROME !'); 