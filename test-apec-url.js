const { ApecCronScraper } = require('./server/scrapers/apecCron.js');

async function testApecUrl() {
  console.log('🧪 Test de l\'URL APEC...');
  
  try {
    const scraper = new ApecCronScraper();
    
    // Test des URLs générées
    console.log('\n🔗 URLs générées:');
    for (let i = 0; i < 3; i++) {
      const url = scraper.buildPageUrl(i);
      console.log(`Page ${i + 1}: ${url}`);
    }
    
    // Test de la base de données
    console.log('\n🗄️ Test de la base de données...');
    await scraper.initializeDatabase();
    console.log('✅ Base de données initialisée');
    
    // Test de connexion
    await scraper.testDatabaseConnection();
    console.log('✅ Connexion réussie');
    
    // Fermer la connexion
    if (scraper.dbPool) {
      await scraper.dbPool.end();
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testApecUrl(); 