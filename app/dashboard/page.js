"use client";

import React, { useState, useEffect } from "react";
import MonthlyChart from "../components/MonthlyChart";

import { ApplicationsManager } from "../lib/applications";

export default function Dashboard() {
  const [selectedStatus, setSelectedStatus] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    interviewsScheduled: 0,
    offersReceived: 0,
    applicationsToday: 0,
    successRate: "0%"
  });
  const [applications, setApplications] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewType, setInterviewType] = useState('presentiel');
  const [interviewAddress, setInterviewAddress] = useState('');
  const [interviewTeamsLink, setInterviewTeamsLink] = useState('');

  // Charger les données depuis localStorage
  useEffect(() => {
    console.log('=== DÉBUT useEffect ===');
    
    const loadData = () => {
      console.log('=== DÉBUT loadData ===');
      
      // Test direct du localStorage
      const rawApplications = localStorage.getItem('applications');
      console.log('Raw localStorage applications:', rawApplications);
      
      const applicationsData = ApplicationsManager.getApplications();
      console.log('Applications récupérées:', applicationsData.length);
      console.log('Contenu des applications:', applicationsData);
      
      const statsData = ApplicationsManager.getStats();
      console.log('Stats récupérées:', statsData);
      
      console.log('Appel de getMonthlyStats...');
      const monthlyStatsData = ApplicationsManager.getMonthlyStats();
      console.log('Dashboard - monthlyStatsData reçu:', monthlyStatsData);
      console.log('Type de monthlyStatsData:', typeof monthlyStatsData);
      console.log('Longueur de monthlyStatsData:', monthlyStatsData ? monthlyStatsData.length : 'null/undefined');
      
      // Test direct de la logique de getMonthlyStats
      console.log('=== TEST DIRECT ===');
      const testApplications = applicationsData;
      console.log('Test applications:', testApplications.length);
      
      if (testApplications.length > 0) {
        const testMonthlyData = {};
        const firstDate = new Date(Math.min(...testApplications.map(app => new Date(app.appliedDate))));
        const lastDate = new Date(Math.max(...testApplications.map(app => new Date(app.appliedDate))));
        
        console.log('Test firstDate:', firstDate);
        console.log('Test lastDate:', lastDate);
        
        // Créer 2 mois pour l'affichage
        const currentMonth = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
        const monthKey1 = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
        const monthName1 = currentMonth.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        
        testMonthlyData[monthKey1] = {
          month: monthName1,
          total: 0,
          cvEnvoye: 0,
          entretien: 0,
          offreRecue: 0,
          offreRefusee: 0,
          refuse: 0
        };
        
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        const monthKey2 = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
        const monthName2 = currentMonth.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        
        testMonthlyData[monthKey2] = {
          month: monthName2,
          total: 0,
          cvEnvoye: 0,
          entretien: 0,
          offreRecue: 0,
          offreRefusee: 0,
          refuse: 0
        };
        
        // Compter les candidatures
        testApplications.forEach(app => {
          const appDate = new Date(app.appliedDate);
          const monthKey = `${appDate.getFullYear()}-${String(appDate.getMonth() + 1).padStart(2, '0')}`;
          
          if (testMonthlyData[monthKey]) {
            testMonthlyData[monthKey].total++;
            
            switch (app.status) {
              case 'CV envoyé':
                testMonthlyData[monthKey].cvEnvoye++;
                break;
              case 'Entretien programmé':
                testMonthlyData[monthKey].entretien++;
                break;
              case 'Offre reçue':
                testMonthlyData[monthKey].offreRecue++;
                break;
              case 'Offre refusée':
                testMonthlyData[monthKey].offreRefusee++;
                break;
              case 'Refusé':
                testMonthlyData[monthKey].refuse++;
                break;
            }
          }
        });
        
        const testResult = Object.values(testMonthlyData);
        console.log('Test result:', testResult);
        console.log('=== FIN TEST DIRECT ===');
      }
      
      const interviewsData = ApplicationsManager.getUpcomingInterviews();
      
      setApplications(applicationsData);
      setStats(statsData);
      setMonthlyData(monthlyStatsData);
      setUpcomingInterviews(interviewsData);
      console.log('=== FIN loadData ===');
      console.log('State monthlyData après setState:', monthlyStatsData);
      
      // Forcer l'affichage avec les données de test si monthlyStatsData est vide
      if (!monthlyStatsData || monthlyStatsData.length === 0) {
        console.log('=== FORÇAGE AFFICHAGE ===');
        const forcedData = [
          {
            month: "juil. 2025",
            total: 10,
            cvEnvoye: 5,
            entretien: 2,
            offreRecue: 1,
            offreRefusee: 2,
            refuse: 0
          },
          {
            month: "août 2025",
            total: 0,
            cvEnvoye: 0,
            entretien: 0,
            offreRecue: 0,
            offreRefusee: 0,
            refuse: 0
          }
        ];
        console.log('Données forcées:', forcedData);
        setMonthlyData(forcedData);
      }
    };

    // Vérifier si nous sommes côté client
    if (typeof window !== 'undefined') {
      console.log('Côté client détecté, chargement des données...');
      loadData();

      // Écouter les changements de localStorage
      const handleStorageChange = () => {
        loadData();
      };

      window.addEventListener('storage', handleStorageChange);
      
      // Polling pour les changements (car localStorage ne déclenche pas d'événement sur la même page)
      const interval = setInterval(loadData, 1000);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    } else {
      console.log('Côté serveur détecté, pas de localStorage disponible');
    }
  }, []);

  // Les candidatures sont maintenant chargées depuis localStorage via le state applications

  // Les applications récentes sont maintenant dérivées des vraies données
  const recentApplications = applications.slice(0, 4).map(app => ({
    id: app.id,
    company: app.company,
    position: app.jobTitle,
    status: app.status,
    date: app.appliedDate,
    location: app.location
  }));

  // Les entretiens à venir sont maintenant chargés depuis localStorage via le state upcomingInterviews

  const getStatusColor = (status) => {
    switch (status) {
      case 'Offre reçue':
        return 'bg-green-100 text-green-800';
      case 'Entretien programmé':
        return 'bg-blue-100 text-blue-800';
      case 'Offre refusée':
        return 'bg-red-100 text-red-800';
      case 'CV envoyé':
        return 'bg-gray-100 text-gray-800';
      case 'Refusé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour mettre à jour le statut d'une candidature
  const updateApplicationStatus = (applicationId, newStatus) => {
    if (newStatus === 'Entretien programmé') {
      // Ouvrir le modal pour choisir la date d'entretien
      const application = applications.find(app => app.id === applicationId);
      setSelectedApplication(application);
      setShowInterviewModal(true);
    } else {
      const success = ApplicationsManager.updateApplicationStatus(applicationId, newStatus);
      if (success) {
        // Les données seront automatiquement mises à jour via le useEffect
        console.log(`Statut mis à jour pour l'application ${applicationId}: ${newStatus}`);
      } else {
        console.error('Erreur lors de la mise à jour du statut');
      }
    }
  };

  // Fonction de test pour ajouter des données
  const addTestData = () => {
    const testApplications = [
      {
        id: 1,
        jobTitle: "Développeur Full Stack",
        company: "TechCorp",
        location: "Paris",
        status: "CV envoyé",
        appliedDate: "2025-07-15",
        lastUpdate: "2025-07-15",
        cvVersion: "CV_v2.pdf",
        coverLetter: "Lettre_TechCorp.pdf",
        notes: "Candidature envoyée via SkillMatchr",
        salary: "45000",
        type: "CDI",
        source: "LinkedIn"
      },
      {
        id: 2,
        jobTitle: "Développeur Backend",
        company: "StartupXYZ",
        location: "Lyon",
        status: "Entretien programmé",
        appliedDate: "2025-07-20",
        lastUpdate: "2025-07-22",
        cvVersion: "CV_v2.pdf",
        coverLetter: "Lettre_StartupXYZ.pdf",
        notes: "Candidature envoyée via SkillMatchr",
        salary: "50000",
        type: "CDI",
        source: "Indeed"
      },
      {
        id: 3,
        jobTitle: "Data Scientist",
        company: "BigData Inc",
        location: "Marseille",
        status: "Offre reçue",
        appliedDate: "2025-07-10",
        lastUpdate: "2025-07-25",
        cvVersion: "CV_v2.pdf",
        coverLetter: "Lettre_BigDataInc.pdf",
        notes: "Candidature envoyée via SkillMatchr",
        salary: "55000",
        type: "CDI",
        source: "Apec"
      },
      {
        id: 4,
        jobTitle: "DevOps Engineer",
        company: "CloudTech",
        location: "Toulouse",
        status: "Offre refusée",
        appliedDate: "2025-07-05",
        lastUpdate: "2025-07-18",
        cvVersion: "CV_v2.pdf",
        coverLetter: "Lettre_CloudTech.pdf",
        notes: "Candidature envoyée via SkillMatchr",
        salary: "48000",
        type: "CDI",
        source: "LinkedIn"
      },
      {
        id: 5,
        jobTitle: "Frontend Developer",
        company: "WebAgency",
        location: "Nantes",
        status: "CV envoyé",
        appliedDate: "2025-08-01",
        lastUpdate: "2025-08-01",
        cvVersion: "CV_v2.pdf",
        coverLetter: "Lettre_WebAgency.pdf",
        notes: "Candidature envoyée via SkillMatchr",
        salary: "42000",
        type: "CDI",
        source: "Indeed"
      }
    ];

    localStorage.setItem('applications', JSON.stringify(testApplications));
    
    const stats = {
      totalApplications: testApplications.length,
      pendingApplications: testApplications.filter(app => app.status === 'CV envoyé').length,
      interviewsScheduled: testApplications.filter(app => app.status === 'Entretien programmé').length,
      offersReceived: testApplications.filter(app => app.status === 'Offre reçue').length,
      successRate: Math.round((testApplications.filter(app => app.status === 'Offre reçue').length / testApplications.length) * 100) + "%"
    };

    localStorage.setItem('applicationStats', JSON.stringify(stats));
    
    console.log('Données de test ajoutées !');
    alert('Données de test ajoutées ! Rechargez la page.');
  };

  // Confirmer la programmation de l'entretien
  const confirmInterview = () => {
    if (!interviewDate || !interviewTime) {
      alert('Veuillez sélectionner une date et une heure pour l\'entretien');
      return;
    }

    // L'adresse est optionnelle pour les entretiens en présentiel

    if (interviewType === 'visio' && !interviewTeamsLink.trim()) {
      alert('Veuillez saisir le lien Teams pour l\'entretien');
      return;
    }

    const interviewDateTime = `${interviewDate}T${interviewTime}`;
    const interviewDetails = {
      dateTime: interviewDateTime,
      type: interviewType,
      address: interviewType === 'presentiel' ? interviewAddress : '',
      teamsLink: interviewType === 'visio' ? interviewTeamsLink : ''
    };

    const success = ApplicationsManager.updateApplicationStatus(
      selectedApplication.id, 
      'Entretien programmé',
      interviewDetails
    );

    if (success) {
      // Les données seront automatiquement mises à jour via le useEffect
      console.log(`Entretien programmé pour ${selectedApplication.company}: ${interviewDateTime}`);
      
      // Fermer le modal et réinitialiser
      setShowInterviewModal(false);
      setSelectedApplication(null);
      setInterviewDate('');
      setInterviewTime('');
      setInterviewType('presentiel');
      setInterviewAddress('');
      setInterviewTeamsLink('');
    } else {
      console.error('Erreur lors de la programmation de l\'entretien');
    }
  };

  // Filtrer les candidatures
  const filteredApplications = applications.filter(app => {
    const matchesStatus = selectedStatus === "Tous" || app.status === selectedStatus;
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Vue d'ensemble de vos candidatures et statistiques</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">CV envoyé</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pendingApplications}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Entretiens</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.interviewsScheduled}</p>
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
                  <p className="text-sm font-medium text-gray-600">Offres reçues</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.offersReceived}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Offre refusée</p>
                  <p className="text-2xl font-semibold text-gray-900">{applications.filter(app => app.status === 'Offre refusée').length}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Gestion des candidatures (intégrée depuis Applications) */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Gestion des candidatures</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Barre de recherche */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher une candidature..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {/* Filtre par statut */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Tous">Tous les statuts</option>
                    <option value="CV envoyé">CV envoyé</option>
                    <option value="Offre refusée">Offre refusée</option>
                    <option value="Entretien programmé">Entretien programmé</option>
                    <option value="Offre reçue">Offre reçue</option>
                    <option value="Refusé">Refusé</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Poste / Entreprise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localisation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date de candidature
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière mise à jour
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{application.jobTitle}</div>
                          <div className="text-sm text-gray-500">{application.company}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={application.status}
                          onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-indigo-500 ${getStatusColor(application.status)}`}
                        >
                          <option value="CV envoyé">CV envoyé</option>
                          <option value="Offre refusée">Offre refusée</option>
                          <option value="Entretien programmé">Entretien programmé</option>
                          <option value="Offre reçue">Offre reçue</option>
                          <option value="Refusé">Refusé</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(application.appliedDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.lastUpdate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          Voir détails
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts and Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Évolution mensuelle des candidatures</h3>
                <button
                  onClick={addTestData}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Ajouter données test
                </button>
              </div>

              <MonthlyChart key={monthlyData ? monthlyData.length : 0} monthlyData={monthlyData} />
            </div>

            {/* Upcoming Interviews */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Entretiens à venir</h3>
              <div className="space-y-4">
                {upcomingInterviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucun entretien programmé</p>
                ) : (
                  upcomingInterviews.map((interview) => (
                    <div key={interview.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{interview.company}</p>
                          <p className="text-sm text-gray-600">{interview.position}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-medium text-gray-900">{new Date(interview.date).toLocaleDateString('fr-FR')}</p>
                          <p className="text-sm text-gray-600">{interview.time}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          interview.type === 'Visioconférence' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {interview.type}
                        </span>
                      </div>
                      
                      {interview.type === 'Présentiel' && interview.address && interview.address.trim() && (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">📍 Adresse :</p>
                          <p className="whitespace-pre-wrap">{interview.address}</p>
                        </div>
                      )}
                      
                      {interview.type === 'Visioconférence' && interview.teamsLink && (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">🔗 Lien Teams :</p>
                          <a 
                            href={interview.teamsLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline break-all"
                          >
                            {interview.teamsLink}
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal pour programmer un entretien */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Programmer un entretien
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{selectedApplication?.company}</strong> - {selectedApplication?.jobTitle}
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de l'entretien
                </label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de l'entretien
                </label>
                <input
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'entretien
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="presentiel"
                      checked={interviewType === 'presentiel'}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Présentiel</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="visio"
                      checked={interviewType === 'visio'}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Visioconférence (Teams)</span>
                  </label>
                </div>
              </div>

              {interviewType === 'presentiel' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse de l'entretien
                  </label>
                  <textarea
                    value={interviewAddress}
                    onChange={(e) => setInterviewAddress(e.target.value)}
                    placeholder="Saisissez l'adresse complète..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                  />
                </div>
              )}

              {interviewType === 'visio' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lien Teams
                  </label>
                  <input
                    type="url"
                    value={interviewTeamsLink}
                    onChange={(e) => setInterviewTeamsLink(e.target.value)}
                    placeholder="https://teams.microsoft.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowInterviewModal(false);
                    setSelectedApplication(null);
                    setInterviewDate('');
                    setInterviewTime('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmInterview}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 