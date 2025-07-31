const { Pool } = require('pg');
const axios = require('axios');

// Configuration de la base de données des villes (séparée)
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'cities_database',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: false,
});

async function createCitiesTable() {
  try {
    console.log('🏗️ Création de la table cities dans cities_database...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        code VARCHAR(10),
        codes_postaux TEXT[],
        population INTEGER,
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Table cities créée avec succès');
    
    // Créer un index sur le nom pour optimiser les recherches
    await pool.query('CREATE INDEX IF NOT EXISTS idx_cities_nom ON cities(nom);');
    console.log('✅ Index créé sur la colonne nom');
    
  } catch (error) {
    console.error('❌ Erreur création table:', error);
    throw error;
  }
}

async function fetchCitiesFromAPI() {
  try {
    console.log('🌐 Récupération des communes depuis l\'API gouvernementale...');
    
    // Récupérer toutes les communes de France
    const response = await axios.get('https://geo.api.gouv.fr/communes?fields=nom,code,codesPostaux,population,centre&format=json&geometry=centre');
    
    const cities = response.data;
    console.log(`✅ ${cities.length} communes récupérées depuis l'API`);
    
    return cities;
    
  } catch (error) {
    console.error('❌ Erreur récupération API:', error.message);
    throw error;
  }
}

async function importCitiesToDatabase(cities) {
  try {
    console.log('💾 Import des communes dans cities_database...');
    
    // Vider la table avant l'import
    await pool.query('TRUNCATE TABLE cities RESTART IDENTITY CASCADE;');
    console.log('🗑️ Table cities vidée');
    
    // Préparer les données pour l'insertion
    const citiesToInsert = cities.map(city => ({
      nom: city.nom,
      code: city.code,
      codes_postaux: city.codesPostaux || [],
      population: city.population || 0,
      lat: city.centre?.coordinates?.[1] || null,
      lng: city.centre?.coordinates?.[0] || null
    }));
    
    // Insérer par lots de 500 pour éviter les timeouts
    const batchSize = 500;
    let insertedCount = 0;
    
    for (let i = 0; i < citiesToInsert.length; i += batchSize) {
      const batch = citiesToInsert.slice(i, i + batchSize);
      
      // Utiliser une approche plus simple avec des requêtes individuelles
      for (const city of batch) {
        const query = `
          INSERT INTO cities (nom, code, codes_postaux, population, lat, lng)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        
        const params = [
          city.nom,
          city.code,
          city.codes_postaux,
          city.population,
          city.lat,
          city.lng
        ];
        
        await pool.query(query, params);
      }
      
      insertedCount += batch.length;
      console.log(`📦 Lot ${Math.floor(i / batchSize) + 1}: ${insertedCount}/${citiesToInsert.length} communes importées`);
    }
    
    console.log(`✅ ${insertedCount} communes importées avec succès dans cities_database`);
    
  } catch (error) {
    console.error('❌ Erreur import:', error);
    throw error;
  }
}

async function verifyImport() {
  try {
    console.log('🔍 Vérification de l\'import...');
    
    const result = await pool.query('SELECT COUNT(*) as total FROM cities');
    const total = result.rows[0].total;
    
    console.log(`📊 Total des communes dans cities_database: ${total}`);
    
    // Vérifier quelques exemples
    const examples = await pool.query(`
      SELECT nom, population, lat, lng 
      FROM cities 
      WHERE population > 100000 
      ORDER BY population DESC 
      LIMIT 5
    `);
    
    console.log('🏙️ Exemples de grandes villes:');
    examples.rows.forEach(city => {
      console.log(`  - ${city.nom}: ${city.population} habitants (${city.lat}, ${city.lng})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur vérification:', error);
  }
}

async function main() {
  try {
    console.log('🚀 Début de l\'import des communes dans cities_database...');
    
    // 1. Créer la table
    await createCitiesTable();
    
    // 2. Récupérer les données depuis l'API
    const cities = await fetchCitiesFromAPI();
    
    // 3. Importer dans la base de données
    await importCitiesToDatabase(cities);
    
    // 4. Vérifier l'import
    await verifyImport();
    
    console.log('🎉 Import terminé avec succès dans cities_database !');
    
  } catch (error) {
    console.error('💥 Erreur lors de l\'import:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Exécuter le script
main(); 