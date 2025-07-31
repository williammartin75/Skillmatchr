// Base de données des formations et certifications
// Simulée pour démonstration - à remplacer par une vraie base de données

import { romeSkillsDatabase } from './rome-skills-database.js';

// Base de données de formations pour SkillMatchr
// Mapping formations → Compétences ROME

export const formationsDatabase = {
  // Formations techniques
  "bootcamp-fullstack": {
    id: "bootcamp-fullstack",
    name: "Bootcamp Full-Stack",
    provider: "Le Wagon",
    type: "Bootcamp",
    duration: "9 semaines",
    cost: 6000,
    format: "Présentiel",
    locations: ["Paris", "Lyon", "Bordeaux", "Nantes", "Marseille"],
    skills_covered: [
      "Développement web (HTML, CSS, JavaScript)",
      "Frameworks frontend (React, Vue.js, Angular)",
      "Frameworks backend (Node.js, Django, Spring)",
      "Bases de données (SQL, NoSQL)",
      "Git et gestion de versions",
      "Docker et conteneurisation"
    ],
    certifications: ["Le Wagon Certificate"],
    job_guarantee: true,
    average_salary_after: 45000,
    rating: 4.8,
    reviews_count: 156,
    website: "https://www.lewagon.com",
    description: "Formation intensive pour devenir développeur full-stack en 9 semaines"
  },

  "formation-data-science": {
    id: "formation-data-science",
    name: "Formation Data Science",
    provider: "DataCamp",
    type: "Formation en ligne",
    duration: "6 mois",
    cost: 2400,
    format: "En ligne",
    locations: ["En ligne"],
    skills_covered: [
      "Python",
      "Machine Learning",
      "SQL",
      "Big Data (Hadoop, Spark)",
      "Analytics et reporting",
      "Statistiques"
    ],
    certifications: ["DataCamp Certificate"],
    job_guarantee: false,
    average_salary_after: 52000,
    rating: 4.6,
    reviews_count: 89,
    website: "https://www.datacamp.com",
    description: "Formation complète en data science avec projets pratiques"
  },

  "master-informatique": {
    id: "master-informatique",
    name: "Master en Informatique",
    provider: "Université Paris-Saclay",
    type: "Formation universitaire",
    duration: "2 ans",
    cost: 243,
    format: "Présentiel",
    locations: ["Paris"],
    skills_covered: [
      "Programmation orientée objet",
      "Architecture logicielle",
      "Bases de données (SQL, NoSQL)",
      "APIs REST et GraphQL",
      "Tests unitaires et d'intégration",
      "Gestion de projet agile"
    ],
    certifications: ["Master en Informatique"],
    job_guarantee: false,
    average_salary_after: 48000,
    rating: 4.4,
    reviews_count: 234,
    website: "https://www.universite-paris-saclay.fr",
    description: "Formation universitaire complète en informatique"
  },

  // Formations marketing digital
  "formation-marketing-digital": {
    id: "formation-marketing-digital",
    name: "Formation Marketing Digital",
    provider: "OpenClassrooms",
    type: "Formation en ligne",
    duration: "12 mois",
    cost: 3000,
    format: "En ligne",
    locations: ["En ligne"],
    skills_covered: [
      "Stratégie marketing digital",
      "SEO et SEM",
      "Réseaux sociaux",
      "Email marketing",
      "Content marketing",
      "Analytics et reporting",
      "Publicité en ligne"
    ],
    certifications: ["OpenClassrooms Certificate"],
    job_guarantee: true,
    average_salary_after: 38000,
    rating: 4.5,
    reviews_count: 203,
    website: "https://www.openclassrooms.com",
    description: "Formation complète en marketing digital avec mentorat"
  },

  // Formations management
  "mba-management": {
    id: "mba-management",
    name: "MBA Management",
    provider: "HEC Paris",
    type: "Formation universitaire",
    duration: "15 mois",
    cost: 75000,
    format: "Présentiel",
    locations: ["Paris"],
    skills_covered: [
      "Leadership",
      "Stratégie d'entreprise",
      "Gestion de projet",
      "Communication persuasive",
      "Négociation",
      "Gestion du stress"
    ],
    certifications: ["MBA HEC Paris"],
    job_guarantee: false,
    average_salary_after: 85000,
    rating: 4.9,
    reviews_count: 156,
    website: "https://www.hec.edu",
    description: "MBA prestigieux pour futurs dirigeants"
  },

  // Formations commerciales
  "formation-commercial": {
    id: "formation-commercial",
    name: "Formation Commerciale",
    provider: "CCI Formation",
    type: "Formation continue",
    duration: "3 mois",
    cost: 1800,
    format: "Présentiel",
    locations: ["Paris", "Lyon", "Marseille", "Bordeaux"],
    skills_covered: [
      "Techniques de vente",
      "Gestion de clientèle",
      "Négociation commerciale",
      "Planification commerciale",
      "CRM (Salesforce, HubSpot)",
      "Persuasion"
    ],
    certifications: ["CCI Certificate"],
    job_guarantee: false,
    average_salary_after: 32000,
    rating: 4.3,
    reviews_count: 78,
    website: "https://www.cci-formation.fr",
    description: "Formation pratique aux techniques de vente"
  },

  // Formations RH
  "formation-rh": {
    id: "formation-rh",
    name: "Formation Ressources Humaines",
    provider: "CNAM",
    type: "Formation continue",
    duration: "6 mois",
    format: "Hybride",
    cost: 2000,
    locations: ["Paris", "Lyon", "Marseille"],
    skills_covered: [
      "Recrutement et sélection",
      "Gestion des carrières",
      "Formation et développement",
      "Relations sociales",
      "Droit du travail",
      "Gestion des conflits"
    ],
    certifications: ["CNAM Certificate"],
    job_guarantee: false,
    average_salary_after: 35000,
    rating: 4.4,
    reviews_count: 92,
    website: "https://www.cnam.fr",
    description: "Formation complète en ressources humaines"
  },

  // Certifications techniques
  "certification-aws": {
    id: "certification-aws",
    name: "AWS Solutions Architect",
    provider: "Amazon Web Services",
    type: "Certification",
    duration: "3 mois",
    cost: 150,
    format: "En ligne",
    locations: ["En ligne"],
    skills_covered: [
      "Cloud databases (AWS RDS, Azure SQL)",
      "Docker et conteneurisation",
      "CI/CD et DevOps",
      "Architecture logicielle"
    ],
    certifications: ["AWS Solutions Architect Associate"],
    job_guarantee: false,
    average_salary_after: 65000,
    rating: 4.7,
    reviews_count: 445,
    website: "https://aws.amazon.com",
    description: "Certification officielle AWS pour architecte cloud"
  },

  "certification-google": {
    id: "certification-google",
    name: "Google Analytics Individual Qualification",
    provider: "Google",
    type: "Certification",
    duration: "1 mois",
    cost: 0,
    format: "En ligne",
    locations: ["En ligne"],
    skills_covered: [
      "Analytics et reporting",
      "Google Analytics",
      "Content marketing",
      "Conversion et CRO"
    ],
    certifications: ["Google Analytics Individual Qualification"],
    job_guarantee: false,
    average_salary_after: 42000,
    rating: 4.5,
    reviews_count: 1234,
    website: "https://analytics.google.com",
    description: "Certification gratuite Google Analytics"
  }
};

