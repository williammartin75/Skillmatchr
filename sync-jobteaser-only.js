const { Pool } = require('pg');

async function syncJobTeaserOnly() {
  const jobteaserPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'jobteaser_database',
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
  
  try {
    console.log('📦 Migration des jobs JobTeaser...');
    
    // Récupérer tous les jobs de JobTeaser
    const result = await jobteaserPool.query('SELECT * FROM jobteaser_jobs');
    const jobs = result.rows;
    
    console.log(`📊 ${jobs.length} jobs trouvés dans JobTeaser`);
    
    if (jobs.length > 0) {
      let migratedCount = 0;
      let updatedCount = 0;
      let errorCount = 0;
      
      for (const job of jobs) {
        try {
          // Fonction pour convertir la date DD/MM/YYYY en format ISO
          function convertDateToISO(dateStr) {
            if (!dateStr) return null;
            
            // Si c'est déjà au format ISO, le retourner tel quel
            if (dateStr.includes('T') || dateStr.includes('-')) {
              return dateStr;
            }
            
            // Si c'est au format DD/MM/YYYY, le convertir
            if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
              const [day, month, year] = dateStr.split('/');
              return new Date(year, month - 1, day).toISOString();
            }
            
            return null;
          }

          // Préparer les données pour la base unifiée
          const unifiedJob = {
            original_id: job.id.toString(),
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            salary: job.salary,
            contract_type: job.contract_type,
            source: 'jobteaser',
            url: job.source_url,
            source_url: job.source_url,
            posted_date: convertDateToISO(job.published_at),
            published_at: convertDateToISO(job.published_at),
            remote: job.remote || 'Non précisé',
            start_date: job.start_date || 'Non précisée',
            skills: job.tags || [],
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
                salary = $5, contract_type = $6, url = $7, source_url = $8,
                posted_date = $9, published_at = $10, remote = $11, start_date = $12,
                skills = $13, tags = $14, updated_at = CURRENT_TIMESTAMP
              WHERE original_id = $15 AND source = $16
            `;
            
            await unifiedPool.query(updateQuery, [
              unifiedJob.title, unifiedJob.company, unifiedJob.location, unifiedJob.description,
              unifiedJob.salary, unifiedJob.contract_type, unifiedJob.url, unifiedJob.source_url,
              unifiedJob.posted_date, unifiedJob.published_at, unifiedJob.remote, unifiedJob.start_date,
              unifiedJob.skills, unifiedJob.tags, unifiedJob.original_id, unifiedJob.source
            ]);
            
            updatedCount++;
          } else {
            // Insérer un nouveau job
            const insertQuery = `
              INSERT INTO jobs (
                original_id, title, company, location, description, salary, contract_type,
                source, url, source_url, posted_date, published_at, remote, start_date,
                skills, tags, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            `;
            
            await unifiedPool.query(insertQuery, [
              unifiedJob.original_id, unifiedJob.title, unifiedJob.company, unifiedJob.location,
              unifiedJob.description, unifiedJob.salary, unifiedJob.contract_type, unifiedJob.source,
              unifiedJob.url, unifiedJob.source_url, unifiedJob.posted_date, unifiedJob.published_at,
              unifiedJob.remote, unifiedJob.start_date, unifiedJob.skills, unifiedJob.tags,
              unifiedJob.created_at, unifiedJob.updated_at
            ]);
            
            migratedCount++;
          }
        } catch (error) {
          console.error(`❌ Erreur migration job ${job.id} (jobteaser):`, error.message);
          errorCount++;
        }
      }
      
      console.log(`✅ JobTeaser: ${migratedCount} nouveaux jobs, ${updatedCount} mis à jour, ${errorCount} erreurs`);
    }
    
    // Vérification finale
    const totalResult = await unifiedPool.query('SELECT COUNT(*) as total FROM jobs WHERE source = $1', ['jobteaser']);
    const total = totalResult.rows[0].total;
    console.log(`📊 Total des jobs JobTeaser dans la base unifiée: ${total}`);
    
    // Afficher quelques exemples
    const examples = await unifiedPool.query(`
      SELECT title, company, location, remote, published_at
      FROM jobs 
      WHERE source = 'jobteaser'
      ORDER BY published_at DESC 
      LIMIT 5
    `);
    
    console.log('🏙️ Exemples de jobs JobTeaser:');
    examples.rows.forEach(job => {
      console.log(`  - ${job.title} chez ${job.company} (${job.location}) - Télétravail: ${job.remote} - ${job.published_at}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur migration JobTeaser:', error);
  } finally {
    await jobteaserPool.end();
    await unifiedPool.end();
  }
}

// Exécuter la synchronisation
syncJobTeaserOnly().catch(console.error); 