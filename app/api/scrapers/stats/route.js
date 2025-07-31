import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

// Configuration de la base de données PostgreSQL principale
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'jobscraper',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: false,
});

// Configuration de la base de données APEC
const apecPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'apec_database',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: false,
});

// Configuration de la base de données JobTeaser
const jobteaserPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'jobteaser_database',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: false,
});

// Fonction pour obtenir la date de dernière exécution depuis le fichier de log
function getLastExecutionFromLog() {
  try {
    const logPath = path.join(process.cwd(), 'logs', 'apec_cron.log');
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      return stats.mtime;
    }
  } catch (error) {
    console.log('⚠️ Impossible de lire le fichier de log APEC:', error.message);
  }
  return null;
}

export async function GET() {
  try {
    console.log('🔍 Récupération des vraies statistiques des scrapers depuis PostgreSQL...');
    
    // Récupérer les statistiques depuis PostgreSQL principal
    const today = new Date().toISOString().split('T')[0];
    
    // Compter le total des offres par source (base principale)
    const totalQuery = `
      SELECT 
        source,
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN DATE(created_at) = $1 THEN 1 END) as jobs_today,
        MAX(created_at) as last_execution
      FROM jobs 
      GROUP BY source
    `;
    
    const totalResult = await pool.query(totalQuery, [today]);
    
    // Récupérer les statistiques APEC depuis sa base dédiée
    let apecStats = {
      total_jobs: 0,
      jobs_today: 0,
      last_execution: null
    };
    
    try {
      // Récupérer les statistiques des jobs
      const apecJobsQuery = `
        SELECT 
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN DATE(created_at) = $1 THEN 1 END) as jobs_today
        FROM apec_jobs
      `;
      
      const apecJobsResult = await apecPool.query(apecJobsQuery, [today]);
      if (apecJobsResult.rows.length > 0) {
        apecStats.total_jobs = apecJobsResult.rows[0].total_jobs;
        apecStats.jobs_today = apecJobsResult.rows[0].jobs_today;
      }
      
      // Utiliser la date de dernière exécution depuis le fichier de log
      const logLastExecution = getLastExecutionFromLog();
      if (logLastExecution) {
        apecStats.last_execution = logLastExecution;
      } else {
        // Fallback: récupérer depuis la table de stats
        const apecExecutionQuery = `
          SELECT last_execution_time
          FROM apec_scraping_stats
          WHERE scraper_name = 'apec_cron'
          ORDER BY last_execution_time DESC
          LIMIT 1
        `;
        
        const apecExecutionResult = await apecPool.query(apecExecutionQuery);
        if (apecExecutionResult.rows.length > 0) {
          apecStats.last_execution = apecExecutionResult.rows[0].last_execution_time;
        }
      }
      
      console.log('📊 Statistiques APEC récupérées:', apecStats);
    } catch (error) {
      console.log('⚠️ Impossible de récupérer les stats APEC:', error.message);
    }
    
    // Récupérer les statistiques JobTeaser depuis sa base dédiée
    let jobteaserStats = {
      total_jobs: 0,
      jobs_today: 0,
      last_execution: null
    };
    
    try {
      // Récupérer les statistiques des jobs
      const jobteaserJobsQuery = `
        SELECT 
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN DATE(created_at) = $1 THEN 1 END) as jobs_today
        FROM jobteaser_jobs
      `;
      
      const jobteaserJobsResult = await jobteaserPool.query(jobteaserJobsQuery, [today]);
      if (jobteaserJobsResult.rows.length > 0) {
        jobteaserStats.total_jobs = jobteaserJobsResult.rows[0].total_jobs;
        jobteaserStats.jobs_today = jobteaserJobsResult.rows[0].jobs_today;
      }
      
      // Récupérer la date de dernière exécution depuis la table de stats
      const jobteaserExecutionQuery = `
        SELECT last_run
        FROM jobteaser_scraping_stats
        WHERE scraper_name = 'jobteaser_cron'
        ORDER BY last_run DESC
        LIMIT 1
      `;
      
      const jobteaserExecutionResult = await jobteaserPool.query(jobteaserExecutionQuery);
      if (jobteaserExecutionResult.rows.length > 0) {
        jobteaserStats.last_execution = jobteaserExecutionResult.rows[0].last_run;
      }
      
      console.log('📊 Statistiques JobTeaser récupérées:', jobteaserStats);
    } catch (error) {
      console.log('⚠️ Impossible de récupérer les stats JobTeaser:', error.message);
    }
    
    // Récupérer les statistiques WTTJ depuis sa base dédiée
    let wttjStats = {
      total_jobs: 0,
      jobs_today: 0,
      last_execution: null
    };
    
    try {
      const wttjPool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: 'wttj_database',
        password: process.env.DB_PASSWORD || 'password',
        port: process.env.DB_PORT || 5432,
        ssl: false,
      });
      
      // Récupérer les statistiques des jobs
      const wttjJobsQuery = `
        SELECT 
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN DATE(created_at) = $1 THEN 1 END) as jobs_today
        FROM wttj_jobs
      `;
      
      const wttjJobsResult = await wttjPool.query(wttjJobsQuery, [today]);
      if (wttjJobsResult.rows.length > 0) {
        wttjStats.total_jobs = wttjJobsResult.rows[0].total_jobs;
        wttjStats.jobs_today = wttjJobsResult.rows[0].jobs_today;
      }
      
      // Récupérer la date de dernière exécution depuis la table de stats
      const wttjExecutionQuery = `
        SELECT execution_date
        FROM wttj_scraping_stats
        ORDER BY execution_date DESC
        LIMIT 1
      `;
      
      const wttjExecutionResult = await wttjPool.query(wttjExecutionQuery);
      if (wttjExecutionResult.rows.length > 0) {
        wttjStats.last_execution = wttjExecutionResult.rows[0].execution_date;
      }
      
      await wttjPool.end();
      console.log('📊 Statistiques WTTJ récupérées:', wttjStats);
    } catch (error) {
      console.log('⚠️ Impossible de récupérer les stats WTTJ:', error.message);
    }
    
    // Construire les données des scrapers
    const scrapers = {
      apec: {
        name: "APEC Cron",
        description: "Scraper automatique de l'APEC",
        jobsToday: 0,
        totalJobs: 0,
        lastExecution: null,
        status: "Inactive",
        schedule: "21h",
        source: "apec.fr"
      },
      jobteaser: {
        name: "JobTeaser Cron",
        description: "Scraper automatique de JobTeaser",
        jobsToday: 0,
        totalJobs: 0,
        lastExecution: null,
        status: "Inactive",
        schedule: "23h30",
        source: "jobteaser.com"
      },
      indeed: {
        name: "Indeed Cron",
        description: "Scraper automatique d'Indeed",
        jobsToday: 0,
        totalJobs: 0,
        lastExecution: null,
        status: "Inactive",
        schedule: "20h30",
        source: "indeed.com"
      },
      linkedin: {
        name: "LinkedIn Cron",
        description: "Scraper automatique de LinkedIn",
        jobsToday: 0,
        totalJobs: 0,
        lastExecution: null,
        status: "Inactive",
        schedule: "19h45",
        source: "linkedin.com"
      },
      poleEmploi: {
        name: "Pôle Emploi Cron",
        description: "Scraper automatique de Pôle Emploi",
        jobsToday: 0,
        totalJobs: 0,
        lastExecution: null,
        status: "Inactive",
        schedule: "18h15",
        source: "pole-emploi.fr"
      },
      wttj: {
        name: "Welcome to the Jungle Cron",
        description: "Scraper automatique de Welcome to the Jungle",
        jobsToday: 0,
        totalJobs: 0,
        lastExecution: null,
        status: "Inactive",
        schedule: "23h30",
        source: "welcometothejungle.com"
      }
    };
    
    // Mettre à jour avec les vraies données
    for (const row of totalResult.rows) {
      const source = row.source.toLowerCase();
      
      if (source.includes('jobteaser')) {
        scrapers.jobteaser.jobsToday = parseInt(row.jobs_today) || 0;
        scrapers.jobteaser.totalJobs = parseInt(row.total_jobs) || 0;
        scrapers.jobteaser.lastExecution = row.last_execution;
        scrapers.jobteaser.status = row.last_execution ? "Active" : "Inactive";
      } else if (source.includes('indeed')) {
        scrapers.indeed.jobsToday = parseInt(row.jobs_today) || 0;
        scrapers.indeed.totalJobs = parseInt(row.total_jobs) || 0;
        scrapers.indeed.lastExecution = row.last_execution;
        scrapers.indeed.status = row.last_execution ? "Active" : "Inactive";
      } else if (source.includes('linkedin')) {
        scrapers.linkedin.jobsToday = parseInt(row.jobs_today) || 0;
        scrapers.linkedin.totalJobs = parseInt(row.total_jobs) || 0;
        scrapers.linkedin.lastExecution = row.last_execution;
        scrapers.linkedin.status = row.last_execution ? "Active" : "Inactive";
      } else if (source.includes('pole') || source.includes('emploi')) {
        scrapers.poleEmploi.jobsToday = parseInt(row.jobs_today) || 0;
        scrapers.poleEmploi.totalJobs = parseInt(row.total_jobs) || 0;
        scrapers.poleEmploi.lastExecution = row.last_execution;
        scrapers.poleEmploi.status = row.last_execution ? "Active" : "Inactive";
      } else if (source.includes('wttj') || source.includes('welcometothejungle')) {
        scrapers.wttj.jobsToday = parseInt(row.jobs_today) || 0;
        scrapers.wttj.totalJobs = parseInt(row.total_jobs) || 0;
        scrapers.wttj.lastExecution = row.last_execution;
        scrapers.wttj.status = row.last_execution ? "Active" : "Inactive";
      }
    }
    
    // Mettre à jour APEC avec les données de sa base dédiée
    scrapers.apec.jobsToday = parseInt(apecStats.jobs_today) || 0;
    scrapers.apec.totalJobs = parseInt(apecStats.total_jobs) || 0;
    scrapers.apec.lastExecution = apecStats.last_execution;
    scrapers.apec.status = apecStats.last_execution ? "Active" : "Inactive";
    
    // Mettre à jour JobTeaser avec les données de sa base dédiée
    scrapers.jobteaser.jobsToday = parseInt(jobteaserStats.jobs_today) || 0;
    scrapers.jobteaser.totalJobs = parseInt(jobteaserStats.total_jobs) || 0;
    scrapers.jobteaser.lastExecution = jobteaserStats.last_execution;
    scrapers.jobteaser.status = jobteaserStats.last_execution ? "Active" : "Inactive";
    
    // Mettre à jour WTTJ avec les données de sa base dédiée
    scrapers.wttj.jobsToday = parseInt(wttjStats.jobs_today) || 0;
    scrapers.wttj.totalJobs = parseInt(wttjStats.total_jobs) || 0;
    scrapers.wttj.lastExecution = wttjStats.last_execution;
    scrapers.wttj.status = wttjStats.last_execution ? "Active" : "Inactive";
    
    console.log('✅ Statistiques récupérées:', {
      apec: { total: scrapers.apec.totalJobs, today: scrapers.apec.jobsToday, lastExec: scrapers.apec.lastExecution },
      jobteaser: { total: scrapers.jobteaser.totalJobs, today: scrapers.jobteaser.jobsToday },
      wttj: { total: scrapers.wttj.totalJobs, today: scrapers.wttj.jobsToday },
      indeed: { total: scrapers.indeed.totalJobs, today: scrapers.indeed.jobsToday },
      linkedin: { total: scrapers.linkedin.totalJobs, today: scrapers.linkedin.jobsToday },
      poleEmploi: { total: scrapers.poleEmploi.totalJobs, today: scrapers.poleEmploi.jobsToday }
    });
    
    return NextResponse.json({
      success: true,
      scrapers
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération stats scrapers:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 