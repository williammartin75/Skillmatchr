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
    createdAt: '2024-01-15T10:30:00Z',
    // Données du profil pour la candidature
    profile: {
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33 6 12 34 56 78',
      coverLetter: `Cher recruteur,

Je suis passionné par le développement web et j'ai une solide expérience en JavaScript, React et Node.js. Je suis convaincu que mes compétences en développement full-stack et ma capacité à travailler en équipe font de moi un candidat idéal pour ce poste.

Je suis particulièrement attiré par l'opportunité de contribuer à des projets innovants et de continuer à développer mes compétences techniques.

Je reste à votre disposition pour un entretien.

Cordialement,
Jean Dupont`
    }
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
    createdAt: '2024-01-10T14:20:00Z',
    profile: {
      name: 'Marie Martin',
      email: 'marie.martin@email.com',
      phone: '+33 6 98 76 54 32',
      coverLetter: `Madame, Monsieur,

Avec mon expérience en data science et machine learning, je suis enthousiaste à l'idée de rejoindre votre équipe. Mes compétences en Python, TensorFlow et analyse de données me permettent de contribuer efficacement à vos projets d'intelligence artificielle.

Je suis convaincue que ma passion pour l'innovation et ma capacité d'analyse peuvent apporter une réelle valeur ajoutée à votre organisation.

Je me tiens à votre disposition pour échanger sur cette opportunité.

Bien cordialement,
Marie Martin`
    }
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
    createdAt: '2024-01-05T09:15:00Z',
    profile: {
      name: 'Pierre Durand',
      email: 'pierre.durand@email.com',
      phone: '+33 6 11 22 33 44',
      coverLetter: `Cher recruteur,

Mon expertise en DevOps et infrastructure cloud me permet d'optimiser les processus de déploiement et d'assurer la fiabilité des systèmes. Avec mes compétences en Docker, Kubernetes et AWS, je peux contribuer à l'amélioration de votre infrastructure technique.

Je suis passionné par l'automatisation et l'optimisation des workflows de développement.

Je reste disponible pour discuter de cette opportunité.

Cordialement,
Pierre Durand`
    }
  }
];

export async function GET(request, { params }) {
  try {
    // Vérifier l'authentification (optionnel)
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //     return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    // }

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID de profil requis' }, { status: 400 });
    }

    // Rechercher le profil par ID
    const profile = mockProfiles.find(p => p.id === id);

    if (!profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    // Simuler un délai de chargement
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération du profil',
      details: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    // Vérifier l'authentification (optionnel)
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //     return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    // }

    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID de profil requis' }, { status: 400 });
    }

    // Rechercher le profil par ID
    const profileIndex = mockProfiles.findIndex(p => p.id === id);

    if (profileIndex === -1) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    // Mettre à jour le profil
    const updatedProfile = {
      ...mockProfiles[profileIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    mockProfiles[profileIndex] = updatedProfile;

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'Profil mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la mise à jour du profil',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // Vérifier l'authentification (optionnel)
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //     return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    // }

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID de profil requis' }, { status: 400 });
    }

    // Rechercher le profil par ID
    const profileIndex = mockProfiles.findIndex(p => p.id === id);

    if (profileIndex === -1) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    // Supprimer le profil
    const deletedProfile = mockProfiles.splice(profileIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'Profil supprimé avec succès',
      deletedProfile
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du profil:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression du profil',
      details: error.message 
    }, { status: 500 });
  }
} 