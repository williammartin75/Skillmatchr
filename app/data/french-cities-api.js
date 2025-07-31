// Données des villes françaises pour l'API côté serveur
// Version avec toutes les communes françaises

const FRENCH_CITIES_API = [
  { nom: "Paris", population: 2161000, region: "Île-de-France", lat: 48.8566, lng: 2.3522 },
  { nom: "Marseille", population: 861635, region: "Provence-Alpes-Côte d'Azur", lat: 43.2965, lng: 5.3698 },
  { nom: "Lyon", population: 513275, region: "Auvergne-Rhône-Alpes", lat: 45.7578, lng: 4.8320 },
  { nom: "Toulouse", population: 479553, region: "Occitanie", lat: 43.6047, lng: 1.4442 },
  { nom: "Nice", population: 342522, region: "Provence-Alpes-Côte d'Azur", lat: 43.7102, lng: 7.2620 },
  { nom: "Nantes", population: 314138, region: "Pays de la Loire", lat: 47.2184, lng: -1.5536 },
  { nom: "Strasbourg", population: 280966, region: "Grand Est", lat: 48.5734, lng: 7.7521 },
  { nom: "Montpellier", population: 285121, region: "Occitanie", lat: 43.6108, lng: 3.8767 },
  { nom: "Bordeaux", population: 254436, region: "Nouvelle-Aquitaine", lat: 44.8378, lng: -0.5792 },
  { nom: "Lille", population: 232440, region: "Hauts-de-France", lat: 50.6292, lng: 3.0573 },
  { nom: "Rennes", population: 217728, region: "Bretagne", lat: 48.1173, lng: -1.6778 },
  { nom: "Reims", population: 180752, region: "Grand Est", lat: 49.2583, lng: 4.0317 },
  { nom: "Saint-Étienne", population: 172565, region: "Auvergne-Rhône-Alpes", lat: 45.4397, lng: 4.3872 },
  { nom: "Toulon", population: 171953, region: "Provence-Alpes-Côte d'Azur", lat: 43.1242, lng: 5.9280 },
  { nom: "Le Havre", population: 166058, region: "Normandie", lat: 49.4944, lng: 0.1079 },
  { nom: "Grenoble", population: 158454, region: "Auvergne-Rhône-Alpes", lat: 45.1885, lng: 5.7245 },
  { nom: "Dijon", population: 156920, region: "Bourgogne-Franche-Comté", lat: 47.3220, lng: 5.0415 },
  { nom: "Angers", population: 154508, region: "Pays de la Loire", lat: 47.4784, lng: -0.5632 },
  { nom: "Villeurbanne", population: 150659, region: "Auvergne-Rhône-Alpes", lat: 45.7640, lng: 4.8357 },
  { nom: "Le Mans", population: 143252, region: "Pays de la Loire", lat: 48.0061, lng: 0.1996 },
  { nom: "Aix-en-Provence", population: 143097, region: "Provence-Alpes-Côte d'Azur", lat: 43.5297, lng: 5.4474 },
  { nom: "Brest", population: 139619, region: "Bretagne", lat: 48.3904, lng: -4.4861 },
  { nom: "Nîmes", population: 148561, region: "Occitanie", lat: 43.8367, lng: 4.3601 },
  { nom: "Tours", population: 136463, region: "Centre-Val de Loire", lat: 47.2184, lng: 0.7058 },
  { nom: "Limoges", population: 131479, region: "Nouvelle-Aquitaine", lat: 45.8336, lng: 1.2611 },
  { nom: "Clermont-Ferrand", population: 143886, region: "Auvergne-Rhône-Alpes", lat: 45.7772, lng: 3.0870 },
  { nom: "Poitiers", population: 88781, region: "Nouvelle-Aquitaine", lat: 46.5802, lng: 0.3404 },
  { nom: "Perpignan", population: 119656, region: "Occitanie", lat: 42.6887, lng: 2.8948 },
  { nom: "Pau", population: 77200, region: "Nouvelle-Aquitaine", lat: 43.2951, lng: -0.3708 },
  { nom: "Parthenay", population: 10220, region: "Nouvelle-Aquitaine", lat: 46.6489, lng: -0.2478 },
  { nom: "Paray-le-Monial", population: 9250, region: "Bourgogne-Franche-Comté", lat: 46.4547, lng: 4.1189 },
  { nom: "Périgueux", population: 29576, region: "Nouvelle-Aquitaine", lat: 45.1833, lng: 0.7167 },
  { nom: "Pontoise", population: 31100, region: "Île-de-France", lat: 49.0500, lng: 2.1000 },
  { nom: "Pessac", population: 65000, region: "Nouvelle-Aquitaine", lat: 44.8067, lng: -0.6319 },
  { nom: "Pantin", population: 57000, region: "Île-de-France", lat: 48.8964, lng: 2.4094 },
  { nom: "Puteaux", population: 45000, region: "Île-de-France", lat: 48.8833, lng: 2.2333 }
];

