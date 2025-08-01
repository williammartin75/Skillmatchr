import { NextResponse } from 'next/server';

// Fonction pour analyser le CV avec Llama et extraire les compétences/expériences
async function analyzeCVWithLlama(cvText, extractedInfo) {
  try {
    console.log('🤖 Analyse CV avec données extraites...');
    console.log('📄 Données reçues:', extractedInfo);
    
    // Utiliser les vraies données extraites du CV
    const analysisResult = {
      skills: extractSkillsFromCV(cvText, extractedInfo),
      experiences: extractExperiencesFromCV(cvText, extractedInfo),
      education: extractEducationFromCV(cvText, extractedInfo),
      location: extractedInfo?.location || extractedInfo?.personalInfo?.location || 'France',
      contractPreferences: extractContractPreferences(cvText, extractedInfo),
      salaryRange: extractSalaryRange(cvText, extractedInfo),
      remotePreference: extractRemotePreference(cvText, extractedInfo),
      personalInfo: extractedInfo?.personalInfo || {}
    };
    
    console.log('✅ Analyse terminée:', analysisResult);
    return analysisResult;
  } catch (error) {
    console.error('❌ Erreur analyse:', error);
    return null;
  }
}

// Fonction pour extraire les compétences du CV
function extractSkillsFromCV(cvText, extractedInfo) {
  const skills = [];
  
  // Utiliser les compétences déjà extraites si disponibles
  if (extractedInfo?.skills && Array.isArray(extractedInfo.skills)) {
    skills.push(...extractedInfo.skills);
  }
  
  // Analyser le texte pour trouver des compétences supplémentaires
  if (cvText) {
    const technicalKeywords = [
      'Python', 'Django', 'Flask', 'FastAPI', 'JavaScript', 'TypeScript',
      'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'HTML', 'CSS',
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
      'AWS', 'Azure', 'GCP', 'Git', 'GitHub', 'CI/CD', 'Jenkins',
      'Java', 'Spring', 'C++', 'C#', '.NET', 'PHP', 'Laravel',
      'Ruby', 'Rails', 'Go', 'Rust', 'Swift', 'Kotlin', 'Android', 'iOS',
      'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
      'Ansible', 'Terraform', 'GraphQL', 'REST API', 'Microservices',
      'Agile', 'Scrum', 'DevOps', 'Linux', 'Windows', 'MacOS'
    ];
    
    const cvTextLower = cvText.toLowerCase();
    technicalKeywords.forEach(keyword => {
      if (cvTextLower.includes(keyword.toLowerCase()) && !skills.includes(keyword)) {
        skills.push(keyword);
      }
    });
  }
  
  return [...new Set(skills)]; // Éliminer les doublons
}

// Fonction pour extraire les expériences du CV
function extractExperiencesFromCV(cvText, extractedInfo) {
  const experiences = [];
  
  // Utiliser les expériences déjà extraites si disponibles
  if (extractedInfo?.experiences && Array.isArray(extractedInfo.experiences)) {
    extractedInfo.experiences.forEach((exp, index) => {
      experiences.push({
        title: exp.title || exp.position || '',
        company: exp.company || '',
        description: exp.description || '',
        duration: exp.duration || 1,
        yearsAgo: index,
        temporalWeight: Math.pow(0.9, index) // Plus récent = plus de poids
      });
    });
  } else if (cvText) {
    // Analyser le texte pour trouver des expériences
    const experiencePatterns = [
      /(\d{4})\s*-\s*(\d{4}|présent|actuel|aujourd'hui)\s*:?\s*([^-\n]+)\s*-?\s*([^\n]+)?/gi,
      /([A-Za-zÀ-ÿ\s]+)\s+(?:chez|at|@)\s+([A-Za-zÀ-ÿ\s]+)/gi,
      /Poste\s*:\s*([^\n]+)/gi,
      /Position\s*:\s*([^\n]+)/gi
    ];
    
    experiencePatterns.forEach(pattern => {
      const matches = cvText.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 3) {
          experiences.push({
            title: match[3] || match[1] || '',
            company: match[4] || match[2] || '',
            description: '',
            duration: 1,
            yearsAgo: experiences.length,
            temporalWeight: Math.pow(0.9, experiences.length)
          });
        }
      }
    });
  }
  
  return experiences.slice(0, 10); // Limiter à 10 expériences
}

