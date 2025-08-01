const { Pool } = require('pg');
const http = require('http');

const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'jobs_database',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  ssl: false,
};

async function debugDateIssue() {
  const pool = new Pool(dbConfig);
  
  console.log('🔍 DEBUG: Analyse du problème des dates non spécifiées\n');
  
  try {
    // 1. Vérifier les données dans la base
    console.log('📊 1. Analyse de la base de données:');
    
    const nullDatesQuery = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN published_at IS NULL THEN 1 END) as null_published,
        COUNT(CASE WHEN created_at IS NULL THEN 1 END) as null_created,
        COUNT(CASE WHEN posted_date IS NULL THEN 1 END) as null_posted
      FROM jobs
    `);
    
    const stats = nullDatesQuery.rows[0];
    console.log(`   Total jobs: ${stats.total}`);
    console.log(`   Jobs avec published_at NULL: ${stats.null_published}`);
    console.log(`   Jobs avec created_at NULL: ${stats.null_created}`);
    console.log(`   Jobs avec posted_date NULL: ${stats.null_posted}\n`);
    
    // 2. Afficher des exemples de jobs avec leurs dates
    console.log('📋 2. Exemples de jobs dans la base:');
    const examples = await pool.query(`
      SELECT 
        id,
        source,
        title,
        published_at,
        created_at,
        posted_date,
        updated_at
      FROM jobs
      LIMIT 10
    `);
    
    examples.rows.forEach(job => {
      console.log(`\n   ID ${job.id} - ${job.source}:`);
      console.log(`   Title: ${job.title}`);
      console.log(`   published_at: ${job.published_at || 'NULL'}`);
      console.log(`   created_at: ${job.created_at || 'NULL'}`);
      console.log(`   posted_date: ${job.posted_date || 'NULL'}`);
    });
    
    // 3. Tester l'API directement
    console.log('\n\n📡 3. Test de l\'API /api/jobs:');
    
    const apiUrl = 'http://localhost:3000/api/jobs?limit=5';
    
    await new Promise((resolve, reject) => {
      http.get(apiUrl, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (response.jobs && response.jobs.length > 0) {
              console.log(`   Reçu ${response.jobs.length} jobs de l'API\n`);
              
              response.jobs.forEach((job, index) => {
                console.log(`   Job ${index + 1}:`);
                console.log(`   - Title: ${job.title}`);
                console.log(`   - Company: ${job.company}`);
                console.log(`   - Posted Date: ${job.postedDate}`);
                console.log(`   - Source: ${job.source}\n`);
                
                if (job.postedDate === 'Date non spécifiée') {
                  console.log(`   ⚠️  DATE NON SPÉCIFIÉE DÉTECTÉE!`);
                  console.log(`   ID dans la base: ${job.id}\n`);
                }
              });
            } else {
              console.log('   ❌ Aucun job reçu de l\'API');
            }
            
            resolve();
          } catch (e) {
            console.error('   ❌ Erreur parsing JSON:', e.message);
            reject(e);
          }
        });
      }).on('error', (err) => {
        console.error('   ❌ Erreur appel API:', err.message);
        reject(err);
      });
    }).catch(err => {
      console.log('   ⚠️  L\'API n\'est peut-être pas accessible');
    });
    
    // 4. Vérifier les jobs problématiques spécifiquement
    console.log('\n📍 4. Recherche des jobs problématiques:');
    
    const problemJobs = await pool.query(`
      SELECT 
        id,
        source,
        title,
        company,
        published_at,
        created_at,
        posted_date,
        updated_at
      FROM jobs
      WHERE 
        published_at IS NULL 
        OR created_at IS NULL 
        OR posted_date IS NULL
      LIMIT 20
    `);
    
    if (problemJobs.rows.length > 0) {
      console.log(`   ❌ ${problemJobs.rows.length} jobs avec des dates NULL trouvés!`);
      problemJobs.rows.forEach(job => {
        console.log(`\n   Problème - ID ${job.id}:`);
        console.log(`   - Source: ${job.source}`);
        console.log(`   - Title: ${job.title}`);
        console.log(`   - Company: ${job.company}`);
        console.log(`   - published_at: ${job.published_at || 'NULL ❌'}`);
        console.log(`   - created_at: ${job.created_at || 'NULL ❌'}`);
        console.log(`   - posted_date: ${job.posted_date || 'NULL ❌'}`);
      });
    } else {
      console.log('   ✅ Aucun job avec date NULL trouvé dans la base!');
    }
    
    // 5. Vérifier les colonnes de la table
    console.log('\n🔧 5. Structure de la table jobs:');
    const columns = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'jobs'
      AND column_name IN ('published_at', 'created_at', 'posted_date', 'updated_at')
      ORDER BY ordinal_position
    `);
    
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default || 'none'})`);
    });
    
    // 6. Solutions proposées
    console.log('\n\n💡 SOLUTIONS PROPOSÉES:');
    
    if (stats.null_published > 0) {
      console.log('\n1. ❌ Il y a encore des dates NULL dans la base!');
      console.log('   Exécutez: psql -h localhost -U postgres -d jobs_database < force-all-dates.sql');
    } else {
      console.log('\n1. ✅ Toutes les dates sont remplies dans la base');
      console.log('   Le problème pourrait venir de:');
      console.log('   - Cache du navigateur (Ctrl+F5 pour forcer le rafraîchissement)');
      console.log('   - Cache de l\'API Next.js (redémarrer le serveur)');
      console.log('   - Problème de synchronisation entre les bases');
    }
    
    console.log('\n2. Exécutez ces commandes pour une correction complète:');
    console.log('   psql -h localhost -U postgres -d jobs_database < force-all-dates.sql');
    console.log('   DB_PASSWORD= node harmonize-all-dates.js');
    console.log('   Puis redémarrez votre serveur Next.js');
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await pool.end();
  }
}

debugDateIssue();