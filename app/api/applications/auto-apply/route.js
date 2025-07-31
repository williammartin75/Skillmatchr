import { NextResponse } from 'next/server';

// Mock des candidatures (à remplacer par une vraie base de données)
let applications = [];

export async function POST(request) {
  try {
    // Vérifier l'authentification (optionnel)
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //     return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    // }

    const body = await request.json();
    const { 
      jobId, 
      jobUrl, 
      jobTitle, 
      company, 
      location, 
      type, 
      profileId, 
      userId 
    } = body;

    // Validation des données requises
    if (!jobId || !jobTitle || !company || !profileId || !userId) {
      return NextResponse.json({ 
        error: 'Données de candidature incomplètes',
        required: ['jobId', 'jobTitle', 'company', 'profileId', 'userId']
      }, { status: 400 });
    }

    // Vérifier si la candidature existe déjà
    const existingApplication = applications.find(app => 
      app.jobId === jobId && app.userId === userId
    );

    if (existingApplication) {
      return NextResponse.json({ 
        error: 'Candidature déjà envoyée pour cette offre',
        application: existingApplication
      }, { status: 409 });
    }

    // Créer la nouvelle candidature
    const newApplication = {
      id: `app-${Date.now()}`,
      jobId,
      jobUrl,
      jobTitle,
      company,
      location,
      type,
      profileId,
      userId,
      status: 'pending', // pending, sent, accepted, rejected
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Informations supplémentaires
      metadata: {
        source: 'extension',
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        timestamp: new Date().toISOString()
      }
    };

    // Ajouter à la liste des candidatures
    applications.push(newApplication);

    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simuler un succès de candidature
    newApplication.status = 'sent';
    newApplication.updatedAt = new Date().toISOString();

    console.log('✅ Candidature automatique créée:', {
      id: newApplication.id,
      jobTitle: newApplication.jobTitle,
      company: newApplication.company,
      userId: newApplication.userId
    });

    return NextResponse.json({
      success: true,
      message: 'Candidature envoyée avec succès',
      application: newApplication,
      // Informations pour l'extension
      extension: {
        nextSteps: [
          'Vérifiez votre email pour une confirmation',
          'Suivez le statut de votre candidature dans votre dashboard',
          'Préparez-vous pour un éventuel entretien'
        ],
        estimatedResponseTime: '2-5 jours ouvrables'
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la candidature automatique:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la candidature automatique',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // Vérifier l'authentification (optionnel)
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //     return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 });
    }

    // Filtrer les candidatures par utilisateur et statut
    let userApplications = applications.filter(app => app.userId === userId);
    
    if (status) {
      userApplications = userApplications.filter(app => app.status === status);
    }

    // Trier par date de candidature (plus récent en premier)
    userApplications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    return NextResponse.json({
      success: true,
      applications: userApplications,
      total: userApplications.length,
      stats: {
        pending: userApplications.filter(app => app.status === 'pending').length,
        sent: userApplications.filter(app => app.status === 'sent').length,
        accepted: userApplications.filter(app => app.status === 'accepted').length,
        rejected: userApplications.filter(app => app.status === 'rejected').length
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des candidatures:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des candidatures',
      details: error.message 
    }, { status: 500 });
  }
} 