const fs = require('fs');

// 50 métiers ROME supplémentaires avec de nouveaux codes ROME
const additionalRomeJobs = {
  "M2201": {"title": "Consultant en transformation digitale", "skills": {"techniques": ["Transformation digitale", "Innovation", "Stratégie"], "soft_skills": ["Leadership", "Communication", "Vision stratégique"], "outils": ["PowerPoint", "Excel", "Teams"]}},
  "M2202": {"title": "Consultant en cybersécurité", "skills": {"techniques": ["Cybersécurité", "Sécurité informatique", "Compliance RGPD"], "soft_skills": ["Vigilance", "Responsabilité", "Attention aux détails"], "outils": ["Outils de sécurité", "Excel", "Teams"]}},
  "M2203": {"title": "Consultant en intelligence artificielle", "skills": {"techniques": ["Intelligence artificielle et machine learning", "Big Data et analytics", "Data governance"], "soft_skills": ["Analytique", "Curiosité", "Résolution de problèmes"], "outils": ["Python", "R", "Excel"]}},
  "M2204": {"title": "Consultant en développement durable", "skills": {"techniques": ["Développement durable", "Gestion de l'environnement", "Reporting"], "soft_skills": ["Responsabilité", "Vision stratégique", "Communication"], "outils": ["Excel", "PowerPoint", "Teams"]}},
  "M2205": {"title": "Consultant en excellence opérationnelle", "skills": {"techniques": ["Gestion de la qualité", "Audit interne", "Optimisation des processus"], "soft_skills": ["Attention aux détails", "Analytique", "Organisation"], "outils": ["Excel", "PowerPoint", "Teams"]}},
  "M2206": {"title": "Consultant en supply chain", "skills": {"techniques": ["Supply chain management", "Logistique", "Gestion de production"], "soft_skills": ["Organisation", "Analytique", "Communication"], "outils": ["Excel", "WMS", "TMS"]}},
  "M2207": {"title": "Consultant en expérience client", "skills": {"techniques": ["Gestion des clients", "Service client", "Personnalisation"], "soft_skills": ["Empathie", "Créativité", "Communication"], "outils": ["CRM", "Excel", "Teams"]}},
  "M2208": {"title": "Consultant en marketing digital", "skills": {"techniques": ["Marketing digital", "Marketing de contenu", "SEO/SEM"], "soft_skills": ["Créativité", "Analytique", "Communication"], "outils": ["Excel", "Google Analytics", "Teams"]}},
  "M2209": {"title": "Consultant en formation", "skills": {"techniques": ["Gestion des formations", "Conception pédagogique", "Évaluation des compétences"], "soft_skills": ["Empathie", "Créativité", "Patience"], "outils": ["Excel", "LMS", "Teams"]}},
  "M2210": {"title": "Consultant en santé et sécurité", "skills": {"techniques": ["Prévention", "Gestion des incidents", "Soins infirmiers"], "soft_skills": ["Vigilance", "Bienveillance", "Empathie"], "outils": ["Excel", "Outils de prévention", "Teams"]}},
  "M2211": {"title": "Consultant en recherche", "skills": {"techniques": ["Recherche", "Innovation", "Veille technologique"], "soft_skills": ["Curiosité", "Créativité", "Patience"], "outils": ["Excel", "Outils de recherche", "Teams"]}},
  "M2212": {"title": "Consultant en conformité", "skills": {"techniques": ["Compliance", "Compliance RGPD", "Audit interne"], "soft_skills": ["Attention aux détails", "Responsabilité", "Vigilance"], "outils": ["Excel", "Outils de compliance", "Teams"]}},
  "M2213": {"title": "Consultant en gestion des risques", "skills": {"techniques": ["Gestion des risques", "Audit interne", "Analyse des risques"], "soft_skills": ["Vigilance", "Analytique", "Responsabilité"], "outils": ["Excel", "Outils de gestion des risques", "Teams"]}},
  "M2214": {"title": "Consultant en gestion des crises", "skills": {"techniques": ["Communication de crise", "Gestion des urgences", "Planification"], "soft_skills": ["Calme", "Résistance au stress", "Leadership"], "outils": ["Excel", "Outils de communication", "Teams"]}},
  "M2215": {"title": "Consultant en partenariats", "skills": {"techniques": ["Partenariats", "Négociation commerciale", "Gestion des clients"], "soft_skills": ["Négociation", "Relations interpersonnelles", "Empathie"], "outils": ["Excel", "CRM", "Teams"]}},
  "M2216": {"title": "Consultant en acquisitions", "skills": {"techniques": ["Analyse financière", "Analyse de marché", "Gestion des investissements"], "soft_skills": ["Analytique", "Vision stratégique", "Attention aux détails"], "outils": ["Excel", "Outils financiers", "Teams"]}},
  "M2217": {"title": "Consultant en brevets", "skills": {"techniques": ["Veille technologique", "Recherche", "Gestion de la propriété intellectuelle"], "soft_skills": ["Attention aux détails", "Curiosité", "Responsabilité"], "outils": ["Excel", "Outils de veille", "Teams"]}},
  "M2218": {"title": "Consultant en normes", "skills": {"techniques": ["Gestion des certifications", "Compliance", "Gestion de la qualité"], "soft_skills": ["Attention aux détails", "Organisation", "Responsabilité"], "outils": ["Excel", "Outils de gestion", "Teams"]}},
  "M2219": {"title": "Consultant en systèmes d'information", "skills": {"techniques": ["Gestion des systèmes d'information", "Administration de bases de données", "Sécurité informatique"], "soft_skills": ["Résolution de problèmes", "Analytique", "Adaptabilité"], "outils": ["Excel", "Outils d'administration", "Teams"]}},
  "M2220": {"title": "Consultant en cloud", "skills": {"techniques": ["Cloud computing (AWS, Azure, GCP)", "High availability", "Disaster recovery"], "soft_skills": ["Résolution de problèmes", "Analytique", "Adaptabilité"], "outils": ["Excel", "Outils cloud", "Teams"]}},
  "M2221": {"title": "Consultant en données", "skills": {"techniques": ["Gestion des données", "Data governance", "Data migration"], "soft_skills": ["Organisation", "Attention aux détails", "Responsabilité"], "outils": ["Excel", "Outils de gestion des données", "Teams"]}},
  "M2222": {"title": "Consultant en performances", "skills": {"techniques": ["Gestion de la performance", "Optimisation des performances", "KPI et tableaux de bord"], "soft_skills": ["Analytique", "Résolution de problèmes", "Curiosité"], "outils": ["Excel", "Outils de performance", "Teams"]}},
  "M2223": {"title": "Consultant en mobilités", "skills": {"techniques": ["Gestion des mobilités", "Gestion des carrières", "Gestion des expatriations"], "soft_skills": ["Empathie", "Gestion interculturelle", "Patience"], "outils": ["Excel", "SIRH", "Teams"]}},
  "M2224": {"title": "Consultant en diversité", "skills": {"techniques": ["Gestion des équipes", "Employer branding", "Gestion des carrières"], "soft_skills": ["Sensibilité culturelle", "Empathie", "Créativité"], "outils": ["Excel", "SIRH", "Teams"]}},
  "M2225": {"title": "Consultant en bien-être", "skills": {"techniques": ["Gestion de la douleur", "Prévention", "Gestion des équipes"], "soft_skills": ["Bienveillance", "Empathie", "Patience"], "outils": ["Excel", "SIRH", "Teams"]}},
  "M2226": {"title": "Consultant en relations sociales", "skills": {"techniques": ["Droit du travail", "Gestion des litiges", "Négociation"], "soft_skills": ["Négociation", "Diplomatie", "Patience"], "outils": ["Excel", "Outils juridiques", "Teams"]}},
  "M2227": {"title": "Consultant en rémunération", "skills": {"techniques": ["Gestion de la paie", "Gestion des avantages sociaux", "Fiscalité"], "soft_skills": ["Confidentialité", "Analytique", "Responsabilité"], "outils": ["Excel", "Outils de paie", "Teams"]}},
  "M2228": {"title": "Consultant en recrutement", "skills": {"techniques": ["Recrutement et sélection", "Gestion des candidatures", "Sourcing de candidats"], "soft_skills": ["Service client", "Empathie", "Relations interpersonnelles"], "outils": ["Excel", "Outils de recrutement", "Teams"]}},
  "M2229": {"title": "Consultant en formation continue", "skills": {"techniques": ["Gestion des formations", "Innovation pédagogique", "Gestion des certifications"], "soft_skills": ["Empathie", "Créativité", "Organisation"], "outils": ["Excel", "LMS", "Teams"]}},
  "M2230": {"title": "Consultant en évaluations", "skills": {"techniques": ["Gestion des évaluations", "Évaluation des compétences", "Gestion de la performance"], "soft_skills": ["Objectivité", "Analytique", "Empathie"], "outils": ["Excel", "Outils d'évaluation", "Teams"]}},
  "M2231": {"title": "Consultant en mobilités internationales", "skills": {"techniques": ["Gestion des expatriations", "Gestion des carrières", "Gestion interculturelle"], "soft_skills": ["Gestion interculturelle", "Empathie", "Adaptabilité"], "outils": ["Excel", "Outils de gestion", "Teams"]}},
  "M2232": {"title": "Consultant en relations presse", "skills": {"techniques": ["Gestion des médias", "Relations presse", "Communication de crise"], "soft_skills": ["Créativité", "Relations interpersonnelles", "Résistance au stress"], "outils": ["Excel", "Outils de communication", "Teams"]}},
  "M2233": {"title": "Consultant en réseaux sociaux", "skills": {"techniques": ["Gestion des réseaux sociaux", "Marketing de contenu", "Gestion de communauté"], "soft_skills": ["Créativité", "Empathie", "Adaptabilité"], "outils": ["Excel", "Outils de réseaux sociaux", "Teams"]}},
  "M2234": {"title": "Consultant en SEO", "skills": {"techniques": ["SEO/SEM", "Analytics et reporting", "A/B testing"], "soft_skills": ["Créativité", "Analytique", "Curiosité"], "outils": ["Excel", "Google Analytics", "Teams"]}},
  "M2235": {"title": "Consultant en publicité", "skills": {"techniques": ["Publicité", "Email marketing", "Marketing automation"], "soft_skills": ["Créativité", "Analytique", "Adaptabilité"], "outils": ["Excel", "Outils de publicité", "Teams"]}},
  "M2236": {"title": "Consultant en événementiel", "skills": {"techniques": ["Événementiel", "Gestion de projet", "Gestion des partenariats"], "soft_skills": ["Organisation", "Créativité", "Résistance au stress"], "outils": ["Excel", "Outils d'événementiel", "Teams"]}},
  "M2237": {"title": "Consultant en alliances", "skills": {"techniques": ["Partenariats", "Négociation commerciale", "Stratégie"], "soft_skills": ["Négociation", "Relations interpersonnelles", "Analytique"], "outils": ["Excel", "CRM", "Teams"]}},
  "M2238": {"title": "Consultant en trésorerie", "skills": {"techniques": ["Gestion de la trésorerie", "Gestion des investissements", "Analyse financière"], "soft_skills": ["Analytique", "Attention aux détails", "Vigilance"], "outils": ["Excel", "Outils financiers", "ERP"]}},
  "M2239": {"title": "Consultant en achats", "skills": {"techniques": ["Gestion des achats", "Contrats d'achat", "Optimisation des coûts"], "soft_skills": ["Négociation", "Analytique", "Responsabilité"], "outils": ["Excel", "ERP", "Teams"]}},
  "M2240": {"title": "Consultant en production", "skills": {"techniques": ["Gestion de production", "Qualité des produits", "Optimisation des processus"], "soft_skills": ["Attention aux détails", "Analytique", "Organisation"], "outils": ["Excel", "ERP", "Teams"]}},
  "M2241": {"title": "Consultant en maintenance", "skills": {"techniques": ["Gestion de la maintenance", "Troubleshooting", "Monitoring et supervision"], "soft_skills": ["Résolution de problèmes", "Analytique", "Vigilance"], "outils": ["Excel", "Outils de maintenance", "Teams"]}},
  "M2242": {"title": "Consultant en stocks", "skills": {"techniques": ["Gestion des stocks", "Planification logistique", "Gestion des entrepôts"], "soft_skills": ["Organisation", "Analytique", "Attention aux détails"], "outils": ["Excel", "WMS", "Teams"]}},
  "M2243": {"title": "Consultant en transports", "skills": {"techniques": ["Gestion des transports", "Planification logistique", "Gestion de la mobilité"], "soft_skills": ["Organisation", "Analytique", "Résolution de problèmes"], "outils": ["Excel", "TMS", "Teams"]}},
  "M2244": {"title": "Consultant en RH", "skills": {"techniques": ["Gestion des carrières", "Gestion des équipes", "Employer branding"], "soft_skills": ["Empathie", "Créativité", "Organisation"], "outils": ["Excel", "SIRH", "Teams"]}},
  "M2245": {"title": "Consultant en comptabilité", "skills": {"techniques": ["Comptabilité générale", "Comptabilité analytique", "Contrôle de gestion"], "soft_skills": ["Attention aux détails", "Analytique", "Responsabilité"], "outils": ["Excel", "ERP", "Teams"]}},
  "M2246": {"title": "Consultant en juridique", "skills": {"techniques": ["Droit du travail", "Compliance RGPD", "Gestion des litiges"], "soft_skills": ["Attention aux détails", "Responsabilité", "Vigilance"], "outils": ["Excel", "Outils juridiques", "Teams"]}},
  "M2247": {"title": "Consultant en systèmes", "skills": {"techniques": ["Administration système Linux/Windows", "High availability", "Monitoring et supervision"], "soft_skills": ["Résolution de problèmes", "Analytique", "Adaptabilité"], "outils": ["Excel", "Outils d'administration", "Teams"]}},
  "M2248": {"title": "Consultant en bases de données", "skills": {"techniques": ["Administration de bases de données", "Database design patterns", "Data warehousing"], "soft_skills": ["Résolution de problèmes", "Analytique", "Curiosité"], "outils": ["Excel", "PostgreSQL", "Teams"]}},
  "M2249": {"title": "Consultant en sécurité", "skills": {"techniques": ["Sécurité informatique", "Gestion de la sécurité", "Sécurité des données"], "soft_skills": ["Vigilance", "Responsabilité", "Résolution de problèmes"], "outils": ["Excel", "Outils de sécurité", "Teams"]}},
  "M2250": {"title": "Consultant en innovation", "skills": {"techniques": ["Innovation", "Veille technologique", "Veille économique"], "soft_skills": ["Curiosité", "Créativité", "Analytique"], "outils": ["Excel", "Outils de recherche", "Teams"]}}
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