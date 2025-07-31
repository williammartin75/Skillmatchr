// Configuration et gestion des identifiants
let credentials = {
    apec: { email: '', password: '', enabled: false },
    linkedin: { email: '', password: '', enabled: false },
    indeed: { email: '', password: '', enabled: false },
    poleemploi: { email: '', password: '', enabled: false }
};

let currentProfile = null;
let currentJob = null;

// Éléments DOM
const elements = {
    // Configuration
    apiUrl: document.getElementById('apiUrl'),
    userId: document.getElementById('userId'),
    
    // Identifiants
    apecEmail: document.getElementById('apecEmail'),
    apecPassword: document.getElementById('apecPassword'),
    apecEnabled: document.getElementById('apecEnabled'),
    linkedinEmail: document.getElementById('linkedinEmail'),
    linkedinPassword: document.getElementById('linkedinPassword'),
    linkedinEnabled: document.getElementById('linkedinEnabled'),
    indeedEmail: document.getElementById('indeedEmail'),
    indeedPassword: document.getElementById('indeedPassword'),
    indeedEnabled: document.getElementById('indeedEnabled'),
    poleemploiEmail: document.getElementById('poleemploiEmail'),
    poleemploiPassword: document.getElementById('poleemploiPassword'),
    poleemploiEnabled: document.getElementById('poleemploiEnabled'),
    
    // Actions
    saveCredentials: document.getElementById('saveCredentials'),
    testConnection: document.getElementById('testConnection'),
    
    // Profils
    profileSelect: document.getElementById('profileSelect'),
    profileInfo: document.getElementById('profileInfo'),
    
    // Offres
    jobInfo: document.getElementById('jobInfo'),
    applyButton: document.getElementById('applyButton'),
    
    // Messages
    messageContainer: document.getElementById('messageContainer'),
    
    // Onglets
    tabButtons: document.querySelectorAll('.tab-button'),
    tabContents: document.querySelectorAll('.tab-content')
};

console.log('🔧 [DEBUG] Éléments DOM récupérés:', Object.keys(elements));

// Charger la configuration
async function loadConfig() {
    console.log('🔧 [DEBUG] Chargement de la configuration...');
    
    try {
        const result = await chrome.storage.sync.get(['apiUrl', 'userId']);
        console.log('📋 [DEBUG] Configuration récupérée:', result);
        
        if (result.apiUrl) {
            elements.apiUrl.value = result.apiUrl;
            console.log('✅ [DEBUG] URL API chargée:', result.apiUrl);
        } else {
            console.log('⚠️ [DEBUG] Aucune URL API trouvée, utilisation de la valeur par défaut');
        }
        
        if (result.userId) {
            elements.userId.value = result.userId;
            console.log('✅ [DEBUG] User ID chargé:', result.userId);
        } else {
            console.log('⚠️ [DEBUG] Aucun User ID trouvé');
        }
        
        console.log('✅ [DEBUG] Configuration chargée avec succès');
    } catch (error) {
        console.error('❌ [DEBUG] Erreur lors du chargement de la configuration:', error);
        logMessage('Erreur lors du chargement de la configuration', 'error');
    }
}

// Sauvegarder la configuration
async function saveConfig() {
    console.log('💾 [DEBUG] Sauvegarde de la configuration...');
    
    try {
        const config = {
            apiUrl: elements.apiUrl.value,
            userId: elements.userId.value
        };
        
        console.log('📋 [DEBUG] Configuration à sauvegarder:', config);
        await chrome.storage.sync.set(config);
        console.log('✅ [DEBUG] Configuration sauvegardée avec succès');
        logMessage('Configuration sauvegardée', 'success');
    } catch (error) {
        console.error('❌ [DEBUG] Erreur lors de la sauvegarde de la configuration:', error);
        logMessage('Erreur lors de la sauvegarde', 'error');
    }
}

// Charger les identifiants
async function loadCredentials() {
    console.log('🔧 [DEBUG] Chargement des identifiants...');
    
    try {
        const result = await chrome.storage.sync.get(['credentials']);
        console.log('📋 [DEBUG] Identifiants récupérés:', result);
        
        if (result.credentials) {
            credentials = { ...credentials, ...result.credentials };
            console.log('✅ [DEBUG] Identifiants chargés:', credentials);
            
            // Mettre à jour l'interface
            updateCredentialsUI();
        } else {
            console.log('⚠️ [DEBUG] Aucun identifiant trouvé, utilisation des valeurs par défaut');
        }
        
        console.log('✅ [DEBUG] Chargement des identifiants terminé');
    } catch (error) {
        console.error('❌ [DEBUG] Erreur lors du chargement des identifiants:', error);
        logMessage('Erreur lors du chargement des identifiants', 'error');
    }
}

