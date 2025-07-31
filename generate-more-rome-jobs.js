const fs = require('fs');

// Métiers ROME supplémentaires à ajouter
const additionalRomeJobs = {
  // SECTEUR INFORMATIQUE ET NUMÉRIQUE
  "M1808": {
    "code": "M1808",
    "title": "Expert en cybersécurité",
    "description": "Protection des systèmes informatiques et des données",
    "secteur": "Informatique et Numérique",
    "skills": {
      "techniques": [
        "Sécurité des réseaux",
        "Cryptographie",
        "Tests d'intrusion",
        "Forensic numérique",
        "Gestion des incidents",
        "Conformité RGPD",
        "Sécurité des applications",
        "Gestion des vulnérabilités",
        "Audit de sécurité",
        "Politiques de sécurité"
      ],
      "soft_skills": [
        "Analyse critique",
        "Résolution de problèmes",
        "Communication",
        "Travail en équipe",
        "Adaptabilité",
        "Gestion du stress"
      ],
      "outils": [
        "Wireshark",
        "Nmap",
        "Metasploit",
        "Burp Suite",
        "Kali Linux"
      ]
    },
    "salary_range": "45k-100k€",
    "difficulty": "Élevé",
    "market_demand": "Très élevée"
  },

  "M1809": {
    "code": "M1809",
    "title": "Data Scientist",
    "description": "Analyse de données et intelligence artificielle",
    "secteur": "Informatique et Numérique",
    "skills": {
      "techniques": [
        "Python",
        "R",
        "Machine Learning",
        "Deep Learning",
        "Statistiques",
        "Big Data",
        "SQL",
        "Data Visualization",
        "NLP",
        "Computer Vision"
      ],
      "soft_skills": [
        "Analyse critique",
        "Résolution de problèmes",
        "Communication",
        "Curiosité",
        "Adaptabilité"
      ],
      "outils": [
        "Jupyter",
        "TensorFlow",
        "PyTorch",
        "Scikit-learn",
        "Tableau"
      ]
    },
    "salary_range": "50k-120k€",
    "difficulty": "Élevé",
    "market_demand": "Très élevée"
  },

  // SECTEUR COMMERCIAL ET VENTE
  "D1103": {
    "code": "D1103",
    "title": "Responsable commercial",
    "description": "Management d'équipe commerciale et développement des ventes",
    "secteur": "Commercial et Vente",
    "skills": {
      "techniques": [
        "Management d'équipe",
        "Stratégie commerciale",
        "Gestion des objectifs",
        "Formation commerciale",
        "Reporting",
        "Gestion des budgets",
        "Négociation",
        "Développement client"
      ],
      "soft_skills": [
        "Leadership",
        "Communication",
        "Motivation",
        "Gestion du stress",
        "Empathie"
      ],
      "outils": [
        "CRM",
        "Excel",
        "PowerPoint",
        "Outils de reporting"
      ]
    },
    "salary_range": "45k-90k€",
    "difficulty": "Élevé",
    "market_demand": "Très élevée"
  },

  // SECTEUR MARKETING ET COMMUNICATION
  "E1103": {
    "code": "E1103",
    "title": "Chef de projet digital",
    "description": "Gestion de projets digitaux et transformation numérique",
    "secteur": "Marketing et Communication",
    "skills": {
      "techniques": [
        "Gestion de projet",
        "Marketing digital",
        "UX/UI",
        "Agile",
        "Scrum",
        "Analytics",
        "SEO/SEM",
        "Social Media"
      ],
      "soft_skills": [
        "Leadership",
        "Communication",
        "Organisation",
        "Adaptabilité",
        "Résolution de problèmes"
      ],
      "outils": [
        "Jira",
        "Trello",
        "Google Analytics",
        "Figma",
        "Slack"
      ]
    },
    "salary_range": "40k-80k€",
    "difficulty": "Élevé",
    "market_demand": "Très élevée"
  },

  // SECTEUR FINANCE ET COMPTABILITÉ
  "C1103": {
    "code": "C1103",
    "title": "Analyste financier",
    "description": "Analyse financière et conseil en investissement",
    "secteur": "Finance et Comptabilité",
    "skills": {
      "techniques": [
        "Analyse financière",
        "Modélisation financière",
        "Évaluation d'entreprise",
        "Gestion de portefeuille",
        "Risque financier",
        "Comptabilité",
        "Excel avancé",
        "Reporting"
      ],
      "soft_skills": [
        "Analyse critique",
        "Résolution de problèmes",
        "Communication",
        "Précision",
        "Gestion du stress"
      ],
      "outils": [
        "Excel",
        "Bloomberg",
        "Reuters",
        "PowerPoint",
        "VBA"
      ]
    },
    "salary_range": "45k-100k€",
    "difficulty": "Élevé",
    "market_demand": "Très élevée"
  },

  // SECTEUR RESSOURCES HUMAINES
  "M1503": {
    "code": "M1503",
    "title": "Responsable RH",
    "description": "Gestion des ressources humaines et développement des talents",
    "secteur": "Ressources Humaines",
    "skills": {
      "techniques": [
        "Gestion RH",
        "Recrutement",
        "Formation",
        "Gestion de carrière",
        "Rémunération",
        "Droit du travail",
        "GPEC",
        "QVT"
      ],
      "soft_skills": [
        "Leadership",
        "Communication",
        "Empathie",
        "Écoute active",
        "Gestion du stress"
      ],
      "outils": [
        "SIRH",
        "LinkedIn",
        "Excel",
        "PowerPoint",
        "Outils de formation"
      ]
    },
    "salary_range": "45k-85k€",
    "difficulty": "Élevé",
    "market_demand": "Élevée"
  },

  // SECTEUR LOGISTIQUE ET TRANSPORT
  "N1102": {
    "code": "N1102",
    "title": "Responsable supply chain",
    "description": "Gestion de la chaîne logistique et optimisation des flux",
    "secteur": "Logistique et Transport",
    "skills": {
      "techniques": [
        "Supply chain management",
        "Logistique",
        "Gestion des stocks",
        "Transport",
        "Planification",
        "Optimisation",
        "Gestion des fournisseurs",
        "Reporting"
      ],
      "soft_skills": [
        "Leadership",
        "Organisation",
        "Communication",
        "Résolution de problèmes",
        "Négociation"
      ],
      "outils": [
        "ERP",
        "WMS",
        "TMS",
        "Excel",
        "PowerPoint"
      ]
    },
    "salary_range": "45k-85k€",
    "difficulty": "Élevé",
    "market_demand": "Élevée"
  },

  // SECTEUR PRODUCTION ET INDUSTRIE
  "H1202": {
    "code": "H1202",
    "title": "Ingénieur production",
    "description": "Optimisation des processus de production industrielle",
    "secteur": "Production et Industrie",
    "skills": {
      "techniques": [
        "Gestion de production",
        "Optimisation des processus",
        "Maintenance",
        "Qualité",
        "Sécurité",
        "Gestion des équipes",
        "Planification",
        "Reporting"
      ],
      "soft_skills": [
        "Leadership",
        "Communication",
        "Résolution de problèmes",
        "Organisation",
        "Gestion du stress"
      ],
      "outils": [
        "ERP",
        "Excel",
        "PowerPoint",
        "Outils de CAO",
        "Outils de maintenance"
      ]
    },
    "salary_range": "45k-90k€",
    "difficulty": "Élevé",
    "market_demand": "Élevée"
  },

  // SECTEUR SANTÉ ET SOCIAL
  "K1402": {
    "code": "K1402",
    "title": "Kinésithérapeute",
    "description": "Rééducation et soins de kinésithérapie",
    "secteur": "Santé et Social",
    "skills": {
      "techniques": [
        "Techniques de rééducation",
        "Anatomie",
        "Physiologie",
        "Pathologie",
        "Techniques manuelles",
        "Électrothérapie",
        "Hydrothérapie",
        "Rééducation respiratoire"
      ],
      "soft_skills": [
        "Empathie",
        "Communication",
        "Écoute active",
        "Patience",
        "Adaptabilité"
      ],
      "outils": [
        "Équipements de rééducation",
        "Dossier patient",
        "Outils de diagnostic",
        "Matériel de soins",
        "Outils de communication"
      ]
    },
    "salary_range": "30k-60k€",
    "difficulty": "Moyen",
    "market_demand": "Très élevée"
  },

  // SECTEUR ÉDUCATION ET FORMATION
  "K2102": {
    "code": "K2102",
    "title": "Responsable formation",
    "description": "Gestion de la formation et développement des compétences",
    "secteur": "Éducation et Formation",
    "skills": {
      "techniques": [
        "Gestion de formation",
        "Ingénierie pédagogique",
        "Gestion des budgets",
        "Reporting",
        "Gestion des prestataires",
        "Évaluation",
        "GPEC",
        "Plan de formation"
      ],
      "soft_skills": [
        "Leadership",
        "Communication",
        "Organisation",
        "Adaptabilité",
        "Service client"
      ],
      "outils": [
        "LMS",
        "Excel",
        "PowerPoint",
        "Outils de visioconférence",
        "Outils de reporting"
      ]
    },
    "salary_range": "40k-75k€",
    "difficulty": "Élevé",
    "market_demand": "Élevée"
  },

  // SECTEUR CONSULTING
  "M1601": {
    "code": "M1601",
    "title": "Consultant",
    "description": "Conseil en organisation et transformation",
    "secteur": "Consulting",
    "skills": {
      "techniques": [
        "Analyse organisationnelle",
        "Gestion de projet",
        "Transformation digitale",
        "Change management",
        "Stratégie",
        "Optimisation des processus",
        "Reporting",
        "Formation"
      ],
      "soft_skills": [
        "Communication",
        "Écoute active",
        "Adaptabilité",
        "Résolution de problèmes",
        "Gestion du stress"
      ],
      "outils": [
        "PowerPoint",
        "Excel",
        "Visio",
        "Outils de collaboration",
        "Outils de reporting"
      ]
    },
    "salary_range": "45k-120k€",
    "difficulty": "Élevé",
    "market_demand": "Très élevée"
  },

  // SECTEUR JURIDIQUE
  "M1701": {
    "code": "M1701",
    "title": "Juriste",
    "description": "Conseil juridique et rédaction de contrats",
    "secteur": "Juridique",
    "skills": {
      "techniques": [
        "Droit des affaires",
        "Droit du travail",
        "Droit des contrats",
        "Rédaction juridique",
        "Négociation",
        "Veille juridique",
        "Compliance",
        "Gestion des litiges"
      ],
      "soft_skills": [
        "Analyse critique",
        "Communication",
        "Rigueur",
        "Adaptabilité",
        "Gestion du stress"
      ],
      "outils": [
        "Bases de données juridiques",
        "Word",
        "Excel",
        "Outils de veille",
        "Outils de collaboration"
      ]
    },
    "salary_range": "40k-100k€",
    "difficulty": "Élevé",
    "market_demand": "Élevée"
  },

  // SECTEUR ARCHITECTURE ET CONSTRUCTION
  "F1101": {
    "code": "F1101",
    "title": "Architecte",
    "description": "Conception architecturale et maîtrise d'œuvre",
    "secteur": "Architecture et Construction",
    "skills": {
      "techniques": [
        "Conception architecturale",
        "Dessin technique",
        "Maquette 3D",
        "Réglementation",
        "Gestion de projet",
        "Estimation des coûts",
        "Suivi de chantier",
        "Développement durable"
      ],
      "soft_skills": [
        "Créativité",
        "Communication",
        "Gestion de projet",
        "Adaptabilité",
        "Service client"
      ],
      "outils": [
        "AutoCAD",
        "Revit",
        "SketchUp",
        "Photoshop",
        "Outils de gestion de projet"
      ]
    },
    "salary_range": "35k-80k€",
    "difficulty": "Élevé",
    "market_demand": "Élevée"
  },

  // SECTEUR AGRICULTURE ET ENVIRONNEMENT
  "A1101": {
    "code": "A1101",
    "title": "Ingénieur agronome",
    "description": "Développement agricole et environnemental",
    "secteur": "Agriculture et Environnement",
    "skills": {
      "techniques": [
        "Agronomie",
        "Développement durable",
        "Gestion des sols",
        "Protection des cultures",
        "Irrigation",
        "Machinisme agricole",
        "Élevage",
        "Environnement"
      ],
      "soft_skills": [
        "Adaptabilité",
        "Résolution de problèmes",
        "Communication",
        "Organisation",
        "Service client"
      ],
      "outils": [
        "Outils de cartographie",
        "Excel",
        "PowerPoint",
        "Outils de diagnostic",
        "Outils de monitoring"
      ]
    },
    "salary_range": "35k-70k€",
    "difficulty": "Moyen",
    "market_demand": "Élevée"
  }
};

