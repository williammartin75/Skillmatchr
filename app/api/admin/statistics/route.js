import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Fonction pour récupérer toutes les candidatures
function getAllApplications() {
  try {
    const applicationsDir = path.join(process.cwd(), 'data', 'applications');
    if (!fs.existsSync(applicationsDir)) {
      return [];
    }
    
    const applicationFiles = fs.readdirSync(applicationsDir).filter(file => file.endsWith('.json'));
    const applications = [];
    
    for (const file of applicationFiles) {
      try {
        const appData = fs.readFileSync(path.join(applicationsDir, file), 'utf8');
        const application = JSON.parse(appData);
        applications.push(application);
      } catch (error) {
        console.error(`Erreur lecture candidature ${file}:`, error);
      }
    }
    
    return applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Erreur récupération candidatures:', error);
    return [];
  }
}

// Fonction pour récupérer toutes les sessions
function getAllSessions() {
  try {
    const sessionsDir = path.join(process.cwd(), 'data', 'sessions');
    if (!fs.existsSync(sessionsDir)) {
      return [];
    }
    
    const sessionFiles = fs.readdirSync(sessionsDir).filter(file => file.endsWith('.json'));
    const sessions = [];
    
    for (const file of sessionFiles) {
      try {
        const sessionData = fs.readFileSync(path.join(sessionsDir, file), 'utf8');
        const session = JSON.parse(sessionData);
        sessions.push(session);
      } catch (error) {
        console.error(`Erreur lecture session ${file}:`, error);
      }
    }
    
    return sessions;
  } catch (error) {
    console.error('Erreur récupération sessions:', error);
    return [];
  }
}

// Fonction pour récupérer tous les utilisateurs
function getAllUsers() {
  try {
    const usersDir = path.join(process.cwd(), 'data', 'users');
    if (!fs.existsSync(usersDir)) {
      return [];
    }
    
    const userFiles = fs.readdirSync(usersDir).filter(file => file.endsWith('.json'));
    const users = [];
    
    for (const file of userFiles) {
      try {
        const userData = fs.readFileSync(path.join(usersDir, file), 'utf8');
        const user = JSON.parse(userData);
        users.push(user);
      } catch (error) {
        console.error(`Erreur lecture utilisateur ${file}:`, error);
      }
    }
    
    return users;
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    return [];
  }
}

// Fonction pour calculer les statistiques pour une période donnée
function calculateStatsForPeriod(applications, sessions, users, startDate, endDate) {
  const periodApplications = applications.filter(app => {
    const appDate = new Date(app.createdAt);
    return appDate >= startDate && appDate <= endDate;
  });
  
  const periodSessions = sessions.filter(session => {
    const sessionDate = new Date(session.lastActivity || session.createdAt);
    return sessionDate >= startDate && sessionDate <= endDate;
  });
  
  // Nombre de candidatures envoyées
  const applicationsSent = periodApplications.length;
  
  // Taux de réponse (statuts autres que "Candidature envoyée" / total candidatures)
  const nonSentApplications = periodApplications.filter(app => 
    app.status && app.status !== "Candidature envoyée"
  ).length;
  const responseRate = applicationsSent > 0 ? (nonSentApplications / applicationsSent) * 100 : 0;
  
  // Temps moyen de candidature (estimation basée sur les sessions)
  const totalSessionTime = periodSessions.length * 5; // Estimation: 5 minutes par session
  const avgApplicationTime = applicationsSent > 0 ? totalSessionTime / applicationsSent : 0;
  
  // Utilisateurs actifs (sessions récentes)
  const activeUsers = periodSessions.length;
  
  return {
    applicationsSent,
    responseRate: Math.round(responseRate * 100) / 100,
    avgApplicationTime: Math.round(avgApplicationTime * 100) / 100,
    activeUsers
  };
}

// Fonction pour créer les périodes temporelles
function createTimePeriods() {
  const now = new Date();
  const periods = [
    { name: 'Dernières 24h', start: new Date(now.getTime() - 24 * 60 * 60 * 1000), end: now },
    { name: 'Il y a une semaine', start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) },
    { name: 'Il y a deux semaines', start: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), end: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    { name: 'Il y a trois semaines', start: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), end: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) },
    { name: 'Il y a 1 mois', start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000) },
    { name: 'Il y a 2 mois', start: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), end: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
    { name: 'Il y a 3 mois', start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), end: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) },
    { name: 'Il y a 6 mois', start: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000), end: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) },
    { name: 'Il y a 1 an', start: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), end: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) }
  ];
  
  return periods;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h'; // Par défaut: dernières 24h
    
    // Récupérer toutes les données
    const allApplications = getAllApplications();
    const allSessions = getAllSessions();
    const allUsers = getAllUsers();
    
    // Créer les périodes temporelles
    const timePeriods = createTimePeriods();
    
    // Calculer les statistiques pour chaque période
    const periodStats = timePeriods.map(period => {
      const stats = calculateStatsForPeriod(allApplications, allSessions, allUsers, period.start, period.end);
      return {
        period: period.name,
        ...stats
      };
    });
    
    // Statistiques globales (toutes périodes confondues)
    const globalStats = {
      totalApplications: allApplications.length,
      totalUsers: allUsers.length,
      totalSessions: allSessions.length,
      overallResponseRate: allApplications.length > 0 ? 
        (allApplications.filter(app => app.status && app.status !== "Candidature envoyée").length / allApplications.length) * 100 : 0
    };
    
    return NextResponse.json({
      success: true,
      periodStats,
      globalStats,
      currentPeriod: period
    });
    
  } catch (error) {
    console.error('Erreur API statistiques:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}