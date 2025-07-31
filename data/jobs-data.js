// Données des offres d'emploi (1000 jobs pour test de performance)
export const allJobs = [];

// Fonction pour générer des jobs uniques
function generateUniqueJobs(count) {
  const companies = [
    'TechCorp', 'InnovateSoft', 'DataFlow', 'CloudTech', 'WebSolutions', 
    'ProductHub', 'BackendPro', 'DesignStudio', 'MobileApp', 'GameStudio', 
    'AI Solutions', 'BlockchainTech', 'CyberSec', 'NetworkPro', 'IoT Solutions', 
    'BigData Corp', 'StartupXYZ', 'EnterpriseTech', 'DigitalAgency', 'FinTechPro'
  ];
  
  const titles = [
    'Développeur Full Stack', 'Ingénieur DevOps', 'Data Scientist', 'Architecte Cloud', 
    'Développeur Frontend', 'Product Manager', 'Développeur Backend', 'UX/UI Designer', 
    'Développeur Mobile', 'Chef de Projet IT', 'Analyste Cybersécurité', 'Développeur Blockchain', 
    'Ingénieur Réseau', 'Développeur Game', 'Data Engineer', 'Machine Learning Engineer',
    'Cloud Security Engineer', 'DevOps Architect', 'Frontend Lead', 'Backend Developer'
  ];
  
  const locations = [
    'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nantes', 'Bordeaux', 'Strasbourg', 
    'Angers', 'Rennes', 'Lille', 'Nice', 'Montpellier', 'Grenoble', 'Dijon', 'Tours'
  ];
  
  const skills = [
    'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Python', 
    'Machine Learning', 'SQL', 'TensorFlow', 'Java', 'Spring Boot', 'Redis', 
    'TypeScript', 'CSS', 'Vue.js', 'Angular', 'MongoDB', 'GraphQL', 'Jenkins'
  ];
  
  const sources = ['LinkedIn', 'Indeed', 'Glassdoor', 'Apec', 'Welcome to the Jungle'];
  
  const usedCombinations = new Set();
  
  for (let i = 1; i <= count; i++) {
    let job;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      const title = titles[Math.floor(Math.random() * titles.length)];
      const company = companies[Math.floor(Math.random() * companies.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      // Créer une clé unique pour éviter les doublons
      const combination = `${title}-${company}-${location}`;
      
      if (!usedCombinations.has(combination) || attempts >= maxAttempts) {
        usedCombinations.add(combination);
        
        job = {
          id: i,
          title: title,
          company: company,
          location: location,
          type: Math.random() > 0.5 ? 'CDI' : 'Freelance',
          salary: `${40 + Math.floor(Math.random() * 30)}k-${60 + Math.floor(Math.random() * 40)}k€`,
          description: `Nous recherchons un ${title.toLowerCase()} expérimenté pour rejoindre notre équipe ${company}.`,
          skills: skills.slice(0, Math.floor(Math.random() * 4) + 2).sort(() => Math.random() - 0.5),
          postedDate: '2024-01-15',
          remote: Math.random() > 0.5,
          source: sources[Math.floor(Math.random() * sources.length)]
        };
        break;
      }
      attempts++;
    } while (attempts < maxAttempts);
    
    if (job) {
      allJobs.push(job);
    }
  }
}

// Générer 1000 jobs uniques
generateUniqueJobs(1000);

// Ajouter quelques jobs spécifiques au début pour les tests
const specificJobs = [
  {
    id: 1001,
    title: "Développeur Full Stack",
    company: "TechCorp",
    location: "Paris",
    type: "CDI",
    salary: "45k-65k€",
    description: "Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe...",
    skills: ["React", "Node.js", "PostgreSQL", "AWS"],
    postedDate: "2024-01-15",
    remote: true,
    source: "LinkedIn"
  },
  {
    id: 1002,
    title: "Ingénieur DevOps",
    company: "InnovateSoft",
    location: "Lyon",
    type: "CDI",
    salary: "50k-70k€",
    description: "Rejoignez notre équipe DevOps pour optimiser nos infrastructures cloud...",
    skills: ["Docker", "Kubernetes", "AWS", "Terraform"],
    postedDate: "2024-01-14",
    remote: false,
    source: "Indeed"
  }
];

// Ajouter les jobs spécifiques au début
allJobs.unshift(...specificJobs);

// Fonction pour vérifier et supprimer les doublons
function removeDuplicates(jobs) {
  const seen = new Set();
  const uniqueJobs = [];
  
  for (const job of jobs) {
    const key = `${job.title}-${job.company}-${job.location}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueJobs.push(job);
    }
  }
  
  return uniqueJobs;
}

// Supprimer les doublons et réassigner les IDs
const uniqueJobs = removeDuplicates(allJobs);
allJobs.length = 0;
allJobs.push(...uniqueJobs.map((job, index) => ({ ...job, id: index + 1 })));

console.log(`✅ ${allJobs.length} jobs uniques chargés pour les tests de performance`);
console.log(`🔍 Doublons supprimés: ${uniqueJobs.length} jobs uniques sur ${allJobs.length} total`); 