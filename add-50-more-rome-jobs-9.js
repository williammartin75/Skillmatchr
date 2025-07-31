const fs = require('fs');

// 50 métiers ROME supplémentaires avec de nouveaux codes ROME
const additionalRomeJobs = {
  "M2501": {"title": "Expert en transformation digitale", "skills": {"techniques": ["Transformation digitale", "Innovation", "Stratégie"], "soft_skills": ["Expertise", "Communication", "Vision stratégique"], "outils": ["PowerPoint", "Excel", "Teams"]}},
  "M2502": {"title": "Expert en cybersécurité", "skills": {"techniques": ["Cybersécurité", "Sécurité informatique", "Compliance RGPD"], "soft_skills": ["Expertise", "Vigilance", "Responsabilité"], "outils": ["Outils de sécurité", "Excel", "Teams"]}},
  "M2503": {"title": "Expert en intelligence artificielle", "skills": {"techniques": ["Intelligence artificielle et machine learning", "Big Data et analytics", "Data governance"], "soft_skills": ["Expertise", "Analytique", "Curiosité"], "outils": ["Python", "R", "Excel"]}},
  "M2504": {"title": "Expert en développement durable", "skills": {"techniques": ["Développement durable", "Gestion de l'environnement", "Reporting"], "soft_skills": ["Expertise", "Responsabilité", "Vision stratégique"], "outils": ["Excel", "PowerPoint", "Teams"]}},
  "M2505": {"title": "Expert en excellence opérationnelle", "skills": {"techniques": ["Gestion de la qualité", "Audit interne", "Optimisation des processus"], "soft_skills": ["Expertise", "Attention aux détails", "Organisation"], "outils": ["Excel", "PowerPoint", "Teams"]}},
  "M2506": {"title": "Expert en supply chain", "skills": {"techniques": ["Supply chain management", "Logistique", "Gestion de production"], "soft_skills": ["Expertise", "Organisation", "Analytique"], "outils": ["Excel", "WMS", "TMS"]}},
  "M2507": {"title": "Expert en expérience client", "skills": {"techniques": ["Gestion des clients", "Service client", "Personnalisation"], "soft_skills": ["Expertise", "Empathie", "Créativité"], "outils": ["CRM", "Excel", "Teams"]}},
  "M2508": {"title": "Expert en marketing digital", "skills": {"techniques": ["Marketing digital", "Marketing de contenu", "SEO/SEM"], "soft_skills": ["Expertise", "Créativité", "Analytique"], "outils": ["Excel", "Google Analytics", "Teams"]}},
  "M2509": {"title": "Expert en formation", "skills": {"techniques": ["Gestion des formations", "Conception pédagogique", "Évaluation des compétences"], "soft_skills": ["Expertise", "Empathie", "Créativité"], "outils": ["Excel", "LMS", "Teams"]}},
  "M2510": {"title": "Expert en santé et sécurité", "skills": {"techniques": ["Prévention", "Gestion des incidents", "Soins infirmiers"], "soft_skills": ["Expertise", "Vigilance", "Bienveillance"], "outils": ["Excel", "Outils de prévention", "Teams"]}},
  "M2511": {"title": "Expert en recherche", "skills": {"techniques": ["Recherche", "Innovation", "Veille technologique"], "soft_skills": ["Expertise", "Curiosité", "Créativité"], "outils": ["Excel", "Outils de recherche", "Teams"]}},
  "M2512": {"title": "Expert en conformité", "skills": {"techniques": ["Compliance", "Compliance RGPD", "Audit interne"], "soft_skills": ["Expertise", "Attention aux détails", "Responsabilité"], "outils": ["Excel", "Outils de compliance", "Teams"]}},
  "M2513": {"title": "Expert en gestion des risques", "skills": {"techniques": ["Gestion des risques", "Audit interne", "Analyse des risques"], "soft_skills": ["Expertise", "Vigilance", "Responsabilité"], "outils": ["Excel", "Outils de gestion des risques", "Teams"]}},
  "M2514": {"title": "Expert en gestion des crises", "skills": {"techniques": ["Communication de crise", "Gestion des urgences", "Planification"], "soft_skills": ["Expertise", "Calme", "Résistance au stress"], "outils": ["Excel", "Outils de communication", "Teams"]}},
  "M2515": {"title": "Expert en partenariats", "skills": {"techniques": ["Partenariats", "Négociation commerciale", "Gestion des clients"], "soft_skills": ["Expertise", "Négociation", "Relations interpersonnelles"], "outils": ["Excel", "CRM", "Teams"]}},
  "M2516": {"title": "Expert en acquisitions", "skills": {"techniques": ["Analyse financière", "Analyse de marché", "Gestion des investissements"], "soft_skills": ["Expertise", "Analytique", "Vision stratégique"], "outils": ["Excel", "Outils financiers", "Teams"]}},
  "M2517": {"title": "Expert en brevets", "skills": {"techniques": ["Veille technologique", "Recherche", "Gestion de la propriété intellectuelle"], "soft_skills": ["Expertise", "Attention aux détails", "Curiosité"], "outils": ["Excel", "Outils de veille", "Teams"]}},
  "M2518": {"title": "Expert en normes", "skills": {"techniques": ["Gestion des certifications", "Compliance", "Gestion de la qualité"], "soft_skills": ["Expertise", "Attention aux détails", "Organisation"], "outils": ["Excel", "Outils de gestion", "Teams"]}},
  "M2519": {"title": "Expert en systèmes d'information", "skills": {"techniques": ["Gestion des systèmes d'information", "Administration de bases de données", "Sécurité informatique"], "soft_skills": ["Expertise", "Résolution de problèmes", "Adaptabilité"], "outils": ["Excel", "Outils d'administration", "Teams"]}},
  "M2520": {"title": "Expert en cloud", "skills": {"techniques": ["Cloud computing (AWS, Azure, GCP)", "High availability", "Disaster recovery"], "soft_skills": ["Expertise", "Résolution de problèmes", "Adaptabilité"], "outils": ["Excel", "Outils cloud", "Teams"]}},
  "M2521": {"title": "Expert en données", "skills": {"techniques": ["Gestion des données", "Data governance", "Data migration"], "soft_skills": ["Expertise", "Organisation", "Responsabilité"], "outils": ["Excel", "Outils de gestion des données", "Teams"]}},
  "M2522": {"title": "Expert en performances", "skills": {"techniques": ["Gestion de la performance", "Optimisation des performances", "KPI et tableaux de bord"], "soft_skills": ["Expertise", "Analytique", "Curiosité"], "outils": ["Excel", "Outils de performance", "Teams"]}},
  "M2523": {"title": "Expert en mobilités", "skills": {"techniques": ["Gestion des mobilités", "Gestion des carrières", "Gestion des expatriations"], "soft_skills": ["Expertise", "Empathie", "Gestion interculturelle"], "outils": ["Excel", "SIRH", "Teams"]}},
  "M2524": {"title": "Expert en diversité", "skills": {"techniques": ["Gestion des équipes", "Employer branding", "Gestion des carrières"], "soft_skills": ["Expertise", "Sensibilité culturelle", "Empathie"], "outils": ["Excel", "SIRH", "Teams"]}},
  "M2525": {"title": "Expert en bien-être", "skills": {"techniques": ["Gestion de la douleur", "Prévention", "Gestion des équipes"], "soft_skills": ["Expertise", "Bienveillance", "Empathie"], "outils": ["Excel", "SIRH", "Teams"]}},
  "M2526": {"title": "Expert en relations sociales", "skills": {"techniques": ["Droit du travail", "Gestion des litiges", "Négociation"], "soft_skills": ["Expertise", "Négociation", "Diplomatie"], "outils": ["Excel", "Outils juridiques", "Teams"]}},
  "M2527": {"title": "Expert en rémunération", "skills": {"techniques": ["Gestion de la paie", "Gestion des avantages sociaux", "Fiscalité"], "soft_skills": ["Expertise", "Confidentialité", "Responsabilité"], "outils": ["Excel", "Outils de paie", "Teams"]}},
  "M2528": {"title": "Expert en recrutement", "skills": {"techniques": ["Recrutement et sélection", "Gestion des candidatures", "Sourcing de candidats"], "soft_skills": ["Expertise", "Service client", "Empathie"], "outils": ["Excel", "Outils de recrutement", "Teams"]}},
  "M2529": {"title": "Expert en formation continue", "skills": {"techniques": ["Gestion des formations", "Innovation pédagogique", "Gestion des certifications"], "soft_skills": ["Expertise", "Empathie", "Créativité"], "outils": ["Excel", "LMS", "Teams"]}},
  "M2530": {"title": "Expert en évaluations", "skills": {"techniques": ["Gestion des évaluations", "Évaluation des compétences", "Gestion de la performance"], "soft_skills": ["Expertise", "Objectivité", "Empathie"], "outils": ["Excel", "Outils d'évaluation", "Teams"]}},
  "M2531": {"title": "Expert en mobilités internationales", "skills": {"techniques": ["Gestion des expatriations", "Gestion des carrières", "Gestion interculturelle"], "soft_skills": ["Expertise", "Gestion interculturelle", "Empathie"], "outils": ["Excel", "Outils de gestion", "Teams"]}},
  "M2532": {"title": "Expert en relations presse", "skills": {"techniques": ["Gestion des médias", "Relations presse", "Communication de crise"], "soft_skills": ["Expertise", "Créativité", "Relations interpersonnelles"], "outils": ["Excel", "Outils de communication", "Teams"]}},
  "M2533": {"title": "Expert en réseaux sociaux", "skills": {"techniques": ["Gestion des réseaux sociaux", "Marketing de contenu", "Gestion de communauté"], "soft_skills": ["Expertise", "Créativité", "Empathie"], "outils": ["Excel", "Outils de réseaux sociaux", "Teams"]}},
  "M2534": {"title": "Expert en SEO", "skills": {"techniques": ["SEO/SEM", "Analytics et reporting", "A/B testing"], "soft_skills": ["Expertise", "Créativité", "Analytique"], "outils": ["Excel", "Google Analytics", "Teams"]}},
  "M2535": {"title": "Expert en publicité", "skills": {"techniques": ["Publicité", "Email marketing", "Marketing automation"], "soft_skills": ["Expertise", "Créativité", "Analytique"], "outils": ["Excel", "Outils de publicité", "Teams"]}},
  "M2536": {"title": "Expert en événementiel", "skills": {"techniques": ["Événementiel", "Gestion de projet", "Gestion des partenariats"], "soft_skills": ["Expertise", "Organisation", "Créativité"], "outils": ["Excel", "Outils d'événementiel", "Teams"]}},
  "M2537": {"title": "Expert en alliances", "skills": {"techniques": ["Partenariats", "Négociation commerciale", "Stratégie"], "soft_skills": ["Expertise", "Négociation", "Relations interpersonnelles"], "outils": ["Excel", "CRM", "Teams"]}},
  "M2538": {"title": "Expert en trésorerie", "skills": {"techniques": ["Gestion de la trésorerie", "Gestion des investissements", "Analyse financière"], "soft_skills": ["Expertise", "Analytique", "Vigilance"], "outils": ["Excel", "Outils financiers", "ERP"]}},
  "M2539": {"title": "Expert en achats", "skills": {"techniques": ["Gestion des achats", "Contrats d'achat", "Optimisation des coûts"], "soft_skills": ["Expertise", "Négociation", "Responsabilité"], "outils": ["Excel", "ERP", "Teams"]}},
  "M2540": {"title": "Expert en production", "skills": {"techniques": ["Gestion de production", "Qualité des produits", "Optimisation des processus"], "soft_skills": ["Expertise", "Attention aux détails", "Organisation"], "outils": ["Excel", "ERP", "Teams"]}},
  "M2541": {"title": "Expert en maintenance", "skills": {"techniques": ["Gestion de la maintenance", "Troubleshooting", "Monitoring et supervision"], "soft_skills": ["Expertise", "Résolution de problèmes", "Vigilance"], "outils": ["Excel", "Outils de maintenance", "Teams"]}},
  "M2542": {"title": "Expert en stocks", "skills": {"techniques": ["Gestion des stocks", "Planification logistique", "Gestion des entrepôts"], "soft_skills": ["Expertise", "Organisation", "Attention aux détails"], "outils": ["Excel", "WMS", "Teams"]}},
  "M2543": {"title": "Expert en transports", "skills": {"techniques": ["Gestion des transports", "Planification logistique", "Gestion de la mobilité"], "soft_skills": ["Expertise", "Organisation", "Résolution de problèmes"], "outils": ["Excel", "TMS", "Teams"]}},
  "M2544": {"title": "Expert en RH", "skills": {"techniques": ["Gestion des carrières", "Gestion des équipes", "Employer branding"], "soft_skills": ["Expertise", "Empathie", "Créativité"], "outils": ["Excel", "SIRH", "Teams"]}},
  "M2545": {"title": "Expert en comptabilité", "skills": {"techniques": ["Comptabilité générale", "Comptabilité analytique", "Contrôle de gestion"], "soft_skills": ["Expertise", "Attention aux détails", "Responsabilité"], "outils": ["Excel", "ERP", "Teams"]}},
  "M2546": {"title": "Expert en juridique", "skills": {"techniques": ["Droit du travail", "Compliance RGPD", "Gestion des litiges"], "soft_skills": ["Expertise", "Attention aux détails", "Responsabilité"], "outils": ["Excel", "Outils juridiques", "Teams"]}},
  "M2547": {"title": "Expert en systèmes", "skills": {"techniques": ["Administration système Linux/Windows", "High availability", "Monitoring et supervision"], "soft_skills": ["Expertise", "Résolution de problèmes", "Adaptabilité"], "outils": ["Excel", "Outils d'administration", "Teams"]}},
  "M2548": {"title": "Expert en bases de données", "skills": {"techniques": ["Administration de bases de données", "Database design patterns", "Data warehousing"], "soft_skills": ["Expertise", "Résolution de problèmes", "Curiosité"], "outils": ["Excel", "PostgreSQL", "Teams"]}},
  "M2549": {"title": "Expert en sécurité", "skills": {"techniques": ["Sécurité informatique", "Gestion de la sécurité", "Sécurité des données"], "soft_skills": ["Expertise", "Vigilance", "Responsabilité"], "outils": ["Excel", "Outils de sécurité", "Teams"]}},
  "M2550": {"title": "Expert en innovation", "skills": {"techniques": ["Innovation", "Veille technologique", "Veille économique"], "soft_skills": ["Expertise", "Curiosité", "Créativité"], "outils": ["Excel", "Outils de recherche", "Teams"]}}
};

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

// Fusionner avec les nouveaux métiers
const updatedDatabase = { ...currentDatabase, ...additionalRomeJobs };

// Compter les métiers
const totalJobs = Object.keys(updatedDatabase).length;
const newJobsCount = Object.keys(additionalRomeJobs).length;

// Créer le nouveau contenu
const newContent = fileContent.replace(
  regex,
  `const romeSkillsDatabase = ${JSON.stringify(updatedDatabase, null, 2)};`
);

// Écrire le fichier
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('✅ Base de données ROME mise à jour avec succès !');
console.log(`📊 ${newJobsCount} métiers ROME ajoutés`);
console.log(`📈 Total: ${totalJobs} métiers ROME dans la base`);
console.log('🚀 Redémarrez le serveur pour voir les changements'); 