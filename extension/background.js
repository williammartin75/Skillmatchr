// Service Worker Background pour l'extension SkillMatchr

// Configuration globale
const CONFIG = {
    API_BASE_URL: 'http://localhost:3001',
    SUPPORTED_SITES: [
        'apec.fr',
        'pole-emploi.fr',
        'indeed.fr',
        'linkedin.com',
        'welcometothejungle.com',
        'regionsjob.com',
        'cadremploi.fr',
        'chooseyourboss.com'
    ]
};

// État global de l'extension
let extensionState = {
    isActive: false,
    currentTab: null,
    currentJob: null,
    currentProfile: null,
    applicationHistory: []
};

// Initialisation du service worker
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension SkillMatchr installée:', details.reason);
    
    if (details.reason === 'install') {
        // Première installation
        initializeExtension();
    } else if (details.reason === 'update') {
        // Mise à jour
        console.log('Extension SkillMatchr mise à jour');
    }
});

// Initialisation de l'extension
function initializeExtension() {
    // Créer les données par défaut
    chrome.storage.sync.set({
        apiUrl: CONFIG.API_BASE_URL,
        userId: '',
        apiKey: '',
        isFirstRun: true,
        applicationHistory: [],
        settings: {
            autoDetect: true,
            notifications: true,
            sound: false,
            theme: 'light'
        }
    });
    
    // Ouvrir la page d'accueil
    chrome.tabs.create({
        url: `${CONFIG.API_BASE_URL}/welcome`
    });
}

