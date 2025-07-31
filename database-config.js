const { Pool } = require('pg');

// Configuration des bases de données par scraper
const scraperDatabases = {
  apec: {
    name: 'apec_database',
    table: 'apec_jobs',
    config: {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'apec_database',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 5432,
      ssl: false,
    }
  },
  indeed: {
    name: 'indeed_database',
    table: 'indeed_jobs',
    config: {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'indeed_database',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 5432,
      ssl: false,
    }
  },
  linkedin: {
    name: 'linkedin_database',
    table: 'linkedin_jobs',
    config: {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'linkedin_database',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 5432,
      ssl: false,
    }
  },
  jobteaser: {
    name: 'jobteaser_database',
    table: 'jobteaser_jobs',
    config: {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'jobteaser_database',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
      ssl: false,
    }
  }
};

// Configuration de la base de données unifiée
const unifiedDatabase = {
  name: 'jobscraper',
  table: 'jobs',
  config: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'jobscraper',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    ssl: false,
  }
};

// Configuration de la base de données des villes
const citiesDatabase = {
  name: 'cities_database',
  table: 'cities',
  config: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'cities_database',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    ssl: false,
  }
};

// Fonction pour créer une connexion à une base de données
function createConnection(databaseConfig) {
  return new Pool(databaseConfig.config);
}

// Fonction pour créer une connexion à un scraper spécifique
function getScraperConnection(scraperName) {
  const scraper = scraperDatabases[scraperName];
  if (!scraper) {
    throw new Error(`Scraper '${scraperName}' non configuré`);
  }
  return createConnection(scraper);
}

// Fonction pour créer une connexion à la base unifiée
function getUnifiedConnection() {
  return createConnection(unifiedDatabase);
}

// Fonction pour créer une connexion à la base des villes
function getCitiesConnection() {
  return createConnection(citiesDatabase);
}

module.exports = {
  scraperDatabases,
  unifiedDatabase,
  citiesDatabase,
  createConnection,
  getScraperConnection,
  getUnifiedConnection,
  getCitiesConnection
}; 