import { NextResponse } from 'next/server';

// Cache mémoire pour stocker les liens carrière déjà trouvés
const careerCache = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

// Cache pré-rempli avec les entreprises les plus populaires
const popularCompanies = {
  'TotalEnergies': 'https://careers.totalenergies.com/fr',
  'Orange': 'https://orange.jobs/fr/',
  'EDF': 'https://www.edf.fr/edf-recrute',
  'Engie': 'https://www.engie.com/fr/carrieres',
  'BNP Paribas': 'https://group.bnpparibas/fr/carrieres',
  'LVMH': 'https://www.lvmh.com/carrieres/',
  'Capgemini': 'https://www.capgemini.com/fr-fr/carrieres/',
  'Air Liquide': 'https://www.airliquide.com/fr/carrieres',
  'Vinci': 'https://www.vinci.com/fr/carrieres',
  'Kering': 'https://www.kering.com/fr/carrieres/',
  'Sanofi': 'https://careers.sanofi.com/fr/fr',
  'L\'Oréal': 'https://careers.loreal.com/fr/fr',
  'Danone': 'https://careers.danone.com/fr/fr',
  'Carrefour': 'https://www.carrefour.com/fr/recrutement',
  'Accor': 'https://careers.accor.com/fr/fr',
  'Sodexo': 'https://careers.sodexo.com/fr/fr',
  'Veolia': 'https://www.veolia.com/fr/groupe/recrutement',
  'Schneider Electric': 'https://careers.se.com/fr/fr',
  'Saint-Gobain': 'https://careers.saint-gobain.com/fr/fr',
  'Legrand': 'https://careers.legrand.com/fr/fr',
  'Crédit Agricole': 'https://www.credit-agricole.fr/fr/recrutement.html',
  'Société Générale': 'https://careers.societegenerale.com/fr/fr',
  'Crédit Mutuel': 'https://www.creditmutuel.fr/fr/recrutement.html',
  'Solvay': 'https://careers.solvay.com/fr/fr',
  'Plastic Omnium': 'https://careers.plasticomnium.com/fr/fr',
  'Plastic Omnium Auto Exterior': 'https://careers.plasticomnium.com/fr/fr',
  'Mars France': 'https://careers.mars.com/fr/fr',
  'Gilead France': 'https://careers.gilead.com/fr/fr',
  'Inergy': 'https://careers.inergy.com/fr/fr'
};

// Liste d'user-agents réalistes pour éviter la détection
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];

function getRandomDelay() {
  return Math.floor(Math.random() * 500) + 200; // 200-700ms
}

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

