const { Pool } = require('pg');

// Configuration des bases de données
const mainPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'jobscraper',
  port: process.env.DB_PORT || 5432,
  ssl: false,
});

const apecPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'apec_database',
  port: process.env.DB_PORT || 5432,
  ssl: false,
});

const unifiedJobsPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'jobs_database',
  port: process.env.DB_PORT || 5432,
  ssl: false,
});

async function createUnifiedJobsTable() {
  try {
    console.log('🏗️ Création de la table jobs unifiée...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        company VARCHAR(255),
        location VARCHAR(255),
        description TEXT,
        salary VARCHAR(100),
        contract_type VARCHAR(100),
        source VARCHAR(50) NOT NULL,
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
    
    await unifiedJobsPool.query(createTableQuery);
    console.log('✅ Table jobs unifiée créée avec succès');
    
    // Créer des index pour optimiser les recherches
    await unifiedJobsPool.query('CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);');
    await unifiedJobsPool.query('CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);');
    await unifiedJobsPool.query('CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date);');
    await unifiedJobsPool.query('CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON jobs(published_at);');
    console.log('✅ Index créés');
    
  } catch (error) {
    console.error('❌ Erreur création table:', error);
    throw error;
  }
}

async function migrateMainJobs() {
  try {
    console.log('📦 Migration des jobs de la base principale...');
    
    const result = await mainPool.query('SELECT * FROM jobs');
    const jobs = result.rows;
    
    console.log(`📊 ${jobs.length} jobs trouvés dans la base principale`);
    
    if (jobs.length > 0) {
      for (const job of jobs) {
        const insertQuery = `
          INSERT INTO jobs (
            title, company, location, description, salary, contract_type, 
            source, url, posted_date, remote, skills, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `;
        
        const params = [
          job.title,
          job.company,
          job.location,
          job.description,
          job.salary,
          job.contract_type,
          job.source || 'main',
          job.url,
          job.posted_date,
          job.remote,
          job.skills,
          job.created_at,
          job.updated_at
        ];
        
        await unifiedJobsPool.query(insertQuery, params);
      }
      
      console.log(`✅ ${jobs.length} jobs migrés depuis la base principale`);
    }
    
  } catch (error) {
    console.error('❌ Erreur migration jobs principaux:', error);
    throw error;
  }
}

async function migrateApecJobs() {
  try {
    console.log('📦 Migration des jobs APEC...');
    
    const result = await apecPool.query('SELECT * FROM apec_jobs');
    const jobs = result.rows;
    
    console.log(`📊 ${jobs.length} jobs trouvés dans la base APEC`);
    
    if (jobs.length > 0) {
      for (const job of jobs) {
        const insertQuery = `
          INSERT INTO jobs (
            title, company, location, description, salary, contract_type, 
            source, source_url, published_at, telework, tags, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `;
        
        const params = [
          job.title,
          job.company,
          job.location,
          job.description,
          job.salary,
          job.contract_type,
          'apec',
          job.source_url,
          job.published_at,
          job.telework,
          job.tags,
          job.created_at,
          job.updated_at
        ];
        
        await unifiedJobsPool.query(insertQuery, params);
      }
      
      console.log(`✅ ${jobs.length} jobs migrés depuis la base APEC`);
    }
    
  } catch (error) {
    console.error('❌ Erreur migration jobs APEC:', error);
    throw error;
  }
}

async function verifyMigration() {
  try {
    console.log('🔍 Vérification de la migration...');
    
    const result = await unifiedJobsPool.query('SELECT COUNT(*) as total FROM jobs');
    const total = result.rows[0].total;
    
    console.log(`📊 Total des jobs dans la base unifiée: ${total}`);
    
    // Vérifier la répartition par source
    const sourceStats = await unifiedJobsPool.query(`
      SELECT source, COUNT(*) as count 
      FROM jobs 
      GROUP BY source 
      ORDER BY count DESC
    `);
    
    console.log('📈 Répartition par source:');
    sourceStats.rows.forEach(row => {
      console.log(`  - ${row.source}: ${row.count} jobs`);
    });
    
    // Vérifier quelques exemples
    const examples = await unifiedJobsPool.query(`
      SELECT title, company, location, source, posted_date, published_at
      FROM jobs 
      ORDER BY COALESCE(posted_date, published_at) DESC 
      LIMIT 5
    `);
    
    console.log('🏙️ Exemples de jobs:');
    examples.rows.forEach(job => {
      const date = job.posted_date || job.published_at;
      console.log(`  - ${job.title} chez ${job.company} (${job.location}) - ${job.source} - ${date}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur vérification:', error);
  }
}

async function main() {
  try {
    console.log('🚀 Début de la migration vers la base jobs unifiée...');
    
    // 1. Créer la table unifiée
    await createUnifiedJobsTable();
    
    // 2. Migrer les jobs de la base principale
    await migrateMainJobs();
    
    // 3. Migrer les jobs APEC
    await migrateApecJobs();
    
    // 4. Vérifier la migration
    await verifyMigration();
    
    console.log('🎉 Migration terminée avec succès !');
    
  } catch (error) {
    console.error('💥 Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await mainPool.end();
    await apecPool.end();
    await unifiedJobsPool.end();
  }
}

// Exécuter le script
main(); 