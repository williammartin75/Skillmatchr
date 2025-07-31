const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function syncApecToUnified() {
  try {
    console.log('🔄 Début de la synchronisation APEC vers la base unifiée...');
    
    // 1. Compter les jobs APEC
    console.log('📊 Comptage des jobs APEC...');
    const countResult = await execAsync('sudo -u postgres psql -d apec_database -t -c "SELECT COUNT(*) FROM apec_jobs;"');
    const apecCount = parseInt(countResult.stdout.trim());
    console.log(`📊 ${apecCount} jobs trouvés dans la base APEC`);
    
    if (apecCount === 0) {
      console.log('⚠️ Aucun job APEC trouvé, synchronisation terminée');
      return { success: true, newJobs: 0, updatedJobs: 0, errors: 0 };
    }
    
    // 2. Vider la table unifiée (pour simplifier)
    console.log('🗑️ Vidage de la table unifiée...');
    await execAsync('sudo -u postgres psql -d jobs_database -c "TRUNCATE TABLE jobs RESTART IDENTITY CASCADE;"');
    
    // 3. Copier tous les jobs APEC vers la base unifiée
    console.log('📦 Copie des jobs APEC...');
    const copyQuery = `
      INSERT INTO jobs (
        original_id, title, company, location, description, salary, contract_type,
        source, url, source_url, posted_date, published_at, remote, telework,
        skills, tags, created_at, updated_at
      )
      SELECT 
        id::VARCHAR(100) as original_id,
        title,
        company,
        location,
        description,
        salary,
        contract_type,
        'apec' as source,
        source_url as url,
        source_url,
        posted_date,
        published_at,
        telework as remote,
        telework,
        tags as skills,
        tags,
        created_at,
        updated_at
      FROM apec_jobs;
    `;
    
    await execAsync(`sudo -u postgres psql -d jobs_database -c "${copyQuery}"`);
    
    // 4. Vérifier la synchronisation
    console.log('🔍 Vérification de la synchronisation...');
    const verifyResult = await execAsync('sudo -u postgres psql -d jobs_database -t -c "SELECT COUNT(*) FROM jobs;"');
    const unifiedCount = parseInt(verifyResult.stdout.trim());
    
    console.log(`✅ Synchronisation terminée:`);
    console.log(`   - ${unifiedCount} jobs synchronisés`);
    console.log(`   - 0 erreurs`);
    
    // 5. Afficher quelques exemples
    console.log('🏙️ Exemples de jobs synchronisés:');
    const examplesResult = await execAsync('sudo -u postgres psql -d jobs_database -c "SELECT title, company, location, source FROM jobs ORDER BY published_at DESC LIMIT 3;"');
    console.log(examplesResult.stdout);
    
    return { success: true, newJobs: unifiedCount, updatedJobs: 0, errors: 0 };
    
  } catch (error) {
    console.error('💥 Erreur lors de la synchronisation:', error.message);
    return { success: false, error: error.message };
  }
}

// Exporter la fonction
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