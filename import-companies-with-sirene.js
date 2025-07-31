const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'jobs_database',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Liste des proxies
const proxies = [
  '156.248.84.57:3129', '156.242.41.47:3129', '156.228.178.168:3129', '154.213.203.252:3129',
  '156.228.171.206:3129', '156.253.170.42:3129', '156.242.36.102:3129', '156.242.36.122:3129',
  '45.201.10.195:3129', '156.228.94.104:3129', '156.228.92.100:3129', '156.242.41.174:3129',
  '156.228.80.15:3129', '156.228.91.97:3129', '156.228.178.192:3129', '156.253.167.242:3129',
  '156.228.103.216:3129', '156.228.178.173:3129', '156.228.98.255:3129', '154.94.13.196:3129',
  '156.248.82.91:3129', '156.228.78.20:3129', '156.253.176.223:3129', '156.228.107.82:3129',
  '156.228.119.220:3129', '156.228.103.225:3129', '154.213.198.115:3129', '156.248.87.21:3129',
  '156.233.95.67:3129', '154.91.171.165:3129', '156.249.61.219:3129', '156.228.184.153:3129',
  '154.213.193.71:3129', '156.233.74.216:3129', '156.253.171.219:3129', '154.213.161.121:3129',
  '156.249.138.94:3129', '156.233.94.80:3129', '156.228.109.241:3129', '156.242.44.111:3129',
  '156.242.40.181:3129', '156.228.89.76:3129', '154.213.161.100:3129', '156.228.80.223:3129',
  '156.228.189.9:3129', '156.228.85.145:3129', '156.228.87.203:3129', '154.213.166.166:3129',
  '156.242.35.75:3129', '156.228.81.115:3129'
];

// Mapping des codes NAF vers nos 18 secteurs
const nafToSector = {
  // Informatique & Digital
  '62': 'Informatique & Digital', '63': 'Informatique & Digital',
  
  // BTP & Construction
  '41': 'BTP & Construction', '42': 'BTP & Construction', '43': 'BTP & Construction',
  
  // Banque & Assurance
  '64': 'Banque & Assurance', '65': 'Banque & Assurance', '66': 'Banque & Assurance',
  
  // Distribution & Commerce
  '45': 'Distribution & Commerce', '46': 'Distribution & Commerce', '47': 'Distribution & Commerce',
  
  // Énergie & Environnement
  '35': 'Énergie & Environnement', '36': 'Énergie & Environnement', '37': 'Énergie & Environnement',
  '38': 'Énergie & Environnement', '39': 'Énergie & Environnement',
  
  // Automobile
  '29': 'Automobile', '30': 'Automobile',
  
  // Aéronautique & Défense
  '25': 'Aéronautique & Défense', '30': 'Aéronautique & Défense',
  
  // Santé & Pharma
  '21': 'Santé & Pharma', '86': 'Santé & Pharma', '87': 'Santé & Pharma', '88': 'Santé & Pharma',
  
  // Agroalimentaire
  '10': 'Agroalimentaire', '11': 'Agroalimentaire', '12': 'Agroalimentaire',
  
  // Industrie & Chimie
  '20': 'Industrie & Chimie', '22': 'Industrie & Chimie', '23': 'Industrie & Chimie',
  '24': 'Industrie & Chimie', '25': 'Industrie & Chimie',
  
  // Services & Conseil
  '69': 'Services & Conseil', '70': 'Services & Conseil', '71': 'Services & Conseil',
  '72': 'Services & Conseil', '73': 'Services & Conseil', '74': 'Services & Conseil',
  '78': 'Services & Conseil', '79': 'Services & Conseil', '80': 'Services & Conseil',
  '81': 'Services & Conseil', '82': 'Services & Conseil',
  
  // Télécommunications
  '61': 'Télécommunications',
  
  // Luxe & Cosmétiques
  '14': 'Luxe & Cosmétiques', '15': 'Luxe & Cosmétiques', '16': 'Luxe & Cosmétiques',
  '17': 'Luxe & Cosmétiques', '18': 'Luxe & Cosmétiques', '31': 'Luxe & Cosmétiques',
  '32': 'Luxe & Cosmétiques', '33': 'Luxe & Cosmétiques',
  
  // Transport & Logistique
  '49': 'Transport & Logistique', '50': 'Transport & Logistique', '51': 'Transport & Logistique',
  '52': 'Transport & Logistique', '53': 'Transport & Logistique',
  
  // Immobilier
  '68': 'Immobilier',
  
  // Éducation & Formation
  '85': 'Éducation & Formation',
  
  // Médias & Communication
  '58': 'Médias & Communication', '59': 'Médias & Communication', '60': 'Médias & Communication'
};

let proxyIndex = 0;

function getNextProxy() {
  const proxy = proxies[proxyIndex];
  proxyIndex = (proxyIndex + 1) % proxies.length;
  return proxy;
}