// Sauvegarder les identifiants
async function saveCredentials() {
    console.log('💾 [DEBUG] Sauvegarde des identifiants...');
    
    try {
        // Récupérer les valeurs depuis l'interface
        credentials.apec.email = elements.apecEmail.value;
        credentials.apec.password = elements.apecPassword.value;
        credentials.apec.enabled = elements.apecEnabled.checked;
        
        credentials.linkedin.email = elements.linkedinEmail.value;
        credentials.linkedin.password = elements.linkedinPassword.value;
        credentials.linkedin.enabled = elements.linkedinEnabled.checked;
        
        credentials.indeed.email = elements.indeedEmail.value;
        credentials.indeed.password = elements.indeedPassword.value;
        credentials.indeed.enabled = elements.indeedEnabled.checked;
        
        credentials.poleemploi.email = elements.poleemploiEmail.value;
        credentials.poleemploi.password = elements.poleemploiPassword.value;
        credentials.poleemploi.enabled = elements.poleemploiEnabled.checked;
        
        console.log('📋 [DEBUG] Identifiants à sauvegarder:', credentials);
        await chrome.storage.sync.set({ credentials });
        console.log('✅ [DEBUG] Identifiants sauvegardés avec succès');
        logMessage('Identifiants sauvegardés', 'success');
    } catch (error) {
        console.error('❌ [DEBUG] Erreur lors de la sauvegarde des identifiants:', error);
        logMessage('Erreur lors de la sauvegarde', 'error');
    }
}

// Mettre à jour l'interface des identifiants
function updateCredentialsUI() {
    console.log('🎨 [DEBUG] Mise à jour de l\'interface des identifiants...');
    
    try {
        // APEC
        elements.apecEmail.value = credentials.apec.email;
        elements.apecPassword.value = credentials.apec.password;
        elements.apecEnabled.checked = credentials.apec.enabled;
        
        // LinkedIn
        elements.linkedinEmail.value = credentials.linkedin.email;
        elements.linkedinPassword.value = credentials.linkedin.password;
        elements.linkedinEnabled.checked = credentials.linkedin.enabled;
        
        // Indeed
        elements.indeedEmail.value = credentials.indeed.email;
        elements.indeedPassword.value = credentials.indeed.password;
        elements.indeedEnabled.checked = credentials.indeed.enabled;
        
        // Pôle Emploi
        elements.poleemploiEmail.value = credentials.poleemploi.email;
        elements.poleemploiPassword.value = credentials.poleemploi.password;
        elements.poleemploiEnabled.checked = credentials.poleemploi.enabled;
        
        console.log('✅ [DEBUG] Interface des identifiants mise à jour');
    } catch (error) {
        console.error('❌ [DEBUG] Erreur lors de la mise à jour de l\'interface:', error);
    }
}

// Test de connexion
async function testConnection() {
    console.log('🔗 [DEBUG] Test de connexion demandé');
    
    try {
        // Déterminer l'onglet actif
        const activeTab = document.querySelector('.tab-button.active');
        if (!activeTab) {
            console.error('❌ [DEBUG] Aucun onglet actif trouvé');
            throw new Error('Aucun onglet actif');
        }
        
        const site = activeTab.dataset.tab;
        console.log('🎯 [DEBUG] Site sélectionné pour le test:', site);
        
        if (!credentials[site] || !credentials[site].enabled) {
            console.error('❌ [DEBUG] Site non configuré ou désactivé:', site);
            throw new Error(`Site ${site} non configuré ou désactivé`);
        }
        
        if (!credentials[site].email || !credentials[site].password) {
            console.error('❌ [DEBUG] Identifiants manquants pour:', site);
            throw new Error(`Identifiants manquants pour ${site}`);
        }
        
        console.log('📧 [DEBUG] Email utilisé:', credentials[site].email);
        
        // Obtenir l'onglet actif
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            console.error('❌ [DEBUG] Aucun onglet actif trouvé');
            throw new Error('Aucun onglet actif');
        }
        
        console.log('🌐 [DEBUG] Onglet actif:', tab.url);
        
        // Envoyer le message de test
        console.log('📨 [DEBUG] Envoi du message de test...');
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'testConnection',
            credentials: credentials[site],
            site: site
        });
        
        console.log('📨 [DEBUG] Réponse reçue:', response);
        
        if (response.success) {
            console.log('✅ [DEBUG] Test de connexion réussi');
            logMessage(`Connexion ${site} réussie`, 'success');
        } else {
            console.error('❌ [DEBUG] Test de connexion échoué:', response.error);
            logMessage(`Erreur de connexion ${site}: ${response.error}`, 'error');
        }
        
    } catch (error) {
        console.error('❌ [DEBUG] Erreur lors du test de connexion:', error);
        logMessage(`Erreur: ${error.message}`, 'error');
    }
}

