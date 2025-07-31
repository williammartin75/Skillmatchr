const { syncApecToUnified } = require('./sync-apec-to-unified');
const { runWTTJScraper } = require('./server/scrapers/wttjScraper');

// Configuration des scrapers disponibles
const scrapers = {
  apec: {
    name: 'APEC',
    enabled: true,
    syncAfterScraping: true,
    description: 'Scraper APEC avec synchronisation automatique'
  },
  jobteaser: {
    name: 'JobTeaser',
    enabled: true,
    syncAfterScraping: false,
    description: 'Scraper JobTeaser avec extraction parallèle'
  },
  wttj: {
    name: 'Welcome to the Jungle',
    enabled: true,
    syncAfterScraping: true,
    description: 'Scraper Welcome to the Jungle pour les entreprises'
  },
  wttj_multi: {
    name: 'Welcome to the Jungle Multi',
    enabled: true,
    syncAfterScraping: true,
    description: 'Multi-scraper WTTJ avec 20 workers et rotation des proxies'
  },
  indeed: {
    name: 'Indeed',
    enabled: false, // Pas encore implémenté
    syncAfterScraping: false,
    description: 'Scraper Indeed (à implémenter)'
  },
  linkedin: {
    name: 'LinkedIn',
    enabled: false, // Pas encore implémenté
    syncAfterScraping: false,
    description: 'Scraper LinkedIn (à implémenter)'
  }
};

async function runScraper(scraperName) {
  const scraper = scrapers[scraperName];
  
  if (!scraper) {
    throw new Error(`Scraper '${scraperName}' non configuré`);
  }
  
  if (!scraper.enabled) {
    console.log(`⚠️ Scraper ${scraper.name} désactivé (${scraper.description})`);
    return { success: false, reason: 'disabled' };
  }
  
  console.log(`🚀 Lancement du scraper ${scraper.name}...`);
  
  try {
    // ========================================
    // LANCEMENT DU SCRAPER SPÉCIFIQUE
    // ========================================
    let scrapingResult;
    
    switch (scraperName) {
      case 'apec':
        // Ici vous appelez votre vrai scraper APEC
        scrapingResult = await runApecScraper();
        break;
        
      case 'jobteaser':
        // Scraper JobTeaser
        scrapingResult = await runJobTeaserScraper();
        break;
        
      case 'wttj':
        // Scraper Welcome to the Jungle
        scrapingResult = await runWTTJScraper();
        break;
        
      case 'wttj_multi':
        // Multi-scraper Welcome to the Jungle
        scrapingResult = await runWTTJMultiScraper();
        break;
        
      case 'indeed':
        console.log('🔧 Scraper Indeed non encore implémenté');
        return { success: false, reason: 'not_implemented' };
        
      case 'linkedin':
        console.log('🔧 Scraper LinkedIn non encore implémenté');
        return { success: false, reason: 'not_implemented' };
        
      default:
        throw new Error(`Scraper '${scraperName}' non reconnu`);
    }
    
    // ========================================
    // SYNCHRONISATION AUTOMATIQUE SI CONFIGURÉE
    // ========================================
    if (scraper.syncAfterScraping && scrapingResult.success) {
      console.log(`🔄 Synchronisation automatique pour ${scraper.name}...`);
      
      const syncResult = await syncApecToUnified();
      
      if (syncResult.success) {
        console.log(`✅ Synchronisation ${scraper.name} réussie:`);
        console.log(`   - ${syncResult.newJobs} nouveaux jobs`);
        console.log(`   - ${syncResult.updatedJobs} jobs mis à jour`);
        console.log(`   - ${syncResult.errors} erreurs`);
        
        return {
          success: true,
          scraper: scraperName,
          scrapingResult,
          syncResult
        };
      } else {
        console.error(`❌ Échec synchronisation ${scraper.name}:`, syncResult.error);
        return {
          success: false,
          scraper: scraperName,
          scrapingResult,
          syncError: syncResult.error
        };
      }
    } else {
      console.log(`✅ Scraper ${scraper.name} terminé (sans synchronisation)`);
      return {
        success: true,
        scraper: scraperName,
        scrapingResult
      };
    }
    
  } catch (error) {
    console.error(`💥 Erreur dans le scraper ${scraper.name}:`, error);
    return {
      success: false,
      scraper: scraperName,
      error: error.message
    };
  }
}

