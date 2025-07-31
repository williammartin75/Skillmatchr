import { NextResponse } from 'next/server';
import { findCityByName, getCitiesInRadius } from '../../data/french-cities-api';
import { Pool } from 'pg';

// Configuration de la base de données unifiée
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'jobs_database',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  ssl: false,
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 6;
  const location = searchParams.get('location') || '';
  const radius = parseInt(searchParams.get('radius')) || 0;
  const searchQuery = searchParams.get('searchQuery') || '';
  const contractType = searchParams.get('contractType') || '';
  const minSalary = searchParams.get('minSalary') || '';
  const skills = searchParams.get('skills') || '';
  const remoteOnly = searchParams.get('remoteOnly') === 'true';
  const newJobsOnly = searchParams.get('newJobsOnly') === 'true';
  const source = searchParams.get('source') || '';
  const publicationDate = searchParams.get('publicationDate') || '';
  const hasCV = searchParams.get('hasCV') === 'true';
  const userId = searchParams.get('userId');

  console.log('🔍 API Debug - Connexion PostgreSQL pour récupérer les offres unifiées');
  console.log('🔍 API Debug - Paramètres:', { page, limit, location, radius, searchQuery, contractType, minSalary, skills, remoteOnly, newJobsOnly, source, hasCV, userId });

  try {
    // Construction de la requête SQL pour la base unifiée
    let query = `
      SELECT 
        id,
        original_id,
        title,
        company,
        location,
        description,
        salary,
        contract_type,
        source,
        url,
        source_url,
        posted_date,
        published_at,
        remote,
        skills,
        tags,
        created_at,
        updated_at
      FROM jobs 
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;

    // Filtrage par recherche textuelle
    if (searchQuery) {
      query += ` AND (
        LOWER(title) LIKE LOWER($${paramIndex}) OR 
        LOWER(company) LIKE LOWER($${paramIndex}) OR 
        LOWER(description) LIKE LOWER($${paramIndex}) OR
        LOWER(location) LIKE LOWER($${paramIndex})
      )`;
      queryParams.push(`%${searchQuery}%`);
      paramIndex++;
    }

    // Filtrage par localisation avec rayon
    if (location) {
      console.log(`📍 Recherche pour localisation: "${location}" avec rayon: ${radius} km`);
      
      const selectedCity = await findCityByName(location);
      console.log(`🏙️ Ville trouvée:`, selectedCity);
      
      if (selectedCity && radius > 0) {
        // Si on a une ville et un rayon, chercher dans le périmètre
        const citiesInRadius = await getCitiesInRadius(selectedCity, Math.abs(radius));
        console.log(`🎯 ${citiesInRadius.length} villes trouvées dans un rayon de ${radius} km`);
        
        if (citiesInRadius.length > 0) {
          const cityNames = citiesInRadius.map(city => city.nom);
          console.log(`🏘️ Villes dans le rayon:`, cityNames);
          
          const placeholders = cityNames.map(() => `$${paramIndex++}`).join(',');
          query += ` AND LOWER(location) IN (${placeholders})`;
          queryParams.push(...cityNames.map(city => city.toLowerCase()));
        }
      } else if (location) {
        // Sinon, chercher par correspondance exacte
        console.log(`🔍 Recherche exacte pour: "${location}"`);
        query += ` AND LOWER(location) LIKE LOWER($${paramIndex})`;
        queryParams.push(`%${location}%`);
        paramIndex++;
      }
    }

    // Filtrage par type de contrat
    if (contractType) {
      query += ` AND LOWER(contract_type) LIKE LOWER($${paramIndex})`;
      queryParams.push(`%${contractType}%`);
      paramIndex++;
    }

    // Filtrage par salaire minimum
    if (minSalary) {
      const minSalaryNum = parseInt(minSalary.replace('k', '000'));
      query += ` AND CAST(REPLACE(REPLACE(salary, 'k', '000'), '-', '') AS INTEGER) >= $${paramIndex}`;
      queryParams.push(minSalaryNum);
      paramIndex++;
    }

    // Filtrage par compétences
    if (skills) {
      const skillsArray = skills.toLowerCase().split(',').map(s => s.trim());
      const skillConditions = skillsArray.map(() => `LOWER(tags) LIKE LOWER($${paramIndex++})`).join(' OR ');
      query += ` AND (${skillConditions})`;
      queryParams.push(...skillsArray.map(skill => `%${skill}%`));
    }

    // Filtrage télétravail uniquement
    if (remoteOnly) {
      query += ` AND remote IS NOT NULL AND remote != 'Non précisé' AND remote != 'Pas de télétravail'`;
    }

    // Filtrage nouvelles offres (7 derniers jours)
    if (newJobsOnly) {
      query += ` AND published_at >= NOW() - INTERVAL '7 days'`;
    }

    // Filtrage par source
    if (source) {
      query += ` AND LOWER(source) = LOWER($${paramIndex})`;
      queryParams.push(source);
      paramIndex++;
    }

    // Filtrage par date de publication
    if (publicationDate) {
      let dateFilter = '';
      switch (publicationDate) {
        case '24h':
          dateFilter = ` AND published_at >= NOW() - INTERVAL '24 hours'`;
          break;
        case '48h':
          dateFilter = ` AND published_at >= NOW() - INTERVAL '48 hours'`;
          break;
        case '1week':
          dateFilter = ` AND published_at >= NOW() - INTERVAL '1 week'`;
          break;
        case '1month':
          dateFilter = ` AND published_at >= NOW() - INTERVAL '1 month'`;
          break;
        case '3months':
          dateFilter = ` AND published_at >= NOW() - INTERVAL '3 months'`;
          break;
        case '3months+':
          dateFilter = ` AND published_at < NOW() - INTERVAL '3 months'`;
          break;
      }
      if (dateFilter) {
        query += dateFilter;
      }
    }

    // Tri par date de publication (plus récent en premier)
    query += ` ORDER BY published_at DESC`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    console.log('🔍 API Debug - Requête SQL unifiée:', query);
    console.log('🔍 API Debug - Paramètres:', queryParams);

    // Exécution de la requête
    const result = await pool.query(query, queryParams);
    
    let jobs = result.rows;
    console.log(`🔍 API Debug - ${jobs.length} offres récupérées de la base unifiée`);

    // Traitement des données récupérées
    jobs = jobs.map(job => {
      // Gérer les compétences selon le format (string ou JSON)
      let skills = [];
      if (job.skills) {
        if (typeof job.skills === 'string') {
          skills = job.skills.split(',').map(s => s.trim());
        } else if (Array.isArray(job.skills)) {
          skills = job.skills;
        } else {
          try {
            skills = JSON.parse(job.skills);
          } catch (e) {
            skills = [];
          }
        }
      }
      
      // Formater la date (28/07/2025 au lieu de 2025-07-28T13:34:55.636Z)
      let formattedDate = 'Date non spécifiée';
      if (job.published_at) {
        try {
          const date = new Date(job.published_at);
          formattedDate = date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        } catch (e) {
          formattedDate = 'Date non spécifiée';
        }
      }
      
      // Formater le salaire
      let formattedSalary = job.salary || 'Non spécifié';
      if (job.salary) {
        if (typeof job.salary === 'string') {
          // Remplacer ">=" par "≥" et "<=" par "≤"
          formattedSalary = job.salary
            .replace(/>=/g, '≥')
            .replace(/<=/g, '≤')
            .replace(/>/g, '>')
            .replace(/</g, '<');
        }
      }
      
      return {
        id: job.id,
        originalId: job.original_id,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        salary: formattedSalary,
        type: job.contract_type || 'Non spécifié',
        source: job.source,
        url: job.url || job.source_url,
        postedDate: formattedDate,
        remote: job.remote || false,
        skills: skills,
        createdAt: job.created_at,
        updatedAt: job.updated_at
      };
    });

    // Ajouter le pourcentage de matching si un CV est disponible
    if (hasCV && userId) {
      const matchingStartTime = Date.now();
      console.log('🔍 API Debug - Matching CV activé pour les offres unifiées');
      console.log(`⏱️ Début du matching CV - ${jobs.length} offres à traiter`);
      
              // Récupérer les données du CV de l'utilisateur via l'API
      try {
        const cvResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/user/cv?userId=${userId}`);
        const cvData = await cvResponse.json();
        
        if (cvData.success && cvData.hasCV) {
          console.log('🔍 API Debug - CV trouvé pour l\'utilisateur:', userId);
          
          // Extraire les données du CV depuis l'analyse
          const cvAnalysis = cvData.cvData.extractedInfo;
          
          // Adapter les données pour le matching
          global.cvData = {
            experiences: cvAnalysis.experiences || [],
            education: cvAnalysis.education ? [cvAnalysis.education] : [], // Prendre seulement la dernière formation
            skills: cvAnalysis.skills || []
          };
          
          console.log('🔍 API Debug - Données CV adaptées:', {
            experiencesCount: global.cvData.experiences.length,
            educationCount: global.cvData.education.length,
            skillsCount: global.cvData.skills.length
          });
        } else {
          console.log('⚠️ Aucun CV trouvé pour l\'utilisateur ID:', userId);
          // Créer des données CV de test pour démonstration - Développeur Full Stack
          global.cvData = {
            experiences: [
              {
                title: "Développeur Full Stack Senior",
                description: "Développement d'applications web complexes avec React, Node.js, TypeScript, PostgreSQL, Docker et AWS. Gestion d'équipe de 5 développeurs, architecture microservices, CI/CD avec GitHub Actions",
                duration: 4
              },
              {
                title: "Développeur Full Stack",
                description: "Création d'applications web avec React, Node.js, Express, MongoDB, Redis. Développement d'APIs REST et GraphQL, intégration de services tiers, optimisation des performances",
                duration: 3
              },
              {
                title: "Développeur Frontend",
                description: "Développement d'interfaces utilisateur modernes avec React, Vue.js, JavaScript ES6+, CSS3, SASS. Responsive design, tests unitaires avec Jest, intégration avec APIs REST",
                duration: 2
              },
              {
                title: "Développeur Backend",
                description: "Développement d'APIs avec Node.js, Express, PostgreSQL, Redis. Architecture de bases de données, sécurité, authentification JWT, documentation API avec Swagger",
                duration: 2
              }
            ],
            education: [
              {
                title: "Master en Informatique - Spécialisation Développement Web",
                description: "Formation complète en développement web moderne, architectures distribuées, bases de données avancées, sécurité informatique et méthodologies agiles"
              },
              {
                title: "Certification AWS Solutions Architect",
                description: "Maîtrise des services cloud AWS, déploiement d'applications, architecture scalable, sécurité et optimisation des coûts"
              }
            ],
            skills: [
              "JavaScript", "TypeScript", "React", "Node.js", "Express", "PostgreSQL", 
              "MongoDB", "Redis", "Docker", "AWS", "Git", "GitHub Actions", "REST API", 
              "GraphQL", "Jest", "JWT", "OAuth", "Microservices", "CI/CD"
            ]
          };
        }
      } catch (error) {
        console.error('❌ Erreur récupération CV utilisateur:', error);
        // Créer des données CV de test pour démonstration - Développeur Full Stack
        global.cvData = {
          experiences: [
            {
              title: "Développeur Full Stack Senior",
              description: "Développement d'applications web complexes avec React, Node.js, TypeScript, PostgreSQL, Docker et AWS. Gestion d'équipe de 5 développeurs, architecture microservices, CI/CD avec GitHub Actions",
              duration: 4
            },
              {
                title: "Développeur Full Stack",
                description: "Création d'applications web avec React, Node.js, Express, MongoDB, Redis. Développement d'APIs REST et GraphQL, intégration de services tiers, optimisation des performances",
                duration: 3
              },
              {
                title: "Développeur Frontend",
                description: "Développement d'interfaces utilisateur modernes avec React, Vue.js, JavaScript ES6+, CSS3, SASS. Responsive design, tests unitaires avec Jest, intégration avec APIs REST",
                duration: 2
              },
              {
                title: "Développeur Backend",
                description: "Développement d'APIs avec Node.js, Express, PostgreSQL, Redis. Architecture de bases de données, sécurité, authentification JWT, documentation API avec Swagger",
                duration: 2
              }
            ],
            education: [
              {
                title: "Master en Informatique - Spécialisation Développement Web",
                description: "Formation complète en développement web moderne, architectures distribuées, bases de données avancées, sécurité informatique et méthodologies agiles"
              },
              {
                title: "Certification AWS Solutions Architect",
                description: "Maîtrise des services cloud AWS, déploiement d'applications, architecture scalable, sécurité et optimisation des coûts"
              }
            ],
            skills: [
              "JavaScript", "TypeScript", "React", "Node.js", "Express", "PostgreSQL", 
              "MongoDB", "Redis", "Docker", "AWS", "Git", "GitHub Actions", "REST API", 
              "GraphQL", "Jest", "JWT", "OAuth", "Microservices", "CI/CD"
            ]
          };
        }
      
      jobs = jobs.map(job => {
        // Calcul du score de matching simplifié avec pondération expériences/formation (70/30)
        
        // === SCORE EXPÉRIENCES (70% du total) ===
        let experienceScore = 0;
        
        if (global.cvData && global.cvData.experiences && Array.isArray(global.cvData.experiences)) {
          const totalExperienceWeight = 70; // 70% du score total
          let totalWeightedScore = 0;
          let totalWeight = 0;
          
          global.cvData.experiences.forEach((exp, index) => {
            // Pondération par ancienneté (les plus récentes ont plus de poids)
            const recencyWeight = Math.pow(0.8, index); // Décroissance exponentielle
            
            // Pondération par durée (les plus longues ont plus de poids) - AUGMENTÉE
            const duration = exp.duration || 1; // en années
            const durationWeight = Math.min(duration / 1.5, 2.5); // Max 2.5x pour les expériences longues
            
            // Score de pertinence basique
            const relevanceScore = calculateBasicRelevance(exp, job);
            
            // Score pondéré pour cette expérience
            const weightedScore = relevanceScore * recencyWeight * durationWeight;
            const weight = recencyWeight * durationWeight;
            
            totalWeightedScore += weightedScore * weight;
            totalWeight += weight;
          });
          
          if (totalWeight > 0) {
            experienceScore = (totalWeightedScore / totalWeight) * totalExperienceWeight;
          }
        }
        
        // === SCORE FORMATION (30% du total) ===
        let educationScore = 0;
        
        if (global.cvData && global.cvData.education && Array.isArray(global.cvData.education) && global.cvData.education.length > 0) {
          const totalEducationWeight = 30; // 30% du score total
          
          // Ne prendre que la dernière formation (la plus récente)
          const latestEducation = global.cvData.education[0];
          const relevance = calculateBasicRelevance(latestEducation, job);
          educationScore = relevance * totalEducationWeight;
        }
        
        // === SCORE FINAL ===
        const totalScore = experienceScore + educationScore;
        // Multiplier par un facteur pour obtenir des scores plus élevés
        const adjustedScore = totalScore * 5.0; // Facteur multiplicateur augmenté
        const matchPercentage = Math.max(0, Math.min(95, Math.round(adjustedScore))); // Capé à 95%
        
        return {
          ...job,
          matchPercentage: matchPercentage
        };
      });
      
      // Fonction améliorée pour calculer la pertinence
      function calculateBasicRelevance(item, job) {
        let relevance = 0;
        
        // Pertinence du titre (plus importante)
        if (item.title && job.title) {
          const titleMatch = calculateTextSimilarity(item.title, job.title);
          relevance += titleMatch * 0.7; // 70% du score
        }
        
        // Pertinence de la description
        if (item.description && job.description) {
          const descMatch = calculateTextSimilarity(item.description, job.description);
          relevance += descMatch * 0.3; // 30% du score
        }
        
        // Bonus pour les mots-clés techniques
        if (item.title && job.title) {
          const technicalBonus = calculateTechnicalBonus(item.title, job.title);
          relevance += technicalBonus * 0.2; // Bonus de 20%
        }
        
        return Math.min(relevance, 1.2); // Permettre un score légèrement supérieur à 1
      }
      
      // Fonction améliorée pour calculer la similarité de texte
      function calculateTextSimilarity(text1, text2) {
        if (!text1 || !text2) return 0;
        
        const words1 = text1.toLowerCase().split(/\s+/).filter(word => word.length > 2);
        const words2 = text2.toLowerCase().split(/\s+/).filter(word => word.length > 2);
        
        if (words1.length === 0 || words2.length === 0) return 0;
        
        const commonWords = words1.filter(word => words2.includes(word));
        const totalWords = Math.max(words1.length, words2.length);
        
        // Score de base
        let score = commonWords.length / totalWords;
        
        // Bonus pour les mots exacts
        if (text1.toLowerCase().includes(text2.toLowerCase()) || text2.toLowerCase().includes(text1.toLowerCase())) {
          score += 0.3;
        }
        
        return Math.min(score, 1);
      }
      
      // Fonction pour calculer le bonus technique
      function calculateTechnicalBonus(title1, title2) {
        const technicalKeywords = [
          'développeur', 'développeuse', 'programmeur', 'ingénieur', 'ingénieure',
          'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node', 'php',
          'django', 'flask', 'fastapi', 'spring', 'express', 'laravel',
          'postgresql', 'mysql', 'mongodb', 'redis', 'docker', 'kubernetes',
          'aws', 'azure', 'gcp', 'git', 'ci/cd', 'devops', 'fullstack', 'frontend', 'backend'
        ];
        
        const words1 = title1.toLowerCase().split(/\s+/);
        const words2 = title2.toLowerCase().split(/\s+/);
        
        const techWords1 = words1.filter(word => technicalKeywords.includes(word));
        const techWords2 = words2.filter(word => technicalKeywords.includes(word));
        
        const commonTechWords = techWords1.filter(word => techWords2.includes(word));
        
        return commonTechWords.length * 0.1; // 10% par mot technique commun
      }

      // Trier par pourcentage de matching décroissant
      jobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
      
      const matchingEndTime = Date.now();
      const matchingDuration = matchingEndTime - matchingStartTime;
      console.log(`⏱️ Matching CV terminé en ${matchingDuration}ms`);
      console.log(`📊 Performance: ${(jobs.length / (matchingDuration / 1000)).toFixed(2)} offres/seconde`);
      console.log(`🎯 Scores de matching: ${jobs.slice(0, 5).map(job => `${job.title.substring(0, 30)}...: ${job.matchPercentage}%`).join(', ')}`);
    }

    // Récupérer le nombre total d'offres pour la pagination
    console.log('🔍 API Debug - Calcul du total des jobs...');
    
    const countResult = await pool.query('SELECT COUNT(*) as total FROM jobs');
    const totalJobs = parseInt(countResult.rows[0].total) || 0;
    
    console.log(`🔍 API Debug - Total jobs unifiés: ${totalJobs}`);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      total: totalJobs,
      hasMore: (page * limit) < totalJobs,
      limit: limit
    };

    console.log(`🔍 API Debug - Pagination: ${totalJobs} offres totales, page ${page}/${pagination.totalPages}`);

    return NextResponse.json({
      jobs: jobs,
      pagination: pagination
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des offres unifiées:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des offres d\'emploi' },
      { status: 500 }
    );
  }
} 