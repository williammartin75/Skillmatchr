const { chromium } = require('playwright');
const { Pool } = require('pg');
const { extractSkillsFromText, normalizeSkills } = require('./skills-library');
const { getAllJobTitles } = require('./job-titles-library');
const { loadFrenchCities, findCityByName, isFrenchCity, getCityCoordinates } = require('./french-cities-loader.js');

/**
 * Scraper APEC optimisé avec gestion des proxies et rotation des user agents
 * Utilise la bibliothèque de compétences centralisée pour éviter les doublons
 */
class ApecCronScraper {
  constructor() {
    this.databaseName = 'apec_database';
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: 'apec_database' // Utiliser directement apec_database
    });
    
    // Initialiser la bibliothèque de villes françaises avec coordonnées
    this.frenchCities = [];
    
    // Configuration des proxies HTTP en ligne - 50 proxies fonctionnels
    this.proxyList = [
      // Proxies européens
      { host: '156.228.189.249', port: 3129, username: null, password: null },
      { host: '156.253.168.60', port: 3129, username: null, password: null },
      { host: '154.213.198.102', port: 3129, username: null, password: null },
      { host: '154.213.194.7', port: 3129, username: null, password: null },
      { host: '154.213.193.184', port: 3129, username: null, password: null },
      { host: '154.213.203.97', port: 3129, username: null, password: null },
      { host: '154.213.166.162', port: 3129, username: null, password: null },
      { host: '154.94.15.55', port: 3129, username: null, password: null },
      { host: '156.228.179.246', port: 3129, username: null, password: null },
      { host: '156.253.178.191', port: 3129, username: null, password: null },
      { host: '156.228.183.64', port: 3129, username: null, password: null },
      { host: '154.213.196.199', port: 3129, username: null, password: null },
      { host: '156.228.176.146', port: 3129, username: null, password: null },
      { host: '156.240.99.206', port: 3129, username: null, password: null },
      { host: '156.228.180.186', port: 3129, username: null, password: null },
      { host: '156.228.184.80', port: 3129, username: null, password: null },
      { host: '154.213.198.181', port: 3129, username: null, password: null },
      { host: '156.253.165.176', port: 3129, username: null, password: null },
      { host: '156.253.174.140', port: 3129, username: null, password: null },
      { host: '156.253.172.14', port: 3129, username: null, password: null },
      { host: '154.94.15.195', port: 3129, username: null, password: null },
      { host: '154.213.197.191', port: 3129, username: null, password: null },
      
      // Proxies américains
      { host: '156.248.86.115', port: 3129, username: null, password: null },
      { host: '156.233.87.211', port: 3129, username: null, password: null },
      { host: '156.228.77.88', port: 3129, username: null, password: null },
      { host: '156.228.97.157', port: 3129, username: null, password: null },
      { host: '156.228.87.214', port: 3129, username: null, password: null },
      { host: '154.213.166.121', port: 3129, username: null, password: null },
      { host: '156.248.80.164', port: 3129, username: null, password: null },
      { host: '156.242.44.137', port: 3129, username: null, password: null },
      { host: '156.242.35.149', port: 3129, username: null, password: null },
      { host: '156.228.82.127', port: 3129, username: null, password: null },
      { host: '156.248.82.232', port: 3129, username: null, password: null },
      { host: '156.242.33.98', port: 3129, username: null, password: null },
      { host: '156.228.88.219', port: 3129, username: null, password: null },
      { host: '156.242.41.90', port: 3129, username: null, password: null },
      { host: '156.228.95.233', port: 3129, username: null, password: null },
      { host: '156.228.125.139', port: 3129, username: null, password: null },
      { host: '156.242.36.193', port: 3129, username: null, password: null },
      { host: '156.228.103.74', port: 3129, username: null, password: null },
      { host: '156.228.104.97', port: 3129, username: null, password: null },
      { host: '156.228.105.12', port: 3129, username: null, password: null },
      { host: '156.242.32.116', port: 3129, username: null, password: null },
      { host: '156.228.107.218', port: 3129, username: null, password: null },
      
      // Proxies canadiens
      { host: '156.249.59.2', port: 3129, username: null, password: null },
      { host: '156.249.62.251', port: 3129, username: null, password: null },
      { host: '156.249.59.193', port: 3129, username: null, password: null },
      { host: '156.249.57.37', port: 3129, username: null, password: null },
      { host: '156.249.56.141', port: 3129, username: null, password: null },
      
      // Proxies brésiliens
      { host: '156.233.87.211', port: 3129, username: null, password: null },
      
      // Proxies espagnols
      { host: '154.94.15.55', port: 3129, username: null, password: null },
      { host: '154.94.15.195', port: 3129, username: null, password: null }
    ];
    
    this.currentProxyIndex = 0;
    this.failedProxies = new Set(); // Suivre les proxies qui échouent
    this.maxFailedAttempts = 3; // Nombre max d'échecs avant de marquer un proxy comme défaillant
    
    // User agents variés pour éviter la détection
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0'
    ];
    
    // Configuration des sélecteurs optimisés pour APEC
    this.selectors = [
      // Sélecteurs spécifiques pour les cartes d'offres d'emploi APEC
      '.search-result-item',
      '.result-item',
      '.job-card',
      '.offer-card',
      '.emploi-card',
      '.apec-result',
      '.apec-item',
      '.search-result',
      // Sélecteurs de fallback pour les liens d'emploi
      'a[href*="/emploi/"]:not([href*="javascript"]):not([href*="login"])',
      'a[href*="emploi.html"]',
      // Sélecteurs génériques en dernier recours
      '.result',
      '.item',
      '.card'
    ];
    
    // Bibliothèque de métiers français pour l'extraction des titres
    this.jobTitles = getAllJobTitles();
    
    // Mots-clés de postes pour validation
    this.jobKeywords = [
      'Chargé', 'Chargée', 'Chef', 'Responsable', 'Directeur', 'Directrice', 'Manager',
      'Consultant', 'Consultante', 'Ingénieur', 'Ingénieure', 'Analyste', 'Développeur',
      'Développeuse', 'Architecte', 'Administrateur', 'Administratrice', 'Expert',
      'Spécialiste', 'Technicien', 'Technicienne', 'Juriste', 'Avocat', 'Avocate',
      'Comptable', 'Commercial', 'Commerciale', 'Vendeur', 'Vendeuse', 'Assistant',
      'Assistante', 'Secrétaire', 'Médecin', 'Infirmier', 'Infirmière', 'Enseignant',
      'Enseignante', 'Formateur', 'Formatrice', 'Designer', 'Graphiste', 'Rédacteur',
      'Rédactrice', 'Journaliste', 'Photographe', 'Vidéaste', 'Recruteur', 'Recruteuse',
      'Lead', 'Senior', 'Junior', 'Coordinateur', 'Coordinatrice', 'Superviseur', 'Superviseuse'
    ];
  }

  /**
   * Initialise la base de données APEC
   */
  async initializeDatabase() {
    console.log('🗄️ Initialisation de la base de données APEC...');
    
    try {
      const client = await this.pool.connect();
      
      // Vérifier si la base de données existe
      const dbExistsQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
      const dbExists = await client.query(dbExistsQuery, [this.databaseName]);
      
      if (dbExists.rows.length === 0) {
        console.log('📋 Création de la base de données APEC...');
        await client.query(`CREATE DATABASE ${this.databaseName}`);
        console.log('✅ Base de données APEC créée');
      } else {
        console.log(`✅ Base de données '${this.databaseName}' existe déjà`);
      }
      
      client.release();
      
      // Se reconnecter à la base de données APEC
      this.pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password', // Corriger le mot de passe par défaut
        database: this.databaseName
      });
      
      await this.createTables();
      console.log('✅ Base de données APEC initialisée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la base de données:', error.message);
      throw error;
    }
  }

  /**
   * Crée les tables nécessaires
   */
  async createTables() {
    console.log('📋 Création des tables APEC...');
    
    const client = await this.pool.connect();
    
    try {
      // Supprimer et recréer la table pour éliminer les contraintes de longueur
      console.log('🔄 Suppression de l\'ancienne table apec_jobs...');
      await client.query(`DROP TABLE IF EXISTS apec_jobs CASCADE`);
      
      // Table des jobs APEC avec TEXT (pas de limites)
      await client.query(`
        CREATE TABLE apec_jobs (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          company TEXT,
          location TEXT,
          description TEXT,
          salary TEXT,
          contract_type TEXT,
          source VARCHAR(50) DEFAULT 'apec',
          source_url TEXT,
          published_at TIMESTAMP,
          telework TEXT,
          tags JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Table apec_jobs recréée avec TEXT (sans limites)');
      
    } catch (error) {
      console.error('❌ Erreur lors de la création des tables:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Méthode principale de scraping
   */
  async scrape() {
    const startTime = new Date();
    console.log('\n🚀 DÉBUT DU SCRAPING APEC CRON MULTI-PROCESSUS');
    console.log(`⏰ Heure de début: ${startTime.toLocaleString('fr-FR')}`);
    
    // Mettre à jour la date de dernière exécution
    await this.updateLastExecutionDate();
    
    try {
      await this.initializeDatabase();
      await this.testDatabaseConnection();
      await this.initializeCitiesFromDatabase();
      
      // CONFIGURATION MULTI-PROCESSUS
      const numWorkers = 4;
      const startPage = 1;
      // Pas de limite de pages - le scraper continuera jusqu'à ce qu'il n'y ait plus de résultats
      
      console.log(`👷 Configuration: ${numWorkers} workers, pages ${startPage} et suivantes (sans limite)`);
      
      // Diviser les pages entre les workers de manière dynamique
      const workers = [];
      
      for (let i = 0; i < numWorkers; i++) {
        const workerStartPage = startPage + i; // Chaque worker commence à une page différente
        console.log(`👷 Worker ${i + 1}: commence à la page ${workerStartPage} (sans limite)`);
        
        const workerPromise = this.scrapeWorker(i + 1, workerStartPage);
        workers.push(workerPromise);
      }
      
      // Attendre que tous les workers terminent
      const results = await Promise.all(workers);
      
      const totalJobs = results.reduce((sum, jobs) => sum + jobs, 0);
      
      // Sauvegarder les statistiques
      const endTime = new Date();
      const duration = (endTime - startTime) / 1000;
      
      const stats = {
        jobs_found: totalJobs,
        jobs_inserted: totalJobs,
        pages_scraped: 'illimité', // Plus de limite de pages
        duration_seconds: duration,
        end_time: endTime.toLocaleString('fr-FR'),
        database: this.databaseName
      };
      
      await this.saveScrapingStats(stats);
      
      console.log('\n🎉 SCRAPING APEC CRON MULTI-PROCESSUS TERMINÉ');
      console.log('📊 Résultats par worker:');
      results.forEach((jobs, index) => {
        console.log(`   - Worker ${index + 1}: ${jobs} jobs`);
      });
      console.log('📊 Résultats totaux:');
      console.log(`   - Jobs trouvés: ${stats.jobs_found}`);
      console.log(`   - Jobs insérés: ${stats.jobs_inserted}`);
      console.log(`   - Pages scrapées: ${stats.pages_scraped}`);
      console.log(`   - Durée: ${stats.duration_seconds}s`);
      console.log(`   - Heure de fin: ${stats.end_time}`);
      console.log(`   - Base de données: ${stats.database}`);
      
      // Mettre à jour le statut final
      await this.updateScraperStatus('completed', `Jobs trouvés: ${stats.jobs_found}`);
      
    } catch (error) {
      console.error('❌ Erreur lors du scraping:', error.message);
      await this.logError('SCRAPING_ERROR', error.message, error.stack, {});
      
      // Mettre à jour le statut en cas d'erreur
      await this.updateScraperStatus('error', error.message);
    } finally {
      await this.pool.end();
    }
  }

  /**
   * Méthode de scraping pour un worker individuel
   */
  async scrapeWorker(workerId, startPage) {
    console.log(`🚀 Worker ${workerId}: Début du scraping à partir de la page ${startPage} (sans limite)`);
    
    let totalJobs = 0;
    let consecutiveEmptyPages = 0;
    const maxEmptyPages = 5; // Arrêter après 5 pages vides consécutives
    let currentPage = startPage;
    
    while (true) { // Boucle infinie jusqu'à ce qu'on trouve assez de pages vides
      console.log(`📄 Worker ${workerId}: Scraping page ${currentPage}...`);
      
      try {
        const pageJobs = await this.scrapePageWithProxy(currentPage, workerId);
        
        if (pageJobs.length === 0) {
          consecutiveEmptyPages++;
          console.log(`📄 Worker ${workerId}: Page vide (${consecutiveEmptyPages}/${maxEmptyPages})`);
          
          if (consecutiveEmptyPages >= maxEmptyPages) {
            console.log(`⚠️ Worker ${workerId}: Arrêt après ${maxEmptyPages} pages vides consécutives`);
            break;
          }
        } else {
          consecutiveEmptyPages = 0; // Reset le compteur
          
          // Vérifier si un job générique a été détecté (fin des résultats)
          const hasGenericJob = pageJobs.some(job => 
            job.title === 'Poste à pourvoir' && job.company === 'Entreprise non précisée'
          );
          
          if (hasGenericJob) {
            console.log(`🛑 Worker ${workerId}: Job générique détecté - Arrêt du worker`);
            console.log(`   Le worker s'arrête car il a atteint la fin des résultats valides`);
            
            // Insérer les jobs valides (sans le job générique)
            const validJobs = pageJobs.filter(job => 
              !(job.title === 'Poste à pourvoir' && job.company === 'Entreprise non précisée')
            );
            
            if (validJobs.length > 0) {
              console.log(`💾 Worker ${workerId}: Insertion des ${validJobs.length} derniers jobs valides...`);
              await this.insertJobsToDatabase(validJobs);
              totalJobs += validJobs.length;
            }
            
            break; // Arrêter la boucle du worker
          }
          
          // INSÉRER LES JOBS IMMÉDIATEMENT APRÈS CHAQUE PAGE
          console.log(`💾 Worker ${workerId}: Insertion immédiate de ${pageJobs.length} jobs de la page ${currentPage}...`);
          await this.insertJobsToDatabase(pageJobs);
          
          totalJobs += pageJobs.length;
          console.log(`✅ Worker ${workerId}: Page ${currentPage}: ${pageJobs.length} jobs trouvés et insérés`);
        }
        
        console.log(`📊 Worker ${workerId}: Total cumulé: ${totalJobs} jobs`);
        
        // Pause entre les pages pour éviter la détection
        const pauseTime = Math.random() * 2 + 3; // 3-5 secondes
        console.log(`⏸️ Worker ${workerId}: Pause de ${pauseTime.toFixed(1)}s avant la prochaine page...`);
        await this.sleep(pauseTime * 1000);
        
        // Passer à la page suivante
        currentPage += 4; // Chaque worker saute 4 pages pour éviter les conflits
        
      } catch (error) {
        console.error(`❌ Worker ${workerId}: Erreur sur la page ${currentPage}:`, error.message);
        currentPage += 4; // Continuer avec la page suivante même en cas d'erreur
        continue;
      }
    }
    
    console.log(`🎉 Worker ${workerId}: Terminé avec ${totalJobs} jobs au total`);
    return totalJobs;
  }

  /**
   * Scrape une page avec gestion des proxies et rotation des user agents
   */
  async scrapePageWithProxy(pageNum, workerId) {
    const maxRetries = 5; // Augmenter le nombre de tentatives avec plus de proxies
    const availableProxies = this.getAvailableProxiesCount();
    
    console.log(`🌐 Worker ${workerId}: ${availableProxies}/${this.proxyList.length} proxies disponibles`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let proxy; // Déclarer la variable proxy ici
      
      try {
        proxy = this.getNextProxy(workerId);
        const userAgent = this.getRandomUserAgent();
        
        console.log(`🌐 Worker ${workerId}: Tentative ${attempt}/${maxRetries} avec proxy: ${proxy.host}:${proxy.port}`);
        
        const browser = await chromium.launch({
          proxy: proxy.username ? {
            server: `http://${proxy.host}:${proxy.port}`,
            username: proxy.username,
            password: proxy.password
          } : {
            server: `http://${proxy.host}:${proxy.port}`
          },
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-images',
            '--disable-javascript',
            `--user-agent=${userAgent}`
          ],
          timeout: 60000 // 60 secondes de timeout pour le lancement
        });
        
        const context = await browser.newContext({
          userAgent: userAgent,
          viewport: { width: 1920, height: 1080 },
          ignoreHTTPSErrors: true,
          bypassCSP: true
        });
        
        const page = await context.newPage();
        
        // Construire l'URL de la page
        const url = this.buildPageUrl(pageNum);
        console.log(`🔗 Worker ${workerId}: Navigation vers: ${url}`);
        
        // Augmenter les timeouts et utiliser une stratégie plus robuste
        await page.goto(url, { 
          waitUntil: 'domcontentloaded', // Plus rapide que 'networkidle'
          timeout: 45000 // 45 secondes au lieu de 30
        });
        
        // Attendre un peu que la page se charge
        await this.sleep(2000);
        
        // Attendre le chargement des éléments d'emploi avec un timeout plus court
        console.log(`⏳ Worker ${workerId}: Attente du chargement de la page...`);
        try {
          await page.waitForSelector('a[href*="/emploi/"]', { timeout: 15000 });
        } catch (timeoutError) {
          console.log(`⚠️ Worker ${workerId}: Timeout en attendant les éléments d'emploi, continuation...`);
          // Continuer même si on ne trouve pas les éléments immédiatement
        }
        
        // Vérifier si c'est une page d'erreur ou sans résultats
        const pageTitle = await page.title();
        if (this.isErrorPage(pageTitle)) {
          console.log(`⚠️ Worker ${workerId}: Page d'erreur ou sans résultats détectée`);
          await browser.close();
          return [];
        }
        
        // Vérifier le contenu pour détecter les pages vides
        const noResultsText = await page.evaluate(() => {
          const text = document.body.textContent.toLowerCase();
          return text.includes('aucun résultat') || 
                 text.includes('no results') || 
                 text.includes('aucune offre') ||
                 text.includes('no offers') ||
                 text.includes('pas de résultat') ||
                 text.includes('no matches');
        });
        
        if (noResultsText) {
          console.log(`⚠️ Worker ${workerId}: Message "aucun résultat" détecté dans la page`);
          await browser.close();
          return [];
        }
        
        // Extraire les jobs avec les sélecteurs optimisés
        const jobs = await this.extractJobsFromPage(page, workerId);
        
        // Vérifier si un job générique a été détecté (fin des résultats)
        const hasGenericJob = jobs.some(job => 
          job.title === 'Poste à pourvoir' && job.company === 'Entreprise non précisée'
        );
        
        if (hasGenericJob) {
          console.log(`🛑 Worker ${workerId}: Job générique détecté - Arrêt du scraping pour ce worker`);
          await browser.close();
          return jobs.filter(job => 
            !(job.title === 'Poste à pourvoir' && job.company === 'Entreprise non précisée')
          );
        }
        
        await browser.close();
        console.log(`✅ Worker ${workerId}: Succès avec proxy ${proxy.host}:${proxy.port}`);
        return jobs;
        
      } catch (error) {
        console.error(`❌ Worker ${workerId}: Erreur tentative ${attempt}/${maxRetries}:`, error.message);
        
        // Marquer le proxy comme défaillant si c'est une erreur de connexion
        if (proxy && (error.message.includes('ERR_TUNNEL_CONNECTION_FAILED') || 
            error.message.includes('ERR_CONNECTION_REFUSED') ||
            error.message.includes('ERR_CONNECTION_TIMED_OUT') ||
            error.message.includes('ERR_TIMED_OUT') ||
            error.message.includes('net::ERR_TIMED_OUT'))) {
          this.markProxyAsFailed(proxy, error.message);
        }
        
        if (attempt === maxRetries) {
          console.error(`❌ Worker ${workerId}: Toutes les tentatives ont échoué`);
          return [];
        }
        
        // Pause plus longue avant la prochaine tentative
        const pauseTime = Math.random() * 5 + 3; // 3-8 secondes
        console.log(`⏸️ Worker ${workerId}: Pause de ${pauseTime.toFixed(1)}s avant la prochaine tentative...`);
        await this.sleep(pauseTime * 1000);
      }
    }
    
    return [];
  }

  /**
   * Extrait les jobs d'une page en utilisant les sélecteurs optimisés
   */
  async extractJobsFromPage(page, workerId) {
    let jobs = [];
    
    for (const selector of this.selectors) {
      const elements = await page.$$(selector);
      console.log(`🔍 Worker ${workerId}: Analyse de ${elements.length} éléments avec "${selector}"`);
      
      if (elements.length > 0) {
        const parsedJobs = await this.parseJobElements(page, elements, selector, workerId);
        jobs = parsedJobs;
        console.log(`✅ Worker ${workerId}: ${parsedJobs.length} jobs parsés avec "${selector}"`);
        break;
      }
    }
    
    return jobs;
  }

  /**
   * Parse les éléments de jobs trouvés
   */
  async parseJobElements(page, elements, selector, workerId) {
    const jobs = [];
    let validJobs = 0;
    let invalidJobs = 0;
    
    console.log(`🔍 Worker ${workerId}: Analyse de ${elements.length} éléments avec "${selector}"`);
    
    for (let i = 0; i < Math.min(elements.length, 50); i++) { // Augmenter la limite pour plus de jobs
      try {
        const element = elements[i];
        
        // Vérifier que l'élément contient du texte
        const textContent = await element.evaluate(el => el.textContent.trim());
        if (!textContent || textContent.length < 10) {
          console.log(`❌ Worker ${workerId}: Élément ${i} vide ou trop court: "${textContent.substring(0, 30)}..."`);
          continue;
        }
        
        const jobData = await this.extractJobDetails(page, element, workerId);
        
        // Vérifier si c'est un job générique qui indique la fin des résultats
        if (jobData && jobData.title === 'Poste à pourvoir' && jobData.company === 'Entreprise non précisée') {
          console.log(`🛑 Worker ${workerId}: Job générique détecté - Arrêt du scraping`);
          console.log(`   Titre: "${jobData.title}"`);
          console.log(`   Entreprise: "${jobData.company}"`);
          console.log(`   Le scraper s'arrête car il a atteint la fin des résultats valides`);
          return jobs; // Retourner les jobs déjà trouvés et arrêter
        }
        
        if (jobData && jobData.title && jobData.title.trim() && jobData.title !== 'Officine F/H') {
          jobs.push(jobData);
          validJobs++;
          console.log(`✅ Worker ${workerId}: Job ${validJobs}: ${jobData.title.substring(0, 50)}... chez ${jobData.company} (${jobData.contractType})`);
          console.log(`📝 Worker ${workerId}: Description: ${jobData.description.substring(0, 100)}...`);
        } else {
          invalidJobs++;
          console.log(`❌ Worker ${workerId}: Job invalide ${invalidJobs}: Pas de titre valide ou titre générique`);
        }
        
      } catch (error) {
        invalidJobs++;
        console.error(`❌ Worker ${workerId}: Erreur lors du parsing de l'élément ${i}:`, error.message);
      }
    }
    
    console.log(`📊 Worker ${workerId}: Résultat: ${validJobs} jobs valides, ${invalidJobs} jobs invalides`);
    return jobs;
  }

  /**
   * Extrait les détails d'un job depuis un élément
   */
  async extractJobDetails(page, element, workerId) {
    try {
      // Extraire le texte complet de l'élément
      const fullText = await element.evaluate(el => el.textContent.trim());
      
      // Extraire l'URL
      const url = await element.getAttribute('href').catch(() => '');
      const fullUrl = url ? (url.startsWith('http') ? url : `https://www.apec.fr${url}`) : '';
      
      // Analyser le texte pour extraire les informations
      const extractedInfo = this.extractInfoFromText(fullText);
      
      // Utiliser la bibliothèque de compétences centralisée
      const extractedSkills = extractSkillsFromText(fullText);
      const normalizedSkills = normalizeSkills(extractedSkills);
      
      // Nettoie les skills en enlevant les mots non pertinents
      const cleanedSkills = this.cleanSkills(normalizedSkills);
      
      // Date de publication
      const publishedAt = extractedInfo.publishedDate ? 
        new Date(extractedInfo.publishedDate).toISOString() : 
        new Date().toISOString();
      
      const jobData = {
        title: extractedInfo.title || 'Poste à pourvoir',
        company: extractedInfo.company || 'Entreprise non précisée',
        location: extractedInfo.location || 'Localisation non précisée',
        salary: extractedInfo.salary || 'Salaire non précisé',
        contractType: extractedInfo.contractType || 'Type de contrat non précisé',
        experience: extractedInfo.experience || 'Expérience non précisée',
        telework: extractedInfo.telework || 'Mode de travail non précisé',
        startDate: extractedInfo.startDate || 'Date de prise de poste non précisée',
        description: extractedInfo.description || 'Description non disponible',
        sourceUrl: fullUrl,
        publishedAt,
        source: 'apec',
        tags: ['apec', 'cadre'],
        skills: cleanedSkills,
        // Informations supplémentaires pour les job cards
        remote: extractedInfo.telework?.toLowerCase().includes('télétravail') || 
                extractedInfo.telework?.toLowerCase().includes('remote') || 
                extractedInfo.telework?.toLowerCase().includes('hybride'),
        postedDate: extractedInfo.publishedDate,
        contract: extractedInfo.contractType,
        experienceLevel: extractedInfo.experience
      };
      
      console.log(`✅ Worker ${workerId}: Job extrait:`, {
        title: jobData.title.substring(0, 50) + '...',
        company: jobData.company,
        location: jobData.location,
        salary: jobData.salary,
        contractType: jobData.contractType,
        skills: cleanedSkills.slice(0, 3)
      });
      
      return jobData;
      
    } catch (error) {
      console.error(`❌ Worker ${workerId}: Erreur lors de l'extraction des détails:`, error.message);
      return null;
    }
  }

  /**
   * Extrait les informations d'un texte d'offre d'emploi
   */
  extractInfoFromText(text) {
    const info = {
      title: '',
      company: '',
      location: '',
      salary: '',
      contractType: '',
      experience: '',
      telework: '',
      startDate: '',
      description: '',
      publishedDate: new Date().toISOString().split('T')[0] // Date d'aujourd'hui par défaut
    };
    
    // Nettoyer le texte de manière plus agressive
    let cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Éliminer les patterns de codes postaux et références
    cleanText = cleanText.replace(/\b\d{5}\s*[A-Z]\b/g, ''); // "16931 F" -> ""
    cleanText = cleanText.replace(/\b\d{5}\b/g, ''); // Codes postaux isolés
    cleanText = cleanText.replace(/\b[A-Z]\d{4,5}\b/g, ''); // Références comme "F16931"
    cleanText = cleanText.replace(/\b\d{4,5}[A-Z]\b/g, ''); // Références comme "16931F"
    
    // Nettoyer les espaces multiples après suppression
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    console.log('🔍 Texte complet à analyser:', cleanText.substring(0, 300) + '...');
    
    // 1. EXTRACTION DU SALAIRE (patterns améliorés)
    const salaryPatterns = [
      // Pattern "A négocier"
      /(A\s+négocier)/i,
      // Pattern "xx - xx k€" ou "xx - xx k€ brut" (minimum 2 chiffres)
      /(\d{2,3}(?:\s\d{3})*(?:\s*[kK])?\s*€?\s*-\s*\d{2,3}(?:\s\d{3})*(?:\s*[kK])?\s*€?\s*(?:brut\s*)?(?:annuel|an)?)/i,
      // Pattern "A partir de xx k€" (minimum 2 chiffres)
      /(A\s+partir\s+de\s+\d{2,3}(?:\s\d{3})*(?:\s*[kK])?\s*€?\s*(?:brut\s*)?(?:annuel|an)?)/i,
      // Pattern "xx k€" simple (minimum 2 chiffres)
      /(\d{2,3}(?:\s\d{3})*(?:\s*[kK])?\s*€?\s*(?:brut\s*)?(?:annuel|an)?)/i,
      // Pattern avec "salaire" ou "rémunération" (minimum 2 chiffres)
      /(?:salaire|rémunération|salaire\s*:?\s*)(\d{2,3}(?:\s\d{3})*(?:\s*[kK])?\s*€?)/i
    ];
    
    let salaryFound = false;
    for (const pattern of salaryPatterns) {
      const salaryMatch = cleanText.match(pattern);
      if (salaryMatch) {
        const extractedSalary = salaryMatch[1].trim();
        // Vérifier que le salaire a du sens (pas juste "12 - 75")
        if (extractedSalary.length > 5 && !extractedSalary.match(/^\d{1,2}\s*-\s*\d{1,2}$/)) {
          info.salary = extractedSalary;
          console.log('💰 Salaire trouvé:', info.salary);
          salaryFound = true;
          break;
        }
      }
    }
    
    // Si aucun salaire valide n'est trouvé, utiliser la valeur par défaut
    if (!salaryFound) {
      info.salary = 'Salaire non précisé';
      console.log('💰 Salaire non trouvé, valeur par défaut:', info.salary);
    }
    
    // 2. EXTRACTION DU TYPE DE CONTRAT
    const contractPatterns = [
      /(CDI|CDD|Stage|Alternance|Freelance|Intérim|Contrat\s*à\s*durée\s*indéterminée|Contrat\s*à\s*durée\s*déterminée)/i,
      /(Temps\s*plein|Temps\s*partiel|Mission\s*d'intérim)/i
    ];
    
    for (const pattern of contractPatterns) {
      const contractMatch = cleanText.match(pattern);
      if (contractMatch) {
        info.contractType = contractMatch[1].trim();
        console.log('📋 Type de contrat trouvé:', info.contractType);
        break;
      }
    }
    
    // 3. EXTRACTION DE LA LOCALISATION (détection des villes françaises)
    // PRIORITÉ 1: Chercher "situé à" ou "sur" suivi d'une ville
    const locationPatterns = [
      /(?:situé\s*à|sur|basé\s*à)\s+([A-Z][A-Za-z\s-]+?)\s*\(/i,
      /(?:situé\s*à|sur|basé\s*à)\s+([A-Z][A-Za-z\s-]+?)\s*$/i
    ];
    
    for (const pattern of locationPatterns) {
      const locationMatch = cleanText.match(pattern);
      if (locationMatch) {
        const extractedLocation = locationMatch[1].trim();
        // Vérifier que ce n'est pas un code postal
        if (!this.isPostalCode(extractedLocation)) {
          const foundCity = this.findCityInLoadedCities(extractedLocation);
          if (foundCity) {
            info.location = foundCity.nom;
            console.log('📍 Ville trouvée par pattern "situé à":', info.location);
            break;
          }
        }
      }
    }
    
    // PRIORITÉ 2: Si pas trouvé par pattern, chercher dans la bibliothèque des villes (insensible à la casse)
    if (!info.location) {
      const lowerCleanText = cleanText.toLowerCase();
      
      // Chercher directement dans le texte les noms de villes de la bibliothèque
      for (const city of this.frenchCities) {
        const lowerCityName = city.nom.toLowerCase();
        
        // Ignorer les villes trop courtes ou communes
        if (lowerCityName.length < 4) continue;
        if (['paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes', 'strasbourg', 'montpellier', 'bordeaux', 'lille'].includes(lowerCityName)) continue;
        
        // Chercher le nom complet de la ville dans le texte
        if (lowerCleanText.includes(lowerCityName)) {
          // Vérifier que c'est bien un nom de ville (pas une partie d'un autre mot)
          const cityRegex = new RegExp(`\\b${lowerCityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (cityRegex.test(cleanText)) {
            info.location = city.nom;
            console.log('📍 Ville trouvée dans le texte:', info.location);
            break;
          }
        }
      }
    }
    
    // PRIORITÉ 3: Pattern de localisation alternative
    if (!info.location) {
      const altLocationPatterns = [
        /basés?\s+à\s+([A-Za-z\s\-]+?)(?=\s+sur|\s+en|\s+le|\s+la|\s+et|\s*$)/i,
        /localisation\s*:?\s*([A-Za-z\s\-]+?)(?=\s*$|\s*\n)/i,
        /lieu\s*:?\s*([A-Za-z\s\-]+?)(?=\s*$|\s*\n)/i
      ];
      
      for (const pattern of altLocationPatterns) {
        const locationMatch = cleanText.match(pattern);
        if (locationMatch) {
          const extractedLocation = locationMatch[1].trim();
          // Vérifier que ce n'est pas un code postal
          if (!this.isPostalCode(extractedLocation)) {
            const foundCity = this.findCityInLoadedCities(extractedLocation);
            if (foundCity) {
              info.location = foundCity.nom;
              console.log('📍 Localisation trouvée par pattern:', info.location);
              break;
            }
          }
        }
      }
    }
    
    // PRIORITÉ 4: Chercher des noms de villes dans le texte complet (éviter les codes postaux)
    if (!info.location) {
      const words = cleanText.split(/\s+/);
      for (const word of words) {
        // Ignorer les mots trop courts ou qui ressemblent à des codes postaux
        if (word.length > 3 && !this.isPostalCode(word) && !this.isNumeric(word)) {
          const foundCity = this.findCityInLoadedCities(word);
          if (foundCity) {
            info.location = foundCity.nom;
            console.log('📍 Ville trouvée dans le texte:', info.location);
            break;
          }
        }
      }
    }
    
    // 4. EXTRACTION ENTREPRISE ET TITRE (logique corrigée avec priorité aux métiers)
    const startText = cleanText.substring(0, 500);
    
    // Pattern 1: "ENTREPRISE en TITRE F/H"
    const enPattern = startText.match(/([A-Z][A-Za-z]+)\s+en\s+([A-Za-z\s]+F\/H)/);
    if (enPattern) {
      info.company = enPattern[1].trim();
      info.title = enPattern[2].trim();
      console.log('🏢 Entreprise (en pattern):', info.company);
      console.log('💼 Titre (en pattern):', info.title);
    } else {
      // Pattern 2: "ENTREPRISE TITRE F/H" avec priorité aux métiers
      const fhMatch = startText.match(/([A-Za-z\s\/\(\)\-,]+?F\/H)/);
      if (fhMatch) {
        const fullTitle = fhMatch[1].trim();
        console.log('🔍 Titre complet trouvé par F/H:', fullTitle);
        
        // PRIORITÉ 1: Chercher un métier dans le texte COMPLET (pas seulement dans fullTitle)
        let foundJobTitle = null;
        let jobTitleIndex = -1;
        
        for (const jobTitle of this.jobTitles) {
          const index = startText.indexOf(jobTitle);
          if (index !== -1) {
            foundJobTitle = jobTitle;
            jobTitleIndex = index;
            console.log('🔍 Métier trouvé dans le texte complet:', foundJobTitle, 'à la position:', jobTitleIndex);
            break;
          }
        }
        
        // Si pas trouvé avec la casse exacte, essayer avec insensibilité à la casse
        if (!foundJobTitle) {
          const lowerStartText = startText.toLowerCase();
          for (const jobTitle of this.jobTitles) {
            const lowerJobTitle = jobTitle.toLowerCase();
            const index = lowerStartText.indexOf(lowerJobTitle);
            if (index !== -1) {
              foundJobTitle = jobTitle;
              jobTitleIndex = index;
              console.log('🔍 Métier trouvé (insensible à la casse):', foundJobTitle, 'à la position:', jobTitleIndex);
              break;
            }
          }
        }
        
        if (foundJobTitle) {
          // Le métier trouvé est le début du titre
          // Chercher la fin du titre (F/H)
          const titleStart = startText.substring(jobTitleIndex);
          const fhIndex = titleStart.indexOf('F/H');
          
          if (fhIndex !== -1) {
            // Le titre va du métier jusqu'à F/H inclus
            info.title = titleStart.substring(0, fhIndex + 3).trim(); // +3 pour inclure "F/H"
            // L'entreprise est tout ce qui précède le métier
            info.company = startText.substring(0, jobTitleIndex).trim();
            console.log('🏢 Entreprise (par métier):', info.company);
            console.log('💼 Titre (par métier):', info.title);
          } else {
            // Pas de F/H trouvé, utiliser le fallback
            info.title = titleStart.trim();
            info.company = startText.substring(0, jobTitleIndex).trim();
            console.log('🏢 Entreprise (par métier, pas de F/H):', info.company);
            console.log('💼 Titre (par métier, pas de F/H):', info.title);
          }
        } else {
          // NOUVELLE LOGIQUE: Chercher les patterns spécifiques
          // Pattern 1: "ENTREPRISEmetier" (sans espace) - insensible à la casse
          for (const jobTitle of this.jobTitles) {
            const lowerJobTitle = jobTitle.toLowerCase();
            const pattern = new RegExp(`([A-Za-z][A-Za-z]+)${lowerJobTitle}`, 'i');
            const match = startText.match(pattern);
            if (match) {
              info.company = match[1].trim();
              // Chercher la fin du titre (F/H)
              const titleStart = startText.substring(match.index + match[1].length);
              const fhIndex = titleStart.indexOf('F/H');
              if (fhIndex !== -1) {
                info.title = titleStart.substring(0, fhIndex + 3).trim();
              } else {
                info.title = titleStart.trim();
              }
              console.log('🏢 Entreprise (pattern sans espace):', info.company);
              console.log('💼 Titre (pattern sans espace):', info.title);
              break;
            }
          }
          
          // Si pas trouvé, utiliser l'ancienne logique
          if (!info.title) {
            // Fallback: analyser caractère par caractère pour trouver la transition minuscule -> majuscule
            let companyEndIndex = -1;
            for (let i = 1; i < fullTitle.length - 1; i++) {
              const currentChar = fullTitle[i];
              const nextChar = fullTitle[i + 1];
              
              // Si on trouve une minuscule suivie d'une majuscule, c'est la séparation
              if (currentChar === currentChar.toLowerCase() && 
                  nextChar === nextChar.toUpperCase() && 
                  nextChar !== nextChar.toLowerCase()) {
                companyEndIndex = i + 1;
                break;
              }
            }
            
            if (companyEndIndex > 0) {
              info.company = fullTitle.substring(0, companyEndIndex).trim();
              info.title = fullTitle.substring(companyEndIndex).trim();
              console.log('🏢 Entreprise (séparation caractère):', info.company);
              console.log('💼 Titre (séparation caractère):', info.title);
            } else {
              // Fallback: chercher le premier mot qui commence par majuscule + minuscule
              const words = fullTitle.split(/\s+/);
              let titleStartIndex = -1;
              
              for (let i = 0; i < words.length; i++) {
                const word = words[i];
                if (/^[A-Z][a-z]/.test(word)) {
                  titleStartIndex = i;
                  break;
                }
              }
              
              if (titleStartIndex > 0) {
                info.company = words.slice(0, titleStartIndex).join(' ').trim();
                info.title = words.slice(titleStartIndex).join(' ').trim();
              } else if (titleStartIndex === 0) {
                info.title = fullTitle;
              } else {
                info.title = fullTitle;
              }
              
              console.log('🏢 Entreprise extraite:', info.company);
              console.log('💼 Titre extrait:', info.title);
            }
          }
        }
      }
    }
    
    // Si pas de F/H trouvé, utiliser une logique de fallback
    if (!info.title) {
      console.log('🔍 Pas de F/H trouvé, utilisation de la logique de fallback...');
      
      const simpleMatch = startText.match(/^([A-Z][A-Z\s]+?)\s+([A-Z][a-z].*?)(?=\s*[-;]|\s*Intervenir|\s*Vous|\s*Focus|\s*\d+)/);
      if (simpleMatch) {
        info.company = simpleMatch[1].trim();
        info.title = simpleMatch[2].trim();
        console.log('🏢 Entreprise (fallback):', info.company);
        console.log('💼 Titre (fallback):', info.title);
      }
    }
    
    // 5. EXTRACTION DE LA DESCRIPTION (les deux premières phrases après le titre)
    if (info.title) {
      // Trouver la position du titre dans le texte
      const titleIndex = cleanText.indexOf(info.title);
      if (titleIndex !== -1) {
        // Prendre le texte après le titre
        const textAfterTitle = cleanText.substring(titleIndex + info.title.length);
        // Extraire les deux premières phrases
        info.description = this.extractFirstTwoSentences(textAfterTitle);
        console.log('📝 Description extraite:', info.description.substring(0, 100) + '...');
      }
    }
    
    // Si pas de description extraite (titre non trouvé ou description vide), prendre les deux premières phrases du texte complet
    if (!info.description || info.description.trim().length === 0) {
      info.description = this.extractFirstTwoSentences(cleanText);
      console.log('📝 Description extraite du texte complet:', info.description.substring(0, 100) + '...');
    }
    
    // 6. EXTRACTION DE LA DATE DE PUBLICATION
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
      /(\d{1,2}-\d{1,2}-\d{4})/,
      /(\d{4}-\d{1,2}-\d{1,2})/
    ];
    
    for (const pattern of datePatterns) {
      const dateMatch = cleanText.match(pattern);
      if (dateMatch) {
        try {
          // Convertir la date en format ISO
          const dateStr = dateMatch[1];
          let dateObj;
          
          if (dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            dateObj = new Date(year, month - 1, day);
          } else if (dateStr.includes('-')) {
            dateObj = new Date(dateStr);
          }
          
          if (dateObj && !isNaN(dateObj.getTime())) {
            info.publishedDate = dateObj.toISOString().split('T')[0];
            console.log('📅 Date de publication trouvée:', info.publishedDate);
          }
        } catch (error) {
          console.log('⚠️ Erreur lors du parsing de la date:', dateMatch[1]);
        }
        break;
      }
    }
    
    // 7. EXTRACTION DE L'EXPÉRIENCE
    const experiencePatterns = [
      /(?:expérience|expérience\s*minimum|expérience\s*requise)\s*:?\s*(\d+\s*(?:ans?|années?))/i,
      /(\d+\s*(?:ans?|années?)\s*d'expérience)/i
    ];
    
    for (const pattern of experiencePatterns) {
      const expMatch = cleanText.match(pattern);
      if (expMatch) {
        info.experience = expMatch[1].trim();
        console.log('👨‍💼 Expérience trouvée:', info.experience);
        break;
      }
    }
    
    // 8. EXTRACTION DU TÉLÉTRAVAIL
    const teleworkPatterns = [
      /(télétravail|remote|hybride|home\s*office|travail\s*à\s*domicile)/i,
      /(présentiel|sur\s*site|bureau)/i
    ];
    
    for (const pattern of teleworkPatterns) {
      const teleworkMatch = cleanText.match(pattern);
      if (teleworkMatch) {
        info.telework = teleworkMatch[1].trim();
        console.log('🏠 Mode de travail trouvé:', info.telework);
        break;
      }
    }
    
    // 9. EXTRACTION DE LA DATE DE PRISE DE POSTE
    const startDatePatterns = [
      /(?:prise\s*de\s*poste|début|disponible)\s*:?\s*(\w+)/i,
      /(?:dès\s*que\s*possible|ASAP|immédiatement)/i
    ];
    
    for (const pattern of startDatePatterns) {
      const startMatch = cleanText.match(pattern);
      if (startMatch) {
        const extractedDate = startMatch[1] || 'Dès que possible';
        
        // Vérifier que ce n'est pas un mot de liaison
        const invalidWords = ['pour', 'avec', 'sur', 'dans', 'par', 'de', 'du', 'des', 'le', 'la', 'les', 'un', 'une'];
        if (!invalidWords.includes(extractedDate.toLowerCase())) {
          info.startDate = extractedDate;
          console.log('📅 Date de prise de poste trouvée:', info.startDate);
        } else {
          info.startDate = 'Dès que possible';
          console.log('📅 Date de prise de poste par défaut:', info.startDate);
        }
        break;
      }
    }
    
    console.log('🔍 Informations extraites:', {
      title: info.title,
      company: info.company,
      location: info.location,
      salary: info.salary,
      contractType: info.contractType,
      experience: info.experience,
      telework: info.telework,
      startDate: info.startDate,
      publishedDate: info.publishedDate,
      descriptionLength: info.description.length
    });
    
    return info;
  }

  /**
   * Extrait les deux premières phrases d'un texte
   */
  extractFirstTwoSentences(text) {
    if (!text || text.trim().length === 0) {
      return 'Description non disponible';
    }
    
    // Nettoyer le texte
    const cleanText = text.trim();
    
    // Pattern pour détecter les phrases (finissant par . ! ?)
    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [];
    
    if (sentences.length === 0) {
      // Si pas de ponctuation, prendre les 100 premiers caractères
      return cleanText.substring(0, 100) + (cleanText.length > 100 ? '...' : '');
    }
    
    // Prendre les deux premières phrases
    const firstTwoSentences = sentences.slice(0, 2).join(' ').trim();
    
    // Si les phrases sont trop courtes, prendre plus de contenu
    if (firstTwoSentences.length < 50 && sentences.length > 2) {
      return sentences.slice(0, 3).join(' ').trim();
    }
    
    return firstTwoSentences;
  }

  /**
   * Construit l'URL de recherche pour une page donnée
   */
  buildPageUrl(pageNum) {
    const baseUrl = 'https://www.apec.fr/candidat/recherche-emploi.html/emploi';
    const params = new URLSearchParams({
      typesConvention: '143684', // CDI
      typesConvention: '143685', // CDD
      typesConvention: '143686', // Stage
      typesConvention: '143687', // Alternance
      typesConvention: '143706', // Autres
      anciennetePublication: '101850', // Dernières 24h
      sortsType: 'DATE',
      page: (pageNum - 1).toString()
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Vérifie si une page est une page d'erreur
   */
  isErrorPage(pageTitle) {
    const errorKeywords = ['erreur', 'error', 'aucun résultat', 'no results', 'page non trouvée', 'not found'];
    const lowerTitle = pageTitle.toLowerCase();
    return errorKeywords.some(keyword => lowerTitle.includes(keyword));
  }

  /**
   * Obtient le prochain proxy de la liste avec rotation intelligente
   */
  getNextProxy(workerId) {
    let attempts = 0;
    const maxAttempts = this.proxyList.length;
    
    while (attempts < maxAttempts) {
      // Utiliser un index différent pour chaque worker pour éviter les conflits
      const workerProxyIndex = (this.currentProxyIndex + workerId) % this.proxyList.length;
      const proxy = this.proxyList[workerProxyIndex];
      this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxyList.length;
      
      // Vérifier si le proxy n'est pas marqué comme défaillant
      const proxyKey = `${proxy.host}:${proxy.port}`;
      if (!this.failedProxies.has(proxyKey)) {
        console.log(`🌐 Worker ${workerId}: Proxy sélectionné: ${proxy.host}:${proxy.port} (index: ${workerProxyIndex})`);
        return proxy;
      }
      
      attempts++;
    }
    
    // Si tous les proxies sont marqués comme défaillants, réinitialiser
    console.log(`⚠️ Worker ${workerId}: Tous les proxies sont marqués comme défaillants, réinitialisation...`);
    this.failedProxies.clear();
    return this.proxyList[0];
  }

  /**
   * Marque un proxy comme défaillant après plusieurs échecs
   */
  markProxyAsFailed(proxy, error) {
    const proxyKey = `${proxy.host}:${proxy.port}`;
    
    if (!this.failedProxies.has(proxyKey)) {
      this.failedProxies.add(proxyKey);
      console.log(`❌ Worker ${workerId}: Proxy marqué comme défaillant: ${proxyKey} (${error})`);
    }
  }

  /**
   * Obtient le nombre de proxies disponibles
   */
  getAvailableProxiesCount() {
    return this.proxyList.length - this.failedProxies.size;
  }

  /**
   * Obtient un user agent aléatoire
   */
  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Teste la connexion à la base de données
   */
  async testDatabaseConnection() {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Connexion à la base de données PostgreSQL réussie');
    } catch (error) {
      console.error('❌ Erreur de connexion à la base de données:', error.message);
      throw error;
    }
  }

  /**
   * Insère les jobs dans la base de données
   */
  async insertJobsToDatabase(jobs) {
    console.log(`[APEC CRON] Tentative d'insertion de ${jobs.length} jobs`);
    
    const client = await this.pool.connect();
    
    try {
      const query = `
        INSERT INTO apec_jobs (
          title, company, location, description, salary, contract_type,
          source, source_url, published_at, telework, tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
      
      let inserted = 0;
      let ignored = 0;
      
      for (const job of jobs) {
        // Pas de troncature - les offres ne sont pas longues
        const values = [
          job.title || '',
          job.company || '',
          job.location || '',
          job.description || '',
          job.salary || '',
          job.contractType || '',
          job.source || 'apec',
          job.sourceUrl || '',
          job.publishedAt || new Date().toISOString(),
          job.telework || '', // Garder la chaîne de caractères
          JSON.stringify(job.tags || [])
        ];
        
        try {
          const result = await client.query(query, values);
          
          if (result.rowCount > 0) {
            inserted++;
          } else {
            ignored++;
          }
        } catch (insertError) {
          // Si c'est une erreur de doublon, on ignore
          if (insertError.message.includes('duplicate key') || 
              insertError.message.includes('unique constraint')) {
            ignored++;
          } else {
            console.error(`❌ Erreur insertion job:`, insertError.message);
            console.error(`   Titre: ${job.title?.substring(0, 50)}...`);
            console.error(`   Entreprise: ${job.company?.substring(0, 30)}...`);
            ignored++;
          }
        }
      }
      
      console.log(`[APEC CRON] Insertion terminée: ${inserted} insérés, ${ignored} ignorés`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'insertion des jobs:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Sauvegarde les statistiques de scraping
   */
  async saveScrapingStats(stats) {
    const client = await this.pool.connect();
    
    try {
      const query = `
        INSERT INTO scraping_stats (
          scraper_name, jobs_found, jobs_inserted, pages_scraped, 
          duration_seconds, end_time, database_name, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `;
      
      const values = [
        'apec_cron',
        stats.jobs_found,
        stats.jobs_inserted,
        stats.pages_scraped,
        stats.duration_seconds,
        stats.end_time,
        stats.database
      ];
      
      await client.query(query, values);
      console.log('📊 Statistiques de scraping sauvegardées');
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des statistiques:', error.message);
    } finally {
      client.release();
    }
  }

  /**
   * Enregistre les erreurs dans la base de données
   */
  async logError(errorType, message, stack, context) {
    const client = await this.pool.connect();
    
    try {
      const query = `
        INSERT INTO error_logs (
          scraper_name, error_type, message, stack_trace, context, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `;
      
      const values = [
        'apec_cron',
        errorType,
        message,
        stack,
        JSON.stringify(context)
      ];
      
      await client.query(query, values);
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du log d\'erreur:', error.message);
    } finally {
      client.release();
    }
  }

  /**
   * Pause asynchrone
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Nettoie les skills en enlevant les mots non pertinents
   */
  cleanSkills(skills) {
    const nonSkills = [
      'Contrat', 'CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Intérim',
      'Temps plein', 'Temps partiel', 'Mission', 'Poste', 'Emploi', 'Offre',
      'Recherche', 'Disponible', 'Intégrer', 'Souhaitons', 'Cherchons',
      'Recherchons', 'Sommes', 'Personne', 'Mission', 'Aura', 'Pour',
      'Cette', 'Avec', 'Sur', 'Basé', 'Situé', 'Localisation', 'Lieu',
      'France', 'Français', 'Française', 'Annuel', 'Brut', 'Net', 'Salaire',
      'Rémunération', 'Expérience', 'Minimum', 'Maximum', 'Ans', 'Années',
      'Semaine', 'Heures', 'Horaire', 'Travail', 'Bureau', 'Site', 'Présentiel',
      'Hybride', 'Remote', 'Télétravail', 'Home office', 'Délivrer', 'Veiller',
      'Ordonnances', 'Stupéfiants', 'Médicaments', 'Pharmacie', 'Pharmacien',
      'Officine', 'Club', 'ClubOfficine', 'Pharmacien', 'H/F', 'F/H'
    ];
    
    return skills.filter(skill => 
      !nonSkills.some(nonSkill => 
        skill.toLowerCase().includes(nonSkill.toLowerCase())
      )
    );
  }

  /**
   * Met à jour la date de dernière exécution du scraper APEC
   */
  async updateLastExecutionDate() {
    try {
      console.log('🔄 Début de la mise à jour de la date de dernière exécution...');
      const currentDate = new Date().toISOString();
      console.log('📅 Date actuelle:', currentDate);
      
      // Vérifier si la table apec_scraping_stats existe, sinon la créer
      console.log('🔧 Création/vérification de la table apec_scraping_stats...');
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS apec_scraping_stats (
          id SERIAL PRIMARY KEY,
          scraper_name VARCHAR(100) UNIQUE NOT NULL,
          last_execution_time TIMESTAMP,
          status VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Table apec_scraping_stats prête');
      
      // Vérifier si l'enregistrement existe déjà
      const checkExisting = await this.pool.query(`
        SELECT id FROM apec_scraping_stats WHERE scraper_name = 'apec_cron'
      `);
      
      if (checkExisting.rows.length > 0) {
        // Mettre à jour l'enregistrement existant
        console.log('🔄 Mise à jour de l\'enregistrement existant...');
        await this.pool.query(`
          UPDATE apec_scraping_stats 
          SET last_execution_time = NOW(), 
              status = 'running',
              updated_at = NOW()
          WHERE scraper_name = 'apec_cron'
        `);
        console.log('✅ Enregistrement mis à jour avec succès');
      } else {
        // Créer un nouvel enregistrement
        console.log('🆕 Création d\'un nouvel enregistrement...');
        await this.pool.query(`
          INSERT INTO apec_scraping_stats (
            scraper_name, last_execution_time, status, created_at, updated_at
          ) VALUES ('apec_cron', NOW(), 'running', NOW(), NOW())
        `);
        console.log('✅ Nouvel enregistrement créé avec succès');
      }
      
      console.log('✅ Date de dernière exécution mise à jour avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la date de dernière exécution:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }

  /**
   * Met à jour le statut du scraper
   */
  async updateScraperStatus(status, message = '') {
    try {
      await this.pool.query(`
        UPDATE apec_scraping_stats 
        SET status = $1, updated_at = NOW()
        WHERE scraper_name = 'apec_cron'
      `, [status]);
      
      console.log(`✅ Statut du scraper mis à jour: ${status}${message ? ' - ' + message : ''}`);
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut:', error.message);
    }
  }

  /**
   * Initialise la liste des villes depuis apec_database
   */
  async initializeCitiesFromDatabase() {
    try {
      console.log('Chargement des villes françaises depuis apec_database.cities...');
      
      const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: 'apec_database'
      });

      const result = await pool.query('SELECT nom FROM cities ORDER BY population DESC, nom ASC');
      this.frenchCities = result.rows.map(row => ({ nom: row.nom }));

      await pool.end();
      
      console.log(`✅ ${this.frenchCities.length} villes françaises chargées depuis apec_database.cities`);
      
    } catch (error) {
      console.error('❌ Erreur chargement villes:', error.message);
      this.frenchCities = [];
    }
  }

  /**
   * Trouve une ville dans le texte en utilisant la liste des villes françaises
   */
  findCityInLoadedCities(text) {
    if (!this.frenchCities || this.frenchCities.length === 0) {
      return null;
    }

    const lowerText = text.toLowerCase();
    
    // Mots à ignorer
    const ignoreWords = ['le', 'la', 'les', 'de', 'du', 'des', 'et', 'ou', 'avec', 'pour', 'sur', 'dans', 'par', 'chez', 'via'];
    
    // Chercher les villes
    for (const city of this.frenchCities) {
      const cityName = city.nom;
      const lowerCityName = cityName.toLowerCase();
      
      if (lowerCityName.length < 4) continue;
      if (ignoreWords.includes(lowerCityName)) continue;
      
      // Chercher le nom complet de la ville
      if (lowerText.includes(lowerCityName)) {
        const cityRegex = new RegExp(`\\b${lowerCityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (cityRegex.test(text)) {
          return city;
        }
      }
      
      // GESTION SPÉCIALE POUR LES VILLES AVEC TIRETS
      if (lowerCityName.includes('-')) {
        // Variante 1: remplacer les tirets par des espaces
        const cityWithSpaces = lowerCityName.replace(/-/g, ' ');
        if (lowerText.includes(cityWithSpaces)) {
          const cityRegex = new RegExp(`\\b${cityWithSpaces.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (cityRegex.test(text)) {
            return city;
          }
        }
        
        // Variante 2: remplacer les tirets par rien
        const cityWithoutHyphens = lowerCityName.replace(/-/g, '');
        if (lowerText.includes(cityWithoutHyphens)) {
          const cityRegex = new RegExp(`\\b${cityWithoutHyphens.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (cityRegex.test(text)) {
            return city;
          }
        }
      }
      
      // GESTION SPÉCIALE POUR LES VILLES SANS TIRETS
      if (!lowerCityName.includes('-') && lowerCityName.includes(' ')) {
        const cityWithHyphens = lowerCityName.replace(/\s+/g, '-');
        if (lowerText.includes(cityWithHyphens)) {
          const cityRegex = new RegExp(`\\b${cityWithHyphens.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (cityRegex.test(text)) {
            return city;
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Vérifie si une chaîne est un code postal
   */
  isPostalCode(text) {
    return /^\d{5}$/.test(text.trim());
  }

  /**
   * Vérifie si une chaîne est numérique
   */
  isNumeric(text) {
    return /^\d+$/.test(text.trim());
  }
}

/**
 * Fonction principale
 */
async function runApecCron() {
  const scraper = new ApecCronScraper();
  await scraper.scrape();
  console.log('✅ Scraper APEC terminé');
}

// Exécuter si appelé directement
if (require.main === module) {
  runApecCron().catch(console.error);
}

module.exports = { ApecCronScraper, runApecCron };