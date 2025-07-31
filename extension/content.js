// Content Script pour l'extension SkillMatchr
// S'exécute sur les pages des sites d'emploi français

class JobDetector {
    constructor() {
        console.log('🔧 [DEBUG] Initialisation du JobDetector...');
        this.currentSite = this.detectSite();
        this.jobData = null;
        this.isLoggedIn = false;
        this.currentUrl = window.location.href;
        this.setupMessageListener();
        this.injectUI();
        this.checkLoginStatus();
        this.setupNavigationObserver();
        this.humanBehavior = new HumanBehaviorSimulator();
        console.log('✅ [DEBUG] JobDetector initialisé avec succès');
        console.log('📍 [DEBUG] Site détecté:', this.currentSite);
        console.log('🌐 [DEBUG] URL actuelle:', this.currentUrl);
    }

    // Détection du site actuel
    detectSite() {
        const hostname = window.location.hostname;
        console.log('🔍 [DEBUG] Détection du site pour hostname:', hostname);
        
        if (hostname.includes('linkedin.com')) {
            console.log('✅ [DEBUG] Site LinkedIn détecté');
            return 'linkedin';
        }
        if (hostname.includes('indeed.fr') || hostname.includes('indeed.com')) {
            console.log('✅ [DEBUG] Site Indeed détecté');
            return 'indeed';
        }
        if (hostname.includes('apec.fr')) {
            console.log('✅ [DEBUG] Site APEC détecté');
            return 'apec';
        }
        if (hostname.includes('pole-emploi.fr') || hostname.includes('francetravail.fr')) {
            console.log('✅ [DEBUG] Site Pôle Emploi détecté');
            return 'poleemploi';
        }
        
        console.log('⚠️ [DEBUG] Site inconnu détecté:', hostname);
        return 'unknown';
    }

