const fs = require('fs');

// Fonction pour tester l'API de matching
async function testMatchingAPI() {
  console.log('🧪 Test de l\'API de matching CV avec toutes les offres...\n');
  
  try {
    // D'abord, récupérer le nombre total d'offres dans la base
    console.log('📊 Étape 1: Vérification du nombre total d\'offres...');
    const jobsResponse = await fetch('http://localhost:3000/api/jobs?limit=1');
    const jobsData = await jobsResponse.json();
    const totalJobs = jobsData.pagination?.total || 0;
    console.log(`✅ Total d'offres dans la base: ${totalJobs}\n`);
    
    // Préparer les données de test pour le matching
    const testCVData = {
      text: `Antoine LORENCE
Développeur Full Stack

EXPÉRIENCES:
- Développeur Django chez LA POSTE (2023-2024)
  Maintenance applicative de la plateforme Xaas
  Technologies: Python, Django, PostgreSQL, Docker

- Développeur Django chez LENGOW (2021-2023)  
  Maintenance du module de gestion des marketplaces
  Technologies: Python, Django, API REST, Redis

- Développeur Python chez OVHCLOUD (2019-2021)
  Renouvellement des outils internes de collaboration
  Technologies: Python, Flask, MongoDB, Kubernetes

COMPÉTENCES:
- Langages: Python, JavaScript, TypeScript, C++
- Frameworks: Django, Flask, FastAPI, Vue.js, React
- Bases de données: PostgreSQL, MySQL, MongoDB, Redis
- DevOps: Docker, Kubernetes, Ansible, CI/CD
- Cloud: AWS, GCP

FORMATION:
Master en Informatique - INSA Rennes (2012)

LANGUES:
- Français: Langue maternelle
- Anglais: Courant

CONTACT:
Email: antoine.lorence@example.com
Téléphone: 06 12 34 56 78
Localisation: Paris`,
      personalInfo: {
        firstName: 'Antoine',
        lastName: 'Lorence',
        email: 'antoine.lorence@example.com',
        phone: '0612345678',
        location: 'Paris'
      },
      skills: ['Python', 'Django', 'Flask', 'FastAPI', 'JavaScript', 'Vue.js', 'PostgreSQL', 'Docker', 'Kubernetes'],
      experiences: [
        {
          title: 'Développeur Django',
          company: 'LA POSTE',
          description: 'Maintenance applicative de la plateforme Xaas',
          duration: 1
        },
        {
          title: 'Développeur Django',
          company: 'LENGOW',
          description: 'Maintenance du module de gestion des marketplaces',
          duration: 2
        },
        {
          title: 'Développeur Python',
          company: 'OVHCLOUD',
          description: 'Renouvellement des outils internes de collaboration',
          duration: 2
        }
      ]
    };
    
    // Appeler l'API de matching
    console.log('🎯 Étape 2: Appel de l\'API de matching...');
    const startTime = Date.now();
    
    const matchingResponse = await fetch('http://localhost:3000/api/matching', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-123',
        cvData: testCVData,
        triggerSource: 'test'
      })
    });
    
    const matchingResult = await matchingResponse.json();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Matching terminé en ${duration}ms\n`);
    
    // Analyser les résultats
    console.log('📈 Étape 3: Analyse des résultats...');
    
    if (matchingResult.success) {
      const matchedJobsCount = matchingResult.data?.matchedJobs?.length || 0;
      console.log(`✅ Nombre d'offres analysées: ${matchedJobsCount}`);
      console.log(`📊 Pourcentage d'offres analysées: ${((matchedJobsCount / totalJobs) * 100).toFixed(2)}%`);
      
      if (matchedJobsCount < totalJobs) {
        console.log(`⚠️  ATTENTION: Seulement ${matchedJobsCount} offres sur ${totalJobs} ont été analysées!`);
        console.log('   L\'API devrait analyser TOUTES les offres de la base de données.');
      } else {
        console.log('✅ SUCCÈS: Toutes les offres de la base ont été analysées!');
      }
      
      // Afficher les top 10 matchs
      console.log('\n🏆 Top 10 des meilleures correspondances:');
      const topMatches = matchingResult.data?.matchedJobs?.slice(0, 10) || [];
      topMatches.forEach((job, index) => {
        console.log(`${index + 1}. ${job.title} chez ${job.company} (${job.location})`);
        console.log(`   Score: ${job.matchPercentage}%`);
        console.log(`   Compétences matchées: ${job.matchingSkills?.join(', ') || 'N/A'}`);
        if (job.matchingDetails) {
          console.log(`   Détails: Skills=${job.matchingDetails.skillsScore}%, ` +
                     `Exp=${job.matchingDetails.experienceScore}%, ` +
                     `Loc=${job.matchingDetails.locationScore}%`);
        }
        console.log('');
      });
      
      // Vérifier la cohérence des résultats
      console.log('🔍 Étape 4: Vérification de la cohérence...');
      
      // Vérifier que les offres Python/Django sont bien classées
      const pythonDjangoJobs = topMatches.filter(job => 
        job.title.toLowerCase().includes('python') || 
        job.title.toLowerCase().includes('django') ||
        job.description?.toLowerCase().includes('python') ||
        job.description?.toLowerCase().includes('django')
      );
      
      console.log(`✅ ${pythonDjangoJobs.length} offres Python/Django dans le top 10`);
      
      if (pythonDjangoJobs.length < 3) {
        console.log('⚠️  Peu d\'offres Python/Django dans le top 10, vérifier l\'algorithme de matching');
      }
      
      // Statistiques globales
      const avgScore = matchingResult.data?.summary?.averageMatchScore || 0;
      console.log(`\n📊 Score moyen de matching: ${avgScore}%`);
      
      if (avgScore < 30) {
        console.log('⚠️  Le score moyen est faible, l\'algorithme pourrait être amélioré');
      }
      
    } else {
      console.error('❌ Erreur lors du matching:', matchingResult.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Lancer le test
console.log('🚀 Démarrage du test de l\'API de matching...\n');
testMatchingAPI();