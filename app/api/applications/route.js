import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Fonction pour créer le dossier applications s'il n'existe pas
function ensureApplicationsDirectory() {
  const applicationsDir = path.join(process.cwd(), 'data', 'applications');
  if (!fs.existsSync(applicationsDir)) {
    fs.mkdirSync(applicationsDir, { recursive: true });
  }
  return applicationsDir;
}

// Fonction pour sauvegarder une candidature
function saveApplication(application) {
  try {
    const applicationsDir = ensureApplicationsDirectory();
    const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const applicationPath = path.join(applicationsDir, `${applicationId}.json`);
    
    const applicationData = {
      id: applicationId,
      ...application,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(applicationPath, JSON.stringify(applicationData, null, 2));
    return applicationData;
  } catch (error) {
    console.error('Erreur sauvegarde candidature:', error);
    return null;
  }
}

// Fonction pour récupérer toutes les candidatures d'un utilisateur
function getUserApplications(userId) {
  try {
    const applicationsDir = ensureApplicationsDirectory();
    if (!fs.existsSync(applicationsDir)) {
      return [];
    }
    
    const applicationFiles = fs.readdirSync(applicationsDir).filter(file => file.endsWith('.json'));
    const applications = [];
    
    for (const file of applicationFiles) {
      try {
        const appData = fs.readFileSync(path.join(applicationsDir, file), 'utf8');
        const application = JSON.parse(appData);
        
        if (application.userId === userId) {
          applications.push(application);
        }
      } catch (error) {
        console.error(`Erreur lecture candidature ${file}:`, error);
      }
    }
    
    // Trier par date de création (plus récentes en premier)
    return applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Erreur récupération candidatures:', error);
    return [];
  }
}

// Fonction pour récupérer toutes les candidatures
function getAllApplications() {
  try {
    const applicationsDir = ensureApplicationsDirectory();
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
    
    // Trier par date de création (plus récentes en premier)
    return applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Erreur récupération candidatures:', error);
    return [];
  }
}

export async function POST(request) {
  try {
    const application = await request.json();
    
    // Validation des champs obligatoires
    if (!application.userId || !application.jobId || !application.jobTitle || !application.company) {
      return NextResponse.json({
        success: false,
        error: 'Champs obligatoires manquants'
      }, { status: 400 });
    }
    
    // Sauvegarder la candidature
    const savedApplication = saveApplication(application);
    
    if (savedApplication) {
      return NextResponse.json({
        success: true,
        application: savedApplication
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la sauvegarde'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erreur API candidatures POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    
    let applications;
    
    if (userId) {
      // Récupérer les candidatures d'un utilisateur spécifique
      applications = getUserApplications(userId);
    } else {
      // Récupérer toutes les candidatures
      applications = getAllApplications();
    }
    
    // Appliquer la pagination
    const paginatedApplications = applications.slice(offset, offset + limit);
    
    return NextResponse.json({
      success: true,
      applications: paginatedApplications,
      pagination: {
        total: applications.length,
        limit: limit,
        offset: offset,
        hasMore: offset + limit < applications.length
      }
    });
    
  } catch (error) {
    console.error('Erreur API candidatures GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}