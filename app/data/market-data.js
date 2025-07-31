// Base de données de marché pour SkillMatchr
// Données salariales, tendances et géographiques

export const marketData = {
  // Salaires par métier et région
  salaries: {
    "M1805": { // Développeur informatique
      "Île-de-France": { min: 45000, max: 85000, median: 65000 },
      "Rhône-Alpes": { min: 40000, max: 75000, median: 58000 },
      "Occitanie": { min: 35000, max: 70000, median: 52000 },
      "Provence-Alpes-Côte d'Azur": { min: 38000, max: 72000, median: 55000 },
      "Hauts-de-France": { min: 32000, max: 65000, median: 48000 },
      "Nouvelle-Aquitaine": { min: 33000, max: 68000, median: 50000 },
      "Pays de la Loire": { min: 34000, max: 67000, median: 51000 },
      "Bretagne": { min: 35000, max: 70000, median: 53000 },
      "Centre-Val de Loire": { min: 32000, max: 63000, median: 47000 },
      "Bourgogne-Franche-Comté": { min: 31000, max: 62000, median: 46000 },
      "Normandie": { min: 30000, max: 60000, median: 45000 },
      "Grand Est": { min: 32000, max: 64000, median: 48000 },
      "Auvergne-Rhône-Alpes": { min: 38000, max: 72000, median: 55000 }
    },
    "M1806": { // Expert bases de données
      "Île-de-France": { min: 50000, max: 95000, median: 72000 },
      "Rhône-Alpes": { min: 45000, max: 85000, median: 65000 },
      "Occitanie": { min: 40000, max: 80000, median: 60000 },
      "Provence-Alpes-Côte d'Azur": { min: 42000, max: 82000, median: 62000 },
      "Hauts-de-France": { min: 35000, max: 75000, median: 55000 },
      "Nouvelle-Aquitaine": { min: 36000, max: 78000, median: 57000 },
      "Pays de la Loire": { min: 37000, max: 77000, median: 58000 },
      "Bretagne": { min: 38000, max: 80000, median: 59000 },
      "Centre-Val de Loire": { min: 35000, max: 73000, median: 54000 },
      "Bourgogne-Franche-Comté": { min: 34000, max: 72000, median: 53000 },
      "Normandie": { min: 33000, max: 70000, median: 52000 },
      "Grand Est": { min: 35000, max: 74000, median: 55000 },
      "Auvergne-Rhône-Alpes": { min: 42000, max: 82000, median: 62000 }
    },
    "P1101": { // Chef de projet informatique
      "Île-de-France": { min: 55000, max: 95000, median: 75000 },
      "Rhône-Alpes": { min: 50000, max: 85000, median: 68000 },
      "Occitanie": { min: 45000, max: 80000, median: 62000 },
      "Provence-Alpes-Côte d'Azur": { min: 47000, max: 82000, median: 65000 },
      "Hauts-de-France": { min: 40000, max: 75000, median: 58000 },
      "Nouvelle-Aquitaine": { min: 41000, max: 78000, median: 60000 },
      "Pays de la Loire": { min: 42000, max: 77000, median: 61000 },
      "Bretagne": { min: 43000, max: 80000, median: 62000 },
      "Centre-Val de Loire": { min: 40000, max: 73000, median: 57000 },
      "Bourgogne-Franche-Comté": { min: 39000, max: 72000, median: 56000 },
      "Normandie": { min: 38000, max: 70000, median: 55000 },
      "Grand Est": { min: 40000, max: 74000, median: 58000 },
      "Auvergne-Rhône-Alpes": { min: 47000, max: 82000, median: 65000 }
    },
    "R1101": { // Marketing digital
      "Île-de-France": { min: 40000, max: 80000, median: 60000 },
      "Rhône-Alpes": { min: 35000, max: 70000, median: 53000 },
      "Occitanie": { min: 30000, max: 65000, median: 47000 },
      "Provence-Alpes-Côte d'Azur": { min: 32000, max: 67000, median: 50000 },
      "Hauts-de-France": { min: 28000, max: 60000, median: 44000 },
      "Nouvelle-Aquitaine": { min: 29000, max: 62000, median: 46000 },
      "Pays de la Loire": { min: 30000, max: 63000, median: 47000 },
      "Bretagne": { min: 31000, max: 65000, median: 48000 },
      "Centre-Val de Loire": { min: 28000, max: 58000, median: 43000 },
      "Bourgogne-Franche-Comté": { min: 27000, max: 57000, median: 42000 },
      "Normandie": { min: 26000, max: 55000, median: 41000 },
      "Grand Est": { min: 28000, max: 59000, median: 44000 },
      "Auvergne-Rhône-Alpes": { min: 32000, max: 67000, median: 50000 }
    },
    "H1201": { // Commercial
      "Île-de-France": { min: 35000, max: 85000, median: 60000 },
      "Rhône-Alpes": { min: 30000, max: 75000, median: 53000 },
      "Occitanie": { min: 25000, max: 70000, median: 47000 },
      "Provence-Alpes-Côte d'Azur": { min: 27000, max: 72000, median: 50000 },
      "Hauts-de-France": { min: 23000, max: 65000, median: 44000 },
      "Nouvelle-Aquitaine": { min: 24000, max: 67000, median: 46000 },
      "Pays de la Loire": { min: 25000, max: 68000, median: 47000 },
      "Bretagne": { min: 26000, max: 70000, median: 48000 },
      "Centre-Val de Loire": { min: 23000, max: 63000, median: 43000 },
      "Bourgogne-Franche-Comté": { min: 22000, max: 62000, median: 42000 },
      "Normandie": { min: 21000, max: 60000, median: 41000 },
      "Grand Est": { min: 23000, max: 64000, median: 44000 },
      "Auvergne-Rhône-Alpes": { min: 27000, max: 72000, median: 50000 }
    }
  },

  // Tendances de marché par métier
  trends: {
    "M1805": {
      demand: "Très élevée",
      growth_rate: "+15%",
      shortage_level: "Élevé",
      remote_friendly: true,
      key_skills_demand: ["React", "Node.js", "Python", "DevOps"],
      emerging_skills: ["AI/ML", "Cloud", "Cybersecurity", "Blockchain"]
    },
    "M1806": {
      demand: "Élevée",
      growth_rate: "+12%",
      shortage_level: "Moyen",
      remote_friendly: true,
      key_skills_demand: ["SQL", "NoSQL", "Cloud", "Big Data"],
      emerging_skills: ["Data Engineering", "MLOps", "GraphQL", "Edge Computing"]
    },
    "P1101": {
      demand: "Très élevée",
      growth_rate: "+18%",
      shortage_level: "Élevé",
      remote_friendly: true,
      key_skills_demand: ["Agile", "Scrum", "Leadership", "Communication"],
      emerging_skills: ["Product Management", "Data-Driven", "Remote Management", "AI Integration"]
    },
    "R1101": {
      demand: "Très élevée",
      growth_rate: "+20%",
      shortage_level: "Moyen",
      remote_friendly: true,
      key_skills_demand: ["SEO", "Google Ads", "Analytics", "Social Media"],
      emerging_skills: ["AI Marketing", "Automation", "Video Marketing", "Personalization"]
    },
    "H1201": {
      demand: "Élevée",
      growth_rate: "+8%",
      shortage_level: "Faible",
      remote_friendly: false,
      key_skills_demand: ["CRM", "Negotiation", "Relationship Building", "Sales Strategy"],
      emerging_skills: ["Digital Sales", "Social Selling", "Data Analytics", "AI Sales Tools"]
    }
  },

  // Données géographiques
  regions: {
    "Île-de-France": {
      tech_hub: true,
      cost_of_living: "Très élevé",
      job_opportunities: "Très élevées",
      major_companies: ["Google", "Microsoft", "Amazon", "Meta", "Apple"],
      average_salary_multiplier: 1.3
    },
    "Rhône-Alpes": {
      tech_hub: true,
      cost_of_living: "Élevé",
      job_opportunities: "Élevées",
      major_companies: ["Capgemini", "Atos", "Orange", "Schneider Electric"],
      average_salary_multiplier: 1.1
    },
    "Occitanie": {
      tech_hub: true,
      cost_of_living: "Moyen",
      job_opportunities: "Moyennes",
      major_companies: ["Airbus", "Thales", "CNES", "Ubisoft"],
      average_salary_multiplier: 0.95
    },
    "Provence-Alpes-Côte d'Azur": {
      tech_hub: false,
      cost_of_living: "Élevé",
      job_opportunities: "Moyennes",
      major_companies: ["STMicroelectronics", "Amadeus", "Sopra Steria"],
      average_salary_multiplier: 1.0
    },
    "Hauts-de-France": {
      tech_hub: false,
      cost_of_living: "Faible",
      job_opportunities: "Faibles",
      major_companies: ["Decathlon", "Auchan", "Leroy Merlin"],
      average_salary_multiplier: 0.85
    },
    "Nouvelle-Aquitaine": {
      tech_hub: false,
      cost_of_living: "Moyen",
      job_opportunities: "Moyennes",
      major_companies: ["Dassault", "Thales", "Cdiscount"],
      average_salary_multiplier: 0.9
    },
    "Pays de la Loire": {
      tech_hub: false,
      cost_of_living: "Moyen",
      job_opportunities: "Moyennes",
      major_companies: ["LVMH", "Valeo", "Schneider Electric"],
      average_salary_multiplier: 0.9
    },
    "Bretagne": {
      tech_hub: false,
      cost_of_living: "Moyen",
      job_opportunities: "Moyennes",
      major_companies: ["Orange", "Capgemini", "Dassault Systèmes"],
      average_salary_multiplier: 0.95
    }
  }
};

