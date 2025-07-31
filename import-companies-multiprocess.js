const { Pool } = require('pg');
const { spawn } = require('child_process');
const fs = require('fs');
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

// Liste des User-Agents pour rotation
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/120.0'
];

// Mapping des codes NAF vers les secteurs
const nafToSector = {
  '62': 'Informatique & Digital', '63': 'Informatique & Digital',
  '41': 'BTP & Construction', '42': 'BTP & Construction', '43': 'BTP & Construction',
  '64': 'Banque & Assurance', '65': 'Banque & Assurance', '66': 'Banque & Assurance',
  '45': 'Distribution & Commerce', '46': 'Distribution & Commerce', '47': 'Distribution & Commerce',
  '35': 'Énergie & Environnement', '36': 'Énergie & Environnement', '37': 'Énergie & Environnement',
  '38': 'Énergie & Environnement', '39': 'Énergie & Environnement',
  '29': 'Automobile', '30': 'Automobile',
  '25': 'Aéronautique & Défense',
  '21': 'Santé & Pharma', '86': 'Santé & Pharma', '87': 'Santé & Pharma', '88': 'Santé & Pharma',
  '10': 'Agroalimentaire', '11': 'Agroalimentaire', '12': 'Agroalimentaire',
  '20': 'Industrie & Chimie', '22': 'Industrie & Chimie', '23': 'Industrie & Chimie',
  '24': 'Industrie & Chimie', '25': 'Industrie & Chimie',
  '69': 'Services & Conseil', '70': 'Services & Conseil', '71': 'Services & Conseil',
  '72': 'Services & Conseil', '73': 'Services & Conseil', '74': 'Services & Conseil',
  '78': 'Services & Conseil', '79': 'Services & Conseil', '80': 'Services & Conseil',
  '81': 'Services & Conseil', '82': 'Services & Conseil',
  '61': 'Télécommunications',
  '14': 'Luxe & Cosmétiques', '15': 'Luxe & Cosmétiques', '16': 'Luxe & Cosmétiques',
  '17': 'Luxe & Cosmétiques', '18': 'Luxe & Cosmétiques', '31': 'Luxe & Cosmétiques',
  '32': 'Luxe & Cosmétiques', '33': 'Luxe & Cosmétiques',
  '49': 'Transport & Logistique', '50': 'Transport & Logistique', '51': 'Transport & Logistique',
  '52': 'Transport & Logistique', '53': 'Transport & Logistique',
  '68': 'Immobilier',
  '85': 'Éducation & Formation',
  '58': 'Médias & Communication', '59': 'Médias & Communication', '60': 'Médias & Communication'
};

