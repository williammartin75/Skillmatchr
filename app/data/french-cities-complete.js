// Système complet de gestion des 32 000 communes françaises
// Données optimisées pour la recherche hiérarchique

// Structure des données : { nom, population, lat, lng, codesPostaux }
// Les données sont triées par population décroissante pour la hiérarchie

// Import des données depuis la base de données APEC
let FRENCH_CITIES_COMPLETE = [];

// Fonction pour charger les villes depuis la base de données
export async function loadCitiesFromDatabase() {
  try {
    console.log('🔄 Chargement des 32 000 communes françaises...');
    const response = await fetch('/api/cities?limit=50000'); // Augmenter la limite pour récupérer toutes les communes
    const data = await response.json();
    if (data.success) {
      FRENCH_CITIES_COMPLETE = data.cities;
      console.log(`✅ ${FRENCH_CITIES_COMPLETE.length} communes françaises chargées`);
    } else {
      console.warn('⚠️ Erreur API, utilisation du fallback');
      FRENCH_CITIES_COMPLETE = getMainCities();
    }
  } catch (error) {
    console.error('❌ Erreur chargement villes:', error);
    console.log('🔄 Utilisation du fallback vers les villes principales...');
    // Fallback vers les villes principales
    FRENCH_CITIES_COMPLETE = getMainCities();
    console.log(`✅ ${FRENCH_CITIES_COMPLETE.length} villes principales chargées en fallback`);
  }
}