export async function GET(request) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const companyName = searchParams.get('company');

  if (!companyName) {
    return NextResponse.json({ error: "Nom de l'entreprise requis" }, { status: 400 });
  }

  // 1. Si déjà en cache, retourne le lien immédiatement
  if (careerCache[companyName] && (Date.now() - careerCache[companyName].timestamp) < CACHE_DURATION) {
    console.log(`⚡ Cache hit pour ${companyName} (${Date.now() - startTime}ms)`);
    return NextResponse.json({
      company: companyName,
      careerSite: careerCache[companyName].url,
      searchQuery: companyName + " carrières",
      source: "cache"
    });
  }

  // 2. Vérifier le cache pré-rempli
  if (popularCompanies[companyName]) {
    console.log(`🎯 Cache pré-rempli pour ${companyName} (${Date.now() - startTime}ms)`);
    // Mettre en cache pour les prochaines fois
    careerCache[companyName] = {
      url: popularCompanies[companyName],
      timestamp: Date.now()
    };
    return NextResponse.json({
      company: companyName,
      careerSite: popularCompanies[companyName],
      searchQuery: companyName + " carrières",
      source: "pre-filled"
    });
  }

  console.log(`🔍 Recherche Bing pour ${companyName} (pas en cache)...`);
  
  // 3. Sinon, fait une vraie recherche Bing et extrait le premier lien naturel
  try {
    const searchQuery = `${companyName} carrières`;
    const searchUrl = `https://www.bing.fr/search?q=${encodeURIComponent(searchQuery)}`;
    
    const fetchStartTime = Date.now();
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });
    
    console.log(`📡 Bing fetch: ${Date.now() - fetchStartTime}ms`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`🔍 HTML Bing pour ${companyName} (premiers 1000 caractères): ${html.substring(0, 1000)}`);
    
    let careerSite = null;

    // Pattern 1: Liens dans les résultats de recherche Bing (le plus fiable)
    const linkMatch1 = html.match(/<a href="([^"]+)"[^>]*class="[^"]*b_algo[^"]*"[^>]*>/g);
    if (linkMatch1 && linkMatch1.length > 0) {
      const firstLink = linkMatch1[0].match(/href="([^"]+)"/);
      if (firstLink && firstLink[1]) {
        careerSite = firstLink[1];
        console.log(`✅ Lien trouvé (b_algo): ${careerSite}`);
      }
    }

    // Pattern 2: Liens dans les h2 (résultats principaux)
    if (!careerSite) {
      const linkMatch2 = html.match(/<h2[^>]*><a href="([^"]+)"[^>]*>/g);
      if (linkMatch2 && linkMatch2.length > 0) {
        const firstLink = linkMatch2[0].match(/href="([^"]+)"/);
        if (firstLink && firstLink[1]) {
          careerSite = firstLink[1];
          console.log(`✅ Lien trouvé (h2): ${careerSite}`);
        }
      }
    }

    // Pattern 3: Liens dans les résultats de recherche (plus générique)
    if (!careerSite) {
      const linkMatch3 = html.match(/<a href="([^"]+)"[^>]*class="[^"]*b_attribution[^"]*"[^>]*>/g);
      if (linkMatch3 && linkMatch3.length > 0) {
        const firstLink = linkMatch3[0].match(/href="([^"]+)"/);
        if (firstLink && firstLink[1]) {
          careerSite = firstLink[1];
          console.log(`✅ Lien trouvé (b_attribution): ${careerSite}`);
        }
      }
    }

    // Pattern 4: Premier lien externe trouvé (fallback ultime)
    if (!careerSite) {
      const linkMatch4 = html.match(/<a href="(https?:\/\/[^"]+)"[^>]*>/);
      if (linkMatch4 && linkMatch4[1]) {
        careerSite = linkMatch4[1];
        console.log(`✅ Lien trouvé (premier externe): ${careerSite}`);
      }
    }

    if (careerSite) {
      // Nettoyer les liens Bing de redirection
      if (careerSite.startsWith('/')) {
        careerSite = `https://www.bing.fr${careerSite}`;
      }
      if (careerSite.includes('bing.fr/ck/')) {
        const urlMatch = careerSite.match(/&u=([^&]*)/);
        if (urlMatch && urlMatch[1]) {
          careerSite = decodeURIComponent(urlMatch[1]);
        }
      }
      
      // Validation : vérifier que le lien correspond à l'entreprise recherchée
      const companyNameLower = companyName.toLowerCase();
      const careerSiteLower = careerSite.toLowerCase();
      
      // Liste des mots-clés pour identifier les sites de carrières
      const careerKeywords = ['career', 'carriere', 'recrutement', 'emploi', 'job', 'travail', 'rh', 'hr', 'talent'];
      const hasCareerKeyword = careerKeywords.some(keyword => careerSiteLower.includes(keyword));
      
      // Liste des mots-clés à éviter (sites non-carrières)
      const avoidKeywords = ['beurs', 'bourse', 'stock', 'finance', 'invest', 'trading', 'news', 'actualite', 'article', 'blog', 'forum', 'wikipedia', 'youtube', 'facebook', 'twitter', 'linkedin'];
      const hasAvoidKeyword = avoidKeywords.some(keyword => careerSiteLower.includes(keyword));
      
      // Vérifier si le nom de l'entreprise est dans l'URL
      const companyWords = companyNameLower.split(/\s+/).filter(word => word.length > 2);
      const hasCompanyName = companyWords.some(word => careerSiteLower.includes(word));
      
      // Si le lien contient des mots-clés à éviter, on le rejette
      if (hasAvoidKeyword) {
        console.log(`❌ Lien rejeté pour ${companyName}: ${careerSite} (contient des mots-clés à éviter)`);
        careerSite = null;
      }
      // Si le lien ne correspond pas à l'entreprise ET n'est pas un site de carrières, on le rejette
      else if (!hasCompanyName && !hasCareerKeyword) {
        console.log(`❌ Lien rejeté pour ${companyName}: ${careerSite} (ne correspond pas à l'entreprise)`);
        careerSite = null;
      }
      
      // Mémorise le lien pour les prochaines fois
      if (careerSite) {
        careerCache[companyName] = {
          url: careerSite,
          timestamp: Date.now()
        };
        console.log(`🎯 Lien final pour ${companyName}: ${careerSite}`);
        console.log(`⏱️ Temps total: ${Date.now() - startTime}ms`);
        return NextResponse.json({
          company: companyName,
          careerSite,
          searchQuery,
          source: "bing-auto"
        });
      }
    }

    console.log(`❌ Aucun lien trouvé pour ${companyName}`);
    // Fallback : retourne la page de recherche Bing
    console.log(`🔄 Fallback Bing pour ${companyName}: ${searchUrl}`);
    return NextResponse.json({
      company: companyName,
      careerSite: searchUrl,
      searchQuery,
      source: "bing-fallback"
    });
  } catch (error) {
    // Fallback en cas d'erreur
    const searchQuery = `${companyName} carrières`;
    const searchUrl = `https://www.bing.fr/search?q=${encodeURIComponent(searchQuery)}`;
    return NextResponse.json({
      company: companyName,
      careerSite: searchUrl,
      searchQuery,
      source: "bing-error",
      error: error.message
    });
  }
} 