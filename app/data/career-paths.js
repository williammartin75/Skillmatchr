// Base de données des parcours de carrière pour SkillMatchr
// Évolutions, transitions et parcours de progression

export const careerPathsDatabase = {
  // Parcours Développeur
  "M1805": {
    code: "M1805",
    title: "Développeur informatique",
    career_path: {
      junior: {
        title: "Développeur Junior",
        experience: "0-2 ans",
        salary_range: "35k-45k€",
        skills_required: [
          "Programmation orientée objet",
          "Développement web (HTML, CSS, JavaScript)",
          "Git et gestion de versions",
          "Travail en équipe"
        ],
        responsibilities: [
          "Développement de fonctionnalités simples",
          "Tests unitaires",
          "Documentation technique",
          "Participation aux réunions d'équipe"
        ]
      },
      confirmed: {
        title: "Développeur Confirmé",
        experience: "3-5 ans",
        salary_range: "45k-65k€",
        skills_required: [
          "Frameworks frontend (React, Vue.js, Angular)",
          "Frameworks backend (Node.js, Django, Spring)",
          "Bases de données (SQL, NoSQL)",
          "APIs REST et GraphQL",
          "Tests unitaires et d'intégration",
          "Communication technique"
        ],
        responsibilities: [
          "Développement de fonctionnalités complexes",
          "Architecture de modules",
          "Mentorat des juniors",
          "Participation aux décisions techniques"
        ]
      },
      senior: {
        title: "Développeur Senior",
        experience: "5-8 ans",
        salary_range: "65k-85k€",
        skills_required: [
          "Microservices",
          "Architecture logicielle",
          "Docker et conteneurisation",
          "CI/CD et DevOps",
          "Gestion de projet agile",
          "Veille technologique"
        ],
        responsibilities: [
          "Architecture système",
          "Lead technique",
          "Formation d'équipe",
          "Décisions stratégiques"
        ]
      },
      lead: {
        title: "Tech Lead / Architecte",
        experience: "8+ ans",
        salary_range: "85k-120k€",
        skills_required: [
          "Architecture distribuée",
          "Cloud (AWS, Azure, GCP)",
          "Leadership",
          "Stratégie technique",
          "Gestion budgétaire"
        ],
        responsibilities: [
          "Direction technique",
          "Architecture globale",
          "Gestion d'équipe",
          "Stratégie produit"
        ]
      }
    },
    transitions: [
      {
        to: "P1101",
        title: "Chef de projet informatique",
        difficulty: "Moyen",
        skills_to_acquire: [
          "Gestion de projet agile",
          "Planification et suivi",
          "Gestion des risques",
          "Leadership",
          "Communication"
        ],
        estimated_time: "1-2 ans",
        success_rate: "75%"
      },
      {
        to: "M1806",
        title: "Expert en bases de données",
        difficulty: "Facile",
        skills_to_acquire: [
          "Administration de bases de données",
          "Optimisation des performances",
          "Sécurité des données",
          "Big Data"
        ],
        estimated_time: "6-12 mois",
        success_rate: "85%"
      }
    ]
  },

  // Parcours Chef de projet
  "P1101": {
    code: "P1101",
    title: "Chef de projet informatique",
    career_path: {
      junior: {
        title: "Chef de projet Junior",
        experience: "0-2 ans",
        salary_range: "45k-55k€",
        skills_required: [
          "Gestion de projet agile",
          "Planification et suivi",
          "Communication",
          "Travail en équipe"
        ],
        responsibilities: [
          "Suivi de projets simples",
          "Coordination d'équipe",
          "Reporting",
          "Gestion des tâches"
        ]
      },
      confirmed: {
        title: "Chef de projet Confirmé",
        experience: "3-5 ans",
        salary_range: "55k-75k€",
        skills_required: [
          "Gestion des risques",
          "Gestion budgétaire",
          "Coordination d'équipes",
          "Méthodologies (Scrum, Kanban)",
          "Négociation"
        ],
        responsibilities: [
          "Gestion de projets complexes",
          "Gestion des parties prenantes",
          "Optimisation des processus",
          "Formation d'équipe"
        ]
      },
      senior: {
        title: "Chef de projet Senior",
        experience: "5-8 ans",
        salary_range: "75k-95k€",
        skills_required: [
          "Outils de gestion de projet",
          "Reporting et communication",
          "Gestion du stress",
          "Adaptabilité",
          "Empathie"
        ],
        responsibilities: [
          "Portfolio de projets",
          "Stratégie projet",
          "Mentorat",
          "Innovation"
        ]
      },
      lead: {
        title: "Directeur de projet / PMO",
        experience: "8+ ans",
        salary_range: "95k-130k€",
        skills_required: [
          "Stratégie d'entreprise",
          "Gestion de portefeuille",
          "Leadership",
          "Gestion budgétaire globale"
        ],
        responsibilities: [
          "Direction de portefeuille",
          "Stratégie organisationnelle",
          "Gestion de crise",
          "Transformation digitale"
        ]
      }
    },
    transitions: [
      {
        to: "N1101",
        title: "Conseil en organisation",
        difficulty: "Facile",
        skills_to_acquire: [
          "Analyse organisationnelle",
          "Gestion du changement",
          "Optimisation des processus",
          "Stratégie d'entreprise"
        ],
        estimated_time: "1-2 ans",
        success_rate: "80%"
      },
      {
        to: "M1805",
        title: "Développeur Senior",
        difficulty: "Difficile",
        skills_to_acquire: [
          "Programmation",
          "Architecture logicielle",
          "Technologies récentes"
        ],
        estimated_time: "2-3 ans",
        success_rate: "40%"
      }
    ]
  },

  // Parcours Marketing Digital
  "R1101": {
    code: "R1101",
    title: "Responsable marketing digital",
    career_path: {
      junior: {
        title: "Chargé de marketing digital",
        experience: "0-2 ans",
        salary_range: "35k-45k€",
        skills_required: [
          "SEO et SEM",
          "Réseaux sociaux",
          "Email marketing",
          "Analytics et reporting"
        ],
        responsibilities: [
          "Gestion des campagnes",
          "Création de contenu",
          "Suivi des performances",
          "Reporting"
        ]
      },
      confirmed: {
        title: "Responsable marketing digital",
        experience: "3-5 ans",
        salary_range: "45k-65k€",
        skills_required: [
          "Stratégie marketing digital",
          "Content marketing",
          "Publicité en ligne",
          "Conversion et CRO",
          "Leadership"
        ],
        responsibilities: [
          "Stratégie marketing",
          "Gestion d'équipe",
          "Budget marketing",
          "Innovation"
        ]
      },
      senior: {
        title: "Directeur marketing digital",
        experience: "5-8 ans",
        salary_range: "65k-85k€",
        skills_required: [
          "Stratégie globale",
          "Gestion de marque",
          "Innovation",
          "Analyse de données"
        ],
        responsibilities: [
          "Direction marketing",
          "Stratégie produit",
          "Partnerships",
          "Transformation digitale"
        ]
      },
      lead: {
        title: "Directeur marketing / CMO",
        experience: "8+ ans",
        salary_range: "85k-120k€",
        skills_required: [
          "Stratégie d'entreprise",
          "Leadership global",
          "Gestion budgétaire",
          "Vision produit"
        ],
        responsibilities: [
          "Direction marketing globale",
          "Stratégie d'entreprise",
          "Gestion de crise",
          "Innovation produit"
        ]
      }
    },
    transitions: [
      {
        to: "H1201",
        title: "Responsable commercial",
        difficulty: "Moyen",
        skills_to_acquire: [
          "Techniques de vente",
          "Gestion de clientèle",
          "Négociation commerciale",
          "CRM"
        ],
        estimated_time: "1-2 ans",
        success_rate: "70%"
      },
      {
        to: "P1101",
        title: "Chef de projet marketing",
        difficulty: "Facile",
        skills_to_acquire: [
          "Gestion de projet",
          "Planification",
          "Coordination d'équipe"
        ],
        estimated_time: "6-12 mois",
        success_rate: "85%"
      }
    ]
  },

  // Parcours Commercial
  "H1201": {
    code: "H1201",
    title: "Responsable commercial",
    career_path: {
      junior: {
        title: "Commercial Junior",
        experience: "0-2 ans",
        salary_range: "25k-35k€",
        skills_required: [
          "Techniques de vente",
          "Gestion de clientèle",
          "Persuasion",
          "Résistance au stress"
        ],
        responsibilities: [
          "Prospection",
          "Vente directe",
          "Suivi client",
          "Reporting"
        ]
      },
      confirmed: {
        title: "Commercial Confirmé",
        experience: "3-5 ans",
        salary_range: "35k-55k€",
        skills_required: [
          "Négociation commerciale",
          "Planification commerciale",
          "Analyse de marché",
          "Gestion des objectifs",
          "Empathie"
        ],
        responsibilities: [
          "Gestion de portefeuille",
          "Négociation complexe",
          "Formation junior",
          "Stratégie commerciale"
        ]
      },
      senior: {
        title: "Responsable commercial",
        experience: "5-8 ans",
        salary_range: "55k-75k€",
        skills_required: [
          "Formation d'équipe",
          "Reporting commercial",
          "Leadership",
          "Adaptabilité",
          "Persévérance"
        ],
        responsibilities: [
          "Direction d'équipe",
          "Stratégie commerciale",
          "Gestion de crise",
          "Innovation commerciale"
        ]
      },
      lead: {
        title: "Directeur commercial",
        experience: "8+ ans",
        salary_range: "75k-120k€",
        skills_required: [
          "Stratégie d'entreprise",
          "Gestion budgétaire",
          "Leadership global",
          "Vision marché"
        ],
        responsibilities: [
          "Direction commerciale",
          "Stratégie d'entreprise",
          "Gestion de crise",
          "Expansion marché"
        ]
      }
    },
    transitions: [
      {
        to: "R1101",
        title: "Responsable marketing digital",
        difficulty: "Moyen",
        skills_to_acquire: [
          "Stratégie marketing",
          "Digital",
          "Analytics",
          "Content marketing"
        ],
        estimated_time: "1-2 ans",
        success_rate: "65%"
      },
      {
        to: "F1101",
        title: "Responsable RH",
        difficulty: "Difficile",
        skills_to_acquire: [
          "Droit du travail",
          "Gestion des carrières",
          "Relations sociales",
          "Recrutement"
        ],
        estimated_time: "2-3 ans",
        success_rate: "45%"
      }
    ]
  }
};

