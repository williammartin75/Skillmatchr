const { Pool } = require('pg');

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'jobs_database',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: false,
});

async function extractCompaniesFromJobs() {
  console.log('🏢 Extraction des entreprises depuis la base de données des jobs...');
  
  try {
    // Liste des sources à exclure (sources de scraping, pas de vraies entreprises)
    const excludedSources = [
      'hellowork', 'cadremploi', 'meteojob', 'helloworkcollaborateur', 
      'clubofficine', 'engagement jeunes', 'entreprise non précisée',
      'jobteaser', 'apec', 'pole-emploi', 'indeed', 'linkedin',
      'handicap-job.com', 'batiactu'
    ];
    
    // Mots-clés à exclure dans les noms d'entreprises
    const excludedKeywords = [
      'hellowork', 'cadremploi', 'collaborateur', 'chef de mission', 
      'gestionnaire de paie', 'après une période', 'vous serez',
      'cabinet de recrutement', 'my premium consulting'
    ];
    
    // Récupérer les entreprises distinctes avec leur nombre de jobs
    const query = `
      SELECT 
        company,
        COUNT(*) as job_count,
        MAX(location) as main_location,
        MAX(contract_type) as main_contract_type,
        MAX(source) as main_source,
        MAX(created_at) as last_job_date
      FROM jobs 
      WHERE company IS NOT NULL 
        AND company != ''
        AND LOWER(company) NOT IN (${excludedSources.map(s => `'${s}'`).join(',')})
        AND LENGTH(company) > 2
        AND LENGTH(company) < 100
      GROUP BY company 
      HAVING COUNT(*) >= 1
      ORDER BY job_count DESC, company ASC
      LIMIT 200
    `;
    
    const result = await pool.query(query);
    const companies = result.rows;
    
    console.log(`📊 ${companies.length} entreprises extraites`);
    
    // Filtrer les entreprises avec des noms suspects
    const filteredCompanies = companies.filter(company => {
      const companyName = company.company.toLowerCase();
      
      // Exclure les entreprises avec des mots-clés suspects
      const hasExcludedKeyword = excludedKeywords.some(keyword => 
        companyName.includes(keyword.toLowerCase())
      );
      
      // Exclure les noms trop longs (probablement des descriptions)
      const isTooLong = company.company.length > 50;
      
      // Exclure les noms qui contiennent des phrases typiques de descriptions
      const hasDescriptionPhrases = companyName.includes('après') || 
                                   companyName.includes('vous serez') ||
                                   companyName.includes('pendant') ||
                                   companyName.includes('f/h') ||
                                   companyName.includes('h/f');
      
      return !hasExcludedKeyword && !isTooLong && !hasDescriptionPhrases;
    });
    
    console.log(`🔍 ${filteredCompanies.length} entreprises après filtrage`);
    
    // Formater les entreprises pour la page spontaneous
    const formattedCompanies = filteredCompanies.map((company, index) => ({
      id: index + 1,
      name: company.company,
      jobCount: company.job_count,
      location: company.main_location || 'Non précisée',
      contractType: company.main_contract_type || 'Non précisé',
      source: company.main_source || 'Non précisé',
      lastJobDate: company.last_job_date,
      status: 'Non ajouté',
      // Données par défaut pour la recherche Bing
      siret: 'N/A',
      siren: 'N/A',
      address: 'Adresse non disponible',
      city: company.main_location || 'Ville non disponible',
      postalCode: 'N/A',
      activity: 'Activité non disponible',
      size: 'Taille non disponible',
      revenue: 'Non disponible',
      website: null,
      officialUrl: null,
      financialUrl: null
    }));
    
    // Sauvegarder dans un fichier JSON
    const fs = require('fs');
    const outputPath = './public/data/companies-from-jobs.json';
    
    // Créer le dossier s'il n'existe pas
    const dir = './public/data';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(formattedCompanies, null, 2));
    
    console.log(`✅ ${formattedCompanies.length} entreprises sauvegardées dans ${outputPath}`);
    
    // Afficher les 10 premières entreprises
    console.log('\n🏆 Top 10 des entreprises extraites:');
    formattedCompanies.slice(0, 10).forEach((company, index) => {
      console.log(`${index + 1}. ${company.name} - ${company.jobCount} jobs - ${company.location}`);
    });
    
    return formattedCompanies;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction des entreprises:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Exécuter l'extraction
if (require.main === module) {
  extractCompaniesFromJobs()
    .then(() => {
      console.log('🎉 Extraction terminée avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { extractCompaniesFromJobs }; 