// Bibliothèque de compétences pour l'extraction des offres d'emploi
const skillsLibrary = {
  // Technologies et langages de programmation
  programming: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    'HTML', 'CSS', 'SCSS', 'SASS', 'Less', 'XML', 'JSON', 'YAML', 'Markdown',
    'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Oracle', 'SQL Server', 'Redis', 'Elasticsearch'
  ],

  // Frameworks et bibliothèques
  frameworks: [
    'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Symfony',
    'Bootstrap', 'Tailwind CSS', 'Material-UI', 'Ant Design', 'jQuery', 'Lodash', 'Moment.js',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Heroku', 'Vercel', 'Netlify'
  ],

  // Outils de développement
  devTools: [
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jenkins', 'Travis CI', 'CircleCI', 'GitHub Actions',
    'Webpack', 'Vite', 'Parcel', 'Babel', 'ESLint', 'Prettier', 'Jest', 'Mocha', 'Cypress', 'Selenium',
    'VS Code', 'IntelliJ', 'Eclipse', 'Vim', 'Emacs', 'Postman', 'Insomnia'
  ],

  // Méthodologies et pratiques
  methodologies: [
    'Agile', 'Scrum', 'Kanban', 'DevOps', 'CI/CD', 'TDD', 'BDD', 'DDD', 'Microservices',
    'REST API', 'GraphQL', 'SOAP', 'WebSocket', 'gRPC', 'OAuth', 'JWT'
  ],

  // Compétences métier
  business: [
    'Gestion de projet', 'Project Management', 'Business Analysis', 'Analyse fonctionnelle',
    'Gestion d\'équipe', 'Team Management', 'Leadership', 'Communication', 'Négociation',
    'Vente', 'Sales', 'Marketing', 'Digital Marketing', 'SEO', 'SEM', 'Content Marketing',
    'Comptabilité', 'Accounting', 'Finance', 'Contrôle de gestion', 'Audit', 'Compliance',
    'Expert', 'Specialist', 'Spécialiste',
    'Superviseur', 'Supervisor', 'Consultant', 'Conseiller', 'Advisor', 'Analyste', 'Analyst'
  ],

  // Compétences RH
  hr: [
    'Recrutement', 'Recruitment', 'Gestion RH', 'HR Management', 'Formation', 'Training',
    'Évaluation', 'Assessment', 'Onboarding', 'Talent Management', 'Diversity & Inclusion'
  ],

  // Compétences logistiques
  logistics: [
    'Supply Chain', 'Logistique', 'Transport', 'Warehouse Management', 'Inventory Management',
    'Procurement', 'Achats', 'Import/Export', 'Customs', 'Freight Forwarding'
  ],

  // Compétences santé
  health: [
    'Soins infirmiers', 'Nursing', 'Médecine', 'Medicine', 'Pharmacie', 'Pharmacy',
    'Kinésithérapie', 'Physiotherapy', 'Psychologie', 'Psychology', 'Nutrition'
  ],

  // Compétences éducation
  education: [
    'Enseignement', 'Teaching', 'Formation', 'Training', 'Pédagogie', 'Pedagogy',
    'Éducation spécialisée', 'Special Education', 'Animation', 'Animation'
  ],

  // Compétences juridiques
  legal: [
    'Droit', 'Law', 'Juridique', 'Legal', 'Contrat', 'Contract', 'Litigation',
    'Compliance', 'RGPD', 'GDPR', 'Intellectual Property', 'Propriété intellectuelle',
    'Juriste', 'Lawyer', 'Avocat', 'Attorney', 'Notaire', 'Notary', 'Huissier', 'Bailiff',
    'Greffier', 'Clerk', 'Conseiller juridique', 'Legal Advisor', 'Conseiller fiscal',
    'Tax Advisor', 'Commissaire aux comptes', 'Auditor', 'Expert-comptable', 'Accountant'
  ],

  // Compétences créatives
  creative: [
    'Design', 'Graphic Design', 'UI/UX', 'Web Design', 'Illustration', 'Photography',
    'Vidéo', 'Video', 'Motion Design', '3D', 'Animation', 'Branding'
  ],

  // Compétences techniques spécialisées
  technical: [
    'SAP', 'Salesforce', 'Microsoft Dynamics', 'Oracle', 'IBM', 'Adobe', 'Autodesk',
    'Machine Learning', 'AI', 'Data Science', 'Big Data', 'Analytics', 'BI',
    'Cybersecurity', 'Sécurité informatique', 'Network', 'Réseau', 'Infrastructure',
    'Cloud Computing', 'Virtualization', 'Virtualisation', 'Linux', 'Windows Server',
    'Calcul', 'Tuyauterie', 'Piping', 'Flexibility',
    'Fléxibilité', 'Structure', 'Mécanique', 'Mechanical', 'Électrique', 'Electrical',
    'Automatisme', 'Automation', 'Instrumentation', 'Procédé', 'Process', 'Chimie',
    'Chemistry', 'Thermodynamique', 'Thermodynamics', 'Fluidique', 'Fluid Dynamics',
    'CAO', 'CAD', 'DAO', 'CFD', 'FEM', 'Finite Element', 'Éléments finis'
  ],

  // Compétences sectorielles
  sectorial: [
    'Bancaire', 'Banking', 'Assurance', 'Insurance', 'Retail', 'Commerce', 'E-commerce',
    'Industrie', 'Industry', 'Manufacturing', 'Automotive', 'Automobile', 'Aéronautique',
    'Aeronautics', 'Spatial', 'Space', 'Défense', 'Defense', 'Télécom', 'Telecom'
  ],

  // Compétences transversales
  softSkills: [
    'Communication', 'Teamwork', 'Collaboration', 'Problem Solving', 'Résolution de problèmes',
    'Adaptability', 'Adaptabilité', 'Creativity', 'Créativité', 'Critical Thinking',
    'Esprit critique', 'Time Management', 'Gestion du temps', 'Stress Management',
    'Gestion du stress', 'Customer Service', 'Service client', 'Presentation', 'Présentation'
  ],

  // Langues
  languages: [
    'Français', 'French', 'Anglais', 'English', 'Espagnol', 'Spanish', 'Allemand', 'German',
    'Italien', 'Italian', 'Portugais', 'Portuguese', 'Chinois', 'Chinese', 'Japonais', 'Japanese',
    'Arabe', 'Arabic', 'Russe', 'Russian'
  ],

  // Certifications
  certifications: [
    'PMP', 'PRINCE2', 'ITIL', 'CISSP', 'CISM', 'CEH', 'AWS Certified', 'Azure Certified',
    'Google Cloud Certified', 'Oracle Certified', 'Microsoft Certified', 'Cisco Certified',
    'SAP Certified', 'Salesforce Certified', 'Scrum Master', 'Product Owner'
  ]
};

