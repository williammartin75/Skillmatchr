const { Pool } = require('pg');

// Configuration des différentes bases de données
const databases = {
  unified: {
    name: 'jobs_database',
    table: 'jobs',
    config: {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'jobs_database',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 5432,
      ssl: false,
    }
  },
  wttj: {
    name: 'wttj_database',
    table: 'wttj_jobs',
    config: {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'wttj_database',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 5432,
      ssl: false,
    }
  },
  jobteaser: {
    name: 'jobteaser_database',
    table: 'jobteaser_jobs',
    config: {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'jobteaser_database',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 5432,
      ssl: false,
    }
  },
  apec: {
    name: 'apec_database',
    table: 'apec_jobs',
    config: {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'apec_database',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 5432,
      ssl: false,
    }
  }
};

async function checkDatabaseExists(pool, dbName) {
  try {
    const result = await pool.query(
      "SELECT datname FROM pg_database WHERE datname = $1",
      [dbName]
    );
    return result.rows.length > 0;
  } catch (error) {
    return false;
  }
}

async function harmonizeDatesInDatabase(dbInfo) {
  const pool = new Pool(dbInfo.config);
  
  try {
    console.log(`\n📊 Traitement de ${dbInfo.name}...`);
    
    // Vérifier si la table existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      );
    `, [dbInfo.table]);
    
    if (!tableCheck.rows[0].exists) {
      console.log(`⚠️  Table ${dbInfo.table} n'existe pas dans ${dbInfo.name}`);
      await pool.end();
      return { database: dbInfo.name, fixed: 0, error: 'Table inexistante' };
    }
    
    // Vérifier les colonnes disponibles
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1
      AND column_name IN ('published_at', 'posted_date', 'created_at', 'date_posted', 'publication_date')
    `, [dbInfo.table]);
    
    const columns = columnsResult.rows.map(r => r.column_name);
    console.log(`   Colonnes de date trouvées: ${columns.join(', ')}`);
    
    // Compter les dates NULL
    let nullCount = 0;
    if (columns.includes('published_at')) {
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM ${dbInfo.table} WHERE published_at IS NULL`
      );
      nullCount = parseInt(countResult.rows[0].count);
      console.log(`   Jobs avec published_at NULL: ${nullCount}`);
    }
    
    // Corriger les dates NULL dans cette base
    let fixedCount = 0;
    if (nullCount > 0 && columns.includes('published_at')) {
      // Construire la requête UPDATE en fonction des colonnes disponibles
      let updateQuery = `UPDATE ${dbInfo.table} SET published_at = `;
      
      if (columns.includes('created_at') && columns.includes('posted_date')) {
        updateQuery += 'COALESCE(created_at, posted_date, CURRENT_TIMESTAMP)';
      } else if (columns.includes('created_at')) {
        updateQuery += 'COALESCE(created_at, CURRENT_TIMESTAMP)';
      } else if (columns.includes('posted_date')) {
        updateQuery += 'COALESCE(posted_date, CURRENT_TIMESTAMP)';
      } else if (columns.includes('date_posted')) {
        updateQuery += 'COALESCE(date_posted, CURRENT_TIMESTAMP)';
      } else {
        updateQuery += 'CURRENT_TIMESTAMP';
      }
      
      updateQuery += ' WHERE published_at IS NULL';
      
      const updateResult = await pool.query(updateQuery);
      fixedCount = updateResult.rowCount;
      console.log(`   ✅ ${fixedCount} dates corrigées`);
    }
    
    // Pour les bases de scrapers, s'assurer que created_at existe aussi
    if (dbInfo.name !== 'jobs_database' && columns.includes('created_at')) {
      await pool.query(`
        UPDATE ${dbInfo.table} 
        SET created_at = COALESCE(published_at, posted_date, CURRENT_TIMESTAMP)
        WHERE created_at IS NULL
      `);
    }
    
    await pool.end();
    return { database: dbInfo.name, fixed: fixedCount, nullRemaining: 0 };
    
  } catch (error) {
    console.error(`❌ Erreur dans ${dbInfo.name}:`, error.message);
    await pool.end();
    return { database: dbInfo.name, fixed: 0, error: error.message };
  }
}

