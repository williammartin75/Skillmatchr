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

class ApecCompaniesCleaner {
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
      console.log('📊 Analyse des données avant nettoyage...');

      // Statistiques générales
      const totalJobs = await pool.query('SELECT COUNT(*) FROM jobs WHERE source = $1', ['apec']);
      console.log(`📈 Total jobs APEC: ${totalJobs.rows[0].count}`);

      const totalCompanies = await pool.query(`
        SELECT COUNT(DISTINCT company) 
        FROM jobs 
        WHERE source = $1 AND company IS NOT NULL AND company != ''
      `, ['apec']);
      console.log(`🏢 Total entreprises uniques: ${totalCompanies.rows[0].count}`);

      // Top 10 des entreprises par nombre de jobs
      const topCompanies = await pool.query(`
        SELECT company, COUNT(*) as job_count
        FROM jobs 
        WHERE source = $1 AND company IS NOT NULL AND company != ''
        GROUP BY company 
        ORDER BY job_count DESC 
        LIMIT 10
      `, ['apec']);

      console.log('\n🏆 Top 10 des entreprises:');
      topCompanies.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.company} (${row.job_count} jobs)`);
      });

      // Entreprises problématiques
      const problematicCompanies = await pool.query(`
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

      if (problematicCompanies.rows.length > 0) {
        console.log('\n⚠️ Entreprises problématiques détectées:');
        problematicCompanies.rows.forEach((row, index) => {
          console.log(`${index + 1}. ${row.company} (${row.job_count} jobs)`);
        });
      }

      return {
        totalJobs: parseInt(totalJobs.rows[0].count),
        totalCompanies: parseInt(totalCompanies.rows[0].count),
        problematicCompanies: problematicCompanies.rows.length
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse des statistiques:', error);
      throw error;
    }
  }

  /**
   * Nettoyer les entreprises problématiques
   */
  async cleanCompanies() {
    try {
      console.log('\n🧹 Début du nettoyage des entreprises...');

      // 1. Supprimer les jobs avec des noms d'entreprises problématiques
      console.log('🗑️ Suppression des jobs avec entreprises problématiques...');
      
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
      console.log(`✅ ${this.deletedCount} jobs supprimés avec entreprises problématiques`);

      // 2. Nettoyer les noms d'entreprises restantes
      console.log('✨ Nettoyage des noms d\'entreprises...');
      
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
      console.log(`✅ ${this.cleanedCount} noms d'entreprises nettoyés`);

      // 3. Supprimer les jobs avec des noms d'entreprises vides après nettoyage
      console.log('🗑️ Suppression des jobs avec noms d\'entreprises vides après nettoyage...');
      
      const deleteEmptyQuery = `
        DELETE FROM jobs 
        WHERE source = $1 
        AND (company IS NULL OR company = '' OR LENGTH(TRIM(company)) < 3)
      `;

      const deleteEmptyResult = await pool.query(deleteEmptyQuery, ['apec']);
      console.log(`✅ ${deleteEmptyResult.rowCount} jobs supprimés avec noms d'entreprises vides`);

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

      const totalJobs = await pool.query('SELECT COUNT(*) FROM jobs WHERE source = $1', ['apec']);
      console.log(`📈 Total jobs APEC restants: ${totalJobs.rows[0].count}`);

      const totalCompanies = await pool.query(`
        SELECT COUNT(DISTINCT company) 
        FROM jobs 
        WHERE source = $1 AND company IS NOT NULL AND company != ''
      `, ['apec']);
      console.log(`🏢 Total entreprises uniques restantes: ${totalCompanies.rows[0].count}`);

      // Top 10 des entreprises après nettoyage
      const topCompanies = await pool.query(`
        SELECT company, COUNT(*) as job_count
        FROM jobs 
        WHERE source = $1 AND company IS NOT NULL AND company != ''
        GROUP BY company 
        ORDER BY job_count DESC 
        LIMIT 10
      `, ['apec']);

      console.log('\n🏆 Top 10 des entreprises après nettoyage:');
      topCompanies.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.company} (${row.job_count} jobs)`);
      });

      return {
        totalJobs: parseInt(totalJobs.rows[0].count),
        totalCompanies: parseInt(totalCompanies.rows[0].count)
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
    console.log('🚀 DÉBUT DU NETTOYAGE DE LA BASE DE DONNÉES APEC');
    console.log('=' .repeat(60));

    try {
      // Test de connexion
      await pool.query('SELECT 1');
      console.log('✅ Connexion à la base de données établie');

      // Statistiques avant nettoyage
      const beforeStats = await this.getStatistics();

      // Confirmation
      console.log('\n⚠️ ATTENTION: Cette opération va supprimer des données.');
      console.log('Voulez-vous continuer? (Ctrl+C pour annuler, ou appuyez sur Entrée pour continuer)');
      
      // Attendre 5 secondes pour permettre l'annulation
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Nettoyage
      const cleanupResults = await this.cleanCompanies();

      // Statistiques après nettoyage
      const afterStats = await this.getPostCleanupStatistics();

      // Résumé
      console.log('\n' + '='.repeat(60));
      console.log('📋 RÉSUMÉ DU NETTOYAGE');
      console.log('='.repeat(60));
      console.log(`🗑️ Jobs supprimés: ${cleanupResults.deletedCount}`);
      console.log(`✨ Noms d'entreprises nettoyés: ${cleanupResults.cleanedCount}`);
      console.log(`🗑️ Jobs supprimés (noms vides): ${cleanupResults.emptyDeletedCount}`);
      console.log(`📈 Jobs restants: ${afterStats.totalJobs} (était ${beforeStats.totalJobs})`);
      console.log(`🏢 Entreprises restantes: ${afterStats.totalCompanies} (était ${beforeStats.totalCompanies})`);
      
      if (this.errors.length > 0) {
        console.log(`❌ Erreurs rencontrées: ${this.errors.length}`);
      }

      console.log('\n✅ Nettoyage terminé avec succès!');

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
  const cleaner = new ApecCompaniesCleaner();
  cleaner.run();
}

module.exports = ApecCompaniesCleaner; 