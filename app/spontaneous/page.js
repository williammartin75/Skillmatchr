"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { top100Companies, getAllSectors, getCompaniesBySector, searchCompaniesByName } from '../data/top-100-companies';


const revenueRanges = [
  { label: "Tous", value: "" },
  { label: "< 10 M€", value: "lt10M" },
  { label: "10 à 50 M€", value: "10to50M" },
  { label: "50 à 200 M€", value: "50to200M" },
  { label: "200 à 500 M€", value: "200to500M" },
  { label: "500 M€ à 1 Md€", value: "500to1000M" },
  { label: "1 à 10 Md€", value: "1to10B" },
  { label: "> 10 Md€", value: "gt10B" }
];

const nafCodes = [
  { label: "Tous les secteurs", value: "" },
  { label: "Agriculture, sylviculture et pêche", value: "A" },
  { label: "Industries extractives", value: "B" },
  { label: "Industrie manufacturière", value: "C" },
  { label: "Production et distribution d'électricité", value: "D" },
  { label: "Production et distribution d'eau", value: "E" },
  { label: "Construction", value: "F" },
  { label: "Commerce et réparation d'automobiles", value: "G" },
  { label: "Transports et entreposage", value: "H" },
  { label: "Hébergement et restauration", value: "I" },
  { label: "Information et communication", value: "J" },
  { label: "Activités financières et d'assurance", value: "K" },
  { label: "Activités immobilières", value: "L" },
  { label: "Activités spécialisées, scientifiques", value: "M" },
  { label: "Activités de services administratifs", value: "N" },
  { label: "Administration publique", value: "O" },
  { label: "Enseignement", value: "P" },
  { label: "Santé humaine et action sociale", value: "Q" },
  { label: "Arts, spectacles et activités récréatives", value: "R" },
  { label: "Autres activités de services", value: "S" },
  { label: "Activités des ménages", value: "T" },
  { label: "Activités extra-territoriales", value: "U" }
];

