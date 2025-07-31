const { chromium } = require('playwright');
const { Pool } = require('pg');

class JobTeaserCronScraper {
  constructor() {
    this.maxPages = 1;
    this.jobs = [];
    this.databaseName = 'jobteaser_database';
    
    // Configuration de la base de données
    this.dbPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: this.databaseName,
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
      ssl: false,
    });
    
    // Configuration des proxies HTTP en ligne - 52 proxies fonctionnels (même liste que APEC)
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
    
    this.failedProxies = new Set();
    this.currentProxyIndex = 0;
    
    // User agents variés pour éviter la détection (même liste que APEC)
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0'
    ];
    
    // URLs des régions françaises dans l'ordre de scraping
    this.regionUrls = [
      {
        name: 'Île-de-France',
        url: 'https://www.jobteaser.com/fr/job-offers?lat=48.681003000000004&lng=2.5301432269469717&localized_location=%C3%8Ele-de-France&localized_location=+France&location=France%3A%3A%C3%8Ele-de-France%3A%3A_niokF2GYrIdJqyG1iWWgB3QVN48%3D&sort=recency'
      },
      {
        name: 'Auvergne-Rhône-Alpes',
        url: 'https://www.jobteaser.com/fr/job-offers?lat=45.459834&lng=4.799136810660314&localized_location=Auvergne-Rh%C3%B4ne-Alpes&localized_location=+France&location=France%3A%3AAuvergne-Rh%C3%B4ne-Alpes%3A%3A_rB%2FjKKJojsRHVDtONF6SFj5Wf3A%3D&sort=recency'
      },
      {
        name: 'Bourgogne-Franche-Comté',
        url: 'https://www.jobteaser.com/fr/job-offers?lat=47.277928&lng=4.951233171673818&localized_location=Bourgogne-Franche-Comt%C3%A9&localized_location=+France&location=France%3A%3ABourgogne-Franche-Comt%C3%A9%3A%3A_ribnKLOxvKmxszwXzuHPeKt4imI%3D&sort=recency'
      },
      {
        name: 'Bretagne',
        url: 'https://www.jobteaser.com/fr/job-offers?lat=48.162476&lng=-2.683871672150882&localized_location=Bretagne&localized_location=+France&location=France%3A%3ABretagne%3A%3A_u6+2tbYAMUpWJeFKLiJh6FcCk+k%3D&sort=recency'
      },
      {
        name: 'Centre-Val de Loire',
        url: 'https://www.jobteaser.com/fr/job-offers?lat=47.643881&lng=1.71609493315508&localized_location=Centre-Val+de+Loire&localized_location=+France&location=France%3A%3ACentre-Val+de+Loire%3A%3A_%2FYUbVB+9R5tAul4Xz0nzREG58ks%3D&sort=recency'
      },
      {
        name: 'Grand Est',
        url: 'https://www.jobteaser.com/fr/job-offers?lat=48.794813000000005&lng=5.759338824399265&localized_location=Grand+Est&localized_location=+France&location=France%3A%3AGrand+Est%3A%3A_noTYDZwA%2F9bN1GSDjdki9qQATfw%3D&sort=recency'
      },
      {
        name: 'Hauts-de-France',
        url: 'https://www.jobteaser.com/fr/job-offers?lat=49.9631305&lng=2.888612331313375&localized_location=Hauts-de-France&localized_location=+France&location=France%3A%3AHauts-de-France%3A%3A_bX4wgCY%2FUkL71W3+eAk7+I3SKOU%3D&sort=recency'
      },
      {
        name: 'Normandie',
        url: 'https://www.jobteaser.com/fr/job-offers?lat=49.126045&lng=0.02642505138888873&localized_location=Normandie&localized_location=+France&location=France%3A%3ANormandie%3A%3A_THIjPnIdw4wapVF8BMz3OWgnp00%3D&sort=recency'
      },
      {
        name: 'Nouvelle-Aquitaine',
        url: 'https://www.jobteaser.com/fr/job-offers?lat=44.976845499999996&lng=0.4728508125940867&localized_location=Nouvelle-Aquitaine&localized_location=+France&location=France%3A%3ANouvelle-Aquitaine%3A%3A_zAFgOZcAaswEKKXC+GCuU7nLVpU%3D&sort=recency'
      },
      {
        name: 'Occitanie',
        url: 'https://www.jobteaser.com/fr/job-offers?lat=43.6899705&lng=2.1175314441451154&localized_location=Occitanie&localized_location=+France&location=France%3A%3AOccitanie%3A%3A_2VAtGzO+OxxHOO11%2FW+Qn%2F9up6E%3D&sort=recency'
      },
      {
        name: 'Pays de la Loire',
        url: 'https://www.jobteaser.com/fr/job-offers?lat=47.417340499999995&lng=-1.126864126142566&localized_location=Pays+de+la+Loire&localized_location=+France&location=France%3A%3APays+de+la+Loire%3A%3A_12e5cIDRFyfHdbIkY+LEv6+CAMA%3D&sort=recency'
      },
      {
        name: 'Provence-Alpes-Côte d\'Azur',
        url: 'https://www.jobteaser.com/fr/job-offers?lat=44.076359499999995&lng=6.236520683100181&localized_location=Provence-Alpes-C%C3%B4te+d%27Azur&localized_location=+France&location=France%3A%3AProvence-Alpes-C%C3%B4te+d%27Azur%3A%3A_DfHdMvzUGpl3D4Nfn0PEdy3cQGY%3D&sort=recency'
      }
    ];
    
    this.baseUrl = this.regionUrls[0].url; // URL par défaut (Île-de-France)
  }

  async initializeDatabase() {
    try {
      console.log('🗄️ Initialisation de la base de données JobTeaser...');
      await this.createTables();
      console.log('✅ Base de données JobTeaser initialisée');
    } catch (error) {
      console.error('❌ Erreur initialisation base de données:', error.message);
      throw error;
    }
  }

  async createTables() {
    const client = await this.dbPool.connect();
    
    try {
      // Table des jobs (structure standardisée pour migration vers base unifiée)
      await client.query(`
        CREATE TABLE IF NOT EXISTS jobteaser_jobs (
          id SERIAL PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          company VARCHAR(200) NOT NULL,
          location VARCHAR(200),
          description TEXT,
          contract VARCHAR(100),
          salary VARCHAR(100),
          telework VARCHAR(100),
          source VARCHAR(50) DEFAULT 'jobteaser',
          source_id VARCHAR(200) UNIQUE,
          url TEXT,
          scraped_at TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW(),
          published_at TIMESTAMP,
          tags JSONB
        )
      `);
      
      // Table des statistiques de scraping
      await client.query(`
        CREATE TABLE IF NOT EXISTS jobteaser_scraping_stats (
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
      
      console.log('✅ Tables JobTeaser créées/vérifiées');
      
    } catch (error) {
      console.error('❌ Erreur création tables:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  getNextProxy(workerId) {
    const availableProxies = this.proxyList.filter(proxy => !this.failedProxies.has(proxy.host));
    
    if (availableProxies.length === 0) {
      console.log(`⚠️ Worker ${workerId}: Aucun proxy disponible, utilisation directe`);
      return null;
    }
    
    const proxy = availableProxies[this.currentProxyIndex % availableProxies.length];
    this.currentProxyIndex++;
    
    console.log(`🌐 Worker ${workerId}: Utilisation proxy ${proxy.host}:${proxy.port}`);
    return proxy;
  }

  markProxyAsFailed(proxy, error) {
    if (proxy) {
      this.failedProxies.add(proxy.host);
      console.log(`❌ Proxy ${proxy.host} marqué comme échoué: ${error.message}`);
    }
  }

  getAvailableProxiesCount() {
    return this.proxyList.length - this.failedProxies.size;
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
    // Tous les jobs sur JobTeaser sont en France, donc on accepte tout
    return true;
  }

  parseRelativeDate(dateText) {
    if (!dateText) return new Date().toLocaleDateString('fr-FR');
    
    const text = dateText.toLowerCase().trim();
    const now = new Date();
    
    // Patterns pour "il y a X heures/minutes/jours"
    const hourMatch = text.match(/il y a (\d+)\s*heures?/i);
    if (hourMatch) {
      const hours = parseInt(hourMatch[1]);
      const date = new Date(now.getTime() - (hours * 60 * 60 * 1000));
      return date.toLocaleDateString('fr-FR');
    }
    
    const minuteMatch = text.match(/il y a (\d+)\s*minutes?/i);
    if (minuteMatch) {
      const minutes = parseInt(minuteMatch[1]);
      const date = new Date(now.getTime() - (minutes * 60 * 1000));
      return date.toLocaleDateString('fr-FR');
    }
    
    const dayMatch = text.match(/il y a (\d+)\s*jours?/i);
    if (dayMatch) {
      const days = parseInt(dayMatch[1]);
      const date = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      return date.toLocaleDateString('fr-FR');
    }
    
    // Patterns pour "aujourd'hui", "hier", etc.
    if (text.includes('aujourd\'hui') || text.includes('today')) {
      return now.toLocaleDateString('fr-FR');
    }
    
    if (text.includes('hier') || text.includes('yesterday')) {
      const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      return yesterday.toLocaleDateString('fr-FR');
    }
    
    // Si c'est déjà une date au format DD/MM/YYYY
    if (text.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      return text;
    }
    
    // Par défaut, retourner la date d'aujourd'hui
    return now.toLocaleDateString('fr-FR');
  }

  async testDatabaseConnection() {
    try {
      const client = await this.dbPool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Connexion à la base de données JobTeaser OK');
    } catch (error) {
      console.error('❌ Erreur connexion base de données JobTeaser:', error.message);
      throw error;
    }
  }

  async scrape() {
    const startTime = new Date();
    console.log('🚀 Démarrage JobTeaserCronScraper - Scraping par régions');
    console.log('='.repeat(60));
    
    // Initialiser la base de données
    await this.initializeDatabase();
    await this.testDatabaseConnection();
    
    console.log(`🌐 Proxies disponibles: ${this.getAvailableProxiesCount()}/${this.proxyList.length}`);
    
    // Date d'hier pour la condition d'arrêt
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('fr-FR');
    
    console.log(`📅 Date d'arrêt: ${yesterdayStr} (hier)`);
    
    // Parcourir toutes les régions
    for (let regionIndex = 0; regionIndex < this.regionUrls.length; regionIndex++) {
      const region = this.regionUrls[regionIndex];
      console.log(`\n🏛️ === RÉGION ${regionIndex + 1}/${this.regionUrls.length}: ${region.name} ===`);
      
      let regionJobs = [];
      let pageNum = 1;
      let shouldStopRegion = false;
      
      // Scraper les pages de cette région jusqu'à trouver un job d'hier
      while (!shouldStopRegion) {
        console.log(`\n📄 === ${region.name} - PAGE ${pageNum} ===`);
        
        try {
          const pageJobs = await this.scrapeRegionPage(region.url, pageNum, 1); // Worker ID = 1
          
          if (pageJobs.length === 0) {
            console.log(`⚠️ Aucun job trouvé sur la page ${pageNum} de ${region.name}, arrêt de la région`);
            break;
          }
          
          // Vérifier si un job a été publié hier
          let foundYesterdayJob = false;
          for (const job of pageJobs) {
            if (job.publishedAt === yesterdayStr) {
              console.log(`🛑 Job d'hier trouvé: "${job.title}" - Arrêt de la région ${region.name}`);
              foundYesterdayJob = true;
              shouldStopRegion = true;
              break;
            }
          }
          
          regionJobs.push(...pageJobs);
          console.log(`✅ ${pageJobs.length} jobs extraits de la page ${pageNum} de ${region.name}`);
          
          // Insérer immédiatement les jobs de cette page dans la base de données
          if (pageJobs.length > 0) {
            console.log(`💾 Insertion de ${pageJobs.length} jobs dans la base de données...`);
            await this.insertJobsToDatabase(pageJobs);
            console.log(`✅ Jobs de la page ${pageNum} insérés avec succès`);
          }
          
          // Pause entre les pages
          await this.sleep(3000);
          pageNum++;
          
        } catch (error) {
          console.error(`❌ Erreur sur la page ${pageNum} de ${region.name}:`, error.message);
          break;
        }
      }
      
      // Ajouter les jobs de cette région à la liste globale
      if (regionJobs.length > 0) {
        this.jobs.push(...regionJobs);
        console.log(`✅ Total ${regionJobs.length} jobs extraits de ${region.name}`);
      }
      
      // Pause entre les régions
      if (regionIndex < this.regionUrls.length - 1) {
        console.log(`⏳ Pause de 5 secondes avant la prochaine région...`);
        await this.sleep(5000);
      }
    }
    
    console.log(`\n🎉 SCRAPING TERMINÉ! ${this.jobs.length} offres trouvées`);
    
    // Sauvegarder les statistiques
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    
    const stats = {
      jobs_found: this.jobs.length,
      jobs_inserted: this.jobs.length,
      regions_scraped: this.regionUrls.length,
      duration_seconds: duration,
      end_time: endTime.toLocaleString('fr-FR'),
      database: this.databaseName
    };
    
    await this.saveScrapingStats(stats);
    
    return this.jobs;
  }

  async scrapeRegionPage(regionUrl, pageNum, workerId) {
    console.log(`📄 Worker ${workerId}: Ouverture page ${pageNum} de la région avec proxy...`);
    
    // Obtenir un proxy pour cette page
    const proxy = this.getNextProxy(workerId);
    
    // Configuration du navigateur avec proxy
    const browserOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images',
        '--disable-javascript-harmony-shipping',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--user-agent=' + this.getRandomUserAgent()
      ]
    };
    
    if (proxy) {
      browserOptions.proxy = {
        server: `http://${proxy.host}:${proxy.port}`,
        username: proxy.username || undefined,
        password: proxy.password || undefined
      };
    }
    
    const browser = await chromium.launch(browserOptions);
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Aller sur la page
      const url = pageNum === 1 ? regionUrl : `${regionUrl}&page=${pageNum}`;
      console.log(`🌐 Worker ${workerId}: Navigation vers ${url}`);
      
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000);
      
      // Cibler spécifiquement les cartes de jobs complètes (pas les éléments individuels)
      let jobElements = [];
      const cardSelectors = [
        '[data-testid="jobad-card"]',
        '[data-testid="job-card"]',
        '.job-card',
        '.jobad-card',
        'article[data-testid*="job"]',
        'div[data-testid*="jobad-card"]'
      ];
      
      // Essayer d'abord les sélecteurs de cartes
      for (const selector of cardSelectors) {
        const elements = await page.$$(selector);
        console.log(`   🔍 Worker ${workerId}: Sélecteur carte "${selector}": ${elements.length} cartes`);
        if (elements.length > 0) {
          jobElements = elements;
          console.log(`   ✅ Worker ${workerId}: Utilisation du sélecteur carte "${selector}" avec ${elements.length} cartes de jobs`);
          break;
        }
      }
      
      // Si aucune carte trouvée, essayer de trouver les liens principaux
      if (jobElements.length === 0) {
        console.log(`   ⚠️ Worker ${workerId}: Aucune carte trouvée, recherche des liens de jobs...`);
        const linkElements = await page.$$('a[href*="/job-offers/"]');
        console.log(`   🔍 Worker ${workerId}: Liens de jobs trouvés: ${linkElements.length}`);
        
        // Filtrer pour ne garder que les liens principaux (pas les sous-éléments)
        const mainLinks = [];
        for (const link of linkElements) {
          const parent = await link.evaluate(el => {
            const parentCard = el.closest('[data-testid*="job"]');
            return parentCard ? null : el; // Retourner null si le lien est dans une carte déjà trouvée
          });
          if (parent) {
            mainLinks.push(link);
          }
        }
        
        jobElements = mainLinks;
        console.log(`   ✅ Worker ${workerId}: ${mainLinks.length} liens principaux trouvés`);
      }
      
      console.log(`   🔍 Worker ${workerId}: Page ${pageNum}: ${jobElements.length} jobs trouvés au total`);
      
      // Extraire les liens vers les pages de détail
      const jobLinks = [];
      for (let i = 0; i < jobElements.length; i++) {
        try {
          const linkElement = await jobElements[i].$('a[href*="/job-offers/"]');
          if (linkElement) {
            const href = await linkElement.getAttribute('href');
            if (href) {
              const fullUrl = href.startsWith('http') ? href : `https://www.jobteaser.com${href}`;
              jobLinks.push(fullUrl);
              console.log(`🔗 Worker ${workerId}: Lien job ${i + 1}: ${fullUrl}`);
            }
          }
        } catch (error) {
          console.error(`❌ Erreur extraction lien job ${i}:`, error.message);
        }
      }
      
      console.log(`🔗 Worker ${workerId}: ${jobLinks.length} liens de jobs trouvés`);
      
      // Extraire les données complètes depuis chaque page de détail
      const pageJobs = [];
      for (let i = 0; i < jobLinks.length; i++) { // Traiter tous les jobs trouvés
        try {
                console.log(`🔍 Worker ${workerId}: Extraction job ${i + 1}/${jobLinks.length}...`);
      const jobData = await this.extractJobDataFromDetailPage(jobLinks[i], i, workerId);
      if (jobData) {
        pageJobs.push(jobData);
        console.log(`\n🎉 === OFFRE ${i + 1} EXTRACTE ===`);
      }
      // Pause entre chaque page pour éviter d'être bloqué
      await this.sleep(2000);
        } catch (error) {
          console.error(`❌ Erreur extraction job ${i}:`, error.message);
        }
      }
      
      console.log(`✅ Worker ${workerId}: Page ${pageNum}: ${pageJobs.length} jobs extraits avec succès`);
      return pageJobs;
      
    } catch (error) {
      console.error(`❌ Erreur sur la page ${pageNum}:`, error.message);
      this.markProxyAsFailed(proxy, error);
      return [];
    } finally {
      await page.close();
      await context.close();
      await browser.close();
    }
  }

  async extractJobDataFromDetailPage(jobUrl, index, workerId) {
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
    
    const context = await browser.newContext({
      userAgent: this.getRandomUserAgent(),
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true
    });
    
    const page = await context.newPage();
    
    try {
      console.log(`🔍 Worker ${workerId}: Navigation vers ${jobUrl}`);
      await page.goto(jobUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000);
      
      // Initialiser l'objet jobData
      const jobData = {
        title: '',
        company: '',
        location: '',
        description: '',
        contract: '',
        salary: 'Non précisé',
        remote: '',
        startDate: '',
        source: 'Jobteaser',
        sourceId: jobUrl.split('/').pop() || `jobteaser_${Date.now()}_${index}`,
        url: jobUrl,
        scrapedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        tags: ['jobteaser', 'emploi']
      };
      
      // Titre
      try {
        const titleElement = await page.$('h1');
        if (titleElement) {
          const text = await titleElement.textContent();
          if (text && text.trim()) {
            jobData.title = text.trim();
            console.log(`📋 Titre : ${jobData.title}`);
          }
        }
      } catch (error) {
        console.log('⚠️ Erreur extraction titre:', error.message);
      }
      
      // Entreprise
      try {
        const companyElement = await page.$('h2');
        if (companyElement) {
          const text = await companyElement.textContent();
          if (text && text.trim()) {
            jobData.company = text.trim();
            console.log(`🏢 Entreprise : ${jobData.company}`);
          }
        }
      } catch (error) {
        console.log('⚠️ Erreur extraction entreprise:', error.message);
      }
      
      // Localisation
      try {
        const locationElement = await page.$('[class*="location"]');
        if (locationElement) {
          const text = await locationElement.textContent();
          if (text && text.trim()) {
            let location = text.trim();
            // Garder "France" dans la localisation pour la détection
            location = location.replace('Lieu', '').trim();
            jobData.location = location;
            console.log(`📍 Localisation : ${jobData.location}`);
          }
        }
      } catch (error) {
        console.log('⚠️ Erreur extraction localisation:', error.message);
      }
      
      // Date de publication
      try {
        const publishedAtSelectors = [
          '[data-testid*="published"]',
          '[data-testid*="date"]',
          '[data-testid*="time"]',
          '.published-date',
          '.date-published',
          '.job-date',
          'time',
          'span[class*="date"]',
          'span[class*="time"]',
          'div[class*="date"]',
          'div[class*="time"]'
        ];
        
        let publishedAtFound = false;
        for (const selector of publishedAtSelectors) {
          try {
            const element = await page.$(selector);
            if (element) {
              const text = await element.textContent();
              if (text && text.trim()) {
                const parsedDate = this.parseRelativeDate(text.trim());
                jobData.publishedAt = parsedDate;
                console.log(`📅 Date de publication : ${jobData.publishedAt} (original: ${text.trim()})`);
                publishedAtFound = true;
                break;
              }
            }
          } catch (error) {
            // Ignorer les erreurs
          }
        }
        
        if (!publishedAtFound) {
          // Utiliser la date d'aujourd'hui par défaut
          const today = new Date();
          jobData.publishedAt = today.toLocaleDateString('fr-FR');
          console.log(`📅 Date de publication : ${jobData.publishedAt} (par défaut)`);
        }
      } catch (error) {
        console.log('⚠️ Erreur extraction date de publication:', error.message);
        const today = new Date();
        jobData.publishedAt = today.toLocaleDateString('fr-FR');
      }
      
      // Description
      try {
        const descriptionSelectors = [
          '[data-testid="jobad-DetailView__Description"]',
          '[data-testid="jobad-DetailView__Description__Content"]',
          '.jobad-DetailView__Description',
          '.jobad-DetailView__Description__Content',
          '[data-testid*="Description"]',
          '[data-testid*="description"]',
          '.description',
          '.job-description',
          '.content',
          'p',
          'div[class*="description"]',
          'div[class*="content"]'
        ];
        
        let descriptionFound = false;
        for (const selector of descriptionSelectors) {
          try {
            const element = await page.$(selector);
            if (element) {
              const text = await element.textContent();
              if (text && text.trim().length > 50) {
                jobData.description = text.trim().substring(0, 500); // Limiter à 500 caractères
                console.log(`📝 Description : ${jobData.description.substring(0, 100)}...`);
                descriptionFound = true;
                break;
              }
            }
          } catch (error) {
            // Ignorer les erreurs
          }
        }
        
        if (!descriptionFound) {
          jobData.description = 'Information non renseignée';
          console.log(`📝 Description : ${jobData.description}`);
        }
      } catch (error) {
        console.log('⚠️ Erreur extraction description:', error.message);
        jobData.description = 'Information non renseignée';
      }
      
      // Salaire
      try {
        const salarySelectors = [
          '[data-testid="jobad-DetailView__CandidacyDetails__Wage"]',
          '[data-testid="jobad-DetailView__Salary"]',
          '[data-testid="jobad-DetailView__Compensation"]',
          '[data-testid*="Salary"]',
          '[data-testid*="salary"]',
          '[data-testid*="Compensation"]',
          '[data-testid*="compensation"]',
          '[data-testid*="Wage"]',
          '[data-testid*="wage"]',
          '.salary',
          '.compensation',
          '.remuneration',
          'div[class*="salary"]',
          'div[class*="compensation"]',
          'span[class*="salary"]',
          'span[class*="compensation"]'
        ];
        
        let salaryFound = false;
        for (const selector of salarySelectors) {
          try {
            const element = await page.$(selector);
            if (element) {
              const text = await element.textContent();
              if (text && text.trim()) {
                // Convertir en format annualisé
                let salary = text.trim();
                if (salary.includes('/ mois')) {
                  salary = salary.replace('/ mois', '').trim();
                  // Convertir en k€ annuel (approximatif)
                  const parts = salary.split('-');
                  if (parts.length === 2) {
                    const min = parts[0].trim().replace(' EUR', '').trim();
                    const max = parts[1].trim().replace(' EUR', '').trim();
                    const minK = Math.round(parseInt(min) * 12 / 1000);
                    const maxK = Math.round(parseInt(max) * 12 / 1000);
                    jobData.salary = `${minK}-${maxK}k€`;
                  }
                } else {
                  jobData.salary = salary;
                }
                console.log(`💰 Salaire : ${jobData.salary}`);
                salaryFound = true;
                break;
              }
            }
          } catch (error) {
            // Ignorer les erreurs
          }
        }
        
        if (!salaryFound) {
          jobData.salary = 'Information non renseignée';
          console.log(`💰 Salaire : ${jobData.salary}`);
        }
      } catch (error) {
        console.log('⚠️ Erreur extraction salaire:', error.message);
        jobData.salary = 'Information non renseignée';
      }
      
      // Type de contrat
      try {
        const contractElement = await page.$('[data-testid="jobad-DetailView__CandidacyDetails__Contract"]');
        if (contractElement) {
          const text = await contractElement.textContent();
          if (text && text.trim()) {
            jobData.contract = this.normalizeContractType(text.trim());
            console.log(`📋 Type de poste : ${jobData.contract}`);
          }
        }
      } catch (error) {
        console.log('⚠️ Erreur extraction contrat:', error.message);
      }
      
      // Télétravail
      try {
        const teleworkElement = await page.$('[data-testid="jobad-DetailView__CandidacyDetails__RemotePolicy"]');
        if (teleworkElement) {
          const text = await teleworkElement.textContent();
          if (text && text.trim()) {
            jobData.remote = text.trim();
            console.log(`🏠 Télétravail : ${jobData.remote}`);
          } else {
            jobData.remote = 'Non précisé';
            console.log(`🏠 Télétravail : ${jobData.remote}`);
          }
        } else {
          // Vérifier s'il y a un titre "Télétravail" mais pas de valeur
          const teleworkTitle = await page.$('h3:has-text("Télétravail")');
          if (teleworkTitle) {
            jobData.remote = 'Non précisé';
            console.log(`🏠 Télétravail : ${jobData.remote} (titre trouvé mais pas de valeur)`);
          } else {
            jobData.remote = 'Non précisé';
            console.log(`🏠 Télétravail : ${jobData.remote} (non trouvé)`);
          }
        }
      } catch (error) {
        console.log('⚠️ Erreur extraction télétravail:', error.message);
        jobData.remote = 'Non précisé';
      }
      
      // Date de début
      try {
        const startDateSelectors = [
          '[data-testid="jobad-DetailView__CandidacyDetails__start_date"]',
          '[data-testid="jobad-DetailView__StartDate"]',
          '[data-testid*="start_date"]',
          '[data-testid*="StartDate"]',
          '[data-testid*="startDate"]',
          '[data-testid*="date_debut"]',
          '[data-testid*="date_début"]',
          '.start-date',
          '.date-debut',
          'div[class*="start-date"]',
          'div[class*="date-debut"]',
          'span[class*="start-date"]',
          'span[class*="date-debut"]'
        ];
        
        let startDateFound = false;
        for (const selector of startDateSelectors) {
          try {
            const element = await page.$(selector);
            if (element) {
              const text = await element.textContent();
              if (text && text.trim()) {
                jobData.startDate = text.trim();
                console.log(`📅 Date de début : ${jobData.startDate}`);
                startDateFound = true;
                break;
              }
            }
          } catch (error) {
            // Ignorer les erreurs
          }
        }
        
        if (!startDateFound) {
          jobData.startDate = 'Non précisée';
          console.log(`📅 Date de début : ${jobData.startDate}`);
        }
      } catch (error) {
        console.log('⚠️ Erreur extraction date de début:', error.message);
        jobData.startDate = 'Non précisée';
      }
      
      // Date de scraping
      const today = new Date();
      const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
      console.log(`📅 Date : ${dateStr}`);
      
      // URL
      console.log(`🔗 URL : ${jobData.url}`);
      
      // Tous les jobs sur JobTeaser sont en France
      console.log(`✅ Offre en France : OUI`);
      
      console.log(`\n🎉 === OFFRE EXTRACTE AVEC SUCCÈS ===`);
      return jobData;
      
    } catch (error) {
      console.error(`❌ Erreur extraction page détail:`, error.message);
      return null;
    } finally {
      await page.close();
      await context.close();
      await browser.close();
    }
  }

  async extractJobData(jobElement, index, pageNum, page) {
    try {
      console.log(`🔍 === JOB ${index + 1} ===`);
      
      // Initialiser l'objet jobData
      const jobData = {
        title: '',
        company: '',
        location: '',
        description: '',
        contract: '',
        salary: 'Non précisé',
        remote: '',
        source: 'Jobteaser',
        sourceId: '',
        url: '',
        scrapedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        tags: ['jobteaser', 'emploi']
      };
      
      // Extraire l'URL et le sourceId
      try {
        const linkElement = await jobElement.$('a[href*="/job-offers/"]');
        if (linkElement) {
          const href = await linkElement.getAttribute('href');
          if (href) {
            jobData.url = href.startsWith('http') ? href : `https://www.jobteaser.com${href}`;
            jobData.sourceId = href.split('/').pop() || `jobteaser_${Date.now()}_${index}`;
          }
        }
      } catch (error) {
        console.log('⚠️ Erreur extraction URL:', error.message);
        jobData.sourceId = `jobteaser_${Date.now()}_${index}`;
      }
      
      // Titre - chercher dans plusieurs sélecteurs possibles
      try {
        const titleSelectors = [
          '[data-testid="jobad-card-title"]',
          '[data-testid="job-title"]',
          'h3',
          'h2',
          'a[href*="/job-offers/"]'
        ];
        
        for (const selector of titleSelectors) {
          const titleElement = await jobElement.$(selector);
          if (titleElement) {
            const text = await titleElement.textContent();
            if (text && text.trim() && text.trim().length > 5) {
              jobData.title = text.trim();
              console.log(`📋 Titre extrait: "${jobData.title}"`);
              break;
            }
          }
        }
      } catch (error) {
        console.log('⚠️ Erreur extraction titre:', error.message);
      }
      
      // Entreprise - chercher dans plusieurs sélecteurs possibles
      try {
        const companySelectors = [
          '[data-testid="jobad-card-company-name"]',
          '[data-testid="company-name"]',
          '.company-name',
          '[class*="company"]'
        ];
        
        for (const selector of companySelectors) {
          const companyElement = await jobElement.$(selector);
          if (companyElement) {
            const text = await companyElement.textContent();
            if (text && text.trim() && text.trim().length > 2) {
              jobData.company = text.trim();
              console.log(`🏢 Entreprise extraite: "${jobData.company}"`);
              break;
            }
          }
        }
      } catch (error) {
        console.log('⚠️ Erreur extraction entreprise:', error.message);
      }
      
      // Localisation
      try {
        const locationElement = await jobElement.$('[data-testid="jobad-card-location"]');
        if (locationElement) {
          const text = await locationElement.textContent();
          if (text && text.trim()) {
            // Enlever ", France" pour ne garder que la ville
            let location = text.trim();
            location = location.replace(/,?\s*France\s*$/i, '').trim();
            jobData.location = location;
            console.log(`📍 Localisation extraite: "${text.trim()}" → "${location}"`);
          }
        }
      } catch (error) {
        console.log('⚠️ Erreur extraction localisation:', error.message);
      }
      
      // Contrat
      try {
        const contractElement = await jobElement.$('[data-testid="jobad-card-contract"]');
        if (contractElement) {
          const text = await contractElement.textContent();
          if (text && text.trim()) {
            jobData.contract = this.normalizeContractType(text.trim());
          }
        }
      } catch (error) {
        console.log('⚠️ Erreur extraction contrat:', error.message);
      }

      // Date de parution - chercher dans plusieurs sélecteurs possibles
      try {
        let dateElement = null;
        const dateSelectors = [
          '[data-testid="jobad-card-date"]',
          '[data-testid="jobad-date"]',
          '.jobad-date',
          '.date',
          'time',
          '[class*="date"]',
          '[class*="time"]'
        ];
        
        for (const selector of dateSelectors) {
          dateElement = await jobElement.$(selector);
          if (dateElement) {
            console.log(`🔍 Élément date trouvé avec le sélecteur: ${selector}`);
            break;
          }
        }
        
        if (dateElement) {
          const text = await dateElement.textContent();
          console.log(`📅 Texte date brut: "${text}"`);
          if (text && text.trim()) {
            jobData.publicationDate = this.parseRelativeDate(text.trim());
            console.log(`📅 Date de parution: "${text.trim()}" → ${jobData.publicationDate}`);
          } else {
            console.log(`📅 Aucun texte de date trouvé, date par défaut: ${jobData.publicationDate}`);
          }
        } else {
          // Chercher dans le texte complet si aucun élément spécifique n'est trouvé
          const datePatterns = [
            /il y a (\d+)\s*(heures?|minutes?|jours?|semaines?)/i,
            /aujourd'hui/i,
            /hier/i
          ];
          
          for (const pattern of datePatterns) {
            const match = fullText.match(pattern);
            if (match) {
              const dateText = match[0];
              jobData.publicationDate = this.parseRelativeDate(dateText);
              console.log(`📅 Date trouvée dans le texte: "${dateText}" → ${jobData.publicationDate}`);
              break;
            }
          }
          
          if (!jobData.publicationDate) {
            console.log(`📅 Aucune date trouvée, date par défaut: ${jobData.publicationDate}`);
          }
        }
      } catch (error) {
        console.log('⚠️ Erreur extraction date:', error.message);
      }

      // Télétravail
      try {
        const teleworkElement = await jobElement.$('[data-testid="jobad-card-telework"]');
        if (teleworkElement) {
          const text = await teleworkElement.textContent();
          if (text && text.trim()) {
            jobData.telework = text.trim();
          }
        }
      } catch (error) {
        console.log('⚠️ Erreur extraction télétravail:', error.message);
      }
      
      // Extraire le salaire du texte complet
      try {
        console.log(`💰 Analyse du texte pour le salaire (longueur: ${fullText.length})`);
        const salaryPatterns = [
          /(\d{1,3}(?:\s\d{3})*)\s*(?:€|EUR|euros?)/i,
          /(\d{1,3}(?:\s\d{3})*)\s*(?:k€|K€)/i,
          /(\d{1,3}(?:\s\d{3})*)\s*(?:€\/an|EUR\/an)/i,
          /(\d{1,3}(?:\s\d{3})*)\s*(?:€\/mois|EUR\/mois)/i,
          /salaire[:\s]*(\d{1,3}(?:\s\d{3})*)/i,
          /rémunération[:\s]*(\d{1,3}(?:\s\d{3})*)/i
        ];
        
        let salaryFound = false;
        for (let i = 0; i < salaryPatterns.length; i++) {
          const pattern = salaryPatterns[i];
          const match = fullText.match(pattern);
          if (match) {
            jobData.salary = match[0].trim();
            salaryFound = true;
            console.log(`💰 Salaire trouvé: "${jobData.salary}" (pattern ${i + 1})`);
            break;
          }
        }
        
        if (!salaryFound) {
          console.log(`💰 Aucun salaire trouvé dans le texte, valeur par défaut: "${jobData.salary}"`);
        }
      } catch (error) {
        console.log('⚠️ Erreur extraction salaire:', error.message);
      }
      
      // Description (extraction intelligente depuis les éléments structurés)
      try {
        console.log(`📝 === DÉBUT EXTRACTION DESCRIPTION ===`);
        
        // Essayer d'extraire la description depuis un élément spécifique
        const descriptionElement = await jobElement.$('[data-testid="jobad-card-description"]');
        if (descriptionElement) {
          const descriptionText = await descriptionElement.textContent();
          if (descriptionText && descriptionText.trim().length > 20) {
            jobData.description = descriptionText.trim();
            console.log(`📝 Description extraite depuis l'élément: "${jobData.description.substring(0, 100)}..."`);
          }
        }
        
        // Si pas trouvé, essayer d'extraire depuis le titre (qui contient souvent une description courte)
        if (!jobData.description || jobData.description.length < 20) {
          if (jobData.title && jobData.title.length > 20) {
            // Prendre les mots après le titre principal
            const titleWords = jobData.title.split(' ');
            if (titleWords.length > 3) {
              const descriptionWords = titleWords.slice(3); // Après les 3 premiers mots
              jobData.description = descriptionWords.join(' ').trim();
              console.log(`📝 Description extraite depuis le titre: "${jobData.description}"`);
            }
          }
        }
        
        // Fallback: description basique
        if (!jobData.description || jobData.description.length < 10) {
          jobData.description = `Offre d'emploi ${jobData.contract || 'non précisé'} chez ${jobData.company}`;
          console.log(`📝 Description fallback: "${jobData.description}"`);
        }
        
        console.log(`📝 === FIN EXTRACTION DESCRIPTION ===`);
        
      } catch (error) {
        console.log('⚠️ Erreur extraction description:', error.message);
        jobData.description = `Offre d'emploi chez ${jobData.company}`;
      }
      
      // Tous les jobs sur JobTeaser sont en France
      console.log(`🇫🇷 Offre en France: OUI (localisation: "${jobData.location}")`);
      
      // Vérifier que les données essentielles sont présentes
      if (!jobData.title || !jobData.company) {
        console.log(`❌ Offre ignorée (données manquantes): titre="${jobData.title}", entreprise="${jobData.company}"`);
        return null;
      }
      
      console.log(`✅ Job extrait: ${jobData.title} - ${jobData.company} - ${jobData.location}`);
      return jobData;
      
    } catch (error) {
      console.error(`❌ Erreur extraction job ${index}:`, error.message);
      return null;
    }
  }

  async insertJobsToDatabase(jobs) {
    if (jobs.length === 0) {
      console.log('📊 Aucun job à insérer');
      return;
    }
    
    const client = await this.dbPool.connect();
    
    try {
      console.log(`💾 Insertion de ${jobs.length} jobs en base de données...`);
      
      let inserted = 0;
      let ignored = 0;
      
      for (const job of jobs) {
        try {
          // Vérifier si le job existe déjà
          const existingQuery = 'SELECT id FROM jobteaser_jobs WHERE source_url = $1';
          const existingResult = await client.query(existingQuery, [job.url]);
          
          if (existingResult.rows.length > 0) {
            ignored++;
            continue;
          }
          
          // Insérer le nouveau job
          const query = `
            INSERT INTO jobteaser_jobs (
              title, company, location, description, contract_type, salary, remote,
              source, source_url, published_at, tags, start_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `;
          
          // Convertir la date de publication au format ISO si nécessaire
          let publishedAtISO = new Date().toISOString();
          if (job.publishedAt) {
            try {
              // Si c'est déjà au format DD/MM/YYYY, le convertir
              if (job.publishedAt.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                const [day, month, year] = job.publishedAt.split('/');
                publishedAtISO = new Date(year, month - 1, day).toISOString();
              } else {
                publishedAtISO = new Date(job.publishedAt).toISOString();
              }
            } catch (error) {
              console.log(`⚠️ Erreur conversion date ${job.publishedAt}, utilisation date actuelle`);
              publishedAtISO = new Date().toISOString();
            }
          }
          
          const values = [
            job.title,
            job.company,
            job.location,
            job.description,
            job.contract,
            job.salary,
            job.remote || '',
            job.source,
            job.url,
            publishedAtISO,
            JSON.stringify(job.tags || []),
            job.startDate || 'Non précisée'
          ];
          
          await client.query(query, values);
          inserted++;
          
          // Afficher les détails complets de l'insertion
          console.log(`\n💾 JOB INSÉRÉ EN BASE #${inserted}:`);
          console.log(`   📋 Titre: ${job.title}`);
          console.log(`   🏢 Entreprise: ${job.company}`);
          console.log(`   📍 Localisation: ${job.location}`);
          console.log(`   📅 Date de parution: ${job.publicationDate || 'Non précisée'}`);
          console.log(`   📅 Date de début: ${job.startDate || 'Non précisée'}`);
          console.log(`   💰 Salaire: ${job.salary}`);
          console.log(`   📝 Contrat: ${job.contract}`);
          console.log(`   🏠 Télétravail: ${job.remote || 'Non précisé'}`);
          console.log(`   📄 Description: ${job.description.substring(0, 150)}...`);
          console.log(`   🔗 URL: ${job.url}`);
          console.log(`   📊 Source: ${job.source}`);
          console.log(`   ──────────────────────────────────────────────`);
          
        } catch (error) {
          console.error(`❌ Erreur insertion job:`, error.message);
        }
      }
      
      console.log(`[JOBTEASER CRON] Insertion terminée: ${inserted} insérés, ${ignored} ignorés`);
      
      // Synchroniser vers la base de données unifiée
      if (inserted > 0) {
        console.log(`🔄 Synchronisation vers la base de données unifiée...`);
        try {
          await this.syncToUnifiedDatabase();
          console.log(`✅ Synchronisation vers la base unifiée terminée`);
        } catch (error) {
          console.error(`❌ Erreur synchronisation base unifiée:`, error.message);
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'insertion:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async syncToUnifiedDatabase() {
    try {
      // Importer le script de synchronisation
      const { exec } = require('child_process');
      const path = require('path');
      
      const syncScriptPath = path.join(__dirname, '..', '..', 'sync-jobteaser-only.js');
      
      // Vérifier si le fichier existe
      const fs = require('fs');
      if (!fs.existsSync(syncScriptPath)) {
        console.log(`⚠️ Script de synchronisation non trouvé: ${syncScriptPath}`);
        console.log(`📁 Création du script de synchronisation...`);
        
        // Créer le script de synchronisation
        const syncScriptContent = `
const { Pool } = require('pg');

async function syncJobTeaserToUnified() {
  console.log('🔄 Synchronisation JobTeaser vers base unifiée...');
  
  // Connexion à la base JobTeaser
  const jobteaserPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'jobteaser_database',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    ssl: false,
  });
  
  // Connexion à la base unifiée
  const unifiedPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'jobs_database',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    ssl: false,
  });
  
  try {
    // Récupérer tous les jobs JobTeaser
    const jobteaserClient = await jobteaserPool.connect();
    const jobteaserJobs = await jobteaserClient.query('SELECT * FROM jobteaser_jobs ORDER BY id DESC');
    jobteaserClient.release();
    
    console.log(\`📊 \${jobteaserJobs.rows.length} jobs JobTeaser trouvés\`);
    
    if (jobteaserJobs.rows.length === 0) {
      console.log('✅ Aucun job à synchroniser');
      return;
    }
    
    // Synchroniser chaque job
    const unifiedClient = await unifiedPool.connect();
    let synced = 0;
    
    for (const job of jobteaserJobs.rows) {
      try {
        // Vérifier si le job existe déjà
        const existingJob = await unifiedClient.query(
          'SELECT id FROM jobs WHERE original_id = $1 AND source = $2',
          [job.id.toString(), 'jobteaser']
        );
        
        if (existingJob.rows.length > 0) {
          // Mettre à jour le job existant
          await unifiedClient.query(\`
            UPDATE jobs SET 
              title = $1, company = $2, location = $3, description = $4,
              salary = $5, contract_type = $6, remote = $7, url = $8,
              source_url = $9, published_at = $10, start_date = $11,
              updated_at = CURRENT_TIMESTAMP
            WHERE original_id = $12 AND source = $13
          \`, [
            job.title, job.company, job.location, job.description,
            job.salary, job.contract_type, job.remote, job.url,
            job.source_url, job.published_at, job.start_date,
            job.id.toString(), 'jobteaser'
          ]);
        } else {
          // Insérer le nouveau job
          await unifiedClient.query(\`
            INSERT INTO jobs (
              original_id, title, company, location, description,
              salary, contract_type, source, url, source_url,
              published_at, remote, tags, start_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          \`, [
            job.id.toString(), job.title, job.company, job.location, job.description,
            job.salary, job.contract_type, 'jobteaser', job.url, job.source_url,
            job.published_at, job.remote, job.tags, job.start_date
          ]);
        }
        
        synced++;
      } catch (error) {
        console.error(\`❌ Erreur synchronisation job \${job.id}:\`, error.message);
      }
    }
    
    unifiedClient.release();
    console.log(\`✅ \${synced} jobs synchronisés vers la base unifiée\`);
    
  } catch (error) {
    console.error('❌ Erreur synchronisation:', error.message);
  } finally {
    await jobteaserPool.end();
    await unifiedPool.end();
  }
}

syncJobTeaserToUnified().catch(console.error);
        `;
        
        fs.writeFileSync(syncScriptPath, syncScriptContent);
        console.log(`✅ Script de synchronisation créé: ${syncScriptPath}`);
      }
      
      return new Promise((resolve, reject) => {
        exec(`node ${syncScriptPath}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`❌ Erreur synchronisation: ${error.message}`);
            reject(error);
            return;
          }
          if (stderr) {
            console.error(`⚠️ Avertissement synchronisation: ${stderr}`);
          }
          console.log(`📊 Synchronisation: ${stdout}`);
          resolve();
        });
      });
    } catch (error) {
      console.error(`❌ Erreur lors de la synchronisation:`, error.message);
      throw error;
    }
  }

  async saveScrapingStats(stats) {
    const client = await this.dbPool.connect();
    
    try {
      // Vérifier si une entrée existe déjà pour aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      
      const existingStats = await client.query(
        'SELECT id FROM jobteaser_scraping_stats WHERE scraper_name = $1 AND DATE(created_at) = $2',
        ['jobteaser_cron', today]
      );
      
      if (existingStats.rows.length > 0) {
        // Mettre à jour l'entrée existante
        await client.query(`
          UPDATE jobteaser_scraping_stats 
          SET 
            jobs_found = $1,
            jobs_inserted = $2,
            last_run = NOW(),
            status = 'completed'
          WHERE scraper_name = $3 AND DATE(created_at) = $4
        `, [stats.jobs_found, stats.jobs_inserted, 'jobteaser_cron', today]);
      } else {
        // Créer une nouvelle entrée
        await client.query(`
          INSERT INTO jobteaser_scraping_stats (
            scraper_name, created_at, status, first_run, last_run, jobs_found, jobs_inserted
          ) VALUES ($1, NOW(), 'completed', NOW(), NOW(), $2, $3)
        `, ['jobteaser_cron', stats.jobs_found, stats.jobs_inserted]);
      }
      
      console.log('📊 Statistiques de scraping JobTeaser mises à jour');
      
    } catch (error) {
      console.error('❌ Erreur mise à jour stats:', error.message);
    } finally {
      client.release();
    }
  }
}

async function runJobTeaserCron() {
  console.log('\n🚀 DÉBUT DU SCRAPING JOBTEASER CRON');
  console.log('='.repeat(60));
  
  const scraper = new JobTeaserCronScraper();
  
  try {
    const jobs = await scraper.scrape();
    
    console.log('\n🎉 SCRAPING JOBTEASER CRON TERMINÉ');
    console.log(`📊 Total jobs trouvés: ${jobs.length}`);
    
    return jobs;
    
  } catch (error) {
    console.error('❌ Erreur lors du scraping JobTeaser:', error.message);
    throw error;
  }
}

// Exporter pour utilisation dans d'autres modules
module.exports = { JobTeaserCronScraper, runJobTeaserCron };

// Si exécuté directement
if (require.main === module) {
  runJobTeaserCron()
    .then(() => {
      console.log('✅ Scraping JobTeaser terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur lors du scraping JobTeaser:', error);
      process.exit(1);
    });
} 