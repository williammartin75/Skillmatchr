const fs = require('fs');
const path = require('path');

// Fonction pour créer les répertoires nécessaires
function ensureDirectories() {
  const dirs = ['data/users', 'data/applications', 'data/sessions'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Fonction pour générer une date aléatoire dans une plage
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Fonction pour générer des utilisateurs de test
function generateTestUsers() {
  const users = [
    {
      id: 'user_1',
      firstName: 'Marie',
      lastName: 'Dupont',
      email: 'marie.dupont@email.com',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 30 jours
      subscriptionType: 'premium'
    },
    {
      id: 'user_2',
      firstName: 'Pierre',
      lastName: 'Martin',
      email: 'pierre.martin@email.com',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 60 jours
      subscriptionType: 'professionnel'
    },
    {
      id: 'user_3',
      firstName: 'Sophie',
      lastName: 'Bernard',
      email: 'sophie.bernard@email.com',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 7 jours
      subscriptionType: 'free'
    },
    {
      id: 'user_4',
      firstName: 'Lucas',
      lastName: 'Petit',
      email: 'lucas.petit@email.com',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 90 jours
      subscriptionType: 'premium'
    },
    {
      id: 'user_5',
      firstName: 'Emma',
      lastName: 'Roux',
      email: 'emma.roux@email.com',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 14 jours
      subscriptionType: 'free'
    }
  ];

  users.forEach(user => {
    fs.writeFileSync(
      path.join('data/users', `${user.id}.json`),
      JSON.stringify(user, null, 2)
    );
  });

  return users;
}

// Fonction pour générer des candidatures de test avec dates variées
function generateTestApplications(users) {
  const statuses = [
    'Candidature envoyée',
    'CV consulté',
    'Entretien programmé',
    'Refusé',
    'Accepté',
    'En attente'
  ];

  let applicationId = 1;

  // Générer des candidatures pour les dernières 24h
  for (let i = 0; i < 15; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const application = {
      id: `app_${applicationId++}`,
      userId: user.id,
      jobTitle: `Développeur ${['Frontend', 'Backend', 'Fullstack', 'Mobile', 'DevOps'][Math.floor(Math.random() * 5)]}`,
      company: `Entreprise ${Math.floor(Math.random() * 100)}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: randomDate(
        new Date(Date.now() - 24 * 60 * 60 * 1000), // Il y a 24h
        new Date() // Maintenant
      ).toISOString()
    };
    fs.writeFileSync(
      path.join('data/applications', `${application.id}.json`),
      JSON.stringify(application, null, 2)
    );
  }

  // Générer des candidatures pour il y a une semaine
  for (let i = 0; i < 25; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const application = {
      id: `app_${applicationId++}`,
      userId: user.id,
      jobTitle: `Ingénieur ${['Logiciel', 'Système', 'Réseau', 'Sécurité', 'Cloud'][Math.floor(Math.random() * 5)]}`,
      company: `Société ${Math.floor(Math.random() * 100)}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: randomDate(
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Il y a 14 jours
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)   // Il y a 7 jours
      ).toISOString()
    };
    fs.writeFileSync(
      path.join('data/applications', `${application.id}.json`),
      JSON.stringify(application, null, 2)
    );
  }

  // Générer des candidatures pour il y a deux semaines
  for (let i = 0; i < 30; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const application = {
      id: `app_${applicationId++}`,
      userId: user.id,
      jobTitle: `Chef de projet ${['IT', 'Digital', 'Innovation', 'Transformation', 'Agile'][Math.floor(Math.random() * 5)]}`,
      company: `Groupe ${Math.floor(Math.random() * 100)}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: randomDate(
        new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // Il y a 21 jours
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)  // Il y a 14 jours
      ).toISOString()
    };
    fs.writeFileSync(
      path.join('data/applications', `${application.id}.json`),
      JSON.stringify(application, null, 2)
    );
  }

  // Générer des candidatures pour il y a 1 mois
  for (let i = 0; i < 40; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const application = {
      id: `app_${applicationId++}`,
      userId: user.id,
      jobTitle: `Consultant ${['Technique', 'Fonctionnel', 'Architecture', 'Performance', 'Sécurité'][Math.floor(Math.random() * 5)]}`,
      company: `Cabinet ${Math.floor(Math.random() * 100)}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: randomDate(
        new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // Il y a 60 jours
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)  // Il y a 30 jours
      ).toISOString()
    };
    fs.writeFileSync(
      path.join('data/applications', `${application.id}.json`),
      JSON.stringify(application, null, 2)
    );
  }

  // Générer des candidatures pour il y a 2 mois
  for (let i = 0; i < 35; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const application = {
      id: `app_${applicationId++}`,
      userId: user.id,
      jobTitle: `Architecte ${['Solution', 'Système', 'Données', 'Cloud', 'Sécurité'][Math.floor(Math.random() * 5)]}`,
      company: `Corporation ${Math.floor(Math.random() * 100)}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: randomDate(
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Il y a 90 jours
        new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)  // Il y a 60 jours
      ).toISOString()
    };
    fs.writeFileSync(
      path.join('data/applications', `${application.id}.json`),
      JSON.stringify(application, null, 2)
    );
  }

  // Générer des candidatures pour il y a 3 mois
  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const application = {
      id: `app_${applicationId++}`,
      userId: user.id,
      jobTitle: `Manager ${['Projet', 'Équipe', 'Produit', 'Service', 'Innovation'][Math.floor(Math.random() * 5)]}`,
      company: `Organisation ${Math.floor(Math.random() * 100)}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: randomDate(
        new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // Il y a 120 jours
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)   // Il y a 90 jours
      ).toISOString()
    };
    fs.writeFileSync(
      path.join('data/applications', `${application.id}.json`),
      JSON.stringify(application, null, 2)
    );
  }

  // Générer des candidatures pour il y a 6 mois
  for (let i = 0; i < 60; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const application = {
      id: `app_${applicationId++}`,
      userId: user.id,
      jobTitle: `Directeur ${['Technique', 'Innovation', 'Digital', 'Transformation', 'Stratégie'][Math.floor(Math.random() * 5)]}`,
      company: `Institution ${Math.floor(Math.random() * 100)}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: randomDate(
        new Date(Date.now() - 210 * 24 * 60 * 60 * 1000), // Il y a 210 jours
        new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)  // Il y a 180 jours
      ).toISOString()
    };
    fs.writeFileSync(
      path.join('data/applications', `${application.id}.json`),
      JSON.stringify(application, null, 2)
    );
  }

  // Générer des candidatures pour il y a 1 an
  for (let i = 0; i < 80; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const application = {
      id: `app_${applicationId++}`,
      userId: user.id,
      jobTitle: `VP ${['Engineering', 'Product', 'Technology', 'Innovation', 'Strategy'][Math.floor(Math.random() * 5)]}`,
      company: `Global ${Math.floor(Math.random() * 100)}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: randomDate(
        new Date(Date.now() - 545 * 24 * 60 * 60 * 1000), // Il y a 545 jours
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)  // Il y a 365 jours
      ).toISOString()
    };
    fs.writeFileSync(
      path.join('data/applications', `${application.id}.json`),
      JSON.stringify(application, null, 2)
    );
  }
}