// Mapping des compétences vers les formations
export const skillToFormationMapping = {
  "Développement web (HTML, CSS, JavaScript)": ["bootcamp-fullstack", "master-informatique"],
  "Frameworks frontend (React, Vue.js, Angular)": ["bootcamp-fullstack"],
  "Frameworks backend (Node.js, Django, Spring)": ["bootcamp-fullstack", "master-informatique"],
  "Bases de données (SQL, NoSQL)": ["bootcamp-fullstack", "master-informatique", "formation-data-science"],
  "Git et gestion de versions": ["bootcamp-fullstack", "master-informatique"],
  "Docker et conteneurisation": ["bootcamp-fullstack", "certification-aws"],
  "Python": ["formation-data-science"],
  "Machine Learning": ["formation-data-science"],
  "Big Data (Hadoop, Spark)": ["formation-data-science"],
  "Analytics et reporting": ["formation-data-science", "formation-marketing-digital", "certification-google"],
  "Stratégie marketing digital": ["formation-marketing-digital"],
  "SEO et SEM": ["formation-marketing-digital"],
  "Réseaux sociaux": ["formation-marketing-digital"],
  "Email marketing": ["formation-marketing-digital"],
  "Content marketing": ["formation-marketing-digital", "certification-google"],
  "Publicité en ligne": ["formation-marketing-digital"],
  "Leadership": ["mba-management"],
  "Stratégie d'entreprise": ["mba-management"],
  "Gestion de projet": ["mba-management", "master-informatique"],
  "Communication persuasive": ["mba-management"],
  "Négociation": ["mba-management", "formation-commercial"],
  "Techniques de vente": ["formation-commercial"],
  "Gestion de clientèle": ["formation-commercial"],
  "CRM (Salesforce, HubSpot)": ["formation-commercial"],
  "Recrutement et sélection": ["formation-rh"],
  "Gestion des carrières": ["formation-rh"],
  "Formation et développement": ["formation-rh"],
  "Relations sociales": ["formation-rh"],
  "Droit du travail": ["formation-rh"],
  "Cloud databases (AWS RDS, Azure SQL)": ["certification-aws"],
  "CI/CD et DevOps": ["certification-aws"],
  "Architecture logicielle": ["master-informatique", "certification-aws"],
  "Google Analytics": ["certification-google"]
};