// Lire la base de données existante
const existingDatabase = require('./app/data/rome-skills-database.js');

// Fusionner les métiers existants avec les nouveaux
const updatedDatabase = {
  ...existingDatabase.romeSkillsDatabase,
  ...additionalRomeJobs
};

// Créer le nouveau contenu du fichier
const newContent = `// Base de données ROME 4.0 complète avec tous les métiers principaux
// Générée automatiquement - 2025-07-29T19:30:00.000Z
// Source: https://www.data.gouv.fr/datasets/repertoire-operationnel-des-metiers-et-des-emplois-rome/

export const romeSkillsDatabase = ${JSON.stringify(updatedDatabase, null, 2)};

// Niveaux de compétence disponibles
export const skillLevels = [
  { value: "debutant", label: "Débutant", color: "bg-gray-100 text-gray-800" },
  { value: "debutant_avance", label: "Débutant Avancé", color: "bg-blue-100 text-blue-800" },
  { value: "intermediaire", label: "Intermédiaire", color: "bg-yellow-100 text-yellow-800" },
  { value: "avance", label: "Avancé", color: "bg-orange-100 text-orange-800" },
  { value: "professionnel", label: "Professionnel", color: "bg-green-100 text-green-800" }
];

// Fonction pour obtenir les compétences d'un métier ROME
export function getRomeSkills(romeCode) {
  return romeSkillsDatabase[romeCode]?.skills || null;
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

  const userSkillNames = userSkills.map(s => s.name.toLowerCase());
  
  const matchingSkills = allRomeSkills.filter(skill => 
    skill && userSkillNames.some(userSkill => 
      skill.toLowerCase().includes(userSkill) || 
      userSkill.includes(skill.toLowerCase())
    )
  );

  const compatibility = Math.round((matchingSkills.length / allRomeSkills.length) * 100);
  return Math.min(compatibility, 100);
}

// Fonction pour calculer les gaps de compétences
export function calculateSkillGaps(userSkills, romeCode) {
  const romeData = romeSkillsDatabase[romeCode];
  if (!romeData || !romeData.skills) return { techniques: [], soft_skills: [], outils: [] };

  const userSkillNames = userSkills.map(s => s.name.toLowerCase());
  const gaps = {
    techniques: [],
    soft_skills: [],
    outils: []
  };

  // Vérifier les compétences techniques manquantes
  if (romeData.skills.techniques) {
    romeData.skills.techniques.forEach(skill => {
      if (skill && typeof skill === 'string' && skill.trim()) {
        const hasSkill = userSkillNames.some(userSkill => 
          skill.toLowerCase().includes(userSkill) || 
          userSkill.includes(skill.toLowerCase())
        );
        if (!hasSkill) {
          gaps.techniques.push(skill);
        }
      }
    });
  }

  // Vérifier les soft skills manquantes
  if (romeData.skills.soft_skills) {
    romeData.skills.soft_skills.forEach(skill => {
      if (skill && typeof skill === 'string' && skill.trim()) {
        const hasSkill = userSkillNames.some(userSkill => 
          skill.toLowerCase().includes(userSkill) || 
          userSkill.includes(skill.toLowerCase())
        );
        if (!hasSkill) {
          gaps.soft_skills.push(skill);
        }
      }
    });
  }

  // Vérifier les outils manquants
  if (romeData.skills.outils) {
    romeData.skills.outils.forEach(skill => {
      if (skill && typeof skill === 'string' && skill.trim()) {
        const hasSkill = userSkillNames.some(userSkill => 
          skill.toLowerCase().includes(userSkill) || 
          userSkill.includes(skill.toLowerCase())
        );
        if (!hasSkill) {
          gaps.outils.push(skill);
        }
      }
    });
  }

  return gaps;
}

// Fonction pour obtenir tous les métiers avec compatibilité et gaps
export function getAllJobsWithCompatibility(userSkills) {
  if (!userSkills || userSkills.length === 0) {
    return Object.values(romeSkillsDatabase).map(job => ({
      ...job,
      compatibility: 0,
      gaps: calculateSkillGaps([], job.code)
    }));
  }

  return Object.values(romeSkillsDatabase).map(job => {
    const compatibility = calculateCompatibility(userSkills, job.code);
    const gaps = calculateSkillGaps(userSkills, job.code);
    
    return {
      ...job,
      compatibility,
      gaps
    };
  }).sort((a, b) => b.compatibility - a.compatibility);
}

// Fonction pour obtenir le niveau de compétence par label
export function getSkillLevelByLabel(label) {
  return skillLevels.find(level => level.label === label) || skillLevels[0];
}

// Fonction pour obtenir le niveau de compétence par valeur
export function getSkillLevelByValue(value) {
  return skillLevels.find(level => level.value === value) || skillLevels[0];
}
`;

// Écrire le nouveau fichier
fs.writeFileSync('./app/data/rome-skills-database.js', newContent);

console.log('✅ Base de données ROME mise à jour avec', Object.keys(updatedDatabase).length, 'métiers');
console.log('📊 Nouveaux métiers ajoutés:', Object.keys(additionalRomeJobs).length); 