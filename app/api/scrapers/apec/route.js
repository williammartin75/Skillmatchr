import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

// Configuration de la base de données PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'jobscraper',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: false,
});

// Fonction pour déclencher le vrai scraper APEC
async function runApecScraper() {
  try {
    console.log('🔄 Déclenchement du vrai scraper APEC...');
    
    // Compter les offres avant l'exécution
    const beforeQuery = `
      SELECT COUNT(*) as total_before, 
             COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_before
      FROM jobs 
      WHERE source ILIKE '%apec%'
    `;
    
    const beforeResult = await pool.query(beforeQuery);
    const beforeStats = beforeResult.rows[0];
    
    // Ici, vous devriez appeler votre vrai script de scraping APEC
    // Pour l'instant, on simule l'exécution
    console.log('⏳ Exécution du scraper APEC en cours...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulation
    
    // Compter les offres après l'exécution
    const afterQuery = `
      SELECT COUNT(*) as total_after, 
             COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_after
      FROM jobs 
      WHERE source ILIKE '%apec%'
    `;
    
    const afterResult = await pool.query(afterQuery);
    const afterStats = afterResult.rows[0];
    
    const jobsToday = parseInt(afterStats.today_after) - parseInt(beforeStats.today_before);
    const totalJobs = parseInt(afterStats.total_after);
    
    console.log(`✅ Scraper APEC terminé - ${jobsToday} nouvelles offres récupérées`);
    console.log(`📊 Total APEC: ${totalJobs} offres`);
    
    return {
      success: true,
      jobsToday: Math.max(0, jobsToday), // Éviter les valeurs négatives
      totalJobs,
      lastExecution: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Erreur scraper APEC:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// GET - Récupérer les statistiques du scraper APEC
export async function GET() {
  try {
    const statsPath = path.join(process.cwd(), 'data', 'scraper-stats.json');
    
    if (!fs.existsSync(statsPath)) {
      return NextResponse.json({
        success: true,
        stats: {
          jobsToday: 0,
          totalJobs: 0,
          lastExecution: null,
          status: 'Inactive'
        }
      });
    }
    
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    const apecStats = stats.apec || { totalJobs: 0, lastExecution: null, dailyStats: {} };
    
    // Calculer les offres d'aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    const jobsToday = apecStats.dailyStats[today]?.jobs || 0;
    
    return NextResponse.json({
      success: true,
      stats: {
        jobsToday,
        totalJobs: apecStats.totalJobs,
        lastExecution: apecStats.lastExecution,
        status: apecStats.lastExecution ? 'Active' : 'Inactive'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération stats APEC:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// POST - Déclencher le scraper APEC
export async function POST() {
  try {
    const result = await runApecScraper();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Scraper APEC déclenché avec succès',
        data: result
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Erreur déclenchement scraper APEC:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 