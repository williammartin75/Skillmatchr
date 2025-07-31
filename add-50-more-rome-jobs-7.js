const fs = require('fs');

// 50 métiers ROME supplémentaires avec de nouveaux codes ROME
const additionalRomeJobs = {
  "M2301": {"title": "Manager en transformation digitale", "skills": {"techniques": ["Transformation digitale", "Innovation", "Gestion de projet"], "soft_skills": ["Leadership", "Communication", "Vision stratégique"], "outils": ["PowerPoint", "Excel", "Teams"]}},
  "M2302": {"title": "Manager en cybersécurité", "skills": {"techniques": ["Cybersécurité", "Sécurité informatique", "Compliance RGPD"], "soft_skills": ["Leadership", "Vigilance", "Responsabilité"], "outils": ["Outils de sécurité", "Excel", "Teams"]}},
  "M2303": {"title": "Manager en intelligence artificielle", "skills": {"techniques": ["Intelligence artificielle et machine learning", "Big Data et analytics", "Data governance"], "soft_skills": ["Leadership", "Analytique", "Curiosité"], "outils": ["Python", "R", "Excel"]}},
  "M2304": {"title": "Manager en développement durable", "skills": {"techniques": ["Développement durable", "Gestion de l'environnement", "Reporting"], "soft_skills": ["Leadership", "Responsabilité", "Vision stratégique"], "outils": ["Excel", "PowerPoint", "Teams"]}},
  "M2305": {"title": "Manager en excellence opérationnelle", "skills": {"techniques": ["Gestion de la qualité", "Audit interne", "Optimisation des processus"], "soft_skills": ["Leadership", "Attention aux détails", "Organisation"], "outils": ["Excel", "PowerPoint", "Teams"]}},
  "M2306": {"title": "Manager en supply chain", "skills": {"techniques": ["Supply chain management", "Logistique", "Gestion de production"], "soft_skills": ["Leadership", "Organisation", "Analytique"], "outils": ["Excel", "WMS", "TMS"]}},
  "M2307": {"title": "Manager en expérience client", "skills": {"techniques": ["Gestion des clients", "Service client", "Personnalisation"], "soft_skills": ["Leadership", "Empathie", "Créativité"], "outils": ["CRM", "Excel", "Teams"]}},
  "M2308": {"title": "Manager en marketing digital", "skills": {"techniques": ["Marketing digital", "Marketing de contenu", "SEO/SEM"], "soft_skills": ["Leadership", "Créativité", "Analytique"], "outils": ["Excel", "Google Analytics", "Teams"]}},
  "M2309": {"title": "Manager en formation", "skills": {"techniques": ["Gestion des formations", "Conception pédagogique", "Évaluation des compétences"], "soft_skills": ["Leadership", "Empathie", "Créativité"], "outils": ["Excel", "LMS", "Teams"]}},
  "M2310": {"title": "Manager en santé et sécurité", "skills": {"techniques": ["Prévention", "Gestion des incidents", "Soins infirmiers"], "soft_skills": ["Leadership", "Vigilance", "Bienveillance"], "outils": ["Excel", "Outils de prévention", "Teams"]}},
  "M2311": {"title": "Manager en recherche", "skills": {"techniques": ["Recherche", "Innovation", "Veille technologique"], "soft_skills": ["Leadership", "Curiosité", "Créativité"], "outils": ["Excel", "Outils de recherche", "Teams"]}},
  "M2312": {"title": "Manager en conformité", "skills": {"techniques": ["Compliance", "Compliance RGPD", "Audit interne"], "soft_skills": ["Leadership", "Attention aux détails", "Responsabilité"], "outils": ["Excel", "Outils de compliance", "Teams"]}},
  "M2313": {"title": "Manager en gestion des risques", "skills": {"techniques": ["Gestion des risques", "Audit interne", "Analyse des risques"], "soft_skills": ["Leadership", "Vigilance", "Responsabilité"], "outils": ["Excel", "Outils de gestion des risques", "Teams"]}},
  "M2314": {"title": "Manager en gestion des crises", "skills": {"techniques": ["Communication de crise", "Gestion des urgences", "Planification"], "soft_skills": ["Leadership", "Calme", "Résistance au stress"], "outils": ["Excel", "Outils de communication", "Teams"]}},
  "M2315": {"title": "Manager en partenariats", "skills": {"techniques": ["Partenariats", "Négociation commerciale", "Gestion des clients"], "soft_skills": ["Leadership", "Négociation", "Relations interpersonnelles"], "outils": ["Excel", "CRM", "Teams"]}},
  "M2316": {"title": "Manager en acquisitions", "skills": {"techniques": ["Analyse financière", "Analyse de marché", "Gestion des investissements"], "soft_skills": ["Leadership", "Analytique", "Vision stratégique"], "outils": ["Excel", "Outils financiers", "Teams"]}},
  "M2317": {"title": "Manager en brevets", "skills": {"techniques": ["Veille technologique", "Recherche", "Gestion de la propriété intellectuelle"], "soft_skills": ["Leadership", "Attention aux détails", "Curiosité"], "outils": ["Excel", "Outils de veille", "Teams"]}},
  "M2318": {"title": "Manager en normes", "skills": {"techniques": ["Gestion des certifications", "Compliance", "Gestion de la qualité"], "soft_skills": ["Leadership", "Attention aux détails", "Organisation"], "outils": ["Excel", "Outils de gestion", "Teams"]}},
  "M2319": {"title": "Manager en systèmes d'information", "skills": {"techniques": ["Gestion des systèmes d'information", "Administration de bases de données", "Sécurité informatique"], "soft_skills": ["Leadership", "Résolution de problèmes", "Adaptabilité"], "outils": ["Excel", "Outils d'administration", "Teams"]}},
  "M2320": {"title": "Manager en cloud", "skills": {"techniques": ["Cloud computing (AWS, Azure, GCP)", "High availability", "Disaster recovery"], "soft_skills": ["Leadership", "Résolution de problèmes", "Adaptabilité"], "outils": ["Excel", "Outils cloud", "Teams"]}},
  "M2321": {"title": "Manager en données", "skills": {"techniques": ["Gestion des données", "Data governance", "Data migration"], "soft_skills": ["Leadership", "Organisation", "Responsabilité"], "outils": ["Excel", "Outils de gestion des données", "Teams"]}},
  "M2322": {"title": "Manager en performances", "skills": {"techniques": ["Gestion de la performance", "Optimisation des performances", "KPI et tableaux de bord"], "soft_skills": ["Leadership", "Analytique", "Curiosité"], "outils": ["Excel", "Outils de performance", "Teams"]}},
  "M2323": {"title": "Manager en mobilités", "skills": {"techniques": ["Gestion des mobilités", "Gestion des carrières", "Gestion des expatriations"], "soft_skills": ["Leadership", "Empathie", "Gestion interculturelle"], "outils": ["Excel", "SIRH", "Teams"]}},
  "M2324": {"title": "Manager en diversité", "skills": {"techniques": ["Gestion des équipes", "Employer branding", "Gestion des carrières"], "soft_skills": ["Leadership", "Sensibilité culturelle", "Empathie"], "outils": ["Excel", "SIRH", "Teams"]}},
  "M2325": {"title": "Manager en bien-être", "skills": {"techniques": ["Gestion de la douleur", "Prévention", "Gestion des équipes"], "soft_skills": ["Leadership", "Bienveillance", "Empathie"], "outils": ["Excel", "SIRH", "Teams"]}},
  "M2326": {"title": "Manager en relations sociales", "skills": {"techniques": ["Droit du travail", "Gestion des litiges", "Négociation"], "soft_skills": ["Leadership", "Négociation", "Diplomatie"], "outils": ["Excel", "Outils juridiques", "Teams"]}},
  "M2327": {"title": "Manager en rémunération", "skills": {"techniques": ["Gestion de la paie", "Gestion des avantages sociaux", "Fiscalité"], "soft_skills": ["Leadership", "Confidentialité", "Responsabilité"], "outils": ["Excel", "Outils de paie", "Teams"]}},
  "M2328": {"title": "Manager en recrutement", "skills": {"techniques": ["Recrutement et sélection", "Gestion des candidatures", "Sourcing de candidats"], "soft_skills": ["Leadership", "Service client", "Empathie"], "outils": ["Excel", "Outils de recrutement", "Teams"]}},
  "M2329": {"title": "Manager en formation continue", "skills": {"techniques": ["Gestion des formations", "Innovation pédagogique", "Gestion des certifications"], "soft_skills": ["Leadership", "Empathie", "Créativité"], "outils": ["Excel", "LMS", "Teams"]}},
  "M2330": {"title": "Manager en évaluations", "skills": {"techniques": ["Gestion des évaluations", "Évaluation des compétences", "Gestion de la performance"], "soft_skills": ["Leadership", "Objectivité", "Empathie"], "outils": ["Excel", "Outils d'évaluation", "Teams"]}},
  "M2331": {"title": "Manager en mobilités internationales", "skills": {"techniques": ["Gestion des expatriations", "Gestion des carrières", "Gestion interculturelle"], "soft_skills": ["Leadership", "Gestion interculturelle", "Empathie"], "outils": ["Excel", "Outils de gestion", "Teams"]}},
  "M2332": {"title": "Manager en relations presse", "skills": {"techniques": ["Gestion des médias", "Relations presse", "Communication de crise"], "soft_skills": ["Leadership", "Créativité", "Relations interpersonnelles"], "outils": ["Excel", "Outils de communication", "Teams"]}},
  "M2333": {"title": "Manager en réseaux sociaux", "skills": {"techniques": ["Gestion des réseaux sociaux", "Marketing de contenu", "Gestion de communauté"], "soft_skills": ["Leadership", "Créativité", "Empathie"], "outils": ["Excel", "Outils de réseaux sociaux", "Teams"]}},
  "M2334": {"title": "Manager en SEO", "skills": {"techniques": ["SEO/SEM", "Analytics et reporting", "A/B testing"], "soft_skills": ["Leadership", "Créativité", "Analytique"], "outils": ["Excel", "Google Analytics", "Teams"]}},
  "M2335": {"title": "Manager en publicité", "skills": {"techniques": ["Publicité", "Email marketing", "Marketing automation"], "soft_skills": ["Leadership", "Créativité", "Analytique"], "outils": ["Excel", "Outils de publicité", "Teams"]}},
  "M2336": {"title": "Manager en événementiel", "skills": {"techniques": ["Événementiel", "Gestion de projet", "Gestion des partenariats"], "soft_skills": ["Leadership", "Organisation", "Créativité"], "outils": ["Excel", "Outils d'événementiel", "Teams"]}},
  "M2337": {"title": "Manager en alliances", "skills": {"techniques": ["Partenariats", "Négociation commerciale", "Stratégie"], "soft_skills": ["Leadership", "Négociation", "Relations interpersonnelles"], "outils": ["Excel", "CRM", "Teams"]}},
  "M2338": {"title": "Manager en trésorerie", "skills": {"techniques": ["Gestion de la trésorerie", "Gestion des investissements", "Analyse financière"], "soft_skills": ["Leadership", "Analytique", "Vigilance"], "outils": ["Excel", "Outils financiers", "ERP"]}},
  "M2339": {"title": "Manager en achats", "skills": {"techniques": ["Gestion des achats", "Contrats d'achat", "Optimisation des coûts"], "soft_skills": ["Leadership", "Négociation", "Responsabilité"], "outils": ["Excel", "ERP", "Teams"]}},
  "M2340": {"title": "Manager en production", "skills": {"techniques": ["Gestion de production", "Qualité des produits", "Optimisation des processus"], "soft_skills": ["Leadership", "Attention aux détails", "Organisation"], "outils": ["Excel", "ERP", "Teams"]}},
  "M2341": {"title": "Manager en maintenance", "skills": {"techniques": ["Gestion de la maintenance", "Troubleshooting", "Monitoring et supervision"], "soft_skills": ["Leadership", "Résolution de problèmes", "Vigilance"], "outils": ["Excel", "Outils de maintenance", "Teams"]}},
  "M2342": {"title": "Manager en stocks", "skills": {"techniques": ["Gestion des stocks", "Planification logistique", "Gestion des entrepôts"], "soft_skills": ["Leadership", "Organisation", "Attention aux détails"], "outils": ["Excel", "WMS", "Teams"]}},
  "M2343": {"title": "Manager en transports", "skills": {"techniques": ["Gestion des transports", "Planification logistique", "Gestion de la mobilité"], "soft_skills": ["Leadership", "Organisation", "Résolution de problèmes"], "outils": ["Excel", "TMS", "Teams"]}},
  "M2344": {"title": "Manager en RH", "skills": {"techniques": ["Gestion des carrières", "Gestion des équipes", "Employer branding"], "soft_skills": ["Leadership", "Empathie", "Créativité"], "outils": ["Excel", "SIRH", "Teams"]}},
  "M2345": {"title": "Manager en comptabilité", "skills": {"techniques": ["Comptabilité générale", "Comptabilité analytique", "Contrôle de gestion"], "soft_skills": ["Leadership", "Attention aux détails", "Responsabilité"], "outils": ["Excel", "ERP", "Teams"]}},
  "M2346": {"title": "Manager en juridique", "skills": {"techniques": ["Droit du travail", "Compliance RGPD", "Gestion des litiges"], "soft_skills": ["Leadership", "Attention aux détails", "Responsabilité"], "outils": ["Excel", "Outils juridiques", "Teams"]}},
  "M2347": {"title": "Manager en systèmes", "skills": {"techniques": ["Administration système Linux/Windows", "High availability", "Monitoring et supervision"], "soft_skills": ["Leadership", "Résolution de problèmes", "Adaptabilité"], "outils": ["Excel", "Outils d'administration", "Teams"]}},
  "M2348": {"title": "Manager en bases de données", "skills": {"techniques": ["Administration de bases de données", "Database design patterns", "Data warehousing"], "soft_skills": ["Leadership", "Résolution de problèmes", "Curiosité"], "outils": ["Excel", "PostgreSQL", "Teams"]}},
  "M2349": {"title": "Manager en sécurité", "skills": {"techniques": ["Sécurité informatique", "Gestion de la sécurité", "Sécurité des données"], "soft_skills": ["Leadership", "Vigilance", "Responsabilité"], "outils": ["Excel", "Outils de sécurité", "Teams"]}},
  "M2350": {"title": "Manager en innovation", "skills": {"techniques": ["Innovation", "Veille technologique", "Veille économique"], "soft_skills": ["Leadership", "Curiosité", "Créativité"], "outils": ["Excel", "Outils de recherche", "Teams"]}}
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