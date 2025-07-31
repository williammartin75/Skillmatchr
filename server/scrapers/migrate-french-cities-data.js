const { Pool } = require('pg');

// Données des villes françaises depuis app/data/french-cities-loader.js
const FRENCH_CITIES_DATA = [
  { name: "Paris", population: 2161000, region: "Île-de-France", category: "Métropole", lat: 48.8566, lng: 2.3522, codesPostaux: ["75001", "75002", "75003", "75004", "75005", "75006", "75007", "75008", "75009", "75010", "75011", "75012", "75013", "75014", "75015", "75016", "75017", "75018", "75019", "75020"] },
  { name: "Marseille", population: 861635, region: "Provence-Alpes-Côte d'Azur", category: "Métropole", lat: 43.2965, lng: 5.3698, codesPostaux: ["13001", "13002", "13003", "13004", "13005", "13006", "13007", "13008", "13009", "13010", "13011", "13012", "13013", "13014", "13015", "13016"] },
  { name: "Lyon", population: 513275, region: "Auvergne-Rhône-Alpes", category: "Métropole", lat: 45.7578, lng: 4.8320, codesPostaux: ["69001", "69002", "69003", "69004", "69005", "69006", "69007", "69008", "69009"] },
  { name: "Toulouse", population: 479553, region: "Occitanie", category: "Métropole", lat: 43.6047, lng: 1.4442, codesPostaux: ["31000", "31100", "31200", "31300", "31400", "31500", "31600", "31700", "31800"] },
  { name: "Nice", population: 342522, region: "Provence-Alpes-Côte d'Azur", category: "Métropole", lat: 43.7102, lng: 7.2620, codesPostaux: ["06000", "06100", "06200", "06300"] },
  { name: "Nantes", population: 314138, region: "Pays de la Loire", category: "Métropole", lat: 47.2184, lng: -1.5536, codesPostaux: ["44000", "44100", "44200", "44300", "44400"] },
  { name: "Strasbourg", population: 280966, region: "Grand Est", category: "Métropole", lat: 48.5734, lng: 7.7521, codesPostaux: ["67000", "67100", "67200", "67300"] },
  { name: "Montpellier", population: 285121, region: "Occitanie", category: "Métropole", lat: 43.6108, lng: 3.8767, codesPostaux: ["34000", "34100", "34200", "34300"] },
  { name: "Bordeaux", population: 254436, region: "Nouvelle-Aquitaine", category: "Métropole", lat: 44.8378, lng: -0.5792, codesPostaux: ["33000", "33100", "33200", "33300", "33400", "33500", "33600", "33700", "33800"] },
  { name: "Lille", population: 232440, region: "Hauts-de-France", category: "Métropole", lat: 50.6292, lng: 3.0573, codesPostaux: ["59000", "59100", "59200", "59300", "59400", "59500", "59600", "59700", "59800", "59900"] },
  { name: "Rennes", population: 217728, region: "Bretagne", category: "Métropole", lat: 48.1173, lng: -1.6778, codesPostaux: ["35000", "35100", "35200", "35300", "35400", "35500", "35600", "35700", "35800"] },
  { name: "Reims", population: 180752, region: "Grand Est", category: "Grande ville", lat: 49.2583, lng: 4.0317, codesPostaux: ["51000", "51100", "51200", "51300", "51400", "51500", "51600", "51700", "51800", "51900"] },
  { name: "Saint-Étienne", population: 172565, region: "Auvergne-Rhône-Alpes", category: "Grande ville", lat: 45.4397, lng: 4.3872, codesPostaux: ["42000", "42100", "42200", "42300", "42400", "42500", "42600", "42700", "42800", "42900"] },
  { name: "Toulon", population: 171953, region: "Provence-Alpes-Côte d'Azur", category: "Grande ville", lat: 43.1242, lng: 5.9280, codesPostaux: ["83000", "83100", "83200", "83300", "83400", "83500", "83600", "83700", "83800", "83900"] },
  { name: "Le Havre", population: 166058, region: "Normandie", category: "Grande ville", lat: 49.4944, lng: 0.1079, codesPostaux: ["76000", "76100", "76200", "76300", "76400", "76500", "76600", "76700", "76800", "76900"] },
  { name: "Grenoble", population: 158454, region: "Auvergne-Rhône-Alpes", category: "Grande ville", lat: 45.1885, lng: 5.7245, codesPostaux: ["38000", "38100", "38200", "38300", "38400", "38500", "38600", "38700", "38800", "38900"] },
  { name: "Dijon", population: 156920, region: "Bourgogne-Franche-Comté", category: "Grande ville", lat: 47.3220, lng: 5.0415, codesPostaux: ["21000", "21100", "21200", "21300", "21400", "21500", "21600", "21700", "21800", "21900"] },
  { name: "Angers", population: 154508, region: "Pays de la Loire", category: "Grande ville", lat: 47.4784, lng: -0.5632, codesPostaux: ["49000", "49100", "49200", "49300", "49400", "49500", "49600", "49700", "49800", "49900"] },
  { name: "Villeurbanne", population: 150659, region: "Auvergne-Rhône-Alpes", category: "Grande ville", lat: 45.7640, lng: 4.8357, codesPostaux: ["69100"] },
  { name: "Le Mans", population: 143252, region: "Pays de la Loire", category: "Grande ville", lat: 48.0061, lng: 0.1996, codesPostaux: ["72000", "72100", "72200", "72300", "72400", "72500", "72600", "72700", "72800", "72900"] },
  { name: "Aix-en-Provence", population: 143097, region: "Provence-Alpes-Côte d'Azur", category: "Grande ville", lat: 43.5297, lng: 5.4474, codesPostaux: ["13080", "13090", "13100", "13120", "13121", "13122", "13123", "13124", "13125", "13126", "13127", "13128", "13129"] },
  { name: "Brest", population: 139619, region: "Bretagne", category: "Grande ville", lat: 48.3904, lng: -4.4861, codesPostaux: ["29200", "29217", "29229", "29238", "29280", "29290"] },
  { name: "Nîmes", population: 148561, region: "Occitanie", category: "Grande ville", lat: 43.8367, lng: 4.3601, codesPostaux: ["30000", "30100", "30200", "30300", "30400", "30500", "30600", "30700", "30800", "30900"] },
  { name: "Tours", population: 136463, region: "Centre-Val de Loire", category: "Grande ville", lat: 47.2184, lng: 0.7058, codesPostaux: ["37000", "37100", "37200", "37300", "37400", "37500", "37600", "37700", "37800", "37900"] },
  { name: "Limoges", population: 131479, region: "Nouvelle-Aquitaine", category: "Grande ville", lat: 45.8336, lng: 1.2611, codesPostaux: ["87000", "87100", "87200", "87300", "87400", "87500", "87600", "87700", "87800", "87900"] },
  { name: "Clermont-Ferrand", population: 143886, region: "Auvergne-Rhône-Alpes", category: "Grande ville", lat: 45.7772, lng: 3.0870, codesPostaux: ["63000", "63100", "63200", "63300", "63400", "63500", "63600", "63700", "63800", "63900"] },
  { name: "Villejuif", population: 55000, region: "Île-de-France", category: "Ville moyenne", lat: 48.7939, lng: 2.3597, codesPostaux: ["94800"] },
  { name: "Créteil", population: 92000, region: "Île-de-France", category: "Ville moyenne", lat: 48.7904, lng: 2.4556, codesPostaux: ["94000"] },
  { name: "Nanterre", population: 95000, region: "Île-de-France", category: "Ville moyenne", lat: 48.8924, lng: 2.2153, codesPostaux: ["92000"] },
  { name: "Vitry-sur-Seine", population: 95000, region: "Île-de-France", category: "Ville moyenne", lat: 48.7872, lng: 2.4034, codesPostaux: ["94400"] },
  { name: "Saint-Denis", population: 110000, region: "Île-de-France", category: "Grande ville", lat: 48.9362, lng: 2.3574, codesPostaux: ["93200", "93210", "93270"] },
  { name: "Montreuil", population: 105000, region: "Île-de-France", category: "Grande ville", lat: 48.8638, lng: 2.4485, codesPostaux: ["93100"] },
  { name: "Boulogne-Billancourt", population: 120000, region: "Île-de-France", category: "Grande ville", lat: 48.8333, lng: 2.2500, codesPostaux: ["92100"] },
  { name: "Argenteuil", population: 110000, region: "Île-de-France", category: "Grande ville", lat: 48.9500, lng: 2.2500, codesPostaux: ["95100"] },
  { name: "Saint-Paul", population: 105000, region: "La Réunion", category: "Grande ville", lat: -21.0094, lng: 55.2700, codesPostaux: ["97460"] },
  { name: "Fort-de-France", population: 80000, region: "Martinique", category: "Grande ville", lat: 14.6161, lng: -61.0589, codesPostaux: ["97200"] },
  { name: "Pointe-à-Pitre", population: 16000, region: "Guadeloupe", category: "Ville moyenne", lat: 16.2419, lng: -61.5333, codesPostaux: ["97110"] }
];

