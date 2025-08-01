const { Pool } = require('pg');

async function checkNullDates() {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'jobs_database',
    password: '',
    port: 5432,
  });

  try {
    console.log('🔍 Vérification des dates NULL dans la base de données...\n');

    // 1. Compter les dates NULL
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN published_at IS NULL THEN 1 END) as null_published_at,
        COUNT(CASE WHEN posted_date IS NULL THEN 1 END) as null_posted_date,
        COUNT(CASE WHEN created_at IS NULL THEN 1 END) as null_created_at
      FROM jobs
    `);

    const stats = result.rows[0];
    console.log('📊 Statistiques globales:');
    console.log(`   Total des offres: ${stats.total_jobs}`);
    console.log(`   Offres avec published_at NULL: ${stats.null_published_at}`);
    console.log(`   Offres avec posted_date NULL: ${stats.null_posted_date}`);
    console.log(`   Offres avec created_at NULL: ${stats.null_created_at}`);

    // 2. Afficher quelques exemples
    if (stats.null_published_at > 0) {
      console.log('\n❌ Exemples d\'offres avec published_at NULL:');
      const examples = await pool.query(`
        SELECT id, title, company, source, published_at, posted_date, created_at
        FROM jobs
        WHERE published_at IS NULL
        LIMIT 10
      `);

      examples.rows.forEach(job => {
        console.log(`   - ID ${job.id}: "${job.title}" (${job.company}) - Source: ${job.source}`);
      });
    }

    // 3. Vérifier par source
    console.log('\n📊 Répartition par source:');
    const bySource = await pool.query(`
      SELECT 
        source,
        COUNT(*) as total,
        COUNT(CASE WHEN published_at IS NULL THEN 1 END) as null_dates
      FROM jobs
      GROUP BY source
      ORDER BY null_dates DESC
    `);

    bySource.rows.forEach(row => {
      if (row.null_dates > 0) {
        console.log(`   ${row.source}: ${row.null_dates}/${row.total} sans date`);
      }
    });

    await pool.end();

    // 4. Solution
    if (stats.null_published_at > 0) {
      console.log('\n⚠️  IL Y A ENCORE DES DATES NULL!');
      console.log('\n🔧 Exécutez cette commande pour corriger:');
      console.log('   psql -h localhost -U postgres -d jobs_database -c "UPDATE jobs SET published_at = COALESCE(created_at, posted_date, CURRENT_TIMESTAMP) WHERE published_at IS NULL;"');
    } else {
      console.log('\n✅ Aucune date NULL trouvée dans la base!');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await pool.end();
  }
}

checkNullDates();