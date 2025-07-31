const { ApecCronScraper } = require('./server/scrapers/apecCron.js');

async function testApecDatabase() {
  console.log('🧪 Test de la base de données APEC...');
  
  try {
    const scraper = new ApecCronScraper();
    
    // Test 1: Initialisation de la base de données
    console.log('\n📋 Test 1: Initialisation de la base de données...');
    await scraper.initializeDatabase();
    console.log('✅ Base de données APEC initialisée avec succès');
    
    // Test 2: Test de connexion
    console.log('\n🔗 Test 2: Test de connexion...');
    await scraper.testDatabaseConnection();
    console.log('✅ Connexion à la base de données réussie');
    
    // Test 3: Insertion d'un job de test
    console.log('\n💾 Test 3: Insertion d\'un job de test...');
    const testJob = {
      title: 'Développeur Full Stack - Test',
      company: 'Entreprise Test',
      location: 'Paris',
      salary: '45k€',
      contractType: 'CDI',
      experience: '3-5 ans',
      telework: 'Hybride',
      startDate: 'Dès que possible',
      description: 'Description de test pour vérifier l\'insertion',
      sourceUrl: 'https://www.apec.fr/test',
      publishedAt: new Date().toISOString(),
      source: 'apec',
      tags: ['test', 'apec']
    };
    
    const insertedCount = await scraper.insertJobsToDatabase([testJob]);
    console.log(`✅ ${insertedCount} job de test inséré`);
    
    // Test 4: Sauvegarde de statistiques
    console.log('\n📊 Test 4: Sauvegarde de statistiques...');
    await scraper.saveScrapingStats({
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: 10.5,
      totalJobsFound: 1,
      totalJobsInserted: 1,
      totalPagesScraped: 1,
      status: 'test_success'
    });
    console.log('✅ Statistiques sauvegardées');
    
    // Test 5: Log d'erreur
    console.log('\n⚠️ Test 5: Log d\'erreur...');
    await scraper.logError('test_error', 'Erreur de test', 'Stack trace de test', {
      test: true,
      timestamp: new Date().toISOString()
    });
    console.log('✅ Erreur loggée');
    
    console.log('\n🎉 Tous les tests de la base de données APEC sont passés !');
    console.log(`📦 Base de données utilisée: ${scraper.databaseName}`);
    
    // Fermer la connexion
    if (scraper.dbPool) {
      await scraper.dbPool.end();
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le test
testApecDatabase()
  .then(() => {
    console.log('\n✅ Test terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test échoué:', error);
    process.exit(1);
  }); 