// Fonction pour obtenir le parcours de carrière d'un métier
export function getCareerPath(romeCode) {
  return careerPathsDatabase[romeCode] || null;
}

// Fonction pour obtenir les transitions possibles
export function getCareerTransitions(romeCode) {
  const careerPath = careerPathsDatabase[romeCode];
  return careerPath ? careerPath.transitions : [];
}

// Fonction pour obtenir les compétences nécessaires pour une transition
export function getTransitionSkills(fromRomeCode, toRomeCode) {
  const transitions = getCareerTransitions(fromRomeCode);
  const transition = transitions.find(t => t.to === toRomeCode);
  return transition ? transition.skills_to_acquire : [];
}

// Fonction pour calculer la difficulté d'une transition
export function getTransitionDifficulty(fromRomeCode, toRomeCode) {
  const transitions = getCareerTransitions(fromRomeCode);
  const transition = transitions.find(t => t.to === toRomeCode);
  return transition ? transition.difficulty : "Inconnue";
}

// Fonction pour obtenir les métiers de transition recommandés
export function getRecommendedTransitions(userSkills, romeSkillsDatabase) {
  const allTransitions = [];
  
  Object.keys(careerPathsDatabase).forEach(romeCode => {
    const transitions = getCareerTransitions(romeCode);
    transitions.forEach(transition => {
      const requiredSkills = transition.skills_to_acquire;
      const userSkillNames = userSkills.map(skill => skill.name.toLowerCase());
      
      const matchingSkills = requiredSkills.filter(skill => 
        userSkillNames.some(userSkill => 
          skill.toLowerCase().includes(userSkill) || 
          userSkill.includes(skill.toLowerCase())
        )
      );
      
      const compatibility = Math.round((matchingSkills.length / requiredSkills.length) * 100);
      
      if (compatibility > 30) {
        allTransitions.push({
          from: romeCode,
          from_title: careerPathsDatabase[romeCode].title,
          to: transition.to,
          to_title: transition.title,
          compatibility,
          difficulty: transition.difficulty,
          estimated_time: transition.estimated_time,
          success_rate: transition.success_rate,
          skills_to_acquire: transition.skills_to_acquire
        });
      }
    });
  });
  
  return allTransitions.sort((a, b) => b.compatibility - a.compatibility);
}

// Fonction pour obtenir les évolutions de carrière
export function getCareerEvolutions(romeCode, currentLevel = "junior") {
  const careerPath = careerPathsDatabase[romeCode];
  if (!careerPath) return [];
  
  const levels = ["junior", "confirmed", "senior", "lead"];
  const currentIndex = levels.indexOf(currentLevel);
  
  if (currentIndex === -1) return [];
  
  const evolutions = [];
  for (let i = currentIndex + 1; i < levels.length; i++) {
    const level = levels[i];
    evolutions.push({
      level,
      ...careerPath.career_path[level]
    });
  }
  
  return evolutions;
} 