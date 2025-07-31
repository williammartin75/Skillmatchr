"use client";

import React, { useState, useEffect } from "react";
import Chart from "../components/Chart";

export default function Admin() {
  const [scrapers, setScrapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [runningScraper, setRunningScraper] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    totalApplications: 0,
    successRate: 0,
    revenue: 0
  });
  const [temporalStats, setTemporalStats] = useState({
    periodStats: [],
    globalStats: {},
    currentPeriod: '24h'
  });
  const [temporalStatsLoading, setTemporalStatsLoading] = useState(true);

  // Données simulées pour l'admin
  const scraperData = [
    {
      name: "LinkedIn Scraper",
      status: "running",
      lastRun: "2024-01-15 10:30:00",
      jobsFound: 1250,
      successRate: 95,
      avgTime: "2.5 min"
    },
    {
      name: "Indeed Scraper",
      status: "stopped",
      lastRun: "2024-01-15 09:15:00",
      jobsFound: 890,
      successRate: 88,
      avgTime: "3.2 min"
    },
    {
      name: "Apec Scraper",
      status: "running",
      lastRun: "2024-01-15 10:45:00",
      jobsFound: 567,
      successRate: 92,
      avgTime: "1.8 min"
    },
    {
      name: "Pôle Emploi Scraper",
      status: "error",
      lastRun: "2024-01-15 08:30:00",
      jobsFound: 0,
      successRate: 0,
      avgTime: "N/A"
    },
    {
      name: "Welcome to the Jungle Scraper",
      status: "stopped",
      lastRun: "2024-01-15 07:45:00",
      jobsFound: 234,
      successRate: 85,
      avgTime: "2.1 min"
    },
    {
      name: "RegionsJob Scraper",
      status: "running",
      lastRun: "2024-01-15 10:20:00",
      jobsFound: 445,
      successRate: 90,
      avgTime: "2.8 min"
    },
    {
      name: "Cadremploi Scraper",
      status: "stopped",
      lastRun: "2024-01-15 06:30:00",
      jobsFound: 123,
      successRate: 78,
      avgTime: "3.5 min"
    },
    {
      name: "Meteojob Scraper",
      status: "running",
      lastRun: "2024-01-15 10:35:00",
      jobsFound: 678,
      successRate: 87,
      avgTime: "2.3 min"
    },
    {
      name: "Jobijoba Scraper",
      status: "stopped",
      lastRun: "2024-01-15 05:15:00",
      jobsFound: 89,
      successRate: 82,
      avgTime: "2.9 min"
    }
  ];

  // Fonction pour charger les statistiques des scrapers
  const loadScraperStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scrapers/stats');
      const data = await response.json();
      
      if (data.success) {
        const scrapersArray = Object.entries(data.scrapers).map(([key, scraper]) => ({
          id: key,
          ...scraper,
          lastExecution: scraper.lastExecution ? new Date(scraper.lastExecution).toLocaleString('fr-FR') : 'Jamais exécuté',
          nextExecution: scraper.lastExecution ? new Date(new Date(scraper.lastExecution).getTime() + 24 * 60 * 60 * 1000).toLocaleString('fr-FR') : 'Non programmé'
        }));
        setScrapers(scrapersArray);
      }
    } catch (error) {
      console.error('Erreur chargement stats scrapers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour actualiser manuellement les scrapers
  const refreshScrapers = async () => {
    try {
      setRefreshing(true);
      await loadScraperStats();
      console.log('✅ Actualisation des scrapers terminée');
    } catch (error) {
      console.error('❌ Erreur lors de l\'actualisation:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Fonction pour déclencher un scraper
  const triggerScraper = async (scraperId) => {
    try {
      setRunningScraper(scraperId);
      
      if (scraperId === 'apec') {
        const response = await fetch('/api/scrapers/apec', { method: 'POST' });
        const data = await response.json();
        
        if (data.success) {
          console.log('✅ Scraper APEC déclenché avec succès');
          // Recharger les statistiques
          await loadScraperStats();
        } else {
          console.error('❌ Erreur déclenchement scraper:', data.error);
        }
      } else if (scraperId === 'jobteaser') {
        const response = await fetch('/api/scrapers/jobteaser', { method: 'POST' });
        const data = await response.json();
        
        if (data.success) {
          console.log('✅ Scraper JobTeaser déclenché avec succès');
          // Recharger les statistiques
          await loadScraperStats();
        } else {
          console.error('❌ Erreur déclenchement scraper:', data.error);
        }
      }
    } catch (error) {
      console.error('Erreur déclenchement scraper:', error);
    } finally {
      setRunningScraper(null);
    }
  };

  // Fonction pour charger les utilisateurs récents
  const loadRecentUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await fetch('/api/admin/users?limit=10');
      const data = await response.json();
      
      if (data.success) {
        setRecentUsers(data.users);
        // Mettre à jour les statistiques avec les vraies données
        setStats(prev => ({
          ...prev,
          totalUsers: data.stats.totalUsers,
          activeUsers: data.stats.activeUsers,
          totalApplications: data.stats.totalApplications,
          premiumUsers: data.stats.profileTypeStats ? data.stats.profileTypeStats.premium : 0,
          professionalUsers: data.stats.profileTypeStats ? data.stats.profileTypeStats.professionnel : 0
        }));
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fonction pour actualiser les utilisateurs
  const refreshUsers = async () => {
    await loadRecentUsers();
  };

  // Fonction pour charger les statistiques temporelles
  const loadTemporalStats = async (period = '24h') => {
    try {
      setTemporalStatsLoading(true);
      const response = await fetch(`/api/admin/statistics?period=${period}`);
      const data = await response.json();
      
      if (data.success) {
        setTemporalStats(data);
      }
    } catch (error) {
      console.error('Erreur chargement statistiques temporelles:', error);
    } finally {
      setTemporalStatsLoading(false);
    }
  };

  // Fonction pour actualiser les statistiques temporelles
  const refreshTemporalStats = async () => {
    await loadTemporalStats(temporalStats.currentPeriod);
  };

  // Charger les statistiques au montage du composant
  useEffect(() => {
    loadScraperStats();
    loadRecentUsers();
    loadTemporalStats();
  }, []);

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
              <a href="/admin" className="text-indigo-600 font-semibold">Administration</a>
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
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">AD</span>
                </div>
                <span className="text-gray-700 font-medium">Admin</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
            <p className="text-gray-600 mt-2">Tableau de bord administrateur - Statistiques et gestion des utilisateurs</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total utilisateurs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Utilisateurs Premium</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.premiumUsers ? stats.premiumUsers.toLocaleString() : '0'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Utilisateurs Professionnels</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.professionalUsers ? stats.professionalUsers.toLocaleString() : '0'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Candidatures totales</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalApplications.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenus (€)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.revenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Temporal Statistics */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Statistiques temporelles</h2>
                  <div className="flex items-center space-x-4">
                    <select 
                      value={temporalStats.currentPeriod}
                      onChange={(e) => {
                        setTemporalStats(prev => ({ ...prev, currentPeriod: e.target.value }));
                        loadTemporalStats(e.target.value);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="24h">Dernières 24h</option>
                      <option value="1w">Il y a une semaine</option>
                      <option value="2w">Il y a deux semaines</option>
                      <option value="3w">Il y a trois semaines</option>
                      <option value="1m">Il y a 1 mois</option>
                      <option value="2m">Il y a 2 mois</option>
                      <option value="3m">Il y a 3 mois</option>
                      <option value="6m">Il y a 6 mois</option>
                      <option value="1y">Il y a 1 an</option>
                    </select>
                    <button 
                      onClick={refreshTemporalStats}
                      disabled={temporalStatsLoading}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        temporalStatsLoading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {temporalStatsLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Chargement...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Actualiser
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {temporalStatsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-2 text-gray-600">Chargement des statistiques...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Statistiques actuelles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">Candidatures envoyées</h3>
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {temporalStats.periodStats[0]?.applicationsSent || 0}
                        </p>
                        <p className="text-sm text-gray-500">Dernières 24h</p>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">Taux de réponse</h3>
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {temporalStats.periodStats[0]?.responseRate || 0}%
                        </p>
                        <p className="text-sm text-gray-500">Dernières 24h</p>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">Temps moyen</h3>
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {temporalStats.periodStats[0]?.avgApplicationTime || 0} min
                        </p>
                        <p className="text-sm text-gray-500">Par candidature</p>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">Utilisateurs actifs</h3>
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {temporalStats.periodStats[0]?.activeUsers || 0}
                        </p>
                        <p className="text-sm text-gray-500">Dernières 24h</p>
                      </div>
                    </div>
                    
                    {/* Tableau des statistiques par période */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Période
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Candidatures
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Taux de réponse
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Temps moyen
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Utilisateurs actifs
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {temporalStats.periodStats?.slice(0, 5).map((stat, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {stat.period}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {stat.applicationsSent}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  stat.responseRate > 50 ? 'bg-green-100 text-green-800' :
                                  stat.responseRate > 25 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {stat.responseRate}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {stat.avgApplicationTime} min
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {stat.activeUsers}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
                )}
              </div>

              {/* Scrapers */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Scrapers</h2>
                    <button 
                      onClick={refreshScrapers}
                      disabled={refreshing}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        refreshing
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {refreshing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Actualisation...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Actualiser
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span className="ml-2 text-gray-600">Chargement des scrapers...</span>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Scraper
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dernière exécution
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Prochaine exécution
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Offres du jour
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total offres
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {scrapers.map((scraper) => (
                          <tr key={scraper.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{scraper.name}</div>
                                <div className="text-sm text-gray-500">{scraper.source}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>{scraper.lastExecution}</div>
                              <div className="text-xs text-gray-400">Programmé à {scraper.schedule}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {scraper.nextExecution}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{scraper.jobsToday}</div>
                              <div className="text-xs text-gray-500">offres aujourd'hui</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {scraper.totalJobs.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                scraper.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {scraper.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => triggerScraper(scraper.id)}
                                disabled={runningScraper === scraper.id}
                                className={`mr-3 px-3 py-1 rounded text-sm font-medium ${
                                  runningScraper === scraper.id
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                              >
                                {runningScraper === scraper.id ? 'En cours...' : 'Déclencher'}
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">Configurer</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Recent Users */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Utilisateurs récents</h2>
                    <button 
                      onClick={refreshUsers}
                      disabled={usersLoading}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        usersLoading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {usersLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Chargement...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Actualiser
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {usersLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span className="ml-2 text-gray-600">Chargement des utilisateurs...</span>
                    </div>
                  ) : recentUsers.length === 0 ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <p className="text-gray-500">Aucun utilisateur inscrit pour le moment</p>
                      </div>
                    </div>
                  ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date d'inscription
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Candidatures
                        </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type de profil
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.joinDate).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.applications}
                          </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user.profileType === 'professionnel' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : user.profileType === 'premium'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.profileType === 'professionnel' ? 'Professionnel' :
                                 user.profileType === 'premium' ? 'Premium' : 'Free'}
                              </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-3">Voir</button>
                            <button className="text-gray-600 hover:text-gray-900">Modifier</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Exporter les données
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Gérer les utilisateurs
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Voir les logs système
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Paramètres avancés
                  </button>
                </div>
              </div>

                             {/* System Status */}
               <div className="bg-white rounded-lg shadow p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">État du système</h3>
                 <div className="space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-600">Serveur principal</span>
                     <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Opérationnel</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-600">Base de données</span>
                     <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Opérationnel</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-600">Scrapers</span>
                     <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">En cours</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-600">API externe</span>
                     <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Opérationnel</span>
                   </div>
                 </div>
               </div>

               {/* Satisfaction Chart */}
               <Chart
                 type="pie"
                 title="Satisfaction utilisateurs"
                 data={[
                   { label: "Très satisfait", value: 45 },
                   { label: "Satisfait", value: 35 },
                   { label: "Neutre", value: 15 },
                   { label: "Insatisfait", value: 5 }
                 ]}
                 color="green"
               />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 