// Fonction pour obtenir les formations par compétence
export function getFormationsBySkill(skill) {
  const formationIds = skillToFormationMapping[skill] || [];
  return formationIds.map(id => formationsDatabase[id]).filter(Boolean);
}

// Fonction pour obtenir les formations par métier ROME
export function getFormationsByRomeCode(romeCode) {
  const romeData = romeSkillsDatabase[romeCode];
  if (!romeData) return [];

  const allSkills = [
    ...(romeData.skills.techniques || []),
    ...(romeData.skills.soft_skills || []),
    ...(romeData.skills.outils || [])
  ];

  const formations = new Set();
  allSkills.forEach(skill => {
    if (skill && skillToFormationMapping[skill]) {
      const skillFormations = getFormationsBySkill(skill);
      skillFormations.forEach(formation => formations.add(formation.id));
    }
  });

  return Array.from(formations).map(id => formationsDatabase[id]);
}

// Fonction pour obtenir les formations par budget
export function getFormationsByBudget(maxBudget) {
  return Object.values(formationsDatabase)
    .filter(formation => formation.cost <= maxBudget)
    .sort((a, b) => a.cost - b.cost);
}

// Fonction pour obtenir les formations par durée
export function getFormationsByDuration(maxDuration) {
  const durationToMonths = {
    "1 mois": 1,
    "3 mois": 3,
    "6 mois": 6,
    "9 semaines": 2,
    "12 mois": 12,
    "15 mois": 15,
    "2 ans": 24
  };

  return Object.values(formationsDatabase)
    .filter(formation => {
      const durationMonths = durationToMonths[formation.duration] || 0;
      return durationMonths <= maxDuration;
    })
    .sort((a, b) => {
      const aMonths = durationToMonths[a.duration] || 0;
      const bMonths = durationToMonths[b.duration] || 0;
      return aMonths - bMonths;
    });
}

// Fonction pour obtenir les formations les plus populaires
export function getMostPopularFormations() {
  return Object.values(formationsDatabase)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);
}

// Fonction pour obtenir les formations avec garantie d'emploi
export function getFormationsWithJobGuarantee() {
  return Object.values(formationsDatabase)
    .filter(formation => formation.job_guarantee)
    .sort((a, b) => b.average_salary_after - a.average_salary_after);
} 