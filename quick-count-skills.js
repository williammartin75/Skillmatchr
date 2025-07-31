const fs = require('fs');

// Lire le fichier actuel
const filePath = 'app/data/rome-skills-database.js';
const fileContent = fs.readFileSync(filePath, 'utf8');

// Extraire l'objet romeSkillsDatabase
const regex = /const romeSkillsDatabase = ({[\s\S]*?});/;
const match = fileContent.match(regex);

if (!match) {
  console.error('❌ Impossible de trouver l\'objet romeSkillsDatabase dans le fichier');
  process.exit(1);
}

// Parser l'objet existant
let currentDatabase;
try {
  currentDatabase = eval('(' + match[1] + ')');
} catch (error) {
  console.error('❌ Erreur lors du parsing de la base de données existante:', error.message);
  process.exit(1);
}

// Compter les métiers
const totalJobs = Object.keys(currentDatabase).length;

// Collecter toutes les compétences uniques
const allTechnicalSkills = new Set();
const allSoftSkills = new Set();
const allTools = new Set();

// Parcourir tous les métiers pour collecter les compétences
Object.values(currentDatabase).forEach(job => {
  if (job.skills) {
    if (job.skills.techniques) {
      job.skills.techniques.forEach(skill => allTechnicalSkills.add(skill));
    }
    if (job.skills.soft_skills) {
      job.skills.soft_skills.forEach(skill => allSoftSkills.add(skill));
    }
    if (job.skills.outils) {
      job.skills.outils.forEach(skill => allTools.add(skill));
    }
  }
});

console.log('📊 Statistiques de la base de données ROME :');
console.log(`📈 Total: ${totalJobs} familles professionnelles ROME`);
console.log('');
console.log('🔧 Compétences par catégorie :');
console.log(`💻 Compétences techniques: ${allTechnicalSkills.size}`);
console.log(`🤝 Soft skills: ${allSoftSkills.size}`);
console.log(`🛠️ Outils: ${allTools.size}`);
console.log(`📝 Total compétences uniques: ${allTechnicalSkills.size + allSoftSkills.size + allTools.size}`); 