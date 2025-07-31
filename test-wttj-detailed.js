const { chromium } = require('playwright');

async function testDetailedWTTJ() {
  console.log('🔍 Test détaillé WTTJ - Extraction des 30 jobs...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  
  try {
    const url = 'https://www.welcometothejungle.com/fr/jobs?refinementList%5Bcontract_type%5D%5B%5D=full_time&refinementList%5Bcontract_type%5D%5B%5D=apprenticeship&refinementList%5Bcontract_type%5D%5B%5D=temporary&refinementList%5Bcontract_type%5D%5B%5D=internship&refinementList%5Bcontract_type%5D%5B%5D=freelance&refinementList%5Bcontract_type%5D%5B%5D=graduate_program&refinementList%5Bcontract_type%5D%5B%5D=other&refinementList%5Bcontract_type%5D%5B%5D=part_time&refinementList%5Bcontract_type%5D%5B%5D=vie&refinementList%5Bcontract_type%5D%5B%5D=volunteer&refinementList%5Bcontract_type%5D%5B%5D=idv&refinementList%5Boffices.country_code%5D%5B%5D=FR&refinementList%5Borganization.creation_year%5D%5B%5D=0-2010&page=1&sortBy=mostRecent&collections%5B%5D=well_established&searchTitle=false';
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Test de l'extraction détaillée
    const result = await page.evaluate(() => {
      const jobLinks = document.querySelectorAll('a[href*="/jobs/"]');
      const jobsOnPage = [];
      const processedUrls = new Set();
      
      console.log(`🔗 Total liens jobs trouvés: ${jobLinks.length}`);
      
      jobLinks.forEach((link, index) => {
        const url = link.href;
        
        // Éviter les doublons
        if (processedUrls.has(url)) { 
          console.log(`⚠️ Doublon ignoré: ${url}`);
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
        
        console.log(`🔍 === JOB ${index + 1} ===`);
        
        // Extraire le titre du job depuis le lien
        const title = link.textContent.trim();
        if (title && title !== 'Recrute activement !') {
          jobData.title = title;
          console.log(`📋 Titre extrait: "${jobData.title}"`);
        } else {
          // Chercher le titre dans les éléments parents
          const card = link.closest('article, .ais-Hits-item, .job-card, .search-result-item, .job-listing, .hit-item') || link.parentElement;
          const titleElement = card.querySelector('h3, h2, .job-title, .title, [data-testid="job-title"]');
          if (titleElement) {
            jobData.title = titleElement.textContent.trim();
            console.log(`📋 Titre extrait (parent): "${jobData.title}"`);
          }
        }
        
        // Extraire le nom de l'entreprise depuis l'URL
        const urlParts = url.split('/');
        const companyIndex = urlParts.indexOf('companies');
        if (companyIndex !== -1 && urlParts[companyIndex + 1]) {
          jobData.company = urlParts[companyIndex + 1];
          console.log(`🏢 Entreprise extraite: "${jobData.company}"`);
        }
        
        // Extraire la localisation depuis l'URL (dernière partie après le dernier underscore)
        const jobPart = url.split('/').pop();
        if (jobPart && jobPart.includes('_')) {
          const parts = jobPart.split('_');
          // Prendre la partie avant le dernier underscore comme location
          const locationPart = parts[parts.length - 2];
          if (locationPart && locationPart.length > 2) {
            jobData.location = locationPart;
            console.log(`📍 Localisation extraite: "${jobData.location}"`);
          }
        }
        
        // Chercher le contrat dans les éléments parents
        const card = link.closest('article, .ais-Hits-item, .job-card, .search-result-item, .job-listing, .hit-item') || link.parentElement;
        const contractElement = card.querySelector('.contract-type, .job-contract, .contract, .job-type, [data-testid="contract"]');
        if (contractElement) {
          jobData.contract = contractElement.textContent.trim();
          console.log(`📄 Contrat extrait: "${jobData.contract}"`);
        }
        
        // Chercher la date de publication
        const dateElement = card.querySelector('.job-date, .published-date, .date, [data-testid="date"]');
        if (dateElement) {
          const publishedDate = dateElement.textContent.trim();
          jobData.published_at = publishedDate;
          console.log(`📅 Date extraite: "${publishedDate}"`);
        }
        
        // Générer un source_id unique
        jobData.source_id = url.split('/').pop() || `wttj_${Date.now()}_${index}`;
        
        // Vérifier si on a les informations minimales
        if (jobData.title && jobData.company) {
          jobsOnPage.push(jobData);
          console.log(`✅ Job ${index + 1} ajouté: "${jobData.title}" chez ${jobData.company} (${jobData.location})`);
        } else {
          console.log(`❌ Job ${index + 1} ignoré - titre: "${jobData.title}", company: "${jobData.company}"`);
        }
        
        console.log(`🔗 URL: ${jobData.url}`);
        console.log(`📊 Source ID: ${jobData.source_id}`);
        console.log(`---`);
      });
      
      return {
        jobs: jobsOnPage,
        totalLinks: jobLinks.length
      };
    });
    
    console.log(`\n📊 RÉSULTATS:`);
    console.log(`   - Total liens jobs: ${result.totalLinks}`);
    console.log(`   - Jobs extraits: ${result.jobs.length}`);
    console.log(`   - Jobs avec titre et company: ${result.jobs.filter(j => j.title && j.company).length}`);
    
    // Afficher tous les jobs extraits avec leurs détails
    console.log(`\n📋 TOUS LES JOBS EXTRITS:`);
    result.jobs.forEach((job, i) => {
      console.log(`\n${i + 1}. "${job.title}"`);
      console.log(`   🏢 Company: ${job.company}`);
      console.log(`   📍 Location: ${job.location}`);
      console.log(`   📄 Contract: ${job.contract}`);
      console.log(`   📅 Date: ${job.published_at}`);
      console.log(`   🔗 URL: ${job.url}`);
      console.log(`   📊 Source ID: ${job.source_id}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await browser.close();
  }
}

testDetailedWTTJ(); 