// Charger les profils
async function loadProfiles() {
    console.log('👤 [DEBUG] Chargement des profils...');
    
    try {
        const apiUrl = elements.apiUrl.value || 'http://localhost:3001';
        const userId = elements.userId.value;
        
        if (!userId) {
            console.warn('⚠️ [DEBUG] Aucun User ID configuré');
            return;
        }
        
        console.log('🌐 [DEBUG] URL API:', apiUrl);
        console.log('🆔 [DEBUG] User ID:', userId);
        
        const response = await fetch(`${apiUrl}/api/user/profiles`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 [DEBUG] Réponse API reçue:', response.status);
        
        if (!response.ok) {
            console.error('❌ [DEBUG] Erreur API:', response.status, response.statusText);
            throw new Error(`Erreur API: ${response.status}`);
        }
        
        const profiles = await response.json();
        console.log('📋 [DEBUG] Profils récupérés:', profiles);
        
        // Vider le select
        elements.profileSelect.innerHTML = '<option value="">Sélectionner un profil</option>';
        
        // Ajouter les profils
        profiles.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.id;
            option.textContent = profile.name;
            elements.profileSelect.appendChild(option);
        });
        
        console.log('✅ [DEBUG] Profils chargés avec succès');
        
    } catch (error) {
        console.error('❌ [DEBUG] Erreur lors du chargement des profils:', error);
        logMessage('Erreur lors du chargement des profils', 'error');
    }
}

// Afficher les informations du profil
function displayProfile(profile) {
    console.log('👤 [DEBUG] Affichage du profil:', profile);
    
    try {
        if (!profile) {
            elements.profileInfo.innerHTML = '<p>Aucun profil sélectionné</p>';
            console.log('⚠️ [DEBUG] Aucun profil à afficher');
            return;
        }
        
        elements.profileInfo.innerHTML = `
            <h3>${profile.name}</h3>
            <p><strong>Email:</strong> ${profile.email}</p>
            <p><strong>Téléphone:</strong> ${profile.phone || 'Non renseigné'}</p>
            <p><strong>CV:</strong> ${profile.cv ? 'Disponible' : 'Non disponible'}</p>
            <p><strong>Lettre de motivation:</strong> ${profile.coverLetter ? 'Disponible' : 'Non disponible'}</p>
        `;
        
        console.log('✅ [DEBUG] Profil affiché avec succès');
        
    } catch (error) {
        console.error('❌ [DEBUG] Erreur lors de l\'affichage du profil:', error);
    }
}

// Détecter l'offre d'emploi
async function detectJobOffer() {
    console.log('🔍 [DEBUG] Détection de l\'offre d\'emploi...');
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            console.error('❌ [DEBUG] Aucun onglet actif trouvé');
            throw new Error('Aucun onglet actif');
        }
        
        console.log('🌐 [DEBUG] Onglet actif:', tab.url);
        
        // Vérifier que l'onglet est sur un site supporté
        const supportedSites = ['linkedin.com', 'indeed.fr', 'indeed.com', 'apec.fr', 'pole-emploi.fr', 'francetravail.fr'];
        const isSupported = supportedSites.some(site => tab.url.includes(site));
        
        if (!isSupported) {
            console.error('❌ [DEBUG] Site non supporté:', tab.url);
            throw new Error('Site non supporté. Veuillez naviguer vers LinkedIn, Indeed, APEC ou Pôle Emploi.');
        }
        
        console.log('✅ [DEBUG] Site supporté détecté');
        
        // Envoyer le message de détection
        console.log('📨 [DEBUG] Envoi du message de détection...');
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'detectJob'
        });
        
        console.log('📨 [DEBUG] Réponse de détection reçue:', response);
        
        if (response.success) {
            currentJob = response.job;
            console.log('✅ [DEBUG] Offre détectée:', currentJob);
            displayJob(currentJob);
            logMessage('Offre détectée avec succès', 'success');
        } else {
            console.error('❌ [DEBUG] Échec de la détection:', response.error);
            logMessage(`Erreur de détection: ${response.error}`, 'error');
        }
        
    } catch (error) {
        console.error('❌ [DEBUG] Erreur lors de la détection:', error);
        logMessage(`Erreur: ${error.message}`, 'error');
    }
}

