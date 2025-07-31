/**
 * Bibliothèque complète de métiers français et anglais
 * Utilisée pour l'extraction automatique des titres de postes
 */

const jobTitles = {
  // MÉTIERS DE LA SANTÉ
  health: [
    'Médecin', 'medecin', 'Doctor', 'Infirmier', 'Infirmière', 'Nurse', 'Pharmacien', 'Pharmacist',
    'Kinésithérapeute', 'Physiotherapist', 'Dentiste', 'Dentist', 'Vétérinaire', 'Veterinarian',
    'Sage-femme', 'Midwife', 'Psychologue', 'Psychologist', 'Psychiatre', 'Psychiatrist',
    'Orthophoniste', 'Speech Therapist', 'Opticien', 'Optician', 'Podologue', 'Podiatrist',
    'Radiologue', 'Radiologist', 'Cardiologue', 'Cardiologist', 'Dermatologue', 'Dermatologist',
    'Gynécologue', 'Gynecologist', 'Pédiatre', 'Pediatrician', 'Généraliste', 'General Practitioner',
    'Chirurgien', 'Surgeon', 'Anesthésiste', 'Anesthesiologist', 'Biologiste', 'Biologist',
    'Technicien de laboratoire', 'Lab Technician', 'Aide-soignant', 'Care Assistant'
  ],

  // MÉTIERS DE L'INGÉNIERIE ET TECHNIQUE
  engineering: [
    'Ingénieur', 'Engineer', 'Architecte', 'Architect', 'Développeur', 'Developer',
    'Chef de projet', 'Project Manager', 'Analyste', 'Analyst', 'Consultant', 'Consultant',
    'Expert', 'Expert', 'Spécialiste', 'Specialist', 'Technicien', 'Technician',
    'Ingénieur logiciel', 'Software Engineer', 'Ingénieur système', 'Systems Engineer',
    'Ingénieur réseau', 'Network Engineer', 'Ingénieur DevOps', 'DevOps Engineer',
    'Ingénieur data', 'Data Engineer', 'Ingénieur cloud', 'Cloud Engineer',
    'Ingénieur sécurité', 'Security Engineer', 'Ingénieur qualité', 'Quality Engineer',
    'Ingénieur mécanique', 'Mechanical Engineer', 'Ingénieur électrique', 'Electrical Engineer',
    'Ingénieur civil', 'Civil Engineer', 'Ingénieur industriel', 'Industrial Engineer'
  ],

  // MÉTIERS DE LA GESTION ET MANAGEMENT
  management: [
    'Manager', 'Directeur', 'Directrice', 'Director', 'Responsable', 'Manager',
    'Chef', 'Chief', 'Superviseur', 'Supervisor', 'Coordinateur', 'Coordinator',
    'Gestionnaire', 'Manager', 'Administrateur', 'Administrator', 'Lead', 'Lead',
    'Senior', 'Senior', 'Junior', 'Junior', 'Stagiaire', 'Intern',
    'Chef de service', 'Department Head', 'Chef d\'équipe', 'Team Leader',
    'Directeur commercial', 'Sales Director', 'Directeur marketing', 'Marketing Director',
    'Directeur financier', 'Financial Director', 'Directeur RH', 'HR Director',
    'Directeur technique', 'Technical Director', 'Directeur opérationnel', 'Operations Director'
  ],

  // MÉTIERS COMMERCIAUX
  sales: [
    'Commercial', 'Sales', 'Vendeur', 'Vendeuse', 'Salesperson', 'Représentant', 'Representative',
    'Chargé de clientèle', 'Account Manager', 'Business Developer', 'Business Developer',
    'Account Manager', 'Account Manager', 'Sales Manager', 'Sales Manager',
    'Commercial terrain', 'Field Sales', 'Commercial sédentaire', 'Inside Sales',
    'Chargé d\'affaires', 'Account Executive', 'Responsable commercial', 'Sales Manager',
    'Directeur commercial', 'Sales Director', 'Chef de secteur', 'Area Manager'
  ],

  // MÉTIERS ADMINISTRATIFS
  administrative: [
    'Assistant', 'Assistante', 'Assistant', 'Secrétaire', 'Secretary', 'Comptable', 'Accountant',
    'RH', 'Ressources Humaines', 'HR', 'Human Resources', 'Juriste', 'Lawyer',
    'Avocat', 'Avocate', 'Lawyer', 'Notaire', 'Notary', 'Expert-comptable', 'Chartered Accountant',
    'Assistant de direction', 'Executive Assistant', 'Assistant administratif', 'Administrative Assistant',
    'Gestionnaire de paie', 'Payroll Manager', 'Responsable RH', 'HR Manager',
    'Recruteur', 'Recruteuse', 'Recruiter', 'Chargé de recrutement', 'Recruitment Officer'
  ],

  // MÉTIERS CRÉATIFS ET COMMUNICATION
  creative: [
    'Designer', 'Graphiste', 'Graphic Designer', 'Photographe', 'Photographer',
    'Rédacteur', 'Rédactrice', 'Writer', 'Journaliste', 'Journalist', 'Traducteur', 'Translator',
    'Interprète', 'Interpreter', 'Artiste', 'Artist', 'Créateur', 'Créatrice', 'Creator',
    'Community Manager', 'Community Manager', 'Chargé de communication', 'Communication Officer',
    'Attaché de presse', 'Press Officer', 'Rédacteur web', 'Web Writer', 'SEO', 'SEO',
    'Marketing', 'Marketing', 'Chargé de marketing', 'Marketing Officer',
    'Vidéaste', 'Videographer', 'Motion Designer', 'Motion Designer', 'UI/UX Designer', 'UI/UX Designer'
  ],

  // MÉTIERS DE L'ÉDUCATION
  education: [
    'Professeur', 'Professor', 'Enseignant', 'enseignant', 'Teacher', 'Formateur', 'Trainer',
    'Éducateur', 'Educator', 'Animateur', 'Animator', 'Instructeur', 'Instructor',
    'Professeur des écoles', 'Primary School Teacher', 'Professeur de collège', 'Middle School Teacher',
    'Professeur de lycée', 'High School Teacher', 'Professeur d\'université', 'University Professor',
    'Formateur professionnel', 'Professional Trainer', 'Coach', 'Coach', 'Mentor', 'Mentor'
  ],

  // MÉTIERS DE LA LOGISTIQUE ET TRANSPORT
  logistics: [
    'Logisticien', 'Logistician', 'Transporteur', 'Carrier', 'Chauffeur', 'Driver',
    'Livreur', 'Delivery Driver', 'Magasinier', 'Warehouse Worker', 'Responsable logistique', 'Logistics Manager',
    'Chef d\'entrepôt', 'Warehouse Manager', 'Responsable transport', 'Transport Manager',
    'Planificateur logistique', 'Logistics Planner', 'Gestionnaire de flotte', 'Fleet Manager'
  ],

  // MÉTIERS DE LA RESTAURATION
  hospitality: [
    'Cuisinier', 'Cook', 'Serveur', 'Serveuse', 'Waiter', 'Waitress', 'Chef', 'Chef',
    'Sommelier', 'Sommelier', 'Barman', 'Bartender', 'Chef de cuisine', 'Head Chef',
    'Chef pâtissier', 'Pastry Chef', 'Chef de rang', 'Head Waiter', 'Maître d\'hôtel', 'Maitre d\'Hotel',
    'Responsable de restaurant', 'Restaurant Manager', 'Directeur d\'hôtel', 'Hotel Manager'
  ],

  // MÉTIERS DE LA SÉCURITÉ
  security: [
    'Agent de sécurité', 'Security Guard', 'Policier', 'Police Officer', 'Gendarme', 'Gendarme',
    'Garde', 'Guard', 'Surveillant', 'Supervisor', 'Responsable sécurité', 'Security Manager',
    'Chef de sécurité', 'Security Chief', 'Agent de protection', 'Protection Officer'
  ],

  // MÉTIERS DE L'IMMOBILIER
  realEstate: [
    'Agent immobilier', 'Real Estate Agent', 'Notaire', 'Notary', 'Expert immobilier', 'Real Estate Expert',
    'Gestionnaire immobilier', 'Property Manager', 'Responsable immobilier', 'Real Estate Manager',
    'Promoteur immobilier', 'Real Estate Developer', 'Syndic', 'Property Administrator'
  ],

  // MÉTIERS DE LA FINANCE
  finance: [
    'Analyste financier', 'Financial Analyst', 'Trader', 'Trader', 'Gestionnaire de portefeuille', 'Portfolio Manager',
    'Auditeur', 'Auditor', 'Comptable', 'Accountant', 'Expert-comptable', 'Chartered Accountant',
    'Contrôleur de gestion', 'Management Controller', 'Directeur financier', 'Financial Director',
    'Responsable trésorerie', 'Treasury Manager', 'Analyste crédit', 'Credit Analyst'
  ],

  // MÉTIERS DE LA RECHERCHE
  research: [
    'Chercheur', 'Researcher', 'Scientifique', 'Scientist', 'Docteur', 'Doctor',
    'Post-doctorant', 'Post-doctoral', 'Chercheur CNRS', 'CNRS Researcher',
    'Chercheur universitaire', 'University Researcher', 'Ingénieur de recherche', 'Research Engineer',
    'Technicien de recherche', 'Research Technician', 'Assistant de recherche', 'Research Assistant'
  ],

  // MÉTIERS DE L'ARTISANAT
  crafts: [
    'Artisan', 'Craftsman', 'Plombier', 'Plumber', 'Électricien', 'Electrician',
    'Menuisier', 'Carpenter', 'Maçon', 'Mason', 'Peintre', 'Painter',
    'Carreleur', 'Tiler', 'Charpentier', 'Carpenter', 'Serrurier', 'Locksmith',
    'Vitrier', 'Glazier', 'Chauffagiste', 'Heating Engineer'
  ],

  // MÉTIERS DE L'AGRICULTURE
  agriculture: [
    'Agriculteur', 'Farmer', 'Éleveur', 'Breeder', 'Vigneron', 'Winegrower',
    'Horticulteur', 'Horticulturist', 'Maraîcher', 'Market Gardener', 'Arboriculteur', 'Arboriculturist',
    'Responsable d\'exploitation', 'Farm Manager', 'Technicien agricole', 'Agricultural Technician'
  ],

  // MÉTIERS DE LA MODE
  fashion: [
    'Styliste', 'Stylist', 'Modéliste', 'Pattern Maker', 'Couturier', 'Couturière', 'Tailor',
    'Designer de mode', 'Fashion Designer', 'Responsable collection', 'Collection Manager',
    'Acheteur mode', 'Fashion Buyer', 'Merchandiser', 'Merchandiser'
  ],

  // MÉTIERS DU SPORT
  sports: [
    'Entraîneur', 'Coach', 'Moniteur', 'Instructor', 'Éducateur sportif', 'Sports Educator',
    'Professeur de sport', 'Sports Teacher', 'Responsable sportif', 'Sports Manager',
    'Directeur sportif', 'Sports Director', 'Préparateur physique', 'Physical Trainer'
  ],

  // MÉTIERS DE L'ENVIRONNEMENT
  environment: [
    'Écologue', 'Ecologist', 'Environnementaliste', 'Environmentalist', 'Géologue', 'Geologist',
    'Météorologue', 'Meteorologist', 'Responsable environnement', 'Environment Manager',
    'Ingénieur environnement', 'Environmental Engineer', 'Technicien environnement', 'Environmental Technician'
  ],

  // MÉTIERS DE LA COMMUNICATION
  communication: [
    'Chargé de communication', 'Communication Officer', 'Attaché de presse', 'Press Officer',
    'Responsable communication', 'Communication Manager', 'Directeur communication', 'Communication Director',
    'Chargé de relations publiques', 'Public Relations Officer', 'Responsable événementiel', 'Event Manager',
    'Social Media Manager', 'Social Media Manager', 'Content Manager', 'Content Manager'
  ],

  // MÉTIERS DE LA QUALITÉ
  quality: [
    'Responsable qualité', 'Quality Manager', 'Contrôleur qualité', 'Quality Controller',
    'Ingénieur qualité', 'Quality Engineer', 'Technicien qualité', 'Quality Technician',
    'Auditeur qualité', 'Quality Auditor', 'Chef de projet qualité', 'Quality Project Manager'
  ],

  // MÉTIERS DE LA MAINTENANCE
  maintenance: [
    'Technicien de maintenance', 'Maintenance Technician', 'Responsable maintenance', 'Maintenance Manager',
    'Chef d\'équipe maintenance', 'Maintenance Team Leader', 'Ingénieur maintenance', 'Maintenance Engineer',
    'Électricien de maintenance', 'Maintenance Electrician', 'Mécanicien', 'Mechanic'
  ],

  // MÉTIERS DE LA PRODUCTION
  production: [
    'Ouvrier de production', 'Production Worker', 'Responsable production', 'Production Manager',
    'Chef d\'équipe production', 'Production Team Leader', 'Technicien de production', 'Production Technician',
    'Opérateur de production', 'Production Operator', 'Conducteur de ligne', 'Line Operator'
  ],

  // MÉTIERS DE LA VENTE
  retail: [
    'Vendeur', 'Vendeuse', 'Salesperson', 'Responsable de magasin', 'Store Manager',
    'Chef de rayon', 'Department Manager', 'Vendeur spécialisé', 'Specialized Salesperson',
    'Conseiller de vente', 'Sales Advisor', 'Responsable commercial', 'Sales Manager'
  ],

  // MÉTIERS DE LA SANTÉ AU TRAVAIL
  occupationalHealth: [
    'Médecin du travail', 'Occupational Physician', 'Infirmier du travail', 'Occupational Nurse',
    'Responsable santé sécurité', 'Health and Safety Manager', 'Technicien HSE', 'HSE Technician',
    'Chargé de prévention', 'Prevention Officer', 'Responsable QHSE', 'QHSE Manager'
  ],

  // MÉTIERS DE LA FORMATION
  training: [
    'Formateur', 'Trainer', 'Responsable formation', 'Training Manager',
    'Chargé de formation', 'Training Officer', 'Directeur formation', 'Training Director',
    'Conseiller en formation', 'Training Advisor', 'Ingénieur formation', 'Training Engineer'
  ],

  // MÉTIERS DE LA RECHERCHE ET DÉVELOPPEMENT
  rnd: [
    'Ingénieur R&D', 'R&D Engineer', 'Chercheur R&D', 'R&D Researcher',
    'Responsable R&D', 'R&D Manager', 'Directeur R&D', 'R&D Director',
    'Technicien R&D', 'R&D Technician', 'Chef de projet R&D', 'R&D Project Manager'
  ],

  // MÉTIERS DE L'INFORMATIQUE
  it: [
    'Développeur', 'Developer', 'Programmeur', 'Programmer', 'Analyste programmeur', 'Programmer Analyst',
    'Architecte logiciel', 'Software Architect', 'Développeur full-stack', 'Full-stack Developer',
    'Développeur front-end', 'Front-end Developer', 'Développeur back-end', 'Back-end Developer',
    'Développeur mobile', 'Mobile Developer', 'DevOps', 'DevOps', 'Data Scientist', 'Data Scientist',
    'Ingénieur data', 'Data Engineer', 'Analyste data', 'Data Analyst', 'Machine Learning Engineer', 'Machine Learning Engineer'
  ],

  // MÉTIERS DE LA GESTION DE PROJET
  projectManagement: [
    'Chef de projet', 'Project Manager', 'Chef de projet informatique', 'IT Project Manager',
    'Chef de projet digital', 'Digital Project Manager', 'Scrum Master', 'Scrum Master',
    'Product Owner', 'Product Owner', 'Responsable de programme', 'Program Manager',
    'Directeur de projet', 'Project Director', 'Gestionnaire de projet', 'Project Coordinator'
  ],

  // MÉTIERS DU MARKETING
  marketing: [
    'Chargé de marketing', 'Marketing Officer', 'Responsable marketing', 'Marketing Manager',
    'Directeur marketing', 'Marketing Director', 'Chef de produit', 'Product Manager',
    'Chargé de communication marketing', 'Marketing Communication Officer', 'Digital Marketing Manager', 'Digital Marketing Manager',
    'SEO Manager', 'SEO Manager', 'SEM Manager', 'SEM Manager', 'Social Media Manager', 'Social Media Manager',
    'Content Marketing Manager', 'Content Marketing Manager', 'Brand Manager', 'Brand Manager'
  ],

  // MÉTIERS DE LA VENTE ET COMMERCIAL
  salesMarketing: [
    'Commercial', 'Salesperson', 'Chargé d\'affaires', 'Account Executive',
    'Business Developer', 'Business Developer', 'Account Manager', 'Account Manager',
    'Responsable commercial', 'Sales Manager', 'Directeur commercial', 'Sales Director',
    'Chargé de clientèle', 'Account Manager', 'Commercial terrain', 'Field Sales',
    'Commercial sédentaire', 'Inside Sales', 'Télévendeur', 'Telemarketer'
  ],

  // MÉTIERS DES RESSOURCES HUMAINES
  hr: [
    'Chargé de recrutement', 'Recruitment Officer', 'Responsable RH', 'HR Manager',
    'Directeur RH', 'HR Director', 'Gestionnaire de paie', 'Payroll Manager',
    'Chargé de formation', 'Training Officer', 'Responsable formation', 'Training Manager',
    'Chargé de développement RH', 'HR Development Officer', 'Responsable rémunération', 'Compensation Manager',
    'Chargé de communication interne', 'Internal Communication Officer', 'Responsable bien-être', 'Wellness Manager'
  ],

  // MÉTIERS DE LA FINANCE ET COMPTABILITÉ
  financeAccounting: [
    'Comptable', 'Accountant', 'Expert-comptable', 'Chartered Accountant',
    'Contrôleur de gestion', 'Management Controller', 'Directeur financier', 'Financial Director',
    'Responsable trésorerie', 'Treasury Manager', 'Analyste financier', 'Financial Analyst',
    'Auditeur', 'Auditor', 'Trésorier', 'Treasurer', 'Gestionnaire de portefeuille', 'Portfolio Manager',
    'Trader', 'Trader', 'Analyste crédit', 'Credit Analyst', 'Responsable comptable', 'Accounting Manager'
  ],

  // MÉTIERS JURIDIQUES
  legal: [
    'Juriste', 'Lawyer', 'Avocat', 'Avocate', 'Lawyer', 'Notaire', 'Notary',
    'Huissier', 'Bailiff', 'Greffier', 'Clerk', 'Responsable juridique', 'Legal Manager',
    'Directeur juridique', 'Legal Director', 'Conseiller juridique', 'Legal Advisor',
    'Chargé d\'affaires juridiques', 'Legal Affairs Officer', 'Responsable conformité', 'Compliance Manager'
  ],

  // MÉTIERS DE LA LOGISTIQUE ET SUPPLY CHAIN
  logisticsSupplyChain: [
    'Logisticien', 'Logistician', 'Responsable logistique', 'Logistics Manager',
    'Directeur logistique', 'Logistics Director', 'Chef d\'entrepôt', 'Warehouse Manager',
    'Responsable transport', 'Transport Manager', 'Planificateur logistique', 'Logistics Planner',
    'Gestionnaire de flotte', 'Fleet Manager', 'Responsable supply chain', 'Supply Chain Manager',
    'Chargé d\'approvisionnement', 'Procurement Officer', 'Responsable achats', 'Purchasing Manager'
  ],

  // MÉTIERS DE LA QUALITÉ ET SÉCURITÉ
  qualitySafety: [
    'Responsable qualité', 'Quality Manager', 'Contrôleur qualité', 'Quality Controller',
    'Ingénieur qualité', 'Quality Engineer', 'Responsable QHSE', 'QHSE Manager',
    'Responsable sécurité', 'Safety Manager', 'Chargé de prévention', 'Prevention Officer',
    'Technicien HSE', 'HSE Technician', 'Auditeur qualité', 'Quality Auditor',
    'Responsable environnement', 'Environment Manager', 'Chargé de sécurité', 'Safety Officer'
  ],

  // MÉTIERS DE LA MAINTENANCE ET TECHNICIENS
  maintenanceTechnicians: [
    'Technicien de maintenance', 'Maintenance Technician', 'Responsable maintenance', 'Maintenance Manager',
    'Chef d\'équipe maintenance', 'Maintenance Team Leader', 'Ingénieur maintenance', 'Maintenance Engineer',
    'Électricien de maintenance', 'Maintenance Electrician', 'Mécanicien', 'Mechanic',
    'Technicien électronique', 'Electronics Technician', 'Technicien informatique', 'IT Technician',
    'Technicien télécom', 'Telecom Technician', 'Technicien réseau', 'Network Technician'
  ],

  // MÉTIERS DE LA PRODUCTION ET INDUSTRIE
  productionIndustry: [
    'Ouvrier de production', 'Production Worker', 'Responsable production', 'Production Manager',
    'Chef d\'équipe production', 'Production Team Leader', 'Technicien de production', 'Production Technician',
    'Opérateur de production', 'Production Operator', 'Conducteur de ligne', 'Line Operator',
    'Responsable d\'atelier', 'Workshop Manager', 'Chef d\'équipe atelier', 'Workshop Team Leader',
    'Technicien méthodes', 'Methods Technician', 'Responsable industriel', 'Industrial Manager'
  ],

  // MÉTIERS DE LA VENTE ET COMMERCE
  salesRetail: [
    'Vendeur', 'Vendeuse', 'Salesperson', 'Responsable de magasin', 'Store Manager',
    'Chef de rayon', 'Department Manager', 'Vendeur spécialisé', 'Specialized Salesperson',
    'Conseiller de vente', 'Sales Advisor', 'Responsable commercial', 'Sales Manager',
    'Directeur commercial', 'Sales Director', 'Chargé de clientèle', 'Account Manager',
    'Commercial terrain', 'Field Sales', 'Commercial sédentaire', 'Inside Sales',
    'Télévendeur', 'Telemarketer', 'Responsable e-commerce', 'E-commerce Manager'
  ],

  // MÉTIERS DE LA COMMUNICATION ET MÉDIAS
  communicationMedia: [
    'Chargé de communication', 'Communication Officer', 'Responsable communication', 'Communication Manager',
    'Directeur communication', 'Communication Director', 'Attaché de presse', 'Press Officer',
    'Chargé de relations publiques', 'Public Relations Officer', 'Responsable événementiel', 'Event Manager',
    'Social Media Manager', 'Social Media Manager', 'Content Manager', 'Content Manager',
    'Community Manager', 'Community Manager', 'Rédacteur web', 'Web Writer',
    'Journaliste', 'Journalist', 'Photographe', 'Photographer', 'Vidéaste', 'Videographer'
  ],

  // MÉTIERS DE LA FORMATION ET ÉDUCATION
  trainingEducation: [
    'Formateur', 'Trainer', 'Responsable formation', 'Training Manager',
    'Directeur formation', 'Training Director', 'Chargé de formation', 'Training Officer',
    'Conseiller en formation', 'Training Advisor', 'Ingénieur formation', 'Training Engineer',
    'Professeur', 'Professor', 'Enseignant', 'Teacher', 'Instructeur', 'Instructor',
    'Coach', 'Coach', 'Mentor', 'Mentor', 'Animateur', 'Animator'
  ],

  // MÉTIERS DE LA RECHERCHE ET DÉVELOPPEMENT
  researchDevelopment: [
    'Chercheur', 'Researcher', 'Ingénieur R&D', 'R&D Engineer', 'Responsable R&D', 'R&D Manager',
    'Directeur R&D', 'R&D Director', 'Technicien R&D', 'R&D Technician',
    'Chef de projet R&D', 'R&D Project Manager', 'Scientifique', 'Scientist',
    'Docteur', 'Doctor', 'Post-doctorant', 'Post-doctoral', 'Chercheur CNRS', 'CNRS Researcher'
  ],

  // MÉTIERS DE L'INFORMATIQUE ET DIGITAL
  itDigital: [
    'Développeur', 'Developer', 'Programmeur', 'Programmer', 'Architecte logiciel', 'Software Architect',
    'Développeur full-stack', 'Full-stack Developer', 'Développeur front-end', 'Front-end Developer',
    'Développeur back-end', 'Back-end Developer', 'Développeur mobile', 'Mobile Developer',
    'DevOps', 'DevOps', 'Data Scientist', 'Data Scientist', 'Ingénieur data', 'Data Engineer',
    'Analyste data', 'Data Analyst', 'Machine Learning Engineer', 'Machine Learning Engineer',
    'Ingénieur cloud', 'Cloud Engineer', 'Ingénieur sécurité', 'Security Engineer',
    'Responsable informatique', 'IT Manager', 'Directeur informatique', 'IT Director'
  ],

  // MÉTIERS DE LA GESTION DE PROJET
  projectManagement: [
    'Chef de projet', 'Project Manager', 'Chef de projet informatique', 'IT Project Manager',
    'Chef de projet digital', 'Digital Project Manager', 'Scrum Master', 'Scrum Master',
    'Product Owner', 'Product Owner', 'Responsable de programme', 'Program Manager',
    'Directeur de projet', 'Project Director', 'Gestionnaire de projet', 'Project Coordinator',
    'Chef de projet construction', 'Construction Project Manager', 'Chef de projet marketing', 'Marketing Project Manager'
  ],

  // MÉTIERS DU MARKETING ET PUBLICITÉ
  marketingAdvertising: [
    'Chargé de marketing', 'Marketing Officer', 'Responsable marketing', 'Marketing Manager',
    'Directeur marketing', 'Marketing Director', 'Chef de produit', 'Product Manager',
    'Digital Marketing Manager', 'Digital Marketing Manager', 'SEO Manager', 'SEO Manager',
    'SEM Manager', 'SEM Manager', 'Social Media Manager', 'Social Media Manager',
    'Content Marketing Manager', 'Content Marketing Manager', 'Brand Manager', 'Brand Manager',
    'Chargé de communication marketing', 'Marketing Communication Officer', 'Responsable publicité', 'Advertising Manager'
  ],

  // MÉTIERS DE LA SANTÉ ET BIEN-ÊTRE
  healthWellness: [
    'Médecin', 'medecin', 'Doctor', 'Infirmier', 'Infirmière', 'Nurse', 'Pharmacien', 'Pharmacist',
    'Kinésithérapeute', 'Physiotherapist', 'Psychologue', 'Psychologist', 'Psychiatre', 'Psychiatrist',
    'Sage-femme', 'Midwife', 'Dentiste', 'Dentist', 'Vétérinaire', 'Veterinarian',
    'Médecin du travail', 'Occupational Physician', 'Infirmier du travail', 'Occupational Nurse',
    'Responsable santé sécurité', 'Health and Safety Manager', 'Responsable bien-être', 'Wellness Manager',
    'Coach bien-être', 'Wellness Coach', 'Nutritionniste', 'Nutritionist', 'Diététicien', 'Dietitian'
  ],

  // MÉTIERS DE L'ARTISANAT ET SERVICES
  craftsServices: [
    'Artisan', 'Craftsman', 'Plombier', 'Plumber', 'Électricien', 'Electrician',
    'Menuisier', 'Carpenter', 'Maçon', 'Mason', 'Peintre', 'Painter',
    'Carreleur', 'Tiler', 'Charpentier', 'Carpenter', 'Serrurier', 'Locksmith',
    'Vitrier', 'Glazier', 'Chauffagiste', 'Heating Engineer', 'Cuisinier', 'Cook',
    'Serveur', 'Serveuse', 'Waiter', 'Waitress', 'Chef', 'Chef', 'Sommelier', 'Sommelier'
  ],

  // MÉTIERS DE L'AGRICULTURE ET ENVIRONNEMENT
  agricultureEnvironment: [
    'Agriculteur', 'Farmer', 'Éleveur', 'Breeder', 'Vigneron', 'Winegrower',
    'Horticulteur', 'Horticulturist', 'Maraîcher', 'Market Gardener', 'Arboriculteur', 'Arboriculturist',
    'Responsable d\'exploitation', 'Farm Manager', 'Technicien agricole', 'Agricultural Technician',
    'Écologue', 'Ecologist', 'Environnementaliste', 'Environmentalist', 'Géologue', 'Geologist',
    'Responsable environnement', 'Environment Manager', 'Ingénieur environnement', 'Environmental Engineer'
  ],

  // MÉTIERS DE LA MODE ET LUXE
  fashionLuxury: [
    'Styliste', 'Stylist', 'Modéliste', 'Pattern Maker', 'Couturier', 'Couturière', 'Tailor',
    'Designer de mode', 'Fashion Designer', 'Responsable collection', 'Collection Manager',
    'Acheteur mode', 'Fashion Buyer', 'Merchandiser', 'Merchandiser', 'Responsable produit', 'Product Manager',
    'Chef de produit mode', 'Fashion Product Manager', 'Responsable marque', 'Brand Manager'
  ],

  // MÉTIERS DU SPORT ET LOISIRS
  sportsLeisure: [
    'Entraîneur', 'Coach', 'Moniteur', 'Instructor', 'Éducateur sportif', 'Sports Educator',
    'Professeur de sport', 'Sports Teacher', 'Responsable sportif', 'Sports Manager',
    'Directeur sportif', 'Sports Director', 'Préparateur physique', 'Physical Trainer',
    'Responsable d\'activités', 'Activities Manager', 'Animateur sportif', 'Sports Animator',
    'Responsable de club', 'Club Manager', 'Directeur de centre sportif', 'Sports Center Director'
  ],

  // MÉTIERS DE LA SÉCURITÉ ET SURVEILLANCE
  securitySurveillance: [
    'Agent de sécurité', 'Security Guard', 'Policier', 'Police Officer', 'Gendarme', 'Gendarme',
    'Garde', 'Guard', 'Surveillant', 'Supervisor', 'Responsable sécurité', 'Security Manager',
    'Chef de sécurité', 'Security Chief', 'Agent de protection', 'Protection Officer',
    'Responsable sûreté', 'Safety Manager', 'Technicien sécurité', 'Security Technician'
  ],

  // MÉTIERS DE L'IMMOBILIER ET CONSTRUCTION
  realEstateConstruction: [
    'Agent immobilier', 'Real Estate Agent', 'Notaire', 'Notary', 'Expert immobilier', 'Real Estate Expert',
    'Gestionnaire immobilier', 'Property Manager', 'Responsable immobilier', 'Real Estate Manager',
    'Promoteur immobilier', 'Real Estate Developer', 'Syndic', 'Property Administrator',
    'Architecte', 'Architect', 'Ingénieur construction', 'Construction Engineer',
    'Chef de chantier', 'Site Manager', 'Conducteur de travaux', 'Works Manager'
  ],

  // MÉTIERS DE LA FINANCE ET INVESTISSEMENT
  financeInvestment: [
    'Analyste financier', 'Financial Analyst', 'Trader', 'Trader', 'Gestionnaire de portefeuille', 'Portfolio Manager',
    'Auditeur', 'Auditor', 'Comptable', 'Accountant', 'Expert-comptable', 'Chartered Accountant',
    'Contrôleur de gestion', 'Management Controller', 'Directeur financier', 'Financial Director',
    'Responsable trésorerie', 'Treasury Manager', 'Analyste crédit', 'Credit Analyst',
    'Gestionnaire de patrimoine', 'Wealth Manager', 'Conseiller en investissement', 'Investment Advisor'
  ],

  // MÉTIERS DE LA LOGISTIQUE ET TRANSPORT
  logisticsTransport: [
    'Logisticien', 'Logistician', 'Transporteur', 'Carrier', 'Chauffeur', 'Driver',
    'Livreur', 'Delivery Driver', 'Magasinier', 'Warehouse Worker', 'Responsable logistique', 'Logistics Manager',
    'Chef d\'entrepôt', 'Warehouse Manager', 'Responsable transport', 'Transport Manager',
    'Planificateur logistique', 'Logistics Planner', 'Gestionnaire de flotte', 'Fleet Manager',
    'Responsable supply chain', 'Supply Chain Manager', 'Chargé d\'approvisionnement', 'Procurement Officer'
  ],

  // MÉTIERS DE LA QUALITÉ ET CONTRÔLE
  qualityControl: [
    'Responsable qualité', 'Quality Manager', 'Contrôleur qualité', 'Quality Controller',
    'Ingénieur qualité', 'Quality Engineer', 'Technicien qualité', 'Quality Technician',
    'Auditeur qualité', 'Quality Auditor', 'Chef de projet qualité', 'Quality Project Manager',
    'Responsable QHSE', 'QHSE Manager', 'Responsable sécurité', 'Safety Manager',
    'Chargé de prévention', 'Prevention Officer', 'Technicien HSE', 'HSE Technician'
  ],

  // MÉTIERS DE LA MAINTENANCE ET RÉPARATION
  maintenanceRepair: [
    'Technicien de maintenance', 'Maintenance Technician', 'Responsable maintenance', 'Maintenance Manager',
    'Chef d\'équipe maintenance', 'Maintenance Team Leader', 'Ingénieur maintenance', 'Maintenance Engineer',
    'Électricien de maintenance', 'Maintenance Electrician', 'Mécanicien', 'Mechanic',
    'Technicien électronique', 'Electronics Technician', 'Technicien informatique', 'IT Technician',
    'Technicien télécom', 'Telecom Technician', 'Technicien réseau', 'Network Technician',
    'Réparateur', 'Repairer', 'Technicien de réparation', 'Repair Technician'
  ],

  // MÉTIERS DE LA PRODUCTION ET FABRICATION
  productionManufacturing: [
    'Ouvrier de production', 'Production Worker', 'Responsable production', 'Production Manager',
    'Chef d\'équipe production', 'Production Team Leader', 'Technicien de production', 'Production Technician',
    'Opérateur de production', 'Production Operator', 'Conducteur de ligne', 'Line Operator',
    'Responsable d\'atelier', 'Workshop Manager', 'Chef d\'équipe atelier', 'Workshop Team Leader',
    'Technicien méthodes', 'Methods Technician', 'Responsable industriel', 'Industrial Manager',
    'Ouvrier qualifié', 'Skilled Worker', 'Ouvrier spécialisé', 'Specialized Worker'
  ],

  // MÉTIERS DE LA VENTE ET COMMERCE DE DÉTAIL
  salesRetail: [
    'Vendeur', 'Vendeuse', 'Salesperson', 'Responsable de magasin', 'Store Manager',
    'Chef de rayon', 'Department Manager', 'Vendeur spécialisé', 'Specialized Salesperson',
    'Conseiller de vente', 'Sales Advisor', 'Responsable commercial', 'Sales Manager',
    'Directeur commercial', 'Sales Director', 'Chargé de clientèle', 'Account Manager',
    'Commercial terrain', 'Field Sales', 'Commercial sédentaire', 'Inside Sales',
    'Télévendeur', 'Telemarketer', 'Responsable e-commerce', 'E-commerce Manager',
    'Vendeur en ligne', 'Online Salesperson', 'Conseiller client', 'Customer Advisor'
  ],

  // MÉTIERS DE LA COMMUNICATION ET MÉDIAS
  communicationMedia: [
    'Chargé de communication', 'Communication Officer', 'Responsable communication', 'Communication Manager',
    'Directeur communication', 'Communication Director', 'Attaché de presse', 'Press Officer',
    'Chargé de relations publiques', 'Public Relations Officer', 'Responsable événementiel', 'Event Manager',
    'Social Media Manager', 'Social Media Manager', 'Content Manager', 'Content Manager',
    'Community Manager', 'Community Manager', 'Rédacteur web', 'Web Writer',
    'Journaliste', 'Journalist', 'Photographe', 'Photographer', 'Vidéaste', 'Videographer',
    'Rédacteur', 'Writer', 'Traducteur', 'Translator', 'Interprète', 'Interpreter'
  ],

  // MÉTIERS DE LA FORMATION ET ÉDUCATION
  trainingEducation: [
    'Formateur', 'Trainer', 'Responsable formation', 'Training Manager',
    'Directeur formation', 'Training Director', 'Chargé de formation', 'Training Officer',
    'Conseiller en formation', 'Training Advisor', 'Ingénieur formation', 'Training Engineer',
    'Professeur', 'Professor', 'Enseignant', 'Teacher', 'Instructeur', 'Instructor',
    'Coach', 'Coach', 'Mentor', 'Mentor', 'Animateur', 'Animator',
    'Éducateur', 'Educator', 'Professeur des écoles', 'Primary School Teacher',
    'Professeur de collège', 'Middle School Teacher', 'Professeur de lycée', 'High School Teacher'
  ],

  // MÉTIERS DE LA RECHERCHE ET DÉVELOPPEMENT
  researchDevelopment: [
    'Chercheur', 'Researcher', 'Ingénieur R&D', 'R&D Engineer', 'Responsable R&D', 'R&D Manager',
    'Directeur R&D', 'R&D Director', 'Technicien R&D', 'R&D Technician',
    'Chef de projet R&D', 'R&D Project Manager', 'Scientifique', 'Scientist',
    'Docteur', 'Doctor', 'Post-doctorant', 'Post-doctoral', 'Chercheur CNRS', 'CNRS Researcher',
    'Chercheur universitaire', 'University Researcher', 'Ingénieur de recherche', 'Research Engineer',
    'Technicien de recherche', 'Research Technician', 'Assistant de recherche', 'Research Assistant'
  ],

  // MÉTIERS DE L'INFORMATIQUE ET DIGITAL
  itDigital: [
    'Développeur', 'Developer', 'Programmeur', 'Programmer', 'Architecte logiciel', 'Software Architect',
    'Développeur full-stack', 'Full-stack Developer', 'Développeur front-end', 'Front-end Developer',
    'Développeur back-end', 'Back-end Developer', 'Développeur mobile', 'Mobile Developer',
    'DevOps', 'DevOps', 'Data Scientist', 'Data Scientist', 'Ingénieur data', 'Data Engineer',
    'Analyste data', 'Data Analyst', 'Machine Learning Engineer', 'Machine Learning Engineer',
    'Ingénieur cloud', 'Cloud Engineer', 'Ingénieur sécurité', 'Security Engineer',
    'Responsable informatique', 'IT Manager', 'Directeur informatique', 'IT Director',
    'Analyste programmeur', 'Programmer Analyst', 'Développeur web', 'Web Developer',
    'Développeur d\'applications', 'Application Developer', 'Ingénieur système', 'Systems Engineer',
    'Ingénieur réseau', 'Network Engineer', 'Administrateur système', 'System Administrator'
  ],

  // MÉTIERS DE LA GESTION DE PROJET
  projectManagement: [
    'Chef de projet', 'Project Manager', 'Chef de projet informatique', 'IT Project Manager',
    'Chef de projet digital', 'Digital Project Manager', 'Scrum Master', 'Scrum Master',
    'Product Owner', 'Product Owner', 'Responsable de programme', 'Program Manager',
    'Directeur de projet', 'Project Director', 'Gestionnaire de projet', 'Project Coordinator',
    'Chef de projet construction', 'Construction Project Manager', 'Chef de projet marketing', 'Marketing Project Manager',
    'Chef de projet innovation', 'Innovation Project Manager', 'Chef de projet transformation', 'Transformation Project Manager'
  ],

  // MÉTIERS DU MARKETING ET PUBLICITÉ
  marketingAdvertising: [
    'Chargé de marketing', 'Marketing Officer', 'Responsable marketing', 'Marketing Manager',
    'Directeur marketing', 'Marketing Director', 'Chef de produit', 'Product Manager',
    'Digital Marketing Manager', 'Digital Marketing Manager', 'SEO Manager', 'SEO Manager',
    'SEM Manager', 'SEM Manager', 'Social Media Manager', 'Social Media Manager',
    'Content Marketing Manager', 'Content Marketing Manager', 'Brand Manager', 'Brand Manager',
    'Chargé de communication marketing', 'Marketing Communication Officer', 'Responsable publicité', 'Advertising Manager',
    'Chargé de marketing digital', 'Digital Marketing Officer', 'Responsable e-marketing', 'E-marketing Manager',
    'Chargé de marketing produit', 'Product Marketing Officer', 'Responsable marketing relationnel', 'Relationship Marketing Manager'
  ]
};

/**
 * Fonction pour obtenir tous les métiers dans un tableau plat
 * @returns {Array} Tableau de tous les métiers
 */
function getAllJobTitles() {
  const allTitles = [];
  for (const category in jobTitles) {
    allTitles.push(...jobTitles[category]);
  }
  return allTitles;
}

/**
 * Fonction pour obtenir les métiers d'une catégorie spécifique
 * @param {string} category - Nom de la catégorie
 * @returns {Array} Tableau des métiers de la catégorie
 */
function getJobTitlesByCategory(category) {
  return jobTitles[category] || [];
}

/**
 * Fonction pour rechercher des métiers par mot-clé
 * @param {string} keyword - Mot-clé à rechercher
 * @returns {Array} Tableau des métiers contenant le mot-clé
 */
function searchJobTitles(keyword) {
  const allTitles = getAllJobTitles();
  const lowerKeyword = keyword.toLowerCase();
  return allTitles.filter(title => 
    title.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Fonction pour obtenir les catégories disponibles
 * @returns {Array} Tableau des noms de catégories
 */
function getCategories() {
  return Object.keys(jobTitles);
}

module.exports = {
  jobTitles,
  getAllJobTitles,
  getJobTitlesByCategory,
  searchJobTitles,
  getCategories
};