    // Configuration de l'écouteur de messages
    setupMessageListener() {
        console.log('🔧 [DEBUG] Configuration de l\'écouteur de messages...');
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log('📨 [DEBUG] Message reçu:', request.action, request);
            
            switch (request.action) {
                case 'detectJob':
                    console.log('🔍 [DEBUG] Détection d\'offre demandée');
                    this.detectJobOffer().then(jobData => {
                        console.log('✅ [DEBUG] Offre détectée avec succès:', jobData);
                        sendResponse({ success: true, job: jobData });
                    }).catch(error => {
                        console.error('❌ [DEBUG] Erreur lors de la détection:', error);
                        sendResponse({ success: false, error: error.message });
                    });
                    return true;
                
                case 'applyToJob':
                    console.log('📝 [DEBUG] Candidature demandée');
                    this.applyToJob(request.data).then(result => {
                        console.log('✅ [DEBUG] Candidature réussie:', result);
                        sendResponse({ success: true, result });
                    }).catch(error => {
                        console.error('❌ [DEBUG] Erreur lors de la candidature:', error);
                        sendResponse({ success: false, error: error.message });
                    });
                    return true;
                
                case 'testConnection':
                    console.log('🔗 [DEBUG] Test de connexion demandé pour:', request.site);
                    this.testConnection(request.credentials, request.site).then(result => {
                        console.log('✅ [DEBUG] Test de connexion réussi:', result);
                        sendResponse({ success: true, result });
                    }).catch(error => {
                        console.error('❌ [DEBUG] Erreur lors du test de connexion:', error);
                        sendResponse({ success: false, error: error.message });
                    });
                    return true;
                
                case 'navigateAndApply':
                    console.log('🚀 [DEBUG] Navigation et candidature demandées');
                    this.navigateAndApply(request.data).then(result => {
                        console.log('✅ [DEBUG] Navigation et candidature réussies:', result);
                        sendResponse({ success: true, result });
                    }).catch(error => {
                        console.error('❌ [DEBUG] Erreur lors de la navigation et candidature:', error);
                        sendResponse({ success: false, error: error.message });
                    });
                    return true;
                
                default:
                    console.warn('⚠️ [DEBUG] Action non reconnue:', request.action);
                    sendResponse({ success: false, error: 'Action non reconnue' });
            }
        });
        console.log('✅ [DEBUG] Écouteur de messages configuré');
    }

    // Navigation et candidature automatique
    async navigateAndApply(applicationData) {
        try {
            console.log('🚀 [DEBUG] Début de la navigation et candidature automatique');
            console.log('📋 [DEBUG] Données de candidature:', applicationData);
            
            this.showNotification('Début de la candidature automatique...');
            
            // Étape 1: Naviguer vers le site approprié si pas déjà dessus
            const targetSite = this.determineTargetSite(applicationData);
            console.log('🎯 [DEBUG] Site cible déterminé:', targetSite);
            
            if (!this.isOnTargetSite(targetSite)) {
                console.log('🔄 [DEBUG] Navigation vers le site cible:', targetSite);
                this.showNotification(`Navigation vers ${targetSite}...`);
                await this.navigateToTargetSite(targetSite);
            } else {
                console.log('✅ [DEBUG] Déjà sur le bon site');
            }
            
            // Étape 2: Se connecter si nécessaire
            if (!this.isLoggedIn) {
                console.log('🔐 [DEBUG] Connexion nécessaire');
                this.showNotification('Connexion en cours...');
                await this.loginToSite(applicationData.credentials[targetSite], targetSite);
            } else {
                console.log('✅ [DEBUG] Déjà connecté');
            }
            
            // Étape 3: Rechercher l'offre d'emploi
            console.log('🔍 [DEBUG] Recherche de l\'offre');
            this.showNotification('Recherche de l\'offre...');
            await this.searchJobOnSite(applicationData.job, targetSite);
            
            // Étape 4: Postuler automatiquement
            console.log('📝 [DEBUG] Candidature automatique');
            this.showNotification('Candidature en cours...');
            await this.applyToJobOnSite(applicationData);
            
            console.log('✅ [DEBUG] Candidature terminée avec succès');
            this.showNotification('Candidature terminée avec succès !', 'success');
            return { success: true, message: 'Candidature envoyée avec succès' };
            
        } catch (error) {
            console.error('❌ [DEBUG] Erreur lors de la navigation et candidature:', error);
            console.error('📋 [DEBUG] Stack trace:', error.stack);
            this.showNotification(`Erreur: ${error.message}`, 'error');
            throw error;
        }
    }

    // Déterminer le site cible basé sur les identifiants disponibles
    determineTargetSite(applicationData) {
        console.log('🎯 [DEBUG] Détermination du site cible');
        console.log('🔑 [DEBUG] Identifiants disponibles:', applicationData.credentials);
        
        const enabledSites = Object.keys(applicationData.credentials).filter(site => 
            applicationData.credentials[site].enabled && 
            applicationData.credentials[site].email && 
            applicationData.credentials[site].password
        );
        
        console.log('✅ [DEBUG] Sites activés:', enabledSites);
        
        if (enabledSites.length === 0) {
            console.error('❌ [DEBUG] Aucun site configuré');
            throw new Error('Aucun site configuré pour la candidature automatique');
        }
        
        // Priorité: APEC > LinkedIn > Indeed > Pôle Emploi
        const priority = ['apec', 'linkedin', 'indeed', 'poleemploi'];
        for (const site of priority) {
            if (enabledSites.includes(site)) {
                console.log('🎯 [DEBUG] Site cible sélectionné:', site);
                return site;
            }
        }
        
        console.log('🔄 [DEBUG] Fallback au premier site activé:', enabledSites[0]);
        return enabledSites[0]; // Fallback au premier site activé
    }

    // Vérifier si on est sur le bon site
    isOnTargetSite(targetSite) {
        const hostname = window.location.hostname;
        console.log('🔍 [DEBUG] Vérification du site cible:', targetSite, 'vs hostname:', hostname);
        
        let isOnSite = false;
        switch (targetSite) {
            case 'linkedin':
                isOnSite = hostname.includes('linkedin.com');
                break;
            case 'indeed':
                isOnSite = hostname.includes('indeed.fr') || hostname.includes('indeed.com');
                break;
            case 'apec':
                isOnSite = hostname.includes('apec.fr');
                break;
            case 'poleemploi':
                isOnSite = hostname.includes('pole-emploi.fr') || hostname.includes('francetravail.fr');
                break;
            default:
                isOnSite = false;
        }
        
        console.log('📍 [DEBUG] Sur le bon site:', isOnSite);
        return isOnSite;
    }

    // Navigation vers le site cible
    async navigateToTargetSite(targetSite) {
        console.log('🔄 [DEBUG] Navigation vers le site:', targetSite);
        
        const siteUrls = {
            'linkedin': 'https://www.linkedin.com/jobs/',
            'indeed': 'https://fr.indeed.com/',
            'apec': 'https://www.apec.fr/candidat/recherche-emploi.html',
            'poleemploi': 'https://candidat.pole-emploi.fr/offres/recherche'
        };

        const url = siteUrls[targetSite];
        if (!url) {
            console.error('❌ [DEBUG] Site non supporté:', targetSite);
            throw new Error(`Site non supporté: ${targetSite}`);
        }

        console.log('🌐 [DEBUG] Navigation vers URL:', url);
        window.location.href = url;
        await this.waitForPageLoad();
        console.log('✅ [DEBUG] Navigation terminée');
    }

    // Connexion au site
    async loginToSite(credentials, site) {
        console.log('🔐 [DEBUG] Connexion au site:', site);
        console.log('📧 [DEBUG] Email utilisé:', credentials.email);
        
        try {
            const siteAdapter = this.getSiteAdapter(site);
            await siteAdapter.login(credentials);
            this.isLoggedIn = true;
            this.updateFloatingButton();
            console.log('✅ [DEBUG] Connexion réussie');
        } catch (error) {
            console.error('❌ [DEBUG] Erreur de connexion:', error);
            throw error;
        }
    }

    // Recherche d'offre sur le site
    async searchJobOnSite(jobData, site) {
        console.log('🔍 [DEBUG] Recherche d\'offre sur:', site);
        console.log('📋 [DEBUG] Données de recherche:', jobData);
        
        try {
            const siteAdapter = this.getSiteAdapter(site);
            await siteAdapter.searchJob(jobData);
            console.log('✅ [DEBUG] Recherche terminée');
        } catch (error) {
            console.error('❌ [DEBUG] Erreur lors de la recherche:', error);
            throw error;
        }
    }

    // Candidature sur le site
    async applyToJobOnSite(applicationData) {
        console.log('📝 [DEBUG] Candidature sur le site');
        console.log('📋 [DEBUG] Données de candidature:', applicationData);
        
        try {
            const siteAdapter = this.getSiteAdapter(this.currentSite);
            await siteAdapter.applyToJob(applicationData);
            console.log('✅ [DEBUG] Candidature terminée');
        } catch (error) {
            console.error('❌ [DEBUG] Erreur lors de la candidature:', error);
            throw error;
        }
    }

    // Obtenir l'adaptateur du site
    getSiteAdapter(site) {
        console.log('🔧 [DEBUG] Obtention de l\'adaptateur pour:', site);
        
        let adapter;
        switch (site) {
            case 'linkedin':
                adapter = new LinkedInAdapter(this.humanBehavior);
                break;
            case 'indeed':
                adapter = new IndeedAdapter(this.humanBehavior);
                break;
            case 'apec':
                adapter = new ApecAdapter(this.humanBehavior);
                break;
            case 'poleemploi':
                adapter = new PoleEmploiAdapter(this.humanBehavior);
                break;
            default:
                adapter = new GenericAdapter(this.humanBehavior);
        }
        
        console.log('✅ [DEBUG] Adaptateur créé:', adapter.siteName);
        return adapter;
    }

    // Détection de l'offre d'emploi
    async detectJobOffer() {
        console.log('🔍 [DEBUG] Détection de l\'offre d\'emploi');
        
        try {
            const siteAdapter = this.getSiteAdapter(this.currentSite);
            this.jobData = await siteAdapter.detectJob();
            console.log('✅ [DEBUG] Offre détectée:', this.jobData);
            return this.jobData;
        } catch (error) {
            console.error('❌ [DEBUG] Erreur lors de la détection:', error);
            throw error;
        }
    }

    // Application automatique au job
    async applyToJob(applicationData) {
        console.log('📝 [DEBUG] Application automatique au job');
        
        if (!this.jobData) {
            console.error('❌ [DEBUG] Aucune offre détectée');
            throw new Error('Aucune offre détectée');
        }

        this.showNotification('Début de la candidature automatique...');

        if (!this.isLoggedIn) {
            console.error('❌ [DEBUG] Utilisateur non connecté');
            throw new Error('Vous devez être connecté pour postuler');
        }

        try {
            const siteAdapter = this.getSiteAdapter(this.currentSite);
            const result = await siteAdapter.applyToJob(applicationData);
            console.log('✅ [DEBUG] Application réussie:', result);
            return result;
        } catch (error) {
            console.error('❌ [DEBUG] Erreur lors de l\'application:', error);
            throw error;
        }
    }

    // Test de connexion
    async testConnection(credentials, site) {
        console.log('🔗 [DEBUG] Test de connexion pour:', site);
        console.log('📧 [DEBUG] Email utilisé:', credentials.email);
        
        try {
            this.showNotification(`Test de connexion ${site} en cours...`);
            
            const siteAdapter = this.getSiteAdapter(site);
            const result = await siteAdapter.testConnection(credentials);
            
            this.isLoggedIn = result.success;
            this.updateFloatingButton();
            
            console.log('✅ [DEBUG] Test de connexion réussi:', result);
            return result;
        } catch (error) {
            console.error('❌ [DEBUG] Erreur lors du test de connexion:', error);
            this.showNotification(`Erreur de connexion: ${error.message}`, 'error');
            throw error;
        }
    }

    // Vérifier le statut de connexion
    async checkLoginStatus() {
        console.log('🔍 [DEBUG] Vérification du statut de connexion');
        
        try {
            const siteAdapter = this.getSiteAdapter(this.currentSite);
            this.isLoggedIn = await siteAdapter.checkLoginStatus();
            this.updateFloatingButton();
            console.log('✅ [DEBUG] Statut de connexion:', this.isLoggedIn);
        } catch (error) {
            console.error('❌ [DEBUG] Erreur lors de la vérification du statut:', error);
        }
    }

    // Observer les changements de navigation
    setupNavigationObserver() {
        console.log('👀 [DEBUG] Configuration de l\'observateur de navigation');
        
        let lastUrl = window.location.href;
        
        const observer = new MutationObserver(() => {
            if (window.location.href !== lastUrl) {
                console.log('🔄 [DEBUG] Changement d\'URL détecté:', lastUrl, '->', window.location.href);
                lastUrl = window.location.href;
                this.handleUrlChange();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        window.addEventListener('popstate', () => {
            console.log('🔄 [DEBUG] Événement popstate détecté');
            this.handleUrlChange();
        });
        
        window.addEventListener('pushstate', () => {
            console.log('🔄 [DEBUG] Événement pushstate détecté');
            this.handleUrlChange();
        });
        
        console.log('✅ [DEBUG] Observateur de navigation configuré');
    }

    // Gérer les changements d'URL
    handleUrlChange() {
        console.log('🔄 [DEBUG] Gestion du changement d\'URL');
        
        this.currentUrl = window.location.href;
        this.currentSite = this.detectSite();
        
        console.log('📍 [DEBUG] Nouveau site:', this.currentSite);
        console.log('🌐 [DEBUG] Nouvelle URL:', this.currentUrl);
        
        setTimeout(() => {
            this.checkLoginStatus();
        }, 1000);
    }

    // Attendre le chargement de la page
    async waitForPageLoad() {
        console.log('⏳ [DEBUG] Attente du chargement de la page');
        
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                console.log('✅ [DEBUG] Page déjà chargée');
                resolve();
            } else {
                console.log('⏳ [DEBUG] Attente de l\'événement load');
                window.addEventListener('load', () => {
                    console.log('✅ [DEBUG] Page chargée');
                    resolve();
                });
            }
        });
    }

    // Injection de l'interface utilisateur
    injectUI() {
        console.log('🎨 [DEBUG] Injection de l\'interface utilisateur');
        
        try {
            const floatingButton = document.createElement('div');
            floatingButton.id = 'skillmatchr-floating-button';
            floatingButton.innerHTML = `
                <div class="skillmatchr-icon">🎯</div>
                <div class="skillmatchr-tooltip">SkillMatchr - Assistant de candidature</div>
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                #skillmatchr-floating-button {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                    cursor: pointer;
                    z-index: 10000;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 24px;
                }
                
                #skillmatchr-floating-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
                }
                
                #skillmatchr-floating-button.logged-in {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }
                
                #skillmatchr-floating-button.not-logged-in {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                }
                
                .skillmatchr-tooltip {
                    position: absolute;
                    right: 70px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: #333;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                }
                
                #skillmatchr-floating-button:hover .skillmatchr-tooltip {
                    opacity: 1;
                }
                
                .skillmatchr-tooltip::after {
                    content: '';
                    position: absolute;
                    right: -5px;
                    top: 50%;
                    transform: translateY(-50%);
                    border-left: 5px solid #333;
                    border-top: 5px solid transparent;
                    border-bottom: 5px solid transparent;
                }
                
                .skillmatchr-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #10b981;
                    color: white;
                    padding: 12px 16px;
                    border-radius: 8px;
                    z-index: 10001;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    max-width: 300px;
                }
                
                .skillmatchr-notification.show {
                    transform: translateX(0);
                }
                
                .skillmatchr-notification.error {
                    background: #ef4444;
                }
                
                .skillmatchr-notification.warning {
                    background: #f59e0b;
                }
                
                .skillmatchr-notification.info {
                    background: #3b82f6;
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(floatingButton);
            
            floatingButton.addEventListener('click', () => {
                console.log('🖱️ [DEBUG] Clic sur le bouton flottant');
                this.showNotification('Détection de l\'offre en cours...');
                this.detectJobOffer().then(jobData => {
                    this.showNotification(`Offre détectée: ${jobData.title} chez ${jobData.company}`, 'success');
                }).catch(error => {
                    this.showNotification(`Erreur: ${error.message}`, 'error');
                });
            });
            
            console.log('✅ [DEBUG] Interface utilisateur injectée');
        } catch (error) {
            console.error('❌ [DEBUG] Erreur lors de l\'injection de l\'UI:', error);
        }
    }

    // Mettre à jour l'apparence du bouton flottant
    updateFloatingButton() {
        console.log('🎨 [DEBUG] Mise à jour du bouton flottant');
        
        const button = document.getElementById('skillmatchr-floating-button');
        if (!button) {
            console.warn('⚠️ [DEBUG] Bouton flottant non trouvé');
            return;
        }

        button.classList.remove('logged-in', 'not-logged-in');
        
        if (this.isLoggedIn) {
            button.classList.add('logged-in');
            button.querySelector('.skillmatchr-tooltip').textContent = 'Connecté - Prêt à postuler';
            console.log('✅ [DEBUG] Bouton mis à jour: connecté');
        } else {
            button.classList.add('not-logged-in');
            button.querySelector('.skillmatchr-tooltip').textContent = 'Non connecté - Cliquez pour configurer';
            console.log('⚠️ [DEBUG] Bouton mis à jour: non connecté');
        }
    }

    // Affichage de notifications
    showNotification(message, type = 'info') {
        console.log(`📢 [DEBUG] Notification [${type}]:`, message);
        
        try {
            const notification = document.createElement('div');
            notification.className = `skillmatchr-notification ${type}`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => notification.classList.add('show'), 100);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 4000);
        } catch (error) {
            console.error('❌ [DEBUG] Erreur lors de l\'affichage de la notification:', error);
        }
    }
}

// Simulateur de comportement humain
class HumanBehaviorSimulator {
    constructor() {
        this.typingSpeed = 100 + Math.random() * 100; // 100-200ms par caractère
        this.readingSpeed = 200 + Math.random() * 100; // 200-300ms par mot
        console.log('🤖 [DEBUG] HumanBehaviorSimulator initialisé');
        console.log('⌨️ [DEBUG] Vitesse de frappe:', this.typingSpeed, 'ms');
        console.log('📖 [DEBUG] Vitesse de lecture:', this.readingSpeed, 'ms');
    }

    // Délai aléatoire
    async randomDelay(min = 500, max = 3000) {
        const delay = Math.random() * (max - min) + min;
        console.log(`⏳ [DEBUG] Délai aléatoire: ${Math.round(delay)}ms`);
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Frappe humaine
    async humanTyping(element, text) {
        console.log('⌨️ [DEBUG] Frappe humaine:', text.length, 'caractères');
        
        for (let char of text) {
            element.value += char;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            await this.randomDelay(this.typingSpeed * 0.5, this.typingSpeed * 1.5);
        }
        
        console.log('✅ [DEBUG] Frappe terminée');
    }

    // Mouvement de souris naturel
    async naturalMouseMovement(element) {
        console.log('🖱️ [DEBUG] Mouvement de souris naturel');
        
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Simulation de mouvement de souris
        await this.randomDelay(100, 300);
        
        // Hover avant clic
        element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        await this.randomDelay(200, 500);
        
        // Focus
        element.focus();
        await this.randomDelay(100, 300);
        
        console.log('✅ [DEBUG] Mouvement de souris terminé');
    }

    // Clic naturel
    async naturalClick(element) {
        console.log('🖱️ [DEBUG] Clic naturel');
        
        await this.naturalMouseMovement(element);
        element.click();
        await this.randomDelay(300, 800);
        
        console.log('✅ [DEBUG] Clic terminé');
    }

    // Temps de lecture
    async readingTime(textLength) {
        const words = textLength / 5; // Estimation
        const readingTime = words * this.readingSpeed;
        console.log(`📖 [DEBUG] Temps de lecture: ${Math.round(readingTime)}ms pour ${Math.round(words)} mots`);
        await this.randomDelay(readingTime * 0.8, readingTime * 1.2);
    }

    // Scroll naturel
    async naturalScroll(targetElement) {
        console.log('📜 [DEBUG] Scroll naturel');
        
        const currentScroll = window.pageYOffset;
        const targetScroll = targetElement.offsetTop - 100;
        const distance = Math.abs(targetScroll - currentScroll);
        
        const steps = Math.ceil(distance / 50);
        console.log(`📜 [DEBUG] Scroll: ${steps} étapes, distance: ${Math.round(distance)}px`);
        
        for (let i = 0; i < steps; i++) {
            window.scrollBy(0, (targetScroll - currentScroll) / steps);
            await this.randomDelay(50, 100);
        }
        
        console.log('✅ [DEBUG] Scroll terminé');
    }
}

// Initialiser le détecteur d'emploi
console.log('🚀 [DEBUG] Initialisation de l\'extension SkillMatchr...');
const jobDetector = new JobDetector();
console.log('✅ [DEBUG] Extension SkillMatchr initialisée avec succès'); 