// Fonction pour extraire les compétences d'un texte
function extractSkillsFromText(text) {
  const foundSkills = [];
  const lowerText = text.toLowerCase();
  
  // Parcourir toutes les catégories de compétences
  for (const [category, skills] of Object.entries(skillsLibrary)) {
    for (const skill of skills) {
      const lowerSkill = skill.toLowerCase();
      
      // Chercher la compétence dans le texte (avec variations)
      if (lowerText.includes(lowerSkill) || 
          lowerText.includes(lowerSkill.replace(/\s+/g, '')) ||
          lowerText.includes(lowerSkill.replace(/\s+/g, '-')) ||
          lowerText.includes(lowerSkill.replace(/\s+/g, '_'))) {
        
        // Éviter les doublons
        if (!foundSkills.includes(skill)) {
          foundSkills.push(skill);
        }
      }
    }
  }
  
  return foundSkills;
}

// Fonction pour normaliser les compétences (regrouper les variations)
function normalizeSkills(skills) {
  const normalized = [];
  const skillMap = {
    'js': 'JavaScript',
    'react.js': 'React',
    'vue.js': 'Vue.js',
    'angular.js': 'Angular',
    'node.js': 'Node.js',
    'express.js': 'Express',
    'django': 'Django',
    'flask': 'Flask',
    'spring': 'Spring',
    'laravel': 'Laravel',
    'symfony': 'Symfony',
    'bootstrap': 'Bootstrap',
    'tailwind': 'Tailwind CSS',
    'material-ui': 'Material-UI',
    'ant design': 'Ant Design',
    'jquery': 'jQuery',
    'lodash': 'Lodash',
    'moment.js': 'Moment.js',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'aws': 'AWS',
    'azure': 'Azure',
    'gcp': 'GCP',
    'heroku': 'Heroku',
    'vercel': 'Vercel',
    'netlify': 'Netlify',
    'git': 'Git',
    'github': 'GitHub',
    'gitlab': 'GitLab',
    'bitbucket': 'Bitbucket',
    'jenkins': 'Jenkins',
    'webpack': 'Webpack',
    'vite': 'Vite',
    'parcel': 'Parcel',
    'babel': 'Babel',
    'eslint': 'ESLint',
    'prettier': 'Prettier',
    'jest': 'Jest',
    'mocha': 'Mocha',
    'cypress': 'Cypress',
    'selenium': 'Selenium',
    'agile': 'Agile',
    'scrum': 'Scrum',
    'kanban': 'Kanban',
    'devops': 'DevOps',
    'ci/cd': 'CI/CD',
    'tdd': 'TDD',
    'bdd': 'BDD',
    'ddd': 'DDD',
    'microservices': 'Microservices',
    'rest': 'REST API',
    'graphql': 'GraphQL',
    'soap': 'SOAP',
    'websocket': 'WebSocket',
    'grpc': 'gRPC',
    'oauth': 'OAuth',
    'jwt': 'JWT',
    'sap': 'SAP',
    'salesforce': 'Salesforce',
    'machine learning': 'Machine Learning',
    'ai': 'AI',
    'data science': 'Data Science',
    'big data': 'Big Data',
    'analytics': 'Analytics',
    'bi': 'BI',
    'cybersecurity': 'Cybersecurity',
    'cloud computing': 'Cloud Computing',
    'linux': 'Linux',
    'windows server': 'Windows Server'
  };
  
  for (const skill of skills) {
    const lowerSkill = skill.toLowerCase();
    const normalizedSkill = skillMap[lowerSkill] || skill;
    if (!normalized.includes(normalizedSkill)) {
      normalized.push(normalizedSkill);
    }
  }
  
  return normalized;
}

module.exports = {
  skillsLibrary,
  extractSkillsFromText,
  normalizeSkills
}; 