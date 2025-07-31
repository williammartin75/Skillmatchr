import { NextResponse } from 'next/server';

// Mock des offres sauvegardées (à remplacer par une vraie base de données)
let savedJobs = [];

export async function POST(request) {
  try {
    // Vérifier l'authentification (optionnel)
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //     return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    // }

    const body = await request.json();
    const { 
      id, 
      url, 
      title, 
      company, 
      location, 
      type, 
      description, 
      requirements, 
      salary, 
      contractType,
      userId,
      savedAt 
    } = body;

    // Validation des données requises
    if (!id || !title || !company || !userId) {
      return NextResponse.json({ 
        error: 'Données d\'offre incomplètes',
        required: ['id', 'title', 'company', 'userId']
      }, { status: 400 });
    }

    // Vérifier si l'offre est déjà sauvegardée
    const existingJob = savedJobs.find(job => 
      job.id === id && job.userId === userId
    );

    if (existingJob) {
      return NextResponse.json({ 
        error: 'Offre déjà sauvegardée',
        job: existingJob
      }, { status: 409 });
    }

    // Créer la nouvelle offre sauvegardée
    const newSavedJob = {
      id: `saved-${Date.now()}`,
      jobId: id,
      url,
      title,
      company,
      location: location || 'Non spécifié',
      type: type || 'Non spécifié',
      description: description || '',
      requirements: requirements || '',
      salary: salary || 'Non spécifié',
      contractType: contractType || 'Non spécifié',
      userId,
      status: 'saved', // saved, applied, interested, not_interested
      savedAt: savedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Informations supplémentaires
      metadata: {
        source: 'extension',
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        timestamp: new Date().toISOString()
      }
    };

    // Ajouter à la liste des offres sauvegardées
    savedJobs.push(newSavedJob);

    console.log('💾 Offre sauvegardée:', {
      id: newSavedJob.id,
      title: newSavedJob.title,
      company: newSavedJob.company,
      userId: newSavedJob.userId
    });

    return NextResponse.json({
      success: true,
      message: 'Offre sauvegardée avec succès',
      job: newSavedJob
    });

  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de l\'offre:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la sauvegarde de l\'offre',
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

    // Filtrer les offres par utilisateur et statut
    let userSavedJobs = savedJobs.filter(job => job.userId === userId);
    
    if (status) {
      userSavedJobs = userSavedJobs.filter(job => job.status === status);
    }

    // Trier par date de sauvegarde (plus récent en premier)
    userSavedJobs.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

    return NextResponse.json({
      success: true,
      jobs: userSavedJobs,
      total: userSavedJobs.length,
      stats: {
        saved: userSavedJobs.filter(job => job.status === 'saved').length,
        applied: userSavedJobs.filter(job => job.status === 'applied').length,
        interested: userSavedJobs.filter(job => job.status === 'interested').length,
        not_interested: userSavedJobs.filter(job => job.status === 'not_interested').length
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des offres sauvegardées:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des offres sauvegardées',
      details: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    // Vérifier l'authentification (optionnel)
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //     return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    // }

    const body = await request.json();
    const { id, status, userId } = body;

    if (!id || !status || !userId) {
      return NextResponse.json({ 
        error: 'ID, statut et ID utilisateur requis' 
      }, { status: 400 });
    }

    // Rechercher l'offre sauvegardée
    const jobIndex = savedJobs.findIndex(job => 
      job.id === id && job.userId === userId
    );

    if (jobIndex === -1) {
      return NextResponse.json({ error: 'Offre sauvegardée non trouvée' }, { status: 404 });
    }

    // Mettre à jour le statut
    savedJobs[jobIndex].status = status;
    savedJobs[jobIndex].updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: 'Statut de l\'offre mis à jour avec succès',
      job: savedJobs[jobIndex]
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du statut:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la mise à jour du statut',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    // Vérifier l'authentification (optionnel)
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //     return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ 
        error: 'ID et ID utilisateur requis' 
      }, { status: 400 });
    }

    // Rechercher l'offre sauvegardée
    const jobIndex = savedJobs.findIndex(job => 
      job.id === id && job.userId === userId
    );

    if (jobIndex === -1) {
      return NextResponse.json({ error: 'Offre sauvegardée non trouvée' }, { status: 404 });
    }

    // Supprimer l'offre
    const deletedJob = savedJobs.splice(jobIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'Offre supprimée avec succès',
      deletedJob
    });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression de l\'offre:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression de l\'offre',
      details: error.message 
    }, { status: 500 });
  }
} 