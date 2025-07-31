const { Pool } = require('pg');

// Configuration de la base de données APEC
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: 'apec_database',
  ssl: false,
});

class ApecDatabaseCleaner {
  constructor() {
    this.pool = pool;
  }

  async analyzeDatabase() {
    console.log('🔍 ANALYSE DE LA BASE DE DONNÉES APEC');
    console.log('=====================================');

    try {
      // 1. Statistiques générales
      await this.showGeneralStats();
      
      // 2. Analyse des doublons
      await this.findDuplicates();
      
      // 3. Analyse des données manquantes
      await this.analyzeMissingData();
      
      // 4. Analyse des sources
      await this.analyzeSources();
      
      // 5. Analyse des localisations
      await this.analyzeLocations();
      
      // 6. Analyse des salaires
      await this.analyzeSalaries();
      
      // 7. Analyse des types de contrat
      await this.analyzeContractTypes();
      
      // 8. Analyse temporelle
      await this.analyzeTemporalData();

    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error.message);
    } finally {
      await this.pool.end();
    }
  }

  async showGeneralStats() {
    console.log('\n📊 STATISTIQUES GÉNÉRALES');
    console.log('---------------------------');
    
    const stats = await this.pool.query(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(DISTINCT company) as unique_companies,
        COUNT(DISTINCT location) as unique_locations,
        COUNT(CASE WHEN salary IS NOT NULL AND salary != '' THEN 1 END) as jobs_with_salary,
        COUNT(CASE WHEN contract_type IS NOT NULL AND contract_type != '' THEN 1 END) as jobs_with_contract_type,
        COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as jobs_with_description,
        MIN(created_at) as first_job_date,
        MAX(created_at) as last_job_date
      FROM apec_jobs
    `);
    
    const row = stats.rows[0];
    console.log(`📈 Total jobs: ${row.total_jobs.toLocaleString()}`);
    console.log(`🏢 Entreprises uniques: ${row.unique_companies.toLocaleString()}`);
    console.log(`📍 Localisations uniques: ${row.unique_locations.toLocaleString()}`);
    console.log(`💰 Jobs avec salaire: ${row.jobs_with_salary.toLocaleString()} (${((row.jobs_with_salary / row.total_jobs) * 100).toFixed(1)}%)`);
    console.log(`📋 Jobs avec type de contrat: ${row.jobs_with_contract_type.toLocaleString()} (${((row.jobs_with_contract_type / row.total_jobs) * 100).toFixed(1)}%)`);
    console.log(`📝 Jobs avec description: ${row.jobs_with_description.toLocaleString()} (${((row.jobs_with_description / row.total_jobs) * 100).toFixed(1)}%)`);
    console.log(`📅 Première job: ${row.first_job_date}`);
    console.log(`📅 Dernière job: ${row.last_job_date}`);
  }

  async findDuplicates() {
    console.log('\n🔄 ANALYSE DES DOUBLONS');
    console.log('----------------------');
    
    // Doublons par titre + entreprise
    const titleCompanyDuplicates = await this.pool.query(`
      SELECT title, company, COUNT(*) as count
      FROM apec_jobs
      GROUP BY title, company
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10
    `);
    
    console.log(`📋 Doublons titre+entreprise: ${titleCompanyDuplicates.rows.length} groupes`);
    if (titleCompanyDuplicates.rows.length > 0) {
      console.log('   Top 5 des doublons:');
      titleCompanyDuplicates.rows.slice(0, 5).forEach(row => {
        console.log(`   - "${row.title.substring(0, 50)}..." chez ${row.company}: ${row.count} fois`);
      });
    }

    // Doublons par URL
    const urlDuplicates = await this.pool.query(`
      SELECT source_url, COUNT(*) as count
      FROM apec_jobs
      WHERE source_url IS NOT NULL AND source_url != ''
      GROUP BY source_url
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 5
    `);
    
    console.log(`🔗 Doublons par URL: ${urlDuplicates.rows.length} URLs`);
  }

  async analyzeMissingData() {
    console.log('\n❓ ANALYSE DES DONNÉES MANQUANTES');
    console.log('--------------------------------');
    
    const missing = await this.pool.query(`
      SELECT 
        COUNT(CASE WHEN title IS NULL OR title = '' THEN 1 END) as missing_title,
        COUNT(CASE WHEN company IS NULL OR company = '' THEN 1 END) as missing_company,
        COUNT(CASE WHEN location IS NULL OR location = '' THEN 1 END) as missing_location,
        COUNT(CASE WHEN salary IS NULL OR salary = '' THEN 1 END) as missing_salary,
        COUNT(CASE WHEN contract_type IS NULL OR contract_type = '' THEN 1 END) as missing_contract_type,
        COUNT(CASE WHEN description IS NULL OR description = '' THEN 1 END) as missing_description
      FROM apec_jobs
    `);
    
    const row = missing.rows[0];
    const total = await this.pool.query('SELECT COUNT(*) as total FROM apec_jobs');
    const totalCount = total.rows[0].total;
    
    console.log(`📋 Titres manquants: ${row.missing_title} (${((row.missing_title / totalCount) * 100).toFixed(1)}%)`);
    console.log(`🏢 Entreprises manquantes: ${row.missing_company} (${((row.missing_company / totalCount) * 100).toFixed(1)}%)`);
    console.log(`📍 Localisations manquantes: ${row.missing_location} (${((row.missing_location / totalCount) * 100).toFixed(1)}%)`);
    console.log(`💰 Salaires manquants: ${row.missing_salary} (${((row.missing_salary / totalCount) * 100).toFixed(1)}%)`);
    console.log(`📋 Types de contrat manquants: ${row.missing_contract_type} (${((row.missing_contract_type / totalCount) * 100).toFixed(1)}%)`);
    console.log(`📝 Descriptions manquantes: ${row.missing_description} (${((row.missing_description / totalCount) * 100).toFixed(1)}%)`);
  }

  async analyzeSources() {
    console.log('\n🌐 ANALYSE DES SOURCES');
    console.log('---------------------');
    
    const sources = await this.pool.query(`
      SELECT source, COUNT(*) as count
      FROM apec_jobs
      GROUP BY source
      ORDER BY count DESC
    `);
    
    console.log('📊 Répartition par source:');
    sources.rows.forEach(row => {
      console.log(`   - ${row.source}: ${row.count.toLocaleString()} jobs`);
    });
  }

  async analyzeLocations() {
    console.log('\n📍 ANALYSE DES LOCALISATIONS');
    console.log('----------------------------');
    
    const locations = await this.pool.query(`
      SELECT location, COUNT(*) as count
      FROM apec_jobs
      WHERE location IS NOT NULL AND location != ''
      GROUP BY location
      ORDER BY count DESC
      LIMIT 15
    `);
    
    console.log('🏙️ Top 15 des localisations:');
    locations.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.location}: ${row.count} jobs`);
    });
  }

  async analyzeSalaries() {
    console.log('\n💰 ANALYSE DES SALAIRES');
    console.log('----------------------');
    
    const salaryPatterns = await this.pool.query(`
      SELECT 
        CASE 
          WHEN salary ILIKE '%€%' THEN 'Avec €'
          WHEN salary ILIKE '%k%' THEN 'Avec k'
          WHEN salary ILIKE '%négociable%' THEN 'Négociable'
          WHEN salary ILIKE '%non précisé%' THEN 'Non précisé'
          WHEN salary IS NULL OR salary = '' THEN 'Vide'
          ELSE 'Autre'
        END as salary_type,
        COUNT(*) as count
      FROM apec_jobs
      GROUP BY salary_type
      ORDER BY count DESC
    `);
    
    console.log('💰 Types de salaires:');
    salaryPatterns.rows.forEach(row => {
      console.log(`   - ${row.salary_type}: ${row.count.toLocaleString()} jobs`);
    });
  }

  async analyzeContractTypes() {
    console.log('\n📋 ANALYSE DES TYPES DE CONTRAT');
    console.log('-------------------------------');
    
    const contractTypes = await this.pool.query(`
      SELECT contract_type, COUNT(*) as count
      FROM apec_jobs
      WHERE contract_type IS NOT NULL AND contract_type != ''
      GROUP BY contract_type
      ORDER BY count DESC
      LIMIT 10
    `);
    
    console.log('📋 Types de contrat:');
    contractTypes.rows.forEach(row => {
      console.log(`   - ${row.contract_type}: ${row.count.toLocaleString()} jobs`);
    });
  }

  async analyzeTemporalData() {
    console.log('\n📅 ANALYSE TEMPORELLE');
    console.log('-------------------');
    
    const dailyStats = await this.pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as jobs_count
      FROM apec_jobs
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 7
    `);
    
    console.log('📊 Jobs par jour (7 derniers jours):');
    dailyStats.rows.forEach(row => {
      console.log(`   - ${row.date}: ${row.jobs_count.toLocaleString()} jobs`);
    });
  }

  async cleanupDuplicates() {
    console.log('\n🧹 NETTOYAGE DES DOUBLONS');
    console.log('------------------------');
    
    // Supprimer les doublons en gardant le plus récent
    const result = await this.pool.query(`
      DELETE FROM apec_jobs 
      WHERE id NOT IN (
        SELECT MAX(id)
        FROM apec_jobs
        GROUP BY title, company, source_url
      )
    `);
    
    console.log(`✅ ${result.rowCount} doublons supprimés`);
  }

  async cleanupEmptyData() {
    console.log('\n🧹 NETTOYAGE DES DONNÉES VIDES');
    console.log('-----------------------------');
    
    // Supprimer les jobs sans titre ou entreprise
    const result = await this.pool.query(`
      DELETE FROM apec_jobs 
      WHERE title IS NULL OR title = '' OR company IS NULL OR company = ''
    `);
    
    console.log(`✅ ${result.rowCount} jobs sans titre/entreprise supprimés`);
  }
}

// Fonction principale
async function main() {
  const cleaner = new ApecDatabaseCleaner();
  
  console.log('🚀 Début de l\'analyse et du nettoyage de la base APEC...\n');
  
  // Analyser d'abord
  await cleaner.analyzeDatabase();
  
  // Demander si on veut nettoyer
  console.log('\n🧹 Voulez-vous nettoyer la base de données ?');
  console.log('   - Supprimer les doublons');
  console.log('   - Supprimer les données vides');
  console.log('   - Pour exécuter le nettoyage, modifiez le script');
  
  // Décommenter les lignes suivantes pour nettoyer :
  // await cleaner.cleanupDuplicates();
  // await cleaner.cleanupEmptyData();
  
  console.log('\n✅ Analyse terminée !');
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ApecDatabaseCleaner; 