// Villes principales en fallback
function getMainCities() {
  return [
    { nom: "Paris", population: 2161000, lat: 48.8566, lng: 2.3522, codesPostaux: ["75001", "75002", "75003", "75004", "75005", "75006", "75007", "75008", "75009", "75010", "75011", "75012", "75013", "75014", "75015", "75016", "75017", "75018", "75019", "75020"] },
    { nom: "Marseille", population: 861635, lat: 43.2965, lng: 5.3698, codesPostaux: ["13001", "13002", "13003", "13004", "13005", "13006", "13007", "13008", "13009", "13010", "13011", "13012", "13013", "13014", "13015", "13016"] },
    { nom: "Lyon", population: 513275, lat: 45.7578, lng: 4.8320, codesPostaux: ["69001", "69002", "69003", "69004", "69005", "69006", "69007", "69008", "69009"] },
    { nom: "Toulouse", population: 479553, lat: 43.6047, lng: 1.4442, codesPostaux: ["31000", "31100", "31200", "31300", "31400", "31500", "31600", "31700", "31800"] },
    { nom: "Nice", population: 342522, lat: 43.7102, lng: 7.2620, codesPostaux: ["06000", "06100", "06200", "06300"] },
    { nom: "Nantes", population: 314138, lat: 47.2184, lng: -1.5536, codesPostaux: ["44000", "44100", "44200", "44300", "44400"] },
    { nom: "Strasbourg", population: 280966, lat: 48.5734, lng: 7.7521, codesPostaux: ["67000", "67100", "67200", "67300"] },
    { nom: "Montpellier", population: 285121, lat: 43.6108, lng: 3.8767, codesPostaux: ["34000", "34100", "34200", "34300"] },
    { nom: "Bordeaux", population: 254436, lat: 44.8378, lng: -0.5792, codesPostaux: ["33000", "33100", "33200", "33300", "33400", "33500", "33600", "33700", "33800"] },
    { nom: "Lille", population: 232440, lat: 50.6292, lng: 3.0573, codesPostaux: ["59000", "59100", "59200", "59300", "59400", "59500", "59600", "59700", "59800", "59900"] },
    { nom: "Rennes", population: 217728, lat: 48.1173, lng: -1.6778, codesPostaux: ["35000", "35100", "35200", "35300", "35400", "35500", "35600", "35700", "35800"] },
    { nom: "Reims", population: 180752, lat: 49.2583, lng: 4.0317, codesPostaux: ["51000", "51100", "51200", "51300", "51400", "51500", "51600", "51700", "51800", "51900"] },
    { nom: "Saint-Étienne", population: 172565, lat: 45.4397, lng: 4.3872, codesPostaux: ["42000", "42100", "42200", "42300", "42400", "42500", "42600", "42700", "42800", "42900"] },
    { nom: "Toulon", population: 171953, lat: 43.1242, lng: 5.9280, codesPostaux: ["83000", "83100", "83200", "83300", "83400", "83500", "83600", "83700", "83800", "83900"] },
    { nom: "Le Havre", population: 166058, lat: 49.4944, lng: 0.1079, codesPostaux: ["76000", "76100", "76200", "76300", "76400", "76500", "76600", "76700", "76800", "76900"] },
    { nom: "Grenoble", population: 158454, lat: 45.1885, lng: 5.7245, codesPostaux: ["38000", "38100", "38200", "38300", "38400", "38500", "38600", "38700", "38800", "38900"] },
    { nom: "Dijon", population: 156920, lat: 47.3220, lng: 5.0415, codesPostaux: ["21000", "21100", "21200", "21300", "21400", "21500", "21600", "21700", "21800", "21900"] },
    { nom: "Angers", population: 154508, lat: 47.4784, lng: -0.5632, codesPostaux: ["49000", "49100", "49200", "49300", "49400", "49500", "49600", "49700", "49800", "49900"] },
    { nom: "Villeurbanne", population: 150659, lat: 45.7640, lng: 4.8357, codesPostaux: ["69100"] },
    { nom: "Le Mans", population: 143252, lat: 48.0061, lng: 0.1996, codesPostaux: ["72000", "72100", "72200", "72300", "72400", "72500", "72600", "72700", "72800", "72900"] },
    { nom: "Aix-en-Provence", population: 143097, lat: 43.5297, lng: 5.4474, codesPostaux: ["13080", "13090", "13100", "13120", "13121", "13122", "13123", "13124", "13125", "13126", "13127", "13128", "13129"] },
    { nom: "Brest", population: 139619, lat: 48.3904, lng: -4.4861, codesPostaux: ["29200", "29217", "29229", "29238", "29280", "29290"] },
    { nom: "Nîmes", population: 148561, lat: 43.8367, lng: 4.3601, codesPostaux: ["30000", "30100", "30200", "30300", "30400", "30500", "30600", "30700", "30800", "30900"] },
    { nom: "Tours", population: 136463, lat: 47.2184, lng: 0.7058, codesPostaux: ["37000", "37100", "37200", "37300", "37400", "37500", "37600", "37700", "37800", "37900"] },
    { nom: "Limoges", population: 131479, lat: 45.8336, lng: 1.2611, codesPostaux: ["87000", "87100", "87200", "87300", "87400", "87500", "87600", "87700", "87800", "87900"] },
    { nom: "Clermont-Ferrand", population: 143886, lat: 45.7772, lng: 3.0870, codesPostaux: ["63000", "63100", "63200", "63300", "63400", "63500", "63600", "63700", "63800", "63900"] },
    { nom: "Poitiers", population: 88781, lat: 46.5802, lng: 0.3404, codesPostaux: ["86000", "86100", "86200", "86300", "86400", "86500", "86600", "86700", "86800", "86900"] },
    { nom: "Perpignan", population: 119656, lat: 42.6887, lng: 2.8948, codesPostaux: ["66000", "66100", "66200", "66300", "66400", "66500", "66600", "66700", "66800", "66900"] },
    { nom: "Pau", population: 77200, lat: 43.2951, lng: -0.3708, codesPostaux: ["64000", "64100", "64200", "64300", "64400", "64500", "64600", "64700", "64800", "64900"] },
    { nom: "Parthenay", population: 10220, lat: 46.6489, lng: -0.2478, codesPostaux: ["79200"] },
    { nom: "Paray-le-Monial", population: 9250, lat: 46.4547, lng: 4.1189, codesPostaux: ["71600"] },
    { nom: "Périgueux", population: 29576, lat: 45.1833, lng: 0.7167, codesPostaux: ["24000"] },
    { nom: "Pontoise", population: 31100, lat: 49.0500, lng: 2.1000, codesPostaux: ["95300"] },
    { nom: "Pessac", population: 65000, lat: 44.8067, lng: -0.6319, codesPostaux: ["33600"] },
    { nom: "Pantin", population: 57000, lat: 48.8964, lng: 2.4094, codesPostaux: ["93500"] },
    { nom: "Puteaux", population: 45000, lat: 48.8833, lng: 2.2333, codesPostaux: ["92800"] }
  ];
}

