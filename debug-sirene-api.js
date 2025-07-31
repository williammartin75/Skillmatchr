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

// Test avec quelques entreprises connues
const testCompanies = [
  'VINCI Energies',
  'Capgemini',
  'Orange',
  'BNP Paribas',
  'Total Energies'
];

async function debugSireneAPI() {
  try {
    console.log('🔍 Debug de l\'API Sirene...\n');
    
    for (const companyName of testCompanies) {
      console.log(`🏢 Test: ${companyName}`);
      
      try {
        const response = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(companyName)}&per_page=1`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (!response.ok) {
          console.log(`  ❌ HTTP ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        
        console.log(`  📊 Résultats: ${data.results?.length || 0}`);
        
        if (data.results && data.results.length > 0) {
          const entreprise = data.results[0];
          
          console.log(`  🏢 Nom: ${entreprise.nom_raison_sociale || 'Non trouvé'}`);
          console.log(`  📍 SIREN: ${entreprise.siren || 'Non trouvé'}`);
          
          // Debug de la structure complète
          console.log(`  🔍 Structure complète:`);
          console.log(`    - etablissement: ${!!entreprise.etablissement}`);
          console.log(`    - unite_legale: ${!!entreprise.etablissement?.unite_legale}`);
          
          if (entreprise.etablissement?.unite_legale) {
            const uniteLegale = entreprise.etablissement.unite_legale;
            console.log(`    - activite_principale: ${uniteLegale.activite_principale || 'Non trouvé'}`);
            console.log(`    - section_activite_principale: ${uniteLegale.section_activite_principale || 'Non trouvé'}`);
            console.log(`    - nature_juridique: ${uniteLegale.nature_juridique || 'Non trouvé'}`);
          }
          
          // Essayer d'autres chemins possibles
          console.log(`  🔍 Autres chemins possibles:`);
          console.log(`    - activite_principale (direct): ${entreprise.activite_principale || 'Non trouvé'}`);
          console.log(`    - code_naf: ${entreprise.code_naf || 'Non trouvé'}`);
          console.log(`    - naf: ${entreprise.naf || 'Non trouvé'}`);
          
        } else {
          console.log(`  ❌ Aucun résultat trouvé`);
        }
        
      } catch (error) {
        console.log(`  ❌ Erreur: ${error.message}`);
      }
      
      console.log(''); // Ligne vide
      
      // Pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

debugSireneAPI(); 