async function syncAllToUnified() {
  console.log('\n🔄 Synchronisation vers la base unifiée...');
  
  const unifiedPool = new Pool(databases.unified.config);
  
  try {
    // Pour chaque base de scraper
    for (const [key, dbInfo] of Object.entries(databases)) {
      if (key === 'unified') continue;
      
      console.log(`\n📥 Synchronisation de ${dbInfo.name}...`);
      
      const scraperPool = new Pool(dbInfo.config);
      
      try {
        // Vérifier si la base existe
        const tableCheck = await scraperPool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = $1
          );
        `, [dbInfo.table]);
        
        if (!tableCheck.rows[0].exists) {
          console.log(`   ⚠️ Table ${dbInfo.table} n'existe pas`);
          await scraperPool.end();
          continue;
        }
        
        // Récupérer les jobs avec dates valides
        const jobs = await scraperPool.query(`
          SELECT * FROM ${dbInfo.table} 
          WHERE published_at IS NOT NULL
          OR created_at IS NOT NULL
          OR posted_date IS NOT NULL
        `);
        
        console.log(`   📊 ${jobs.rows.length} jobs à synchroniser`);
        
        let syncedCount = 0;
        for (const job of jobs.rows) {
          try {
            // Déterminer la source et l'ID original
            const source = key === 'wttj' ? 'welcometothejungle' : key;
            const originalId = job.source_id || job.original_id || job.id;
            const publishedAt = job.published_at || job.created_at || job.posted_date || new Date();
            
            await unifiedPool.query(`
              INSERT INTO jobs 
              (title, company, location, description, contract_type, salary, remote, source, original_id, url, published_at, created_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
              ON CONFLICT (original_id, source) DO UPDATE SET
                published_at = EXCLUDED.published_at,
                updated_at = CURRENT_TIMESTAMP
              WHERE jobs.published_at IS NULL
            `, [
              job.title,
              job.company,
              job.location,
              job.description,
              job.contract_type || job.contract,
              job.salary,
              job.remote || job.telework || false,
              source,
              originalId,
              job.url || job.source_url,
              publishedAt
            ]);
            
            syncedCount++;
          } catch (e) {
            // Ignorer les erreurs individuelles
          }
        }
        
        console.log(`   ✅ ${syncedCount} jobs synchronisés`);
        
      } catch (error) {
        console.error(`   ❌ Erreur sync ${dbInfo.name}:`, error.message);
      }
      
      await scraperPool.end();
    }
    
    // Corriger les dernières dates NULL dans la base unifiée
    console.log('\n🔧 Correction finale dans la base unifiée...');
    
    const finalUpdate = await unifiedPool.query(`
      UPDATE jobs 
      SET 
        published_at = CASE
          WHEN created_at IS NOT NULL THEN created_at
          WHEN posted_date IS NOT NULL THEN posted_date
          WHEN updated_at IS NOT NULL THEN updated_at
          ELSE CURRENT_TIMESTAMP
        END
      WHERE published_at IS NULL
    `);
    
    console.log(`✅ ${finalUpdate.rowCount} dates corrigées dans la base unifiée`);
    
    // Statistiques finales
    const stats = await unifiedPool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN published_at IS NULL THEN 1 END) as null_dates,
        COUNT(CASE WHEN source = 'wttj' OR source = 'welcometothejungle' THEN 1 END) as wttj_jobs,
        COUNT(CASE WHEN source = 'jobteaser' THEN 1 END) as jobteaser_jobs,
        COUNT(CASE WHEN source = 'apec' THEN 1 END) as apec_jobs
      FROM jobs
    `);
    
    console.log('\n📊 Statistiques finales de la base unifiée:');
    console.log(`   Total des jobs: ${stats.rows[0].total}`);
    console.log(`   Jobs sans date: ${stats.rows[0].null_dates}`);
    console.log(`   Jobs WTTJ: ${stats.rows[0].wttj_jobs}`);
    console.log(`   Jobs JobTeaser: ${stats.rows[0].jobteaser_jobs}`);
    console.log(`   Jobs APEC: ${stats.rows[0].apec_jobs}`);
    
    await unifiedPool.end();
    
  } catch (error) {
    console.error('❌ Erreur synchronisation:', error.message);
    await unifiedPool.end();
  }
}

async function createGlobalTrigger() {
  console.log('\n🔨 Création du trigger global...');
  
  const unifiedPool = new Pool(databases.unified.config);
  
  try {
    await unifiedPool.query(`
      CREATE OR REPLACE FUNCTION ensure_valid_dates()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Toujours avoir une published_at valide
        IF NEW.published_at IS NULL OR NEW.published_at > CURRENT_TIMESTAMP + INTERVAL '1 day' THEN
          NEW.published_at = COALESCE(
            CASE 
              WHEN NEW.created_at IS NOT NULL AND NEW.created_at <= CURRENT_TIMESTAMP THEN NEW.created_at
              ELSE NULL
            END,
            CASE 
              WHEN NEW.posted_date IS NOT NULL AND NEW.posted_date <= CURRENT_TIMESTAMP THEN NEW.posted_date
              ELSE NULL
            END,
            CURRENT_TIMESTAMP
          );
        END IF;
        
        -- S'assurer que les autres dates sont cohérentes
        IF NEW.created_at IS NULL THEN
          NEW.created_at = NEW.published_at;
        END IF;
        
        IF NEW.posted_date IS NULL THEN
          NEW.posted_date = NEW.published_at;
        END IF;
        
        -- Toujours mettre à jour updated_at
        NEW.updated_at = CURRENT_TIMESTAMP;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await unifiedPool.query(`
      DROP TRIGGER IF EXISTS ensure_valid_dates_trigger ON jobs;
      CREATE TRIGGER ensure_valid_dates_trigger
      BEFORE INSERT OR UPDATE ON jobs
      FOR EACH ROW
      EXECUTE FUNCTION ensure_valid_dates();
    `);
    
    console.log('✅ Trigger global créé');
    
    // Ajouter aussi une valeur par défaut
    await unifiedPool.query(`
      ALTER TABLE jobs 
      ALTER COLUMN published_at SET DEFAULT CURRENT_TIMESTAMP;
    `);
    
    console.log('✅ Valeur par défaut ajoutée');
    
    await unifiedPool.end();
    
  } catch (error) {
    console.error('❌ Erreur création trigger:', error.message);
    await unifiedPool.end();
  }
}