// Fonction de recherche hiérarchique optimisée
export function searchCitiesHierarchical(query, limit = 5) {
  if (!query || query.length < 1) return [];
  
  const cities = FRENCH_CITIES_COMPLETE;
  if (cities.length === 0) {
    console.warn('⚠️ Aucune ville chargée, utilisation du fallback');
    FRENCH_CITIES_COMPLETE = getMainCities();
  }
  
  const lowerQuery = query.toLowerCase().trim();
  console.log(`🔍 Recherche "${query}" dans ${cities.length} villes...`);
  
  // Filtrer les villes qui commencent exactement par la requête
  const matchingCities = cities.filter(city => {
    const cityName = city.nom ? city.nom.toLowerCase() : city.name.toLowerCase();
    return cityName.startsWith(lowerQuery);
  });
  
  // Trier par population décroissante et limiter à 5 résultats
  const results = matchingCities
    .sort((a, b) => (b.population || 0) - (a.population || 0))
    .slice(0, limit)
    .map(city => ({
      name: city.nom || city.name,
      population: city.population,
      lat: city.lat,
      lng: city.lng,
      codesPostaux: city.codesPostaux || []
    }));
  
  console.log(`✅ ${results.length} villes trouvées pour "${query}"`);
  return results;
}

// Fonction pour trouver une ville par nom exact
export function findCityByName(cityName) {
  const cities = FRENCH_CITIES_COMPLETE;
  const normalizedCityName = cityName.toLowerCase().trim();
  
  return cities.find(city => {
    const cityNameLower = (city.nom || city.name || '').toLowerCase();
    return cityNameLower === normalizedCityName || 
           cityNameLower.replace(/[^a-z]/g, '') === normalizedCityName.replace(/[^a-z]/g, '');
  });
}

// Fonction pour calculer le rayon de recherche optimal basé sur la population
export function getOptimalRadius(city) {
  if (!city || !city.population) return 20; // Rayon par défaut
  
  const population = city.population;
  
  if (population > 500000) return 50;      // Métropoles
  if (population > 100000) return 30;      // Grandes villes
  if (population > 50000) return 25;       // Villes moyennes
  if (population > 20000) return 20;       // Petites villes
  if (population > 10000) return 15;       // Bourgs
  return 10;                               // Villages
}

// Fonction pour obtenir les villes dans un rayon donné
export function getCitiesInRadius(centerCity, radiusKm) {
  if (!centerCity || !centerCity.lat || !centerCity.lng) {
    console.warn('⚠️ Ville centrale invalide pour le calcul de rayon');
    return [];
  }
  
  const cities = FRENCH_CITIES_COMPLETE;
  if (cities.length === 0) {
    console.warn('⚠️ Aucune ville chargée pour le calcul de rayon');
    return [];
  }
  
  const centerLat = centerCity.lat;
  const centerLng = centerCity.lng;
  
  console.log(`🎯 Calcul du rayon: ${radiusKm} km autour de ${centerCity.name || centerCity.nom} (${centerLat}, ${centerLng})`);
  
  const citiesInRadius = cities.filter(city => {
    if (!city.lat || !city.lng) return false;
    
    const distance = calculateDistance(centerLat, centerLng, city.lat, city.lng);
    return distance <= radiusKm;
  });
  
  console.log(`✅ ${citiesInRadius.length} villes trouvées dans un rayon de ${radiusKm} km`);
  return citiesInRadius.map(city => ({
    name: city.nom || city.name,
    population: city.population,
    lat: city.lat,
    lng: city.lng,
    codesPostaux: city.codesPostaux || []
  }));
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

// Fonction pour vérifier si un nom est une ville française
export function isFrenchCity(cityName) {
  return findCityByName(cityName) !== undefined;
}

// Fonction pour obtenir la catégorie de ville basée sur la population
export function getCityCategory(population) {
  if (population > 500000) return "Métropole";
  if (population > 100000) return "Grande ville";
  if (population > 50000) return "Ville moyenne";
  if (population > 20000) return "Petite ville";
  if (population > 5000) return "Bourg";
  return "Village";
}

// Initialisation au chargement
if (typeof window !== 'undefined') {
  loadCitiesFromDatabase();
}

export { FRENCH_CITIES_COMPLETE }; 