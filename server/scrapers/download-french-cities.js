const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Script pour télécharger les villes françaises avec coordonnées
 */
async function downloadFrenchCities() {
  console.log('🌍 Téléchargement des villes françaises...');
  
  const apiUrl = 'https://geo.api.gouv.fr/communes?fields=nom,code,codesPostaux,population,centre&format=json&geometry=centre';
  const outputPath = path.join(__dirname, '../data/french-cities.json');
  
  try {
    // Créer le dossier data s'il n'existe pas
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Télécharger les données
    const cities = await fetchCitiesFromAPI(apiUrl);
    
    // Sauvegarder dans un fichier simple
    const citiesData = {
      lastUpdate: new Date().toISOString(),
      totalCities: cities.length,
      cities: cities
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(citiesData, null, 2));
    console.log(`✅ ${cities.length} villes sauvegardées dans ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

function fetchCitiesFromAPI(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const cities = JSON.parse(data);
          resolve(cities);
        } catch (error) {
          reject(new Error(`Erreur parsing JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Erreur HTTP: ${error.message}`));
    });
  });
}

// Exécuter si appelé directement
if (require.main === module) {
  downloadFrenchCities();
}

module.exports = { downloadFrenchCities };