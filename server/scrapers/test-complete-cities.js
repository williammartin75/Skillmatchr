const { ApecCronScraper } = require('./apecCron.js');
const { findCityByName, isFrenchCity } = require('./french-cities-loader.js');

async function testCompleteCities() {
  console.log('🧪 TEST de détection des villes avec bibliothèque complète');
  
  const scraper = new ApecCronScraper();
  
  // Tests spécifiques pour les villes demandées
  const testCases = [
    "Poste situé à CRéCY-LA-CHAPELLE",
    "Localisation: RIORGES",
    "Basé à Paris",
    "Travail à Marseille",
    "Situé à Lyon",
    "Localisation: Toulouse",
    "Basé à Nice",
    "Poste à Nantes",
    "Situé à Strasbourg",
    "Localisation: Montpellier",
    "Basé à Bordeaux",
    "Poste à Lille",
    "Situé à Rennes",
    "Localisation: Reims",
    "Basé à Saint-Étienne",
    "Poste à Toulon",
    "Situé à Le Havre",
    "Localisation: Grenoble",
    "Basé à Dijon",
    "Poste à Angers",
    "Situé à Villeurbanne",
    "Localisation: Le Mans",
    "Basé à Aix-en-Provence",
    "Poste à Brest",
    "Situé à Nîmes",
    "Localisation: Limoges",
    "Basé à Clermont-Ferrand",
    "Poste à Tours",
    "Situé à Amiens",
    "Localisation: Metz",
    "Basé à Besançon",
    "Poste à Perpignan",
    "Situé à Orléans",
    "Localisation: Mulhouse",
    "Basé à Caen",
    "Poste à Boulogne-Billancourt",
    "Situé à Rouen",
    "Localisation: Nancy",
    "Basé à Argenteuil",
    "Poste à Montreuil",
    "Situé à Saint-Denis",
    "Localisation: Roubaix",
    "Basé à Avignon",
    "Poste à Tourcoing",
    "Situé à Fort-de-France",
    "Localisation: Créteil",
    "Basé à Poitiers",
    "Poste à Nanterre",
    "Situé à Versailles",
    "Localisation: Courbevoie",
    "Basé à Vitry-sur-Seine",
    "Poste à Asnières-sur-Seine",
    "Situé à Colombes",
    "Localisation: Aulnay-sous-Bois",
    "Basé à Rueil-Malmaison",
    "Poste à La Rochelle",
    "Situé à Antibes",
    "Localisation: Saint-Maur-des-Fossés",
    "Basé à Calais",
    "Poste à Champigny-sur-Marne",
    "Situé à Saint-Nazaire",
    "Localisation: Dunkerque",
    "Basé à Aix-les-Bains",
    "Poste à Annecy",
    "Situé à Annemasse",
    "Localisation: Nanteuil",
    "Basé à Chelles"
  ];
  
  console.log('\n📋 Tests de détection des villes:');
  console.log('=' .repeat(80));
  
  let successCount = 0;
  let totalCount = testCases.length;
  
  for (let i = 0; i < testCases.length; i++) {
    const testText = testCases[i];
    console.log(`\n${i + 1}. Texte: "${testText}"`);
    
    const result = scraper.extractInfoFromText(testText);
    if (result.location) {
      console.log(`   ✅ Ville trouvée: "${result.location}"`);
      successCount++;
    } else {
      console.log(`   ❌ Aucune ville trouvée`);
    }
  }
  
  console.log('\n📊 Résultats:');
  console.log(`✅ Villes détectées: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  
  // Test spécifique pour CRéCY-LA-CHAPELLE et RIORGES
  console.log('\n🔍 Test spécifique pour CRéCY-LA-CHAPELLE et RIORGES:');
  console.log('CRéCY-LA-CHAPELLE trouvée:', isFrenchCity('CRéCY-LA-CHAPELLE'));
  console.log('RIORGES trouvée:', isFrenchCity('RIORGES'));
  
  const crecyCity = findCityByName('CRéCY-LA-CHAPELLE');
  const riorgesCity = findCityByName('RIORGES');
  
  if (crecyCity) {
    console.log('CRéCY-LA-CHAPELLE détails:', crecyCity);
  }
  if (riorgesCity) {
    console.log('RIORGES détails:', riorgesCity);
  }
  
  console.log('\n✅ Test terminé !');
}

// Exécuter le test
testCompleteCities().catch(console.error);