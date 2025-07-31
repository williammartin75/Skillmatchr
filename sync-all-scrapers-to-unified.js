const { 
  scraperDatabases, 
  unifiedDatabase, 
  getScraperConnection, 
  getUnifiedConnection 
} = require('./database-config');

async function createUnifiedJobsTable() {
  const unifiedPool = getUnifiedConnection();
  
  try {
    console.log('🏗️ Vérification de la table jobs unifiée...');
    
    // Vérifier si la table existe déjà
    const tableExists = await unifiedPool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('🏗️ Création de la table jobs unifiée...');
      
      const createTableQuery = `
        CREATE TABLE jobs (
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
      console.log('✅ Table jobs unifiée créée avec succès');
      
      // Créer des index pour optimiser les recherches
      await unifiedPool.query('CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);');
      await unifiedPool.query('CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);');
      await unifiedPool.query('CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date);');
      await unifiedPool.query('CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON jobs(published_at);');
      await unifiedPool.query('CREATE INDEX IF NOT EXISTS idx_jobs_original_id_source ON jobs(original_id, source);');
      console.log('✅ Index créés');
    } else {
      console.log('✅ Table jobs unifiée existe déjà');
    }
    
  } catch (error) {
    console.error('❌ Erreur création table:', error);
    throw error;
  } finally {
    await unifiedPool.end();
  }
}

async function migrateScraperData(scraperName) {
  const scraperConfig = scraperDatabases[scraperName];
  const scraperPool = getScraperConnection(scraperName);
  const unifiedPool = getUnifiedConnection();
  
  try {
    console.log(`📦 Migration des jobs ${scraperName.toUpperCase()}...`);
    
    // Récupérer tous les jobs du scraper
    const result = await scraperPool.query(`SELECT * FROM ${scraperConfig.table}`);
    const jobs = result.rows;
    
    console.log(`📊 ${jobs.length} jobs trouvés dans ${scraperName}`);
    
    if (jobs.length > 0) {
      let migratedCount = 0;
      let updatedCount = 0;
      let errorCount = 0;
      
      for (const job of jobs) {
        try {
          // Préparer les données pour la base unifiée
          const unifiedJob = {
            original_id: job.id.toString(),
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            salary: job.salary,
            contract: job.contract,
            telework: job.telework,
            source: scraperName,
            source_id: job.source_id,
            url: job.url,
            posted_date: job.posted_date,
            published_at: job.published_at,
            skills: job.skills || [],
            tags: job.tags || [],
            created_at: job.created_at,
            updated_at: job.updated_at
          };
          
          // Vérifier si le job existe déjà
          const existingJob = await unifiedPool.query(
            'SELECT id FROM jobs WHERE original_id = $1 AND source = $2',
            [unifiedJob.original_id, unifiedJob.source]
          );
          
          if (existingJob.rows.length > 0) {
            // Mettre à jour le job existant
            const updateQuery = `
              UPDATE jobs SET 
                title = $1, company = $2, location = $3, description = $4,
                salary = $5, contract = $6, telework = $7, url = $8,
                posted_date = $9, published_at = $10, source_id = $11,
                skills = $12, tags = $13, updated_at = CURRENT_TIMESTAMP
              WHERE original_id = $14 AND source = $15
            `;
            
            await unifiedPool.query(updateQuery, [
              unifiedJob.title, unifiedJob.company, unifiedJob.location, unifiedJob.description,
              unifiedJob.salary, unifiedJob.contract, unifiedJob.telework, unifiedJob.url,
              unifiedJob.posted_date, unifiedJob.published_at, unifiedJob.source_id,
              unifiedJob.skills, unifiedJob.tags, unifiedJob.original_id, unifiedJob.source
            ]);
            
            updatedCount++;
          } else {
            // Insérer un nouveau job
            const insertQuery = `
              INSERT INTO jobs (
                original_id, title, company, location, description, salary, contract,
                telework, source, source_id, url, posted_date, published_at,
                skills, tags, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            `;
            
            await unifiedPool.query(insertQuery, [
              unifiedJob.original_id, unifiedJob.title, unifiedJob.company, unifiedJob.location,
              unifiedJob.description, unifiedJob.salary, unifiedJob.contract, unifiedJob.telework,
              unifiedJob.source, unifiedJob.source_id, unifiedJob.url, unifiedJob.posted_date,
              unifiedJob.published_at, unifiedJob.skills, unifiedJob.tags,
              unifiedJob.created_at, unifiedJob.updated_at
            ]);
            
            migratedCount++;
          }
        } catch (error) {
          console.error(`❌ Erreur migration job ${job.id} (${scraperName}):`, error.message);
          errorCount++;
        }
      }
      
      console.log(`✅ ${scraperName}: ${migratedCount} nouveaux jobs, ${updatedCount} mis à jour, ${errorCount} erreurs`);
    }
    
  } catch (error) {
    console.error(`❌ Erreur migration ${scraperName}:`, error);
  } finally {
    await scraperPool.end();
    await unifiedPool.end();
  }
}

async function verifyMigration() {
  const unifiedPool = getUnifiedConnection();
  
  try {
    console.log('🔍 Vérification de la migration...');
    
    const result = await unifiedPool.query('SELECT COUNT(*) as total FROM jobs');
    const total = result.rows[0].total;
    
    console.log(`📊 Total des jobs dans la base unifiée: ${total}`);
    
    // Vérifier la répartition par source
    const sourceStats = await unifiedPool.query(`
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
    const examples = await unifiedPool.query(`
      SELECT title, company, location, source, published_at
      FROM jobs 
      ORDER BY published_at DESC 
      LIMIT 5
    `);
    
    console.log('🏙️ Exemples de jobs:');
    examples.rows.forEach(job => {
      console.log(`  - ${job.title} chez ${job.company} (${job.location}) - ${job.source} - ${job.published_at}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur vérification:', error);
  } finally {
    await unifiedPool.end();
  }
}

async function main() {
  try {
    console.log('🚀 Début de la synchronisation de tous les scrapers vers la base unifiée...');
    
    // 1. Créer la table unifiée
    await createUnifiedJobsTable();
    
    // 2. Migrer chaque scraper
    for (const scraperName of Object.keys(scraperDatabases)) {
      await migrateScraperData(scraperName);
    }
    
    // 3. Vérifier la migration
    await verifyMigration();
    
    console.log('🎉 Synchronisation terminée avec succès !');
    
  } catch (error) {
    console.error('💥 Erreur lors de la synchronisation:', error);
    process.exit(1);
  }
}

// Exécuter le script
main(); 