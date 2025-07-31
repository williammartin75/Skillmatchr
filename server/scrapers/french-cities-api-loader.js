const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Chargeur de villes françaises avec coordonnées géographiques
 * Utilise l'API gouvernementale française pour récupérer les données
 */
class FrenchCitiesLoader {
  constructor() {
    this.citiesFilePath = path.join(__dirname, '../data/french-cities-with-coords.json');
    this.apiUrl = 'https://geo.api.gouv.fr/communes';
    this.cities = [];
    this.lastUpdate = null;
  }

  /**
   * Télécharge les données des communes françaises depuis l'API gouvernementale
   */
  async downloadFrenchCities() {
    console.log('🌍 Téléchargement des villes françaises depuis l\'API gouvernementale...');
    
    try {
      const cities = await this.fetchFromAPI();
      console.log(`✅ ${cities.length} villes françaises téléchargées`);
      
      // Créer le dossier data s'il n'existe pas
      const dataDir = path.dirname(this.citiesFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // Sauvegarder les données
      const citiesData = {
        lastUpdate: new Date().toISOString(),
        totalCities: cities.length,
        cities: cities
      };
      
      fs.writeFileSync(this.citiesFilePath, JSON.stringify(citiesData, null, 2));
      console.log(`💾 Données sauvegardées dans ${this.citiesFilePath}`);
      
      this.cities = cities;
      this.lastUpdate = citiesData.lastUpdate;
      
      return cities;
      
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error.message);
      throw error;
    }
  }