// Fonction pour extraire l'éducation du CV
function extractEducationFromCV(cvText, extractedInfo) {
  const education = {};
  
  // Utiliser l'éducation déjà extraite si disponible
  if (extractedInfo?.education) {
    if (Array.isArray(extractedInfo.education) && extractedInfo.education.length > 0) {
      const edu = extractedInfo.education[0];
      education.degree = edu.degree || edu.title || '';
      education.institution = edu.institution || edu.school || '';
      education.year = edu.year || null;
      education.specialization = edu.specialization || edu.field || '';
    } else if (typeof extractedInfo.education === 'object') {
      education.degree = extractedInfo.education.degree || '';
      education.institution = extractedInfo.education.institution || '';
      education.year = extractedInfo.education.year || null;
      education.specialization = extractedInfo.education.specialization || '';
    }
  }
  
  // Si pas d'éducation trouvée, analyser le texte
  if (!education.degree && cvText) {
    const educationPatterns = [
      /(?:Master|Licence|Bachelor|BTS|DUT|Ingénieur|Doctorat|PhD)\s+(?:en\s+)?([A-Za-zÀ-ÿ\s]+)/gi,
      /Diplôme\s*:\s*([^\n]+)/gi,
      /Formation\s*:\s*([^\n]+)/gi
    ];
    
    for (const pattern of educationPatterns) {
      const match = pattern.exec(cvText);
      if (match) {
        education.degree = match[0] || '';
        education.specialization = match[1] || '';
        break;
      }
    }
  }
  
  return education;
}

// Fonction pour extraire les préférences de contrat
function extractContractPreferences(cvText, extractedInfo) {
  const preferences = ['CDI']; // Par défaut
  
  if (extractedInfo?.contractPreferences && Array.isArray(extractedInfo.contractPreferences)) {
    return extractedInfo.contractPreferences;
  }
  
  if (cvText) {
    const contractTypes = ['CDI', 'CDD', 'Freelance', 'Intérim', 'Stage', 'Alternance'];
    const cvTextLower = cvText.toLowerCase();
    
    contractTypes.forEach(type => {
      if (cvTextLower.includes(type.toLowerCase()) && !preferences.includes(type)) {
        preferences.push(type);
      }
    });
  }
  
  return preferences;
}

// Fonction pour extraire la fourchette salariale
function extractSalaryRange(cvText, extractedInfo) {
  if (extractedInfo?.salaryRange) {
    return extractedInfo.salaryRange;
  }
  
  if (cvText) {
    // Rechercher des montants en euros dans le texte
    const salaryPattern = /(\d{2,3})\s*(?:k|K|000)\s*(?:€|euros?)?/g;
    const matches = cvText.match(salaryPattern);
    
    if (matches && matches.length > 0) {
      const amounts = matches.map(m => parseInt(m.match(/\d+/)[0]));
      const min = Math.min(...amounts);
      const max = Math.max(...amounts);
      return `${min}k-${max}k€`;
    }
  }
  
  return '35k-60k€'; // Fourchette par défaut
}

// Fonction pour extraire la préférence de télétravail
function extractRemotePreference(cvText, extractedInfo) {
  if (extractedInfo?.remotePreference !== undefined) {
    return extractedInfo.remotePreference;
  }
  
  if (cvText) {
    const remoteKeywords = ['télétravail', 'remote', 'à distance', 'hybride', 'teletravail'];
    const cvTextLower = cvText.toLowerCase();
    
    return remoteKeywords.some(keyword => cvTextLower.includes(keyword));
  }
  
  return false;
}

