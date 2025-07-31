const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('🚀 Migration de toutes les villes françaises vers apec_database...');

// Configuration de la base de données
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: 'apec_database'
});

// Charger les données des villes
function loadCitiesData() {
  const filePath = path.join(__dirname, '../data/all-french-cities.json');
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier non trouvé: ${filePath}`);
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`📂 ${data.cities.length} villes chargées depuis le fichier`);
  
  return data.cities;
}

// Fonction principale de migration
async function migrateAllCities() {
  try {
    // 1. Charger les données
    const cities = loadCitiesData();
    
    // 2. Supprimer la table cities existante et la recréer
    console.log('🗑️ Suppression de la table cities existante...');
    await pool.query('DROP TABLE IF EXISTS cities');
    console.log('✅ Table cities supprimée');

    // 3. Créer la table cities avec la bonne structure
    console.log('🏗️ Création de la table cities dans apec_database...');
    const createTableQuery = `
      CREATE TABLE cities (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255) NOT NULL UNIQUE,
        code VARCHAR(10),
        population INTEGER,
        surface DECIMAL(10, 2),
        codes_postaux JSONB,
        centre JSONB,
        contour JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Table cities créée avec la bonne structure');

    // 4. Insérer toutes les villes une par une
    console.log(`📥 Insertion de ${cities.length} villes françaises...`);
    
    let insertedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      
      try {
        const query = `
          INSERT INTO cities (nom, code, population, surface, codes_postaux, centre)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (nom) DO NOTHING
        `;
        
        const params = [
          city.nom,
          city.code,
          city.population || 0,
          city.surface || 0,
          JSON.stringify(city.codesPostaux || []),
          city.centre ? JSON.stringify(city.centre) : null
        ];
        
        const result = await pool.query(query, params);
        if (result.rowCount > 0) {
          insertedCount++;
        }
        
        // Afficher le progrès tous les 1000 enregistrements
        if ((i + 1) % 1000 === 0) {
          console.log(`   Progression: ${i + 1}/${cities.length} villes traitées (${insertedCount} insérées)`);
        }
        
      } catch (error) {
        errorCount++;
        if (errorCount <= 5) { // Afficher seulement les 5 premières erreurs
          console.error(`❌ Erreur lors de l'insertion de "${city.nom}":`, error.message);
        }
      }
    }

    // 5. Vérifier le nombre total de villes
    const countQuery = `SELECT COUNT(*) as total FROM cities`;
    const countResult = await pool.query(countQuery);
    const totalCities = parseInt(countResult.rows[0].total);

    console.log('\n📊 Résultats:');
    console.log(`   - Villes insérées: ${insertedCount}`);
    console.log(`   - Erreurs: ${errorCount}`);
    console.log(`   - Total traité: ${cities.length}`);
    console.log(`📈 Total des villes dans apec_database: ${totalCities}`);

    // 6. Afficher quelques statistiques
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN population > 1000 THEN 1 END) as pop_1000,
        COUNT(CASE WHEN population > 10000 THEN 1 END) as pop_10000,
        COUNT(CASE WHEN population > 100000 THEN 1 END) as pop_100000
      FROM cities
    `;
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];
    
    console.log('\n📈 Statistiques des villes:');
    console.log(`   - Total: ${stats.total}`);
    console.log(`   - Population > 1 000: ${stats.pop_1000}`);
    console.log(`   - Population > 10 000: ${stats.pop_10000}`);
    console.log(`   - Population > 100 000: ${stats.pop_100000}`);

    console.log('\n🔌 Connexion fermée');
    await pool.end();
    
    console.log('🎉 Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    await pool.end();
    process.exit(1);
  }
}

migrateAllCities();