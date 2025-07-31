const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🚀 Téléchargement de toutes les villes françaises...');

// Fonction pour télécharger les données depuis l'API
function downloadCities() {
  return new Promise((resolve, reject) => {
    const url = 'https://geo.api.gouv.fr/communes';
    
    console.log(`📡 Téléchargement depuis: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const cities = JSON.parse(data);
          console.log(`✅ ${cities.length} villes téléchargées`);
          resolve(cities);
        } catch (error) {
          console.error('❌ Erreur lors du parsing JSON:', error.message);
          console.error('Contenu reçu:', data.substring(0, 500));
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.error('❌ Erreur lors du téléchargement:', error.message);
      reject(error);
    });
  });
}

// Fonction pour sauvegarder les données
function saveCities(cities) {
  const outputPath = path.join(__dirname, '../data/all-french-cities.json');
  
  // Créer le dossier data s'il n'existe pas
  const dataDir = path.dirname(outputPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const data = {
    total: cities.length,
    lastUpdated: new Date().toISOString(),
    cities: cities.map(city => ({
      nom: city.nom,
      code: city.code,
      codesPostaux: city.codesPostaux || [],
      population: city.population || 0,
      surface: city.surface || 0,
      centre: city.centre || null,
      contour: city.contour || null
    }))
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`💾 ${cities.length} villes sauvegardées dans: ${outputPath}`);
  
  return data;
}

// Fonction principale
async function main() {
  try {
    console.log('🔄 Début du téléchargement...');
    const cities = await downloadCities();
    const data = saveCities(cities);
    
    console.log('\n📊 Statistiques:');
    console.log(`   - Total des villes: ${data.total}`);
    console.log(`   - Villes avec population > 1000: ${data.cities.filter(c => c.population > 1000).length}`);
    console.log(`   - Villes avec population > 10000: ${data.cities.filter(c => c.population > 10000).length}`);
    console.log(`   - Villes avec population > 100000: ${data.cities.filter(c => c.population > 100000).length}`);
    
    console.log('\n✅ Téléchargement terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();