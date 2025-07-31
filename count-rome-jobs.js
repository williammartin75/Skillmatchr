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

console.log('📊 Statistiques de la base de données ROME :');
console.log(`📈 Total: ${totalJobs} métiers ROME dans la base`);
console.log(`🎯 Objectif: 512 métiers ROME`);
console.log(`📝 Il reste ${512 - totalJobs} métiers ROME à ajouter`); 