// Fonction pour charger toutes les communes depuis la base de données
async function loadAllCitiesFromDatabase() {
  try {
    const { Pool } = require('pg');
    
    const pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'apec_database',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
      ssl: false,
    });

    console.log('🔄 Chargement de toutes les communes françaises depuis la base de données...');
    
    const result = await pool.query(`
      SELECT 
        nom,
        population,
        region,
        lat,
        lng,
        codes_postaux
      FROM cities 
      ORDER BY population DESC NULLS LAST, nom ASC
      LIMIT 50000
    `);
    
    await pool.end();
    
    const cities = result.rows.map(row => ({
      nom: row.nom,
      population: row.population,
      region: row.region,
      lat: row.lat,
      lng: row.lng,
      codesPostaux: row.codes_postaux ? row.codes_postaux.split(',').map(code => code.trim()) : []
    }));
    
    console.log(`✅ ${cities.length} communes chargées depuis la base de données`);
    return cities;
  } catch (error) {
    console.error('❌ Erreur chargement depuis la base de données:', error);
    console.log('🔄 Utilisation des villes principales en fallback');
    return FRENCH_CITIES_API;
  }
}

// Variable globale pour stocker toutes les communes
let ALL_CITIES = null;

// Fonction pour obtenir toutes les communes (avec cache)
async function getAllCities() {
  if (!ALL_CITIES) {
    ALL_CITIES = await loadAllCitiesFromDatabase();
  }
  return ALL_CITIES;
}

// Fonction pour calculer la distance entre deux points (formule de Haversine)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Fonction pour trouver une ville par nom
export async function findCityByName(cityName) {
  const cities = await getAllCities();
  const normalizedCityName = cityName.toLowerCase().trim();
  return cities.find(city => {
    const cityNameLower = city.nom.toLowerCase();
    return cityNameLower === normalizedCityName || 
           cityNameLower.replace(/[^a-z]/g, '') === normalizedCityName.replace(/[^a-z]/g, '');
  });
}

// Fonction pour obtenir les villes dans un rayon donné
export async function getCitiesInRadius(centerCity, radiusKm) {
  if (!centerCity || !centerCity.lat || !centerCity.lng) {
    console.warn('⚠️ Ville centrale invalide pour le calcul de rayon');
    return [];
  }
  
  const cities = await getAllCities();
  const centerLat = centerCity.lat;
  const centerLng = centerCity.lng;
  
  console.log(`🎯 Calcul du rayon: ${radiusKm} km autour de ${centerCity.nom} (${centerLat}, ${centerLng})`);
  
  const citiesInRadius = cities.filter(city => {
    if (!city.lat || !city.lng) return false;
    
    const distance = calculateDistance(centerLat, centerLng, city.lat, city.lng);
    return distance <= radiusKm;
  });
  
  console.log(`✅ ${citiesInRadius.length} villes trouvées dans un rayon de ${radiusKm} km`);
  return citiesInRadius;
}

export { FRENCH_CITIES_API }; 