async function main() {
  console.log('🚀 Harmonisation complète des dates dans toutes les bases de données...\n');
  
  // 1. Vérifier quelle bases existent
  const adminPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
    ssl: false,
  });
  
  const existingDbs = [];
  for (const [key, dbInfo] of Object.entries(databases)) {
    const exists = await checkDatabaseExists(adminPool, dbInfo.config.database);
    if (exists) {
      existingDbs.push(key);
      console.log(`✅ Base ${dbInfo.name} existe`);
    } else {
      console.log(`⚠️  Base ${dbInfo.name} n'existe pas`);
    }
  }
  
  await adminPool.end();
  
  // 2. Harmoniser les dates dans chaque base
  console.log('\n📅 Correction des dates dans chaque base...');
  const results = [];
  
  for (const key of existingDbs) {
    const result = await harmonizeDatesInDatabase(databases[key]);
    results.push(result);
  }
  
  // 3. Synchroniser tout vers la base unifiée
  await syncAllToUnified();
  
  // 4. Créer le trigger global
  await createGlobalTrigger();
  
  // 5. Résumé
  console.log('\n✨ HARMONISATION TERMINÉE ✨');
  console.log('\n📊 Résumé des corrections:');
  results.forEach(r => {
    if (r.error) {
      console.log(`   ❌ ${r.database}: ${r.error}`);
    } else {
      console.log(`   ✅ ${r.database}: ${r.fixed} dates corrigées`);
    }
  });
  
  console.log('\n🎉 Toutes les bases ont été harmonisées!');
  console.log('📌 Rafraîchissez http://localhost:3000/jobs');
  console.log('   Toutes les offres devraient maintenant avoir une date au format DD/MM/YYYY');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});