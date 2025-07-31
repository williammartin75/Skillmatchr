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

// Mapping des codes NAF vers nos secteurs
const nafToSector = {
  // Informatique & Digital
  '62': 'Informatique & Digital', // Programmation, conseil et autres activités informatiques
  '63': 'Informatique & Digital', // Services d'information
  
  // BTP & Construction
  '41': 'BTP & Construction', // Construction de bâtiments
  '42': 'BTP & Construction', // Génie civil
  '43': 'BTP & Construction', // Travaux de construction spécialisés
  
  // Banque & Assurance
  '64': 'Banque & Assurance', // Activités des services financiers, hors assurance et caisses de retraite
  '65': 'Banque & Assurance', // Assurance, réassurance, caisses de retraite (sauf sécurité sociale)
  '66': 'Banque & Assurance', // Activités auxiliaires de services financiers et d'assurance
  
  // Distribution & Commerce
  '45': 'Distribution & Commerce', // Commerce et réparation d'automobiles et de motocycles
  '46': 'Distribution & Commerce', // Commerce de gros (commerce interentreprises)
  '47': 'Distribution & Commerce', // Commerce de détail (sauf automobiles et motocycles)
  
  // Énergie & Environnement
  '35': 'Énergie & Environnement', // Production et distribution d'électricité, de gaz, de vapeur et d'air conditionné
  '36': 'Énergie & Environnement', // Captage, traitement et distribution d'eau
  '37': 'Énergie & Environnement', // Collecte et traitement des eaux usées
  '38': 'Énergie & Environnement', // Collecte, traitement et élimination des déchets ; récupération
  '39': 'Énergie & Environnement', // Dépollution et autres services de gestion des déchets
  
  // Automobile
  '29': 'Automobile', // Construction de véhicules automobiles, de remorques et semi-remorques
  '30': 'Automobile', // Construction d'autres matériels de transport
  
  // Santé & Pharma
  '21': 'Santé & Pharma', // Industrie pharmaceutique
  '86': 'Santé & Pharma', // Activités pour la santé humaine
  '87': 'Santé & Pharma', // Hébergement médico-social et social
  '88': 'Santé & Pharma', // Action sociale sans hébergement
  
  // Agroalimentaire
  '10': 'Agroalimentaire', // Industrie alimentaire
  '11': 'Agroalimentaire', // Fabrication de boissons
  '12': 'Agroalimentaire', // Fabrication de produits à base de tabac
  
  // Industrie & Chimie
  '20': 'Industrie & Chimie', // Industrie chimique
  '22': 'Industrie & Chimie', // Fabrication de produits en caoutchouc et en plastique
  '23': 'Industrie & Chimie', // Fabrication d'autres produits minéraux non métalliques
  '24': 'Industrie & Chimie', // Métallurgie
  '25': 'Industrie & Chimie', // Fabrication de produits métalliques, à l'exception des machines et des équipements
  
  // Services & Conseil
  '69': 'Services & Conseil', // Activités juridiques et comptables
  '70': 'Services & Conseil', // Activités des sièges sociaux ; conseil de gestion
  '71': 'Services & Conseil', // Activités d'architecture et d'ingénierie ; activités de contrôle et analyses techniques
  '72': 'Services & Conseil', // Recherche-développement scientifique
  '73': 'Services & Conseil', // Publicité et études de marché
  '74': 'Services & Conseil', // Autres activités spécialisées, scientifiques et techniques
  '78': 'Services & Conseil', // Activités d'emploi
  '79': 'Services & Conseil', // Activités des agences de voyage, voyagistes, services de réservation et activités connexes
  '80': 'Services & Conseil', // Enquêtes et sécurité
  '81': 'Services & Conseil', // Services relatifs aux bâtiments et aménagement paysager
  '82': 'Services & Conseil', // Activités administratives et autres activités de soutien aux entreprises
  
  // Télécommunications
  '61': 'Télécommunications', // Télécommunications
  
  // Aéronautique & Défense
  '30': 'Aéronautique & Défense', // Construction d'autres matériels de transport (inclut aéronautique)
  
  // Luxe & Cosmétiques
  '32': 'Luxe & Cosmétiques', // Fabrication d'instruments et de fournitures à usage médical et dentaire
  '14': 'Luxe & Cosmétiques', // Fabrication d'articles vestimentaires
  '15': 'Luxe & Cosmétiques', // Industrie du cuir et de la chaussure
  '16': 'Luxe & Cosmétiques', // Travail du bois et fabrication d'articles en bois et en liège, sauf meubles ; fabrication d'articles en vannerie et sparterie
  '17': 'Luxe & Cosmétiques', // Fabrication d'articles de papeterie
  '18': 'Luxe & Cosmétiques', // Imprimerie et reproduction d'enregistrements
  '31': 'Luxe & Cosmétiques', // Fabrication de meubles
  '33': 'Luxe & Cosmétiques', // Réparation et installation de machines et d'équipements
};

async function testSireneAPI() {
  try {
    console.log('🔍 Test de l\'API Sirene sur les entreprises de notre base...\n');
    
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
      LIMIT 20
    `;
    
    const result = await pool.query(query);
    const companies = result.rows;
    
    console.log(`📊 Test sur ${companies.length} entreprises\n`);
    
    for (const company of companies) {
      console.log(`🏢 ${company.company} (${company.job_count} offres)`);
      
      try {
        // Appel à l'API Sirene
        const response = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(company.company)}&per_page=1`);
        
        if (!response.ok) {
          console.log(`  ❌ Erreur API: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const entreprise = data.results[0];
          const codeNAF = entreprise.etablissement?.unite_legale?.activite_principale;
          const sectionNAF = entreprise.etablissement?.unite_legale?.section_activite_principale;
          
          console.log(`  📋 Code NAF: ${codeNAF || 'Non trouvé'}`);
          console.log(`  📋 Section: ${sectionNAF || 'Non trouvée'}`);
          
          // Déterminer le secteur
          let sector = 'Autres secteurs';
          if (codeNAF) {
            const codeSection = codeNAF.substring(0, 2);
            sector = nafToSector[codeSection] || 'Autres secteurs';
          }
          
          console.log(`  🎯 Secteur détecté: ${sector}`);
          
        } else {
          console.log(`  ❌ Aucun résultat trouvé`);
        }
        
      } catch (error) {
        console.log(`  ❌ Erreur: ${error.message}`);
      }
      
      console.log(''); // Ligne vide pour séparer
      
      // Pause pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

// Exécuter le test
testSireneAPI(); 