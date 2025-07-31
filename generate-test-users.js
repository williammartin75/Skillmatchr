const fs = require('fs');
const path = require('path');

// Données de test pour les utilisateurs
const testUsers = [
  {
    firstName: "Marie",
    lastName: "Dupont",
    email: "marie.dupont@email.com",
    password: "password123",
    createdAt: "2024-01-15T10:30:00.000Z",
    subscriptionType: "premium", // Utilisateur premium
    profile: {
      firstName: "Marie",
      lastName: "Dupont",
      email: "marie.dupont@email.com",
      phone: "06.12.34.56.78",
      address: "123 Rue de la Paix, 75001 Paris",
      skills: ["JavaScript", "React", "Node.js", "PostgreSQL"],
      experience: [
        {
          title: "Développeuse Frontend",
          company: "TechCorp",
          duration: "2 ans",
          description: "Développement d'applications React"
        }
      ],
      education: [
        {
          degree: "Master en Informatique",
          school: "École Centrale",
          year: "2022"
        }
      ]
    },
    documents: [
      {
        id: "doc_1",
        name: "CV_Marie_Dupont.pdf",
        type: "cv",
        path: "/uploads/users/user_1/cv-1.pdf",
        uploadedAt: "2024-01-15T10:30:00.000Z",
        extractedInfo: {
          firstName: "Marie",
          lastName: "Dupont",
          email: "marie.dupont@email.com",
          phone: "06.12.34.56.78"
        }
      }
    ]
  },
  {
    firstName: "Pierre",
    lastName: "Martin",
    email: "pierre.martin@email.com",
    password: "password123",
    createdAt: "2024-01-14T14:20:00.000Z",
    subscriptionType: "professionnel", // Utilisateur professionnel
    profile: {
      firstName: "Pierre",
      lastName: "Martin",
      email: "pierre.martin@email.com",
      phone: "06.98.76.54.32",
      address: "456 Avenue des Champs, 69000 Lyon",
      skills: ["Python", "Django", "Machine Learning", "AWS"],
      experience: [
        {
          title: "Data Scientist",
          company: "DataLab",
          duration: "3 ans",
          description: "Développement de modèles ML"
        }
      ],
      education: [
        {
          degree: "Master en Data Science",
          school: "ENS Lyon",
          year: "2021"
        }
      ]
    },
    documents: [
      {
        id: "doc_2",
        name: "CV_Pierre_Martin.pdf",
        type: "cv",
        path: "/uploads/users/user_2/cv-2.pdf",
        uploadedAt: "2024-01-14T14:20:00.000Z",
        extractedInfo: {
          firstName: "Pierre",
          lastName: "Martin",
          email: "pierre.martin@email.com",
          phone: "06.98.76.54.32"
        }
      }
    ]
  },
  {
    firstName: "Sophie",
    lastName: "Bernard",
    email: "sophie.bernard@email.com",
    password: "password123",
    createdAt: "2024-01-13T09:15:00.000Z",
    subscriptionType: "free", // Utilisateur free
    profile: {
      firstName: "Sophie",
      lastName: "Bernard",
      email: "sophie.bernard@email.com",
      phone: "06.11.22.33.44",
      address: "789 Boulevard de la Mer, 13000 Marseille",
      skills: ["Java", "Spring Boot", "Docker", "Kubernetes"],
      experience: [
        {
          title: "Développeuse Backend",
          company: "CloudTech",
          duration: "4 ans",
          description: "Développement d'APIs microservices"
        }
      ],
      education: [
        {
          degree: "Ingénieur en Informatique",
          school: "Centrale Marseille",
          year: "2020"
        }
      ]
    },
    documents: []
  },
  {
    firstName: "Lucas",
    lastName: "Petit",
    email: "lucas.petit@email.com",
    password: "password123",
    createdAt: "2024-01-12T16:45:00.000Z",
    subscriptionType: "premium", // Utilisateur premium
    profile: {
      firstName: "Lucas",
      lastName: "Petit",
      email: "lucas.petit@email.com",
      phone: "06.55.66.77.88",
      address: "321 Rue du Commerce, 44000 Nantes",
      skills: ["Vue.js", "TypeScript", "GraphQL", "MongoDB"],
      experience: [
        {
          title: "Développeur Full Stack",
          company: "StartupXYZ",
          duration: "1 an",
          description: "Développement d'applications web modernes"
        }
      ],
      education: [
        {
          degree: "Licence en Informatique",
          school: "Université de Nantes",
          year: "2023"
        }
      ]
    },
    documents: [
      {
        id: "doc_4",
        name: "CV_Lucas_Petit.pdf",
        type: "cv",
        path: "/uploads/users/user_4/cv-4.pdf",
        uploadedAt: "2024-01-12T16:45:00.000Z",
        extractedInfo: {
          firstName: "Lucas",
          lastName: "Petit",
          email: "lucas.petit@email.com",
          phone: "06.55.66.77.88"
        }
      }
    ]
  },
  {
    firstName: "Emma",
    lastName: "Rousseau",
    email: "emma.rousseau@email.com",
    password: "password123",
    createdAt: "2024-01-11T11:30:00.000Z",
    subscriptionType: "free", // Utilisateur free
    profile: {
      firstName: "Emma",
      lastName: "Rousseau",
      email: "emma.rousseau@email.com",
      phone: "06.99.88.77.66",
      address: "654 Rue de la Liberté, 31000 Toulouse",
      skills: ["C#", ".NET", "SQL Server", "Azure"],
      experience: [
        {
          title: "Développeuse .NET",
          company: "EnterpriseSoft",
          duration: "5 ans",
          description: "Développement d'applications d'entreprise"
        }
      ],
      education: [
        {
          degree: "Master en Génie Logiciel",
          school: "INSA Toulouse",
          year: "2019"
        }
      ]
    },
    documents: [
      {
        id: "doc_5",
        name: "CV_Emma_Rousseau.pdf",
        type: "cv",
        path: "/uploads/users/user_5/cv-5.pdf",
        uploadedAt: "2024-01-11T11:30:00.000Z",
        extractedInfo: {
          firstName: "Emma",
          lastName: "Rousseau",
          email: "emma.rousseau@email.com",
          phone: "06.99.88.77.66"
        }
      }
    ]
  }
];

