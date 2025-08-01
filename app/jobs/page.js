"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { searchCitiesHierarchical, findCityByName, getOptimalRadius, loadCitiesFromDatabase } from "../data/french-cities-complete";

import AuthGuard from '../components/AuthGuard';
import { useAuth } from '../lib/useAuth';
import { ApplicationsManager } from '../lib/applications';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [hasCV, setHasCV] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    radius: -10,
    searchQuery: "",
    contractType: "",
    source: "",
    minSalary: "",
    skills: "",
    remoteOnly: false,
    newJobsOnly: false,
    publicationDate: "", // Nouveau filtre de date de publication
    sortBy: "date" // Nouveau filtre de tri
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [selectedCity, setSelectedCity] = useState(null);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const observer = useRef();
  const loadingRef = useRef();
  const locationInputRef = useRef();

  // Charger les données des villes au montage
  useEffect(() => {
    const loadCities = async () => {
      setCitiesLoading(true);
      try {
        await loadCitiesFromDatabase();
        console.log('✅ Villes chargées avec succès');
      } catch (error) {
        console.error('❌ Erreur chargement villes:', error);
      } finally {
        setCitiesLoading(false);
      }
    };
    
    loadCities();
  }, []);

  // Fonction pour charger les jobs
  const loadJobs = useCallback(async (pageNum = 1, reset = false) => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Utiliser l'utilisateur depuis le hook d'authentification
      const userId = user?.id;
      
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '6',
        hasCV: hasCV.toString(),
        ...filters
      });
      
      // Ajouter l'ID utilisateur si disponible
      if (userId) {
        params.append('userId', userId);
      }

      console.log('🔍 Debug - hasCV:', hasCV);
      console.log('🔍 Debug - userId:', userId);
      console.log('🔍 Debug - URL params:', params.toString());
      console.log('🔍 Debug - filters:', filters);

      const response = await fetch(`/api/jobs?${params}`);
      const data = await response.json();

      console.log('🔍 Debug - API response jobs:', data.jobs.slice(0, 2).map(job => ({
        id: job.id,
        title: job.title,
        matchPercentage: job.matchPercentage
      })));

      if (reset) {
        setJobs(data.jobs);
        setPage(1);
      } else {
        setJobs(prev => [...prev, ...data.jobs]);
      }
      
      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
      setTotalJobs(data.pagination.total);
    } catch (error) {
      console.error('Erreur lors du chargement des jobs:', error);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [filters, loading, hasCV, user]);

  // Charger les jobs initiaux
  useEffect(() => {
    // Vérifier si un utilisateur est connecté et a un CV
    if (user && user.documents && user.documents.length > 0) {
      const hasCVUploaded = user.documents.some(doc => doc.type === 'cv');
      setHasCV(hasCVUploaded);
      console.log('🔍 Debug - Utilisateur connecté avec CV:', hasCVUploaded);
    } else {
      // Fallback pour l'ancien système
      const cvData = localStorage.getItem('cvData');
      if (cvData) {
        setHasCV(true);
      }
    }
    
    loadJobs(1, true);
  }, []);

  // Recharger les jobs quand les filtres changent
  useEffect(() => {
    if (!isInitialLoad) {
      loadJobs(1, true);
    }
  }, [filters, hasCV]);

  // Configuration de l'intersection observer pour le scroll infini
  const lastJobElementRef = useCallback(node => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadJobs(page + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page, loadJobs]);

  // Fonction pour gérer la recherche de localisation
  const handleLocationChange = (value) => {
    setFilters(prev => ({ ...prev, location: value }));
    
    if (citiesLoading) {
      console.log('⏳ Villes en cours de chargement...');
      return;
    }
    
    if (value.length >= 1) { // Changé de 2 à 1 pour réagir dès la première lettre
      const suggestions = searchCitiesHierarchical(value, 5); // Limité à 5 suggestions
      console.log(`🔍 Recherche "${value}": ${suggestions.length} suggestions trouvées`);
      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(suggestions.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  // Fonction pour sélectionner une suggestion
  const selectLocationSuggestion = (city) => {
    setFilters(prev => ({ 
      ...prev, 
      location: city.name 
    }));
    setSelectedCity(city);
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
    
    // Ajuster automatiquement le rayon de recherche basé sur la population de la ville
    const optimalRadius = getOptimalRadius(city);
    setFilters(prev => ({ 
      ...prev, 
      radius: optimalRadius 
    }));
    
    console.log(`📍 Ville sélectionnée: ${city.name} (${city.population?.toLocaleString()} habitants)`);
    console.log(`🎯 Rayon automatique ajusté: ${optimalRadius} km`);
  };

  // Fonction pour gérer les touches du clavier
  const handleLocationKeyDown = (e) => {
    if (!showLocationSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < locationSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectLocationSuggestion(locationSuggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowLocationSuggestions(false);
        setLocationSuggestions([]);
        break;
    }
  };

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowLocationSuggestions(false);
        setLocationSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    console.log('🔍 Appliquer les filtres:', filters);
    loadJobs(1, true);
  };

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      location: "",
      radius: -10,
      searchQuery: "",
      contractType: "",
      source: "",
      minSalary: "",
      skills: "",
      remoteOnly: false,
      newJobsOnly: false,
      publicationDate: "",
      sortBy: "date"
    });
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
    setSelectedCity(null);
  };

  // Fonction pour formater le rayon
  const formatRadius = (radius) => {
    if (radius === 0) return "Exacte";
    if (radius === 1) return "1 km";
    if (radius >= 100) return `${radius}+ km`;
    return `${radius} km`;
  };

  // Fonction pour calculer l'étape du curseur selon la valeur
  const getStepValue = (radius) => {
    if (radius <= 10) return 1;      // Pas de 1 km jusqu'à 10 km
    if (radius <= 25) return 5;      // Pas de 5 km de 10 à 25 km
    if (radius <= 50) return 10;     // Pas de 10 km de 25 à 50 km
    if (radius <= 100) return 25;    // Pas de 25 km de 50 à 100 km
    return 50;                       // Pas de 50 km au-delà de 100 km
  };

  // Fonction pour ajuster la valeur selon l'étape
  const adjustRadiusValue = (value) => {
    const step = getStepValue(value);
    return Math.round(value / step) * step;
  };

  // Fonction pour mettre en évidence les termes recherchés
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  // État pour suivre les offres auxquelles l'utilisateur a postulé
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  // Fonction simple pour postuler
  const handleApply = (jobId) => {
    // Incrémenter le compteur de CV envoyés dans le dashboard
    const currentStats = ApplicationsManager.getStats();
    const newStats = {
      ...currentStats,
      totalApplications: currentStats.totalApplications + 1,
      pendingApplications: currentStats.pendingApplications + 1
    };
    localStorage.setItem('applicationStats', JSON.stringify(newStats));
    
    // Marquer cette offre comme postulée
    setAppliedJobs(prev => new Set([...prev, jobId]));
  };

  return (
    // <AuthGuard>
      <div className="min-h-screen bg-gray-50">


      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Offres d'emploi</h1>
                <p className="text-gray-600 mt-2">Découvrez les meilleures opportunités qui correspondent à votre profil</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">{totalJobs.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Offres disponibles</div>
                </div>
                <button
                  onClick={() => setHasCV(!hasCV)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    hasCV 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {hasCV ? '✓ Matching CV actif' : '🔍 Activer matching CV'}
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            {/* Recherche textuelle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche par mot-clé
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Titre de poste, entreprise, compétence, ville..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      applyFilters();
                    }
                  }}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Recherchez par titre de poste, nom d'entreprise, compétence ou ville
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
                <div className="relative">
                  <input 
                    ref={locationInputRef}
                    type="text" 
                    placeholder={citiesLoading ? "Chargement des villes..." : "Tapez une ville..."}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={filters.location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    onKeyDown={handleLocationKeyDown}
                    onFocus={() => {
                      if (filters.location.length >= 1 && !citiesLoading) {
                        setShowLocationSuggestions(true);
                      }
                    }}
                    disabled={citiesLoading}
                  />
                  {citiesLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    </div>
                  )}
                  
                  {/* Suggestions de villes */}
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {locationSuggestions.map((city, index) => (
                        <div
                          key={`${city.name}-${index}`}
                          className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                            index === selectedSuggestionIndex ? 'bg-indigo-50 text-indigo-700' : ''
                          }`}
                          onClick={() => selectLocationSuggestion(city)}
                        >
                          <div className="font-medium">{city.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Menu déroulant de rayon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rayon de recherche</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={filters.radius.toString()}
                  onChange={(e) => setFilters(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                  disabled={filters.remoteOnly}
                >
                  <option value="0">Exacte</option>
                  <option value="-10">≤ 10 km</option>
                  <option value="-15">≤ 15 km</option>
                  <option value="-20">≤ 20 km</option>
                  <option value="-25">≤ 25 km</option>
                  <option value="-30">≤ 30 km</option>
                  <option value="-40">≤ 40 km</option>
                  <option value="-50">≤ 50 km</option>
                  <option value="-75">≤ 75 km</option>
                  <option value="-100">≤ 100 km</option>
                  <option value="-150">≤ 150 km</option>
                </select>
                {filters.location && filters.radius !== 0 && !filters.remoteOnly && (
                  <p className="text-xs text-indigo-600 mt-1">
                    {filters.radius > 0 
                      ? `Recherche dans un rayon de ${filters.radius} km autour de ${filters.location}`
                      : `Recherche dans un rayon de ${Math.abs(filters.radius)} km maximum autour de ${filters.location}`
                    }
                  </p>
                )}
              </div>

              {/* Type de contrat */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de contrat
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={filters.contractType}
                  onChange={(e) => setFilters(prev => ({ ...prev, contractType: e.target.value }))}
                >
                  <option value="">Tous les types</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Intérim">Intérim</option>
                  <option value="Stage">Stage</option>
                  <option value="Alternance">Alternance</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              {/* Tri des résultats */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trier par
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                >
                  <option value="date">Date (plus récent)</option>
                  <option value="date_asc">Date (plus ancien)</option>
                  <option value="salary_desc">Salaire (décroissant)</option>
                  <option value="salary_asc">Salaire (croissant)</option>
                  <option value="company">Entreprise (A-Z)</option>
                  <option value="location">Localisation (A-Z)</option>
                  {hasCV && <option value="match">Compatibilité CV</option>}
                </select>
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={filters.source}
                  onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                >
                  <option value="">Toutes les sources</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="indeed">Indeed</option>
                  <option value="glassdoor">Glassdoor</option>
                  <option value="apec">Apec</option>
                  <option value="pole-emploi">Pôle Emploi</option>
                  <option value="welcometothejungle">Welcome to the Jungle</option>
                  <option value="chooseyourboss">Choose Your Boss</option>
                  <option value="regionsjob">RegionsJob</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salaire minimum</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={filters.minSalary}
                  onChange={(e) => setFilters(prev => ({ ...prev, minSalary: e.target.value }))}
                >
                  <option value="">Tous les salaires</option>
                  <option value="30k">30k€</option>
                  <option value="40k">40k€</option>
                  <option value="50k">50k€</option>
                  <option value="60k">60k€</option>
                  <option value="70k">70k€</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de publication</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={filters.publicationDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, publicationDate: e.target.value }))}
                >
                  <option value="">Toutes les dates</option>
                  <option value="24h">Moins de 24h</option>
                  <option value="48h">Moins de 48h</option>
                  <option value="1week">Moins d'1 semaine</option>
                  <option value="1month">Moins d'1 mois</option>
                  <option value="3months">Moins de 3 mois</option>
                  <option value="3months+">Plus de 3 mois</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compétences</label>
                <input 
                  type="text" 
                  placeholder="React, Python, AWS..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={filters.skills}
                  onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={filters.remoteOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, remoteOnly: e.target.checked }))}
                  />
                  <span className="ml-2 text-sm text-gray-700">Télétravail uniquement</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={filters.newJobsOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, newJobsOnly: e.target.checked }))}
                  />
                  <span className="ml-2 text-sm text-gray-700">Nouvelles offres</span>
                </label>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Réinitialiser
                </button>
                <button 
                  onClick={applyFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Filtrer
                </button>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-6">
            {/* Indicateur de recherche */}
            {filters.searchQuery && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-blue-800 font-medium">
                      Recherche : "{filters.searchQuery}"
                    </span>
                  </div>
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, searchQuery: "" }))}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Effacer
                  </button>
                </div>
              </div>
            )}

            {/* Indicateur de filtres actifs */}
            {(filters.location || filters.contractType || filters.source || filters.minSalary || filters.skills || filters.remoteOnly || filters.newJobsOnly || filters.publicationDate) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                    <span className="text-green-800 font-medium">
                      {totalJobs.toLocaleString()} offre{totalJobs > 1 ? 's' : ''} trouvée{totalJobs > 1 ? 's' : ''} avec les filtres actifs
                    </span>
                  </div>
                  <button 
                    onClick={resetFilters}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    Effacer tous les filtres
                  </button>
                </div>
              </div>
            )}

            {/* Indicateur de matching CV actif */}
            {hasCV && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-purple-800 font-medium">
                      Matching CV actif - Les offres sont triées par compatibilité
                    </span>
                  </div>
                  <button 
                    onClick={() => setHasCV(false)}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    Désactiver
                  </button>
                </div>
              </div>
            )}

            {isInitialLoad ? (
              // Loading initial
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : jobs.length === 0 ? (
              // Aucun job trouvé
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune offre trouvée</h3>
                <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
              </div>
            ) : (
              // Liste des jobs
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job, index) => (
                  <div 
                    key={job.id} 
                    ref={index === jobs.length - 1 ? lastJobElementRef : null}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
                    onClick={() => {
                      if (job.url) {
                        window.open(job.url, '_blank');
                      }
                    }}
                  >
                    <div className="flex-1">
                      {/* Titre de l'offre en haut */}
                      <div className="flex items-center space-x-2 mb-3">
                        <h2 className="text-xl font-semibold text-gray-900 flex-1">
                          <span dangerouslySetInnerHTML={{ 
                            __html: highlightSearchTerm(job.title, filters.searchQuery) 
                          }} />
                        </h2>
                        {job.remote && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Télétravail
                          </span>
                        )}
                      </div>
                      
                      {/* Nom de l'entreprise */}
                      <p className="text-gray-600 mb-3 font-medium">
                        <span dangerouslySetInnerHTML={{ 
                          __html: highlightSearchTerm(job.company, filters.searchQuery) 
                        }} />
                      </p>
                      
                      {/* Début de la description */}
                      <p className="text-gray-600 mb-4 text-sm line-clamp-3" dangerouslySetInnerHTML={{ 
                        __html: highlightSearchTerm(job.description?.substring(0, 200) + (job.description?.length > 200 ? '...' : ''), filters.searchQuery) 
                      }} />
                      
                      {/* Pourcentage de matching en évidence */}
                      {hasCV && job.matchPercentage !== undefined && (
                        <div className="mb-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm font-medium text-indigo-800">Compatibilité</span>
                            </div>
                            <div className={`px-3 py-1 rounded-full font-bold text-sm ${
                              job.matchPercentage >= 90 ? 'bg-green-100 text-green-800' :
                              job.matchPercentage >= 80 ? 'bg-blue-100 text-blue-800' :
                              job.matchPercentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {job.matchPercentage}%
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  job.matchPercentage >= 90 ? 'bg-green-500' :
                                  job.matchPercentage >= 80 ? 'bg-blue-500' :
                                  job.matchPercentage >= 70 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${job.matchPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}

                      
                      {/* Compétences */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.slice(0, 3).map((skill, skillIndex) => (
                            <span 
                              key={skillIndex} 
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              dangerouslySetInnerHTML={{ 
                                __html: highlightSearchTerm(skill, filters.searchQuery) 
                              }}
                            />
                          ))}
                          {job.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                              +{job.skills.length - 3} autres
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Localisation et date */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {job.postedDate}
                        </div>
                      </div>
                      
                      {/* Informations finales */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-green-600 font-medium">{job.salary}</span>
                          <span className="text-gray-500">{job.type}</span>
                          {job.source && (
                            <span className="text-blue-600 font-medium">{job.source}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Bouton Postuler */}
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApply(`${job.company}-${job.title}`);
                          }}
                          disabled={appliedJobs.has(`${job.company}-${job.title}`)}
                          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                            appliedJobs.has(`${job.company}-${job.title}`)
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {appliedJobs.has(`${job.company}-${job.title}`) ? 'Vous avez déjà postulé !' : 'Postuler'}
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Loading indicator pour le scroll infini */}
            {loading && !isInitialLoad && (
              <div ref={loadingRef} className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Chargement de plus d'offres...</span>
              </div>
            )}

            {/* Message de fin */}
            {!hasMore && jobs.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Vous avez vu toutes les offres disponibles</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4f46e5;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4f46e5;
          cursor: pointer;
          border: none;
        }
        
        .slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      </div>
    // </AuthGuard>
  );
} 