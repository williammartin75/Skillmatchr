// Gestion des candidatures avec localStorage
export const ApplicationsManager = {
  // Récupérer toutes les candidatures
  getApplications: () => {
    try {
      const applications = localStorage.getItem('applications');
      return applications ? JSON.parse(applications) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des candidatures:', error);
      return [];
    }
  },

  // Ajouter une nouvelle candidature
  addApplication: (jobData) => {
    try {
      const applications = ApplicationsManager.getApplications();
      const newApplication = {
        id: Date.now(),
        jobTitle: jobData.title,
        company: jobData.company || 'Entreprise non spécifiée',
        location: jobData.location,
        status: 'CV envoyé',
        appliedDate: new Date().toISOString().split('T')[0],
        lastUpdate: new Date().toISOString().split('T')[0],
        cvVersion: 'CV_v2.pdf',
        coverLetter: 'Lettre_' + (jobData.company || 'Entreprise').replace(/\s+/g, '') + '.pdf',
        notes: 'Candidature envoyée via SkillMatchr',
        salary: jobData.salary,
        type: jobData.type,
        source: jobData.source
      };
      
      applications.push(newApplication);
      localStorage.setItem('applications', JSON.stringify(applications));
      
      // Mettre à jour les statistiques
      ApplicationsManager.updateStats();
      
      return newApplication;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la candidature:', error);
      return null;
    }
  },

  // Mettre à jour le statut d'une candidature
  updateApplicationStatus: (applicationId, newStatus, interviewDetails = null) => {
    try {
      const applications = ApplicationsManager.getApplications();
      const updatedApplications = applications.map(app => {
        if (app.id === applicationId) {
          const update = { 
            ...app, 
            status: newStatus, 
            lastUpdate: new Date().toISOString().split('T')[0] 
          };
          
          // Si c'est un entretien programmé, ajouter les détails d'entretien
          if (newStatus === 'Entretien programmé' && interviewDetails) {
            update.interviewDate = interviewDetails.dateTime;
            update.interviewType = interviewDetails.type;
            update.interviewAddress = interviewDetails.address;
            update.interviewTeamsLink = interviewDetails.teamsLink;
          }
          
          return update;
        }
        return app;
      });
      
      localStorage.setItem('applications', JSON.stringify(updatedApplications));
      ApplicationsManager.updateStats();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return false;
    }
  },

  // Récupérer les statistiques
  getStats: () => {
    try {
      const stats = localStorage.getItem('applicationStats');
      return stats ? JSON.parse(stats) : {
        totalApplications: 0,
        pendingApplications: 0,
        interviewsScheduled: 0,
        offersReceived: 0,
        successRate: "0%"
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        totalApplications: 0,
        pendingApplications: 0,
        interviewsScheduled: 0,
        offersReceived: 0,
        successRate: "0%"
      };
    }
  },

  // Mettre à jour les statistiques
  updateStats: () => {
    try {
      const applications = ApplicationsManager.getApplications();
      
      const stats = {
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'CV envoyé').length,
        interviewsScheduled: applications.filter(app => app.status === 'Entretien programmé').length,
        offersReceived: applications.filter(app => app.status === 'Offre reçue').length,
        successRate: applications.length > 0 
          ? Math.round((applications.filter(app => app.status === 'Offre reçue').length / applications.length) * 100) + "%"
          : "0%"
      };
      
      localStorage.setItem('applicationStats', JSON.stringify(stats));
      return stats;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statistiques:', error);
      return null;
    }
  },

  // Obtenir les statistiques mensuelles pour le graphique
  getMonthlyStats: () => {
    console.log('=== DÉBUT getMonthlyStats ===');
    try {
      const applications = ApplicationsManager.getApplications();
      console.log('Applications pour getMonthlyStats:', applications.length);
      const monthlyData = {};
      
      if (applications.length === 0) {
        console.log('Aucune application trouvée');
        return [];
      }
      
      // Trouver le mois de la première candidature
      const firstApplicationDate = new Date(Math.min(...applications.map(app => new Date(app.appliedDate))));
      const startMonth = new Date(firstApplicationDate.getFullYear(), firstApplicationDate.getMonth(), 1);
      
      console.log('Première candidature:', firstApplicationDate);
      console.log('Mois de début:', startMonth);
      
      // Trouver le mois actuel (ou le mois de la dernière candidature si elle est dans le futur)
      const today = new Date();
      const lastApplicationDate = new Date(Math.max(...applications.map(app => new Date(app.appliedDate))));
      const endMonth = new Date(Math.max(today.getFullYear(), lastApplicationDate.getFullYear()), 
                               Math.max(today.getMonth(), lastApplicationDate.getMonth()), 1);
      
      console.log('Mois de fin:', endMonth);
      
                      // Si toutes les applications sont dans le même mois, créer seulement ce mois
                if (startMonth.getTime() === endMonth.getTime()) {
                  console.log('Toutes les applications sont dans le même mois, création d\'un seul mois pour l\'affichage');
                  const currentMonth = new Date(startMonth);

                  // Mois actuel seulement
                  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
                  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

                  monthlyData[monthKey] = {
                    month: monthName,
                    total: 0,
                    cvEnvoye: 0,
                    entretien: 0,
                    offreRecue: 0,
                    offreRefusee: 0,
                    refuse: 0
                  };
                } else {
        // Générer tous les mois entre la première candidature et maintenant
        const currentMonth = new Date(startMonth);
        while (currentMonth <= endMonth) {
          const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`; // Format YYYY-MM
          const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
          
          console.log(`Génération mois: ${monthKey} -> ${monthName}`);
          
          monthlyData[monthKey] = {
            month: monthName,
            total: 0,
            cvEnvoye: 0,
            entretien: 0,
            offreRecue: 0,
            offreRefusee: 0,
            refuse: 0
          };
          
          // Passer au mois suivant
          currentMonth.setMonth(currentMonth.getMonth() + 1);
        }
      }
      
      // Compter les candidatures par mois
      applications.forEach(app => {
        const appDate = new Date(app.appliedDate);
        const monthKey = `${appDate.getFullYear()}-${String(appDate.getMonth() + 1).padStart(2, '0')}`;
        
        console.log(`Application ${app.jobTitle}: date=${app.appliedDate}, appDate=${appDate}, monthKey=${monthKey}, status=${app.status}`);
        console.log(`monthlyData[${monthKey}] existe:`, !!monthlyData[monthKey]);
        
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].total++;
          
          switch (app.status) {
            case 'CV envoyé':
              monthlyData[monthKey].cvEnvoye++;
              break;
            case 'Entretien programmé':
              monthlyData[monthKey].entretien++;
              break;
            case 'Offre reçue':
              monthlyData[monthKey].offreRecue++;
              break;
            case 'Offre refusée':
              monthlyData[monthKey].offreRefusee++;
              break;
            case 'Refusé':
              monthlyData[monthKey].refuse++;
              break;
          }
        }
      });
      
      const result = Object.values(monthlyData);
      console.log('Résultat getMonthlyStats:', result);
      console.log('Structure du premier élément:', result[0]);
      console.log('Toutes les clés:', Object.keys(monthlyData));
      console.log('Nombre total de candidatures:', applications.length);
      console.log('Candidatures par statut:', {
        cvEnvoye: applications.filter(app => app.status === 'CV envoyé').length,
        entretien: applications.filter(app => app.status === 'Entretien programmé').length,
        offreRecue: applications.filter(app => app.status === 'Offre reçue').length,
        offreRefusee: applications.filter(app => app.status === 'Offre refusée').length,
        refuse: applications.filter(app => app.status === 'Refusé').length
      });
      return result;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques mensuelles:', error);
      return [];
    }
  },

  // Obtenir les entretiens à venir
  getUpcomingInterviews: () => {
    try {
      const applications = ApplicationsManager.getApplications();
      const today = new Date();
      
      const upcomingInterviews = applications
        .filter(app => app.status === 'Entretien programmé' && app.interviewDate)
        .map(app => {
          const interviewDate = new Date(app.interviewDate);
          return {
            id: app.id,
            company: app.company,
            position: app.jobTitle,
            date: interviewDate.toISOString().split('T')[0],
            time: interviewDate.toTimeString().slice(0, 5),
            type: app.interviewType === 'visio' ? 'Visioconférence' : 'Présentiel',
            address: app.interviewAddress || '',
            teamsLink: app.interviewTeamsLink || '',
            interviewDate: app.interviewDate
          };
        })
        .filter(interview => new Date(interview.interviewDate) >= today)
        .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
        .slice(0, 5); // Limiter à 5 entretiens
      
      return upcomingInterviews;
    } catch (error) {
      console.error('Erreur lors de la récupération des entretiens à venir:', error);
      return [];
    }
  }
}; 