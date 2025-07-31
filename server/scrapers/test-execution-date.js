const { ApecCronScraper } = require('./apecCron.js');

async function testExecutionDateUpdate() {
  console.log('🧪 TEST de mise à jour de la date d\'exécution APEC');
  
  const scraper = new ApecCronScraper();
  
  try {
    // Tester la connexion à la base de données
    console.log('🔌 Test de connexion à la base de données...');
    await scraper.testDatabaseConnection();
    
    // Forcer la mise à jour de la date d'exécution
    console.log('🔄 Test de mise à jour de la date d\'exécution...');
    await scraper.forceUpdateExecutionDate();
    
    console.log('✅ Test terminé avec succès !');
    console.log('📊 Vérifiez maintenant http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    await scraper.pool.end();
  }
}

// Exécuter le test
testExecutionDateUpdate().catch(console.error);