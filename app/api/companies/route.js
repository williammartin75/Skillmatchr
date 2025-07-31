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
    const sectorFilter = searchParams.get('sector') || '';
    const limit = parseInt(searchParams.get('limit')) || 100;
    
    console.log(`🔍 API Companies - Recherche: "${searchQuery}", Secteur: "${sectorFilter}", Limite: ${limit}`);
    
    // Construire la requête SQL
    let query = `
      SELECT 
        id,
        name,
        sector,
        code_naf,
        section_naf,
        job_count,
        created_at,
        updated_at
      FROM companies 
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Ajouter la recherche par nom si spécifiée
    if (searchQuery.trim()) {
      query += ` AND LOWER(name) LIKE LOWER($${paramIndex})`;
      queryParams.push(`%${searchQuery}%`);
      paramIndex++;
    }
    
    // Ajouter le filtre par secteur si spécifié
    if (sectorFilter.trim()) {
      query += ` AND sector = $${paramIndex}`;
      queryParams.push(sectorFilter);
      paramIndex++;
    }
    
    query += `
      ORDER BY job_count DESC, name ASC
      LIMIT $${paramIndex}
    `;
    queryParams.push(limit);
    
    const result = await pool.query(query, queryParams);
    const companies = result.rows;
    
    console.log(`📊 ${companies.length} entreprises trouvées`);
    
    // Formater les entreprises pour la page spontaneous
    const formattedCompanies = companies.map((company, index) => ({
      id: company.id,
      name: company.name,
      sector: company.sector,
      description: "", // Description vide comme demandé
      jobCount: company.job_count,
      codeNAF: company.code_naf,
      sectionNAF: company.section_naf,
      status: 'Non ajouté'
    }));
    
    // Récupérer tous les secteurs disponibles pour les filtres
    const sectorsQuery = `
      SELECT DISTINCT sector, COUNT(*) as count
      FROM companies
      GROUP BY sector
      ORDER BY count DESC
    `;
    
    const sectorsResult = await pool.query(sectorsQuery);
    const availableSectors = sectorsResult.rows.map(row => ({
      name: row.sector,
      count: parseInt(row.count)
    }));
    
    return NextResponse.json({
      companies: formattedCompanies,
      sectors: availableSectors,
      total: formattedCompanies.length,
      searchQuery: searchQuery,
      sectorFilter: sectorFilter,
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