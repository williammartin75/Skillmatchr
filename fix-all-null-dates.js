const { Pool } = require('pg');

// Configuration de la base de données
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'jobs_database',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  ssl: false,
};

async function fixAllNullDates() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🔧 Correction de TOUTES les dates NULL dans la base de données...\n');
    
    // 1. Statistiques avant correction
    const beforeStats = await pool.query(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN published_at IS NULL THEN 1 END) as null_dates,
        COUNT(CASE WHEN source = 'wttj' AND published_at IS NULL THEN 1 END) as wttj_null,
        COUNT(CASE WHEN source = 'welcometothejungle' AND published_at IS NULL THEN 1 END) as welcome_null,
        COUNT(CASE WHEN source = 'jobteaser' AND published_at IS NULL THEN 1 END) as jobteaser_null,
        COUNT(CASE WHEN source = 'apec' AND published_at IS NULL THEN 1 END) as apec_null
      FROM jobs
    `);
    
    console.log('📊 Statistiques AVANT correction:');
    console.log(`   Total des offres: ${beforeStats.rows[0].total_jobs}`);
    console.log(`   Offres sans date: ${beforeStats.rows[0].null_dates}`);
    console.log(`   - WTTJ: ${beforeStats.rows[0].wttj_null}`);
    console.log(`   - Welcome: ${beforeStats.rows[0].welcome_null}`);
    console.log(`   - JobTeaser: ${beforeStats.rows[0].jobteaser_null}`);
    console.log(`   - APEC: ${beforeStats.rows[0].apec_null}\n`);
    
    // 2. Afficher quelques exemples
    const examples = await pool.query(`
      SELECT id, title, company, source, published_at, created_at
      FROM jobs
      WHERE published_at IS NULL
      LIMIT 5
    `);
    
    if (examples.rows.length > 0) {
      console.log('📋 Exemples d\'offres sans date:');
      examples.rows.forEach(job => {
        console.log(`   - [${job.source}] ${job.title} chez ${job.company}`);
        console.log(`     ID: ${job.id}, Created: ${job.created_at || 'NULL'}`);
      });
      console.log('');
    }
    
    // 3. Corriger TOUTES les dates NULL
    console.log('🔄 Correction en cours...\n');
    
    // Stratégie de correction par priorité:
    // 1. Si created_at existe, l'utiliser
    // 2. Si posted_date existe, l'utiliser
    // 3. Sinon, utiliser une date basée sur l'ID (plus l'ID est grand, plus c'est récent)
    
    const updateResult = await pool.query(`
      UPDATE jobs 
      SET 
        published_at = CASE
          -- Si created_at existe, l'utiliser
          WHEN created_at IS NOT NULL THEN created_at
          -- Si posted_date existe, l'utiliser
          WHEN posted_date IS NOT NULL THEN posted_date
          -- Pour les jobs récents (ID élevé), date récente
          WHEN id > (SELECT MAX(id) - 1000 FROM jobs) THEN CURRENT_DATE - INTERVAL '1 day'
          WHEN id > (SELECT MAX(id) - 5000 FROM jobs) THEN CURRENT_DATE - INTERVAL '7 days'
          WHEN id > (SELECT MAX(id) - 10000 FROM jobs) THEN CURRENT_DATE - INTERVAL '14 days'
          -- Pour les autres, date basée sur la position relative
          ELSE CURRENT_DATE - INTERVAL '30 days' * (1 - (id::float / (SELECT MAX(id) FROM jobs)))
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE published_at IS NULL
      RETURNING id, title, source, published_at
    `);
    
    console.log(`✅ ${updateResult.rowCount} offres corrigées\n`);
    
    // 4. Corriger aussi les dates posted_date NULL si nécessaire
    await pool.query(`
      UPDATE jobs 
      SET posted_date = published_at
      WHERE posted_date IS NULL AND published_at IS NOT NULL
    `);
    
    // 5. S'assurer que created_at est aussi rempli
    await pool.query(`
      UPDATE jobs 
      SET created_at = COALESCE(published_at, CURRENT_TIMESTAMP)
      WHERE created_at IS NULL
    `);
    
    // 6. Statistiques après correction
    const afterStats = await pool.query(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN published_at IS NULL THEN 1 END) as null_dates,
        MIN(published_at) as oldest_date,
        MAX(published_at) as newest_date
      FROM jobs
    `);
    
    console.log('📊 Statistiques APRÈS correction:');
    console.log(`   Total des offres: ${afterStats.rows[0].total_jobs}`);
    console.log(`   Offres sans date: ${afterStats.rows[0].null_dates}`);
    console.log(`   Date la plus ancienne: ${new Date(afterStats.rows[0].oldest_date).toLocaleDateString('fr-FR')}`);
    console.log(`   Date la plus récente: ${new Date(afterStats.rows[0].newest_date).toLocaleDateString('fr-FR')}\n`);
    
    // 7. Afficher quelques exemples de jobs corrigés
    if (updateResult.rows.length > 0) {
      console.log('📅 Exemples de dates corrigées:');
      updateResult.rows.slice(0, 10).forEach(job => {
        const date = new Date(job.published_at);
        const formatted = date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        console.log(`   - [${job.source}] ${job.title}: ${formatted}`);
      });
    }
    
    // 8. Créer/Mettre à jour le trigger pour éviter les NULL à l'avenir
    await pool.query(`
      CREATE OR REPLACE FUNCTION ensure_job_dates()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Toujours avoir une published_at
        IF NEW.published_at IS NULL THEN
          NEW.published_at = COALESCE(NEW.created_at, NEW.posted_date, CURRENT_TIMESTAMP);
        END IF;
        
        -- S'assurer que created_at existe
        IF NEW.created_at IS NULL THEN
          NEW.created_at = COALESCE(NEW.published_at, CURRENT_TIMESTAMP);
        END IF;
        
        -- S'assurer que posted_date existe
        IF NEW.posted_date IS NULL THEN
          NEW.posted_date = NEW.published_at;
        END IF;
        
        -- Mettre à jour updated_at
        NEW.updated_at = CURRENT_TIMESTAMP;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await pool.query(`
      DROP TRIGGER IF EXISTS ensure_dates_trigger ON jobs;
      CREATE TRIGGER ensure_dates_trigger
      BEFORE INSERT OR UPDATE ON jobs
      FOR EACH ROW
      EXECUTE FUNCTION ensure_job_dates();
    `);
    
    console.log('\n✅ Trigger de protection créé/mis à jour');
    
    // 9. Ajouter une contrainte NOT NULL sur published_at
    try {
      await pool.query(`
        ALTER TABLE jobs 
        ALTER COLUMN published_at SET NOT NULL;
      `);
      console.log('✅ Contrainte NOT NULL ajoutée sur published_at');
    } catch (e) {
      console.log('ℹ️  Contrainte NOT NULL déjà existante ou impossible à ajouter');
    }
    
    await pool.end();
    console.log('\n🎉 Correction terminée avec succès!');
    console.log('📌 Toutes les offres ont maintenant une date de publication');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await pool.end();
    process.exit(1);
  }
}

// Exécuter la correction
fixAllNullDates();