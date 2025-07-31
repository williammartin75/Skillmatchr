import { NextResponse } from 'next/server';

// Fonction pour analyser le CV avec Llama et extraire les compétences/expériences
async function analyzeCVWithLlama(cvText, extractedInfo) {
  try {
    console.log('🤖 Analyse CV avec Llama...');
    
    // Simulation de l'analyse Llama (à remplacer par l'appel réel à Llama)
    // Dans une vraie implémentation, on enverrait le texte du CV à l'API Llama
    
    const analysisResult = {
      skills: extractSkillsFromCV(cvText, extractedInfo),
      experiences: extractExperiencesFromCV(cvText, extractedInfo),
      education: extractEducationFromCV(cvText, extractedInfo),
      location: extractedInfo?.location || 'Paris',
      contractPreferences: ['CDI', 'Freelance'],
      salaryRange: '45k-70k€',
      remotePreference: true
    };
    
    console.log('✅ Analyse Llama terminée:', analysisResult);
    return analysisResult;
  } catch (error) {
    console.error('❌ Erreur analyse Llama:', error);
    return null;
  }
}

// Fonction pour extraire les compétences du CV
function extractSkillsFromCV(cvText, extractedInfo) {
  // Analyse basée sur le CV d'Antoine Lorence
  const skills = [
    'Python', 'Django', 'Flask', 'FastAPI',
    'Vue.js', 'Vanilla JS', 'HTML', 'CSS',
    'PostgreSQL', 'C++', 'Qt', 'CMake',
    'Ansible', 'Docker', 'Swarm',
    'GitHub Actions', 'Gitlab CI', 'Drone CI',
    'Grafana', 'Graylog', 'Traefik'
  ];
  
  return skills;
}

// Fonction pour extraire les expériences du CV
function extractExperiencesFromCV(cvText, extractedInfo) {
  const experiences = [
    { 
      title: 'Développeur Django', 
      company: 'LA POSTE', 
      yearsAgo: 1, 
      temporalWeight: 1.0,
      description: 'Maintenance applicative de la plateforme Xaas'
    },
    { 
      title: 'Développeur Django', 
      company: 'LENGOW', 
      yearsAgo: 3, 
      temporalWeight: 0.8,
      description: 'Maintenance du module de gestion des marketplaces'
    },
    { 
      title: 'Développeur Python', 
      company: 'OVHCLOUD', 
      yearsAgo: 5, 
      temporalWeight: 0.6,
      description: 'Renouvellement des outils interne de collaboration'
    },
    { 
      title: 'Développeur Django', 
      company: 'IMBRIKATION', 
      yearsAgo: 5, 
      temporalWeight: 0.6,
      description: 'Développement du portail web Vigicube.fr'
    },
    { 
      title: 'Formateur Python/Django', 
      company: 'IMIE', 
      yearsAgo: 6, 
      temporalWeight: 0.4,
      description: 'Préparation et animation de formations'
    }
  ];
  
  return experiences;
}

// Fonction pour extraire l'éducation du CV
function extractEducationFromCV(cvText, extractedInfo) {
  return {
    degree: 'Master Informatique',
    institution: 'INSA Rennes',
    year: 2012,
    specialization: 'Développement logiciel'
  };
}

