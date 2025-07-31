const { Pool } = require('pg');

// Configuration des bases de données
const apecPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'apec_database',
  password: 'password',
  port: 5432,
  ssl: false,
});

const unifiedPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'jobs_database',
  password: 'password',
  port: 5432,
  ssl: false,
});

async function syncApecToUnified() {
  try {
    console.log('🔄 Début de la synchronisation APEC vers la base unifiée...');
    
    // 1. Créer la table unifiée si elle n'existe pas
    await createUnifiedTableIfNotExists();
    
    // 2. Récupérer tous les jobs APEC
    const apecJobs = await getApecJobs();
    console.log(`📊 ${apecJobs.length} jobs trouvés dans la base APEC`);
    
    // 3. Synchroniser chaque job
    let newJobs = 0;
    let updatedJobs = 0;
    let errors = 0;
    
    for (const job of apecJobs) {
      try {
        const result = await syncJob(job);
        if (result === 'new') newJobs++;
        else if (result === 'updated') updatedJobs++;
      } catch (error) {
        console.error(`❌ Erreur sync job ${job.id}:`, error.message);
        errors++;
      }
    }
    
    console.log(`✅ Synchronisation terminée:`);
    console.log(`   - ${newJobs} nouveaux jobs`);
    console.log(`   - ${updatedJobs} jobs mis à jour`);
    console.log(`   - ${errors} erreurs`);
    
    // 4. Vérification finale
    await verifySync();
    
    return { success: true, newJobs, updatedJobs, errors };
    
  } catch (error) {
    console.error('💥 Erreur lors de la synchronisation:', error);
    return { success: false, error: error.message };
  } finally {
    await apecPool.end();
    await unifiedPool.end();
  }
}

async function createUnifiedTableIfNotExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      original_id VARCHAR(100),
      title VARCHAR(1000) NOT NULL,
      company VARCHAR(500),
      location VARCHAR(500),
      description TEXT,
      salary VARCHAR(200),
      contract_type VARCHAR(200),
      source VARCHAR(50) NOT NULL,
      url TEXT,
      source_url TEXT,
      posted_date TIMESTAMP,
      published_at TIMESTAMP,
          remote VARCHAR(200),
      skills TEXT[],
      tags TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(original_id, source)
    );
  `;
  
  await unifiedPool.query(createTableQuery);
  
  // Créer les index s'ils n'existent pas
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);',
    'CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);',
    'CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON jobs(published_at);',
    'CREATE INDEX IF NOT EXISTS idx_jobs_original_id_source ON jobs(original_id, source);'
  ];
  
  for (const indexQuery of indexes) {
    await unifiedPool.query(indexQuery);
  }
  
  console.log('✅ Table unifiée prête');
}

async function getApecJobs() {
  const result = await apecPool.query('SELECT * FROM apec_jobs ORDER BY published_at DESC');
  return result.rows;
}

// Fonction pour convertir les valeurs de téléwork en boolean
function convertTeleworkToBoolean(teleworkValue) {
  if (!teleworkValue) return false;
  
  const teleworkStr = teleworkValue.toString().toLowerCase();
  
  // Valeurs qui indiquent du télétravail
  if (teleworkStr.includes('télé') || teleworkStr.includes('tele') || 
      teleworkStr.includes('remote') || teleworkStr.includes('à distance') ||
      teleworkStr.includes('hybride') || teleworkStr.includes('mixte')) {
    return true;
  }
  
  // Valeurs qui indiquent du présentiel
  if (teleworkStr.includes('présentiel') || teleworkStr.includes('bureau') ||
      teleworkStr.includes('sur site') || teleworkStr.includes('non précisé')) {
    return false;
  }
  
  return false; // Par défaut, pas de télétravail
}

async function syncJob(apecJob) {
  // Vérifier si le job existe déjà
  const existingJob = await unifiedPool.query(
    'SELECT id, updated_at FROM jobs WHERE original_id = $1 AND source = $2',
    [apecJob.id.toString(), 'apec']
  );
  
  const unifiedJob = {
    original_id: apecJob.id.toString(),
    title: apecJob.title,
    company: apecJob.company,
    location: apecJob.location,
    description: apecJob.description,
    salary: apecJob.salary,
    contract_type: apecJob.contract_type,
    source: 'apec',
    url: apecJob.source_url,
    source_url: apecJob.source_url,
    posted_date: apecJob.posted_date,
    published_at: apecJob.published_at,
    remote: convertTeleworkToBoolean(apecJob.telework),
    skills: apecJob.tags || [],
    tags: apecJob.tags || [],
    created_at: apecJob.created_at,
    updated_at: apecJob.updated_at
  };
  
  if (existingJob.rows.length > 0) {
    // Mettre à jour le job existant
    const updateQuery = `
      UPDATE jobs SET 
        title = $1, company = $2, location = $3, description = $4,
        salary = $5, contract_type = $6, url = $7, source_url = $8,
        posted_date = $9, published_at = $10, remote = $11,
        skills = $12, tags = $13, updated_at = CURRENT_TIMESTAMP
      WHERE original_id = $14 AND source = $15
    `;
    
    await unifiedPool.query(updateQuery, [
      unifiedJob.title, unifiedJob.company, unifiedJob.location, unifiedJob.description,
      unifiedJob.salary, unifiedJob.contract_type, unifiedJob.url, unifiedJob.source_url,
      unifiedJob.posted_date, unifiedJob.published_at, unifiedJob.remote,
      unifiedJob.skills, unifiedJob.tags, unifiedJob.original_id, unifiedJob.source
    ]);
    
    return 'updated';
  } else {
    // Insérer un nouveau job
    const insertQuery = `
      INSERT INTO jobs (
        original_id, title, company, location, description, salary, contract_type,
        source, url, source_url, posted_date, published_at, remote,
        skills, tags, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `;
    
    await unifiedPool.query(insertQuery, [
      unifiedJob.original_id, unifiedJob.title, unifiedJob.company, unifiedJob.location,
      unifiedJob.description, unifiedJob.salary, unifiedJob.contract_type, unifiedJob.source,
      unifiedJob.url, unifiedJob.source_url, unifiedJob.posted_date, unifiedJob.published_at,
      unifiedJob.remote, unifiedJob.skills, unifiedJob.tags,
      unifiedJob.created_at, unifiedJob.updated_at
    ]);
    
    return 'new';
  }
}

async function verifySync() {
  const result = await unifiedPool.query(`
    SELECT source, COUNT(*) as count 
    FROM jobs 
    GROUP BY source 
    ORDER BY count DESC
  `);
  
  console.log('📈 État de la base unifiée:');
  result.rows.forEach(row => {
    console.log(`   - ${row.source}: ${row.count} jobs`);
  });
}

// Fonction exportée pour être utilisée par d'autres scripts
module.exports = { syncApecToUnified };

// Si le script est exécuté directement
if (require.main === module) {
  syncApecToUnified()
    .then(result => {
      if (result.success) {
        console.log('🎉 Synchronisation APEC réussie !');
        process.exit(0);
      } else {
        console.error('💥 Synchronisation APEC échouée:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Erreur inattendue:', error);
      process.exit(1);
    });
} 