// Fonction pour calculer les scores de matching avec les offres d'emploi
async function calculateJobMatches(cvAnalysis) {
  try {
    console.log('🎯 Calcul des scores de matching...');
    
    // D'abord récupérer le nombre total de jobs
    const firstResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3006'}/api/jobs?limit=1`);
    const firstData = await firstResponse.json();
    const totalJobs = firstData.pagination?.total || 0;
    
    console.log(`📊 Total de ${totalJobs} offres dans la base de données`);
    
    if (totalJobs === 0) {
      console.log('⚠️ Aucune offre d\'emploi trouvée');
      return [];
    }
    
    // Récupérer tous les jobs par lots de 100
    const allJobs = [];
    const batchSize = 100;
    const totalPages = Math.ceil(totalJobs / batchSize);
    
    for (let page = 1; page <= totalPages; page++) {
      console.log(`📥 Récupération lot ${page}/${totalPages}...`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3006'}/api/jobs?page=${page}&limit=${batchSize}`);
      const data = await response.json();
      
      if (data.jobs && data.jobs.length > 0) {
        allJobs.push(...data.jobs);
      }
    }
    
    console.log(`✅ ${allJobs.length} offres récupérées sur ${totalJobs} au total`);
    
    // Calculer le matching pour chaque job
    const matchedJobs = allJobs.map(job => {
      // Calcul du score de matching basé sur les compétences
      const matchingSkills = [];
      if (job.skills && cvAnalysis.skills) {
        job.skills.forEach(jobSkill => {
          cvAnalysis.skills.forEach(cvSkill => {
            if (jobSkill.toLowerCase().includes(cvSkill.toLowerCase()) || 
                cvSkill.toLowerCase().includes(jobSkill.toLowerCase())) {
              if (!matchingSkills.includes(jobSkill)) {
                matchingSkills.push(jobSkill);
              }
            }
          });
        });
      }
      
      const skillsScore = job.skills && job.skills.length > 0 
        ? (matchingSkills.length / job.skills.length) * 40 
        : 20; // Score par défaut si pas de skills requises
      
      // Calcul du score basé sur les expériences
      let experienceScore = 0;
      const jobTitle = job.title ? job.title.toLowerCase() : '';
      const jobDescription = job.description ? job.description.toLowerCase() : '';
      
      if (cvAnalysis.experiences) {
        cvAnalysis.experiences.forEach(exp => {
          const expTitle = exp.title ? exp.title.toLowerCase() : '';
          const expDescription = exp.description ? exp.description.toLowerCase() : '';
          
          // Correspondance exacte du titre
          if (jobTitle && expTitle && jobTitle.includes(expTitle)) {
            experienceScore += 25 * (exp.temporalWeight || 1);
          } 
          // Correspondance partielle du titre
          else if (jobTitle && expTitle) {
            const titleWords = expTitle.split(' ').filter(w => w.length > 3);
            const matchingWords = titleWords.filter(word => jobTitle.includes(word));
            if (matchingWords.length > 0) {
              experienceScore += (15 * matchingWords.length / titleWords.length) * (exp.temporalWeight || 1);
            }
          }
          
          // Vérifier dans la description du job
          if (jobDescription && expTitle && jobDescription.includes(expTitle)) {
            experienceScore += 10 * (exp.temporalWeight || 1);
          }
          
          // Vérifier les compétences de l'expérience dans le job
          if (expDescription && jobDescription) {
            const expWords = expDescription.split(' ').filter(w => w.length > 3);
            const matchingDescWords = expWords.filter(word => jobDescription.includes(word));
            if (matchingDescWords.length > 0) {
              experienceScore += (5 * matchingDescWords.length / expWords.length) * (exp.temporalWeight || 1);
            }
          }
        });
      }
      
      // Score de localisation amélioré
      let locationScore = 0;
      if (job.location && cvAnalysis.location) {
        const jobLocation = job.location.toLowerCase();
        const cvLocation = cvAnalysis.location.toLowerCase();
        
        if (jobLocation.includes(cvLocation) || cvLocation.includes(jobLocation)) {
          locationScore = 15;
        } else if (job.remote === true || job.remote === 'true' || 
                   (typeof job.remote === 'string' && job.remote.toLowerCase().includes('télétravail'))) {
          locationScore = 10; // Bonus pour télétravail
        } else {
          locationScore = 5;
        }
      }
      
      // Score de type de contrat
      let contractScore = 10; // Score par défaut
      if (job.type && cvAnalysis.contractPreferences) {
        const jobType = job.type.toLowerCase();
        const hasMatchingContract = cvAnalysis.contractPreferences.some(pref => 
          jobType.includes(pref.toLowerCase()) || pref.toLowerCase().includes(jobType)
        );
        contractScore = hasMatchingContract ? 15 : 5;
      }
      
      // Score de salaire
      let salaryScore = 5; // Score par défaut
      if (job.salary && cvAnalysis.salaryRange) {
        // Logique de comparaison de salaire à améliorer selon le format
        salaryScore = 10;
      }
      
      // Score final avec pondération ajustée
      const baseScore = skillsScore + experienceScore + locationScore + contractScore + salaryScore;
      
      // Limiter la variation aléatoire
      const randomVariation = Math.random() * 5 - 2.5;
      const matchPercentage = Math.max(0, Math.min(100, Math.round(baseScore + randomVariation)));
      
      return {
        ...job,
        matchPercentage: matchPercentage,
        matchingSkills: matchingSkills,
        matchingDetails: {
          skillsScore: Math.round(skillsScore),
          experienceScore: Math.round(experienceScore),
          locationScore: Math.round(locationScore),
          contractScore: Math.round(contractScore),
          salaryScore: Math.round(salaryScore)
        }
      };
    });
    
    // Trier par score de matching décroissant
    matchedJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    console.log('✅ Calcul des scores terminé');
    console.log(`📊 Top 5 matchs: ${matchedJobs.slice(0, 5).map(j => `${j.title} (${j.matchPercentage}%)`).join(', ')}`);
    
    return matchedJobs; // Retourner tous les jobs triés par score
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