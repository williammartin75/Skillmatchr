const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'jobs_database',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function createCompaniesTable() {
  try {
    console.log('🏗️ Création de la table companies...\n');
    
    // Créer la table companies
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        sector VARCHAR(100) NOT NULL,
        code_naf VARCHAR(10),
        section_naf VARCHAR(10),
        job_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Table companies créée\n');
    
    // Créer un index pour les performances
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
      CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
    `;
    
    await pool.query(createIndexQuery);
    console.log('✅ Index créés\n');
    
    console.log('🎯 Mapping des 18 secteurs configuré :');
    console.log('  1. Informatique & Digital');
    console.log('  2. BTP & Construction');
    console.log('  3. Banque & Assurance');
    console.log('  4. Distribution & Commerce');
    console.log('  5. Énergie & Environnement');
    console.log('  6. Automobile');
    console.log('  7. Aéronautique & Défense');
    console.log('  8. Santé & Pharma');
    console.log('  9. Agroalimentaire');
    console.log('  10. Industrie & Chimie');
    console.log('  11. Services & Conseil');
    console.log('  12. Télécommunications');
    console.log('  13. Luxe & Cosmétiques');
    console.log('  14. Transport & Logistique');
    console.log('  15. Immobilier');
    console.log('  16. Éducation & Formation');
    console.log('  17. Médias & Communication');
    console.log('  18. Autres secteurs\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

createCompaniesTable(); 