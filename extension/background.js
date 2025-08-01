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
        'chooseyourboss.com',
        'jobteaser.com'
    ],
    USER_AGENTS: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ],
    PROXIES: [
        // Liste des proxies tournants (à configurer selon disponibilité)
        // Format: { host: 'proxy.example.com', port: 8080, username: 'user', password: 'pass' }
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
            
        case 'apply-to-job':
            handleJobApplication(request.data).then(result => {
                sendResponse({ success: true, result });
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

// Export pour les tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        extensionState,
        detectJobOffer,
        applyToJob,
        saveJob,
        getApplicationHistory,
        addToApplicationHistory,
        clearApplicationHistory
    };
} 

// Fonction pour gérer les candidatures JobTeaser
async function handleJobApplication(data) {
    console.log('[Background] Handling job application:', data);
    
    const { url, profile, cvPath } = data;
    
    // Vérifier si c'est une URL JobTeaser
    if (!url.includes('jobteaser.com')) {
        throw new Error('URL non supportée. Seul JobTeaser est supporté pour le moment.');
    }
    
    try {
        // Configurer un user-agent aléatoire
        const userAgent = getRandomUserAgent();
        console.log('[Background] Using User-Agent:', userAgent);
        
        // Configurer le proxy si disponible
        if (CONFIG.PROXIES.length > 0) {
            const proxy = getRandomProxy();
            await configureProxy(proxy);
            console.log('[Background] Using proxy:', proxy.host);
        }
        
        // Ouvrir l'URL dans un nouvel onglet
        const tab = await chrome.tabs.create({ url, active: true });
        console.log('[Background] Tab created:', tab.id);
        
        // Attendre que la page soit chargée
        await waitForTabLoad(tab.id);
        
        // Injecter le script pour l'application
        const result = await chrome.scripting.executeScript({
            target: { tabId: tab.id, allFrames: true },
            func: applyToJobOnPage,
            args: [{
                profile,
                cvPath,
                adapter: 'JobteaserAdapter'
            }]
        });
        
        console.log('[Background] Application result:', result);
        
        // Envoyer le résultat au dashboard
        sendToDashboard({
            action: 'application-complete',
            jobUrl: url,
            success: result[0].result.success,
            message: result[0].result.message,
            timestamp: new Date().toISOString()
        });
        
        return result[0].result;
        
    } catch (error) {
        console.error('[Background] Application error:', error);
        
        // Envoyer l'erreur au dashboard
        sendToDashboard({
            action: 'application-error',
            jobUrl: url,
            error: error.message,
            timestamp: new Date().toISOString()
        });
        
        throw error;
    }
}

// Fonction injectée dans la page pour gérer la candidature
async function applyToJobOnPage(data) {
    console.log('[Injected] Starting job application with data:', data);
    
    try {
        // Vérifier que les adaptateurs sont disponibles
        if (!window.SiteAdapters || !window.SiteAdapters[data.adapter]) {
            throw new Error(`Adapter ${data.adapter} not found`);
        }
        
        // Créer une instance de l'adaptateur
        const AdapterClass = window.SiteAdapters[data.adapter];
        const adapter = new AdapterClass(new window.HumanBehaviorSimulator());
        
        // Appliquer au job
        const result = await adapter.applyToJob({
            profile: data.profile,
            cvPath: data.cvPath
        });
        
        return { success: true, result };
        
    } catch (error) {
        console.error('[Injected] Application error:', error);
        return { success: false, error: error.message };
    }
}

// Obtenir un user-agent aléatoire
function getRandomUserAgent() {
    const index = Math.floor(Math.random() * CONFIG.USER_AGENTS.length);
    return CONFIG.USER_AGENTS[index];
}

// Obtenir un proxy aléatoire
function getRandomProxy() {
    if (CONFIG.PROXIES.length === 0) return null;
    const index = Math.floor(Math.random() * CONFIG.PROXIES.length);
    return CONFIG.PROXIES[index];
}

// Configurer le proxy (nécessite une extension proxy séparée ou API)
async function configureProxy(proxy) {
    if (!proxy) return;
    
    // Note: Chrome ne permet pas de configurer directement les proxies via l'API
    // Vous devrez utiliser une extension proxy dédiée ou configurer au niveau système
    console.log('[Background] Proxy configuration requested:', proxy);
    
    // Pour une vraie implémentation, vous pourriez :
    // 1. Utiliser chrome.proxy API (nécessite permission "proxy")
    // 2. Communiquer avec une extension proxy tierce
    // 3. Utiliser un serveur proxy local
}

// Attendre le chargement complet d'un onglet
function waitForTabLoad(tabId) {
    return new Promise((resolve) => {
        const listener = (updatedTabId, changeInfo) => {
            if (updatedTabId === tabId && changeInfo.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                resolve();
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
    });
}

// Envoyer des données au dashboard
async function sendToDashboard(data) {
    try {
        console.log('[Background] Sending to dashboard:', data);
        
        // Envoyer au dashboard via message
        chrome.runtime.sendMessage({
            action: 'dashboard-update',
            data: data
        });
        
        // Aussi envoyer à l'API si configurée
        const config = await getConfig();
        if (config.apiUrl && config.apiKey) {
            await fetch(`${config.apiUrl}/api/applications/log`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
    } catch (error) {
        console.error('[Background] Error sending to dashboard:', error);
    }
} 