// Fonction pour créer le dossier users s'il n'existe pas
function ensureUsersDirectory() {
  const usersDir = path.join(process.cwd(), 'data', 'users');
  if (!fs.existsSync(usersDir)) {
    fs.mkdirSync(usersDir, { recursive: true });
  }
  return usersDir;
}

// Fonction pour générer les utilisateurs de test
function generateTestUsers() {
  const usersDir = ensureUsersDirectory();
  
  testUsers.forEach((userData, index) => {
    const userId = `user_${index + 1}`;
    const user = {
      id: userId,
      ...userData
    };
    
    const userFilePath = path.join(usersDir, `${userId}.json`);
    fs.writeFileSync(userFilePath, JSON.stringify(user, null, 2));
    
    console.log(`✅ Utilisateur créé: ${user.firstName} ${user.lastName} (${user.email})`);
  });
  
  console.log(`\n🎉 ${testUsers.length} utilisateurs de test créés avec succès !`);
  console.log(`📁 Fichiers sauvegardés dans: ${usersDir}`);
}

// Fonction pour créer des sessions de test
function generateTestSessions() {
  const sessionsDir = path.join(process.cwd(), 'data', 'sessions');
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
  }
  
  // Créer des sessions pour les utilisateurs actifs
  const activeUsers = [1, 2, 4, 5]; // Marie, Pierre, Lucas, Emma
  const now = new Date();
  
  activeUsers.forEach((userIndex, index) => {
    const userId = `user_${userIndex}`;
    const sessionId = `session_${userId}`;
    
    // Créer une session récente (moins de 24h)
    const lastActivity = new Date(now.getTime() - (index * 2 * 60 * 60 * 1000)); // 2h d'écart entre chaque
    
    const session = {
      id: sessionId,
      userId: userId,
      createdAt: lastActivity.toISOString(),
      lastActivity: lastActivity.toISOString(),
      isActive: true
    };
    
    const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
    fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
    
    console.log(`✅ Session créée pour: ${userId} (dernière activité: ${lastActivity.toLocaleString('fr-FR')})`);
  });
  
  console.log(`\n🎉 ${activeUsers.length} sessions de test créées !`);
}

// Fonction pour créer des candidatures de test
function generateTestApplications() {
  const applicationsDir = path.join(process.cwd(), 'data', 'applications');
  if (!fs.existsSync(applicationsDir)) {
    fs.mkdirSync(applicationsDir, { recursive: true });
  }
  
  const applications = [
    {
      userId: "user_1",
      jobId: "job_1",
      jobTitle: "Développeuse Frontend React",
      company: "TechCorp",
      status: "Candidature envoyée",
      appliedDate: "2024-01-20T10:00:00.000Z"
    },
    {
      userId: "user_1",
      jobId: "job_2",
      jobTitle: "Développeuse JavaScript",
      company: "WebAgency",
      status: "Entretien programmé",
      appliedDate: "2024-01-19T14:30:00.000Z"
    },
    {
      userId: "user_2",
      jobId: "job_3",
      jobTitle: "Data Scientist",
      company: "DataLab",
      status: "Offre reçue",
      appliedDate: "2024-01-18T09:15:00.000Z"
    },
    {
      userId: "user_2",
      jobId: "job_4",
      jobTitle: "Machine Learning Engineer",
      company: "AI Startup",
      status: "Candidature envoyée",
      appliedDate: "2024-01-17T16:45:00.000Z"
    },
    {
      userId: "user_4",
      jobId: "job_5",
      jobTitle: "Développeur Vue.js",
      company: "FrontendCorp",
      status: "Candidature envoyée",
      appliedDate: "2024-01-16T11:20:00.000Z"
    },
    {
      userId: "user_5",
      jobId: "job_6",
      jobTitle: "Développeuse .NET",
      company: "EnterpriseSoft",
      status: "Entretien programmé",
      appliedDate: "2024-01-15T13:10:00.000Z"
    }
  ];
  
  applications.forEach((appData, index) => {
    const applicationId = `app_${index + 1}`;
    const application = {
      id: applicationId,
      ...appData,
      createdAt: appData.appliedDate,
      updatedAt: appData.appliedDate
    };
    
    const applicationPath = path.join(applicationsDir, `${applicationId}.json`);
    fs.writeFileSync(applicationPath, JSON.stringify(application, null, 2));
    
    console.log(`✅ Candidature créée: ${application.jobTitle} chez ${application.company}`);
  });
  
  console.log(`\n🎉 ${applications.length} candidatures de test créées !`);
}

// Exécuter la génération
console.log('🚀 Génération des données de test...\n');

generateTestUsers();
console.log('');
generateTestSessions();
console.log('');
generateTestApplications();

console.log('\n✨ Génération terminée ! Vous pouvez maintenant tester l\'interface d\'administration.');
console.log('🌐 Accédez à: http://localhost:3000/admin');