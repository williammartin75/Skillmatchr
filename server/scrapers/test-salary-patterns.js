const { ApecCronScraper } = require('./apecCron.js');

async function testSalaryPatterns() {
  console.log('🧪 TEST des patterns de salaire APEC');
  
  const scraper = new ApecCronScraper();
  
  // Tests de patterns de salaire
  const testCases = [
    "Salaire: 45 000 € brut annuel",
    "Rémunération: 35k€ - 50k€",
    "A partir de 40 000 €",
    "A négocier selon expérience",
    "Salaire 25 - 35 k€",
    "Rémunération: 12 - 75", // Ceci devrait retourner "Salaire non précisé"
    "Salaire: 50k€ brut",
    "A partir de 30 000 € annuel",
    "Rémunération non précisée",
    "Salaire: 45k€ - 65k€ brut annuel"
  ];
  
  console.log('\n📋 Tests des patterns de salaire:');
  console.log('=' .repeat(60));
  
  for (let i = 0; i < testCases.length; i++) {
    const testText = testCases[i];
    console.log(`\n${i + 1}. Texte: "${testText}"`);
    
    const result = scraper.extractInfoFromText(testText);
    console.log(`   → Salaire extrait: "${result.salary}"`);
  }
  
  console.log('\n✅ Test terminé !');
}

// Exécuter le test
testSalaryPatterns().catch(console.error);