function cleanCompanyName(name) {
  return name
    .replace(/\s+/g, ' ') // Remplacer les espaces multiples
    .trim()
    .replace(/^[^a-zA-Z0-9]*/, '') // Enlever les caractères spéciaux au début
    .replace(/[^a-zA-Z0-9\s\-&\.]*$/, '') // Enlever les caractères spéciaux à la fin
    .replace(/^(société|sarl|sa|sas|eurl|ei|auto-entrepreneur)\s+/i, '') // Enlever les formes juridiques
    .trim();
}

async function searchCompanyWithProxy(companyName) {
  const proxy = getNextProxy();
  
  try {
    console.log(`  🔄 Proxy: ${proxy}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(companyName)}&per_page=1`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const entreprise = data.results[0];
      const codeNAF = entreprise.activite_principale; // Structure correcte !
      const sectionNAF = entreprise.section_activite_principale;
      
      // Déterminer le secteur
      let sector = 'Autres secteurs';
      if (codeNAF) {
        const codeSection = codeNAF.substring(0, 2);
        sector = nafToSector[codeSection] || 'Autres secteurs';
      }
      
      return {
        success: true,
        codeNAF,
        sectionNAF,
        sector,
        proxy
      };
    } else {
      return {
        success: false,
        error: 'Aucun résultat trouvé',
        proxy
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      proxy
    };
  }
}

async function importCompaniesWithSirene() {
  try {
    console.log('🚀 Import des entreprises avec validation API Sirene...\n');
    console.log(`📊 ${proxies.length} proxies disponibles\n`);
    
    // 1. Récupérer toutes les entreprises uniques de la base jobs
    const companiesQuery = `
      SELECT 
        company,
        COUNT(*) as job_count
      FROM jobs 
      WHERE company IS NOT NULL 
        AND company != ''
        AND LENGTH(company) > 2
      GROUP BY company
      ORDER BY job_count DESC
    `;
    
    const companiesResult = await pool.query(companiesQuery);
    const allCompanies = companiesResult.rows;
    
    console.log(`📊 ${allCompanies.length} entreprises trouvées dans la base jobs\n`);
    
    // 2. Récupérer les entreprises déjà validées
    const existingQuery = `SELECT name FROM companies`;
    const existingResult = await pool.query(existingQuery);
    const existingCompanies = new Set(existingResult.rows.map(row => row.name));
    
    console.log(`✅ ${existingCompanies.size} entreprises déjà validées\n`);
    
    // 3. Filtrer les nouvelles entreprises
    const newCompanies = allCompanies.filter(company => {
      const cleanName = cleanCompanyName(company.company);
      return !existingCompanies.has(cleanName);
    });
    
    console.log(`🆕 ${newCompanies.length} nouvelles entreprises à traiter\n`);
    
    // 4. Traiter toutes les nouvelles entreprises
    const companiesToProcess = newCompanies; // Traiter toutes les entreprises
    
    console.log(`🎯 Traitement de ${companiesToProcess.length} entreprises...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const company of companiesToProcess) {
      const cleanName = cleanCompanyName(company.company);
      
      console.log(`🏢 ${cleanName} (${company.job_count} offres)`);
      
      const result = await searchCompanyWithProxy(cleanName);
      
      if (result.success) {
        // Insérer dans la base companies
        const insertQuery = `
          INSERT INTO companies (name, sector, code_naf, section_naf, job_count)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (name) DO UPDATE SET
            sector = EXCLUDED.sector,
            code_naf = EXCLUDED.code_naf,
            section_naf = EXCLUDED.section_naf,
            job_count = EXCLUDED.job_count,
            updated_at = CURRENT_TIMESTAMP
        `;
        
        await pool.query(insertQuery, [
          cleanName,
          result.sector,
          result.codeNAF,
          result.sectionNAF,
          company.job_count
        ]);
        
        console.log(`  ✅ Secteur: ${result.sector} (NAF: ${result.codeNAF})`);
        successCount++;
        
      } else {
        console.log(`  ❌ Non trouvée: ${result.error}`);
        errorCount++;
      }
      
      // Pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 5. Statistiques finales
    console.log('\n📈 Statistiques finales :');
    console.log(`  ✅ Entreprises validées: ${successCount}`);
    console.log(`  ❌ Non trouvées: ${errorCount}`);
    console.log(`  📊 Taux de succès: ${(successCount / companiesToProcess.length * 100).toFixed(1)}%`);
    
    // 6. Compter les entreprises par secteur
    const sectorQuery = `
      SELECT sector, COUNT(*) as count
      FROM companies
      GROUP BY sector
      ORDER BY count DESC
    `;
    
    const sectorResult = await pool.query(sectorQuery);
    
    console.log('\n🎯 Répartition par secteur :');
    sectorResult.rows.forEach(row => {
      console.log(`  ${row.sector}: ${row.count} entreprises`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

// Exécuter l'import
importCompaniesWithSirene(); 