export default function Spontaneous() {
  // Styles pour masquer la scrollbar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-hide {
        -ms-overflow-style: none;  /* Internet Explorer 10+ */
        scrollbar-width: none;  /* Firefox */
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;  /* Safari and Chrome */
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState([]);
  const [myList, setMyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [debugInfo, setDebugInfo] = useState({
    lastUrl: "",
    lastResponse: null,
    lastError: null,
    requestCount: 0
  });
  
  const [filters, setFilters] = useState({
    nafCode: "",
    revenue: "",
    employeeCount: "",
    location: ""
  });

  const [showTop100, setShowTop100] = useState(true);
  const [top100Filter, setTop100Filter] = useState("");
  
  // États pour les entreprises depuis les jobs (intégrées dans le bloc de gauche)
  const [companiesFromJobs, setCompaniesFromJobs] = useState([]);
  const [loadingCompaniesFromJobs, setLoadingCompaniesFromJobs] = useState(false);
  const [showCompaniesFromJobs, setShowCompaniesFromJobs] = useState(false);
  const [selectedSectorFromJobs, setSelectedSectorFromJobs] = useState('Tous les secteurs');
  const [filteredCompaniesFromJobs, setFilteredCompaniesFromJobs] = useState([]);
  const [availableSectors, setAvailableSectors] = useState([]);
  
  // États spécifiques pour le bloc Top 100 (restaurés du backup)
  const [selectedSector, setSelectedSector] = useState("Tous");
  const [filteredTopCompanies, setFilteredTopCompanies] = useState([]);
  const [searchTopQuery, setSearchTopQuery] = useState("");
  const [displayedTopCompanies, setDisplayedTopCompanies] = useState(20);
  const [loadingMoreTopCompanies, setLoadingMoreTopCompanies] = useState(false);
  const [allSectors, setAllSectors] = useState(() => getAllSectors());

  // Initialiser les entreprises Top 100 de manière différée
  useEffect(() => {
    const initializeTopCompanies = () => {
      // Enlever les doublons basés sur le nom de l'entreprise
      const uniqueCompanies = [];
      const seenNames = new Set();
      top100Companies.forEach(company => {
        if (!seenNames.has(company.name.toLowerCase())) {
          seenNames.add(company.name.toLowerCase());
          uniqueCompanies.push(company);
        }
      });
      setFilteredTopCompanies(uniqueCompanies);
    };

    // Initialiser après un court délai pour ne pas bloquer le rendu initial
    const timeoutId = setTimeout(initializeTopCompanies, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  // Charger la liste d'entreprises depuis localStorage au montage du composant
  useEffect(() => {
    const savedList = localStorage.getItem('spontaneousCompaniesList');
    if (savedList) {
      try {
        const parsedList = JSON.parse(savedList);
        setMyList(parsedList);
        console.log("📋 Liste d'entreprises restaurée:", parsedList.length, "entreprises");
      } catch (err) {
        console.error("❌ Erreur lors du chargement de la liste:", err);
      }
    }
  }, []);

  // Charger automatiquement les entreprises validées au démarrage
  useEffect(() => {
    loadCompaniesFromJobs();
  }, []);

  // Sauvegarder la liste d'entreprises dans localStorage à chaque modification (avec debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('spontaneousCompaniesList', JSON.stringify(myList));
      console.log("💾 Liste d'entreprises sauvegardée:", myList.length, "entreprises");
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [myList]);

  // Scroll infini automatique pour le bloc Top 100 (avec throttling)
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
          if (scrollTop + clientHeight >= scrollHeight - 100) {
            // L'utilisateur est proche du bas, charger plus d'entreprises
            if (displayedTopCompanies < filteredTopCompanies.length && !loadingMoreTopCompanies) {
              setLoadingMoreTopCompanies(true);
              setTimeout(() => {
                setDisplayedTopCompanies(prev => Math.min(prev + 10, filteredTopCompanies.length));
                setLoadingMoreTopCompanies(false);
              }, 300);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayedTopCompanies, filteredTopCompanies.length, loadingMoreTopCompanies]);



  // Fonction pour formater la taille d'entreprise
  const formatCompanySize = (sizeCode) => {
    const sizeMap = {
      "NN": "Non renseigné", "00": "0 salarié", "01": "1 ou 2 salariés",
      "02": "3 à 5 salariés", "03": "6 à 9 salariés", "11": "10 à 19 salariés",
      "12": "20 à 49 salariés", "21": "50 à 99 salariés", "22": "100 à 199 salariés",
      "31": "200 à 249 salariés", "32": "250 à 499 salariés", "41": "500 à 999 salariés",
      "42": "1000 à 1999 salariés", "51": "2000 à 4999 salariés", "52": "5000 à 9999 salariés",
      "53": "10000+ salariés"
    };
    return sizeMap[sizeCode] || sizeCode || "Taille non disponible";
  };

  // Fonction pour formater le secteur d'activité
  const formatActivitySector = (activityCode) => {
    const sectorMap = {
      "A": "Agriculture, sylviculture et pêche", "B": "Industries extractives",
      "C": "Industrie manufacturière", "D": "Production et distribution d'électricité",
      "E": "Production et distribution d'eau", "F": "Construction",
      "G": "Commerce ; réparation d'automobiles", "H": "Transports et entreposage",
      "I": "Hébergement et restauration", "J": "Information et communication",
      "K": "Activités financières et d'assurance", "L": "Activités immobilières",
      "M": "Activités spécialisées, scientifiques", "N": "Activités de services administratifs",
      "O": "Administration publique", "P": "Enseignement",
      "Q": "Santé humaine et action sociale", "R": "Arts, spectacles et activités récréatives",
      "S": "Autres activités de services", "T": "Activités des ménages",
      "U": "Activités extra-territoriales"
    };
    return sectorMap[activityCode] || activityCode || "Secteur non disponible";
  };

  // Fonction pour formater le chiffre d'affaires
  const formatRevenue = (revenue) => {
    // Si c'est une valeur numérique (nouvelle API)
    if (typeof revenue === 'number') {
      if (revenue >= 1000000000) {
        return `${(revenue / 1000000000).toFixed(1)} Md€`;
      } else if (revenue >= 1000000) {
        return `${(revenue / 1000000).toFixed(1)} M€`;
      } else if (revenue >= 1000) {
        return `${(revenue / 1000).toFixed(0)} k€`;
      } else {
        return `${revenue} €`;
      }
    }
    
    // Si c'est un code (ancienne API)
    const revenueMap = {
      "1": "0 - 100k €", "2": "100k - 500k €", "3": "500k - 1M €",
      "4": "1M - 5M €", "5": "5M - 10M €", "6": "10M - 50M €", "7": "50M+ €"
    };
    return revenueMap[revenue] || revenue || "CA non disponible";
  };

  // Fonction pour filtrer les entreprises par secteur
  const filterCompaniesBySector = (sector) => {
    setSelectedSectorFromJobs(sector);
    if (sector === 'Tous les secteurs') {
      setFilteredCompaniesFromJobs(companiesFromJobs);
    } else {
      const filtered = companiesFromJobs.filter(company => company.sector === sector);
      setFilteredCompaniesFromJobs(filtered);
    }
  };

  // Fonction pour charger les entreprises validées depuis la base companies
  const loadCompaniesFromJobs = async (searchQuery = '') => {
    console.log("🏢 Chargement des entreprises validées depuis la base companies...");
    
    setLoadingCompaniesFromJobs(true);
    
    try {
      const url = `/api/companies?limit=1000${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("📊 Entreprises validées:", data);
      
      // Les entreprises sont déjà uniques dans la base companies
      const companies = data.companies || [];
      const sectors = data.sectors || [];
      
      console.log(`✅ ${companies.length} entreprises validées chargées`);
      console.log(`🎯 ${sectors.length} secteurs disponibles`);
      
      setCompaniesFromJobs(companies);
      setFilteredCompaniesFromJobs(companies);
      setAvailableSectors(sectors);
      setShowCompaniesFromJobs(true);
      
    } catch (error) {
      console.error("❌ Erreur lors du chargement des entreprises validées:", error);
      setCompaniesFromJobs([]);
    } finally {
      setLoadingCompaniesFromJobs(false);
    }
  };

  // Fonction de recherche d'entreprises
  const searchCompanies = async () => {
    console.log("🔍 Début de la recherche avec:", { searchQuery, filters });
    
    const hasSearchQuery = searchQuery.trim() !== "";
    const hasNafFilter = filters.nafCode && filters.nafCode !== "";
    const hasOtherFilters = filters.employeeCount || filters.location || filters.revenue;
    
    console.log("🔍 Validation des filtres:", { hasSearchQuery, hasNafFilter, hasOtherFilters });
    
    // Permettre la recherche par code NAF seul
    if (!hasSearchQuery && !hasNafFilter && !hasOtherFilters) {
      setError("Veuillez saisir un nom d'entreprise OU sélectionner un code NAF OU utiliser d'autres filtres");
      return;
    }

    setLoading(true);
    setError("");
    setPage(1);
    setHasMore(true);

    try {
      let url = "https://recherche-entreprises.api.gouv.fr/search?per_page=25&page=1";
      
      // Si on a un nom d'entreprise, l'utiliser
      if (hasSearchQuery) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      } 
      // Sinon, si on a un code NAF, chercher des entreprises dans ce secteur
      else if (hasNafFilter) {
        url += `&q=entreprise`;
        url += `&section_activite_principale=${filters.nafCode}`;
      }
      // Sinon, chercher toutes les entreprises
      else {
        url += `&q=entreprise`;
      }
      
      // Ajouter le filtre de code NAF seulement si on a un nom d'entreprise ET un code NAF
      if (hasNafFilter && hasSearchQuery) {
        url += `&section_activite_principale=${filters.nafCode}`;
      }
      if (filters.employeeCount && filters.employeeCount !== "" && filters.employeeCount !== "Tous") {
        url += `&tranche_effectif_salarie=${filters.employeeCount}`;
      }
      // Note: L'API ne supporte pas le filtrage par localisation
      // Le filtrage se fera côté client après récupération des données
      // Note: L'API data.gouv.fr ne supporte pas le filtrage par chiffre d'affaires
      // Le filtrage se fera côté client après récupération des données

      console.log("🔍 URL de recherche construite:", url);
      
            const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes de timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; SkillMatchr/1.0)'
        }
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📊 Réponse API page 1:", data);
      
      // Afficher immédiatement les 20 premières entreprises
      let allResults = [...data.results];
      let currentPage = 2;
      const maxPages = 1000; // Récupérer jusqu'à 1000 pages (25000 entreprises max)
      const batchSize = 10; // Récupérer 10 pages en parallèle
      
      // Traiter et afficher les 20 premières entreprises immédiatement
      if (allResults.length > 0) {
        let initialCompanies = allResults.slice(0, 20).map((company, index) => ({
          id: index + 1,
          name: company.nom_raison_sociale || "Nom non disponible",
          siret: company.siret || "N/A",
          siren: company.siren || "N/A",
          address: company.siege?.adresse || "Adresse non disponible",
          city: company.siege?.libelle_commune || "Ville non disponible",
          postalCode: company.siege?.code_postal || "N/A",
          activity: company.section_activite_principale || "Activité non disponible",
          size: formatCompanySize(company.tranche_effectif_salarie),
          revenue: company.finances?.["2024"]?.ca || company.finances?.["2023"]?.ca || company.finances?.["2022"]?.ca || "Non disponible",
          website: company.site_web || null,
          status: "Non ajouté",
          officialUrl: company.siren ? `https://annuaire-entreprises.data.gouv.fr/entreprise/${company.siren}` : null,
          financialUrl: company.siren ? `https://annuaire-entreprises.data.gouv.fr/donnees-financieres/${company.siren}` : null
        }));
        
        // Appliquer les filtres côté client sur les 20 premières entreprises
        if (filters.revenue && filters.revenue !== "") {
          initialCompanies = initialCompanies.filter(company => {
            const rev = Number(company.revenue);
            if (isNaN(rev)) return false;
            switch (filters.revenue) {
              case "lt10M": return rev < 10000000;
              case "10to50M": return rev >= 10000000 && rev < 50000000;
              case "50to200M": return rev >= 50000000 && rev < 200000000;
              case "200to500M": return rev >= 200000000 && rev < 500000000;
              case "500to1000M": return rev >= 500000000 && rev < 1000000000;
              case "1to10B": return rev >= 1000000000 && rev < 10000000000;
              case "gt10B": return rev >= 10000000000;
              default: return true;
            }
          });
        }
        
        if (filters.location && filters.location.trim() !== "") {
          const locationQuery = filters.location.toLowerCase().trim();
          initialCompanies = initialCompanies.filter(company => {
            const city = company.city?.toLowerCase() || "";
            const postalCode = company.postalCode?.toLowerCase() || "";
            const address = company.address?.toLowerCase() || "";
            return city.includes(locationQuery) || 
                   postalCode.includes(locationQuery) || 
                   address.includes(locationQuery);
          });
        }
        
        setCompanies(initialCompanies);
        setLoading(false);
        setError(`Affichage des 20 premières entreprises... Chargement des autres en cours...`);
      }
      
      // Continuer à charger les autres pages en arrière-plan
      setLoading(true);
      setError("Chargement des autres entreprises en arrière-plan...");
      
      // Fonction pour mettre à jour le message de progression
      const updateProgress = (current, total, companiesFound) => {
        const progress = Math.round((current / total) * 100);
        setError(`Chargement en arrière-plan... ${progress}% (${companiesFound} entreprises trouvées)`);
      };
      
      while (currentPage <= maxPages) {
        try {
          // Créer un batch de pages à récupérer en parallèle
          const pagePromises = [];
          const pagesToFetch = Math.min(batchSize, maxPages - currentPage + 1);
          
          for (let i = 0; i < pagesToFetch; i++) {
            const pageNum = currentPage + i;
            const nextPageUrl = url.replace('page=1', `page=${pageNum}`);
            console.log(`🔍 Préparation page ${pageNum}:`, nextPageUrl);
            
            pagePromises.push(
              (async () => {
                const pageController = new AbortController();
                const pageTimeoutId = setTimeout(() => pageController.abort(), 30000);
                
                try {
                  const pageResponse = await fetch(nextPageUrl, {
                    signal: pageController.signal,
                    headers: {
                      'Accept': 'application/json',
                      'User-Agent': 'Mozilla/5.0 (compatible; SkillMatchr/1.0)'
                    }
                  });
                  clearTimeout(pageTimeoutId);
                  
                  if (pageResponse.ok) {
                    return await pageResponse.json();
                  } else {
                    console.log(`❌ Erreur HTTP page ${pageNum}: ${pageResponse.status}`);
                    return null;
                  }
                } catch (err) {
                  clearTimeout(pageTimeoutId);
                  console.log(`❌ Erreur page ${pageNum}:`, err.message);
                  return null;
                }
              })()
            );
          }
          
          // Récupérer toutes les pages du batch en parallèle
          console.log(`🚀 Récupération parallèle de ${pagesToFetch} pages (${currentPage} à ${currentPage + pagesToFetch - 1})`);
          updateProgress(currentPage, maxPages, allResults.length);
          const batchResults = await Promise.all(pagePromises);
          
          // Traiter les résultats du batch
          let hasMoreResults = false;
          for (let i = 0; i < batchResults.length; i++) {
            const nextData = batchResults[i];
            if (nextData && nextData.results && nextData.results.length > 0) {
              allResults = [...allResults, ...nextData.results];
              hasMoreResults = true;
              console.log(`✅ Page ${currentPage + i} récupérée: ${nextData.results.length} entreprises (Total: ${allResults.length})`);
            } else {
              console.log(`🏁 Fin des résultats à la page ${currentPage + i - 1}`);
              break;
            }
          }
          
          if (!hasMoreResults) {
            break; // Plus de résultats
          }
          
          currentPage += pagesToFetch;
        } catch (err) {
          console.log(`❌ Erreur batch pages ${currentPage}-${currentPage + batchSize - 1}:`, err);
          break;
        }
      }
      
      console.log(`📊 Total des résultats: ${allResults.length} entreprises`);
      
      if (allResults.length > 0) {
        let formattedCompanies = allResults.map((company, index) => ({
          id: index + 1,
          name: company.nom_raison_sociale || "Nom non disponible",
          siret: company.siret || "N/A",
          siren: company.siren || "N/A",
          address: company.siege?.adresse || "Adresse non disponible",
          city: company.siege?.libelle_commune || "Ville non disponible",
          postalCode: company.siege?.code_postal || "N/A",
          activity: company.section_activite_principale || "Activité non disponible",
          size: formatCompanySize(company.tranche_effectif_salarie),
          revenue: company.finances?.["2024"]?.ca || company.finances?.["2023"]?.ca || company.finances?.["2022"]?.ca || "Non disponible",
          website: company.site_web || null,
          status: "Non ajouté",
          officialUrl: company.siren ? `https://annuaire-entreprises.data.gouv.fr/entreprise/${company.siren}` : null,
          financialUrl: company.siren ? `https://annuaire-entreprises.data.gouv.fr/donnees-financieres/${company.siren}` : null
        }));
        
        // Filtrage côté client pour le chiffre d'affaires
        const companiesWithRevenue = formattedCompanies.filter(company => 
          typeof company.revenue === 'number' && !isNaN(company.revenue)
        );
        
        if (filters.revenue && filters.revenue !== "") {
          formattedCompanies = formattedCompanies.filter(company => {
            const rev = Number(company.revenue);
            if (isNaN(rev)) return false; // Exclure les entreprises sans CA
            
            switch (filters.revenue) {
              case "lt10M": return rev < 10000000;
              case "10to50M": return rev >= 10000000 && rev < 50000000;
              case "50to200M": return rev >= 50000000 && rev < 200000000;
              case "200to500M": return rev >= 200000000 && rev < 500000000;
              case "500to1000M": return rev >= 500000000 && rev < 1000000000;
              case "1to10B": return rev >= 1000000000 && rev < 10000000000;
              case "gt10B": return rev >= 10000000000;
              default: return true;
            }
          });
          
          // Afficher un message informatif si peu d'entreprises ont des données financières
          if (companiesWithRevenue.length > 0 && formattedCompanies.length === 0) {
            setError(`Aucune entreprise trouvée dans cette tranche de CA. ${companiesWithRevenue.length} entreprises ont des données financières disponibles.`);
          } else if (companiesWithRevenue.length === 0) {
            setError("Aucune entreprise avec des données financières trouvée. Le filtre CA ne peut pas être appliqué.");
          }
        }
        
        // Filtrage côté client pour la localisation
        if (filters.location && filters.location.trim() !== "") {
          const locationQuery = filters.location.toLowerCase().trim();
          const originalCount = formattedCompanies.length;
          
          formattedCompanies = formattedCompanies.filter(company => {
            // Vérifier dans la ville, le code postal, et l'adresse
            const city = company.city?.toLowerCase() || "";
            const postalCode = company.postalCode?.toLowerCase() || "";
            const address = company.address?.toLowerCase() || "";
            
            return city.includes(locationQuery) || 
                   postalCode.includes(locationQuery) || 
                   address.includes(locationQuery);
          });
          
          // Afficher un message informatif si le filtrage réduit significativement les résultats
          if (originalCount > 0 && formattedCompanies.length === 0) {
            setError(`Aucune entreprise trouvée dans cette localisation. ${originalCount} entreprises trouvées avant filtrage.`);
          } else if (formattedCompanies.length < originalCount) {
            setError(`${formattedCompanies.length} entreprises trouvées dans "${filters.location}" (sur ${originalCount} total)`);
          }
        }
        
        // Mettre à jour la liste complète avec toutes les entreprises
        setCompanies(formattedCompanies);
        setPage(1);
        setHasMore(false); // Toutes les pages ont été récupérées
        
        // Message de succès final
        const totalFound = allResults.length;
        const finalCount = formattedCompanies.length;
        const pagesRecovered = currentPage - 1;
        
        if (totalFound === finalCount) {
          setError(`✅ ${finalCount} entreprises trouvées au total (${pagesRecovered} pages récupérées)`);
        } else {
          setError(`✅ ${finalCount} entreprises trouvées après filtrage (sur ${totalFound} total, ${pagesRecovered} pages récupérées)`);
        }
        
        // Mettre à jour les infos de debug
        setDebugInfo(prev => ({
          ...prev,
          lastUrl: url,
          lastResponse: data,
          lastError: null,
          requestCount: prev.requestCount + 1
        }));
      } else {
        setCompanies([]);
        setError("Aucune entreprise trouvée avec ces critères. Essayez de modifier vos filtres.");
        setHasMore(false);
      }
    } catch (err) {
      console.error("❌ Erreur de recherche:", err);
      console.error("❌ Détails de l'erreur:", {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      // Messages d'erreur plus spécifiques selon le type d'erreur
      let errorMessage = "Erreur lors de la recherche. Veuillez réessayer.";
      
      if (err.name === 'AbortError') {
        errorMessage = "La recherche a pris trop de temps. Veuillez réessayer.";
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = "Impossible de contacter l'API. Vérifiez votre connexion internet et réessayez.";
      } else if (err.message.includes('HTTP')) {
        errorMessage = `Erreur serveur: ${err.message}. Veuillez réessayer plus tard.`;
      }
      
      setError(errorMessage);
      setCompanies([]);
      setHasMore(false);
      
      // Mettre à jour les infos de debug avec l'erreur
      setDebugInfo(prev => ({
        ...prev,
        lastError: {
          message: err.message,
          stack: err.stack,
          name: err.name
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  // Fonctions spécifiques pour le bloc Top 100 (restaurées du backup)
  const filterTopCompaniesBySector = useCallback((sector) => {
    setSelectedSector(sector);
    let filteredCompanies;
    if (sector === "Tous") {
      filteredCompanies = top100Companies;
    } else {
      filteredCompanies = top100Companies.filter(company => company.sector === sector);
    }
    
    // Enlever les doublons basés sur le nom de l'entreprise
    const uniqueCompanies = [];
    const seenNames = new Set();
    filteredCompanies.forEach(company => {
      if (!seenNames.has(company.name.toLowerCase())) {
        seenNames.add(company.name.toLowerCase());
        uniqueCompanies.push(company);
      }
    });
    
    setFilteredTopCompanies(uniqueCompanies);
    setDisplayedTopCompanies(20);
  }, []);

  const searchTopCompanies = useCallback((query) => {
    setSearchTopQuery(query);
    let filteredCompanies;
    if (query.trim() === "") {
      if (selectedSector === "Tous") {
        filteredCompanies = top100Companies;
      } else {
        filteredCompanies = top100Companies.filter(company => company.sector === selectedSector);
      }
    } else {
      filteredCompanies = top100Companies.filter(company => 
        company.name.toLowerCase().includes(query.toLowerCase()) ||
        company.description.toLowerCase().includes(query.toLowerCase())
      );
    }
   
    // Enlever les doublons basés sur le nom de l'entreprise
    const uniqueCompanies = [];
    const seenNames = new Set();
    filteredCompanies.forEach(company => {
      if (!seenNames.has(company.name.toLowerCase())) {
        seenNames.add(company.name.toLowerCase());
        uniqueCompanies.push(company);
      }
    });
    
    setFilteredTopCompanies(uniqueCompanies);
    setDisplayedTopCompanies(20);
  }, [selectedSector]);

  const loadMoreTopCompanies = () => {
    if (displayedTopCompanies < filteredTopCompanies.length) {
      setDisplayedTopCompanies(prev => Math.min(prev + 10, filteredTopCompanies.length));
    }
  };

  // Fonction pour ajouter/retirer de ma liste
  const toggleMyList = useCallback((company, source = 'api') => {
    const companyId = company.siret !== "N/A" ? company.siret : `${company.name}-${company.city}`;
    const isInList = myList.some(item => {
      const itemId = item.siret !== "N/A" ? item.siret : `${item.name}-${item.city}`;
      return itemId === companyId;
    });
    
    if (isInList) {
      const newList = myList.filter(item => {
        const itemId = item.siret !== "N/A" ? item.siret : `${item.name}-${item.city}`;
        return itemId !== companyId;
      });
      setMyList(newList);
      localStorage.setItem('myCompanyList', JSON.stringify(newList));
    } else {
      const newCompany = {
        ...company,
        source: source,
        addedAt: new Date().toISOString()
      };
      const newList = [...myList, newCompany];
      setMyList(newList);
      localStorage.setItem('myCompanyList', JSON.stringify(newList));
    }
  }, [myList]);

  // Fonction pour supprimer une entreprise de la liste des jobs
  const removeCompanyFromJobs = useCallback((companyName) => {
    setCompaniesFromJobs(prev => prev.filter(company => company.name !== companyName));
    setFilteredCompaniesFromJobs(prev => prev.filter(company => company.name !== companyName));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">


      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Candidatures spontanées</h1>
            <p className="text-gray-600 mt-2">Recherchez des entreprises via l'API officielle et ajoutez-les à votre liste</p>
          </div>

          {/* Panel de Debug */}
          {debugInfo.requestCount > 0 && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Panel de Debug</h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <p><strong>Dernière URL:</strong> {debugInfo.lastUrl}</p>
                <p><strong>Nombre de requêtes:</strong> {debugInfo.requestCount}</p>
                {debugInfo.lastError && (
                  <p><strong>Dernière erreur:</strong> {debugInfo.lastError.message}</p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne de gauche - Bloc des 100 entreprises (version restaurée) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  {showCompaniesFromJobs ? `${filteredCompaniesFromJobs.length} Entreprises validées` : `${filteredTopCompanies.length} Entreprises`}
                </h3>
                
                {/* Vignettes de filtrage par secteur */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Filtrer par secteur</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => {
                        if (showCompaniesFromJobs) {
                          filterCompaniesBySector('Tous les secteurs');
                        } else {
                          filterTopCompaniesBySector("Tous");
                        }
                      }}
                      className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                        (showCompaniesFromJobs && selectedSectorFromJobs === 'Tous les secteurs') || (!showCompaniesFromJobs && selectedSector === "Tous")
                          ? "bg-indigo-600 text-white" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Tous
                    </button>
                    {showCompaniesFromJobs ? availableSectors.map((sector) => (
                      <button 
                        key={sector.name}
                        onClick={() => filterCompaniesBySector(sector.name)}
                        className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                          selectedSectorFromJobs === sector.name 
                            ? "bg-indigo-600 text-white" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {sector.name} ({sector.count})
                      </button>
                    )) : getAllSectors().slice(0, 8).map((sector) => (
                      <button 
                        key={sector}
                        onClick={() => filterTopCompaniesBySector(sector)}
                        className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                          selectedSector === sector 
                            ? "bg-indigo-600 text-white" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Barre de recherche */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={searchTopQuery}
                    onChange={(e) => searchTopCompanies(e.target.value)}
                    placeholder="Rechercher une entreprise..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>





                {/* Liste des entreprises avec scroll infini automatique */}
                <div className="space-y-3 overflow-y-auto top100-scroll-container scrollbar-hide">
                  {/* Entreprises depuis les jobs */}
                  {showCompaniesFromJobs && filteredCompaniesFromJobs.map((company, index) => (
                    <div key={`jobs-${index}`} className="border border-green-200 rounded-lg p-3 bg-green-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{company.name}</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {company.sector}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{company.description}</p>
                      <div className="flex space-x-2">
                        <button 
                          onClick={async () => {
                            const searchQuery = `${company.name} carrières`;
                            window.open(`https://www.bing.fr/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                          }}
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition-colors"
                        >
                          Postuler
                        </button>
                        <button 
                          onClick={() => toggleMyList(company, 'jobs')}
                          className={`px-3 py-1 rounded text-xs transition-colors ${
                            myList.some(item => item.name === company.name)
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {myList.some(item => item.name === company.name) ? "Retirer" : "Ajouter"}
                        </button>
                        <button 
                          onClick={() => removeCompanyFromJobs(company.name)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                          title="Supprimer de la liste"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Entreprises Top 100 */}
                  {filteredTopCompanies.slice(0, displayedTopCompanies).map((company, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{company.name}</h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {company.sector}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{company.description}</p>
                      <div className="flex space-x-2">
                        <button 
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/companies/careers?company=${encodeURIComponent(company.name)}`);
                              const data = await response.json();
                              window.open(data.careerSite, '_blank');
                            } catch (error) {
                              console.error('Erreur lors de la recherche du site de carrières:', error);
                              // Fallback en cas d'erreur
                              const searchQuery = `${company.name} carrières`;
                              window.open(`https://www.bing.fr/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                            }
                          }}
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition-colors"
                        >
                          Postuler
                        </button>
                        <button 
                          onClick={() => toggleMyList(company, 'top100')}
                          className={`px-3 py-1 rounded text-xs transition-colors ${
                            myList.some(item => item.name === company.name)
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {myList.some(item => item.name === company.name) ? "Retirer" : "Ajouter"}
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredTopCompanies.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">Aucune entreprise trouvée</p>
                    </div>
                  )}
                  

                </div>
              </div>
            </div>

            {/* Colonne de droite - Ma liste + Rechercher */}
            <div className="lg:col-span-1 space-y-8">
              {/* Ma liste d'entreprises */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Ma liste d'entreprises ({myList.length})</h3>
                  {myList.length === 0 && (
                    <button 
                      onClick={() => {
                        const defaultCompanies = [
                          { name: "TotalEnergies", siret: "54205118000012", city: "Paris", address: "2 Place Jean Millier, 92400 Courbevoie" },
                          { name: "Orange", siret: "38012986600014", city: "Paris", address: "111 Quai du Président Roosevelt, 92130 Issy-les-Moulineaux" },
                          { name: "EDF", siret: "55208131700034", city: "Paris", address: "22-30 Avenue de Wagram, 75008 Paris" },
                          { name: "Engie", siret: "54210765100034", city: "Paris", address: "1 Place Samuel de Champlain, 92400 Courbevoie" },
                          { name: "BNP Paribas", siret: "66204244900034", city: "Paris", address: "16 Boulevard des Italiens, 75009 Paris" }
                        ];
                        setMyList(defaultCompanies);
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                    >
                      Restaurer mes entreprises
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {myList.map((company) => (
                    <div key={company.siret || company.name} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{company.name}</h4>
                      <div className="flex space-x-2">
                        <button 
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/companies/careers?company=${encodeURIComponent(company.name)}`);
                              const data = await response.json();
                              window.open(data.careerSite, '_blank');
                            } catch (error) {
                              console.error('Erreur lors de la recherche du site de carrières:', error);
                              // Fallback en cas d'erreur
                              const searchQuery = `${company.name} carrières`;
                              window.open(`https://www.bing.fr/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                            }
                          }}
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                        >
                          Candidater
                        </button>
                        <button 
                          onClick={() => toggleMyList(company)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  ))}
                  {myList.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Aucune entreprise dans votre liste</p>
                      <p className="text-sm text-gray-400 mt-2">Utilisez la recherche ci-dessous pour ajouter des entreprises</p>
                    </div>
                  )}
                </div>
              </div>

                             {/* Rechercher */}
               <div className="bg-white rounded-lg shadow p-6">
                 <h2 className="text-xl font-semibold text-gray-900 mb-4">Rechercher</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recherche via l'API officielle (data.gouv.fr)
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Nom de l'entreprise, SIRET, ou raison sociale"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && searchCompanies()}
                    />
                    <button 
                      onClick={searchCompanies}
                      disabled={loading}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Recherche..." : "Rechercher"}
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-600 text-sm mt-2">{error}</p>
                  )}
                </div>



                {/* Filtres avancés */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Filtres avancés</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Domaine d'activité</label>
                      <select 
                        value={filters.nafCode}
                        onChange={(e) => setFilters({...filters, nafCode: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {nafCodes.map(naf => (
                          <option key={naf.value} value={naf.value}>{naf.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chiffre d'affaires</label>
                      <select
                        value={filters.revenue}
                        onChange={e => setFilters({ ...filters, revenue: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {revenueRanges.map(range => (
                          <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Effectifs</label>
                      <select 
                        value={filters.employeeCount}
                        onChange={(e) => setFilters({...filters, employeeCount: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Tous</option>
                        <option value="11">10 à 19 salariés</option>
                        <option value="12">20 à 49 salariés</option>
                        <option value="21">50 à 99 salariés</option>
                        <option value="22">100 à 199 salariés</option>
                        <option value="52">5000 à 9999 salariés</option>
                        <option value="53">10000+ salariés</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
                      <input
                        type="text"
                        placeholder="Ville, département ou région..."
                        value={filters.location}
                        onChange={(e) => setFilters({...filters, location: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Résultats depuis l'API officielle */}
                {companies.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{companies.length}</span> entreprise{companies.length > 1 ? 's' : ''} trouvée{companies.length > 1 ? 's' : ''} via l'API officielle
                    </p>
                  </div>
                )}



                <div className="space-y-4">


                  {/* Entreprises depuis l'API officielle */}
                  {companies.length > 0 ? (
                    companies.map((company) => (
                      <div key={company.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                              {myList.some(item => {
                                const companyId = company.siret !== "N/A" ? company.siret : `${company.name}-${company.city}`;
                                const itemId = item.siret !== "N/A" ? item.siret : `${item.name}-${item.city}`;
                                return itemId === companyId;
                              }) && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Dans ma liste
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mb-2">
                              {formatActivitySector(company.activity)} • {company.city} ({company.postalCode})
                            </p>
                            <p className="text-sm text-gray-500 mb-2">
                              SIRET: {company.siret} • SIREN: {company.siren} • {company.size}
                            </p>
                            <p className="text-sm text-gray-500 mb-2">
                              Chiffre d'affaires: {formatRevenue(company.revenue)}
                              {company.financialUrl && (
                                <span className="ml-2 text-xs text-gray-400">
                                  (voir données complètes)
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500 mb-2">
                              {company.address}
                            </p>
                            <div className="flex space-x-4">
                              {company.website && (
                                <a 
                                  href={company.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                >
                                  Site web →
                                </a>
                              )}
                              {company.officialUrl && (
                                <a 
                                  href={company.officialUrl}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                >
                                  Fiche officielle →
                                </a>
                              )}
                              {company.financialUrl && (
                                <a 
                                  href={company.financialUrl}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                >
                                  Données financières →
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-6">
                            <button 
                              onClick={() => toggleMyList(company)}
                              className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                                myList.some(item => {
                                  const companyId = company.siret !== "N/A" ? company.siret : `${company.name}-${company.city}`;
                                  const itemId = item.siret !== "N/A" ? item.siret : `${item.name}-${item.city}`;
                                  return itemId === companyId;
                                })
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {myList.some(item => {
                                const companyId = company.siret !== "N/A" ? company.siret : `${company.name}-${company.city}`;
                                const itemId = item.siret !== "N/A" ? item.siret : `${item.name}-${item.city}`;
                                return itemId === companyId;
                              }) ? "Retirer" : "Ajouter"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Aucune entreprise trouvée. Essayez une nouvelle recherche.</p>
                    </div>
                  )}
                  

                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 