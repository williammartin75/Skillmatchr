const fs = require('fs');

// 50 métiers ROME supplémentaires avec de nouveaux codes ROME
const additionalRomeJobs = {
  "M1901": {
    "title": "Direction de l'innovation et de la transformation digitale",
    "skills": {
      "techniques": ["Innovation", "Transformation digitale", "Veille technologique", "Gestion de projet", "Leadership", "Stratégie"],
      "soft_skills": ["Leadership", "Vision stratégique", "Communication", "Décision", "Gestion d'équipe", "Créativité"],
      "outils": ["PowerPoint", "Excel", "Outils de veille", "Teams", "Slack"]
    }
  },
  "M1902": {
    "title": "Direction de la cybersécurité et de la protection des données",
    "skills": {
      "techniques": ["Cybersécurité", "Sécurité informatique", "Compliance RGPD", "Gestion de la sécurité", "Audit interne", "Prévention"],
      "soft_skills": ["Leadership", "Vigilance", "Communication", "Décision", "Gestion d'équipe", "Responsabilité"],
      "outils": ["Outils de sécurité", "Excel", "PowerPoint", "Teams", "Outils d'audit"]
    }
  },
  "M1903": {
    "title": "Direction de la data et de l'intelligence artificielle",
    "skills": {
      "techniques": ["Intelligence artificielle et machine learning", "Big Data et analytics", "Data governance", "Business Intelligence", "Analytics et reporting", "KPI et tableaux de bord"],
      "soft_skills": ["Leadership", "Analytique", "Communication", "Décision", "Gestion d'équipe", "Curiosité"],
      "outils": ["Python", "R", "Tableau", "Power BI", "Excel", "Teams"]
    }
  },
  "M1904": {
    "title": "Direction de la transformation écologique et du développement durable",
    "skills": {
      "techniques": ["Développement durable", "Gestion de l'environnement", "Veille économique", "Gestion de projet", "Reporting", "Compliance"],
      "soft_skills": ["Leadership", "Responsabilité", "Communication", "Décision", "Gestion d'équipe", "Vision stratégique"],
      "outils": ["Excel", "PowerPoint", "Outils de reporting", "Teams", "Outils de veille"]
    }
  },
  "M1905": {
    "title": "Direction de la qualité et de l'excellence opérationnelle",
    "skills": {
      "techniques": ["Gestion de la qualité", "Audit interne", "Optimisation des processus", "Performance tuning", "Reporting", "Compliance"],
      "soft_skills": ["Leadership", "Attention aux détails", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Outils d'audit", "Teams", "Outils de reporting"]
    }
  },
  "M1906": {
    "title": "Direction de la supply chain et de la logistique",
    "skills": {
      "techniques": ["Supply chain management", "Logistique", "Gestion de production", "Planification logistique", "Optimisation des flux", "Reporting logistique"],
      "soft_skills": ["Leadership", "Organisation", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "WMS", "TMS", "Teams", "Outils de planification"]
    }
  },
  "M1907": {
    "title": "Direction de la relation client et de l'expérience utilisateur",
    "skills": {
      "techniques": ["Gestion des clients", "Service client", "Personnalisation", "A/B testing", "Analytics et reporting", "KPI et tableaux de bord"],
      "soft_skills": ["Leadership", "Empathie", "Communication", "Décision", "Gestion d'équipe", "Créativité"],
      "outils": ["CRM", "Excel", "PowerPoint", "Teams", "Outils d'analytics", "Outils de test"]
    }
  },
  "M1908": {
    "title": "Direction de la communication et du marketing digital",
    "skills": {
      "techniques": ["Communication", "Communication digitale", "Marketing digital", "Marketing de contenu", "SEO/SEM", "Analytics et reporting"],
      "soft_skills": ["Leadership", "Créativité", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de marketing", "Google Analytics", "Outils SEO"]
    }
  },
  "M1909": {
    "title": "Direction de la formation et du développement des compétences",
    "skills": {
      "techniques": ["Gestion des formations", "Conception pédagogique", "Évaluation des compétences", "Innovation pédagogique", "Reporting formation", "Gestion des certifications"],
      "soft_skills": ["Leadership", "Empathie", "Communication", "Décision", "Gestion d'équipe", "Créativité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils pédagogiques", "LMS", "Outils d'évaluation"]
    }
  },
  "M1910": {
    "title": "Direction de la santé et sécurité au travail",
    "skills": {
      "techniques": ["Prévention", "Gestion des incidents", "Gestion de la douleur", "Soins infirmiers", "Techniques de soins", "Reporting"],
      "soft_skills": ["Leadership", "Vigilance", "Communication", "Décision", "Gestion d'équipe", "Bienveillance"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de prévention", "Outils de reporting", "Outils médicaux"]
    }
  },
  "M1911": {
    "title": "Direction de la recherche et développement",
    "skills": {
      "techniques": ["Recherche", "Innovation", "Veille technologique", "Veille économique", "Veille professionnelle", "Reporting"],
      "soft_skills": ["Leadership", "Curiosité", "Communication", "Décision", "Gestion d'équipe", "Créativité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de recherche", "Outils de veille", "Outils d'analyse"]
    }
  },
  "M1912": {
    "title": "Direction de la conformité et de la réglementation",
    "skills": {
      "techniques": ["Compliance", "Compliance RGPD", "Compliance et audit", "Veille réglementaire", "Audit interne", "Reporting"],
      "soft_skills": ["Leadership", "Attention aux détails", "Communication", "Décision", "Gestion d'équipe", "Responsabilité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de compliance", "Outils d'audit", "Outils de veille"]
    }
  },
  "M1913": {
    "title": "Direction de la gestion des risques",
    "skills": {
      "techniques": ["Gestion des risques", "Audit interne", "Prévention", "Compliance", "Reporting", "Analyse des risques"],
      "soft_skills": ["Leadership", "Vigilance", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de gestion des risques", "Outils d'audit", "Outils d'analyse"]
    }
  },
  "M1914": {
    "title": "Direction de la gestion des crises",
    "skills": {
      "techniques": ["Communication de crise", "Gestion des urgences", "Prévention", "Gestion des incidents", "Reporting", "Planification"],
      "soft_skills": ["Leadership", "Calme", "Communication", "Décision", "Gestion d'équipe", "Résistance au stress"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de communication", "Outils de planification", "Outils de reporting"]
    }
  },
  "M1915": {
    "title": "Direction de la gestion des partenariats stratégiques",
    "skills": {
      "techniques": ["Partenariats", "Gestion des partenariats", "Négociation commerciale", "Gestion des clients", "Reporting commercial", "Stratégie"],
      "soft_skills": ["Leadership", "Négociation", "Communication", "Décision", "Gestion d'équipe", "Relations interpersonnelles"],
      "outils": ["Excel", "PowerPoint", "Teams", "CRM", "Outils de négociation", "Outils de reporting"]
    }
  },
  "M1916": {
    "title": "Direction de la gestion des acquisitions et fusions",
    "skills": {
      "techniques": ["Analyse financière", "Analyse de marché", "Benchmarking", "Gestion des investissements", "Reporting financier", "Stratégie"],
      "soft_skills": ["Leadership", "Analytique", "Communication", "Décision", "Gestion d'équipe", "Vision stratégique"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils financiers", "Outils d'analyse", "Outils de reporting"]
    }
  },
  "M1917": {
    "title": "Direction de la gestion des brevets et de la propriété intellectuelle",
    "skills": {
      "techniques": ["Veille technologique", "Recherche", "Innovation", "Compliance", "Reporting", "Gestion de la propriété intellectuelle"],
      "soft_skills": ["Leadership", "Attention aux détails", "Communication", "Décision", "Gestion d'équipe", "Curiosité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de veille", "Outils de recherche", "Outils de gestion"]
    }
  },
  "M1918": {
    "title": "Direction de la gestion des normes et certifications",
    "skills": {
      "techniques": ["Gestion des certifications", "Compliance", "Audit interne", "Gestion de la qualité", "Reporting", "Veille réglementaire"],
      "soft_skills": ["Leadership", "Attention aux détails", "Communication", "Décision", "Gestion d'équipe", "Organisation"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de gestion", "Outils d'audit", "Outils de reporting"]
    }
  },
  "M1919": {
    "title": "Direction de la gestion des systèmes d'information",
    "skills": {
      "techniques": ["Gestion des systèmes d'information", "Administration de bases de données", "Sécurité informatique", "Gestion de la sécurité", "Reporting", "Architecture logicielle"],
      "soft_skills": ["Leadership", "Résolution de problèmes", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils d'administration", "Outils de sécurité", "Outils de reporting"]
    }
  },
  "M1920": {
    "title": "Direction de la gestion des infrastructures cloud",
    "skills": {
      "techniques": ["Cloud computing (AWS, Azure, GCP)", "Cloud databases (AWS RDS, Azure SQL)", "High availability", "Disaster recovery", "Monitoring et supervision", "Reporting"],
      "soft_skills": ["Leadership", "Résolution de problèmes", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils cloud", "Outils de monitoring", "Outils de reporting"]
    }
  },
  "M1921": {
    "title": "Direction de la gestion des données et de la gouvernance",
    "skills": {
      "techniques": ["Gestion des données", "Data governance", "Data migration", "Data warehousing", "Gestion des données personnelles", "Reporting"],
      "soft_skills": ["Leadership", "Organisation", "Communication", "Décision", "Gestion d'équipe", "Attention aux détails"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de gestion des données", "Outils de migration", "Outils de reporting"]
    }
  },
  "M1922": {
    "title": "Direction de la gestion des performances et de l'optimisation",
    "skills": {
      "techniques": ["Gestion de la performance", "Optimisation des performances", "Performance tuning", "KPI et tableaux de bord", "Analytics et reporting", "Reporting"],
      "soft_skills": ["Leadership", "Analytique", "Communication", "Décision", "Gestion d'équipe", "Résolution de problèmes"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de performance", "Outils d'analytics", "Outils de reporting"]
    }
  },
  "M1923": {
    "title": "Direction de la gestion des mobilités et des carrières",
    "skills": {
      "techniques": ["Gestion des mobilités", "Gestion des carrières", "Gestion des expatriations", "Gestion des équipes", "Reporting RH", "Gestion des évaluations"],
      "soft_skills": ["Leadership", "Empathie", "Communication", "Décision", "Gestion d'équipe", "Gestion interculturelle"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils de gestion", "Outils de reporting"]
    }
  },
  "M1924": {
    "title": "Direction de la gestion de la diversité et de l'inclusion",
    "skills": {
      "techniques": ["Gestion des équipes", "Employer branding", "Gestion des carrières", "Reporting RH", "Gestion des évaluations", "Communication"],
      "soft_skills": ["Leadership", "Sensibilité culturelle", "Communication", "Décision", "Gestion d'équipe", "Empathie"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils de communication", "Outils de reporting"]
    }
  },
  "M1925": {
    "title": "Direction de la gestion du bien-être et de la qualité de vie au travail",
    "skills": {
      "techniques": ["Gestion de la douleur", "Prévention", "Gestion des équipes", "Reporting RH", "Gestion des évaluations", "Communication"],
      "soft_skills": ["Leadership", "Bienveillance", "Communication", "Décision", "Gestion d'équipe", "Empathie"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils de prévention", "Outils de reporting"]
    }
  },
  "M1926": {
    "title": "Direction de la gestion des relations sociales et syndicales",
    "skills": {
      "techniques": ["Droit du travail", "Gestion des litiges", "Gestion des équipes", "Reporting RH", "Négociation", "Communication"],
      "soft_skills": ["Leadership", "Négociation", "Communication", "Décision", "Gestion d'équipe", "Diplomatie"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils juridiques", "Outils de reporting"]
    }
  },
  "M1927": {
    "title": "Direction de la gestion de la rémunération et des avantages",
    "skills": {
      "techniques": ["Gestion de la paie", "Gestion des avantages sociaux", "Benchmarking", "Fiscalité", "Reporting RH", "Gestion de la rémunération"],
      "soft_skills": ["Leadership", "Confidentialité", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils de paie", "Outils de reporting"]
    }
  },
  "M1928": {
    "title": "Direction de la gestion du recrutement et du sourcing",
    "skills": {
      "techniques": ["Recrutement et sélection", "Gestion des candidatures", "Sourcing de candidats", "Gestion des clients", "Reporting RH", "Service client"],
      "soft_skills": ["Leadership", "Service client", "Communication", "Décision", "Gestion d'équipe", "Empathie"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils de recrutement", "Outils de reporting"]
    }
  },
  "M1929": {
    "title": "Direction de la gestion de la formation et du développement",
    "skills": {
      "techniques": ["Gestion des formations", "Conception pédagogique", "Innovation pédagogique", "Gestion des certifications", "Reporting formation", "Évaluation des compétences"],
      "soft_skills": ["Leadership", "Empathie", "Communication", "Décision", "Gestion d'équipe", "Créativité"],
      "outils": ["Excel", "PowerPoint", "Teams", "LMS", "Outils pédagogiques", "Outils de reporting"]
    }
  },
  "M1930": {
    "title": "Direction de la gestion des évaluations et des performances",
    "skills": {
      "techniques": ["Gestion des évaluations", "Évaluation des compétences", "Gestion de la performance", "KPI et tableaux de bord", "Reporting RH", "Analytics et reporting"],
      "soft_skills": ["Leadership", "Objectivité", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils d'évaluation", "Outils de reporting"]
    }
  },
  "M1931": {
    "title": "Direction de la gestion des mobilités internationales",
    "skills": {
      "techniques": ["Gestion des mobilités", "Gestion des expatriations", "Gestion des carrières", "Reporting RH", "Gestion des équipes", "Gestion interculturelle"],
      "soft_skills": ["Leadership", "Gestion interculturelle", "Communication", "Décision", "Gestion d'équipe", "Empathie"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils de gestion", "Outils de reporting"]
    }
  },
  "M1932": {
    "title": "Direction de la gestion des relations presse et médias",
    "skills": {
      "techniques": ["Gestion des médias", "Relations presse", "Communication", "Communication de crise", "Reporting", "Gestion des événements"],
      "soft_skills": ["Leadership", "Créativité", "Communication", "Décision", "Gestion d'équipe", "Relations interpersonnelles"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de communication", "Outils de relations presse", "Outils de reporting"]
    }
  },
  "M1933": {
    "title": "Direction de la gestion des réseaux sociaux et du community management",
    "skills": {
      "techniques": ["Gestion des réseaux sociaux", "Marketing de contenu", "Gestion de communauté", "Communication", "Analytics et reporting", "Reporting"],
      "soft_skills": ["Leadership", "Créativité", "Communication", "Décision", "Gestion d'équipe", "Empathie"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de réseaux sociaux", "Outils d'analytics", "Outils de reporting"]
    }
  },
  "M1934": {
    "title": "Direction de la gestion du contenu et du SEO",
    "skills": {
      "techniques": ["Marketing de contenu", "SEO/SEM", "Analytics et reporting", "Communication", "Reporting", "A/B testing"],
      "soft_skills": ["Leadership", "Créativité", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils SEO", "Google Analytics", "Outils de reporting"]
    }
  },
  "M1935": {
    "title": "Direction de la gestion de la publicité et du marketing digital",
    "skills": {
      "techniques": ["Publicité", "Marketing digital", "Email marketing", "Marketing automation", "Analytics et reporting", "Reporting"],
      "soft_skills": ["Leadership", "Créativité", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de publicité", "Outils d'analytics", "Outils de reporting"]
    }
  },
  "M1936": {
    "title": "Direction de la gestion des événements et de l'événementiel",
    "skills": {
      "techniques": ["Événementiel", "Événementiel commercial", "Gestion de projet", "Communication", "Reporting commercial", "Gestion des partenariats"],
      "soft_skills": ["Leadership", "Organisation", "Communication", "Décision", "Gestion d'équipe", "Créativité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils d'événementiel", "Outils de gestion", "Outils de reporting"]
    }
  },
  "M1937": {
    "title": "Direction de la gestion des partenariats et alliances",
    "skills": {
      "techniques": ["Partenariats", "Gestion des partenariats", "Négociation commerciale", "Gestion des clients", "Reporting commercial", "Stratégie"],
      "soft_skills": ["Leadership", "Négociation", "Communication", "Décision", "Gestion d'équipe", "Relations interpersonnelles"],
      "outils": ["Excel", "PowerPoint", "Teams", "CRM", "Outils de négociation", "Outils de reporting"]
    }
  },
  "M1938": {
    "title": "Direction de la gestion des investissements et de la trésorerie",
    "skills": {
      "techniques": ["Gestion de la trésorerie", "Gestion des investissements", "Analyse financière", "Reporting financier", "Fiscalité", "KPI et tableaux de bord"],
      "soft_skills": ["Leadership", "Analytique", "Communication", "Décision", "Gestion d'équipe", "Attention aux détails"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils financiers", "ERP", "Outils de reporting"]
    }
  },
  "M1939": {
    "title": "Direction de la gestion des achats et de la supply chain",
    "skills": {
      "techniques": ["Gestion des achats", "Supply chain management", "Contrats d'achat", "Négociation commerciale", "Reporting", "Optimisation des coûts"],
      "soft_skills": ["Leadership", "Négociation", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "ERP", "Outils d'achat", "Outils de reporting"]
    }
  },
  "M1940": {
    "title": "Direction de la gestion de la production et de la qualité",
    "skills": {
      "techniques": ["Gestion de production", "Gestion de la qualité", "Qualité des produits", "Audit interne", "Reporting", "Optimisation des processus"],
      "soft_skills": ["Leadership", "Attention aux détails", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "ERP", "Outils de qualité", "Outils de reporting"]
    }
  },
  "M1941": {
    "title": "Direction de la gestion de la maintenance et de la fiabilité",
    "skills": {
      "techniques": ["Gestion de la maintenance", "Troubleshooting", "High availability", "Monitoring et supervision", "Reporting", "Gestion de la sécurité"],
      "soft_skills": ["Leadership", "Résolution de problèmes", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de maintenance", "Outils de monitoring", "Outils de reporting"]
    }
  },
  "M1942": {
    "title": "Direction de la gestion des stocks et de la logistique",
    "skills": {
      "techniques": ["Gestion des stocks", "Logistique", "Planification logistique", "Optimisation des flux", "Reporting logistique", "Gestion des entrepôts"],
      "soft_skills": ["Leadership", "Organisation", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "WMS", "Outils de planification", "Outils de reporting"]
    }
  },
  "M1943": {
    "title": "Direction de la gestion des transports et de la mobilité",
    "skills": {
      "techniques": ["Gestion des transports", "Logistique", "Planification logistique", "Optimisation des flux", "Reporting logistique", "Gestion de la mobilité"],
      "soft_skills": ["Leadership", "Organisation", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "TMS", "Outils de planification", "Outils de reporting"]
    }
  },
  "M1944": {
    "title": "Direction de la gestion des ressources humaines et du développement",
    "skills": {
      "techniques": ["Gestion des carrières", "Gestion des équipes", "Gestion des formations", "Gestion des évaluations", "Reporting RH", "Employer branding"],
      "soft_skills": ["Leadership", "Empathie", "Communication", "Décision", "Gestion d'équipe", "Créativité"],
      "outils": ["Excel", "PowerPoint", "Teams", "SIRH", "Outils de gestion", "Outils de reporting"]
    }
  },
  "M1945": {
    "title": "Direction de la gestion financière et comptable",
    "skills": {
      "techniques": ["Comptabilité générale", "Comptabilité analytique", "Analyse financière", "Contrôle de gestion", "Reporting financier", "Fiscalité"],
      "soft_skills": ["Leadership", "Attention aux détails", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "ERP", "Outils comptables", "Outils de reporting"]
    }
  },
  "M1946": {
    "title": "Direction de la gestion juridique et de la conformité",
    "skills": {
      "techniques": ["Droit du travail", "Compliance", "Compliance RGPD", "Gestion des litiges", "Veille réglementaire", "Reporting"],
      "soft_skills": ["Leadership", "Attention aux détails", "Communication", "Décision", "Gestion d'équipe", "Responsabilité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils juridiques", "Outils de compliance", "Outils de reporting"]
    }
  },
  "M1947": {
    "title": "Direction de la gestion des systèmes et de l'infrastructure",
    "skills": {
      "techniques": ["Administration système Linux/Windows", "Gestion des systèmes d'information", "High availability", "Disaster recovery", "Monitoring et supervision", "Reporting"],
      "soft_skills": ["Leadership", "Résolution de problèmes", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils d'administration", "Outils de monitoring", "Outils de reporting"]
    }
  },
  "M1948": {
    "title": "Direction de la gestion des bases de données et de l'architecture",
    "skills": {
      "techniques": ["Administration de bases de données", "Bases de données (SQL, NoSQL)", "Database design patterns", "Data warehousing", "Architecture logicielle", "Reporting"],
      "soft_skills": ["Leadership", "Résolution de problèmes", "Communication", "Décision", "Gestion d'équipe", "Analytique"],
      "outils": ["Excel", "PowerPoint", "Teams", "PostgreSQL", "MongoDB", "Outils de reporting"]
    }
  },
  "M1949": {
    "title": "Direction de la gestion de la sécurité et de la protection",
    "skills": {
      "techniques": ["Sécurité informatique", "Cybersécurité", "Gestion de la sécurité", "Sécurité des données", "Monitoring et supervision", "Reporting"],
      "soft_skills": ["Leadership", "Vigilance", "Communication", "Décision", "Gestion d'équipe", "Responsabilité"],
      "outils": ["Excel", "PowerPoint", "Teams", "Outils de sécurité", "Outils de monitoring", "Outils de reporting"]
    }
  },
  "M1950": {
    "title": "Direction de la gestion de l'innovation et de la recherche",
    "skills": {
      "techniques": ["Innovation", "Recherche", "Veille technologique", "Veille économique", "Veille professionnelle", "Reporting"],
      "soft_skills": ["Leadership", "Curiosité", "Communication", "Décision", "Gestion d'équipe", "Créativité"],
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