import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
        console.error(`Erreur lecture fichier utilisateur ${file}:`, error);
      }
    }
    
    // Trier par date de création (plus récents en premier)
    return users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    return [];
  }
}

// Fonction pour compter les candidatures d'un utilisateur
function countUserApplications(userId) {
  try {
    const applicationsDir = path.join(process.cwd(), 'data', 'applications');
    if (!fs.existsSync(applicationsDir)) {
      return 0;
    }
    
    const applicationFiles = fs.readdirSync(applicationsDir).filter(file => file.endsWith('.json'));
    let count = 0;
    
    for (const file of applicationFiles) {
      try {
        const appData = fs.readFileSync(path.join(applicationsDir, file), 'utf8');
        const application = JSON.parse(appData);
        if (application.userId === userId) {
          count++;
        }
      } catch (error) {
        console.error(`Erreur lecture fichier candidature ${file}:`, error);
      }
    }
    
    return count;
  } catch (error) {
    console.error('Erreur comptage candidatures:', error);
    return 0;
  }
}

// Fonction pour vérifier si un utilisateur est actif (connecté récemment)
function isUserActive(user) {
  try {
    // Vérifier s'il y a un fichier de session récent
    const sessionsDir = path.join(process.cwd(), 'data', 'sessions');
    if (!fs.existsSync(sessionsDir)) {
      return false;
    }
    
    const sessionFiles = fs.readdirSync(sessionsDir).filter(file => file.endsWith('.json'));
    
    for (const file of sessionFiles) {
      try {
        const sessionData = fs.readFileSync(path.join(sessionsDir, file), 'utf8');
        const session = JSON.parse(sessionData);
        
        if (session.userId === user.id) {
          const lastActivity = new Date(session.lastActivity || session.createdAt);
          const now = new Date();
          const hoursSinceLastActivity = (now - lastActivity) / (1000 * 60 * 60);
          
          // Considérer comme actif si dernière activité < 24h
          return hoursSinceLastActivity < 24;
        }
      } catch (error) {
        console.error(`Erreur lecture session ${file}:`, error);
      }
    }
    
    return false;
  } catch (error) {
    console.error('Erreur vérification activité utilisateur:', error);
    return false;
  }
}

// Fonction pour déterminer le type de profil utilisateur
function getUserProfileType(user) {
  // Logique pour déterminer le type de profil
  // Par défaut, tous les utilisateurs sont "free"
  // On peut baser cela sur différents critères :
  
  // 1. Si l'utilisateur a un champ subscriptionType défini
  if (user.subscriptionType) {
    return user.subscriptionType;
  }
  
  // 2. Basé sur le nombre de candidatures (logique métier)
  const applications = countUserApplications(user.id);
  if (applications > 100) {
    return 'professionnel';
  } else if (applications > 20) {
    return 'premium';
  }
  
  // 3. Basé sur la date d'inscription (utilisateurs récents = free)
  const joinDate = new Date(user.createdAt);
  const now = new Date();
  const daysSinceJoin = (now - joinDate) / (1000 * 60 * 60 * 24);
  
  if (daysSinceJoin > 30) {
    return 'premium';
  }
  
  // 4. Par défaut
  return 'free';
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = parseInt(searchParams.get('offset')) || 0;
    
    // Récupérer tous les utilisateurs
    const allUsers = getAllUsers();
    
    // Appliquer la pagination
    const paginatedUsers = allUsers.slice(offset, offset + limit);
    
    // Enrichir les données utilisateur
    const enrichedUsers = paginatedUsers.map(user => {
      const applications = countUserApplications(user.id);
      const isActive = isUserActive(user);
      const profileType = getUserProfileType(user);
      
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        joinDate: user.createdAt,
        applications: applications,
        status: isActive ? 'Active' : 'Inactive',
        firstName: user.firstName,
        lastName: user.lastName,
        profileType: profileType,
        lastLogin: user.lastLogin || null
      };
    });
    
    // Calculer les statistiques globales
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(user => isUserActive(user)).length;
    const usersWithCV = allUsers.filter(user => user.documents && user.documents.length > 0).length;
    const totalApplications = allUsers.reduce((total, user) => total + countUserApplications(user.id), 0);
    
    // Statistiques par type de profil
    const profileTypeStats = {
      free: allUsers.filter(user => getUserProfileType(user) === 'free').length,
      premium: allUsers.filter(user => getUserProfileType(user) === 'premium').length,
      professionnel: allUsers.filter(user => getUserProfileType(user) === 'professionnel').length
    };
    
    return NextResponse.json({
      success: true,
      users: enrichedUsers,
      pagination: {
        total: totalUsers,
        limit: limit,
        offset: offset,
        hasMore: offset + limit < totalUsers
      },
      stats: {
        totalUsers,
        activeUsers,
        usersWithCV,
        totalApplications,
        profileTypeStats
      }
    });
    
  } catch (error) {
    console.error('Erreur API utilisateurs admin:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}