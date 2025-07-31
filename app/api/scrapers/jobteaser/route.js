import { NextResponse } from 'next/server';
import { runJobTeaserCron } from '../../../../server/scrapers/jobteaserCron.js';

export async function POST() {
  try {
    console.log('🚀 Déclenchement manuel du scraper JobTeaser...');
    
    // Exécuter le scraper JobTeaser
    const jobs = await runJobTeaserCron();
    
    console.log(`✅ Scraper JobTeaser terminé avec succès: ${jobs.length} jobs trouvés`);
    
    return NextResponse.json({
      success: true,
      message: `Scraper JobTeaser exécuté avec succès`,
      jobsFound: jobs.length,
      executionTime: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du déclenchement du scraper JobTeaser:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('📊 Récupération des statistiques du scraper JobTeaser...');
    
    // Ici vous pourriez récupérer des statistiques spécifiques au scraper JobTeaser
    // Pour l'instant, retourner des informations de base
    
    return NextResponse.json({
      success: true,
      scraper: {
        name: "JobTeaser Cron",
        description: "Scraper automatique de JobTeaser",
        status: "Available",
        schedule: "23h30",
        source: "jobteaser.com"
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des stats JobTeaser:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 