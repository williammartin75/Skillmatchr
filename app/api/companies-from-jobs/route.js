import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'jobs_database',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: false,
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit')) || 50;
    
    console.log(`🔍 Recherche d'entreprises: "${searchQuery}" (limite: ${limit})`);
    
    // Liste des sources à exclure (sources de scraping, pas de vraies entreprises)
    const excludedSources = [
      'hellowork', 'cadremploi', 'meteojob', 'helloworkcollaborateur', 
      'clubofficine', 'engagement jeunes', 'entreprise non précisée',
      'handicap-job.com', 'batiactu'
    ];
    
    // Mots-clés à exclure dans les noms d'entreprises
    const excludedKeywords = [
      'hellowork', 'cadremploi', 'collaborateur', 'chef de mission', 
      'gestionnaire de paie', 'après une période', 'vous serez',
      'cabinet de recrutement', 'my premium consulting'
    ];
    
    // Construire la requête SQL - prendre toutes les entreprises
    let query = `
      SELECT 
        company,
        COUNT(*) as job_count
      FROM jobs 
      WHERE company IS NOT NULL 
        AND company != ''
        AND LENGTH(company) > 2
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Ajouter la recherche par nom si spécifiée
    if (searchQuery.trim()) {
      query += ` AND LOWER(company) LIKE LOWER($${paramIndex})`;
      queryParams.push(`%${searchQuery}%`);
      paramIndex++;
    }
    
    query += `
      GROUP BY company 
      HAVING COUNT(*) >= 1
      ORDER BY job_count DESC, company ASC
      LIMIT $${paramIndex}
    `;
    queryParams.push(limit);
    
    const result = await pool.query(query, queryParams);
    const companies = result.rows;
    
    console.log(`📊 ${companies.length} entreprises trouvées`);
    
    // Nettoyer et filtrer les entreprises
    const filteredCompanies = companies.filter(company => {
      const companyName = company.company;
      
      // Nettoyer le nom de l'entreprise
      let cleanName = companyName
        .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
        .trim();
      
      // Exclure les noms trop courts
      if (cleanName.length < 3) {
        return false;
      }
      
      // Exclure les noms qui commencent par des mots-clés de sources
      const sourceKeywords = ['hellowork', 'meteojob', 'cadremploi', 'apec', 'pole-emploi'];
      const startsWithSource = sourceKeywords.some(keyword => 
        cleanName.toLowerCase().startsWith(keyword.toLowerCase())
      );
      
      if (startsWithSource) {
        return false;
      }
      
      // Exclure les noms génériques ou non pertinents
      const genericNames = [
        'entreprise non précisée',
        'engagement jeunes',
        'entreprise non définie',
        'société non précisée',
        'entreprise anonyme',
        'non précisé',
        'non défini',
        'handicap-job.com',
        'batiactu',
        'emploi collectivités',
        'com'
      ];
      
      const isGenericName = genericNames.some(name => 
        cleanName.toLowerCase().includes(name.toLowerCase())
      );
      
      if (isGenericName) {
        return false;
      }
      
      // Exclure les noms qui contiennent des patterns suspects
      const suspiciousPatterns = [
        /après\s+une\s+période/i,
        /vous\s+serez/i,
        /pendant\s+le/i,
        /f\/h/i,
        /h\/f/i,
        /m\/f/i,
        /f\/m/i,
        /\d+\s*ans\s+d'expérience/i,
        /niveau\s+bac/i,
        /bac\s*\+\s*\d+/i,
        /cdi|cdd|stage|alternance/i,
        /temps\s+plein|temps\s+partiel/i
      ];
      
      const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(cleanName));
      if (hasSuspiciousPattern) {
        return false;
      }
      
      // Exclure les noms qui sont juste des descriptions de poste
      const jobDescriptionKeywords = [
        'développeur', 'ingénieur', 'chef', 'manager', 'directeur', 'responsable',
        'assistant', 'secrétaire', 'comptable', 'commercial', 'vendeur',
        'technicien', 'opérateur', 'agent', 'employé', 'collaborateur'
      ];
      
      // Si le nom contient seulement un mot-clé de description de poste, l'exclure
      const words = cleanName.toLowerCase().split(/\s+/);
      if (words.length === 1 && jobDescriptionKeywords.includes(words[0])) {
        return false;
      }
      
      return true;
    }).map(company => ({
      ...company,
      company: company.company
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^[^a-zA-Z0-9]*/, '') // Enlever les caractères spéciaux au début
        .replace(/[^a-zA-Z0-9\s\-&\.]*$/, '') // Enlever les caractères spéciaux à la fin
    }));
    
    // Fonction pour classifier les entreprises par secteur
    const classifyCompanySector = (companyName) => {
      const name = companyName.toLowerCase();
      
      // Classification par mots-clés
      if (name.includes('vinci') || name.includes('bouygues') || name.includes('construction') || name.includes('bâtiment') || name.includes('eiffage')) {
        return 'BTP & Construction';
      }
      if (name.includes('total') || name.includes('engie') || name.includes('edf') || name.includes('énergie') || name.includes('veolia') || name.includes('cea')) {
        return 'Énergie & Environnement';
      }
      if (name.includes('bnp') || name.includes('société générale') || name.includes('crédit') || name.includes('axa') || name.includes('assurance') || name.includes('deloitte')) {
        return 'Banque & Assurance';
      }
      if (name.includes('orange') || name.includes('sfr') || name.includes('free') || name.includes('télécom') || name.includes('communication')) {
        return 'Télécommunications';
      }
      if (name.includes('renault') || name.includes('psa') || name.includes('peugeot') || name.includes('citroën') || name.includes('valeo') || name.includes('automobile')) {
        return 'Automobile';
      }
      if (name.includes('airbus') || name.includes('aéronautique') || name.includes('aérospatial') || name.includes('aérocontact')) {
        return 'Aéronautique & Défense';
      }
      if (name.includes('lvmh') || name.includes('l\'oréal') || name.includes('luxe') || name.includes('cosmétique') || name.includes('mode')) {
        return 'Luxe & Cosmétiques';
      }
      if (name.includes('carrefour') || name.includes('auchan') || name.includes('leclerc') || name.includes('distribution') || name.includes('commerce') || name.includes('decathlon') || name.includes('groupement les mousquetaires')) {
        return 'Distribution & Commerce';
      }
      if (name.includes('capgemini') || name.includes('atos') || name.includes('informatique') || name.includes('tech') || name.includes('digital') || name.includes('mc2i') || name.includes('wavestone') || name.includes('abylsen') || name.includes('yupeek')) {
        return 'Informatique & Digital';
      }
      if (name.includes('sanofi') || name.includes('pharma') || name.includes('médical') || name.includes('santé')) {
        return 'Santé & Pharma';
      }
      if (name.includes('danone') || name.includes('nestlé') || name.includes('agroalimentaire') || name.includes('alimentaire')) {
        return 'Agroalimentaire';
      }
      if (name.includes('air liquide') || name.includes('chimie') || name.includes('industrie')) {
        return 'Industrie & Chimie';
      }
      if (name.includes('cerfrance') || name.includes('comptable') || name.includes('expert-comptable')) {
        return 'Comptabilité & Audit';
      }
      if (name.includes('clubofficine')) {
        return 'Services & Conseil';
      }
      
      return 'Autres secteurs';
    };

    // Formater les entreprises pour la page spontaneous (format bloc de gauche)
    const formattedCompanies = filteredCompanies.map((company, index) => {
      const sector = classifyCompanySector(company.company);
      
      return {
        id: index + 1,
        name: company.company,
        sector: sector,
        description: "",
        jobCount: company.job_count,
        status: 'Non ajouté'
      };
    });
    
    console.log(`✅ ${formattedCompanies.length} entreprises formatées`);
    
    return NextResponse.json({
      companies: formattedCompanies,
      total: formattedCompanies.length,
      searchQuery: searchQuery,
      lastUpdate: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des entreprises:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des entreprises' },
      { status: 500 }
    );
  }
}