// Fonction pour obtenir le salaire par métier et région
export function getSalary(romeCode, region) {
  const salaries = marketData.salaries[romeCode];
  if (!salaries || !salaries[region]) {
    return null;
  }
  return salaries[region];
}

// Fonction pour obtenir les tendances d'un métier
export function getTrends(romeCode) {
  return marketData.trends[romeCode] || null;
}

// Fonction pour obtenir les données d'une région
export function getRegionData(region) {
  return marketData.regions[region] || null;
}

// Fonction pour obtenir les métiers les plus demandés
export function getMostDemandedJobs() {
  return Object.entries(marketData.trends)
    .map(([code, trend]) => ({
      code,
      demand: trend.demand,
      growth_rate: trend.growth_rate,
      shortage_level: trend.shortage_level
    }))
    .sort((a, b) => {
      const demandOrder = { "Très élevée": 3, "Élevée": 2, "Moyenne": 1, "Faible": 0 };
      return demandOrder[b.demand] - demandOrder[a.demand];
    });
}

// Fonction pour obtenir les compétences émergentes
export function getEmergingSkills(romeCode) {
  const trends = marketData.trends[romeCode];
  return trends ? trends.emerging_skills : [];
}

// Fonction pour obtenir les compétences clés en demande
export function getKeySkillsInDemand(romeCode) {
  const trends = marketData.trends[romeCode];
  return trends ? trends.key_skills_demand : [];
} 