// Simulation du scraper APEC (à remplacer par votre vrai code)
async function runApecScraper() {
  console.log('📡 Scraping des offres APEC...');
  
  // Simulation du processus de scraping
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('💾 Sauvegarde des offres dans la base APEC...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('✅ Scraping APEC terminé');
  
  return { success: true, jobsScraped: 150 }; // Exemple
}

// Scraper JobTeaser
async function runJobTeaserScraper() {
  try {
    const { runJobTeaserCron } = require('./server/scrapers/jobteaserCron');
    const jobs = await runJobTeaserCron();
    return { success: true, jobs: jobs };
  } catch (error) {
    console.error('❌ Erreur scraper JobTeaser:', error.message);
    return { success: false, error: error.message };
  }
}

// Multi-scraper WTTJ
async function runWTTJMultiScraper() {
  try {
    console.log('🚀 Lancement du scraper Welcome to the Jungle Multi...');
    
    const { runWTTJMultiScraper } = require('./server/scrapers/wttjScraper.js');
    
    await runWTTJMultiScraper();
    
    return { success: true, output: 'Multi-scraper WTTJ terminé avec succès' };
  } catch (error) {
    console.error('❌ Erreur multi-scraper WTTJ:', error.message);
    return { success: false, error: error.message };
  }
}

async function runAllScrapers() {
  console.log('🚀 Lancement de tous les scrapers configurés...');
  
  const results = {};
  
  for (const [scraperName, scraper] of Object.entries(scrapers)) {
    if (scraper.enabled) {
      console.log(`\n--- ${scraper.name} ---`);
      results[scraperName] = await runScraper(scraperName);
    }
  }
  
  return results;
}

async function runSpecificScraper(scraperName) {
  console.log(`🚀 Lancement du scraper ${scraperName}...`);
  return await runScraper(scraperName);
}

// Fonction pour lister les scrapers disponibles
function listScrapers() {
  console.log('📋 Scrapers disponibles:');
  console.log('');
  
  for (const [name, scraper] of Object.entries(scrapers)) {
    const status = scraper.enabled ? '✅ Activé' : '❌ Désactivé';
    const sync = scraper.syncAfterScraping ? '🔄 Sync auto' : '⏸️ Pas de sync';
    
    console.log(`${name.toUpperCase()}:`);
    console.log(`  - ${scraper.description}`);
    console.log(`  - Statut: ${status}`);
    console.log(`  - Synchronisation: ${sync}`);
    console.log('');
  }
}

// Fonction pour activer/désactiver un scraper
function toggleScraper(scraperName, enabled = true) {
  if (scrapers[scraperName]) {
    scrapers[scraperName].enabled = enabled;
    console.log(`✅ Scraper ${scraperName} ${enabled ? 'activé' : 'désactivé'}`);
  } else {
    console.error(`❌ Scraper ${scraperName} non trouvé`);
  }
}

// Gestion des arguments de ligne de commande
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'list':
        listScrapers();
        break;
        
      case 'all':
        const results = await runAllScrapers();
        console.log('\n📊 Résumé des résultats:');
        for (const [name, result] of Object.entries(results)) {
          console.log(`  - ${name}: ${result.success ? '✅ Succès' : '❌ Échec'}`);
        }
        break;
        
      case 'apec':
        await runSpecificScraper('apec');
        break;
        
      case 'jobteaser':
        await runSpecificScraper('jobteaser');
        break;
        
      case 'wttj':
        await runSpecificScraper('wttj');
        break;
        
      case 'wttj_multi':
        await runSpecificScraper('wttj_multi');
        break;
        
      case 'indeed':
        await runSpecificScraper('indeed');
        break;
        
      case 'linkedin':
        await runSpecificScraper('linkedin');
        break;
        
      case 'sync':
        console.log('🔄 Synchronisation manuelle APEC...');
        const syncResult = await syncApecToUnified();
        if (syncResult.success) {
          console.log('✅ Synchronisation réussie !');
        } else {
          console.error('❌ Échec synchronisation:', syncResult.error);
        }
        break;
        
      case 'enable':
        if (args[1]) {
          toggleScraper(args[1], true);
        } else {
          console.log('Usage: node launch-scrapers-with-sync.js enable <scraper>');
        }
        break;
        
      case 'disable':
        if (args[1]) {
          toggleScraper(args[1], false);
        } else {
          console.log('Usage: node launch-scrapers-with-sync.js disable <scraper>');
        }
        break;
        
      default:
        console.log('Usage:');
        console.log('  node launch-scrapers-with-sync.js list                    # Lister les scrapers');
        console.log('  node launch-scrapers-with-sync.js all                     # Lancer tous les scrapers');
          console.log('  node launch-scrapers-with-sync.js apec                    # Lancer APEC');
        console.log('  node launch-scrapers-with-sync.js jobteaser               # Lancer JobTeaser');
        console.log('  node launch-scrapers-with-sync.js wttj                    # Lancer WTTJ');
        console.log('  node launch-scrapers-with-sync.js wttj_multi              # Lancer WTTJ Multi (20 workers)');
        console.log('  node launch-scrapers-with-sync.js sync                    # Synchronisation manuelle');
        console.log('  node launch-scrapers-with-sync.js enable <scraper>        # Activer un scraper');
        console.log('  node launch-scrapers-with-sync.js disable <scraper>       # Désactiver un scraper');
        break;
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error);
    process.exit(1);
  }
}

// Exporter les fonctions pour utilisation dans d'autres scripts
module.exports = {
  runScraper,
  runAllScrapers,
  runSpecificScraper,
  listScrapers,
  toggleScraper,
  scrapers
};

// Si le script est exécuté directement
if (require.main === module) {
  main();
} 