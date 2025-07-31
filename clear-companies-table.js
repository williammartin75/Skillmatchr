const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'jobs_database',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function clearCompaniesTable() {
  try {
    console.log('🗑️ Vidage de la table companies...\n');
    
    // Compter les entreprises avant suppression
    const countQuery = `SELECT COUNT(*) as count FROM companies`;
    const countResult = await pool.query(countQuery);
    const beforeCount = countResult.rows[0].count;
    
    console.log(`📊 ${beforeCount} entreprises dans la table avant suppression`);
    
    // Vider la table
    const clearQuery = `DELETE FROM companies`;
    await pool.query(clearQuery);
    
    // Compter après suppression
    const afterCountResult = await pool.query(countQuery);
    const afterCount = afterCountResult.rows[0].count;
    
    console.log(`✅ Table vidée avec succès !`);
    console.log(`📊 ${afterCount} entreprises restantes`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

clearCompaniesTable(); 