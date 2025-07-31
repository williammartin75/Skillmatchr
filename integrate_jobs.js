const fs = require('fs');

// Lire le fichier route.js actuel
const routeContent = fs.readFileSync('app/api/jobs/route.js', 'utf8');

// Lire les jobs supplémentaires
const additionalJobs = JSON.parse(fs.readFileSync('additional_jobs.json', 'utf8'));

// Convertir les jobs en format JavaScript
const jobsString = additionalJobs.map(job => {
  return `  {
    id: ${job.id},
    title: "${job.title}",
    company: "${job.company}",
    location: "${job.location}",
    type: "${job.type}",
    salary: "${job.salary}",
    description: "${job.description}",
    skills: ${JSON.stringify(job.skills)},
    postedDate: "${job.postedDate}",
    remote: ${job.remote},
    source: "${job.source}"
  }`;
}).join(',\n');

// Trouver la position où insérer les nouveaux jobs (avant la fermeture du tableau allJobs)
const insertPosition = routeContent.lastIndexOf('  }');
const beforeInsert = routeContent.substring(0, insertPosition);
const afterInsert = routeContent.substring(insertPosition);

// Créer le nouveau contenu
const newContent = beforeInsert + ',\n  // Jobs supplémentaires générés automatiquement (950 jobs)\n' + jobsString + afterInsert;

// Sauvegarder le nouveau fichier
fs.writeFileSync('app/api/jobs/route.js', newContent);

console.log('✅ 950 jobs supplémentaires intégrés avec succès !');
console.log('📊 Total: 1000 jobs dans la base de données');
console.log('🚀 Prêt à tester les performances de l\'algorithme de matching !'); 