// Script temporaire pour ajouter des données de test
const testApplications = [
  {
    id: 1,
    jobTitle: "Développeur Full Stack",
    company: "TechCorp",
    location: "Paris",
    status: "CV envoyé",
    appliedDate: "2025-07-15",
    lastUpdate: "2025-07-15",
    cvVersion: "CV_v2.pdf",
    coverLetter: "Lettre_TechCorp.pdf",
    notes: "Candidature envoyée via SkillMatchr",
    salary: "45000",
    type: "CDI",
    source: "LinkedIn"
  },
  {
    id: 2,
    jobTitle: "Développeur Backend",
    company: "StartupXYZ",
    location: "Lyon",
    status: "Entretien programmé",
    appliedDate: "2025-07-20",
    lastUpdate: "2025-07-22",
    cvVersion: "CV_v2.pdf",
    coverLetter: "Lettre_StartupXYZ.pdf",
    notes: "Candidature envoyée via SkillMatchr",
    salary: "50000",
    type: "CDI",
    source: "Indeed"
  },
  {
    id: 3,
    jobTitle: "Data Scientist",
    company: "BigData Inc",
    location: "Marseille",
    status: "Offre reçue",
    appliedDate: "2025-07-10",
    lastUpdate: "2025-07-25",
    cvVersion: "CV_v2.pdf",
    coverLetter: "Lettre_BigDataInc.pdf",
    notes: "Candidature envoyée via SkillMatchr",
    salary: "55000",
    type: "CDI",
    source: "Apec"
  },
  {
    id: 4,
    jobTitle: "DevOps Engineer",
    company: "CloudTech",
    location: "Toulouse",
    status: "Offre refusée",
    appliedDate: "2025-07-05",
    lastUpdate: "2025-07-18",
    cvVersion: "CV_v2.pdf",
    coverLetter: "Lettre_CloudTech.pdf",
    notes: "Candidature envoyée via SkillMatchr",
    salary: "48000",
    type: "CDI",
    source: "LinkedIn"
  },
  {
    id: 5,
    jobTitle: "Frontend Developer",
    company: "WebAgency",
    location: "Nantes",
    status: "CV envoyé",
    appliedDate: "2025-08-01",
    lastUpdate: "2025-08-01",
    cvVersion: "CV_v2.pdf",
    coverLetter: "Lettre_WebAgency.pdf",
    notes: "Candidature envoyée via SkillMatchr",
    salary: "42000",
    type: "CDI",
    source: "Indeed"
  }
];

// Ajouter les données de test au localStorage
localStorage.setItem('applications', JSON.stringify(testApplications));

// Mettre à jour les stats
const stats = {
  totalApplications: testApplications.length,
  pendingApplications: testApplications.filter(app => app.status === 'CV envoyé').length,
  interviewsScheduled: testApplications.filter(app => app.status === 'Entretien programmé').length,
  offersReceived: testApplications.filter(app => app.status === 'Offre reçue').length,
  successRate: Math.round((testApplications.filter(app => app.status === 'Offre reçue').length / testApplications.length) * 100) + "%"
};

localStorage.setItem('applicationStats', JSON.stringify(stats));

console.log('Données de test ajoutées au localStorage');
console.log('Applications:', testApplications);
console.log('Stats:', stats); 