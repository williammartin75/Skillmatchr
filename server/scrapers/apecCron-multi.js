const { chromium } = require('playwright');
const { Pool } = require('pg');
const { extractSkillsFromText, normalizeSkills } = require('./skills-library');
const { getAllJobTitles } = require('./job-titles-library');
const cluster = require('cluster');
const os = require('os');

/**
 * Scraper APEC multi-processus avec 4 workers en parallèle
 * Chaque worker scrape des pages différentes simultanément
 */
class ApecMultiScraper {
  constructor() {
    this.databaseName = 'apec_database';
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: 'apec_database'
    });
    
    // Initialiser la bibliothèque de villes françaises
    this.frenchCities = [];
    
    // Configuration des proxies HTTP - 50 proxies pour rotation
    this.proxyList = [
      // Proxies européens
      { host: '156.228.189.249', port: 3129, username: '', password: '' },
      { host: '156.253.168.60', port: 3129, username: '', password: '' },
      { host: '154.213.198.102', port: 3129, username: '', password: '' },
      { host: '154.213.194.7', port: 3129, username: '', password: '' },
      { host: '154.213.193.184', port: 3129, username: '', password: '' },
      { host: '154.213.203.97', port: 3129, username: '', password: '' },
      { host: '154.213.166.162', port: 3129, username: '', password: '' },
      { host: '154.94.15.55', port: 3129, username: '', password: '' },
      { host: '156.228.179.246', port: 3129, username: '', password: '' },
      { host: '156.253.178.191', port: 3129, username: '', password: '' },
      { host: '156.228.183.64', port: 3129, username: '', password: '' },
      { host: '154.213.196.199', port: 3129, username: '', password: '' },
      { host: '156.228.176.146', port: 3129, username: '', password: '' },
      { host: '156.240.99.206', port: 3129, username: '', password: '' },
      { host: '156.228.180.186', port: 3129, username: '', password: '' },
      { host: '156.228.184.80', port: 3129, username: '', password: '' },
      { host: '154.213.198.181', port: 3129, username: '', password: '' },
      { host: '156.253.165.176', port: 3129, username: '', password: '' },
      { host: '156.253.174.140', port: 3129, username: '', password: '' },
      { host: '156.253.172.14', port: 3129, username: '', password: '' },
      { host: '154.94.15.195', port: 3129, username: '', password: '' },
      { host: '154.213.197.191', port: 3129, username: '', password: '' },
      
      // Proxies américains
      { host: '156.248.86.115', port: 3129, username: '', password: '' },
      { host: '156.233.87.211', port: 3129, username: '', password: '' },
      { host: '156.228.77.88', port: 3129, username: '', password: '' },
      { host: '156.228.97.157', port: 3129, username: '', password: '' },
      { host: '156.228.87.214', port: 3129, username: '', password: '' },
      { host: '154.213.166.121', port: 3129, username: '', password: '' },
      { host: '156.248.80.164', port: 3129, username: '', password: '' },
      { host: '156.242.44.137', port: 3129, username: '', password: '' },
      { host: '156.242.35.149', port: 3129, username: '', password: '' },
      { host: '156.228.82.127', port: 3129, username: '', password: '' },
      { host: '156.248.82.232', port: 3129, username: '', password: '' },
      { host: '156.242.33.98', port: 3129, username: '', password: '' },
      { host: '156.228.88.219', port: 3129, username: '', password: '' },
      { host: '156.242.41.90', port: 3129, username: '', password: '' },
      { host: '156.228.95.233', port: 3129, username: '', password: '' },
      { host: '156.228.125.139', port: 3129, username: '', password: '' },
      { host: '156.242.36.193', port: 3129, username: '', password: '' },
      { host: '156.228.103.74', port: 3129, username: '', password: '' },
      { host: '156.228.104.97', port: 3129, username: '', password: '' },
      { host: '156.228.105.12', port: 3129, username: '', password: '' },
      { host: '156.242.32.116', port: 3129, username: '', password: '' },
      { host: '156.228.107.218', port: 3129, username: '', password: '' },
      
      // Proxies canadiens
      { host: '156.249.59.2', port: 3129, username: '', password: '' },
      { host: '156.249.62.251', port: 3129, username: '', password: '' },
      { host: '156.249.59.193', port: 3129, username: '', password: '' },
      { host: '156.249.57.37', port: 3129, username: '', password: '' },
      { host: '156.249.56.141', port: 3129, username: '', password: '' },
      
      // Proxies brésiliens
      { host: '156.233.87.211', port: 3129, username: '', password: '' },
      
      // Proxies espagnols
      { host: '154.94.15.55', port: 3129, username: '', password: '' },
      { host: '154.94.15.195', port: 3129, username: '', password: '' }
    ];
    
    this.currentProxyIndex = 0;
    this.failedProxies = new Set();
    this.maxFailedAttempts = 3;
    
    // User agents variés
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0'
    ];
    
    // Configuration des sélecteurs
    this.selectors = [
      '.search-result-item',
      '.result-item',
      '.job-card',
      '.offer-card',
      '.emploi-card',
      '.apec-result',
      '.apec-item',
      '.search-result',
      'a[href*="/emploi/"]:not([href*="javascript"]):not([href*="login"])',
      'a[href*="emploi.html"]',
      '.result',
      '.item',
      '.card'
    ];
    
    // Bibliothèque de métiers français
    this.jobTitles = getAllJobTitles();
  }

  /**
   * Initialise la base de données
   */
  async initializeDatabase() {
    try {
      await this.createTables();
      await this.initializeCitiesFromDatabase();
      console.log('✅ Base de données initialisée');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
      throw error;
    }
  }

  /**
   * Crée les tables nécessaires
   */
  async createTables() {
    const client = await this.pool.connect();
    
    try {
      // Table des jobs APEC
      await client.query(`
        CREATE TABLE IF NOT EXISTS apec_jobs (
          id SERIAL PRIMARY KEY,
          title VARCHAR(1000) NOT NULL,
          company VARCHAR(500),
          location VARCHAR(500),
          description TEXT,
          salary VARCHAR(200),
          contract_type VARCHAR(100),
          source VARCHAR(50) DEFAULT 'apec',
          source_url TEXT,
          published_at TIMESTAMP,
          telework BOOLEAN DEFAULT false,
          tags JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Table des statistiques
      await client.query(`
        CREATE TABLE IF NOT EXISTS apec_scraping_stats (
          id SERIAL PRIMARY KEY,
          scraper_name VARCHAR(100) UNIQUE NOT NULL,
          last_execution_time TIMESTAMP,
          status VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Tables créées/vérifiées');
      
    } catch (error) {
      console.error('❌ Erreur lors de la création des tables:', error);
      throw error;
    } finally {
      client.release();
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
   * Méthode principale de scraping pour un worker
   */
  async scrapeWorker(workerId, startPage, endPage) {
    console.log(`🚀 Worker ${workerId}: Début du scraping des pages ${startPage} à ${endPage}`);
    
    let totalJobs = 0;
    
    for (let page = startPage; page <= endPage; page++) {
      console.log(`📄 Worker ${workerId}: Scraping page ${page}...`);
      
      try {
        const pageJobs = await this.scrapePageWithProxy(page, workerId);
        
        if (pageJobs.length > 0) {
          // INSÉRER LES JOBS IMMÉDIATEMENT APRÈS CHAQUE PAGE
          console.log(`💾 Worker ${workerId}: Insertion immédiate de ${pageJobs.length} jobs de la page ${page}...`);
          await this.insertJobsToDatabase(pageJobs);
          
          totalJobs += pageJobs.length;
          console.log(`✅ Worker ${workerId}: Page ${page}: ${pageJobs.length} jobs trouvés et insérés`);
        } else {
          console.log(`📄 Worker ${workerId}: Page ${page} vide`);
        }
        
        console.log(`📊 Worker ${workerId}: Total cumulé: ${totalJobs} jobs`);
        
        // Pause entre les pages
        const pauseTime = Math.random() * 2 + 3; // 3-5 secondes
        console.log(`⏸️ Worker ${workerId}: Pause de ${pauseTime.toFixed(1)}s...`);
        await this.sleep(pauseTime * 1000);
        
      } catch (error) {
        console.error(`❌ Worker ${workerId}: Erreur sur la page ${page}:`, error.message);
        continue;
      }
    }
    
    console.log(`🎉 Worker ${workerId}: Terminé avec ${totalJobs} jobs au total`);
    return totalJobs;
  }

  /**
   * Scrape une page avec gestion des proxies
   */
  async scrapePageWithProxy(pageNum, workerId) {
    const maxRetries = 5;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const proxy = this.getNextProxy(workerId);
      
      if (!proxy) {
        console.error(`❌ Worker ${workerId}: Aucun proxy disponible`);
        return [];
      }
      
      console.log(`🌐 Worker ${workerId}: Tentative ${attempt}/${maxRetries} avec proxy: ${proxy.host}:${proxy.port}`);
      
      try {
        const browser = await chromium.launch({
          proxy: {
            server: `http://${proxy.host}:${proxy.port}`,
            username: proxy.username,
            password: proxy.password
          },
          headless: true
        });
        
        const context = await browser.newContext({
          userAgent: this.getRandomUserAgent()
        });
        
        const page = await context.newPage();
        
        const url = this.buildPageUrl(pageNum);
        console.log(`🔗 Worker ${workerId}: Navigation vers: ${url}`);
        
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        
        // Vérifier si c'est une page d'erreur
        const pageTitle = await page.title();
        if (this.isErrorPage(pageTitle)) {
          throw new Error(`Page d'erreur détectée: ${pageTitle}`);
        }
        
        const jobs = await this.extractJobsFromPage(page, workerId);
        
        await browser.close();
        
        console.log(`✅ Worker ${workerId}: Succès avec proxy ${proxy.host}:${proxy.port}`);
        return jobs;
        
      } catch (error) {
        console.error(`❌ Worker ${workerId}: Erreur tentative ${attempt}/${maxRetries}:`, error.message);
        this.markProxyAsFailed(proxy, error.message);
        
        if (attempt < maxRetries) {
          const pauseTime = 2 + Math.random() * 3;
          console.log(`⏸️ Worker ${workerId}: Pause de ${pauseTime.toFixed(1)}s avant la prochaine tentative...`);
          await this.sleep(pauseTime * 1000);
        }
      }
    }
    
    return [];
  }

  /**
   * Extrait les jobs d'une page
   */
  async extractJobsFromPage(page, workerId) {
    const jobElements = await page.$$('a[href*="/emploi/"]:not([href*="javascript"]):not([href*="login"])');
    console.log(`🔍 Worker ${workerId}: ${jobElements.length} éléments de job trouvés`);
    
    const jobs = [];
    let validJobs = 0;
    let invalidJobs = 0;
    
    for (let i = 0; i < jobElements.length; i++) {
      try {
        const job = await this.extractJobDetails(page, jobElements[i]);
        
        if (job && job.title && job.title.length > 5) {
          jobs.push(job);
          validJobs++;
          console.log(`✅ Worker ${workerId}: Job ${validJobs}: ${job.title.substring(0, 50)}... chez ${job.company} (${job.contractType})`);
        } else {
          invalidJobs++;
        }
        
      } catch (error) {
        console.error(`❌ Worker ${workerId}: Erreur extraction job ${i + 1}:`, error.message);
        invalidJobs++;
      }
    }
    
    console.log(`📊 Worker ${workerId}: Résultat: ${validJobs} jobs valides, ${invalidJobs} jobs invalides`);
    
    return jobs;
  }

  /**
   * Extrait les détails d'un job
   */
  async extractJobDetails(page, element) {
    const text = await element.textContent();
    const href = await element.getAttribute('href');
    
    if (!text || text.length < 10) return null;
    
    const jobInfo = this.extractInfoFromText(text);
    
    return {
      title: jobInfo.title,
      company: jobInfo.company,
      location: jobInfo.location,
      description: jobInfo.description,
      salary: jobInfo.salary,
      contractType: jobInfo.contractType,
      source: 'apec',
      sourceUrl: href ? `https://www.apec.fr${href}` : '',
      publishedAt: jobInfo.publishedDate,
      telework: jobInfo.telework,
      tags: jobInfo.skills
    };
  }

  /**
   * Extrait les informations d'un texte de job
   */
  extractInfoFromText(text) {
    const info = {
      title: '',
      company: '',
      location: '',
      salary: '',
      contractType: '',
      description: '',
      publishedDate: new Date().toISOString().split('T')[0],
      telework: false,
      skills: []
    };
    
    // Nettoyer le texte
    let cleanText = text.replace(/\s+/g, ' ').trim();
    
    // 1. EXTRACTION DU SALAIRE
    const salaryPatterns = [
      /(A\s+partir\s+de\s+\d{2,3}(?:\s\d{3})*(?:\s*[kK])?\s*€?\s*(?:brut\s*)?(?:annuel|an)?)/i,
      /(\d{2,3}(?:\s\d{3})*(?:\s*[kK])?\s*€?\s*(?:brut\s*)?(?:annuel|an)?)/i
    ];
    
    for (const pattern of salaryPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        info.salary = match[1].trim();
        break;
      }
    }
    
    // 2. EXTRACTION DU TYPE DE CONTRAT
    const contractPatterns = [
      /(CDI|CDD|Stage|Alternance|Freelance|Intérim|Contrat\s*à\s*durée\s*indéterminée|Contrat\s*à\s*durée\s*déterminée)/i
    ];
    
    for (const pattern of contractPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        info.contractType = match[1].trim();
        break;
      }
    }
    
    // 3. EXTRACTION DE LA LOCALISATION
    if (this.frenchCities.length > 0) {
      const foundCity = this.findCityInLoadedCities(cleanText);
      if (foundCity) {
        info.location = foundCity.nom;
        console.log('📍 Ville trouvée:', info.location);
      }
    }
    
    // 4. EXTRACTION DU TITRE ET DE L'ENTREPRISE
    const lines = cleanText.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      
      // Chercher un titre de métier
      const jobTitles = getAllJobTitles();
      for (const title of jobTitles) {
        if (firstLine.toLowerCase().includes(title.toLowerCase())) {
          info.title = title;
          info.company = firstLine.replace(title, '').trim();
          break;
        }
      }
      
      // Si pas de titre trouvé, prendre la première ligne comme titre
      if (!info.title) {
        info.title = firstLine;
      }
    }
    
    // 5. DESCRIPTION (premières lignes)
    if (lines.length > 1) {
      info.description = lines.slice(1, 3).join(' ').substring(0, 300);
    }
    
    // 6. COMPÉTENCES
    info.skills = extractSkillsFromText(cleanText);
    
    return info;
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
   * Construit l'URL d'une page
   */
  buildPageUrl(pageNum) {
    return `https://www.apec.fr/candidat/recherche-emploi.html/emploi?typesConvention=143706&anciennetePublication=101850&sortsType=DATE&page=${pageNum}`;
  }

  /**
   * Vérifie si c'est une page d'erreur
   */
  isErrorPage(pageTitle) {
    return pageTitle.includes('Erreur') || pageTitle.includes('Error') || pageTitle.includes('404');
  }

  /**
   * Obtient le prochain proxy avec rotation par worker
   */
  getNextProxy(workerId) {
    let attempts = 0;
    const maxAttempts = this.proxyList.length;
    
    while (attempts < maxAttempts) {
      // Utiliser un index différent pour chaque worker
      const workerProxyIndex = (this.currentProxyIndex + workerId) % this.proxyList.length;
      const proxy = this.proxyList[workerProxyIndex];
      
      const proxyKey = `${proxy.host}:${proxy.port}`;
      if (!this.failedProxies.has(proxyKey)) {
        console.log(`🌐 Worker ${workerId}: Proxy sélectionné: ${proxy.host}:${proxy.port}`);
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
   * Marque un proxy comme défaillant
   */
  markProxyAsFailed(proxy, error) {
    const proxyKey = `${proxy.host}:${proxy.port}`;
    this.failedProxies.add(proxyKey);
    console.log(`❌ Proxy marqué comme défaillant: ${proxyKey} (${error})`);
  }

  /**
   * Obtient un user agent aléatoire
   */
  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Insère les jobs dans la base de données
   */
  async insertJobsToDatabase(jobs) {
    const client = await this.pool.connect();
    
    try {
      for (const job of jobs) {
        const query = `
          INSERT INTO apec_jobs (
            title, company, location, description, salary, contract_type,
            source, source_url, published_at, telework, tags
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (source_url) DO NOTHING
        `;
        
        const values = [
          job.title,
          job.company,
          job.location,
          job.description,
          job.salary,
          job.contractType,
          job.source,
          job.sourceUrl,
          job.publishedAt,
          job.telework,
          JSON.stringify(job.tags)
        ];
        
        await client.query(query, values);
      }
      
      console.log(`✅ ${jobs.length} jobs insérés dans la base de données`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'insertion des jobs:', error);
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
}

/**
 * Fonction principale multi-processus
 */
async function runApecMultiScraper() {
  const numWorkers = 4;
  const startPage = 1;
  const endPage = 20; // Scraper 20 pages au total
  
  console.log(`🚀 Début du scraping APEC multi-processus avec ${numWorkers} workers`);
  console.log(`📄 Pages à scraper: ${startPage} à ${endPage}`);
  
  const scraper = new ApecMultiScraper();
  await scraper.initializeDatabase();
  
  // Diviser les pages entre les workers
  const pagesPerWorker = Math.ceil((endPage - startPage + 1) / numWorkers);
  const workers = [];
  
  for (let i = 0; i < numWorkers; i++) {
    const workerStartPage = startPage + (i * pagesPerWorker);
    const workerEndPage = Math.min(startPage + ((i + 1) * pagesPerWorker) - 1, endPage);
    
    console.log(`👷 Worker ${i + 1}: pages ${workerStartPage} à ${workerEndPage}`);
    
    const workerPromise = scraper.scrapeWorker(i + 1, workerStartPage, workerEndPage);
    workers.push(workerPromise);
  }
  
  // Attendre que tous les workers terminent
  const results = await Promise.all(workers);
  
  const totalJobs = results.reduce((sum, jobs) => sum + jobs, 0);
  
  console.log('\n🎉 SCRAPING MULTI-PROCESSUS TERMINÉ');
  console.log('📊 Résultats par worker:');
  results.forEach((jobs, index) => {
    console.log(`   - Worker ${index + 1}: ${jobs} jobs`);
  });
  console.log(`📊 Total: ${totalJobs} jobs scrapés`);
  
  await scraper.pool.end();
}

// Exécuter si appelé directement
if (require.main === module) {
  runApecMultiScraper().catch(console.error);
}

module.exports = { ApecMultiScraper, runApecMultiScraper };