// Fonction pour générer des sessions de test
function generateTestSessions(users) {
  let sessionId = 1;

  // Sessions récentes (dernières 24h)
  for (let i = 0; i < 8; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const session = {
      id: `session_${sessionId++}`,
      userId: user.id,
      createdAt: randomDate(
        new Date(Date.now() - 24 * 60 * 60 * 1000),
        new Date()
      ).toISOString(),
      lastActivity: new Date().toISOString()
    };
    fs.writeFileSync(
      path.join('data/sessions', `${session.id}.json`),
      JSON.stringify(session, null, 2)
    );
  }

  // Sessions il y a une semaine
  for (let i = 0; i < 12; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const session = {
      id: `session_${sessionId++}`,
      userId: user.id,
      createdAt: randomDate(
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).toISOString(),
      lastActivity: randomDate(
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).toISOString()
    };
    fs.writeFileSync(
      path.join('data/sessions', `${session.id}.json`),
      JSON.stringify(session, null, 2)
    );
  }

  // Sessions il y a deux semaines
  for (let i = 0; i < 15; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const session = {
      id: `session_${sessionId++}`,
      userId: user.id,
      createdAt: randomDate(
        new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      ).toISOString(),
      lastActivity: randomDate(
        new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      ).toISOString()
    };
    fs.writeFileSync(
      path.join('data/sessions', `${session.id}.json`),
      JSON.stringify(session, null, 2)
    );
  }

  // Sessions il y a 1 mois
  for (let i = 0; i < 20; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const session = {
      id: `session_${sessionId++}`,
      userId: user.id,
      createdAt: randomDate(
        new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).toISOString(),
      lastActivity: randomDate(
        new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).toISOString()
    };
    fs.writeFileSync(
      path.join('data/sessions', `${session.id}.json`),
      JSON.stringify(session, null, 2)
    );
  }

  // Sessions il y a 2 mois
  for (let i = 0; i < 18; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const session = {
      id: `session_${sessionId++}`,
      userId: user.id,
      createdAt: randomDate(
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      ).toISOString(),
      lastActivity: randomDate(
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      ).toISOString()
    };
    fs.writeFileSync(
      path.join('data/sessions', `${session.id}.json`),
      JSON.stringify(session, null, 2)
    );
  }

  // Sessions il y a 3 mois
  for (let i = 0; i < 25; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const session = {
      id: `session_${sessionId++}`,
      userId: user.id,
      createdAt: randomDate(
        new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      ).toISOString(),
      lastActivity: randomDate(
        new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      ).toISOString()
    };
    fs.writeFileSync(
      path.join('data/sessions', `${session.id}.json`),
      JSON.stringify(session, null, 2)
    );
  }

  // Sessions il y a 6 mois
  for (let i = 0; i < 30; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const session = {
      id: `session_${sessionId++}`,
      userId: user.id,
      createdAt: randomDate(
        new Date(Date.now() - 210 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
      ).toISOString(),
      lastActivity: randomDate(
        new Date(Date.now() - 210 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
      ).toISOString()
    };
    fs.writeFileSync(
      path.join('data/sessions', `${session.id}.json`),
      JSON.stringify(session, null, 2)
    );
  }

  // Sessions il y a 1 an
  for (let i = 0; i < 40; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const session = {
      id: `session_${sessionId++}`,
      userId: user.id,
      createdAt: randomDate(
        new Date(Date.now() - 545 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      ).toISOString(),
      lastActivity: randomDate(
        new Date(Date.now() - 545 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      ).toISOString()
    };
    fs.writeFileSync(
      path.join('data/sessions', `${session.id}.json`),
      JSON.stringify(session, null, 2)
    );
  }
}

// Fonction principale
function main() {
  console.log('🚀 Génération des données de test temporelles...');
  
  ensureDirectories();
  
  console.log('📁 Création des répertoires...');
  
  console.log('👥 Génération des utilisateurs...');
  const users = generateTestUsers();
  
  console.log('📝 Génération des candidatures...');
  generateTestApplications(users);
  
  console.log('🔄 Génération des sessions...');
  generateTestSessions(users);
  
  console.log('✅ Données de test temporelles générées avec succès !');
  console.log(`📊 Résumé :
  - ${users.length} utilisateurs créés
  - 335 candidatures réparties sur différentes périodes
  - 168 sessions réparties sur différentes périodes
  - Données couvrant les dernières 24h jusqu'à il y a 1 an`);
}

main();