async function getCompaniesFromDatabase() {
  const query = `
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
  
  const result = await pool.query(query);
  return result.rows;
}

function createWorkerScript(workerId, companies) {
  const script = `
const { Pool } = require('pg');
const { HttpsProxyAgent } = require('https-proxy-agent');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'jobs_database',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const nafToSector = ${JSON.stringify(nafToSector)};
const userAgents = ${JSON.stringify(userAgents)};

async function searchCompanySector(companyName, proxy) {
  try {
    // Configuration du proxy
    const proxyAgent = new HttpsProxyAgent(\`http://\${proxy}\`);
    
    // Rotation du User-Agent
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    const response = await fetch(\`https://recherche-entreprises.api.gouv.fr/search?q=\${encodeURIComponent(companyName)}&per_page=1&page=1\`, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'application/json',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
      },
      agent: proxyAgent
    });
    
    if (response.status === 429) {
      console.log(\`  ⚠️  [Worker \${${workerId}}] Rate limit (429) - Pause de 5 secondes\`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return null;
    }
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const entreprise = data.results[0];
      const codeNAF = entreprise.activite_principale;
      
      if (codeNAF) {
        const codeSection = codeNAF.substring(0, 2);
        return nafToSector[codeSection] || 'Autres secteurs';
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

async function processCompanies() {
  const companies = ${JSON.stringify(companies)};
  const proxies = ${JSON.stringify(proxies)};
  
  console.log(\`🚀 [Worker \${${workerId}}] Traitement de \${companies.length} entreprises avec rotation de \${proxies.length} proxies\`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const companyName = company.company.trim();
    
    // Rotation des proxies : change de proxy toutes les 5 requêtes
    const proxyIndex = Math.floor(i / 5) % proxies.length;
    const proxy = proxies[proxyIndex];
    
    console.log(\`🏢 [Worker \${${workerId}}] (\${i + 1}/\${companies.length}) \${companyName} (\${company.job_count} offres) - Proxy: \${proxy}\`);
    
    const sector = await searchCompanySector(companyName, proxy);
    
    if (sector) {
      const insertQuery = \`
        INSERT INTO companies (name, sector, job_count)
        VALUES (\$1, \$2, \$3)
        ON CONFLICT (name) DO UPDATE SET
          sector = EXCLUDED.sector,
          job_count = EXCLUDED.job_count,
          updated_at = CURRENT_TIMESTAMP
      \`;
      
      await pool.query(insertQuery, [companyName, sector, company.job_count]);
      
      console.log(\`  ✅ [Worker \${${workerId}}] Secteur: \${sector}\`);
      successCount++;
    } else {
      console.log(\`  ❌ [Worker \${${workerId}}] Non trouvée\`);
      errorCount++;
    }
    
    // Pause entre les requêtes (1-2 secondes)
    const delay = 1000 + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  console.log(\`📊 [Worker \${${workerId}}] Terminé - Succès: \${successCount}, Erreurs: \${errorCount}\`);
  
  await pool.end();
}

processCompanies().catch(console.error);
`;

  const filename = `worker-${workerId}.js`;
  fs.writeFileSync(filename, script);
  return filename;
}

async function runMultiProcessImport() {
  try {
    console.log('🚀 Récupération des secteurs d\'activité en multi-process...\n');
    
    // Récupérer toutes les entreprises
    const allCompanies = await getCompaniesFromDatabase();
    console.log(`📊 ${allCompanies.length} entreprises à traiter\n`);
    
    // Récupérer les entreprises déjà traitées
    const existingQuery = `SELECT name FROM companies`;
    const existingResult = await pool.query(existingQuery);
    const existingCompanies = new Set(existingResult.rows.map(row => row.name));
    
    // Filtrer les nouvelles entreprises
    const newCompanies = allCompanies.filter(company => {
      const companyName = company.company.trim();
      return !existingCompanies.has(companyName);
    });
    
    console.log(`🆕 ${newCompanies.length} nouvelles entreprises à traiter\n`);
    
    if (newCompanies.length === 0) {
      console.log('✅ Aucune nouvelle entreprise à traiter');
      return;
    }
    
    // Diviser les entreprises entre les workers
    const numWorkers = Math.min(proxies.length, 20); // 20 workers en parallèle
    const companiesPerWorker = Math.ceil(newCompanies.length / numWorkers);
    
    console.log(`⚡ Lancement de ${numWorkers} workers en parallèle\n`);
    
    const workers = [];
    
    for (let i = 0; i < numWorkers; i++) {
      const startIndex = i * companiesPerWorker;
      const endIndex = Math.min(startIndex + companiesPerWorker, newCompanies.length);
      const workerCompanies = newCompanies.slice(startIndex, endIndex);
      
      if (workerCompanies.length > 0) {
        const scriptFile = createWorkerScript(i + 1, workerCompanies);
        
        const worker = spawn('node', [scriptFile], {
          stdio: 'pipe'
        });
        
        worker.stdout.on('data', (data) => {
          console.log(`[Worker ${i + 1}] ${data.toString().trim()}`);
        });
        
        worker.stderr.on('data', (data) => {
          console.error(`[Worker ${i + 1} ERROR] ${data.toString().trim()}`);
        });
        
        worker.on('close', (code) => {
          console.log(`[Worker ${i + 1}] Terminé avec le code ${code}`);
          // Nettoyer le fichier temporaire
          fs.unlinkSync(scriptFile);
        });
        
        workers.push(worker);
        
        // Délai entre le lancement des workers
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Attendre que tous les workers terminent
    await Promise.all(workers.map(worker => {
      return new Promise((resolve) => {
        worker.on('close', resolve);
      });
    }));
    
    console.log('\n🎉 Import multi-process terminé !');
    
    // Statistiques finales
    const finalQuery = `
      SELECT sector, COUNT(*) as count
      FROM companies
      GROUP BY sector
      ORDER BY count DESC
    `;
    
    const finalResult = await pool.query(finalQuery);
    
    console.log('\n📈 Statistiques par secteur :');
    finalResult.rows.forEach(row => {
      console.log(`  ${row.sector}: ${row.count} entreprises`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

runMultiProcessImport(); 