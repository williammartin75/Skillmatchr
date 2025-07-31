"use client";
import React, { useState, useEffect } from "react";
import { top100Companies, getAllSectors, getCompaniesBySector, searchCompaniesByName } from '../data/top-100-companies';

export default function Spontaneous() {
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState([]);
  const [myList, setMyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // État pour le debug
  const [debugInfo, setDebugInfo] = useState({
    lastUrl: "",
    lastResponse: null,
    lastError: null,
    requestCount: 0
  });
  
  // État pour le scroll infini
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Filtres avancés
  const [filters, setFilters] = useState({
    activityDomain: "",
    revenue: "",
    employeeCount: "",
    location: ""
  });

  // États pour le bloc des 100 entreprises
  const [selectedSector, setSelectedSector] = useState("Tous");
  const [filteredTopCompanies, setFilteredTopCompanies] = useState(top100Companies);
  const [searchTopQuery, setSearchTopQuery] = useState("");
  const [displayedTopCompanies, setDisplayedTopCompanies] = useState(20);
  const [loadingMoreTopCompanies, setLoadingMoreTopCompanies] = useState(false);
  
  // Domaines d'activité (codes de section d'activité principale)
  const activityDomains = [
    { code: "", label: "Tous" },
    { code: "J", label: "Information et communication" },
    { code: "K", label: "Activités financières et d'assurance" },
    { code: "L", label: "Activités immobilières" },
    { code: "M", label: "Activités spécialisées, scientifiques et techniques" },
    { code: "N", label: "Activités de services administratifs et de soutien" },
    { code: "O", label: "Administration publique" },
    { code: "P", label: "Enseignement" },
    { code: "Q", label: "Santé humaine et action sociale" },
    { code: "R", label: "Arts, spectacles et activités récréatives" },
    { code: "S", label: "Autres activités de services" },
    { code: "T", label: "Activités des ménages en tant qu'employeurs" },
    { code: "U", label: "Activités extra-territoriales" },
    { code: "A", label: "Agriculture, sylviculture et pêche" },
    { code: "B", label: "Industries extractives" },
    { code: "C", label: "Industrie manufacturière" },
    { code: "D", label: "Production et distribution d'électricité, de gaz, de vapeur et d'air conditionné" },
    { code: "E", label: "Production et distribution d'eau ; assainissement, gestion des déchets et dépollution" },
    { code: "F", label: "Construction" },
    { code: "G", label: "Commerce ; réparation d'automobiles et de motocycles" },
    { code: "H", label: "Transports et entreposage" },
    { code: "I", label: "Hébergement et restauration" }
  ];
  
  // Tranches de chiffre d'affaires (codes officiels de l'API)
  const revenueRanges = [
    { code: "", label: "Tous" },
    { code: "1", label: "0 - 100k €" },
    { code: "2", label: "100k - 500k €" },
    { code: "3", label: "500k - 1M €" },
    { code: "4", label: "1M - 5M €" },
    { code: "5", label: "5M - 10M €" },
    { code: "6", label: "10M - 50M €" },
    { code: "7", label: "50M+ €" }
  ];
  
  // Effectifs
  const employeeRanges = [
    { code: "", label: "Tous" },
    { code: "NN", label: "Non renseigné" },
    { code: "00", label: "0 salarié" },
    { code: "01", label: "1 ou 2 salariés" },
    { code: "02", label: "3 à 5 salariés" },
    { code: "03", label: "6 à 9 salariés" },
    { code: "11", label: "10 à 19 salariés" },
    { code: "12", label: "20 à 49 salariés" },
    { code: "21", label: "50 à 99 salariés" },
    { code: "22", label: "100 à 199 salariés" },
    { code: "31", label: "200 à 249 salariés" },
    { code: "32", label: "250 à 499 salariés" },
    { code: "41", label: "500 à 999 salariés" },
    { code: "42", label: "1000 à 1999 salariés" },
    { code: "51", label: "2000 à 4999 salariés" },
    { code: "52", label: "5000 à 9999 salariés" },
    { code: "53", label: "10000+ salariés" }
  ];



  // Fonction pour formater la taille d'entreprise
  const formatCompanySize = (sizeCode) => {
    const sizeMap = {
      "NN": "Non renseigné",
      "00": "0 salarié",
      "01": "1 ou 2 salariés",
      "02": "3 à 5 salariés",
      "03": "6 à 9 salariés",
      "11": "10 à 19 salariés",
      "12": "20 à 49 salariés",
      "21": "50 à 99 salariés",
      "22": "100 à 199 salariés",
      "31": "200 à 249 salariés",
      "32": "250 à 499 salariés",
      "41": "500 à 999 salariés",
      "42": "1000 à 1999 salariés",
      "51": "2000 à 4999 salariés",
      "52": "5000 à 9999 salariés",
      "53": "10000+ salariés"
    };
    return sizeMap[sizeCode] || sizeCode || "Taille non disponible";
  };

  // Fonction pour formater le secteur d'activité
  const formatActivitySector = (activityCode) => {
    const sectorMap = {
      "A": "Agriculture, sylviculture et pêche",
      "B": "Industries extractives",
      "C": "Industrie manufacturière",
      "D": "Production et distribution d'électricité, de gaz, de vapeur et d'air conditionné",
      "E": "Production et distribution d'eau ; assainissement, gestion des déchets et dépollution",
      "F": "Construction",
      "G": "Commerce ; réparation d'automobiles et de motocycles",
      "H": "Transports et entreposage",
      "I": "Hébergement et restauration",
      "J": "Information et communication",
      "K": "Activités financières et d'assurance",
      "L": "Activités immobilières",
      "M": "Activités spécialisées, scientifiques et techniques",
      "N": "Activités de services administratifs et de soutien",
      "O": "Administration publique",
      "P": "Enseignement",
      "Q": "Santé humaine et action sociale",
      "R": "Arts, spectacles et activités récréatives",
      "S": "Autres activités de services",
      "T": "Activités des ménages en tant qu'employeurs",
      "U": "Activités extra-territoriales"
    };
    return sectorMap[activityCode] || activityCode || "Secteur non disponible";
  };

  // Fonction pour formater le chiffre d'affaires
  const formatRevenue = (revenueCode) => {
    const revenueMap = {
      "1": "0 - 100k €",
      "2": "100k - 500k €",
      "3": "500k - 1M €",
      "4": "1M - 5M €",
      "5": "5M - 10M €",
      "6": "10M - 50M €",
      "7": "50M+ €"
    };
    return revenueMap[revenueCode] || revenueCode || "CA non disponible";
  };

  // Fonction pour récupérer les données financières d'une entreprise
  // Note: L'API des données financières n'est pas accessible, on utilise le lien web
  const getFinancialData = async (siren) => {
    if (!siren) return null;
    
    try {
      console.log("💰 Tentative de récupération des données financières pour SIREN:", siren);
      
      // L'API des données financières n'est pas accessible directement
      // On retourne null mais on garde le lien vers la page web
      console.log("⚠️ API des données financières non accessible, utilisation du lien web");
      return null;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des données financières:", error);
      return null;
    }
  };

  // Fonction pour formater le nom d'entreprise
  const formatCompanyName = (company) => {
    // Essayer différents champs pour le nom
    const possibleNames = [
      company.nom_raison_sociale,
      company.nom_complet,
      company.denomination,
      company.sigle
    ].filter(Boolean); // Enlever les valeurs null/undefined
    
    if (possibleNames.length > 0) {
      return possibleNames[0];
    }
    
    // Si aucun nom trouvé, essayer de construire un nom à partir d'autres champs
    if (company.siege?.commune) {
      return `Entreprise à ${company.siege.commune}`;
    }
    
    return "Nom non disponible";
  };

  // Fonction pour formater l'adresse
  const formatAddress = (company) => {
    const siege = company.siege;
    if (!siege) return "Adresse non disponible";
    
    const parts = [];
    if (siege.numero_voie && siege.type_voie && siege.libelle_voie) {
      parts.push(`${siege.numero_voie} ${siege.type_voie} ${siege.libelle_voie}`);
    } else if (siege.adresse) {
      parts.push(siege.adresse);
    }
    
    if (siege.code_postal && siege.commune) {
      parts.push(`${siege.code_postal} ${siege.commune}`);
    }
    
    return parts.length > 0 ? parts.join(", ") : "Adresse non disponible";
  };

  // Fonction de recherche d'entreprises via l'API data.gouv.fr
  const searchCompanies = async () => {
    console.log("🚀 Début de la recherche d'entreprises");
    console.log("📝 État des filtres:", filters);
    console.log("🔍 Query de recherche:", searchQuery);
    
    // Vérifier qu'au moins un critère de recherche est saisi
    const hasSearchQuery = searchQuery.trim() !== "";
    const hasFilters = filters.activityDomain || filters.employeeCount || filters.location || filters.revenue;
    
    console.log("✅ Validation des critères:", { hasSearchQuery, hasFilters });
    
    if (!hasSearchQuery && !hasFilters) {
      setError("Veuillez saisir un nom d'entreprise OU utiliser au moins un filtre");
      return;
    }

    setLoading(true);
    setError("");
    setPage(1); // Reset page for new search
    setHasMore(true); // Assume more results for new search

    try {
      let url = "https://recherche-entreprises.api.gouv.fr/search?per_page=20&page=1"; // Start with page 1, 20 per page
      
      // Ajouter les paramètres de recherche - L'API n'accepte pas q=*
      if (hasSearchQuery) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
        console.log("🔍 Ajout du paramètre q:", searchQuery);
      } else {
        // Si pas de recherche textuelle, utiliser un terme générique qui fonctionne
        url += `&q=entreprise`;
        console.log("🔍 Ajout du paramètre q générique: entreprise");
      }
      
      // Validation des codes de filtre
      const validActivityCodes = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U"];
      const validEmployeeCodes = ["NN", "00", "01", "02", "03", "11", "12", "21", "22", "31", "32", "41", "42", "51", "52", "53"];
      const validRevenueCodes = ["1", "2", "3", "4", "5", "6", "7"];
      
      // Ajouter les filtres avec validation
      if (filters.activityDomain && filters.activityDomain !== "" && filters.activityDomain !== "Tous" && filters.activityDomain !== "tous") {
        url += `&section_activite_principale=${filters.activityDomain}`;
        console.log("🏭 Ajout du filtre activité:", filters.activityDomain);
      } else {
        console.log("🏭 Filtre activité ignoré (vide ou 'Tous')");
      }
      
      if (filters.employeeCount && filters.employeeCount !== "" && filters.employeeCount !== "Tous") {
        url += `&tranche_effectif_salarie=${filters.employeeCount}`;
        console.log("👥 Ajout du filtre effectif:", filters.employeeCount);
      } else {
        console.log("👥 Filtre effectif ignoré (vide ou 'Tous')");
      }
      
      if (filters.location && filters.location.trim() !== "") {
        url += `&commune=${encodeURIComponent(filters.location)}`;
        console.log("📍 Ajout du filtre localisation:", filters.location);
      } else {
        console.log("📍 Filtre localisation ignoré (vide)");
      }
      
      if (filters.revenue && filters.revenue !== "" && filters.revenue !== "Tous") {
        url += `&chiffre_affaires=${filters.revenue}`;
        console.log("💰 Ajout du filtre CA:", filters.revenue);
      } else {
        console.log("💰 Filtre CA ignoré (vide ou 'Tous')");
      }

      console.log("🔍 URL finale de recherche:", url);
      
      // Test de l'URL dans un nouvel onglet pour debug
      console.log("🔗 URL à tester dans le navigateur:", url);
      
      // Mettre à jour les infos de debug
      setDebugInfo(prev => ({
        ...prev,
        lastUrl: url,
        requestCount: prev.requestCount + 1,
        lastError: null
      }));
      
      const response = await fetch(url);
      
      console.log("📡 Réponse de l'API:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        console.error("❌ Erreur HTTP:", response.status, response.statusText);
        
        // Gestion spécifique des erreurs
        if (response.status === 429) {
          throw new Error("Trop de requêtes. Veuillez attendre quelques secondes.");
        } else if (response.status === 400) {
          throw new Error("Paramètres de recherche invalides.");
        } else if (response.status === 500) {
          throw new Error("Erreur serveur de l'API. Veuillez réessayer plus tard.");
        }
        const errorText = await response.text();
        console.error("❌ Erreur HTTP:", response.status, errorText);
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📊 Données brutes reçues:", data);
      console.log("📊 Résumé des données:", {
        totalResults: data.total_results,
        resultsCount: data.results?.length || 0,
        firstCompany: data.results?.[0]?.nom_raison_sociale || "Aucune",
        searchQuery,
        filters
      });
      
      // Mettre à jour les infos de debug avec la réponse
      setDebugInfo(prev => ({
        ...prev,
        lastResponse: {
          status: response.status,
          totalResults: data.total_results,
          resultsCount: data.results?.length || 0,
          firstCompany: data.results?.[0]?.nom_raison_sociale || "Aucune"
        }
      }));
      
      // Validation des données reçues
      if (!data) {
        throw new Error("Aucune donnée reçue de l'API");
      }
      
      if (!Array.isArray(data.results)) {
        console.error("❌ data.results n'est pas un tableau:", data.results);
        throw new Error("Format de réponse invalide: results n'est pas un tableau");
      }
      
      if (data.results && data.results.length > 0) {
        console.log("✅ Entreprises trouvées:", data.results.length);
        
        // Récupérer les données financières pour chaque entreprise
        const companiesWithDetails = await Promise.all(
          data.results.map(async (company, index) => {
            // Récupérer les données financières si on a un SIREN
            let financialData = null;
            if (company.siren) {
              financialData = await getFinancialData(company.siren);
            }
            
            const formatted = {
              id: index + 1,
              name: formatCompanyName(company),
              siret: company.siret || "N/A",
              siren: company.siren || "N/A",
              address: formatAddress(company),
              city: company.siege?.commune || "Ville non disponible",
              postalCode: company.siege?.code_postal || "N/A",
              activity: company.section_activite_principale || "Activité non disponible",
              size: formatCompanySize(company.tranche_effectif_salarie),
              revenue: financialData?.chiffre_affaires || company.chiffre_affaires || "Non disponible",
              website: company.site_web || null,
              status: "Non ajouté",
              // Liens vers les fiches officielles
              officialUrl: company.siren ? `https://annuaire-entreprises.data.gouv.fr/entreprise/${company.siren}` : null,
              financialUrl: company.siren ? `https://annuaire-entreprises.data.gouv.fr/donnees-financieres/${company.siren}` : null,
              // Données financières complètes
              financialData: financialData,
              // Données brutes pour debug
              rawData: company
            };
            
            console.log(`🏢 Entreprise ${index + 1}:`, {
              original: company.nom_raison_sociale,
              formatted: formatted.name,
              siret: formatted.siret,
              siren: formatted.siren,
              city: formatted.city
            });
            
            return formatted;
          });
        );
        
        setCompanies(companiesWithDetails);
        setPage(1);
        setHasMore(data.results.length === 20);
        console.log("✅ Entreprises formatées et mises à jour:", companiesWithDetails.length);
      } else {
        console.log("⚠️ Aucune entreprise trouvée dans les résultats");
        setCompanies([]);
        setError("Aucune entreprise trouvée avec ces critères. Essayez de modifier vos filtres.");
        setHasMore(false);
      }
    } catch (err) {
      console.error("❌ Erreur de recherche:", err);
      console.error("❌ Stack trace:", err.stack);
      
      // Mettre à jour les infos de debug avec l'erreur
      setDebugInfo(prev => ({
        ...prev,
        lastError: {
          message: err.message,
          stack: err.stack
        }
      }));
      
      // Messages d'erreur plus détaillés
      let errorMessage = "Erreur lors de la recherche. ";
      if (err.message.includes("HTTP")) {
        errorMessage += err.message;
      } else if (err.message.includes("fetch")) {
        errorMessage += "Problème de connexion réseau. Vérifiez votre connexion internet.";
      } else if (err.message.includes("JSON")) {
        errorMessage += "Réponse invalide de l'API.";
      } else {
        errorMessage += "Veuillez réessayer.";
      }
      
      setError(errorMessage);
      setCompanies([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      console.log("🏁 Fin de la recherche");
    }
  };

  // Fonction pour ajouter/retirer de ma liste
  const toggleMyList = (company, source = 'api') => {
    if (source === 'top100') {
      // Pour les entreprises du bloc Top 100, on ne garde que le nom
      const isInList = myList.some(item => item.name === company.name);
      
      if (isInList) {
        setMyList(myList.filter(item => item.name !== company.name));
      } else {
        const simpleCompany = { 
          name: company.name
        };
        setMyList([...myList, simpleCompany]);
      }
    } else {
      // Pour les entreprises de l'API, on utilise une combinaison unique
      const companyId = company.siret !== "N/A" ? company.siret : `${company.name}-${company.city}`;
      const isInList = myList.some(item => {
        const itemId = item.siret !== "N/A" ? item.siret : `${item.name}-${item.city}`;
        return itemId === companyId;
      });
      
      if (isInList) {
        setMyList(myList.filter(item => {
          const itemId = item.siret !== "N/A" ? item.siret : `${item.name}-${item.city}`;
          return itemId !== companyId;
        }));
      } else {
        setMyList([...myList, company]);
      }
    }
  };

  // Fonction pour charger plus d'entreprises (scroll infini)
  const loadMoreCompanies = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      let url = `https://recherche-entreprises.api.gouv.fr/search?per_page=20&page=${nextPage}`;
      
      // Ajouter les paramètres de recherche - L'API n'accepte pas q=*
      if (searchQuery.trim() !== "") {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      } else {
        // Si pas de recherche textuelle, utiliser un terme générique qui fonctionne
        url += `&q=entreprise`;
      }
      
      // Ajouter les filtres
      if (filters.activityDomain) {
        url += `&section_activite_principale=${filters.activityDomain}`;
      }
      if (filters.employeeCount) {
        url += `&tranche_effectif_salarie=${filters.employeeCount}`;
      }
      if (filters.location) {
        url += `&commune=${encodeURIComponent(filters.location)}`;
      }
      if (filters.revenue) {
        url += `&chiffre_affaires=${filters.revenue}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement");
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const newCompanies = data.results.map((company, index) => ({
          id: companies.length + index + 1,
          name: formatCompanyName(company),
          siret: company.siret || "N/A",
          address: formatAddress(company),
          city: company.siege?.commune || "Ville non disponible",
          postalCode: company.siege?.code_postal || "N/A",
          activity: company.section_activite_principale || "Activité non disponible",
          size: formatCompanySize(company.tranche_effectif_salarie),
          revenue: company.chiffre_affaires || "Non disponible",
          website: company.site_web || null,
          status: "Non ajouté"
        }));
        
        setCompanies([...companies, ...newCompanies]);
        setPage(nextPage);
        setHasMore(data.results.length === 20);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Erreur de chargement:", err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Fonction pour gérer le scroll infini
  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
      loadMoreCompanies();
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, hasMore, loadingMore, companies.length, searchQuery, filters]); // Dependencies for useEffect

  // useEffect pour le scroll infini du bloc Top 100
  useEffect(() => {
    window.addEventListener('scroll', handleTopCompaniesScroll);
    return () => window.removeEventListener('scroll', handleTopCompaniesScroll);
  }, [displayedTopCompanies, filteredTopCompanies.length, loadingMoreTopCompanies]);

  // Recherche simple par défaut
  const searchSimple = async () => {
    console.log("🔍 Début de la recherche simple");
    setLoading(true);
    setError("");
    setPage(1);
    setHasMore(true);
    
    try {
      // Recherche simple avec un terme générique qui fonctionne
      const response = await fetch(
        "https://recherche-entreprises.api.gouv.fr/search?q=entreprise&per_page=20&page=1"
      );
      
      if (!response.ok) {
        throw new Error("Erreur lors de la recherche");
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const formattedCompanies = data.results.map((company, index) => ({
          id: index + 1,
          name: formatCompanyName(company),
          siret: company.siret || "N/A",
          address: formatAddress(company),
          city: company.siege?.commune || "Ville non disponible",
          postalCode: company.siege?.code_postal || "N/A",
          activity: company.section_activite_principale || "Activité non disponible",
          size: formatCompanySize(company.tranche_effectif_salarie),
          revenue: company.chiffre_affaires || "Non disponible",
          website: company.site_web || null,
          status: "Non ajouté"
        }));
        
        setCompanies(formattedCompanies);
        setPage(1);
        setHasMore(data.results.length === 20);
      } else {
        setCompanies([]);
        setError("Aucune entreprise trouvée");
        setHasMore(false);
      }
    } catch (err) {
      console.error("Erreur de recherche:", err);
      setError("Erreur lors de la recherche. Veuillez réessayer.");
      setCompanies([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // useEffect pour charger les données initiales
  useEffect(() => {
    // Ne charger les données initiales que si aucune recherche n'a été effectuée
    if (companies.length === 0 && !loading) {
      searchSimple();
    }
  }, []); // Seulement au montage du composant

  // Fonctions pour le bloc des 100 entreprises
  const filterTopCompaniesBySector = (sector) => {
    setSelectedSector(sector);
    setDisplayedTopCompanies(20); // Reset to initial count
    if (sector === "Tous") {
      setFilteredTopCompanies(top100Companies);
    } else {
      const filtered = getCompaniesBySector(sector);
      setFilteredTopCompanies(filtered);
    }
  };

  const searchTopCompanies = (query) => {
    setSearchTopQuery(query);
    setDisplayedTopCompanies(20); // Reset to initial count
    if (query.trim() === "") {
      filterTopCompaniesBySector(selectedSector);
    } else {
      const results = searchCompaniesByName(query);
      setFilteredTopCompanies(results);
    }
  };

  // Fonction pour charger plus d'entreprises du top 100
  const loadMoreTopCompanies = () => {
    if (loadingMoreTopCompanies) return;
    
    setLoadingMoreTopCompanies(true);
    
    // Simuler un délai de chargement
    setTimeout(() => {
      setDisplayedTopCompanies(prev => Math.min(prev + 20, filteredTopCompanies.length));
      setLoadingMoreTopCompanies(false);
    }, 500);
  };

  // Fonction pour gérer le scroll infini du bloc Top 100
  const handleTopCompaniesScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop + windowHeight >= documentHeight - 200) {
      loadMoreTopCompanies();
    }
  };

  // Log pour déboguer l'état des entreprises
  console.log("🎯 État actuel - companies:", companies.length, "loading:", loading, "error:", error);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">SkillMatchr</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-indigo-600">Accueil</a>
              <a href="/dashboard" className="text-gray-700 hover:text-indigo-600">Dashboard</a>
              <a href="/jobs" className="text-gray-700 hover:text-indigo-600">Offres</a>
              <a href="/applications" className="text-gray-700 hover:text-indigo-600">Candidatures</a>
              <a href="/spontaneous" className="text-indigo-600 font-semibold">Candidatures spontanées</a>
              <a href="/profile" className="text-gray-700 hover:text-indigo-600">Profil</a>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="text-gray-700 hover:text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">JD</span>
                </div>
                <span className="text-gray-700 font-medium">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Candidatures spontanées</h1>
            <p className="text-gray-600 mt-2">Recherchez des entreprises via l'API officielle et ajoutez-les à votre liste</p>
          </div>

          {/* Debug Panel */}
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-yellow-800">🔧 Panel de Debug</h3>
              <button 
                onClick={() => setDebugInfo({
                  lastUrl: "",
                  lastResponse: null,
                  lastError: null,
                  requestCount: 0
                })}
                className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm hover:bg-yellow-300"
              >
                Réinitialiser
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">📊 Statistiques</h4>
                <p>Requêtes effectuées: <span className="font-mono bg-yellow-100 px-2 py-1 rounded">{debugInfo.requestCount}</span></p>
                <p>Entreprises trouvées: <span className="font-mono bg-yellow-100 px-2 py-1 rounded">{companies.length}</span></p>
                <p>État: <span className={`font-mono px-2 py-1 rounded ${loading ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                  {loading ? 'Chargement...' : 'Prêt'}
                </span></p>
              </div>
              
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">🔗 Dernière URL</h4>
                {debugInfo.lastUrl ? (
                  <div className="bg-yellow-100 p-2 rounded text-xs break-all">
                    {debugInfo.lastUrl}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucune requête effectuée</p>
                )}
              </div>
            </div>
            
            {debugInfo.lastResponse && (
              <div className="mt-4">
                <h4 className="font-medium text-yellow-800 mb-2">�� Dernière réponse</h4>
                <div className="bg-yellow-100 p-3 rounded text-xs">
                  <p>Status: <span className="font-mono">{debugInfo.lastResponse.status}</span></p>
                  <p>Total résultats: <span className="font-mono">{debugInfo.lastResponse.totalResults}</span></p>
                  <p>Résultats reçus: <span className="font-mono">{debugInfo.lastResponse.resultsCount}</span></p>
                  <p>Première entreprise: <span className="font-mono">{debugInfo.lastResponse.firstCompany}</span></p>
                </div>
              </div>
            )}
            
            {debugInfo.lastError && (
              <div className="mt-4">
                <h4 className="font-medium text-red-800 mb-2">❌ Dernière erreur</h4>
                <div className="bg-red-100 p-3 rounded text-xs">
                  <p className="font-medium">{debugInfo.lastError.message}</p>
                  {debugInfo.lastError.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-red-700">Stack trace</summary>
                      <pre className="mt-2 text-xs overflow-auto">{debugInfo.lastError.stack}</pre>
                    </details>
                  )}
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-4">
                <h4 className="font-medium text-red-800 mb-2">⚠️ Erreur actuelle</h4>
                <div className="bg-red-100 p-3 rounded text-xs">
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne de gauche - Bloc des 100 entreprises */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Top 100 Entreprises Françaises</h3>
                
                {/* Vignettes de filtrage par secteur */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Filtrer par secteur</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => filterTopCompaniesBySector("Tous")}
                      className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                        selectedSector === "Tous" 
                          ? "bg-indigo-600 text-white" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Tous
                    </button>
                    {getAllSectors().slice(0, 8).map((sector) => (
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

                {/* Liste des entreprises */}
                <div className="space-y-3">
                  {filteredTopCompanies.slice(0, displayedTopCompanies).map((company, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{company.name}</h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {company.sector}
                        </span>
                      </div>
                                              <div className="flex space-x-2">
                          <button 
                            onClick={async () => {
                              try {
                                const response = await fetch(`/api/companies/careers?company=${encodeURIComponent(company.name)}`);
                                const data = await response.json();
                                if (data.careerSite) {
                                  window.open(data.careerSite, '_blank');
                                }
                              } catch (error) {
                                console.error('Erreur lors de la recherche du site de carrières:', error);
                                // Fallback vers Google Search
                                const searchQuery = `${company.name} carrières recrutement emploi site officiel`;
                                window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
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
                  
                  {/* Indicateur de fin */}
                  {displayedTopCompanies >= filteredTopCompanies.length && filteredTopCompanies.length > 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">Vous avez atteint la fin de la liste</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne de droite - Blocs existants */}
            <div className="lg:col-span-1 space-y-8">
              {/* Bloc 1 - Ma liste d'entreprises */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Ma liste d'entreprises ({myList.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myList.map((company) => (
                    <div key={company.siret || company.name} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{company.name}</h4>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700">
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
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">Aucune entreprise dans votre liste</p>
                      <p className="text-sm text-gray-400 mt-2">Utilisez la recherche ci-dessous pour ajouter des entreprises</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bloc 2 - Rechercher */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Rechercher</h2>
                
                {/* Barre de recherche principale */}
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
                  <p className="text-sm text-gray-500 mt-2">
                    💡 <strong>Conseils :</strong> Utilisez la barre de recherche pour le nom d'entreprise ET le filtre "Localisation" pour la ville
                  </p>
                  {error && (
                    <p className="text-red-600 text-sm mt-2">{error}</p>
                  )}
                </div>

                {/* Filtres avancés */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Filtres avancés</h4>
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => setFilters({ activityDomain: "", revenue: "", employeeCount: "", location: "" })}
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        Réinitialiser
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Domaine d'activité */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Domaine d'activité</label>
                      <select 
                        value={filters.activityDomain}
                        onChange={(e) => setFilters({...filters, activityDomain: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {activityDomains.map((domain) => (
                          <option key={domain.code} value={domain.code}>
                            {domain.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Chiffre d'affaires */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chiffre d'affaires</label>
                      <select 
                        value={filters.revenue}
                        onChange={(e) => setFilters({...filters, revenue: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {revenueRanges.map((range) => (
                          <option key={range.code} value={range.code}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Effectifs */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Effectifs</label>
                      <select 
                        value={filters.employeeCount}
                        onChange={(e) => setFilters({...filters, employeeCount: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {employeeRanges.map((range) => (
                          <option key={range.code} value={range.code}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Localisation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
                      <input
                        type="text"
                        value={filters.location}
                        onChange={(e) => setFilters({...filters, location: e.target.value})}
                        placeholder="Ville, département..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="text-sm text-gray-600 mt-2">
                  {companies.length > 0 && `${companies.length} entreprise(s) trouvée(s)`}
                </div>
              </div>

              {/* Bloc 3 - Entreprises trouvées */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Entreprises trouvées</h2>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="text-gray-600 mt-4">Recherche en cours...</p>
                    </div>
                  ) : companies.length > 0 ? (
                    <div className="space-y-4">
                      {companies.map((company) => (
                        <div key={company.id} className="border border-gray-200 rounded-lg p-6">
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
                              
                              {/* Indicateur de données complètes */}
                              {company.details && (
                                <div className="mb-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✅ Données complètes
                                  </span>
                                </div>
                              )}
                              
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
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Aucune entreprise trouvée. Essayez une nouvelle recherche.</p>
                    </div>
                  )}
                  
                  {/* Indicateur de chargement pour le scroll infini */}
                  {loadingMore && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Chargement de plus d'entreprises...</p>
                    </div>
                  )}
                  
                  {/* Indicateur de fin */}
                  {!hasMore && companies.length > 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Vous avez atteint la fin des résultats</p>
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