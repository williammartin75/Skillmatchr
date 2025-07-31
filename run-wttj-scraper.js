const { runWTTJScraper } = require('./server/scrapers/wttjScraper');

async function main() {
  console.log('🚀 Lancement du scraper WTTJ indépendant...');
  
  try {
    const result = await runWTTJScraper();
    
    if (result.success) {
      console.log('✅ Scraper WTTJ terminé avec succès!');
      console.log(`📊 Résultats:`);
      console.log(`   - Jobs trouvés: ${result.jobs_found}`);
      console.log(`   - Jobs traités: ${result.jobs_processed}`);
      console.log(`   - Erreurs: ${result.errors}`);
      console.log(`   - Temps d'exécution: ${(result.execution_time / 1000).toFixed(2)}s`);
    } else {
      console.error('❌ Erreur lors du scraping WTTJ:', result.error);
    }
  } catch (error) {
    console.error('❌ Erreur critique:', error.message);
  }
}

main(); 