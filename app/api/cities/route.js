import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuration de la base de données des villes (séparée)
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'cities_database',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  ssl: false,
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit')) || 50000; // Augmenter la limite par défaut

  try {
    console.log('🔍 Récupération des communes françaises...');

    let sqlQuery = `
      SELECT 
        nom,
        population,
        lat,
        lng,
        codes_postaux
      FROM cities 
      ORDER BY population DESC NULLS LAST, nom ASC
    `;

    let queryParams = [];

    // Si une recherche est spécifiée, filtrer les résultats
    if (query && query.length >= 1) {
      sqlQuery = `
        SELECT 
          nom,
          population,
          lat,
          lng,
          codes_postaux
        FROM cities 
        WHERE 
          LOWER(nom) LIKE LOWER($1) OR
          LOWER(nom) LIKE LOWER($2) OR
          codes_postaux LIKE $3
        ORDER BY 
          CASE 
            WHEN LOWER(nom) LIKE LOWER($4) THEN 1
            WHEN LOWER(nom) LIKE LOWER($5) THEN 2
            ELSE 3
          END,
          population DESC NULLS LAST,
          nom ASC
        LIMIT $6
      `;
      
      const searchTerm = `%${query}%`;
      const startsWith = `${query}%`;
      const postalCode = `%${query}%`;
      
      queryParams = [
        searchTerm,      // $1: recherche générale
        startsWith,      // $2: commence par
        postalCode,      // $3: code postal
        startsWith,      // $4: priorité 1 (commence par)
        searchTerm,      // $5: priorité 2 (contient)
        limit           // $6: limite
      ];
    } else {
      // Sans recherche, limiter le nombre de résultats
      sqlQuery += ` LIMIT $1`;
      queryParams = [limit];
    }

    const result = await pool.query(sqlQuery, queryParams);
    
    // Transformer les résultats
    const cities = result.rows.map(row => ({
      nom: row.nom,
      population: row.population,
      lat: row.lat,
      lng: row.lng,
      codesPostaux: row.codes_postaux ? row.codes_postaux : []
    }));

    console.log(`✅ ${cities.length} communes récupérées`);

    return NextResponse.json({
      success: true,
      cities: cities,
      total: cities.length
    });

  } catch (error) {
    console.error('❌ Erreur récupération villes:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des villes',
      cities: []
    }, { status: 500 });
  }
} 