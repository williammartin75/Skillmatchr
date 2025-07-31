const { ApecCronScraper } = require('./server/scrapers/apecCron.js');

async function testApecDatabaseSimple() {
  console.log('🧪 Test simple de la base de données APEC...');
  console.log('==========================================');
  
  try {
    const scraper = new ApecCronScraper();
    
    console.log('📋 Étape 1: Initialisation de la base de données...');
    await scraper.initializeDatabase();
    console.log('✅ Base de données APEC initialisée');
    
    console.log('\n🔗 Étape 2: Test de connexion...');
    await scraper.testDatabaseConnection();
    console.log('✅ Connexion réussie');
    
    console.log('\n💾 Étape 3: Test d\'insertion de données...');
    const testJobs = [
      {
        title: 'Développeur Full Stack Senior',
        company: 'TechCorp',
        location: 'Paris',
        salary: '65k€',
        contractType: 'CDI',
        experience: '5-8 ans',
        telework: 'Hybride',
        startDate: 'Dès que possible',
        description: 'Poste de développeur full stack senior avec React et Node.js',
        sourceUrl: 'https://www.apec.fr/job1',
        publishedAt: new Date().toISOString(),
        source: 'apec',
        tags: ['fullstack', 'react', 'nodejs']
      },
      {
        title: 'Data Scientist',
        company: 'DataLab',
        location: 'Lyon',
        salary: '55k€',
        contractType: 'CDI',
        experience: '3-5 ans',
        telework: 'Remote',
        startDate: 'Septembre 2024',
        description: 'Poste de data scientist avec Python et machine learning',
        sourceUrl: 'https://www.apec.fr/job2',
        publishedAt: new Date().toISOString(),
        source: 'apec',
        tags: ['data', 'python', 'ml']
      }
    ];
    
    const insertedCount = await scraper.insertJobsToDatabase(testJobs);
    console.log(`✅ ${insertedCount} jobs insérés avec succès`);
    
    console.log('\n📊 Étape 4: Test de sauvegarde des statistiques...');
    await scraper.saveScrapingStats({
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: 15.5,
      totalJobsFound: 2,
      totalJobsInserted: 2,
      totalPagesScraped: 1,
      status: 'test_success'
    });
    console.log('✅ Statistiques sauvegardées');
    
    console.log('\n🎉 Test terminé avec succès !');
    console.log(`📦 Base de données utilisée: ${scraper.databaseName}`);
    console.log('🗄️ Tables créées: apec_jobs, apec_scraping_stats, apec_error_logs');
    
    // Fermer la connexion
    if (scraper.dbPool) {
      await scraper.dbPool.end();
      console.log('🔒 Connexion fermée');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le test
console.log('🚀 Démarrage du test...\n');
testApecDatabaseSimple()
  .then(() => {
    console.log('\n✅ Test terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test échoué:', error);
    process.exit(1);
  }); 