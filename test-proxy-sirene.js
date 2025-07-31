const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Liste des proxies
const proxies = [
  '156.248.84.57:3129',
  '156.242.41.47:3129',
  '156.228.178.168:3129',
  '154.213.203.252:3129',
  '156.228.171.206:3129',
  '156.253.170.42:3129',
  '156.242.36.102:3129',
  '156.242.36.122:3129',
  '45.201.10.195:3129',
  '156.228.94.104:3129',
  '156.228.92.100:3129',
  '156.242.41.174:3129',
  '156.228.80.15:3129',
  '156.228.91.97:3129',
  '156.228.178.192:3129',
  '156.253.167.242:3129',
  '156.228.103.216:3129',
  '156.228.178.173:3129',
  '156.228.98.255:3129',
  '154.94.13.196:3129',
  '156.248.82.91:3129',
  '156.228.78.20:3129',
  '156.253.176.223:3129',
  '156.228.107.82:3129',
  '156.228.119.220:3129',
  '156.228.103.225:3129',
  '154.213.198.115:3129',
  '156.248.87.21:3129',
  '156.233.95.67:3129',
  '154.91.171.165:3129',
  '156.249.61.219:3129',
  '156.228.184.153:3129',
  '154.213.193.71:3129',
  '156.233.74.216:3129',
  '156.253.171.219:3129',
  '154.213.161.121:3129',
  '156.249.138.94:3129',
  '156.233.94.80:3129',
  '156.228.109.241:3129',
  '156.242.44.111:3129',
  '156.242.40.181:3129',
  '156.228.89.76:3129',
  '154.213.161.100:3129',
  '156.228.80.223:3129',
  '156.228.189.9:3129',
  '156.228.85.145:3129',
  '156.228.87.203:3129',
  '154.213.166.166:3129',
  '156.242.35.75:3129',
  '156.228.81.115:3129'
];

// Mapping des codes NAF vers nos secteurs
const nafToSector = {
  '62': 'Informatique & Digital',
  '63': 'Informatique & Digital',
  '41': 'BTP & Construction',
  '42': 'BTP & Construction',
  '43': 'BTP & Construction',
  '64': 'Banque & Assurance',
  '65': 'Banque & Assurance',
  '66': 'Banque & Assurance',
  '45': 'Distribution & Commerce',
  '46': 'Distribution & Commerce',
  '47': 'Distribution & Commerce',
  '35': 'Énergie & Environnement',
  '36': 'Énergie & Environnement',
  '37': 'Énergie & Environnement',
  '38': 'Énergie & Environnement',
  '39': 'Énergie & Environnement',
  '29': 'Automobile',
  '30': 'Automobile',
  '21': 'Santé & Pharma',
  '86': 'Santé & Pharma',
  '87': 'Santé & Pharma',
  '88': 'Santé & Pharma',
  '10': 'Agroalimentaire',
  '11': 'Agroalimentaire',
  '12': 'Agroalimentaire',
  '20': 'Industrie & Chimie',
  '22': 'Industrie & Chimie',
  '23': 'Industrie & Chimie',
  '24': 'Industrie & Chimie',
  '25': 'Industrie & Chimie',
  '69': 'Services & Conseil',
  '70': 'Services & Conseil',
  '71': 'Services & Conseil',
  '72': 'Services & Conseil',
  '73': 'Services & Conseil',
  '74': 'Services & Conseil',
  '78': 'Services & Conseil',
  '79': 'Services & Conseil',
  '80': 'Services & Conseil',
  '81': 'Services & Conseil',
  '82': 'Services & Conseil',
  '61': 'Télécommunications',
  '14': 'Luxe & Cosmétiques',
  '15': 'Luxe & Cosmétiques',
  '16': 'Luxe & Cosmétiques',
  '17': 'Luxe & Cosmétiques',
  '18': 'Luxe & Cosmétiques',
  '31': 'Luxe & Cosmétiques',
  '32': 'Luxe & Cosmétiques',
  '33': 'Luxe & Cosmétiques'
};

let proxyIndex = 0;

function getNextProxy() {
  const proxy = proxies[proxyIndex];
  proxyIndex = (proxyIndex + 1) % proxies.length;
  return proxy;
}

async function searchCompanyWithProxy(companyName) {
  const proxy = getNextProxy();
  
  try {
    console.log(`  🔄 Utilisation du proxy: ${proxy}`);
    
    // Configuration avec proxy
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
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
      const codeNAF = entreprise.etablissement?.unite_legale?.activite_principale;
      const sectionNAF = entreprise.etablissement?.unite_legale?.section_activite_principale;
      
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

async function testProxiesWithCompanies() {
  try {
    console.log('🔍 Test de l\'API Recherche-entreprises avec rotation de proxies...\n');
    console.log(`📊 ${proxies.length} proxies disponibles\n`);
    
    // Récupérer les entreprises de notre base
    const query = `
      SELECT 
        company,
        COUNT(*) as job_count
      FROM jobs 
      WHERE company IS NOT NULL 
        AND company != ''
        AND LENGTH(company) > 3
      GROUP BY company
      ORDER BY job_count DESC
      LIMIT 10
    `;
    
    const result = await pool.query(query);
    const companies = result.rows;
    
    console.log(`📊 Test sur ${companies.length} entreprises\n`);
    
    const results = [];
    
    for (const company of companies) {
      console.log(`🏢 ${company.company} (${company.job_count} offres)`);
      
      const result = await searchCompanyWithProxy(company.company);
      results.push({
        company: company.company,
        ...result
      });
      
      if (result.success) {
        console.log(`  ✅ Code NAF: ${result.codeNAF || 'Non trouvé'}`);
        console.log(`  ✅ Secteur: ${result.sector}`);
      } else {
        console.log(`  ❌ Erreur: ${result.error}`);
      }
      
      console.log(''); // Ligne vide pour séparer
      
      // Pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Statistiques
    console.log('📈 Statistiques :');
    const successCount = results.filter(r => r.success).length;
    const successRate = (successCount / results.length * 100).toFixed(1);
    console.log(`  ✅ Succès: ${successCount}/${results.length} (${successRate}%)`);
    
    const sectors = results.filter(r => r.success).map(r => r.sector);
    const sectorCounts = {};
    sectors.forEach(sector => {
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
    });
    
    console.log('  🎯 Secteurs détectés:');
    Object.entries(sectorCounts).forEach(([sector, count]) => {
      console.log(`    ${sector}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

// Exécuter le test
testProxiesWithCompanies(); 