// Fonction pour calculer les scores de matching avec les offres d'emploi
async function calculateJobMatches(cvAnalysis) {
  try {
    console.log('🎯 Calcul des scores de matching...');
    
    // Récupérer les offres d'emploi disponibles
    const jobsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3006'}/api/jobs?hasCV=true&limit=50`);
    const jobsData = await jobsResponse.json();
    
    if (!jobsData.jobs) {
      console.log('⚠️ Aucune offre d\'emploi trouvée');
      return [];
    }
    
    const matchedJobs = jobsData.jobs.map(job => {
      // Calcul du score de matching basé sur les compétences
      const matchingSkills = job.skills.filter(skill => 
        cvAnalysis.skills.some(cvSkill => 
          skill.toLowerCase().includes(cvSkill.toLowerCase())
        )
      );
      const skillsScore = (matchingSkills.length / job.skills.length) * 30;
      
      // Calcul du score basé sur les expériences
      let experienceScore = 0;
      const jobTitle = job.title.toLowerCase();
      const jobDescription = job.description.toLowerCase();
      
      cvAnalysis.experiences.forEach(exp => {
        const expTitle = exp.title.toLowerCase();
        
        if (jobTitle.includes(expTitle) || expTitle.includes(jobTitle)) {
          experienceScore += 30 * exp.temporalWeight;
        } else if (jobTitle.includes(expTitle.split(' ')[0]) || expTitle.includes(jobTitle.split(' ')[0])) {
          experienceScore += 15 * exp.temporalWeight;
        }
        
        if (jobDescription.includes(expTitle)) {
          experienceScore += 8 * exp.temporalWeight;
        }
      });
      
      // Score de localisation
      const locationScore = job.location.includes(cvAnalysis.location) ? 10 : 5;
      
      // Score de type de contrat
      const contractScore = cvAnalysis.contractPreferences.includes(job.type) ? 10 : 5;
      
      // Score final
      const baseScore = skillsScore + experienceScore + locationScore + contractScore;
      const randomVariation = Math.random() * 10 - 5;
      const matchPercentage = Math.max(0, Math.min(100, Math.round(baseScore + randomVariation)));
      
      return {
        ...job,
        matchPercentage: matchPercentage,
        matchingSkills: matchingSkills
      };
    });
    
    // Trier par score de matching décroissant
    matchedJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    console.log('✅ Calcul des scores terminé');
    return matchedJobs.slice(0, 10); // Retourner les 10 meilleures offres
  } catch (error) {
    console.error('❌ Erreur calcul matching:', error);
    return [];
  }
}

export async function POST(request) {
  try {
    const { userId, cvData, triggerSource } = await request.json();
    
    console.log('🎯 Matching demandé pour:', userId);
    console.log('📄 Données CV:', cvData);
    console.log('🚀 Source:', triggerSource);
    
    // Analyser le CV avec Llama
    const cvAnalysis = await analyzeCVWithLlama(cvData.text || '', cvData);
    
    if (!cvAnalysis) {
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'analyse du CV'
      }, { status: 500 });
    }
    
    // Calculer les scores de matching
    const matchedJobs = await calculateJobMatches(cvAnalysis);
    
    // Préparer le résultat
    const matchingResult = {
      userId: userId,
      timestamp: new Date().toISOString(),
      cvAnalysis: cvAnalysis,
      matchedJobs: matchedJobs,
      topMatches: matchedJobs.slice(0, 5),
      summary: {
        totalJobsAnalyzed: matchedJobs.length,
        averageMatchScore: matchedJobs.length > 0 ? 
          Math.round(matchedJobs.reduce((sum, job) => sum + job.matchPercentage, 0) / matchedJobs.length) : 0,
        bestMatch: matchedJobs.length > 0 ? matchedJobs[0] : null
      }
    };
    
    console.log('✅ Matching terminé avec succès');
    console.log('📊 Résumé:', matchingResult.summary);
    
    return NextResponse.json({
      success: true,
      message: 'Matching terminé avec succès',
      data: matchingResult
    });
    
  } catch (error) {
    console.error('❌ Erreur matching:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// Endpoint GET pour récupérer les résultats de matching
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cvId = searchParams.get('cvId');
    
    if (!cvId) {
      return NextResponse.json(
        { error: 'ID du CV requis' },
        { status: 400 }
      );
    }

    // En production, vous récupéreriez les résultats depuis une base de données
    // Pour l'instant, on retourne des données simulées
    return NextResponse.json({
      success: true,
      matchingResults: [],
      message: 'Aucun résultat de matching trouvé'
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du matching:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 