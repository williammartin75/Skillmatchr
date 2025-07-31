import { NextResponse } from 'next/server';

// Mock des profils utilisateur (à remplacer par une vraie base de données)
const mockProfiles = [
  {
    id: 'profile-1',
    name: 'Profil Développeur Full-Stack',
    cvName: 'CV_Developpeur_FullStack.pdf',
    coverLetterName: 'LM_Developpeur_FullStack.pdf',
    skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
    experience: '3-5 ans',
    location: 'Paris, France',
    contractType: 'CDI',
    salary: '45k-60k',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'profile-2',
    name: 'Profil Data Scientist',
    cvName: 'CV_DataScientist.pdf',
    coverLetterName: 'LM_DataScientist.pdf',
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Pandas'],
    experience: '2-4 ans',
    location: 'Lyon, France',
    contractType: 'CDI',
    salary: '50k-70k',
    createdAt: '2024-01-10T14:20:00Z'
  },
  {
    id: 'profile-3',
    name: 'Profil DevOps Engineer',
    cvName: 'CV_DevOps.pdf',
    coverLetterName: 'LM_DevOps.pdf',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins'],
    experience: '4-6 ans',
    location: 'Marseille, France',
    contractType: 'CDI',
    salary: '55k-75k',
    createdAt: '2024-01-05T09:15:00Z'
  }
];

export async function GET(request) {
  try {
    // Vérifier l'authentification (optionnel)
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //     return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    // }

    // Récupérer l'ID utilisateur depuis les paramètres de requête
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 });
    }

    // Simuler un délai de chargement
    await new Promise(resolve => setTimeout(resolve, 500));

    // Retourner les profils de l'utilisateur
    return NextResponse.json(mockProfiles);

  } catch (error) {
    console.error('Erreur lors de la récupération des profils:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des profils',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Vérifier l'authentification (optionnel)
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //     return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    // }

    const body = await request.json();
    const { name, cvName, coverLetterName, skills, experience, location, contractType, salary } = body;

    // Validation des données
    if (!name || !cvName) {
      return NextResponse.json({ error: 'Nom et CV requis' }, { status: 400 });
    }

    // Créer un nouveau profil
    const newProfile = {
      id: `profile-${Date.now()}`,
      name,
      cvName,
      coverLetterName: coverLetterName || null,
      skills: skills || [],
      experience: experience || null,
      location: location || null,
      contractType: contractType || null,
      salary: salary || null,
      createdAt: new Date().toISOString()
    };

    // Ajouter le profil à la liste (dans un vrai projet, sauvegarder en base)
    mockProfiles.push(newProfile);

    return NextResponse.json({
      success: true,
      profile: newProfile,
      message: 'Profil créé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la création du profil:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la création du profil',
      details: error.message 
    }, { status: 500 });
  }
} 