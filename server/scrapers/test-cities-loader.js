const { frenchCitiesLoader } = require('./french-cities-api-loader.js');

/**
 * Script de test pour la bibliothèque de villes françaises avec coordonnées
 */
async function testCitiesLoader() {
  console.log('🧪 TEST DE LA BIBLIOTHÈQUE DE VILLES FRANÇAISES');
  console.log('=' .repeat(50));
  
  try {
    // 1. Charger les villes
    console.log('\n1️⃣ Chargement des villes françaises...');
    const cities = await frenchCitiesLoader.loadCities();
    console.log(`✅ ${cities.length} villes chargées`);
    
    // 2. Afficher les statistiques
    console.log('\n2️⃣ Statistiques des villes:');
    const stats = frenchCitiesLoader.getCitiesStats();
    if (stats) {
      console.log(`   - Total: ${stats.total}`);
      console.log(`   - Avec coordonnées: ${stats.withCoordinates}`);
      console.log(`   - Dernière mise à jour: ${stats.lastUpdate}`);
      console.log('\n   Répartition par catégorie:');
      Object.entries(stats.byCategory).forEach(([category, count]) => {
        console.log(`     - ${category}: ${count}`);
      });
    }
    
    // 3. Tester la recherche de villes
    console.log('\n3️⃣ Test de recherche de villes:');
    const testCities = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Nantes', 'Toulouse'];
    
    for (const cityName of testCities) {
      const city = frenchCitiesLoader.findCityByName(cityName);
      if (city) {
        console.log(`✅ ${cityName}: ${city.nom} (${city.region})`);
        console.log(`   Coordonnées: ${city.coordinates ? `${city.coordinates.latitude}, ${city.coordinates.longitude}` : 'Non disponibles'}`);
        console.log(`   Population: ${city.population}`);
        console.log(`   Catégorie: ${city.category}`);
      } else {
        console.log(`❌ ${cityName}: Non trouvée`);
      }
    }
    
    // 4. Tester la recherche de villes proches
    console.log('\n4️⃣ Test de recherche de villes proches:');
    const testNearbyCity = 'Paris';
    const nearbyCities = frenchCitiesLoader.findCitiesNearby(testNearbyCity, 30);
    console.log(`🗺️ Villes dans un rayon de 30km autour de ${testNearbyCity}:`);
    nearbyCities.slice(0, 5).forEach((city, index) => {
      const distance = frenchCitiesLoader.calculateDistance(
        48.8566, 2.3522, // Coordonnées de Paris
        city.coordinates.latitude, city.coordinates.longitude
      );
      console.log(`   ${index + 1}. ${city.nom} (${distance.toFixed(1)}km)`);
    });
    
    // 5. Tester la recherche par code postal
    console.log('\n5️⃣ Test de recherche par code postal:');
    const testPostalCode = '75001';
    const citiesByPostal = frenchCitiesLoader.findCitiesByPostalCode(testPostalCode);
    console.log(`📮 Villes avec le code postal ${testPostalCode}:`);
    citiesByPostal.forEach(city => {
      console.log(`   - ${city.nom} (${city.region})`);
    });
    
    console.log('\n✅ Tous les tests terminés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Exécuter les tests si le fichier est appelé directement
if (require.main === module) {
  testCitiesLoader().catch(console.error);
}

module.exports = { testCitiesLoader };