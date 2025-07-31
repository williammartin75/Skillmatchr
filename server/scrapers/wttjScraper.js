const { chromium } = require('playwright');
const { Pool } = require('pg');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// Configuration globale des proxies (factorisée)
const PROXY_LIST = [
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

// Configuration globale des user agents (factorisée)
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0'
];

// Configuration des timeouts optimisés pour les proxies
const TIMEOUTS = {
  PAGE_LOAD: 60000,      // 60s pour charger une page (proxies lents)
  SELECTOR_WAIT: 30000,  // 30s pour attendre un sélecteur
  JOB_DETAILS: 40000,    // 40s pour les détails d'un job
  RETRY_DELAY: 10000,    // 10s avant réessai
  BETWEEN_JOBS: 3000,    // 3s entre chaque job
  BETWEEN_PAGES: 5000    // 5s entre chaque page
};

class WTTJScraper {
  constructor() {
    this.maxPages = 50; // Nombre de pages de jobs sur WTTJ
    this.jobs = [];
    this.databaseName = 'wttj_database';
    
    // Configuration de la base de données
    this.dbPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: this.databaseName,
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
      ssl: false,
    });
    
    // Utilisation des configurations globales factorisées
    this.proxyList = PROXY_LIST;
    this.userAgents = USER_AGENTS;
    
    this.failedProxies = new Set();
    this.currentProxyIndex = 0;
  }

  async initializeDatabase() {
    try {
      await this.dbPool.query('SELECT NOW()');
      console.log('✅ Connexion à la base de données WTTJ établie');
    } catch (error) {
      console.error('❌ Erreur de connexion à la base de données:', error.message);
      throw error;
    }
  }

  async createTables() {
    const client = await this.dbPool.connect();
    
    try {
      // Table des jobs (structure identique à JobTeaser)
      await client.query(`
        CREATE TABLE IF NOT EXISTS wttj_jobs (
          id SERIAL PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          company VARCHAR(200) NOT NULL,
          location VARCHAR(200),
          description TEXT,
          contract_type VARCHAR(100),
          salary VARCHAR(100),
          remote VARCHAR(100),
          source VARCHAR(50) DEFAULT 'wttj',
          source_url VARCHAR(500) UNIQUE,
          published_at TIMESTAMP,
          tags JSONB,
          start_date VARCHAR(100)
        )
      `);
      
      // Table des statistiques de scraping
      await client.query(`
        CREATE TABLE IF NOT EXISTS wttj_scraping_stats (
          id SERIAL PRIMARY KEY,
          scraper_name VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          status VARCHAR(50) DEFAULT 'running',
          first_run TIMESTAMP,
          last_run TIMESTAMP,
          jobs_found INTEGER DEFAULT 0,
          jobs_inserted INTEGER DEFAULT 0
        )
      `);
      
      console.log('✅ Tables WTTJ créées/vérifiées');
      
    } catch (error) {
      console.error('❌ Erreur création tables:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  getNextProxy(workerId) {
    // RANDOMISATION VRAIE des proxies - tous disponibles !
    const randomIndex = Math.floor(Math.random() * this.proxyList.length);
    const selectedProxy = this.proxyList[randomIndex];
    console.log(`🌐 Worker ${workerId}: Proxy RANDOM sélectionné: ${selectedProxy.host}:${selectedProxy.port} (${randomIndex + 1}/${this.proxyList.length} disponibles)`);
    
    return selectedProxy;
  }

  markProxyAsFailed(proxy, error) {
    if (proxy) {
      this.failedProxies.add(`${proxy.host}:${proxy.port}`);
      console.log(`❌ Proxy ${proxy.host}:${proxy.port} marqué comme défaillant: ${error}`);
    }
  }

  getAvailableProxiesCount() {
    return this.proxyList.length; // Tous les proxies sont disponibles
  }

  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  normalizeContractType(contractText) {
    if (!contractText) return 'Non précisé';
    
    const text = contractText.toLowerCase().trim();
    
    if (text.includes('stage') || text.includes('internship')) return 'Stage';
    if (text.includes('alternance') || text.includes('apprentissage')) return 'Alternance';
    if (text.includes('cdd') || text.includes('contrat à durée déterminée')) return 'CDD';
    if (text.includes('cdi') || text.includes('contrat à durée indéterminée')) return 'CDI';
    if (text.includes('graduate') || text.includes('programme')) return 'Graduate Program';
    if (text.includes('vie')) return 'VIE';
    if (text.includes('via')) return 'VIA';
    if (text.includes('étudiant') || text.includes('student')) return 'Job étudiant';
    if (text.includes('thèse') || text.includes('thesis')) return 'Thèse';
    if (text.includes('doctorat') || text.includes('phd')) return 'Doctorat';
    if (text.includes('freelance') || text.includes('indépendant')) return 'Freelance';
    if (text.includes('indépendant')) return 'Indépendant';
    if (text.includes('master thesis')) return 'Master Thesis';
    
    return contractText;
  }

  isFrenchLocation(location) {
    if (!location) return false;
    const frenchKeywords = ['france', 'paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes', 'strasbourg', 'montpellier', 'bordeaux', 'lille', 'rennes', 'reims', 'saint-étienne', 'toulon', 'le havre', 'grenoble', 'dijon', 'angers', 'villeurbanne', 'le mans', 'aix-en-provence', 'clermont-ferrand', 'brest', 'nîmes', 'limoges', 'tours', 'amiens', 'perpignan', 'métropole', 'région', 'département'];
    return frenchKeywords.some(keyword => location.toLowerCase().includes(keyword));
  }

  parseRelativeDate(dateText) {
    if (!dateText) return null;
    
    const now = new Date();
    const text = dateText.toLowerCase().trim();
    
    if (text.includes('aujourd\'hui') || text.includes('today')) {
      return now;
    }
    
    if (text.includes('hier') || text.includes('yesterday')) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    }
    
    if (text.includes('il y a')) {
      // Gérer les jours
      const dayMatch = text.match(/il y a (\d+) jour/);
      if (dayMatch) {
        const days = parseInt(dayMatch[1]);
        const date = new Date(now);
        date.setDate(date.getDate() - days);
        return date;
      }
      
      // Gérer les jours (pluriel)
      const daysMatch = text.match(/il y a (\d+) jours/);
      if (daysMatch) {
        const days = parseInt(daysMatch[1]);
        const date = new Date(now);
        date.setDate(date.getDate() - days);
        return date;
      }
      
      // Gérer les heures
      const hourMatch = text.match(/il y a (\d+) heure/);
      if (hourMatch) {
        const hours = parseInt(hourMatch[1]);
        const date = new Date(now);
        date.setHours(date.getHours() - hours);
        return date;
      }
      
      // Gérer les minutes
      const minuteMatch = text.match(/il y a (\d+) minute/);
      if (minuteMatch) {
        const minutes = parseInt(minuteMatch[1]);
        const date = new Date(now);
        date.setMinutes(date.getMinutes() - minutes);
        return date;
      }
    }
    
    // Essayer de parser une date complète
    const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      return new Date(year, month - 1, day);
    }
    
    return null;
  }

  async testDatabaseConnection() {
    try {
      const result = await this.dbPool.query('SELECT NOW() as current_time');
      console.log('✅ Test de connexion réussi:', result.rows[0].current_time);
      return true;
    } catch (error) {
      console.error('❌ Test de connexion échoué:', error.message);
      return false;
    }
  }

  async scrape() {
    const startTime = Date.now();
    console.log('🚀 Démarrage du scraper WTTJ pour les jobs...');
    console.log(`🌐 Configuration: ${this.proxyList.length} proxies disponibles, ${this.userAgents.length} User-Agents`);
    
    try {
      await this.initializeDatabase();
      await this.createTables();
      
      const browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      let context = null;
      let page = null;
      
      let totalJobs = 0;
      let processedJobs = 0;
      let errors = 0;
      let shouldStop = false;

      for (let pageNum = 1; pageNum <= this.maxPages && !shouldStop; pageNum++) {
        try {
          console.log(`📄 Scraping page ${pageNum}...`);
          
          // Changer de proxy pour chaque page
          if (context && pageNum > 1) {
            await context.close();
          }
          
          const proxy = this.getNextProxy('WTTJ');
          console.log(`🌐 Page ${pageNum} - Proxy sélectionné:`, proxy ? `${proxy.host}:${proxy.port}` : 'Aucun proxy');
          const contextOptions = {
            userAgent: this.getRandomUserAgent(),
            viewport: { width: 1920, height: 1080 },
            extraHTTPHeaders: {
              'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
              'Accept-Encoding': 'gzip, deflate, br',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          };

          // Ajouter le proxy si disponible
          if (proxy && proxy.host && proxy.port) {
            contextOptions.proxy = {
              server: `http://${proxy.host}:${proxy.port}`,
              username: proxy.username || undefined,
              password: proxy.password || undefined
            };
            console.log(`🌐 Page ${pageNum} - Proxy actif: ${proxy.host}:${proxy.port} | User-Agent: ${contextOptions.userAgent.substring(0, 50)}...`);
          } else {
            console.log(`🌐 Page ${pageNum} - Connexion directe (pas de proxy) | User-Agent: ${contextOptions.userAgent.substring(0, 50)}...`);
          }

          context = await browser.newContext(contextOptions);
          page = await context.newPage();
          
          // Désactiver les images et les styles pour améliorer les performances
          await page.route('**/*.{png,jpg,jpeg,gif,svg,css,woff,woff2}', route => route.abort());
          
          const jobsOnPage = await this.scrapeJobsPage(page, pageNum);
          
          // Vérifier si on est sur une page "aucun résultat trouvé"
          const noResultsText = await page.evaluate(() => {
            return document.body.textContent.includes('Nous n\'avons pas trouvé de jobs pour votre recherche');
          });
          
          if (noResultsText) {
            console.log('⚠️ Page "aucun résultat trouvé" détectée, arrêt du scraping');
            shouldStop = true;
            break;
          }
          
          if (jobsOnPage.length === 0) {
            console.log('⚠️ Aucun job trouvé sur cette page, attente de 10 secondes et réessai...');
            await page.waitForTimeout(10000); // Attendre 10 secondes
            
            // Réessayer de scraper la page
            const retryJobsOnPage = await this.scrapeJobsPage(page, pageNum);
            if (retryJobsOnPage.length === 0) {
              console.log('⚠️ Toujours aucun job après réessai, passage à la page suivante...');
              continue;
            } else {
              console.log(`✅ ${retryJobsOnPage.length} jobs trouvés après réessai`);
              jobsOnPage = retryJobsOnPage;
            }
          }
          
          totalJobs += jobsOnPage.length;
          
          // Sauvegarder les jobs de cette page
          if (jobsOnPage.length > 0) {
            console.log(`💾 Sauvegarde de ${jobsOnPage.length} jobs en base WTTJ...`);
            await this.insertJobsToDatabase(jobsOnPage);
            processedJobs += jobsOnPage.length;
            
            // Synchroniser avec la base unifiée
            console.log(`🔄 Synchronisation avec la base unifiée...`);
            await this.syncToUnifiedDatabase();
            console.log(`✅ Synchronisation terminée`);
          }
          
          // Pause entre les pages pour éviter la détection
          await this.sleep(2000 + Math.random() * 3000);
          
        } catch (error) {
          console.error(`❌ Erreur lors du scraping de la page ${pageNum}:`, error.message);
          errors++;
          continue;
        }
      }

      await browser.close();
      
      const executionTime = Date.now() - startTime;
      
      // Sauvegarder les statistiques
      await this.saveScrapingStats({
        jobs_found: totalJobs,
        jobs_inserted: processedJobs,
        errors_count: errors,
        execution_time_ms: executionTime,
        status: 'completed'
      });

      console.log('✅ Scraping WTTJ terminé avec succès!');
      console.log(`📊 Statistiques:`);
      console.log(`   - Jobs trouvés: ${totalJobs}`);
      console.log(`   - Jobs traités: ${processedJobs}`);
      console.log(`   - Erreurs: ${errors}`);
      console.log(`   - Temps d'exécution: ${(executionTime / 1000).toFixed(2)}s`);

      // Sauvegarder les statistiques de succès
      await this.saveScrapingStats({
        jobs_found: totalJobs,
        jobs_inserted: processedJobs,
        status: 'completed'
      });

      return {
        success: true,
        jobs_found: totalJobs,
        jobs_processed: processedJobs,
        errors: errors,
        execution_time: executionTime
      };

    } catch (error) {
      console.error('❌ Erreur critique lors du scraping WTTJ:', error);
      
      // Sauvegarder les statistiques d'erreur
      await this.saveScrapingStats({
        jobs_found: 0,
        jobs_inserted: 0,
        status: 'error'
      });

      return {
        success: false,
        error: error.message
      };
    } finally {
      await this.dbPool.end();
    }
  }

  async scrapeJobsPage(page, pageNum) {
    // URL avec tous les filtres demandés, triée par date récente
    const url = `https://www.welcometothejungle.com/fr/jobs?refinementList%5Bcontract_type%5D%5B%5D=full_time&refinementList%5Bcontract_type%5D%5B%5D=apprenticeship&refinementList%5Bcontract_type%5D%5B%5D=temporary&refinementList%5Bcontract_type%5D%5B%5D=internship&refinementList%5Bcontract_type%5D%5B%5D=freelance&refinementList%5Bcontract_type%5D%5B%5D=graduate_program&refinementList%5Bcontract_type%5D%5B%5D=other&refinementList%5Bcontract_type%5D%5B%5D=part_time&refinementList%5Bcontract_type%5D%5B%5D=vie&refinementList%5Bcontract_type%5D%5B%5D=volunteer&refinementList%5Bcontract_type%5D%5B%5D=idv&refinementList%5Boffices.country_code%5D%5B%5D=FR&refinementList%5Borganization.creation_year%5D%5B%5D=0-2010&page=${pageNum}&sortBy=mostRecent&collections%5B%5D=well_established&searchTitle=false`;
    
    try {
      // Naviguer vers l'URL de la page
              await page.goto(url, { waitUntil: 'load', timeout: TIMEOUTS.PAGE_LOAD });
      
      // Attendre 30 secondes pour que la page se recharge complètement
      await this.sleep(30000);
      
      // Attendre que les jobs se chargent (sélecteurs WTTJ)
      console.log(`🔍 Attente du chargement des jobs sur la page ${pageNum}...`);
      
      // Attendre que les jobs se chargent
              await page.waitForSelector('a[href*="/jobs/"]', { timeout: TIMEOUTS.SELECTOR_WAIT });
      
      // Attendre 7 secondes pour que le contenu dynamique se charge
      await this.sleep(7000);
      
      // Extraire les jobs de la page avec la même structure que JobTeaser
      const jobs = await page.evaluate(() => {
        // Essayer plusieurs sélecteurs pour trouver les liens de jobs
        const selectors = [
          'a[href*="/jobs/"]',
          'a[href*="/companies/"]',
          '.ais-Hits-item a',
          '.job-card a',
          '.search-result-item a',
          '.job-listing a',
          '.hit-item a',
          'article a[href*="/companies/"]'
        ];
        
        let jobLinks = [];
        for (const selector of selectors) {
          const links = document.querySelectorAll(selector);
          if (links.length > 0) {
            jobLinks = Array.from(links);
            console.log(`🔍 Trouvé ${links.length} liens avec le sélecteur: ${selector}`);
            break;
          }
        }
        
        const jobsOnPage = [];
        const processedUrls = new Set();
        
        jobLinks.forEach((link, index) => {
          try {
            const url = link.href;
            const title = link.textContent.trim();
            
            console.log(`🔍 Lien ${index + 1}: "${title}" -> ${url}`);
            
            // Éviter les doublons
            if (processedUrls.has(url)) {
              console.log(`⚠️ Doublon ignoré: ${url}`);
              return;
            }
            
            // Filtrer les liens de navigation (pas des vrais jobs)
            if (url.includes('/companies/wttj') || url.includes('qui-sommes-nous')) {
              console.log(`⚠️ Lien de navigation ignoré: ${url}`);
              return;
            }
            
            processedUrls.add(url);
            
            // Initialiser l'objet jobData comme JobTeaser
            const jobData = {
              title: '',
              company: '',
              location: '',
              description: '',
              contract: '',
              salary: 'Non précisé',
              telework: '',
              source: 'wttj',
              source_id: '',
              url: url,
              scraped_at: new Date().toISOString(),
              published_at: new Date().toISOString(),
              tags: ['wttj', 'emploi']
            };
            
            // Extraire le titre du job depuis le lien
            if (title && title !== 'Recrute activement !') {
              jobData.title = title;
            } else {
              // Chercher le titre dans les éléments parents
              const card = link.closest('article, .ais-Hits-item, .job-card, .search-result-item, .job-listing, .hit-item') || link.parentElement;
              const titleElement = card.querySelector('h3, h2, .job-title, .title, [data-testid="job-title"]');
              if (titleElement) {
                jobData.title = titleElement.textContent.trim();
              }
            }
            
            // Le nom de l'entreprise sera extrait depuis la page de détail plus tard
            // Pour l'instant, on garde l'URL comme fallback
            const urlParts = url.split('/');
            const companyIndex = urlParts.indexOf('companies');
            if (companyIndex !== -1 && urlParts[companyIndex + 1]) {
              const companySlug = urlParts[companyIndex + 1];
              jobData.company = companySlug.replace(/-/g, ' ');
            }
            
            // Ces informations seront extraites depuis la page de détail
            // Pour l'instant, on garde les valeurs par défaut
            
            // Générer un source_id unique
            jobData.source_id = url.split('/').pop() || `wttj_${Date.now()}_${index}`;
            
            // Vérifier si on a les informations minimales
            if (jobData.title && jobData.company) {
              jobsOnPage.push(jobData);
            }
            
          } catch (error) {
            console.error(`Erreur lors de l'extraction du job ${index}:`, error.message);
          }
        });
        
        return jobsOnPage;
      });
      
      // Extraire les détails depuis les pages de détail pour chaque job
      console.log(`\n📊 JOBS EXTRITS DE LA PAGE ${pageNum}:`);
      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        console.log(`\n🔍 === JOB ${i + 1} ===`);
        console.log(`📋 Titre: "${job.title}"`);
        
        // Extraire les détails depuis la page de détail
        const details = await this.extractJobDetailsFromDetailPage(page, job.url, i);
        
        // Mettre à jour le job avec les détails extraits
        job.location = details.location || job.location;
        job.contract = details.contract || 'Non précisé';
        job.salary = details.salary || job.salary;
        

        job.telework = details.telework || job.telework;
        job.published_at = details.published_date || job.published_at;
        job.description = details.description || job.description;
        
        // Utiliser le nom d'entreprise extrait de la page si disponible
        if (details.company && details.company.length > 0) {
          job.company = details.company;
        }
        
        // Afficher le nom d'entreprise après correction
        console.log(`🏢 Entreprise: "${job.company}"`);
        
        // Transformer la date relative en date réelle
        const realDate = this.parseRelativeDate(details.published_date);
        const formattedDate = realDate ? realDate.toLocaleDateString('fr-FR') : details.published_date;
        
        // Vérifier si le job est récent (publié dans les dernières 24h)
        const isRecent = details.published_date && (
          details.published_date.includes('aujourd\'hui') || 
          details.published_date.includes('hier') || 
          details.published_date.includes('il y a 1 jour') ||
          details.published_date.includes('il y a 2 jours') ||
          details.published_date.includes('il y a 3 jours') ||
          /il y a \d+ heures?/.test(details.published_date) ||
          /il y a \d+ minutes?/.test(details.published_date)
        );
        
        if (!isRecent) {
          console.log(`⚠️ Job non récent ignoré: "${details.published_date}"`);
          // Retirer le job de la liste s'il n'est pas récent
          jobs.splice(i, 1);
          i--; // Ajuster l'index
          continue;
        }
        
        console.log(`📍 Localisation: "${job.location}"`);
        console.log(`📄 Contrat: "${job.contract}"`);
        console.log(`💰 Salaire: "${job.salary}"`);
        console.log(`🏠 Télétravail: "${job.telework}"`);
        console.log(`📝 Description: "${job.description}"`);
        console.log(`📅 Date relative: "${job.published_at}"`);
        console.log(`📅 Date réelle: "${formattedDate}"`);
        console.log(`🔗 URL: ${job.url}`);
        console.log(`📊 Source ID: ${job.source_id}`);
        console.log(`---`);
        
        // Pause entre chaque page de détail pour éviter la détection
        await this.sleep(1000 + Math.random() * 2000);
      }
      
      return jobs;
      
    } catch (error) {
      console.error(`❌ Erreur lors du scraping de la page ${pageNum}:`, error.message);
      return [];
    }
  }

  async extractJobDetailsFromDetailPage(page, jobUrl, jobIndex) {
    try {
      console.log(`🔍 Extraction des détails pour le job ${jobIndex + 1}: ${jobUrl}`);
      
      await page.goto(jobUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await this.sleep(1000);
      
      const details = await page.evaluate(() => {
        const jobDetails = {
          location: '',
          contract: '',
          salary: '',
          telework: '',
          published_date: '',
          company: '',
          description: ''
        };
        
        const pageText = document.body.textContent;
        
        // Extraire le nom de l'entreprise et la localisation depuis la balise JSON-LD dédiée
        const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
        let debugInfo = '';
        
        if (jsonLdScript) {
          debugInfo += '✅ Balise JSON-LD trouvée\n';
          try {
            const jsonData = JSON.parse(jsonLdScript.textContent);
            debugInfo += '📋 JSON-LD parsé avec succès\n';
            
            // Extraire le nom de l'entreprise
            if (jsonData.hiringOrganization && jsonData.hiringOrganization.name) {
              jobDetails.company = jsonData.hiringOrganization.name;
              debugInfo += `🏢 Entreprise extraite: ${jobDetails.company}\n`;
            } else {
              debugInfo += '❌ Structure hiringOrganization non trouvée\n';
            }
            
            // Extraire la localisation
            debugInfo += `🔍 Recherche jobLocation: ${JSON.stringify(jsonData.jobLocation)}\n`;
            
            let location = "";
            if (Array.isArray(jsonData.jobLocation)) {
              // Si c'est un tableau, boucler sur chaque élément
              for (const loc of jsonData.jobLocation) {
                if (loc?.address?.addressLocality) {
                  location = loc.address.addressLocality;
                  break; // on prend la première localisation trouvée
                }
              }
            } else if (jsonData.jobLocation?.address?.addressLocality) {
              // Si c'est un objet simple
              location = jsonData.jobLocation.address.addressLocality;
            }
            
            if (location) {
              jobDetails.location = location;
              debugInfo += `📍 Localisation extraite: ${jobDetails.location}\n`;
            } else {
              debugInfo += '❌ Structure jobLocation.address.addressLocality non trouvée\n';
              debugInfo += `📋 jobLocation disponible: ${JSON.stringify(jsonData.jobLocation)}\n`;
            }
          } catch (error) {
            debugInfo += `❌ Erreur parsing JSON-LD: ${error.message}\n`;
          }
        } else {
          debugInfo += '❌ Balise JSON-LD non trouvée\n';
        }
        
        jobDetails.debug = debugInfo;
        
        // Extraire la description du job
        // Chercher la section "Descriptif du poste"
        let descriptionText = '';
        
        for (const element of document.querySelectorAll('*')) {
          const text = element.textContent;
          if (text && text.includes('Descriptif du poste')) {
            // Trouver le prochain élément qui contient la description
            const nextElement = element.nextElementSibling;
            if (nextElement) {
              descriptionText = nextElement.textContent.trim();
              break;
            }
          }
        }
        
        // Si pas trouvé, chercher dans tout le texte de la page
        if (!descriptionText) {
          const descMatch = pageText.match(/Descriptif du poste\s*([^]*?)(?=\n\n|\n[A-Z]|$)/);
          if (descMatch) {
            descriptionText = descMatch[1].trim();
          }
        }
        
        // Prendre les deux premières phrases
        if (descriptionText) {
          const sentences = descriptionText.split(/[.!?]+/).filter(s => s.trim().length > 0);
          if (sentences.length >= 2) {
            jobDetails.description = sentences[0].trim() + '. ' + sentences[1].trim() + '.';
          } else if (sentences.length === 1) {
            jobDetails.description = sentences[0].trim() + '.';
          }
        }
        

        
        // Extraire le contrat depuis le contenu
        if (pageText.includes('CDI')) {
          jobDetails.contract = 'CDI';
        } else if (pageText.includes('CDD')) {
          jobDetails.contract = 'CDD';
        } else if (pageText.includes('Stage')) {
          jobDetails.contract = 'Stage';
        } else if (pageText.includes('Alternance')) {
          jobDetails.contract = 'Alternance';
        } else if (pageText.includes('Freelance')) {
          jobDetails.contract = 'Freelance';
        }
        
        // Extraire le salaire depuis __NEXT_DATA__ - Solution robuste
        const nextDataScript = document.querySelector('script#__NEXT_DATA__');
        if (!nextDataScript) {
          debugInfo += '❌ Balise __NEXT_DATA__ introuvable\n';
        } else {
          try {
            const nextData = JSON.parse(nextDataScript.textContent);
            debugInfo += '✅ __NEXT_DATA__ parsé avec succès\n';

            const queries = nextData?.props?.pageProps?.dehydratedState?.queries;
            if (!queries || !Array.isArray(queries)) {
              debugInfo += '❌ Queries non trouvées dans NEXT_DATA\n';
            } else {
              debugInfo += `✅ ${queries.length} queries trouvées\n`;
              
              // Cherche la première occurrence avec un job et un salaire
              const jobQuery = queries.find(q =>
                q?.state?.data?.job?.salary?.minAmount
              );

              if (jobQuery) {
                const salary = jobQuery.state.data.job.salary;
                debugInfo += `✅ Salaire trouvé dans query: ${JSON.stringify(salary)}\n`;
                
                if (salary.minAmount && salary.maxAmount) {
                  const minK = (salary.minAmount / 1000).toFixed(1);
                  const maxK = (salary.maxAmount / 1000).toFixed(1);
                  const unit = salary.unitText === 'MONTH' ? 'mois' : salary.unitText === 'YEAR' ? 'an' : '';
                  jobDetails.salary = `${minK}K à ${maxK}K € par ${unit}`;
                  debugInfo += `💰 Salaire formaté: ${jobDetails.salary}\n`;
                } else if (salary.minAmount) {
                  const minK = (salary.minAmount / 1000).toFixed(1);
                  const unit = salary.unitText === 'MONTH' ? 'mois' : salary.unitText === 'YEAR' ? 'an' : '';
                  jobDetails.salary = `À partir de ${minK}K € par ${unit}`;
                  debugInfo += `💰 Salaire formaté: ${jobDetails.salary}\n`;
                } else if (salary.maxAmount) {
                  const maxK = (salary.maxAmount / 1000).toFixed(1);
                  const unit = salary.unitText === 'MONTH' ? 'mois' : salary.unitText === 'YEAR' ? 'an' : '';
                  jobDetails.salary = `Jusqu'à ${maxK}K € par ${unit}`;
                  debugInfo += `💰 Salaire formaté: ${jobDetails.salary}\n`;
                } else if (salary.text) {
                  // Nettoyer le salaire textuel qui peut contenir du HTML encodé
                  let cleanSalary = salary.text;
                  // Décoder les caractères HTML
                  cleanSalary = cleanSalary.replace(/\\u003C/g, '<').replace(/\\u003E/g, '>').replace(/\\u002F/g, '/');
                  // Enlever les balises HTML
                  cleanSalary = cleanSalary.replace(/<[^>]*>/g, '');
                  // Nettoyer les espaces multiples
                  cleanSalary = cleanSalary.replace(/\s+/g, ' ').trim();
                  // Prendre seulement la partie avant le premier < ou \n
                  cleanSalary = cleanSalary.split(/[<\n]/)[0].trim();
                  
                  jobDetails.salary = cleanSalary;
                  debugInfo += `💰 Salaire nettoyé: ${jobDetails.salary}\n`;
                }
              } else {
                debugInfo += '❌ Aucune query avec salaire trouvée\n';
              }
            }

          } catch (err) {
            debugInfo += `❌ Erreur parse __NEXT_DATA__: ${err.message}\n`;
          }
        }
        
        // Fallback: extraire le salaire depuis le texte si pas trouvé dans __NEXT_DATA__
        if (!jobDetails.salary || jobDetails.salary === 'Non précisé') {
          debugInfo += '🔍 Tentative d\'extraction salaire depuis le texte...\n';
          
          // Chercher "Salaire :" suivi du texte jusqu'à la fin de ligne ou jusqu'au prochain mot clé
          const salaryMatch = pageText.match(/Salaire\s*:\s*([^\n\r]+?)(?=\n|Début|Expérience|Éducation|Postuler|Sauvegarder|il y a|Partager|Copier|Facebook|Linkedin|Cette offre|{)/i);
          if (salaryMatch) {
            let salary = salaryMatch[1].trim();
            debugInfo += `🔍 Match salaire brut: "${salary}"\n`;
            
            // Nettoyer le HTML encodé
            salary = salary.replace(/\\u003C/g, '<').replace(/\\u003E/g, '>').replace(/\\u002F/g, '/');
            // Enlever les balises HTML
            salary = salary.replace(/<[^>]*>/g, '');
            // Nettoyer les espaces multiples
            salary = salary.replace(/\s+/g, ' ').trim();
            // Prendre seulement la partie avant le premier < ou \n
            salary = salary.split(/[<\n]/)[0].trim();
            
            debugInfo += `🔍 Match salaire nettoyé: "${salary}"\n`;
            
            if (salary.includes('Non spécifié') || salary.includes('Non spécifiée')) {
              jobDetails.salary = 'Non spécifié';
              debugInfo += '💰 Salaire défini comme "Non spécifié"\n';
            } else if (salary.includes('€') || salary.includes('K') || salary.includes('k')) {
              jobDetails.salary = salary;
              debugInfo += `💰 Salaire extrait (fallback): ${salary}\n`;
            } else {
              jobDetails.salary = 'Non spécifié';
              debugInfo += '💰 Salaire non reconnu, défini comme "Non spécifié"\n';
            }
          } else {
            jobDetails.salary = 'Non spécifié';
            debugInfo += '❌ Aucun match salaire trouvé dans le texte\n';
          }
        }
        
        // Extraire le télétravail de manière plus précise
        if (pageText.includes('Télétravail fréquent')) {
          jobDetails.telework = 'Fréquent';
        } else if (pageText.includes('Télétravail occasionnel')) {
          jobDetails.telework = 'Occasionnel';
        } else if (pageText.includes('Télétravail autorisé')) {
          jobDetails.telework = 'Autorisé';
        } else if (pageText.includes('Télétravail non autorisé')) {
          jobDetails.telework = 'Non autorisé';
        } else if (pageText.includes('Télétravail hybride')) {
          jobDetails.telework = 'Hybride';
        } else if (pageText.includes('Télétravail total')) {
          jobDetails.telework = 'Total';
        } else if (pageText.includes('Télétravail possible')) {
          jobDetails.telework = 'Possible';
        } else if (pageText.includes('Télétravail')) {
          jobDetails.telework = 'Précisé';
        }
        
        // Extraire la date
        const dateMatch = pageText.match(/(il y a \d+ (?:heure|heures|minute|minutes|jour|jours))/i);
        if (dateMatch) {
          jobDetails.published_date = dateMatch[1].trim();
          console.log('🔍 DEBUG - Date extraite:', jobDetails.published_date);
        } else {
          console.log('🔍 DEBUG - Aucune date trouvée dans le texte');
        }
        
        return jobDetails;
      });
      
      // Afficher les détails extraits
      console.log(`🏢 Entreprise extraite: "${details.company}"`);
      console.log(`📍 Localisation extraite: "${details.location}"`);
      console.log(`📄 Contrat extrait: "${details.contract}"`);
      console.log(`💰 Salaire extrait: "${details.salary}"`);
      console.log(`📅 Date extraite: "${details.published_date}"`);
      console.log(`🏠 Télétravail extrait: "${details.telework}"`);
      console.log(`📝 Description extraite: "${details.description}"`);
      console.log(`📅 Date extraite: "${details.published_date}"`);
      
      // Afficher les informations de debug
      if (details.debug) {
        console.log('🔍 DEBUG JSON-LD:');
        console.log(details.debug);
      }
      
      return details;
      
    } catch (error) {
      console.error(`❌ Erreur lors de l'extraction des détails du job ${jobIndex + 1}:`, error.message);
      return {
        location: '',
        contract: '',
        salary: '',
        telework: '',
        published_date: '',
        company: '',
        description: ''
      };
    }
  }

  async insertJobsToDatabase(jobs) {
    if (jobs.length === 0) return;
    
    try {
      const client = await this.dbPool.connect();
      
      for (const job of jobs) {
        try {
                      // Normaliser le type de contrat (sans limitation de longueur)
            job.contract = this.normalizeContractType(job.contract);
          
          // Parser la date de publication
          const publishedAt = this.parseRelativeDate(job.published_date);
          
          await client.query(`
            INSERT INTO wttj_jobs 
            (title, company, location, description, contract, salary, telework, source, source_id, url, published_at, tags)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (source_id) DO UPDATE SET
              title = EXCLUDED.title,
              company = EXCLUDED.company,
              location = EXCLUDED.location,
              description = EXCLUDED.description,
              contract = EXCLUDED.contract,
              salary = EXCLUDED.salary,
              telework = EXCLUDED.telework,
              url = EXCLUDED.url,
              published_at = EXCLUDED.published_at,
              tags = EXCLUDED.tags
          `, [
            job.title,
            job.company,
            job.location,
            job.description,
            job.contract,
            job.salary,
            job.telework,
            'wttj',
            job.source_id,
            job.url,
            publishedAt,
            JSON.stringify(job.tags || [])
          ]);
          
        } catch (error) {
          console.error(`❌ Erreur lors de l'insertion de ${job.title}:`, error.message);
        }
      }
      
      client.release();
      console.log(`✅ ${jobs.length} jobs insérés/mis à jour en base`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'insertion en base:', error.message);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async syncToUnifiedDatabase() {
    try {
      console.log('🔄 Synchronisation WTTJ vers la base unifiée...');
      
      const unifiedPool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: 'jobs_database',
        password: process.env.DB_PASSWORD || 'password',
        port: process.env.DB_PORT || 5432,
        ssl: false,
      });

      // Récupérer seulement les jobs WTTJ créés aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const wttjJobs = await this.dbPool.query(
        'SELECT * FROM wttj_jobs WHERE DATE(created_at) = $1',
        [today]
      );
      
      let syncedCount = 0;
      let errorCount = 0;

      for (const job of wttjJobs.rows) {
        try {
          await unifiedPool.query(`
            INSERT INTO jobs 
            (title, company, location, description, contract_type, salary, remote, source, original_id, url, published_at, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
            ON CONFLICT (original_id, source) DO UPDATE SET
              title = EXCLUDED.title,
              company = EXCLUDED.company,
              location = EXCLUDED.location,
              description = EXCLUDED.description,
              contract_type = EXCLUDED.contract_type,
              salary = EXCLUDED.salary,
              remote = EXCLUDED.remote,
              url = EXCLUDED.url,
              published_at = EXCLUDED.published_at,
              updated_at = CURRENT_TIMESTAMP
          `, [
            job.title,
            job.company,
            job.location,
            job.description,
            job.contract,
            job.salary,
            job.telework,
            'wttj',
            job.source_id,
            job.url,
            job.published_at
          ]);
          
          syncedCount++;
        } catch (error) {
          console.error(`❌ Erreur sync pour ${job.title}:`, error.message);
          errorCount++;
        }
      }

      await unifiedPool.end();
      
      console.log(`✅ Synchronisation WTTJ terminée: ${syncedCount} jobs synchronisés, ${errorCount} erreurs`);
      
      return {
        success: true,
        synced_count: syncedCount,
        error_count: errorCount
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation WTTJ:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async saveScrapingStats(stats) {
    try {
      // Vérifier si une entrée existe déjà pour aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      
      const existingStats = await this.dbPool.query(
        'SELECT id FROM wttj_scraping_stats WHERE scraper_name = $1 AND DATE(created_at) = $2',
        ['wttj_scraper', today]
      );
      
      if (existingStats.rows.length > 0) {
        // Mettre à jour l'entrée existante
        await this.dbPool.query(`
          UPDATE wttj_scraping_stats 
          SET 
            jobs_found = $1,
            jobs_inserted = $2,
            last_run = NOW(),
            execution_date = NOW(),
            status = 'completed'
          WHERE scraper_name = $3 AND DATE(created_at) = $4
        `, [stats.jobs_found, stats.jobs_inserted, 'wttj_scraper', today]);
      } else {
        // Créer une nouvelle entrée
        await this.dbPool.query(`
          INSERT INTO wttj_scraping_stats (
            scraper_name, created_at, status, first_run, last_run, execution_date, jobs_found, jobs_inserted
          ) VALUES ($1, NOW(), 'completed', NOW(), NOW(), NOW(), $2, $3)
        `, ['wttj_scraper', stats.jobs_found, stats.jobs_inserted]);
      }
      
      console.log('✅ Statistiques de scraping WTTJ sauvegardées');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des statistiques:', error.message);
    }
  }
}

// Configuration des types de contrats à parcourir séquentiellement
const CONTRACT_TYPES = [
  {
    name: 'CDI',
    url: 'https://www.welcometothejungle.com/fr/jobs?refinementList%5Boffices.country_code%5D%5B%5D=FR&refinementList%5Bcontract_type%5D%5B%5D=full_time&page=1&sortBy=mostRecent'
  },
  {
    name: 'CDD/Temporaire',
    url: 'https://www.welcometothejungle.com/fr/jobs?refinementList%5Boffices.country_code%5D%5B%5D=FR&refinementList%5Bcontract_type%5D%5B%5D=temporary&page=1&sortBy=mostRecent'
  },
  {
    name: 'Alternance',
    url: 'https://www.welcometothejungle.com/fr/jobs?refinementList%5Boffices.country_code%5D%5B%5D=FR&refinementList%5Bcontract_type%5D%5B%5D=apprenticeship&page=1&sortBy=mostRecent'
  },
  {
    name: 'Stage',
    url: 'https://www.welcometothejungle.com/fr/jobs?refinementList%5Boffices.country_code%5D%5B%5D=FR&refinementList%5Bcontract_type%5D%5B%5D=internship&page=1&sortBy=mostRecent'
  },
  {
    name: 'Freelance',
    url: 'https://www.welcometothejungle.com/fr/jobs?refinementList%5Boffices.country_code%5D%5B%5D=FR&refinementList%5Bcontract_type%5D%5B%5D=freelance&page=1&sortBy=mostRecent'
  },
  {
    name: 'Autres',
    url: 'https://www.welcometothejungle.com/fr/jobs?refinementList%5Boffices.country_code%5D%5B%5D=FR&refinementList%5Bcontract_type%5D%5B%5D=other&page=1&sortBy=mostRecent'
  },
  {
    name: 'Temps partiel',
    url: 'https://www.welcometothejungle.com/fr/jobs?refinementList%5Boffices.country_code%5D%5B%5D=FR&refinementList%5Bcontract_type%5D%5B%5D=part_time&page=1&sortBy=mostRecent'
  },
  {
    name: 'VIE/Volontariat/Programme',
    url: 'https://www.welcometothejungle.com/fr/jobs?refinementList%5Boffices.country_code%5D%5B%5D=FR&refinementList%5Bcontract_type%5D%5B%5D=vie&refinementList%5Bcontract_type%5D%5B%5D=volunteer&refinementList%5Bcontract_type%5D%5B%5D=graduate_program&page=1&sortBy=mostRecent'
  }
];

// URLs de départ pour distribuer la charge entre les workers (maintenu pour compatibilité)
const START_URLS = CONTRACT_TYPES.map(contract => contract.url);

class WTTJMultiScraper {
  constructor() {
    this.workers = [];
    this.results = [];
    this.activeWorkers = 0;
    this.maxWorkers = 10; // Réduit de 20 à 10 pour éviter la surcharge
    this.proxyIndex = 0;
    this.userAgentIndex = 0;
    
    // Configuration de la base de données
    this.wttjPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'wttj_database',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
      ssl: false,
    });
    
    this.unifiedPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'jobs_database',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
      ssl: false,
    });
  }

  getNextProxy() {
    if (PROXY_LIST.length === 0) return null;
    const proxy = PROXY_LIST[this.proxyIndex % PROXY_LIST.length];
    this.proxyIndex++;
    return proxy;
  }

  getNextUserAgent() {
    const userAgent = USER_AGENTS[this.userAgentIndex % USER_AGENTS.length];
    this.userAgentIndex++;
    return userAgent;
  }

  async createWorker(workerId, startUrl) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: {
          workerId,
          startUrl,
          proxy: this.getNextProxy(),
          userAgent: this.getNextUserAgent(),
          dbConfig: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
          }
        }
      });

      worker.on('message', (message) => {
        if (message.type === 'result') {
          this.results.push(message.data);
          console.log(`Worker ${workerId}: ${message.data.jobsFound} jobs trouvés`);
        } else if (message.type === 'error') {
          console.error(`Worker ${workerId} error:`, message.error);
        } else if (message.type === 'complete') {
          console.log(`Worker ${workerId} terminé`);
          this.activeWorkers--;
          resolve();
        }
      });

      worker.on('error', (error) => {
        console.error(`Worker ${workerId} error:`, error);
        this.activeWorkers--;
        reject(error);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker ${workerId} exited with code ${code}`);
        }
        this.activeWorkers--;
      });

      this.workers.push(worker);
      this.activeWorkers++;
    });
  }

  async run() {
    console.log('🚀 Démarrage du multi-scraping WTTJ avec parcours séquentiel des types de contrats...');
    console.log(`📊 Configuration:`);
    console.log(`   - Types de contrats: ${CONTRACT_TYPES.length}`);
    console.log(`   - Proxies disponibles: ${PROXY_LIST.length}`);
    console.log(`   - User agents: ${USER_AGENTS.length}`);
    console.log(`   - Timeouts: ${JSON.stringify(TIMEOUTS, null, 2)}`);
    console.log('');
    
    const startTime = Date.now();
    let totalJobsFound = 0;
    let totalJobsInserted = 0;
    
    // Parcourir séquentiellement chaque type de contrat
    for (let contractIndex = 0; contractIndex < CONTRACT_TYPES.length; contractIndex++) {
      const contract = CONTRACT_TYPES[contractIndex];
      console.log(`\n🎯 Début du scraping pour: ${contract.name}`);
      console.log(`   - URL: ${contract.url.substring(0, 80)}...`);
      console.log(`   - Progression: ${contractIndex + 1}/${CONTRACT_TYPES.length}`);
      console.log('');
      
      // Réinitialiser les résultats pour ce type de contrat
      this.results = [];
      
      // Créer et démarrer les workers pour ce type de contrat
      const workerPromises = [];
      
      for (let i = 0; i < this.maxWorkers; i++) {
        const workerId = i + 1;
        const proxy = this.getNextProxy();
        const userAgent = this.getNextUserAgent();
        
        console.log(`🔧 Création du worker ${workerId} pour ${contract.name}:`);
        console.log(`   - Proxy: ${proxy ? `${proxy.host}:${proxy.port}` : 'Aucun'}`);
        console.log(`   - User Agent: ${userAgent.substring(0, 50)}...`);
        
        const workerPromise = this.createWorker(workerId, contract.url);
        workerPromises.push(workerPromise);
        
        // Attendre un peu entre chaque création de worker
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Attendre que tous les workers terminent pour ce type de contrat
      await Promise.all(workerPromises);
      
      // Calculer les résultats pour ce type de contrat
      const contractJobsFound = this.results.reduce((sum, r) => sum + r.jobsFound, 0);
      const contractJobsInserted = this.results.reduce((sum, r) => sum + r.jobsInserted, 0);
      
      totalJobsFound += contractJobsFound;
      totalJobsInserted += contractJobsInserted;
      
      console.log(`\n✅ ${contract.name} terminé: ${contractJobsFound} jobs trouvés, ${contractJobsInserted} insérés`);
      
      // Sauvegarder les stats pour ce type de contrat
      await this.saveScrapingStatsForContract(contract.name, contractJobsFound, contractJobsInserted);
      
      // Synchroniser avec la base unifiée pour ce type de contrat
      console.log(`🔄 Synchronisation des jobs ${contract.name} avec la base unifiée...`);
      await this.syncToUnifiedDatabase();
      console.log(`✅ Synchronisation ${contract.name} terminée`);
      
      // Pause entre les types de contrats
      if (contractIndex < CONTRACT_TYPES.length - 1) {
        console.log(`\n⏳ Pause de 10 secondes avant le prochain type de contrat...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log('\n📊 Résultats finaux du multi-scraping:');
    console.log(`⏱️  Durée totale: ${duration} secondes`);
    console.log(`🎯 Types de contrats traités: ${CONTRACT_TYPES.length}`);
    console.log(`👥 Workers utilisés: ${this.maxWorkers}`);
    console.log(`📈 Jobs trouvés au total: ${totalJobsFound}`);
    console.log(`💾 Jobs insérés au total: ${totalJobsInserted}`);
    console.log(`⚡ Performance: ${Math.round(totalJobsFound / duration)} jobs/seconde`);
    
    // Détail par type de contrat
    console.log('\n📋 Résumé par type de contrat:');
    for (let i = 0; i < CONTRACT_TYPES.length; i++) {
      const contract = CONTRACT_TYPES[i];
      console.log(`   ${contract.name}: traité`);
    }

    // Sauvegarder les stats finales
    await this.saveScrapingStats();

    console.log('✅ Multi-scraping WTTJ terminé !');
  }

  async saveScrapingStatsForContract(contractName, jobsFound, jobsInserted) {
    try {
      await this.wttjPool.query(`
        INSERT INTO wttj_scraping_stats (scraper_name, created_at, status, first_run, last_run, execution_date, jobs_found, jobs_inserted)
        VALUES ($1, NOW(), $2, NOW(), NOW(), NOW(), $3, $4)
        ON CONFLICT (scraper_name) 
        DO UPDATE SET 
          last_run = NOW(),
          execution_date = NOW(),
          jobs_found = jobs_found + $3,
          jobs_inserted = jobs_inserted + $4
      `, [`wttj_multi_scraper_${contractName}`, 'completed', jobsFound, jobsInserted]);

      console.log(`📊 Stats sauvegardées pour ${contractName}`);
    } catch (error) {
      console.error(`❌ Erreur sauvegarde stats pour ${contractName}:`, error);
    }
  }

  async saveScrapingStats() {
    try {
      const totalJobsFound = this.results.reduce((sum, r) => sum + r.jobsFound, 0);
      const totalJobsInserted = this.results.reduce((sum, r) => sum + r.jobsInserted, 0);

      await this.wttjPool.query(`
        INSERT INTO wttj_scraping_stats (scraper_name, created_at, status, first_run, last_run, execution_date, jobs_found, jobs_inserted)
        VALUES ($1, NOW(), $2, NOW(), NOW(), NOW(), $3, $4)
        ON CONFLICT (scraper_name) 
        DO UPDATE SET 
          last_run = NOW(),
          execution_date = NOW(),
          jobs_found = $3,
          jobs_inserted = $4
      `, ['wttj_multi_scraper', 'completed', totalJobsFound, totalJobsInserted]);

      console.log('📊 Stats finales sauvegardées');
    } catch (error) {
      console.error('❌ Erreur sauvegarde stats finales:', error);
    }
  }

  async syncToUnifiedDatabase() {
    try {
      console.log('🔄 Synchronisation avec la base unifiée...');
      
      const result = await this.wttjPool.query(`
        SELECT * FROM wttj_jobs WHERE DATE(created_at) = CURRENT_DATE
      `);

      if (result.rows.length === 0) {
        console.log('ℹ️ Aucun nouveau job à synchroniser');
        return;
      }

      let insertedCount = 0;
      for (const job of result.rows) {
        try {
          await this.unifiedPool.query(`
            INSERT INTO jobs (title, company, location, salary, description, source, original_id, url, contract_type, remote, tags, published_at, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
            ON CONFLICT (original_id, source) DO NOTHING
          `, [
            job.title,
            job.company,
            job.location,
            job.salary,
            job.description,
            'wttj',
            job.source_id,
            job.url,
            job.contract,
            job.telework,
            job.tags || [],
            job.published_at
          ]);

          insertedCount++;
        } catch (error) {
          console.error('❌ Erreur insertion job:', error);
        }
      }

      console.log(`✅ ${insertedCount} jobs synchronisés vers la base unifiée`);
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
    }
  }

  async cleanup() {
    for (const worker of this.workers) {
      worker.terminate();
    }
    await this.wttjPool.end();
    await this.unifiedPool.end();
  }
}

