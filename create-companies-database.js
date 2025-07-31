const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function createCompaniesDatabase() {
  try {
    console.log('🏗️ Création de la table companies...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sector VARCHAR(100) DEFAULT 'Autres secteurs',
        description TEXT DEFAULT '',
        job_count INTEGER DEFAULT 0,
        last_job_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name)
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Table companies créée avec succès');
    
    // Index pour optimiser les recherches
    await pool.query('CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);');
    console.log('✅ Index créés');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  } finally {
    await pool.end();
  }
}

createCompaniesDatabase(); 