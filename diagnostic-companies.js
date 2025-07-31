const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'jobs_database',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function diagnosticCompanies() {
  try {
    console.log('🔍 Diagnostic des entreprises dans la base jobs...\n');
    
    // 1. Total d'entreprises uniques
    const totalQuery = `
      SELECT COUNT(DISTINCT company) as total_companies
      FROM jobs 
      WHERE company IS NOT NULL 
        AND company != ''
        AND LENGTH(company) > 2
    `;
    
    const totalResult = await pool.query(totalQuery);
    const totalCompanies = totalResult.rows[0].total_companies;
    
    console.log(`📊 Total d'entreprises uniques: ${totalCompanies}\n`);
    
    // 2. Top 20 entreprises par nombre d'offres
    const topQuery = `
      SELECT 
        company,
        COUNT(*) as job_count
      FROM jobs 
      WHERE company IS NOT NULL 
        AND company != ''
        AND LENGTH(company) > 2
      GROUP BY company
      ORDER BY job_count DESC
      LIMIT 20
    `;
    
    const topResult = await pool.query(topQuery);
    
    console.log('🏆 Top 20 entreprises par nombre d\'offres:');
    topResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.company} (${row.job_count} offres)`);
    });
    
    console.log('\n');
    
    // 3. Test des filtres actuels
    console.log('🧪 Test des filtres actuels de l\'API...\n');
    
    // Exclure les sources de scraping
    const excludedSources = [
      'hellowork', 'cadremploi', 'meteojob', 'helloworkcollaborateur', 
      'clubofficine', 'engagement jeunes', 'entreprise non précisée',
      'handicap-job.com', 'batiactu'
    ];
    
    let filteredQuery = `
      SELECT 
        company,
        COUNT(*) as job_count
      FROM jobs 
      WHERE company IS NOT NULL 
        AND company != ''
        AND LENGTH(company) > 2
    `;
    
    // Ajouter les exclusions
    excludedSources.forEach((source, index) => {
      filteredQuery += ` AND LOWER(company) NOT LIKE LOWER('%${source}%')`;
    });
    
    filteredQuery += `
      GROUP BY company
      ORDER BY job_count DESC
      LIMIT 50
    `;
    
    const filteredResult = await pool.query(filteredQuery);
    
    console.log(`✅ Après filtres de base: ${filteredResult.rows.length} entreprises\n`);
    
    // 4. Afficher quelques exemples
    console.log('📋 Exemples d\'entreprises après filtres:');
    filteredResult.rows.slice(0, 10).forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.company} (${row.job_count} offres)`);
    });
    
    // 5. Compter les entreprises par source
    const sourceQuery = `
      SELECT 
        source,
        COUNT(DISTINCT company) as unique_companies
      FROM jobs 
      WHERE company IS NOT NULL 
        AND company != ''
      GROUP BY source
      ORDER BY unique_companies DESC
    `;
    
    const sourceResult = await pool.query(sourceQuery);
    
    console.log('\n📊 Entreprises uniques par source:');
    sourceResult.rows.forEach(row => {
      console.log(`  ${row.source}: ${row.unique_companies} entreprises`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

diagnosticCompanies(); 