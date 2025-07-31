#!/usr/bin/env node

const { Pool } = require('pg');

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'jobs_database',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: false,
});

class UnifiedApecJobsCleaner {
  constructor() {
    this.cleanedCount = 0;
    this.deletedCount = 0;
    this.errors = [];
  }

  /**
   * Nettoyer les noms d'entreprises problématiques
   */
  cleanCompanyName(companyName) {
    if (!companyName) return null;

    let cleanName = companyName
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
      .trim();

    // Nettoyer les caractères spéciaux au début et à la fin
    cleanName = cleanName
      .replace(/^[^a-zA-Z0-9]*/, '') // Enlever les caractères spéciaux au début
      .replace(/[^a-zA-Z0-9\s\-&\.]*$/, ''); // Enlever les caractères spéciaux à la fin

    // Si le nom est trop court après nettoyage, le supprimer
    if (cleanName.length < 3) {
      return null;
    }

    return cleanName;
  }

  /**
   * Vérifier si un nom d'entreprise doit être supprimé
   */
  shouldDeleteCompany(companyName) {
    if (!companyName) return true;

    const name = companyName.toLowerCase();

    // Sources de scraping à exclure
    const excludedSources = [
      'hellowork', 'cadremploi', 'meteojob', 'helloworkcollaborateur', 
      'clubofficine', 'engagement jeunes', 'entreprise non précisée',
      'handicap-job.com', 'batiactu', 'apec', 'pole-emploi'
    ];

    // Vérifier si le nom commence par une source de scraping
    const startsWithSource = excludedSources.some(source => 
      name.startsWith(source.toLowerCase())
    );

    if (startsWithSource) {
      return true;
    }

    // Noms génériques ou non pertinents
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
      'com',
      'cabinet de recrutement',
      'my premium consulting'
    ];

    const isGenericName = genericNames.some(generic => 
      name.includes(generic.toLowerCase())
    );

    if (isGenericName) {
      return true;
    }