  /**
   * Récupère les données depuis l'API gouvernementale
   */
  async fetchFromAPI() {
    return new Promise((resolve, reject) => {
      const url = `${this.apiUrl}?fields=nom,code,codesPostaux,population,centre,contour&format=json&geometry=centre`;
      
      console.log(`🌐 Appel de l'API: ${url}`);
      
      https.get(url, (res) => {
        console.log(`📡 Statut de la réponse: ${res.statusCode}`);
        console.log(`📡 Headers:`, res.headers);
        
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`📦 Données reçues (${data.length} caractères)`);
          console.log(`📦 Premiers caractères: ${data.substring(0, 200)}...`);
          
          try {
            // Vérifier si la réponse est une erreur HTML
            if (data.trim().startsWith('<')) {
              console.error('❌ Réponse HTML reçue au lieu de JSON');
              console.error('📄 Contenu reçu:', data.substring(0, 500));
              reject(new Error('Réponse HTML reçue au lieu de JSON'));
              return;
            }
            
            const cities = JSON.parse(data);
            
            if (!Array.isArray(cities)) {
              console.error('❌ Réponse JSON invalide - pas un tableau');
              console.error('📄 Contenu reçu:', data.substring(0, 500));
              reject(new Error('Réponse JSON invalide - pas un tableau'));
              return;
            }
            
            console.log(`✅ ${cities.length} villes parsées depuis l'API`);
            
            // Transformer les données pour inclure les coordonnées
            const transformedCities = cities.map(city => ({
              nom: city.nom,
              code: city.code,
              codesPostaux: city.codesPostaux || [],
              population: city.population || 0,
              region: this.getRegionFromCode(city.code),
              coordinates: city.centre ? {
                latitude: city.centre.coordinates[1],
                longitude: city.centre.coordinates[0]
              } : null,
              category: this.getCityCategory(city.population)
            }));
            
            resolve(transformedCities);
          } catch (error) {
            console.error('❌ Erreur parsing JSON:', error.message);
            console.error('📄 Contenu reçu:', data.substring(0, 500));
            reject(new Error(`Erreur parsing JSON: ${error.message}`));
          }
        });
      }).on('error', (error) => {
        console.error('❌ Erreur HTTP:', error.message);
        reject(new Error(`Erreur HTTP: ${error.message}`));
      });
    });
  }

  /**
   * Détermine la région à partir du code département
   */
  getRegionFromCode(code) {
    const regionMap = {
      '01': 'Auvergne-Rhône-Alpes', '02': 'Hauts-de-France', '03': 'Auvergne-Rhône-Alpes',
      '04': 'Provence-Alpes-Côte d\'Azur', '05': 'Provence-Alpes-Côte d\'Azur', '06': 'Provence-Alpes-Côte d\'Azur',
      '07': 'Auvergne-Rhône-Alpes', '08': 'Grand Est', '09': 'Occitanie',
      '10': 'Grand Est', '11': 'Occitanie', '12': 'Occitanie',
      '13': 'Provence-Alpes-Côte d\'Azur', '14': 'Normandie', '15': 'Auvergne-Rhône-Alpes',
      '16': 'Nouvelle-Aquitaine', '17': 'Nouvelle-Aquitaine', '18': 'Centre-Val de Loire',
      '19': 'Nouvelle-Aquitaine', '2A': 'Corse', '2B': 'Corse',
      '21': 'Bourgogne-Franche-Comté', '22': 'Bretagne', '23': 'Nouvelle-Aquitaine',
      '24': 'Nouvelle-Aquitaine', '25': 'Bourgogne-Franche-Comté', '26': 'Auvergne-Rhône-Alpes',
      '27': 'Normandie', '28': 'Centre-Val de Loire', '29': 'Bretagne',
      '30': 'Occitanie', '31': 'Occitanie', '32': 'Occitanie',
      '33': 'Nouvelle-Aquitaine', '34': 'Occitanie', '35': 'Bretagne',
      '36': 'Centre-Val de Loire', '37': 'Centre-Val de Loire', '38': 'Auvergne-Rhône-Alpes',
      '39': 'Bourgogne-Franche-Comté', '40': 'Nouvelle-Aquitaine', '41': 'Centre-Val de Loire',
      '42': 'Auvergne-Rhône-Alpes', '43': 'Auvergne-Rhône-Alpes', '44': 'Pays de la Loire',
      '45': 'Centre-Val de Loire', '46': 'Occitanie', '47': 'Nouvelle-Aquitaine',
      '48': 'Occitanie', '49': 'Pays de la Loire', '50': 'Normandie',
      '51': 'Grand Est', '52': 'Grand Est', '53': 'Pays de la Loire',
      '54': 'Grand Est', '55': 'Grand Est', '56': 'Bretagne',
      '57': 'Grand Est', '58': 'Bourgogne-Franche-Comté', '59': 'Hauts-de-France',
      '60': 'Hauts-de-France', '61': 'Normandie', '62': 'Hauts-de-France',
      '63': 'Auvergne-Rhône-Alpes', '64': 'Nouvelle-Aquitaine', '65': 'Occitanie',
      '66': 'Occitanie', '67': 'Grand Est', '68': 'Grand Est',
      '69': 'Auvergne-Rhône-Alpes', '70': 'Bourgogne-Franche-Comté', '71': 'Bourgogne-Franche-Comté',
      '72': 'Pays de la Loire', '73': 'Auvergne-Rhône-Alpes', '74': 'Auvergne-Rhône-Alpes',
      '75': 'Île-de-France', '76': 'Normandie', '77': 'Île-de-France',
      '78': 'Île-de-France', '79': 'Nouvelle-Aquitaine', '80': 'Hauts-de-France',
      '81': 'Occitanie', '82': 'Occitanie', '83': 'Provence-Alpes-Côte d\'Azur',
      '84': 'Provence-Alpes-Côte d\'Azur', '85': 'Pays de la Loire', '86': 'Nouvelle-Aquitaine',
      '87': 'Nouvelle-Aquitaine', '88': 'Grand Est', '89': 'Bourgogne-Franche-Comté',
      '90': 'Bourgogne-Franche-Comté', '91': 'Île-de-France', '92': 'Île-de-France',
      '93': 'Île-de-France', '94': 'Île-de-France', '95': 'Île-de-France',
      '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane',
      '974': 'La Réunion', '976': 'Mayotte'
    };
    
    const deptCode = code.substring(0, 2);
    return regionMap[deptCode] || 'Région non spécifiée';
  }

  /**
   * Détermine la catégorie de ville selon la population
   */
  getCityCategory(population) {
    if (population > 100000) return 'Grande ville';
    if (population > 20000) return 'Ville moyenne';
    if (population > 5000) return 'Petite ville';
    return 'Village';
  }

  /**
   * Charge les villes depuis le fichier local
   */
  loadCitiesFromFile() {
    try {
      if (!fs.existsSync(this.citiesFilePath)) {
        console.log('📁 Fichier de villes non trouvé, téléchargement nécessaire');
        return null;
      }
      
      const data = fs.readFileSync(this.citiesFilePath, 'utf8');
      const citiesData = JSON.parse(data);
      
      this.cities = citiesData.cities;
      this.lastUpdate = citiesData.lastUpdate;
      
      console.log(`✅ ${this.cities.length} villes chargées depuis le fichier local`);
      console.log(`📅 Dernière mise à jour: ${this.lastUpdate}`);
      
      return this.cities;
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement du fichier:', error.message);
      return null;
    }
  }

  /**
   * Charge les villes (depuis le fichier ou télécharge si nécessaire)
   */
  async loadCities() {
    // Essayer de charger depuis le fichier local
    let cities = this.loadCitiesFromFile();
    
    // Si pas de fichier ou données trop anciennes (> 30 jours), télécharger
    if (!cities || this.isDataOutdated()) {
      console.log('🔄 Données obsolètes ou manquantes, téléchargement...');
      cities = await this.downloadFrenchCities();
    }
    
    return cities;
  }

  /**
   * Vérifie si les données sont obsolètes (> 30 jours)
   */
  isDataOutdated() {
    if (!this.lastUpdate) return true;
    
    const lastUpdate = new Date(this.lastUpdate);
    const now = new Date();
    const daysDiff = (now - lastUpdate) / (1000 * 60 * 60 * 24);
    
    return daysDiff > 30;
  }

  /**
   * Recherche une ville par nom (insensible à la casse)
   */
  findCityByName(cityName) {
    if (!this.cities || this.cities.length === 0) {
      console.warn('⚠️ Aucune ville chargée');
      return null;
    }
    
    const normalizedCityName = cityName.toLowerCase().replace(/[^a-z]/g, '');
    
    return this.cities.find(city => {
      const normalizedCity = city.nom.toLowerCase().replace(/[^a-z]/g, '');
      return normalizedCity === normalizedCityName || 
             city.nom.toLowerCase() === cityName.toLowerCase();
    });
  }

  /**
   * Recherche des villes par code postal
   */
  findCitiesByPostalCode(postalCode) {
    if (!this.cities || this.cities.length === 0) {
      return [];
    }
    
    return this.cities.filter(city => 
      city.codesPostaux && city.codesPostaux.includes(postalCode)
    );
  }

  /**
   * Recherche des villes dans un rayon autour d'une ville
   */
  findCitiesNearby(cityName, radiusKm = 50) {
    const targetCity = this.findCityByName(cityName);
    if (!targetCity || !targetCity.coordinates) {
      return [];
    }
    
    const nearbyCities = this.cities.filter(city => {
      if (!city.coordinates) return false;
      
      const distance = this.calculateDistance(
        targetCity.coordinates.latitude, targetCity.coordinates.longitude,
        city.coordinates.latitude, city.coordinates.longitude
      );
      
      return distance <= radiusKm;
    });
    
    return nearbyCities.sort((a, b) => {
      const distA = this.calculateDistance(
        targetCity.coordinates.latitude, targetCity.coordinates.longitude,
        a.coordinates.latitude, a.coordinates.longitude
      );
      const distB = this.calculateDistance(
        targetCity.coordinates.latitude, targetCity.coordinates.longitude,
        b.coordinates.latitude, b.coordinates.longitude
      );
      return distA - distB;
    });
  }

  /**
   * Calcule la distance entre deux points (formule de Haversine)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Convertit les degrés en radians
   */
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  /**
   * Vérifie si un nom est une ville française
   */
  isFrenchCity(cityName) {
    return this.findCityByName(cityName) !== null;
  }

  /**
   * Obtient les statistiques des villes
   */
  getCitiesStats() {
    if (!this.cities || this.cities.length === 0) {
      return null;
    }
    
    const stats = {
      total: this.cities.length,
      withCoordinates: this.cities.filter(c => c.coordinates).length,
      byCategory: {},
      byRegion: {},
      lastUpdate: this.lastUpdate
    };
    
    // Statistiques par catégorie
    this.cities.forEach(city => {
      stats.byCategory[city.category] = (stats.byCategory[city.category] || 0) + 1;
      stats.byRegion[city.region] = (stats.byRegion[city.region] || 0) + 1;
    });
    
    return stats;
  }
}

// Instance singleton
const frenchCitiesLoader = new FrenchCitiesLoader();

// Fonctions d'export pour compatibilité avec l'ancien code
function loadFrenchCities() {
  return frenchCitiesLoader.loadCities();
}

function findCityByName(cityName) {
  return frenchCitiesLoader.findCityByName(cityName);
}

function isFrenchCity(cityName) {
  return frenchCitiesLoader.isFrenchCity(cityName);
}

module.exports = {
  FrenchCitiesLoader,
  frenchCitiesLoader,
  loadFrenchCities,
  findCityByName,
  isFrenchCity
};