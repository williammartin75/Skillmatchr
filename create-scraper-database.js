const { Pool } = require('pg');

// Configuration de connexion PostgreSQL (sans base spécifique pour créer les bases)
const adminPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: false,
});

async function createScraperDatabase(scraperName) {
  try {
    console.log(`🏗️ Création de la base de données pour le scraper: ${scraperName}`);
    
    // Créer la base de données
    const databaseName = `${scraperName}_database`;
    try {
      await adminPool.query(`CREATE DATABASE ${databaseName}`);
      console.log(`✅ Base de données ${databaseName} créée`);
    } catch (error) {
      if (error.code === '42P04') { // Code d'erreur pour "database already exists"
        console.log(`✅ Base de données ${databaseName} existe déjà`);
      } else {
        throw error;
      }
    }
    
    // Se connecter à la nouvelle base pour créer la table
    const scraperPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: databaseName,
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
      ssl: false,
    });
    
    // Créer la table jobs pour ce scraper
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${scraperName}_jobs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        company VARCHAR(255),
        location VARCHAR(255),
        description TEXT,
        salary VARCHAR(100),
        contract_type VARCHAR(100),
        source VARCHAR(50) DEFAULT '${scraperName}',
        url TEXT,
        source_url TEXT,
        posted_date TIMESTAMP,
        published_at TIMESTAMP,
        remote BOOLEAN DEFAULT false,
        telework BOOLEAN DEFAULT false,
        skills TEXT[],
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await scraperPool.query(createTableQuery);
    console.log(`✅ Table ${scraperName}_jobs créée`);
    
    // Créer des index
    await scraperPool.query(`CREATE INDEX IF NOT EXISTS idx_${scraperName}_jobs_location ON ${scraperName}_jobs(location);`);
    await scraperPool.query(`CREATE INDEX IF NOT EXISTS idx_${scraperName}_jobs_published_at ON ${scraperName}_jobs(published_at);`);
    await scraperPool.query(`CREATE INDEX IF NOT EXISTS idx_${scraperName}_jobs_company ON ${scraperName}_jobs(company);`);
    console.log(`✅ Index créés pour ${scraperName}`);
    
    await scraperPool.end();
    
    console.log(`🎉 Base de données ${scraperName} configurée avec succès !`);
    
  } catch (error) {
    console.error(`❌ Erreur création base ${scraperName}:`, error);
    throw error;
  }
}

async function createUnifiedDatabase() {
  try {
    console.log('🏗️ Création de la base de données unifiée...');
    
    // Créer la base de données unifiée
    try {
      await adminPool.query('CREATE DATABASE jobs_database');
      console.log('✅ Base de données jobs_database créée');
    } catch (error) {
      if (error.code === '42P04') { // Code d'erreur pour "database already exists"
        console.log('✅ Base de données jobs_database existe déjà');
      } else {
        throw error;
      }
    }
    
    // Se connecter à la base unifiée pour créer la table
    const unifiedPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'jobs_database',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
      ssl: false,
    });
    
    // Créer la table jobs unifiée
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        original_id VARCHAR(100),
        title VARCHAR(500) NOT NULL,
        company VARCHAR(255),
        location VARCHAR(255),
        description TEXT,
        salary VARCHAR(100),
        contract VARCHAR(100),
        telework VARCHAR(100),
        source VARCHAR(50) NOT NULL,
        source_id VARCHAR(200),
        url TEXT,
        posted_date TIMESTAMP,
        published_at TIMESTAMP,
        skills TEXT[],
        tags JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(original_id, source)
      );
    `;
    
    await unifiedPool.query(createTableQuery);
    console.log('✅ Table jobs unifiée créée');
    
    // Créer des index
    await unifiedPool.query('CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);');
    await unifiedPool.query('CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);');
    await unifiedPool.query('CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date);');
    await unifiedPool.query('CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON jobs(published_at);');
    await unifiedPool.query('CREATE INDEX IF NOT EXISTS idx_jobs_original_id_source ON jobs(original_id, source);');
    console.log('✅ Index créés pour la base unifiée');
    
    await unifiedPool.end();
    
    console.log('🎉 Base de données unifiée configurée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur création base unifiée:', error);
    throw error;
  }
}

async function createCitiesDatabase() {
  try {
    console.log('🏗️ Création de la base de données des villes...');
    
    // Créer la base de données des villes
    try {
      await adminPool.query('CREATE DATABASE cities_database');
      console.log('✅ Base de données cities_database créée');
    } catch (error) {
      if (error.code === '42P04') { // Code d'erreur pour "database already exists"
        console.log('✅ Base de données cities_database existe déjà');
      } else {
        throw error;
      }
    }
    
    // Se connecter à la base des villes pour créer la table
    const citiesPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'cities_database',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
      ssl: false,
    });
    
    // Créer la table cities
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        population INTEGER,
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        codes_postaux TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await citiesPool.query(createTableQuery);
    console.log('✅ Table cities créée');
    
    // Créer des index
    await citiesPool.query('CREATE INDEX IF NOT EXISTS idx_cities_nom ON cities(nom);');
    await citiesPool.query('CREATE INDEX IF NOT EXISTS idx_cities_population ON cities(population);');
    await citiesPool.query('CREATE INDEX IF NOT EXISTS idx_cities_codes_postaux ON cities USING GIN(codes_postaux);');
    console.log('✅ Index créés pour la base des villes');
    
    await citiesPool.end();
    
    console.log('🎉 Base de données des villes configurée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur création base des villes:', error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  try {
    if (args.length === 0) {
      console.log('🚀 Création de toutes les bases de données...');
      
      // Créer toutes les bases
      await createUnifiedDatabase();
      await createCitiesDatabase();
      
      // Créer les bases pour les scrapers existants
      const scrapers = ['apec', 'indeed', 'linkedin'];
      for (const scraper of scrapers) {
        await createScraperDatabase(scraper);
      }
      
      console.log('🎉 Toutes les bases de données ont été créées avec succès !');
      
    } else if (args[0] === 'scraper' && args[1]) {
      // Créer une base pour un nouveau scraper
      await createScraperDatabase(args[1]);
      
    } else if (args[0] === 'unified') {
      // Créer seulement la base unifiée
      await createUnifiedDatabase();
      
    } else if (args[0] === 'cities') {
      // Créer seulement la base des villes
      await createCitiesDatabase();
      
    } else {
      console.log('Usage:');
      console.log('  node create-scraper-database.js                    # Créer toutes les bases');
      console.log('  node create-scraper-database.js scraper <name>     # Créer une base pour un scraper');
      console.log('  node create-scraper-database.js unified            # Créer la base unifiée');
      console.log('  node create-scraper-database.js cities             # Créer la base des villes');
    }
    
  } catch (error) {
    console.error('💥 Erreur lors de la création des bases:', error);
    process.exit(1);
  } finally {
    await adminPool.end();
  }
}

// Exécuter le script
main(); 