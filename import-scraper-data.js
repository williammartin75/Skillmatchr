const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de la base de données PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'jobscraper',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: false,
});

async function importScraperData() {
  try {
    console.log('🚀 Import des données des scrapers vers PostgreSQL...\n');

    // Vider la table jobs pour éviter les doublons
    console.log('🧹 Nettoyage de la table jobs...');
    await pool.query('DELETE FROM jobs');
    console.log('✅ Table jobs vidée\n');

    // Chercher les fichiers de données des scrapers
    const scraperDataDir = path.join(__dirname, 'scraper_data');
    const backendDir = path.join(__dirname, 'backend');
    
    let dataFiles = [];
    
    // Chercher dans scraper_data/
    if (fs.existsSync(scraperDataDir)) {
      const files = fs.readdirSync(scraperDataDir).filter(file => file.endsWith('.json'));
      dataFiles = files.map(file => path.join(scraperDataDir, file));
    }
    
    // Chercher dans backend/
    if (fs.existsSync(backendDir)) {
      const backendFiles = fs.readdirSync(backendDir).filter(file => file.endsWith('.json'));
      dataFiles = dataFiles.concat(backendFiles.map(file => path.join(backendDir, file)));
    }

    if (dataFiles.length === 0) {
      console.log('⚠️ Aucun fichier de données de scraper trouvé');
      console.log('📁 Recherché dans:', scraperDataDir, 'et', backendDir);
      return;
    }

    console.log(`📁 ${dataFiles.length} fichiers de données trouvés:`);
    dataFiles.forEach(file => console.log(`   - ${path.basename(file)}`));
    console.log('');

    let totalJobs = 0;
    let importedJobs = 0;

    for (const filePath of dataFiles) {
      try {
        console.log(`📖 Lecture de ${path.basename(filePath)}...`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        
        let jobs = [];
        
        // Différents formats possibles
        if (Array.isArray(data)) {
          jobs = data;
        } else if (data.jobs && Array.isArray(data.jobs)) {
          jobs = data.jobs;
        } else if (data.data && Array.isArray(data.data)) {
          jobs = data.data;
        } else {
          console.log(`⚠️ Format non reconnu dans ${path.basename(filePath)}`);
          continue;
        }

        console.log(`   📊 ${jobs.length} offres trouvées`);

        for (const job of jobs) {
          try {
            // Normaliser les données
            const normalizedJob = {
              title: job.title || job.job_title || job.name || 'Titre non spécifié',
              company: job.company || job.employer || job.entreprise || 'Entreprise non spécifiée',
              location: job.location || job.city || job.ville || job.place || 'Localisation non spécifiée',
              description: job.description || job.desc || job.summary || 'Description non spécifiée',
              salary: job.salary || job.salaire || 'Non spécifié',
              contract_type: job.contract_type || job.type || job.contract || 'Non spécifié',
              source: job.source || path.basename(filePath, '.json'),
              url: job.url || job.link || job.apply_url || '',
              posted_date: job.posted_date || job.date || job.created_at || new Date(),
              remote: job.remote || job.telework || job.telecommute || false,
              skills: Array.isArray(job.skills) ? job.skills.join(',') : (job.skills || '')
            };

            // Insérer dans PostgreSQL
            const query = `
              INSERT INTO jobs (
                title, company, location, description, salary, contract_type, 
                source, url, posted_date, remote, skills
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `;
            
            await pool.query(query, [
              normalizedJob.title,
              normalizedJob.company,
              normalizedJob.location,
              normalizedJob.description,
              normalizedJob.salary,
              normalizedJob.contract_type,
              normalizedJob.source,
              normalizedJob.url,
              normalizedJob.posted_date,
              normalizedJob.remote,
              normalizedJob.skills
            ]);

            importedJobs++;
          } catch (jobError) {
            console.log(`   ⚠️ Erreur lors de l'import d'une offre:`, jobError.message);
          }
        }

        totalJobs += jobs.length;
        console.log(`   ✅ ${jobs.length} offres traitées\n`);

      } catch (fileError) {
        console.log(`❌ Erreur lors de la lecture de ${path.basename(filePath)}:`, fileError.message);
      }
    }

    console.log('📊 Résumé de l\'import:');
    console.log(`   - Fichiers traités: ${dataFiles.length}`);
    console.log(`   - Offres totales: ${totalJobs}`);
    console.log(`   - Offres importées: ${importedJobs}`);
    console.log(`   - Taux de succès: ${((importedJobs / totalJobs) * 100).toFixed(1)}%`);

    // Vérifier le nombre d'offres dans la base
    const result = await pool.query('SELECT COUNT(*) FROM jobs');
    console.log(`   - Offres en base: ${result.rows[0].count}`);

    console.log('\n🎉 Import terminé avec succès !');
    console.log('✅ Les vraies données des scrapers sont maintenant dans PostgreSQL');

  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

// Exécuter l'import
importScraperData(); 