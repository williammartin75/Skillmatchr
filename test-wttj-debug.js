const { chromium } = require('playwright');

async function debugWTTJ() {
  console.log('🔍 Debug de la page WTTJ...');
  
  const browser = await chromium.launch({
    headless: true,
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
    // URL exacte avec tous les filtres
    const url = 'https://www.welcometothejungle.com/fr/jobs?refinementList%5Bcontract_type%5D%5B%5D=full_time&refinementList%5Bcontract_type%5D%5B%5D=apprenticeship&refinementList%5Bcontract_type%5D%5B%5D=temporary&refinementList%5Bcontract_type%5D%5B%5D=internship&refinementList%5Bcontract_type%5D%5B%5D=freelance&refinementList%5Bcontract_type%5D%5B%5D=graduate_program&refinementList%5Bcontract_type%5D%5B%5D=other&refinementList%5Bcontract_type%5D%5B%5D=part_time&refinementList%5Bcontract_type%5D%5B%5D=vie&refinementList%5Bcontract_type%5D%5B%5D=volunteer&refinementList%5Bcontract_type%5D%5B%5D=idv&refinementList%5Boffices.country_code%5D%5B%5D=FR&refinementList%5Borganization.creation_year%5D%5B%5D=0-2010&page=1&sortBy=mostRecent&collections%5B%5D=well_established&searchTitle=false';
    
    console.log('🌐 Navigation vers:', url);
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Attendre un peu pour que la page se charge
    await page.waitForTimeout(5000);
    
    console.log('📄 Page chargée, analyse du contenu...');
    
    // Vérifier le titre de la page
    const title = await page.title();
    console.log('📋 Titre de la page:', title);
    
    // Vérifier l'URL finale
    const currentUrl = page.url();
    console.log('🔗 URL finale:', currentUrl);
    
    // Chercher tous les liens
    const allLinks = await page.$$('a');
    console.log(`🔗 Nombre total de liens: ${allLinks.length}`);
    
    // Chercher les liens vers les jobs
    const jobLinks = await page.$$('a[href*="/fr/jobs/"]');
    console.log(`🔗 Liens vers les jobs: ${jobLinks.length}`);
    
    // Chercher tous les éléments avec des classes contenant "job"
    const jobElements = await page.$$('[class*="job"]');
    console.log(`🔗 Éléments avec classe contenant "job": ${jobElements.length}`);
    
    // Chercher tous les articles
    const articles = await page.$$('article');
    console.log(`📄 Articles trouvés: ${articles.length}`);
    
    // Chercher tous les éléments avec des classes contenant "hit"
    const hitElements = await page.$$('[class*="hit"]');
    console.log(`🎯 Éléments avec classe contenant "hit": ${hitElements.length}`);
    
    // Prendre une capture d'écran
    await page.screenshot({ path: 'wttj-debug.png', fullPage: true });
    console.log('📸 Capture d\'écran sauvegardée: wttj-debug.png');
    
    // Afficher le HTML de la page
    const html = await page.content();
    console.log('📄 Taille du HTML:', html.length, 'caractères');
    
    // Chercher des indices dans le HTML
    if (html.includes('job')) {
      console.log('✅ Le mot "job" est présent dans le HTML');
    }
    if (html.includes('emploi')) {
      console.log('✅ Le mot "emploi" est présent dans le HTML');
    }
    if (html.includes('offre')) {
      console.log('✅ Le mot "offre" est présent dans le HTML');
    }
    
    // Chercher des messages d'erreur
    if (html.includes('Nous n\'avons pas trouvé de jobs')) {
      console.log('⚠️ Message "Nous n\'avons pas trouvé de jobs" détecté');
    }
    if (html.includes('Aucun résultat')) {
      console.log('⚠️ Message "Aucun résultat" détecté');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await browser.close();
  }
}

debugWTTJ(); 