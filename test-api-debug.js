#!/usr/bin/env node

/**
 * Script de debug pour tester l'API data.gouv
 * Usage: node test-api-debug.js
 */

const https = require('https');

// Configuration des tests
const testCases = [
  {
    name: "Recherche simple avec 'entreprise'",
    url: "https://recherche-entreprises.api.gouv.fr/search?q=entreprise&per_page=20&page=1"
  },
  {
    name: "Recherche avec nom d'entreprise",
    url: "https://recherche-entreprises.api.gouv.fr/search?q=Total&per_page=20&page=1"
  },
  {
    name: "Recherche avec filtre activité (Information et communication)",
    url: "https://recherche-entreprises.api.gouv.fr/search?q=entreprise&section_activite_principale=J&per_page=20&page=1"
  },
  {
    name: "Recherche avec filtre effectif (10-19 salariés)",
    url: "https://recherche-entreprises.api.gouv.fr/search?q=entreprise&tranche_effectif_salarie=11&per_page=20&page=1"
  },
  {
    name: "Recherche avec filtre CA (1M-5M €)",
    url: "https://recherche-entreprises.api.gouv.fr/search?q=entreprise&chiffre_affaires=4&per_page=20&page=1"
  },
  {
    name: "Recherche avec localisation (Paris)",
    url: "https://recherche-entreprises.api.gouv.fr/search?q=entreprise&commune=Paris&per_page=20&page=1"
  },
  {
    name: "Recherche combinée (activité + effectif)",
    url: "https://recherche-entreprises.api.gouv.fr/search?q=entreprise&section_activite_principale=J&tranche_effectif_salarie=11&per_page=20&page=1"
  },
  {
    name: "Recherche avec paramètres invalides (test d'erreur)",
    url: "https://recherche-entreprises.api.gouv.fr/search?q=entreprise&section_activite_principale=INVALID&per_page=20&page=1"
  }
];

// Fonction pour faire une requête HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          reject(new Error(`Erreur de parsing JSON: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout de la requête'));
    });
  });
}

// Fonction pour tester un cas
async function runTestCase(testCase) {
  console.log(`\n🧪 Test: ${testCase.name}`);
  console.log(`🔗 URL: ${testCase.url}`);
  
  try {
    const startTime = Date.now();
    const result = await makeRequest(testCase.url);
    const duration = Date.now() - startTime;
    
    console.log(`✅ Status: ${result.status}`);
    console.log(`⏱️  Durée: ${duration}ms`);
    console.log(`📊 Total résultats: ${result.data.total_results || 'N/A'}`);
    console.log(`📋 Nombre de résultats: ${result.data.results?.length || 0}`);
    
    if (result.data.results && result.data.results.length > 0) {
      const firstCompany = result.data.results[0];
      console.log(`🏢 Première entreprise: ${firstCompany.nom_raison_sociale || 'N/A'}`);
      console.log(`📍 Ville: ${firstCompany.siege?.commune || 'N/A'}`);
      console.log(`🏭 Activité: ${firstCompany.section_activite_principale || 'N/A'}`);
    }
    
    // Vérifier les headers CORS
    const corsHeader = result.headers['access-control-allow-origin'];
    if (corsHeader) {
      console.log(`🌐 CORS: ${corsHeader}`);
    } else {
      console.log(`⚠️  Pas de header CORS`);
    }
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
  }
}

// Fonction principale
async function runTests() {
  console.log("🚀 Début des tests de l'API data.gouv");
  console.log("=" * 50);
  
  for (const testCase of testCases) {
    await runTestCase(testCase);
    // Pause entre les tests pour éviter la limitation de taux
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("\n🏁 Tests terminés");
}

// Tests supplémentaires pour les paramètres spécifiques
async function testSpecificParameters() {
  console.log("\n🔍 Tests des paramètres spécifiques");
  
  const parameterTests = [
    {
      name: "Test paramètre 'Tous' pour activité",
      url: "https://recherche-entreprises.api.gouv.fr/search?q=entreprise&section_activite_principale=Tous&per_page=20&page=1"
    },
    {
      name: "Test paramètre vide pour activité",
      url: "https://recherche-entreprises.api.gouv.fr/search?q=entreprise&section_activite_principale=&per_page=20&page=1"
    },
    {
      name: "Test sans paramètre activité",
      url: "https://recherche-entreprises.api.gouv.fr/search?q=entreprise&per_page=20&page=1"
    }
  ];
  
  for (const test of parameterTests) {
    await runTestCase(test);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Exécution des tests
if (require.main === module) {
  runTests()
    .then(() => testSpecificParameters())
    .catch(error => {
      console.error("❌ Erreur lors des tests:", error);
      process.exit(1);
    });
}

module.exports = { makeRequest, runTestCase }; 