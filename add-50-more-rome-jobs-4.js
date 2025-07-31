const fs = require('fs');

// 50 métiers ROME supplémentaires avec de nouveaux codes ROME
const additionalRomeJobs = {
  "M2001": {
    "title": "Expert en transformation digitale et innovation",
    "skills": {
      "techniques": ["Transformation digitale", "Innovation", "Veille technologique", "Gestion de projet", "Stratégie", "Architecture logicielle"],
      "soft_skills": ["Leadership", "Vision stratégique", "Communication", "Créativité", "Curiosité", "Adaptabilité"],
      "outils": ["PowerPoint", "Excel", "Outils de veille", "Teams", "Slack", "Outils de gestion de projet"]
    }
  },
  "M2002": {
    "title": "Expert en cybersécurité et protection des données",
    "skills": {
      "techniques": ["Cybersécurité", "Sécurité informatique", "Compliance RGPD", "Gestion de la sécurité", "Sécurité des données", "Audit interne"],
      "soft_skills": ["Vigilance", "Responsabilité", "Attention aux détails", "Résolution de problèmes", "Communication", "Analytique"],
      "outils": ["Outils de sécurité", "Excel", "PowerPoint", "Teams", "Outils d'audit", "Outils de monitoring"]
    }
  },
  "M2003": {
    "title": "Expert en intelligence artificielle et machine learning",
    "skills": {
      "techniques": ["Intelligence artificielle et machine learning", "Big Data et analytics", "Data governance", "Business Intelligence", "Analytics et reporting", "KPI et tableaux de bord"],
      "soft_skills": ["Analytique", "Curiosité", "Résolution de problèmes", "Communication", "Créativité", "Apprentissage continu"],
      "outils": ["Python", "R", "Tableau", "Power BI", "Excel", "Teams", "Outils ML"]
    }
  },
  "M2004": {
    "title": "Expert en développement durable et RSE",
    "skills": {
      "techniques": ["Développement durable", "Gestion de l'environnement", "Veille économique", "Reporting", "Compliance", "Stratégie"],
      "soft_skills": ["Responsabilité", "Vision stratégique", "Communication", "Empathie", "Leadership", "Créativité"],
      "outils": ["Excel", "PowerPoint", "Outils de reporting", "Teams", "Outils de veille", "Outils de mesure"]
    }
  },
  "M2005": {
    "title": "Expert en excellence opérationnelle et qualité",
    "skills": {
      "techniques": ["Gestion de la qualité", "Audit interne", "Optimisation des processus", "Performance tuning", "Reporting", "Compliance"],
      "soft_skills": ["Attention aux détails", "Analytique", "Résolution de problèmes", "Communication", "Organisation", "Leadership"],
      "outils": ["Excel", "PowerPoint", "Outils d'audit", "Teams", "Outils de reporting", "Outils d'optimisation"]
    }
  },
  "M2006": {
    "title": "Expert en supply chain et logistique",
    "skills": {
      "techniques": ["Supply chain management", "Logistique", "Gestion de production", "Planification logistique", "Optimisation des flux", "Reporting logistique"],
      "soft_skills": ["Organisation", "Analytique", "Résolution de problèmes", "Communication", "Leadership", "Attention aux détails"],
      "outils": ["Excel", "PowerPoint", "WMS", "TMS", "Teams", "Outils de planification"]
    }
  },
  "M2007": {
    "title": "Expert en expérience client et UX",
    "skills": {
      "techniques": ["Gestion des clients", "Service client", "Personnalisation", "A/B testing", "Analytics et reporting", "KPI et tableaux de bord"],
      "soft_skills": ["Empathie", "Créativité", "Communication", "Analytique", "Résolution de problèmes", "Service client"],
      "outils": ["CRM", "Excel", "PowerPoint", "Teams", "Outils d'analytics", "Outils de test"]
    }
  },
  "M2008": {
    "title": "Expert en marketing digital et communication",
    "skills": {
      "techniques": ["Communication", "Communication digitale", "Marketing digital", "Marketing de contenu", "SEO/SEM", "Analytics et reporting"],
      "soft_skills": ["Créativité", "Communication", "Analytique", "Résolution de problèmes", "Adaptabilité", "Curiosité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de marketing", "Google Analytics", "Outils SEO"]
    }
  },
  "M2009": {
    "title": "Expert en formation et développement des compétences",
    "skills": {
      "techniques": ["Gestion des formations", "Conception pédagogique", "Évaluation des compétences", "Innovation pédagogique", "Reporting formation", "Gestion des certifications"],
      "soft_skills": ["Empathie", "Créativité", "Communication", "Patience", "Organisation", "Leadership"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils pédagogiques", "LMS", "Outils d'évaluation"]
    }
  },
  "M2010": {
    "title": "Expert en santé et sécurité au travail",
    "skills": {
      "techniques": ["Prévention", "Gestion des incidents", "Gestion de la douleur", "Soins infirmiers", "Techniques de soins", "Reporting"],
      "soft_skills": ["Vigilance", "Bienveillance", "Communication", "Empathie", "Responsabilité", "Calme"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de prévention", "Outils de reporting", "Outils médicaux"]
    }
  },
  "M2011": {
    "title": "Expert en recherche et développement",
    "skills": {
      "techniques": ["Recherche", "Innovation", "Veille technologique", "Veille économique", "Veille professionnelle", "Reporting"],
      "soft_skills": ["Curiosité", "Créativité", "Communication", "Patience", "Analytique", "Résolution de problèmes"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de recherche", "Outils de veille", "Outils d'analyse"]
    }
  },
  "M2012": {
    "title": "Expert en conformité et réglementation",
    "skills": {
      "techniques": ["Compliance", "Compliance RGPD", "Compliance et audit", "Veille réglementaire", "Audit interne", "Reporting"],
      "soft_skills": ["Attention aux détails", "Responsabilité", "Communication", "Analytique", "Organisation", "Vigilance"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de compliance", "Outils d'audit", "Outils de veille"]
    }
  },
  "M2013": {
    "title": "Expert en gestion des risques",
    "skills": {
      "techniques": ["Gestion des risques", "Audit interne", "Prévention", "Compliance", "Reporting", "Analyse des risques"],
      "soft_skills": ["Vigilance", "Analytique", "Communication", "Attention aux détails", "Résolution de problèmes", "Responsabilité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de gestion des risques", "Outils d'audit", "Outils d'analyse"]
    }
  },
  "M2014": {
    "title": "Expert en gestion des crises",
    "skills": {
      "techniques": ["Communication de crise", "Gestion des urgences", "Prévention", "Gestion des incidents", "Reporting", "Planification"],
      "soft_skills": ["Calme", "Résistance au stress", "Communication", "Leadership", "Résolution de problèmes", "Organisation"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de communication", "Outils de planification", "Outils de reporting"]
    }
  },
  "M2015": {
    "title": "Expert en partenariats stratégiques",
    "skills": {
      "techniques": ["Partenariats", "Gestion des partenariats", "Négociation commerciale", "Gestion des clients", "Reporting commercial", "Stratégie"],
      "soft_skills": ["Négociation", "Relations interpersonnelles", "Communication", "Leadership", "Analytique", "Empathie"],
      "outils": ["Excel", "PowerPoint", "Teams", "CRM", "Outils de négociation", "Outils de reporting"]
    }
  },
  "M2016": {
    "title": "Expert en acquisitions et fusions",
    "skills": {
      "techniques": ["Analyse financière", "Analyse de marché", "Benchmarking", "Gestion des investissements", "Reporting financier", "Stratégie"],
      "soft_skills": ["Analytique", "Vision stratégique", "Communication", "Leadership", "Attention aux détails", "Résolution de problèmes"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils financiers", "Outils d'analyse", "Outils de reporting"]
    }
  },
  "M2017": {
    "title": "Expert en brevets et propriété intellectuelle",
    "skills": {
      "techniques": ["Veille technologique", "Recherche", "Innovation", "Compliance", "Reporting", "Gestion de la propriété intellectuelle"],
      "soft_skills": ["Attention aux détails", "Curiosité", "Communication", "Analytique", "Organisation", "Responsabilité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de veille", "Outils de recherche", "Outils de gestion"]
    }
  },
  "M2018": {
    "title": "Expert en normes et certifications",
    "skills": {
      "techniques": ["Gestion des certifications", "Compliance", "Audit interne", "Gestion de la qualité", "Reporting", "Veille réglementaire"],
      "soft_skills": ["Attention aux détails", "Organisation", "Communication", "Responsabilité", "Analytique", "Vigilance"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de gestion", "Outils d'audit", "Outils de reporting"]
    }
  },
  "M2019": {
    "title": "Expert en systèmes d'information",
    "skills": {
      "techniques": ["Gestion des systèmes d'information", "Administration de bases de données", "Sécurité informatique", "Gestion de la sécurité", "Reporting", "Architecture logicielle"],
      "soft_skills": ["Résolution de problèmes", "Analytique", "Communication", "Leadership", "Attention aux détails", "Adaptabilité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils d'administration", "Outils de sécurité", "Outils de reporting"]
    }
  },
  "M2020": {
    "title": "Expert en infrastructures cloud",
    "skills": {
      "techniques": ["Cloud computing (AWS, Azure, GCP)", "Cloud databases (AWS RDS, Azure SQL)", "High availability", "Disaster recovery", "Monitoring et supervision", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Analytique", "Communication", "Leadership", "Attention aux détails", "Adaptabilité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils cloud", "Outils de monitoring", "Outils de reporting"]
    }
  },
  "M2021": {
    "title": "Expert en données et gouvernance",
    "skills": {
      "techniques": ["Gestion des données", "Data governance", "Data migration", "Data warehousing", "Gestion des données personnelles", "Reporting"],
      "soft_skills": ["Organisation", "Attention aux détails", "Communication", "Leadership", "Analytique", "Responsabilité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de gestion des données", "Outils de migration", "Outils de reporting"]
    }
  },
  "M2022": {
    "title": "Expert en performances et optimisation",
    "skills": {
      "techniques": ["Gestion de la performance", "Optimisation des performances", "Performance tuning", "KPI et tableaux de bord", "Analytics et reporting", "Reporting"],
      "soft_skills": ["Analytique", "Résolution de problèmes", "Communication", "Leadership", "Attention aux détails", "Curiosité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de performance", "Outils d'analytics", "Outils de reporting"]
    }
  },
  "M2023": {
    "title": "Expert en mobilités et carrières",
    "skills": {
      "techniques": ["Gestion des mobilités", "Gestion des carrières", "Gestion des expatriations", "Gestion des équipes", "Reporting RH", "Gestion des évaluations"],
      "soft_skills": ["Empathie", "Gestion interculturelle", "Communication", "Leadership", "Organisation", "Patience"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils de gestion", "Outils de reporting"]
    }
  },
  "M2024": {
    "title": "Expert en diversité et inclusion",
    "skills": {
      "techniques": ["Gestion des équipes", "Employer branding", "Gestion des carrières", "Reporting RH", "Gestion des évaluations", "Communication"],
      "soft_skills": ["Sensibilité culturelle", "Empathie", "Communication", "Leadership", "Créativité", "Patience"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils de communication", "Outils de reporting"]
    }
  },
  "M2025": {
    "title": "Expert en bien-être et qualité de vie au travail",
    "skills": {
      "techniques": ["Gestion de la douleur", "Prévention", "Gestion des équipes", "Reporting RH", "Gestion des évaluations", "Communication"],
      "soft_skills": ["Bienveillance", "Empathie", "Communication", "Leadership", "Patience", "Responsabilité"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils de prévention", "Outils de reporting"]
    }
  },
  "M2026": {
    "title": "Expert en relations sociales et syndicales",
    "skills": {
      "techniques": ["Droit du travail", "Gestion des litiges", "Gestion des équipes", "Reporting RH", "Négociation", "Communication"],
      "soft_skills": ["Négociation", "Diplomatie", "Communication", "Leadership", "Patience", "Responsabilité"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils juridiques", "Outils de reporting"]
    }
  },
  "M2027": {
    "title": "Expert en rémunération et avantages",
    "skills": {
      "techniques": ["Gestion de la paie", "Gestion des avantages sociaux", "Benchmarking", "Fiscalité", "Reporting RH", "Gestion de la rémunération"],
      "soft_skills": ["Confidentialité", "Analytique", "Communication", "Leadership", "Attention aux détails", "Responsabilité"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils de paie", "Outils de reporting"]
    }
  },
  "M2028": {
    "title": "Expert en recrutement et sourcing",
    "skills": {
      "techniques": ["Recrutement et sélection", "Gestion des candidatures", "Sourcing de candidats", "Gestion des clients", "Reporting RH", "Service client"],
      "soft_skills": ["Service client", "Empathie", "Communication", "Leadership", "Patience", "Relations interpersonnelles"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils de recrutement", "Outils de reporting"]
    }
  },
  "M2029": {
    "title": "Expert en formation et développement",
    "skills": {
      "techniques": ["Gestion des formations", "Conception pédagogique", "Innovation pédagogique", "Gestion des certifications", "Reporting formation", "Évaluation des compétences"],
      "soft_skills": ["Empathie", "Créativité", "Communication", "Leadership", "Patience", "Organisation"],
      "outils": ["Excel", "PowerPoint", "Teams", "LMS", "Outils pédagogiques", "Outils de reporting"]
    }
  },
  "M2030": {
    "title": "Expert en évaluations et performances",
    "skills": {
      "techniques": ["Gestion des évaluations", "Évaluation des compétences", "Gestion de la performance", "KPI et tableaux de bord", "Reporting RH", "Analytics et reporting"],
      "soft_skills": ["Objectivité", "Analytique", "Communication", "Leadership", "Attention aux détails", "Empathie"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils d'évaluation", "Outils de reporting"]
    }
  },
  "M2031": {
    "title": "Expert en mobilités internationales",
    "skills": {
      "techniques": ["Gestion des mobilités", "Gestion des expatriations", "Gestion des carrières", "Reporting RH", "Gestion des équipes", "Gestion interculturelle"],
      "soft_skills": ["Gestion interculturelle", "Empathie", "Communication", "Leadership", "Patience", "Adaptabilité"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils de gestion", "Outils de reporting"]
    }
  },
  "M2032": {
    "title": "Expert en relations presse et médias",
    "skills": {
      "techniques": ["Gestion des médias", "Relations presse", "Communication", "Communication de crise", "Reporting", "Gestion des événements"],
      "soft_skills": ["Créativité", "Relations interpersonnelles", "Communication", "Leadership", "Adaptabilité", "Résistance au stress"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de communication", "Outils de relations presse", "Outils de reporting"]
    }
  },
  "M2033": {
    "title": "Expert en réseaux sociaux et community management",
    "skills": {
      "techniques": ["Gestion des réseaux sociaux", "Marketing de contenu", "Gestion de communauté", "Communication", "Analytics et reporting", "Reporting"],
      "soft_skills": ["Créativité", "Empathie", "Communication", "Leadership", "Adaptabilité", "Curiosité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de réseaux sociaux", "Outils d'analytics", "Outils de reporting"]
    }
  },
  "M2034": {
    "title": "Expert en contenu et SEO",
    "skills": {
      "techniques": ["Marketing de contenu", "SEO/SEM", "Analytics et reporting", "Communication", "Reporting", "A/B testing"],
      "soft_skills": ["Créativité", "Analytique", "Communication", "Leadership", "Curiosité", "Adaptabilité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils SEO", "Google Analytics", "Outils de reporting"]
    }
  },
  "M2035": {
    "title": "Expert en publicité et marketing digital",
    "skills": {
      "techniques": ["Publicité", "Marketing digital", "Email marketing", "Marketing automation", "Analytics et reporting", "Reporting"],
      "soft_skills": ["Créativité", "Analytique", "Communication", "Leadership", "Adaptabilité", "Curiosité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de publicité", "Outils d'analytics", "Outils de reporting"]
    }
  },
  "M2036": {
    "title": "Expert en événements et événementiel",
    "skills": {
      "techniques": ["Événementiel", "Événementiel commercial", "Gestion de projet", "Communication", "Reporting commercial", "Gestion des partenariats"],
      "soft_skills": ["Organisation", "Créativité", "Communication", "Leadership", "Résistance au stress", "Adaptabilité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils d'événementiel", "Outils de gestion", "Outils de reporting"]
    }
  },
  "M2037": {
    "title": "Expert en partenariats et alliances",
    "skills": {
      "techniques": ["Partenariats", "Gestion des partenariats", "Négociation commerciale", "Gestion des clients", "Reporting commercial", "Stratégie"],
      "soft_skills": ["Négociation", "Relations interpersonnelles", "Communication", "Leadership", "Analytique", "Empathie"],
      "outils": ["Excel", "PowerPoint", "Teams", "CRM", "Outils de négociation", "Outils de reporting"]
    }
  },
  "M2038": {
    "title": "Expert en investissements et trésorerie",
    "skills": {
      "techniques": ["Gestion de la trésorerie", "Gestion des investissements", "Analyse financière", "Reporting financier", "Fiscalité", "KPI et tableaux de bord"],
      "soft_skills": ["Analytique", "Attention aux détails", "Communication", "Leadership", "Responsabilité", "Vigilance"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils financiers", "ERP", "Outils de reporting"]
    }
  },
  "M2039": {
    "title": "Expert en achats et supply chain",
    "skills": {
      "techniques": ["Gestion des achats", "Supply chain management", "Contrats d'achat", "Négociation commerciale", "Reporting", "Optimisation des coûts"],
      "soft_skills": ["Négociation", "Analytique", "Communication", "Leadership", "Attention aux détails", "Responsabilité"],
      "outils": ["Excel", "PowerPoint", "Teams", "ERP", "Outils d'achat", "Outils de reporting"]
    }
  },
  "M2040": {
    "title": "Expert en production et qualité",
    "skills": {
      "techniques": ["Gestion de production", "Gestion de la qualité", "Qualité des produits", "Audit interne", "Reporting", "Optimisation des processus"],
      "soft_skills": ["Attention aux détails", "Analytique", "Communication", "Leadership", "Organisation", "Responsabilité"],
      "outils": ["Excel", "PowerPoint", "Teams", "ERP", "Outils de qualité", "Outils de reporting"]
    }
  },
  "M2041": {
    "title": "Expert en maintenance et fiabilité",
    "skills": {
      "techniques": ["Gestion de la maintenance", "Troubleshooting", "High availability", "Monitoring et supervision", "Reporting", "Gestion de la sécurité"],
      "soft_skills": ["Résolution de problèmes", "Analytique", "Communication", "Leadership", "Attention aux détails", "Vigilance"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de maintenance", "Outils de monitoring", "Outils de reporting"]
    }
  },
  "M2042": {
    "title": "Expert en stocks et logistique",
    "skills": {
      "techniques": ["Gestion des stocks", "Logistique", "Planification logistique", "Optimisation des flux", "Reporting logistique", "Gestion des entrepôts"],
      "soft_skills": ["Organisation", "Analytique", "Communication", "Leadership", "Attention aux détails", "Résolution de problèmes"],
      "outils": ["Excel", "PowerPoint", "Teams", "WMS", "Outils de planification", "Outils de reporting"]
    }
  },
  "M2043": {
    "title": "Expert en transports et mobilité",
    "skills": {
      "techniques": ["Gestion des transports", "Logistique", "Planification logistique", "Optimisation des flux", "Reporting logistique", "Gestion de la mobilité"],
      "soft_skills": ["Organisation", "Analytique", "Communication", "Leadership", "Attention aux détails", "Résolution de problèmes"],
      "outils": ["Excel", "PowerPoint", "Teams", "TMS", "Outils de planification", "Outils de reporting"]
    }
  },
  "M2044": {
    "title": "Expert en ressources humaines et développement",
    "skills": {
      "techniques": ["Gestion des carrières", "Gestion des équipes", "Gestion des formations", "Gestion des évaluations", "Reporting RH", "Employer branding"],
      "soft_skills": ["Empathie", "Créativité", "Communication", "Leadership", "Patience", "Organisation"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils de gestion", "Outils de reporting"]
    }
  },
  "M2045": {
    "title": "Expert en gestion financière et comptable",
    "skills": {
      "techniques": ["Comptabilité générale", "Comptabilité analytique", "Analyse financière", "Contrôle de gestion", "Reporting financier", "Fiscalité"],
      "soft_skills": ["Attention aux détails", "Analytique", "Communication", "Leadership", "Responsabilité", "Vigilance"],
      "outils": ["Excel", "PowerPoint", "Teams", "ERP", "Outils comptables", "Outils de reporting"]
    }
  },
  "M2046": {
    "title": "Expert en gestion juridique et conformité",
    "skills": {
      "techniques": ["Droit du travail", "Compliance", "Compliance RGPD", "Gestion des litiges", "Veille réglementaire", "Reporting"],
      "soft_skills": ["Attention aux détails", "Responsabilité", "Communication", "Leadership", "Vigilance", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils juridiques", "Outils de compliance", "Outils de reporting"]
    }
  },
  "M2047": {
    "title": "Expert en systèmes et infrastructure",
    "skills": {
      "techniques": ["Administration système Linux/Windows", "Gestion des systèmes d'information", "High availability", "Disaster recovery", "Monitoring et supervision", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Analytique", "Communication", "Leadership", "Attention aux détails", "Adaptabilité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils d'administration", "Outils de monitoring", "Outils de reporting"]
    }
  },
  "M2048": {
    "title": "Expert en bases de données et architecture",
    "skills": {
      "techniques": ["Administration de bases de données", "Bases de données (SQL, NoSQL)", "Database design patterns", "Data warehousing", "Architecture logicielle", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Analytique", "Communication", "Leadership", "Attention aux détails", "Curiosité"],
      "outils": ["Excel", "PowerPoint", "Teams", "PostgreSQL", "MongoDB", "Outils de reporting"]
    }
  },
  "M2049": {
    "title": "Expert en sécurité et protection",
    "skills": {
      "techniques": ["Sécurité informatique", "Cybersécurité", "Gestion de la sécurité", "Sécurité des données", "Monitoring et supervision", "Reporting"],
      "soft_skills": ["Vigilance", "Responsabilité", "Communication", "Leadership", "Attention aux détails", "Résolution de problèmes"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de sécurité", "Outils de monitoring", "Outils de reporting"]
    }
  },
  "M2050": {
    "title": "Expert en innovation et recherche",
    "skills": {
      "techniques": ["Innovation", "Recherche", "Veille technologique", "Veille économique", "Veille professionnelle", "Reporting"],
      "soft_skills": ["Curiosité", "Créativité", "Communication", "Leadership", "Patience", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de recherche", "Outils de veille", "Outils de reporting"]
    }
  }
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