/**
 * Script de migration des villes françaises vers apec_database
 */
async function migrateFrenchCitiesData() {
  console.log('🚀 Début de la migration des villes françaises vers apec_database...');
  
  // Connexion à la base de données APEC
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: 'apec_database'
  });

  try {
    // 1. Supprimer la table cities existante et la recréer
    console.log('🗑️ Suppression de la table cities existante...');
    await pool.query('DROP TABLE IF EXISTS cities');
    console.log('✅ Table cities supprimée');

    // 2. Créer la table cities avec la bonne structure
    console.log('🏗️ Création de la table cities dans apec_database...');
    const createTableQuery = `
      CREATE TABLE cities (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255) NOT NULL UNIQUE,
        population INTEGER,
        region VARCHAR(100),
        category VARCHAR(50),
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        codes_postaux JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Table cities créée avec la bonne structure');

    // 3. Insérer toutes les villes françaises
    console.log(`📥 Insertion de ${FRENCH_CITIES_DATA.length} villes françaises...`);
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const city of FRENCH_CITIES_DATA) {
      try {
        const insertQuery = `
          INSERT INTO cities (nom, population, region, category, lat, lng, codes_postaux) 
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (nom) DO NOTHING
        `;
        
        const result = await pool.query(insertQuery, [
          city.name,
          city.population,
          city.region,
          city.category,
          city.lat,
          city.lng,
          JSON.stringify(city.codesPostaux)
        ]);
        
        if (result.rowCount > 0) {
          insertedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ Erreur lors de l'insertion de "${city.name}":`, error.message);
      }
    }

    console.log(`✅ Migration terminée !`);
    console.log(`📊 Résultats:`);
    console.log(`   - Villes insérées: ${insertedCount}`);
    console.log(`   - Villes déjà existantes: ${skippedCount}`);
    console.log(`   - Total traité: ${FRENCH_CITIES_DATA.length}`);

    // 4. Vérifier le nombre total de villes
    const countQuery = `SELECT COUNT(*) as total FROM cities`;
    const countResult = await pool.query(countQuery);
    console.log(`📈 Total des villes dans apec_database: ${countResult.rows[0].total}`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
  } finally {
    await pool.end();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateFrenchCitiesData()
    .then(() => {
      console.log('🎉 Migration terminée avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { migrateFrenchCitiesData };