async function runWTTJScraper() {
  const scraper = new WTTJScraper();
  return await scraper.scrape();
}

async function runWTTJMultiScraper() {
  const multiScraper = new WTTJMultiScraper();
  try {
    await multiScraper.run();
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur multi-scraper:', error);
    return { success: false, error: error.message };
  } finally {
    await multiScraper.cleanup();
  }
}

// Code du worker
if (!isMainThread) {
  const { workerId, startUrl, proxy, userAgent, dbConfig } = workerData;
  
  const workerWttjPool = new Pool({
    host: dbConfig.host,
    port: dbConfig.port,
    database: 'wttj_database',
    user: dbConfig.user,
    password: dbConfig.password,
  });

  class WTTJWorker {
    constructor() {
      this.browser = null;
      this.page = null;
      this.jobsFound = 0;
      this.jobsInserted = 0;
      
      // Connexion à la base unifiée pour la synchronisation
      this.unifiedPool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: 'jobs_database',
        password: process.env.DB_PASSWORD || 'password',
        port: process.env.DB_PORT || 5432,
        ssl: false,
      });
    }

    async init() {
      const launchOptions = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      };

      // Désactiver temporairement les proxies si ils posent problème
      const USE_PROXIES = false; // Mettre à true pour réactiver
      
      if (proxy && USE_PROXIES) {
        launchOptions.proxy = {
          server: `http://${proxy.host}:${proxy.port}`,
          username: proxy.username || undefined,
          password: proxy.password || undefined
        };
      }

      this.browser = await chromium.launch(launchOptions);
      this.page = await this.browser.newPage();
      
      await this.page.setExtraHTTPHeaders({
        'User-Agent': userAgent
      });
      await this.page.setViewportSize({ width: 1920, height: 1080 });
      
      // Bloquer les ressources non essentielles
      await this.page.route('**/*', (route) => {
        const resourceType = route.request().resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          route.abort();
        } else {
          route.continue();
        }
      });
    }

    async scrape() {
      try {
        console.log(`🚀 Worker: Démarrage du scraping...`);
        console.log(`   - URL de départ: ${startUrl.substring(0, 80)}...`);
        console.log(`   - Proxy: ${proxy ? `${proxy.host}:${proxy.port}` : 'Aucun'}`);
        console.log(`   - User Agent: ${userAgent.substring(0, 50)}...`);
        console.log('');
        
        let currentUrl = startUrl;
        let pageNum = 1;
        let shouldStop = false;

        while (!shouldStop && pageNum <= 34) {
          console.log(`📄 Worker: Page ${pageNum} - ${currentUrl.substring(0, 80)}...`);
          
          try {
            await this.page.goto(currentUrl, { 
              waitUntil: 'domcontentloaded',
              timeout: TIMEOUTS.PAGE_LOAD 
            });

            await this.page.waitForTimeout(TIMEOUTS.BETWEEN_PAGES);
            
            // Vérifier d'abord si c'est une page "no results found"
            const noResultsText = await this.page.evaluate(() => {
              const text = document.body.innerText;
              return text.includes("Nous n'avons pas trouvé de jobs pour votre recherche") || 
                     text.includes("Aucun job trouvé") ||
                     text.includes("no results found");
            });

            if (noResultsText) {
              console.log(`🛑 Worker: Page "no results found" détectée, arrêt du scraping`);
              shouldStop = true;
              break;
            }
            
            await this.page.waitForSelector('a[href*="/jobs/"][href*="/companies/"]', { 
              timeout: TIMEOUTS.SELECTOR_WAIT 
            });

            let jobsOnPage = await this.scrapeJobsPage(pageNum);
            
            if (jobsOnPage.length === 0) {
              console.log(`⚠️ Worker: Aucun job trouvé sur la page ${pageNum}, attente de ${TIMEOUTS.RETRY_DELAY/1000} secondes et réessai sur la MÊME page...`);
              await this.page.waitForTimeout(TIMEOUTS.RETRY_DELAY);
              
              const retryJobsOnPage = await this.scrapeJobsPage(pageNum);
              if (retryJobsOnPage.length === 0) {
                console.log(`⚠️ Worker: Toujours aucun job après réessai sur la page ${pageNum}, attente supplémentaire de 20 secondes...`);
                await this.page.waitForTimeout(20000);
                
                const secondRetryJobsOnPage = await this.scrapeJobsPage(pageNum);
                if (secondRetryJobsOnPage.length === 0) {
                  console.log(`🛑 Worker: Aucun job trouvé après 2 réessais sur la page ${pageNum}, arrêt du scraping`);
                  shouldStop = true;
                  break;
                } else {
                  console.log(`✅ Worker: ${secondRetryJobsOnPage.length} jobs trouvés après 2ème réessai`);
                  jobsOnPage = secondRetryJobsOnPage;
                }
              } else {
                console.log(`✅ Worker: ${retryJobsOnPage.length} jobs trouvés après réessai`);
                jobsOnPage = retryJobsOnPage;
              }
            }

            this.jobsFound += jobsOnPage.length;
            await this.saveJobs(jobsOnPage);
            this.jobsInserted += jobsOnPage.length;

            // Synchroniser immédiatement avec la base unifiée après chaque page
            if (jobsOnPage.length > 0) {
              console.log(`🔄 Worker: Synchronisation de ${jobsOnPage.length} jobs avec la base unifiée...`);
              await this.syncJobsToUnifiedDatabase(jobsOnPage);
                              console.log(`✅ Worker: Synchronisation terminée`);
            }

                          console.log(`✅ Worker: ${jobsOnPage.length} jobs traités sur la page ${pageNum}`);

            pageNum++;
            currentUrl = this.updatePageUrl(currentUrl, pageNum);
            console.log(`📄 Worker: Passage à la page ${pageNum} - ${currentUrl.substring(0, 80)}...`);
            
            // Pause entre les pages
            await this.page.waitForTimeout(TIMEOUTS.BETWEEN_PAGES + Math.random() * 2000);

          } catch (error) {
            console.error(`❌ Worker: Erreur sur la page ${pageNum}:`, error.message);
            console.error(`   - URL: ${currentUrl}`);
            
            // Si c'est un timeout, attendre et réessayer sur la MÊME page
            if (error.message.includes('ERR_TIMED_OUT')) {
              console.error(`   - Timeout détecté, attente de 30 secondes avant réessai sur la MÊME page...`);
              await this.page.waitForTimeout(30000);
              continue; // Réessayer sur la même page
            } else {
              console.error(`   - Erreur non-timeout, passage à la page suivante...`);
              pageNum++;
              currentUrl = this.updatePageUrl(currentUrl, pageNum);
              continue;
            }
          }
        }

        console.log(`🏁 Worker: Scraping terminé - ${this.jobsFound} jobs trouvés, ${this.jobsInserted} insérés`);

      } catch (error) {
        console.error(`💥 Worker: Erreur générale:`, error.message);
        console.error(`   - Stack trace:`, error.stack);
        parentPort.postMessage({ type: 'error', error: error.message });
      } finally {
        await this.cleanup();
      }
    }

    updatePageUrl(url, pageNum) {
      // Si l'URL contient déjà un paramètre page, le remplacer
      if (url.includes('page=')) {
        return url.replace(/page=\d+/, `page=${pageNum}`);
      } else {
        // Sinon, ajouter le paramètre page
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}page=${pageNum}`;
      }
    }

    async scrapeJobsPage(pageNum) {
      try {
        const jobLinks = await this.page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/jobs/"][href*="/companies/"]'));
          return links
            .map(link => link.href)
            .filter(href => href.includes('/jobs/') && href.includes('/companies/'))
            .slice(0, 20); // Limiter à 20 jobs par page
        });

        console.log(`🔍 Worker: ${jobLinks.length} liens de jobs trouvés sur la page ${pageNum}`);

        if (jobLinks.length === 0) {
          console.log(`⚠️ Worker: Aucun lien de job trouvé sur la page ${pageNum}`);
          return [];
        }

        const jobs = [];
        for (let i = 0; i < jobLinks.length; i++) {
          try {
            const jobDetails = await this.extractJobDetailsFromDetailPage(jobLinks[i]);
            if (jobDetails) {
              jobs.push(jobDetails);
            }
            
            // Pause entre chaque job
            await this.page.waitForTimeout(TIMEOUTS.BETWEEN_JOBS + Math.random() * 1000);
            
          } catch (error) {
            console.error(`❌ Worker: Erreur extraction job ${i + 1}:`, error.message);
            console.error(`   - URL du job: ${jobLinks[i]}`);
            continue;
          }
        }

        return jobs;

              } catch (error) {
          console.error(`❌ Worker: Erreur scraping page ${pageNum}:`, error.message);
          console.error(`   - Détails:`, error);
          return [];
        }
    }

    async extractJobDetailsFromDetailPage(jobUrl) {
      try {
        await this.page.goto(jobUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: TIMEOUTS.JOB_DETAILS 
        });

        await this.page.waitForTimeout(1000);

        const jobData = await this.page.evaluate((parseRelativeDateFn) => {
          // Fonction parseRelativeDate dans le contexte du navigateur
          const parseRelativeDate = (dateText) => {
            if (!dateText) return null;
            
            const now = new Date();
            const text = dateText.toLowerCase().trim();
            
            if (text.includes('aujourd\'hui')) {
              return now;
            }
            
            if (text.includes('hier')) {
              const yesterday = new Date(now);
              yesterday.setDate(yesterday.getDate() - 1);
              return yesterday;
            }
            
            if (text.includes('il y a')) {
              const match = text.match(/il y a (\d+) (heure|jour|minute|semaine|mois)/);
              if (match) {
                const amount = parseInt(match[1]);
                const unit = match[2];
                const result = new Date(now);
                
                switch (unit) {
                  case 'heure':
                    result.setHours(result.getHours() - amount);
                    break;
                  case 'minute':
                    result.setMinutes(result.getMinutes() - amount);
                    break;
                  case 'jour':
                    result.setDate(result.getDate() - amount);
                    break;
                  case 'semaine':
                    result.setDate(result.getDate() - (amount * 7));
                    break;
                  case 'mois':
                    result.setMonth(result.getMonth() - amount);
                    break;
                }
                return result;
              }
            }
            
            return null;
          };
          // Extraction du titre
          const titleElement = document.querySelector('h1');
          const title = titleElement ? titleElement.textContent.trim() : '';

          // Extraction de l'entreprise depuis JSON-LD
          let company = '';
          try {
            const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
            if (jsonLdScript) {
              const jsonLd = JSON.parse(jsonLdScript.textContent);
              if (jsonLd.hiringOrganization && jsonLd.hiringOrganization.name) {
                company = jsonLd.hiringOrganization.name;
              }
            }
          } catch (e) {
            console.error(`Worker: Erreur parsing JSON-LD:`, e.message);
          }

          // Extraction de la localisation depuis JSON-LD
          let location = '';
          try {
            const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
            if (jsonLdScript) {
              const jsonLd = JSON.parse(jsonLdScript.textContent);
              if (jsonLd.jobLocation && jsonLd.jobLocation.address && jsonLd.jobLocation.address.addressLocality) {
                location = jsonLd.jobLocation.address.addressLocality;
              }
            }
          } catch (e) {
            console.error(`Worker: Erreur parsing JSON-LD location:`, e.message);
          }

          // Extraction du salaire depuis __NEXT_DATA__
          let salary = '';
          try {
            const nextDataScript = document.querySelector('#__NEXT_DATA__');
            if (nextDataScript) {
              const nextData = JSON.parse(nextDataScript.textContent);
              const queries = nextData.props?.pageProps?.dehydratedState?.queries || [];
              
              for (const query of queries) {
                if (query.state?.data?.job?.salary) {
                  const salaryText = query.state.data.job.salary;
                  if (salaryText && salaryText !== 'Non spécifié') {
                    salary = salaryText;
                    break;
                  }
                }
              }
            }
          } catch (e) {
            console.error(`Worker: Erreur extraction salaire:`, e.message);
          }

          // Nettoyage du salaire
          if (salary) {
            salary = salary
              .replace(/\\u003C/g, '<')
              .replace(/\\u003E/g, '>')
              .replace(/\\u002F/g, '/')
              .replace(/<[^>]*>/g, '')
              .trim();
          }

          // Extraction de la description
          const descriptionElement = document.querySelector('[data-testid="job-description"]');
          const description = descriptionElement ? descriptionElement.textContent.trim() : '';

          // Extraction du contrat
          let contract = '';
          const contractElements = document.querySelectorAll('[data-testid="job-details"] span');
          for (const element of contractElements) {
            const text = element.textContent.trim();
            if (text.includes('CDI') || text.includes('CDD') || text.includes('Stage') || text.includes('Alternance') || text.includes('Freelance')) {
              contract = text;
              break;
            }
          }

          // Extraction du télétravail
          let telework = '';
          const teleworkElements = document.querySelectorAll('[data-testid="job-details"] span');
          for (const element of teleworkElements) {
            const text = element.textContent.trim();
            if (text.includes('Télétravail') || text.includes('Remote') || text.includes('Hybride')) {
              telework = text
                .replace(/\\u003C/g, '<')
                .replace(/\\u003E/g, '>')
                .replace(/\\u002F/g, '/')
                .replace(/<[^>]*>/g, '')
                .trim();
              break;
            }
          }

          // Extraction de l'ID original
          const urlParts = window.location.pathname.split('/');
          const originalId = urlParts[urlParts.length - 1] || '';

          // Extraction de la date de publication
          let publishedAt = null;
          try {
            // Chercher la date dans les éléments de la page
            const dateElements = document.querySelectorAll('[data-testid="job-details"] span, .sc-1w0iwyp-0 span, .sc-1w0iwyp-1 span');
            for (const element of dateElements) {
              const text = element.textContent.trim();
              if (text.includes('il y a') || text.includes('aujourd\'hui') || text.includes('hier')) {
                publishedAt = text;
                break;
              }
            }
            
            // Si pas trouvé, essayer dans le JSON-LD
            if (!publishedAt) {
              const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
              if (jsonLdScript) {
                const jsonLd = JSON.parse(jsonLdScript.textContent);
                if (jsonLd.datePosted) {
                  publishedAt = jsonLd.datePosted;
                }
              }
            }

            // Conversion au format dd/mm/YYYY
            if (publishedAt) {
              const dateObj = parseRelativeDate(publishedAt);
              if (dateObj) {
                publishedAt = dateObj.toLocaleDateString('fr-FR');
              } else {
                // Si parseRelativeDate échoue, essayer de parser une date ISO
                const date = new Date(publishedAt);
                if (!isNaN(date.getTime())) {
                  publishedAt = date.toLocaleDateString('fr-FR');
                }
              }
            }
          } catch (e) {
            console.error(`Worker: Erreur extraction date:`, e.message);
          }

          return {
            title,
            company,
            location,
            salary,
            description,
            contract,
            telework,
            originalId,
            publishedAt,
            url: window.location.href
          };
        }, null);

        return jobData;

      } catch (error) {
        console.error(`Worker: Erreur extraction détails job:`, error);
        return null;
      }
    }

    async saveJobs(jobs) {
      for (const job of jobs) {
        try {
          await workerWttjPool.query(`
            INSERT INTO wttj_jobs (title, company, location, salary, description, source, source_id, url, contract, telework, tags, published_at, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
            ON CONFLICT (source_id) DO NOTHING
          `, [
            job.title,
            job.company,
            job.location,
            job.salary,
            job.description,
            'wttj',
            job.originalId,
            job.url,
            job.contract,
            job.telework,
            JSON.stringify([]),
            job.publishedAt
          ]);
        } catch (error) {
          console.error(`Worker: Erreur sauvegarde job:`, error);
        }
      }
    }

      async syncJobsToUnifiedDatabase(jobs) {
    for (const job of jobs) {
      try {
        await this.unifiedPool.query(`
          INSERT INTO jobs (title, company, location, salary, description, source, original_id, url, contract_type, remote, tags, published_at, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
          ON CONFLICT (original_id, source) DO NOTHING
        `, [
          job.title,
          job.company,
          job.location,
          job.salary,
          job.description,
          'wttj',
          job.originalId,
          job.url,
          job.contract,
          job.telework,
          [],
          job.publishedAt
        ]);
      } catch (error) {
        console.error(`Worker: Erreur synchronisation job:`, error);
      }
    }
  }

    async cleanup() {
      if (this.browser) {
        await this.browser.close();
      }
      await workerWttjPool.end();
      await this.unifiedPool.end();
      
      parentPort.postMessage({ 
        type: 'complete', 
        data: { 
          jobsFound: this.jobsFound, 
          jobsInserted: this.jobsInserted 
        } 
      });
    }
  }

  // Démarrer le worker
  (async () => {
    const worker = new WTTJWorker();
    await worker.init();
    await worker.scrape();
    await worker.cleanup();
  })();
}

module.exports = {
  WTTJScraper,
  runWTTJScraper,
  WTTJMultiScraper,
  runWTTJMultiScraper
};
