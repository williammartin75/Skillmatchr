const { Pool } = require('pg');

/**
 * Script de migration des villes de jobscraper vers apec_database
 */
async function migrateCitiesToApec() {
  console.log('🚀 Début de la migration des villes vers la base APEC...');
  
  // Connexion à la base de données source (jobscraper)
  const sourcePool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'jobscraper'
  });

  // Connexion à la base de données destination (apec_database)
  const destPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: 'apec_database'
  });

  try {
    // 1. Récupérer toutes les villes uniques de la base source
    console.log('📊 Récupération des villes depuis jobscraper...');
    const sourceQuery = `
      SELECT DISTINCT location
      FROM jobs 
      WHERE location IS NOT NULL 
      AND location != '' 
      AND location != 'Localisation non précisée'
      ORDER BY location
    `;
    
    const sourceResult = await sourcePool.query(sourceQuery);
    const cities = sourceResult.rows;
    
    console.log(`✅ ${cities.length} villes trouvées dans jobscraper`);

    // 2. Créer la table cities dans apec_database si elle n'existe pas
    console.log('🏗️ Création de la table cities dans apec_database...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await destPool.query(createTableQuery);
    console.log('✅ Table cities créée/vérifiée');

    // 3. Insérer les villes dans apec_database
    console.log('📥 Insertion des villes dans apec_database...');
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const city of cities) {
      try {
        const insertQuery = `
          INSERT INTO cities (nom) 
          VALUES ($1)
          ON CONFLICT (nom) DO NOTHING
        `;
        
        const result = await destPool.query(insertQuery, [city.location]);
        
        if (result.rowCount > 0) {
          insertedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ Erreur lors de l'insertion de "${city.location}":`, error.message);
      }
    }

    console.log(`✅ Migration terminée !`);
    console.log(`📊 Résultats:`);
    console.log(`   - Villes insérées: ${insertedCount}`);
    console.log(`   - Villes déjà existantes: ${skippedCount}`);
    console.log(`   - Total traité: ${cities.length}`);

    // 4. Vérifier le nombre total de villes dans apec_database
    const countQuery = `SELECT COUNT(*) as total FROM cities`;
    const countResult = await destPool.query(countQuery);
    console.log(`📈 Total des villes dans apec_database: ${countResult.rows[0].total}`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
  } finally {
    await sourcePool.end();
    await destPool.end();
    console.log('🔌 Connexions fermées');
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateCitiesToApec()
    .then(() => {
      console.log('🎉 Migration terminée avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { migrateCitiesToApec };