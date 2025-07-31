const { Pool } = require('pg');

async function createWTTJDatabase() {
  console.log('🔧 Création de la base de données WTTJ...');
  
  // Connexion à PostgreSQL pour créer la base de données
  const adminPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres', // Base de données par défaut
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    ssl: false,
  });

  try {
    // Vérifier si la base de données existe déjà
    const checkDbQuery = `
      SELECT datname FROM pg_database WHERE datname = 'wttj_database'
    `;
    
    const checkResult = await adminPool.query(checkDbQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ La base de données wttj_database existe déjà');
    } else {
      // Créer la base de données
      await adminPool.query('CREATE DATABASE wttj_database');
      console.log('✅ Base de données wttj_database créée avec succès');
    }
    
    await adminPool.end();
    
    // Maintenant se connecter à la nouvelle base de données pour créer les tables
    const wttjPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'wttj_database',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
      ssl: false,
    });

    // Créer les tables avec la structure des jobs (comme JobTeaser)
    await wttjPool.query(`
      CREATE TABLE IF NOT EXISTS wttj_jobs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        company VARCHAR(200) NOT NULL,
        location VARCHAR(200),
        description TEXT,
        contract VARCHAR(100),
        salary VARCHAR(100),
        telework VARCHAR(100),
        source VARCHAR(50) DEFAULT 'wttj',
        source_id VARCHAR(200) UNIQUE,
        url TEXT,
        scraped_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        published_at TIMESTAMP,
        tags JSONB
      )
    `);

    await wttjPool.query(`
      CREATE TABLE IF NOT EXISTS wttj_scraping_stats (
        id SERIAL PRIMARY KEY,
        scraper_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        status VARCHAR(50) DEFAULT 'running',
        first_run TIMESTAMP,
        last_run TIMESTAMP,
        execution_date TIMESTAMP,
        jobs_found INTEGER DEFAULT 0,
        jobs_inserted INTEGER DEFAULT 0
      )
    `);

    console.log('✅ Tables WTTJ créées avec succès (structure jobs)');
    await wttjPool.end();
    
    console.log('🎉 Base de données WTTJ configurée et prête à l\'utilisation!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la base de données WTTJ:', error.message);
    throw error;
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  createWTTJDatabase()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error.message);
      process.exit(1);
    });
}

module.exports = { createWTTJDatabase }; 