// Afficher les informations de l'offre
function displayJob(job) {
    console.log('📋 [DEBUG] Affichage de l\'offre:', job);
    
    try {
        if (!job) {
            elements.jobInfo.innerHTML = '<p>Aucune offre détectée</p>';
            console.log('⚠️ [DEBUG] Aucune offre à afficher');
            return;
        }
        
        elements.jobInfo.innerHTML = `
            <h3>${job.title || 'Titre non disponible'}</h3>
            <p><strong>Entreprise:</strong> ${job.company || 'Non spécifiée'}</p>
            <p><strong>Localisation:</strong> ${job.location || 'Non spécifiée'}</p>
            <p><strong>Type:</strong> ${job.type || 'Non spécifié'}</p>
            <p><strong>URL:</strong> <a href="${job.url}" target="_blank">Voir l'offre</a></p>
        `;
        
        console.log('✅ [DEBUG] Offre affichée avec succès');
        
    } catch (error) {
        console.error('❌ [DEBUG] Erreur lors de l\'affichage de l\'offre:', error);
    }
}

// Postuler à l'offre
async function applyToJob() {
    console.log('📝 [DEBUG] Candidature à l\'offre...');
    
    try {
        if (!currentJob) {
            console.error('❌ [DEBUG] Aucune offre sélectionnée');
            throw new Error('Aucune offre sélectionnée');
        }
        
        if (!currentProfile) {
            console.error('❌ [DEBUG] Aucun profil sélectionné');
            throw new Error('Aucun profil sélectionné');
        }
        
        console.log('📋 [DEBUG] Offre:', currentJob);
        console.log('👤 [DEBUG] Profil:', currentProfile);
        
        // Vérifier qu'au moins un site est configuré
        const enabledSites = Object.keys(credentials).filter(site =>
            credentials[site].enabled &&
            credentials[site].email &&
            credentials[site].password
        );
        
        console.log('✅ [DEBUG] Sites activés:', enabledSites);
        
        if (enabledSites.length === 0) {
            console.error('❌ [DEBUG] Aucun site configuré pour la candidature automatique');
            throw new Error('Aucun site configuré pour la candidature automatique');
        }
        
        // Préparer les données de candidature
        const applicationData = {
            job: currentJob,
            profile: currentProfile,
            credentials: credentials
        };
        
        console.log('📋 [DEBUG] Données de candidature préparées:', applicationData);
        
        // Obtenir l'onglet actif
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            console.error('❌ [DEBUG] Aucun onglet actif trouvé');
            throw new Error('Aucun onglet actif');
        }
        
        console.log('🌐 [DEBUG] Onglet actif:', tab.url);
        
        // Envoyer le message de candidature
        console.log('📨 [DEBUG] Envoi du message de candidature...');
        const navigationResponse = await chrome.tabs.sendMessage(tab.id, {
            action: 'navigateAndApply',
            data: applicationData
        });
        
        console.log('📨 [DEBUG] Réponse de candidature reçue:', navigationResponse);
        
        if (navigationResponse.success) {
            console.log('✅ [DEBUG] Candidature réussie');
            logMessage('Candidature envoyée avec succès !', 'success');
            
            // Sauvegarder la candidature via l'API
            await saveApplication(applicationData);
            
        } else {
            console.error('❌ [DEBUG] Échec de la candidature:', navigationResponse.error);
            logMessage(`Erreur lors de la candidature: ${navigationResponse.error}`, 'error');
        }
        
    } catch (error) {
        console.error('❌ [DEBUG] Erreur lors de la candidature:', error);
        logMessage(`Erreur: ${error.message}`, 'error');
    }
}