    // Patterns suspects (descriptions de poste, etc.)
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
      /temps\s+plein|temps\s+partiel/i,
      /chef\s+de\s+mission/i,
      /gestionnaire\s+de\s+paie/i,
      /collaborateur/i
    ];

    const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(name));
    if (hasSuspiciousPattern) {
      return true;
    }

    // Noms qui sont juste des descriptions de poste
    const jobDescriptionKeywords = [
      'développeur', 'ingénieur', 'chef', 'manager', 'directeur', 'responsable',
      'assistant', 'secrétaire', 'comptable', 'commercial', 'vendeur',
      'technicien', 'opérateur', 'agent', 'employé', 'collaborateur'
    ];

    const words = name.split(/\s+/);
    if (words.length === 1 && jobDescriptionKeywords.includes(words[0])) {
      return true;
    }

    return false;
  }

  /**
   * Obtenir les statistiques avant nettoyage
   */
  async getStatistics() {
    try {
      console.log('📊 Analyse des données APEC dans la base unifiée avant nettoyage...');

      // Statistiques générales pour APEC
      const totalApecJobs = await pool.query('SELECT COUNT(*) FROM jobs WHERE source = $1', ['apec']);
      console.log(`📈 Total jobs APEC dans la base unifiée: ${totalApecJobs.rows[0].count}`);

      const totalApecCompanies = await pool.query(`
        SELECT COUNT(DISTINCT company) 
        FROM jobs 
        WHERE source = $1 AND company IS NOT NULL AND company != ''
      `, ['apec']);
      console.log(`🏢 Total entreprises APEC uniques: ${totalApecCompanies.rows[0].count}`);

      // Statistiques générales pour toutes les sources
      const totalAllJobs = await pool.query('SELECT COUNT(*) FROM jobs');
      console.log(`📈 Total jobs toutes sources: ${totalAllJobs.rows[0].count}`);

      const totalAllCompanies = await pool.query(`
        SELECT COUNT(DISTINCT company) 
        FROM jobs 
        WHERE company IS NOT NULL AND company != ''
      `);
      console.log(`🏢 Total entreprises toutes sources: ${totalAllCompanies.rows[0].count}`);

      // Top 10 des entreprises APEC par nombre de jobs
      const topApecCompanies = await pool.query(`
        SELECT company, COUNT(*) as job_count
        FROM jobs 
        WHERE source = $1 AND company IS NOT NULL AND company != ''
        GROUP BY company 
        ORDER BY job_count DESC 
        LIMIT 10
      `, ['apec']);

      console.log('\n🏆 Top 10 des entreprises APEC:');
      topApecCompanies.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.company} (${row.job_count} jobs)`);
      });

      // Entreprises problématiques APEC
      const problematicApecCompanies = await pool.query(`
        SELECT company, COUNT(*) as job_count
        FROM jobs 
        WHERE source = $1 AND company IS NOT NULL AND company != ''
        AND (
          LOWER(company) LIKE '%hellowork%' OR
          LOWER(company) LIKE '%cadremploi%' OR
          LOWER(company) LIKE '%meteojob%' OR
          LOWER(company) LIKE '%entreprise non précisée%' OR
          LOWER(company) LIKE '%engagement jeunes%' OR
          LOWER(company) LIKE '%handicap-job%' OR
          LOWER(company) LIKE '%batiactu%' OR
          LOWER(company) LIKE '%après une période%' OR
          LOWER(company) LIKE '%vous serez%' OR
          LOWER(company) LIKE '%chef de mission%' OR
          LOWER(company) LIKE '%gestionnaire de paie%' OR
          LOWER(company) LIKE '%collaborateur%'
        )
        GROUP BY company 
        ORDER BY job_count DESC
      `, ['apec']);

      if (problematicApecCompanies.rows.length > 0) {
        console.log('\n⚠️ Entreprises APEC problématiques détectées:');
        problematicApecCompanies.rows.forEach((row, index) => {
          console.log(`${index + 1}. ${row.company} (${row.job_count} jobs)`);
        });
      }

      // Répartition par source
      const sourcesDistribution = await pool.query(`
        SELECT source, COUNT(*) as job_count
        FROM jobs 
        GROUP BY source 
        ORDER BY job_count DESC
      `);

      console.log('\n📊 Répartition par source:');
      sourcesDistribution.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.source}: ${row.job_count} jobs`);
      });

      return {
        totalApecJobs: parseInt(totalApecJobs.rows[0].count),
        totalApecCompanies: parseInt(totalApecCompanies.rows[0].count),
        totalAllJobs: parseInt(totalAllJobs.rows[0].count),
        totalAllCompanies: parseInt(totalAllCompanies.rows[0].count),
        problematicCompanies: problematicApecCompanies.rows.length
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse des statistiques:', error);
      throw error;
    }
  }

  /**
   * Nettoyer les entreprises problématiques APEC
   */
  async cleanApecCompanies() {
    try {
      console.log('\n🧹 Début du nettoyage des entreprises APEC dans la base unifiée...');

      // 1. Supprimer les jobs APEC avec des noms d'entreprises problématiques
      console.log('🗑️ Suppression des jobs APEC avec entreprises problématiques...');
      
      const deleteQuery = `
        DELETE FROM jobs 
        WHERE source = $1 AND company IS NOT NULL AND company != ''
        AND (
          LOWER(company) LIKE '%hellowork%' OR
          LOWER(company) LIKE '%cadremploi%' OR
          LOWER(company) LIKE '%meteojob%' OR
          LOWER(company) LIKE '%entreprise non précisée%' OR
          LOWER(company) LIKE '%engagement jeunes%' OR
          LOWER(company) LIKE '%handicap-job%' OR
          LOWER(company) LIKE '%batiactu%' OR
          LOWER(company) LIKE '%après une période%' OR
          LOWER(company) LIKE '%vous serez%' OR
          LOWER(company) LIKE '%chef de mission%' OR
          LOWER(company) LIKE '%gestionnaire de paie%' OR
          LOWER(company) LIKE '%collaborateur%' OR
          LOWER(company) LIKE '%cabinet de recrutement%' OR
          LOWER(company) LIKE '%my premium consulting%' OR
          LENGTH(TRIM(company)) < 3
        )
      `;

      const deleteResult = await pool.query(deleteQuery, ['apec']);
      this.deletedCount = deleteResult.rowCount;
      console.log(`✅ ${this.deletedCount} jobs APEC supprimés avec entreprises problématiques`);

      // 2. Nettoyer les noms d'entreprises APEC restantes
      console.log('✨ Nettoyage des noms d\'entreprises APEC...');
      
      const updateQuery = `
        UPDATE jobs 
        SET company = TRIM(REGEXP_REPLACE(REGEXP_REPLACE(company, '\\s+', ' ', 'g'), '^[^a-zA-Z0-9]*|[^a-zA-Z0-9\\s\\-&\\.]*$', '', 'g'))
        WHERE source = $1 
        AND company IS NOT NULL 
        AND company != ''
        AND LENGTH(TRIM(company)) >= 3
      `;

      const updateResult = await pool.query(updateQuery, ['apec']);
      this.cleanedCount = updateResult.rowCount;
      console.log(`✅ ${this.cleanedCount} noms d'entreprises APEC nettoyés`);

      // 3. Supprimer les jobs APEC avec des noms d'entreprises vides après nettoyage
      console.log('🗑️ Suppression des jobs APEC avec noms d\'entreprises vides après nettoyage...');
      
      const deleteEmptyQuery = `
        DELETE FROM jobs 
        WHERE source = $1 
        AND (company IS NULL OR company = '' OR LENGTH(TRIM(company)) < 3)
      `;

      const deleteEmptyResult = await pool.query(deleteEmptyQuery, ['apec']);
      console.log(`✅ ${deleteEmptyResult.rowCount} jobs APEC supprimés avec noms d'entreprises vides`);

      return {
        deletedCount: this.deletedCount,
        cleanedCount: this.cleanedCount,
        emptyDeletedCount: deleteEmptyResult.rowCount
      };

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      this.errors.push(error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques après nettoyage
   */
  async getPostCleanupStatistics() {
    try {
      console.log('\n📊 Statistiques après nettoyage...');

      const totalApecJobs = await pool.query('SELECT COUNT(*) FROM jobs WHERE source = $1', ['apec']);
      console.log(`📈 Total jobs APEC restants: ${totalApecJobs.rows[0].count}`);

      const totalApecCompanies = await pool.query(`
        SELECT COUNT(DISTINCT company) 
        FROM jobs 
        WHERE source = $1 AND company IS NOT NULL AND company != ''
      `, ['apec']);
      console.log(`🏢 Total entreprises APEC uniques restantes: ${totalApecCompanies.rows[0].count}`);

      const totalAllJobs = await pool.query('SELECT COUNT(*) FROM jobs');
      console.log(`📈 Total jobs toutes sources restants: ${totalAllJobs.rows[0].count}`);

      const totalAllCompanies = await pool.query(`
        SELECT COUNT(DISTINCT company) 
        FROM jobs 
        WHERE company IS NOT NULL AND company != ''
      `);
      console.log(`🏢 Total entreprises toutes sources restantes: ${totalAllCompanies.rows[0].count}`);

      // Top 10 des entreprises APEC après nettoyage
      const topApecCompanies = await pool.query(`
        SELECT company, COUNT(*) as job_count
        FROM jobs 
        WHERE source = $1 AND company IS NOT NULL AND company != ''
        GROUP BY company 
        ORDER BY job_count DESC 
        LIMIT 10
      `, ['apec']);

      console.log('\n🏆 Top 10 des entreprises APEC après nettoyage:');
      topApecCompanies.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.company} (${row.job_count} jobs)`);
      });

      // Répartition par source après nettoyage
      const sourcesDistribution = await pool.query(`
        SELECT source, COUNT(*) as job_count
        FROM jobs 
        GROUP BY source 
        ORDER BY job_count DESC
      `);

      console.log('\n📊 Répartition par source après nettoyage:');
      sourcesDistribution.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.source}: ${row.job_count} jobs`);
      });

      return {
        totalApecJobs: parseInt(totalApecJobs.rows[0].count),
        totalApecCompanies: parseInt(totalApecCompanies.rows[0].count),
        totalAllJobs: parseInt(totalAllJobs.rows[0].count),
        totalAllCompanies: parseInt(totalAllCompanies.rows[0].count)
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse post-nettoyage:', error);
      throw error;
    }
  }

  /**
   * Exécuter le nettoyage complet
   */
  async run() {
    console.log('🚀 DÉBUT DU NETTOYAGE DES JOBS APEC DANS LA BASE UNIFIÉE');
    console.log('=' .repeat(70));

    try {
      // Test de connexion
      await pool.query('SELECT 1');
      console.log('✅ Connexion à la base de données établie');

      // Statistiques avant nettoyage
      const beforeStats = await this.getStatistics();

      // Confirmation
      console.log('\n⚠️ ATTENTION: Cette opération va supprimer des données APEC de la base unifiée.');
      console.log('Voulez-vous continuer? (Ctrl+C pour annuler, ou appuyez sur Entrée pour continuer)');
      
      // Attendre 5 secondes pour permettre l'annulation
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Nettoyage
      const cleanupResults = await this.cleanApecCompanies();

      // Statistiques après nettoyage
      const afterStats = await this.getPostCleanupStatistics();

      // Résumé
      console.log('\n' + '='.repeat(70));
      console.log('📋 RÉSUMÉ DU NETTOYAGE APEC DANS LA BASE UNIFIÉE');
      console.log('='.repeat(70));
      console.log(`🗑️ Jobs APEC supprimés: ${cleanupResults.deletedCount}`);
      console.log(`✨ Noms d'entreprises APEC nettoyés: ${cleanupResults.cleanedCount}`);
      console.log(`🗑️ Jobs APEC supprimés (noms vides): ${cleanupResults.emptyDeletedCount}`);
      console.log(`📈 Jobs APEC restants: ${afterStats.totalApecJobs} (était ${beforeStats.totalApecJobs})`);
      console.log(`🏢 Entreprises APEC restantes: ${afterStats.totalApecCompanies} (était ${beforeStats.totalApecCompanies})`);
      console.log(`📈 Jobs toutes sources restants: ${afterStats.totalAllJobs} (était ${beforeStats.totalAllJobs})`);
      console.log(`🏢 Entreprises toutes sources restantes: ${afterStats.totalAllCompanies} (était ${beforeStats.totalAllCompanies})`);
      
      if (this.errors.length > 0) {
        console.log(`❌ Erreurs rencontrées: ${this.errors.length}`);
      }

      console.log('\n✅ Nettoyage APEC dans la base unifiée terminé avec succès!');

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      process.exit(1);
    } finally {
      await pool.end();
    }
  }
}

// Exécuter le nettoyage
if (require.main === module) {
  const cleaner = new UnifiedApecJobsCleaner();
  cleaner.run();
}

module.exports = UnifiedApecJobsCleaner; 