// Gestion des messages depuis le popup et content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message reçu:', request);
    
    switch (request.action) {
        case 'getExtensionState':
            sendResponse({ success: true, state: extensionState });
            break;
            
        case 'updateExtensionState':
            extensionState = { ...extensionState, ...request.state };
            sendResponse({ success: true });
            break;
            
        case 'detectJobOffer':
            detectJobOffer(sender.tab.id).then(result => {
                sendResponse({ success: true, job: result });
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true; // Indique une réponse asynchrone
            
        case 'applyToJob':
            applyToJob(request.data).then(result => {
                sendResponse({ success: true, result });
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true;
            
        case 'apply-to-job':
            // Nouveau gestionnaire spécifique pour JobTeaser
            console.log('[Background] Received apply-to-job request:', request);
            applyToJobTeaser(request.data).then(result => {
                sendResponse({ success: true, result });
            }).catch(error => {
                console.error('[Background] Apply-to-job error:', error);
                sendResponse({ success: false, error: error.message });
            });
            return true;
            
        case 'saveJob':
            saveJob(request.data).then(result => {
                sendResponse({ success: true, result });
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true;
            
        case 'getApplicationHistory':
            getApplicationHistory().then(history => {
                sendResponse({ success: true, history });
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true;
            
        case 'clearApplicationHistory':
            clearApplicationHistory().then(() => {
                sendResponse({ success: true });
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true;
            
        default:
            sendResponse({ success: false, error: 'Action non reconnue' });
    }
});

// Détection d'offre d'emploi
async function detectJobOffer(tabId) {
    try {
        console.log('Détection d\'offre d\'emploi pour l\'onglet:', tabId);
        
        // Envoyer un message au content script
        const response = await chrome.tabs.sendMessage(tabId, {
            action: 'detectJob'
        });
        
        if (response.success) {
            extensionState.currentJob = response.job;
            extensionState.currentTab = tabId;
            
            // Sauvegarder l'état
            await chrome.storage.sync.set({
                currentJob: response.job,
                currentTab: tabId
            });
            
            // Envoyer une notification
            sendNotification('Offre détectée', `Titre: ${response.job.title}\nEntreprise: ${response.job.company}`);
            
            return response.job;
        } else {
            throw new Error(response.error || 'Impossible de détecter l\'offre');
        }
    } catch (error) {
        console.error('Erreur lors de la détection:', error);
        throw error;
    }
}

// Application automatique
async function applyToJob(applicationData) {
    try {
        console.log('Début de la candidature automatique:', applicationData);
        
        // Vérifier les données requises
        if (!applicationData.jobId || !applicationData.profileId) {
            throw new Error('Données de candidature incomplètes');
        }
        
        // Envoyer la candidature à l'API
        const config = await getConfig();
        const response = await fetch(`${config.apiUrl}/api/applications/auto-apply`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(applicationData)
        });
        
        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Lancer le processus de candidature dans l'onglet
        if (extensionState.currentTab) {
            await chrome.tabs.sendMessage(extensionState.currentTab, {
                action: 'applyToJob',
                data: applicationData
            });
        }
        
        // Ajouter à l'historique
        await addToApplicationHistory({
            jobId: applicationData.jobId,
            jobTitle: applicationData.jobTitle,
            company: applicationData.company,
            appliedAt: new Date().toISOString(),
            status: 'pending'
        });
        
        // Envoyer une notification
        sendNotification('Candidature envoyée', `Poste: ${applicationData.jobTitle}\nEntreprise: ${applicationData.company}`);
        
        return result;
    } catch (error) {
        console.error('Erreur lors de la candidature:', error);
        throw error;
    }
}

// Sauvegarde d'offre
async function saveJob(jobData) {
    try {
        console.log('Sauvegarde d\'offre:', jobData);
        
        const config = await getConfig();
        const response = await fetch(`${config.apiUrl}/api/jobs/save`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...jobData,
                savedAt: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Envoyer une notification
        sendNotification('Offre sauvegardée', `Titre: ${jobData.title}\nEntreprise: ${jobData.company}`);
        
        return result;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        throw error;
    }
}

// Récupération de l'historique des candidatures
async function getApplicationHistory() {
    try {
        const result = await chrome.storage.sync.get(['applicationHistory']);
        return result.applicationHistory || [];
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique:', error);
        throw error;
    }
}

// Ajout à l'historique des candidatures
async function addToApplicationHistory(application) {
    try {
        const result = await chrome.storage.sync.get(['applicationHistory']);
        const history = result.applicationHistory || [];
        
        // Ajouter la nouvelle candidature
        history.unshift(application);
        
        // Limiter à 100 entrées
        if (history.length > 100) {
            history.splice(100);
        }
        
        await chrome.storage.sync.set({ applicationHistory: history });
        extensionState.applicationHistory = history;
    } catch (error) {
        console.error('Erreur lors de l\'ajout à l\'historique:', error);
        throw error;
    }
}

// Effacement de l'historique
async function clearApplicationHistory() {
    try {
        await chrome.storage.sync.set({ applicationHistory: [] });
        extensionState.applicationHistory = [];
    } catch (error) {
        console.error('Erreur lors de l\'effacement de l\'historique:', error);
        throw error;
    }
}

// Récupération de la configuration
async function getConfig() {
    try {
        const result = await chrome.storage.sync.get(['apiUrl', 'userId', 'apiKey']);
        return {
            apiUrl: result.apiUrl || CONFIG.API_BASE_URL,
            userId: result.userId || '',
            apiKey: result.apiKey || ''
        };
    } catch (error) {
        console.error('Erreur lors de la récupération de la configuration:', error);
        throw error;
    }
}

// Envoi de notifications
function sendNotification(title, message) {
    // Vérifier si les notifications sont activées
    chrome.storage.sync.get(['settings'], (result) => {
        if (result.settings?.notifications !== false) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: title,
                message: message
            });
        }
    });
}

// Gestion des changements d'onglets
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Vérifier si c'est un site supporté
        const isSupportedSite = CONFIG.SUPPORTED_SITES.some(site => 
            tab.url.includes(site)
        );
        
        if (isSupportedSite) {
            console.log('Site d\'emploi détecté:', tab.url);
            
            // Mettre à jour l'état
            extensionState.currentTab = tabId;
            extensionState.isActive = true;
            
            // Envoyer une notification si la détection automatique est activée
            chrome.storage.sync.get(['settings'], (result) => {
                if (result.settings?.autoDetect) {
                    // Attendre un peu que la page se charge complètement
                    setTimeout(() => {
                        detectJobOffer(tabId).catch(error => {
                            console.log('Détection automatique échouée:', error.message);
                        });
                    }, 2000);
                }
            });
        } else {
            extensionState.isActive = false;
        }
    }
});

// Gestion de la fermeture d'onglets
chrome.tabs.onRemoved.addListener((tabId) => {
    if (extensionState.currentTab === tabId) {
        extensionState.currentTab = null;
        extensionState.currentJob = null;
        extensionState.isActive = false;
    }
});

// Gestion des clics sur les notifications
chrome.notifications.onClicked.addListener((notificationId) => {
    // Ouvrir le dashboard
    chrome.tabs.create({
        url: `${CONFIG.API_BASE_URL}/dashboard`
    });
});

// Gestion des raccourcis clavier
chrome.commands.onCommand.addListener((command) => {
    switch (command) {
        case 'detect-job':
            if (extensionState.currentTab) {
                detectJobOffer(extensionState.currentTab).catch(error => {
                    console.error('Erreur lors de la détection:', error);
                });
            }
            break;
            
        case 'apply-job':
            if (extensionState.currentJob && extensionState.currentProfile) {
                applyToJob({
                    jobId: extensionState.currentJob.id,
                    jobTitle: extensionState.currentJob.title,
                    company: extensionState.currentJob.company,
                    profileId: extensionState.currentProfile.id
                }).catch(error => {
                    console.error('Erreur lors de la candidature:', error);
                });
            }
            break;
            
        case 'open-dashboard':
            chrome.tabs.create({
                url: `${CONFIG.API_BASE_URL}/dashboard`
            });
            break;
    }
});

// Gestion des erreurs
chrome.runtime.onSuspend.addListener(() => {
    console.log('Extension SkillMatchr suspendue');
});

// Fonction de nettoyage périodique
setInterval(async () => {
    try {
        // Nettoyer l'historique ancien (plus de 30 jours)
        const result = await chrome.storage.sync.get(['applicationHistory']);
        const history = result.applicationHistory || [];
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const filteredHistory = history.filter(app => {
            const appliedDate = new Date(app.appliedAt);
            return appliedDate > thirtyDaysAgo;
        });
        
        if (filteredHistory.length !== history.length) {
            await chrome.storage.sync.set({ applicationHistory: filteredHistory });
            extensionState.applicationHistory = filteredHistory;
            console.log('Historique nettoyé');
        }
    } catch (error) {
        console.error('Erreur lors du nettoyage:', error);
    }
}, 24 * 60 * 60 * 1000); // Toutes les 24 heures

// Gestion du User-Agent dynamique pour les requêtes vers Jobteaser
let currentUserAgent = '';

// Écouter les demandes de changement de User-Agent et autres messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'changeUserAgent') {
        currentUserAgent = request.userAgent;
        console.log('[Background] User-Agent mis à jour:', currentUserAgent);
        sendResponse({ success: true });
    }
    
    if (request.action === 'injectInAllFrames') {
        // Injecter les scripts dans tous les frames
        console.log('[Background] Injection des scripts dans tous les frames');
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            if (tabs[0]) {
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id, allFrames: true },
                        files: ['site-adapters.js', 'content.js']
                    });
                    console.log('[Background] Scripts injectés dans tous les frames');
                } catch (error) {
                    console.error('[Background] Erreur injection frames:', error);
                }
            }
        });
        sendResponse({ success: true });
    }
    
    if (request.action === 'applicationComplete') {
        // Notification de candidature terminée
        console.log('[Background] Candidature terminée:', request);
        sendNotification(
            request.success ? 'Candidature réussie' : 'Candidature échouée',
            `URL: ${request.url}\nStatistiques: ${request.stats?.successful || 0} réussies, ${request.stats?.failed || 0} échouées`
        );
        sendResponse({ success: true });
    }
});

