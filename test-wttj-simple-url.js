const { chromium } = require('playwright');

async function testSimpleWTTJ() {
  console.log('🔍 Test avec URL simple WTTJ...');
  
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
    // URL simple sans filtres
    const url = 'https://www.welcometothejungle.com/fr/jobs';
    
    console.log('🌐 Navigation vers:', url);
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Attendre un peu pour que la page se charge
    await page.waitForTimeout(5000);
    
    console.log('📄 Page chargée, analyse du contenu...');
    
    // Vérifier le titre de la page
    const title = await page.title();
    console.log('📋 Titre de la page:', title);
    
    // Chercher les liens vers les jobs
    const jobLinks = await page.$$('a[href*="/fr/jobs/"]');
    console.log(`🔗 Liens vers les jobs: ${jobLinks.length}`);
    
    if (jobLinks.length > 0) {
      console.log('✅ Jobs trouvés !');
      
      // Afficher les premiers liens
      for (let i = 0; i < Math.min(5, jobLinks.length); i++) {
        const link = jobLinks[i];
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        console.log(`  ${i + 1}. ${href} - "${text}"`);
      }
    } else {
      console.log('❌ Aucun job trouvé avec l\'URL simple');
    }
    
    // Prendre une capture d'écran
    await page.screenshot({ path: 'wttj-simple.png', fullPage: true });
    console.log('📸 Capture d\'écran sauvegardée: wttj-simple.png');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await browser.close();
  }
}

testSimpleWTTJ(); 