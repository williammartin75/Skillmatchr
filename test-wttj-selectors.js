const { chromium } = require('playwright');

async function testWTTJSelectors() {
  console.log('🔍 Test des sélecteurs WTTJ...');
  
  const browser = await chromium.launch({
    headless: true, // Mode headless pour le serveur
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  
  try {
    const baseUrl = 'https://www.welcometothejungle.com/fr/jobs';
    const params = new URLSearchParams({
      'refinementList[contract_type][]': ['full_time', 'apprenticeship', 'temporary', 'internship', 'freelance', 'graduate_program', 'other', 'part_time', 'vie', 'volunteer', 'idv'],
      'refinementList[offices.country_code][]': 'FR',
      'refinementList[organization.creation_year][]': '0-2010',
      'page': '1',
      'sortBy': 'mostRecent',
      'collections[]': 'well_established',
      'searchTitle': 'false'
    });
    
    const url = `${baseUrl}?${params.toString()}`;
    console.log('🌐 Navigation vers:', url);
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Attendre un peu pour que la page se charge
    await page.waitForTimeout(5000);
    
    console.log('📄 Page chargée, recherche des éléments...');
    
    // Tester différents sélecteurs
    const selectors = [
      '.ais-Hits-item',
      '[data-testid="job-card"]',
      '.job-card',
      '.search-result-item',
      '.job-listing',
      '.job-item',
      '.hit-item',
      '.ais-Hits-list .ais-Hits-item',
      'article',
      '.job',
      '.listing-item'
    ];
    
    for (const selector of selectors) {
      try {
        const elements = await page.$$(selector);
        console.log(`✅ Sélecteur "${selector}": ${elements.length} éléments trouvés`);
        
        if (elements.length > 0) {
          // Examiner le premier élément
          const firstElement = elements[0];
          const html = await firstElement.innerHTML();
          console.log(`📋 Premier élément "${selector}":`);
          console.log(html.substring(0, 500) + '...');
          console.log('---');
        }
      } catch (error) {
        console.log(`❌ Sélecteur "${selector}": ${error.message}`);
      }
    }
    
    // Chercher tous les liens vers les jobs
    const jobLinks = await page.$$('a[href*="/fr/jobs/"]');
    console.log(`🔗 Liens vers les jobs trouvés: ${jobLinks.length}`);
    
    if (jobLinks.length > 0) {
      const firstLink = jobLinks[0];
      const href = await firstLink.getAttribute('href');
      const text = await firstLink.textContent();
      console.log(`📋 Premier lien: ${href} - "${text}"`);
    }
    
    // Prendre une capture d'écran pour voir la page
    await page.screenshot({ path: 'wttj-page.png', fullPage: true });
    console.log('📸 Capture d\'écran sauvegardée: wttj-page.png');
    
    // Fermer le navigateur après 10 secondes
    console.log('⏳ Fermeture du navigateur dans 10 secondes...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await browser.close();
  }
}

testWTTJSelectors(); 