// Intercepter les requêtes HTTP pour modifier le User-Agent
if (chrome.webRequest && chrome.webRequest.onBeforeSendHeaders) {
    chrome.webRequest.onBeforeSendHeaders.addListener(
        (details) => {
            if (currentUserAgent) {
                let headers = details.requestHeaders;
                let userAgentFound = false;
                
                for (let i = 0; i < headers.length; i++) {
                    if (headers[i].name.toLowerCase() === 'user-agent') {
                        headers[i].value = currentUserAgent;
                        userAgentFound = true;
                        break;
                    }
                }
                
                // Si pas de User-Agent trouvé, l'ajouter
                if (!userAgentFound) {
                    headers.push({
                        name: 'User-Agent',
                        value: currentUserAgent
                    });
                }
                
                return { requestHeaders: headers };
            }
            return { requestHeaders: details.requestHeaders };
        },
        { urls: ["https://*.jobteaser.com/*"] },
        ["blocking", "requestHeaders"]
    );
}

// Fonction spécifique pour JobTeaser avec timeout et gestion avancée
async function applyToJobTeaser(data) {
    console.log('[Background] Starting JobTeaser application process');
    
    const timeout = 30000; // 30 secondes max par offre
    const startTime = Date.now();
    
    try {
        // Vérifier l'URL
        if (!data.url || !data.url.includes('jobteaser.com')) {
            throw new Error('URL invalide ou non JobTeaser');
        }
        
        // Obtenir l'onglet actif ou créer un nouvel onglet
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        let targetTab = tabs[0];
        
        // Si l'onglet actuel n'est pas JobTeaser, créer un nouvel onglet
        if (!targetTab.url.includes('jobteaser.com')) {
            targetTab = await chrome.tabs.create({ url: data.url, active: false });
            await new Promise(resolve => setTimeout(resolve, 3000)); // Attendre le chargement
        }
        
        // Injecter le content script sur tous les frames
        console.log('[Background] Injecting content scripts into tab:', targetTab.id);
        await chrome.scripting.executeScript({
            target: { tabId: targetTab.id, allFrames: true },
            files: ['site-adapters.js', 'content.js']
        });
        
        // Créer une promesse avec timeout
        const applicationPromise = new Promise(async (resolve, reject) => {
            try {
                // Envoyer le message au content script
                const response = await chrome.tabs.sendMessage(targetTab.id, {
                    action: 'navigateAndApply',
                    data: {
                        url: data.url,
                        credentials: {
                            jobteaser: {
                                email: 'wawawawa1001100110011001@proton.me',
                                password: 'Wawawawa1001100110011001'
                            }
                        },
                        profile: {
                            name: 'Lorence Antoine',
                            email: 'lorence.antoine@email.com',
                            phone: '0123456789',
                            cv: `Lorence Antoine
Développeur Full Stack

Email: lorence.antoine@email.com
Téléphone: 0123456789

EXPERIENCE PROFESSIONNELLE
Développeur JavaScript - Entreprise ABC (2020-2023)
- Développement d'applications React et Node.js
- Augmentation des performances de 25%
- Gestion d'une équipe de 3 développeurs

FORMATION
Master en Informatique - Université XYZ (2018-2020)
Licence en Mathématiques - Université ABC (2015-2018)

COMPETENCES TECHNIQUES
JavaScript, Python, Java, React, Angular, Vue, Node.js, SQL, Docker, Git

PROJETS
- Application e-commerce avec React (5000 utilisateurs)
- API REST avec Node.js et Express
- Base de données PostgreSQL optimisée`
                        }
                    }
                });
                
                if (response && response.success) {
                    console.log('[Background] Application successful:', response.result);
                    resolve(response.result);
                } else {
                    reject(new Error(response?.error || 'Application failed'));
                }
            } catch (error) {
                reject(error);
            }
        });
        
        // Créer une promesse de timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Timeout après ${timeout/1000} secondes`));
            }, timeout);
        });
        
        // Attendre la première qui se termine
        const result = await Promise.race([applicationPromise, timeoutPromise]);
        
        const duration = Date.now() - startTime;
        console.log(`[Background] Application completed in ${duration}ms`);
        
        // Ajouter à l'historique
        await addToApplicationHistory({
            url: data.url,
            appliedAt: new Date().toISOString(),
            status: 'success',
            duration: duration
        });
        
        return result;
        
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error('[Background] JobTeaser application failed:', error);
        
        // Ajouter l'échec à l'historique
        await addToApplicationHistory({
            url: data.url,
            appliedAt: new Date().toISOString(),
            status: 'failed',
            error: error.message,
            duration: duration
        });
        
        throw error;
    }
}

// Export pour les tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        extensionState,
        detectJobOffer,
        applyToJob,
        applyToJobTeaser,
        saveJob,
        getApplicationHistory,
        addToApplicationHistory,
        clearApplicationHistory
    };
} 