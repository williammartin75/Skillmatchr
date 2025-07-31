const fs = require('fs');

// 50 métiers ROME supplémentaires avec de nouveaux codes ROME
const additionalRomeJobs = {
  "M1801": {
    "title": "Développement et administration de sites d'information",
    "skills": {
      "techniques": ["Développement web", "Administration de bases de données", "Gestion des systèmes d'information", "SEO/SEM", "Analytics et reporting"],
      "soft_skills": ["Communication", "Attention aux détails", "Résolution de problèmes", "Organisation"],
      "outils": ["WordPress", "Drupal", "MySQL", "Google Analytics", "Excel"]
    }
  },
  "M1802": {
    "title": "Développement et maintenance d'applications",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "APIs REST et GraphQL", "Tests unitaires", "Git et gestion de versions"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Apprentissage continu"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "MongoDB", "Jira"]
    }
  },
  "M1803": {
    "title": "Développement et maintenance d'applications de gestion",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "ERP", "Gestion de projet", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Analyse"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1804": {
    "title": "Développement et maintenance d'applications de gestion de la relation client",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "CRM", "Gestion des clients", "Reporting commercial"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Service client"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Salesforce", "Excel"]
    }
  },
  "M1805": {
    "title": "Développement et maintenance d'applications de gestion des ressources humaines",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "SIRH", "Gestion des carrières", "Reporting RH"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Confidentialité"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1806": {
    "title": "Développement et maintenance d'applications de gestion de la production",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "ERP", "Gestion de production", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Organisation"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1807": {
    "title": "Développement et maintenance d'applications de gestion de la logistique",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "WMS", "TMS", "Supply chain management"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Organisation"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1808": {
    "title": "Développement et maintenance d'applications de gestion des achats",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "ERP", "Gestion des achats", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Négociation"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1809": {
    "title": "Développement et maintenance d'applications de gestion de la qualité",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion de la qualité", "Audit interne", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Attention aux détails"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1810": {
    "title": "Développement et maintenance d'applications de gestion de la sécurité",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Sécurité informatique", "Gestion de la sécurité", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Vigilance"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1811": {
    "title": "Développement et maintenance d'applications de gestion de l'environnement",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion de l'environnement", "Développement durable", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Responsabilité"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1812": {
    "title": "Développement et maintenance d'applications de gestion de la santé et sécurité",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Prévention", "Gestion des incidents", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Vigilance"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1813": {
    "title": "Développement et maintenance d'applications de gestion de la maintenance",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion de la maintenance", "Troubleshooting", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Organisation"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1814": {
    "title": "Développement et maintenance d'applications de gestion des données",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion des données", "Data governance", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Organisation"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1815": {
    "title": "Développement et maintenance d'applications de gestion de la performance",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion de la performance", "KPI et tableaux de bord", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Analytique"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1816": {
    "title": "Développement et maintenance d'applications de gestion de la mobilité",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion des mobilités", "Gestion des carrières", "Reporting RH"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Empathie"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1817": {
    "title": "Développement et maintenance d'applications de gestion des avantages sociaux",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion des avantages sociaux", "Gestion de la paie", "Reporting RH"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Confidentialité"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1818": {
    "title": "Développement et maintenance d'applications de gestion de la paie",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion de la paie", "Fiscalité", "Reporting RH"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Confidentialité"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1819": {
    "title": "Développement et maintenance d'applications de gestion du recrutement",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Recrutement et sélection", "Gestion des candidatures", "Reporting RH"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Service client"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1820": {
    "title": "Développement et maintenance d'applications de gestion de la formation",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion des formations", "Conception pédagogique", "Reporting formation"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Empathie"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1821": {
    "title": "Développement et maintenance d'applications de gestion des certifications",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion des certifications", "Compliance", "Reporting formation"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Organisation"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1822": {
    "title": "Développement et maintenance d'applications de gestion des évaluations",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion des évaluations", "Évaluation des compétences", "Reporting RH"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Objectivité"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1823": {
    "title": "Développement et maintenance d'applications de gestion de la mobilité internationale",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion des mobilités", "Gestion des expatriations", "Reporting RH"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Gestion interculturelle"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1824": {
    "title": "Développement et maintenance d'applications de gestion de la diversité et inclusion",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion des équipes", "Employer branding", "Reporting RH"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Sensibilité culturelle"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1825": {
    "title": "Développement et maintenance d'applications de gestion du bien-être au travail",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion de la douleur", "Prévention", "Reporting RH"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Bienveillance"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1826": {
    "title": "Développement et maintenance d'applications de gestion des relations sociales",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Droit du travail", "Gestion des litiges", "Reporting RH"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Négociation"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1827": {
    "title": "Développement et maintenance d'applications de gestion de la rémunération",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion de la paie", "Benchmarking", "Reporting RH"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Confidentialité"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1828": {
    "title": "Développement et maintenance d'applications de gestion de la planification",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Capacity planning", "Gestion de projet", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Organisation"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1829": {
    "title": "Développement et maintenance d'applications de gestion de l'optimisation",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Optimisation des processus", "Performance tuning", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Analytique"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1830": {
    "title": "Développement et maintenance d'applications de gestion de l'innovation",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Innovation", "Veille technologique", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Créativité"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1831": {
    "title": "Développement et maintenance d'applications de gestion de la veille",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Veille technologique", "Veille économique", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Curiosité"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1832": {
    "title": "Développement et maintenance d'applications de gestion des partenariats",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Partenariats", "Gestion des partenariats", "Reporting commercial"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Négociation"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1833": {
    "title": "Développement et maintenance d'applications de gestion de l'événementiel",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Événementiel", "Gestion de projet", "Reporting commercial"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Organisation"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1834": {
    "title": "Développement et maintenance d'applications de gestion de la communication",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Communication", "Communication digitale", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Créativité"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1835": {
    "title": "Développement et maintenance d'applications de gestion des médias",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion des médias", "Relations presse", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Créativité"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1836": {
    "title": "Développement et maintenance d'applications de gestion des réseaux sociaux",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion des réseaux sociaux", "Marketing de contenu", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Créativité"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1837": {
    "title": "Développement et maintenance d'applications de gestion du contenu",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Marketing de contenu", "SEO/SEM", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Créativité"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1838": {
    "title": "Développement et maintenance d'applications de gestion du SEO",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "SEO/SEM", "Analytics et reporting", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Analytique"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1839": {
    "title": "Développement et maintenance d'applications de gestion du SEM",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "SEO/SEM", "Publicité", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Analytique"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1840": {
    "title": "Développement et maintenance d'applications de gestion de la publicité",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Publicité", "Marketing digital", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Créativité"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1841": {
    "title": "Développement et maintenance d'applications de gestion de l'email marketing",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Email marketing", "Marketing automation", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Créativité"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1842": {
    "title": "Développement et maintenance d'applications de gestion du marketing automation",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Marketing automation", "Email marketing", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Analytique"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1843": {
    "title": "Développement et maintenance d'applications de gestion de la personnalisation",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Personnalisation", "A/B testing", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Analytique"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1844": {
    "title": "Développement et maintenance d'applications de gestion des analytics",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Analytics et reporting", "KPI et tableaux de bord", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Analytique"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1845": {
    "title": "Développement et maintenance d'applications de gestion du reporting",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Reporting", "Business Intelligence", "KPI et tableaux de bord"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Analytique"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1846": {
    "title": "Développement et maintenance d'applications de gestion de la BI",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Business Intelligence", "Data warehousing", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Analytique"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1847": {
    "title": "Développement et maintenance d'applications de gestion des données",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Gestion des données", "Data governance", "Data migration"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Organisation"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1848": {
    "title": "Développement et maintenance d'applications de gestion de l'IA",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Intelligence artificielle et machine learning", "Big Data et analytics", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Curiosité"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1849": {
    "title": "Développement et maintenance d'applications de gestion de la blockchain",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "Blockchain et technologies distribuées", "Sécurité informatique", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Curiosité"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
    }
  },
  "M1850": {
    "title": "Développement et maintenance d'applications de gestion de l'IoT",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "IoT et systèmes embarqués", "Monitoring et supervision", "Reporting"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Curiosité"],
      "outils": ["Visual Studio Code", "Git", "PostgreSQL", "Excel", "PowerPoint"]
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