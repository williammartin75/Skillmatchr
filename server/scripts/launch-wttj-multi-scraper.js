const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Lancement du multi-scraper WTTJ...');

const scraperPath = path.join(__dirname, '../scrapers/wttjMultiScraper.js');

const child = spawn('node', [scraperPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Multi-scraper WTTJ terminé avec succès');
  } else {
    console.error(`❌ Multi-scraper WTTJ terminé avec le code ${code}`);
  }
  process.exit(code);
});

child.on('error', (error) => {
  console.error('❌ Erreur lancement multi-scraper:', error);
  process.exit(1);
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du multi-scraper...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du multi-scraper...');
  child.kill('SIGTERM');
}); 