// Sauvegarder la candidature
async function saveApplication(applicationData) {
    console.log('💾 [DEBUG] Sauvegarde de la candidature...');
    
    try {
        const apiUrl = elements.apiUrl.value || 'http://localhost:3001';
        const userId = elements.userId.value;
        
        if (!userId) {
            console.warn('⚠️ [DEBUG] Aucun User ID configuré, candidature non sauvegardée');
            return;
        }
        
        const application = {
            userId: userId,
            jobId: applicationData.job.id,
            jobTitle: applicationData.job.title,
            company: applicationData.job.company,
            appliedAt: new Date().toISOString(),
            status: 'applied'
        };
        
        console.log('📋 [DEBUG] Candidature à sauvegarder:', application);
        
        const response = await fetch(`${apiUrl}/api/applications/auto-apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(application)
        });
        
        console.log('📡 [DEBUG] Réponse API reçue:', response.status);
        
        if (response.ok) {
            console.log('✅ [DEBUG] Candidature sauvegardée avec succès');
        } else {
            console.error('❌ [DEBUG] Erreur lors de la sauvegarde:', response.status);
        }
        
    } catch (error) {
        console.error('❌ [DEBUG] Erreur lors de la sauvegarde de la candidature:', error);
    }
}

// Afficher un message
function logMessage(message, type = 'info') {
    console.log(`📢 [DEBUG] Message [${type}]:`, message);
    
    try {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        elements.messageContainer.appendChild(messageElement);
        
        // Supprimer le message après 5 secondes
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
        
        console.log('✅ [DEBUG] Message affiché avec succès');
        
    } catch (error) {
        console.error('❌ [DEBUG] Erreur lors de l\'affichage du message:', error);
    }
}

// Configuration des onglets
function setupTabs() {
    console.log('🔧 [DEBUG] Configuration des onglets...');
    
    try {
        elements.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('🖱️ [DEBUG] Clic sur l\'onglet:', button.dataset.tab);
                
                // Retirer la classe active de tous les boutons et contenus
                elements.tabButtons.forEach(btn => btn.classList.remove('active'));
                elements.tabContents.forEach(content => content.classList.remove('active'));
                
                // Ajouter la classe active au bouton cliqué
                button.classList.add('active');
                
                // Afficher le contenu correspondant
                const tabId = button.dataset.tab + '-tab';
                const tabContent = document.getElementById(tabId);
                if (tabContent) {
                    tabContent.classList.add('active');
                    console.log('✅ [DEBUG] Onglet activé:', tabId);
                } else {
                    console.error('❌ [DEBUG] Contenu d\'onglet non trouvé:', tabId);
                }
            });
        });
        
        console.log('✅ [DEBUG] Onglets configurés avec succès');
        
    } catch (error) {
        console.error('❌ [DEBUG] Erreur lors de la configuration des onglets:', error);
    }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    console.log('🔧 [DEBUG] Configuration des écouteurs d\'événements...');
    
    try {
        // Sauvegarder les identifiants
        elements.saveCredentials.addEventListener('click', saveCredentials);
        console.log('✅ [DEBUG] Écouteur saveCredentials configuré');
        
        // Test de connexion
        elements.testConnection.addEventListener('click', testConnection);
        console.log('✅ [DEBUG] Écouteur testConnection configuré');
        
        // Sélection de profil
        elements.profileSelect.addEventListener('change', async (e) => {
            console.log('🔄 [DEBUG] Changement de profil sélectionné:', e.target.value);
            
            if (e.target.value) {
                try {
                    const apiUrl = elements.apiUrl.value || 'http://localhost:3001';
                    const response = await fetch(`${apiUrl}/api/user/profiles/${e.target.value}`);
                    
                    if (response.ok) {
                        currentProfile = await response.json();
                        console.log('✅ [DEBUG] Profil récupéré:', currentProfile);
                        displayProfile(currentProfile);
                    } else {
                        console.error('❌ [DEBUG] Erreur lors de la récupération du profil:', response.status);
                    }
                } catch (error) {
                    console.error('❌ [DEBUG] Erreur lors de la récupération du profil:', error);
                }
            } else {
                currentProfile = null;
                displayProfile(null);
                console.log('⚠️ [DEBUG] Aucun profil sélectionné');
            }
        });
        console.log('✅ [DEBUG] Écouteur profileSelect configuré');
        
        // Bouton de candidature
        elements.applyButton.addEventListener('click', applyToJob);
        console.log('✅ [DEBUG] Écouteur applyButton configuré');
        
        // Configuration des onglets
        setupTabs();
        
        console.log('✅ [DEBUG] Tous les écouteurs d\'événements configurés');
        
    } catch (error) {
        console.error('❌ [DEBUG] Erreur lors de la configuration des écouteurs:', error);
    }
}

// Initialisation
async function init() {
    console.log('🚀 [DEBUG] Initialisation du popup...');
    
    try {
        // Charger la configuration
        await loadConfig();
        
        // Charger les identifiants
        await loadCredentials();
        
        // Charger les profils
        await loadProfiles();
        
        // Configurer les écouteurs d'événements
        setupEventListeners();
        
        console.log('✅ [DEBUG] Popup initialisé avec succès');
        
    } catch (error) {
        console.error('❌ [DEBUG] Erreur lors de l\'initialisation:', error);
        logMessage('Erreur lors de l\'initialisation', 'error');
    }
}

// Démarrer l'initialisation quand le DOM est prêt
console.log('🔧 [DEBUG] DOM prêt, démarrage de l\'initialisation...');
document.addEventListener('DOMContentLoaded', init); 