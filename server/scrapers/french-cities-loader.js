const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Charger les villes françaises depuis la base de données APEC
async function loadFrenchCities() {
  try {
    // Connexion à la base de données APEC
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: 'apec_database' // Base de données APEC
    });

    // Récupérer toutes les villes depuis la table cities
    const query = `
      SELECT nom
      FROM cities 
      WHERE nom IS NOT NULL 
      AND nom != '' 
      ORDER BY nom
    `;

    const result = await pool.query(query);
    const cities = result.rows.map(row => ({
      nom: row.nom
    }));

    await pool.end();
    
    console.log(`✅ ${cities.length} villes françaises chargées depuis la table cities de apec_database`);
    
    return cities;
  } catch (error) {
    console.error('❌ Erreur lors du chargement des villes depuis apec_database:', error.message);
    return [];
  }
}

// Fonction pour rechercher une ville par nom (insensible à la casse)
async function findCityByName(cityName) {
  const cities = await loadFrenchCities();
  const normalizedCityName = cityName.toLowerCase().replace(/[^a-z]/g, '');
  
  return cities.find(city => {
    const normalizedCity = city.nom.toLowerCase().replace(/[^a-z]/g, '');
    return normalizedCity === normalizedCityName || 
           city.nom.toLowerCase() === cityName.toLowerCase();
  });
}

// Fonction pour vérifier si un nom est une ville française
async function isFrenchCity(cityName) {
  const city = await findCityByName(cityName);
  return city !== undefined;
}

// Fonction pour obtenir les coordonnées d'une ville
async function getCityCoordinates(cityName) {
  const city = await findCityByName(cityName);
  return city && city.coordinates ? city.coordinates : null;
}

module.exports = {
  loadFrenchCities,
  findCityByName,
  isFrenchCity,
  getCityCoordinates
};