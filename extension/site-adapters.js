// Adaptateurs spécialisés pour les sites d'emploi français

// Classe de base pour tous les adaptateurs
class BaseSiteAdapter {
    constructor(humanBehavior) {
        this.humanBehavior = humanBehavior;
        this.siteName = 'Generic';
        console.log(`🔧 [DEBUG] ${this.siteName}Adapter initialisé`);
    }

    // Méthodes à implémenter dans chaque adaptateur
    async detectJob() { throw new Error('Méthode non implémentée'); }
    async login(credentials) { throw new Error('Méthode non implémentée'); }
    async checkLoginStatus() { throw new Error('Méthode non implémentée'); }
    async searchJob(jobData) { throw new Error('Méthode non implémentée'); }
    async applyToJob(applicationData) { throw new Error('Méthode non implémentée'); }
    async testConnection(credentials) { throw new Error('Méthode non implémentée'); }

    // Méthodes utilitaires communes
    async waitForElement(selector, timeout = 10000) {
        console.log(`🔍 [DEBUG] Attente de l'élément: ${selector}`);
        
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`✅ [DEBUG] Élément trouvé immédiatement: ${selector}`);
                resolve(element);
                return;
            }

            console.log(`⏳ [DEBUG] Élément non trouvé, observation en cours: ${selector}`);
            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
                if (element) {
                    console.log(`✅ [DEBUG] Élément trouvé après observation: ${selector}`);
                    obs.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                console.error(`❌ [DEBUG] Timeout pour l'élément: ${selector}`);
                reject(new Error(`Élément ${selector} non trouvé`));
            }, timeout);
        });
    }

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

    showNotification(message, type = 'info') {
        console.log(`📢 [DEBUG] Notification [${type}]: ${message}`);
        // Utiliser la méthode du JobDetector principal
        if (window.jobDetector) {
            window.jobDetector.showNotification(message, type);
        }
    }
}

// Adaptateur LinkedIn
class LinkedInAdapter extends BaseSiteAdapter {
    constructor(humanBehavior) {
        super(humanBehavior);
        this.siteName = 'LinkedIn';
        console.log('🔧 [DEBUG] LinkedInAdapter initialisé');
    }

    async detectJob() {
        console.log('🔍 [DEBUG] Détection d\'offre LinkedIn');
        
        const jobData = {
            id: this.extractJobId(),
            url: window.location.href,
            title: '',
            company: '',
            location: '',
            type: '',
            description: ''
        };

        console.log('📋 [DEBUG] Structure jobData créée:', jobData);

        // Sélecteurs LinkedIn spécifiques
        const titleSelectors = [
            'h1.job-details-jobs-unified-top-card__job-title',
            '.job-details-jobs-unified-top-card__job-title',
            'h1[data-testid="job-details-jobs-unified-top-card__job-title"]',
            'h1'
        ];

        const companySelectors = [
            '.job-details-jobs-unified-top-card__company-name',
            '.job-details-jobs-unified-top-card__company-name a',
            '[data-testid="job-details-jobs-unified-top-card__company-name"]'
        ];

        const locationSelectors = [
            '.job-details-jobs-unified-top-card__bullet',
            '.job-details-jobs-unified-top-card__location'
        ];

        // Extraire les informations
        console.log('🔍 [DEBUG] Recherche du titre...');
        for (const selector of titleSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                jobData.title = element.textContent.trim();
                console.log('✅ [DEBUG] Titre trouvé:', jobData.title);
                break;
            } else {
                console.log(`⚠️ [DEBUG] Sélecteur de titre non trouvé: ${selector}`);
            }
        }

        console.log('🔍 [DEBUG] Recherche de l\'entreprise...');
        for (const selector of companySelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                jobData.company = element.textContent.trim();
                console.log('✅ [DEBUG] Entreprise trouvée:', jobData.company);
                break;
            } else {
                console.log(`⚠️ [DEBUG] Sélecteur d'entreprise non trouvé: ${selector}`);
            }
        }

        console.log('🔍 [DEBUG] Recherche de la localisation...');
        for (const selector of locationSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                jobData.location = element.textContent.trim();
                console.log('✅ [DEBUG] Localisation trouvée:', jobData.location);
                break;
            } else {
                console.log(`⚠️ [DEBUG] Sélecteur de localisation non trouvé: ${selector}`);
            }
        }

        if (!jobData.title) {
            console.error('❌ [DEBUG] Impossible de détecter le titre du poste LinkedIn');
            throw new Error('Impossible de détecter le titre du poste LinkedIn');
        }

        console.log('✅ [DEBUG] Offre LinkedIn détectée avec succès:', jobData);
        return jobData;
    }

    async login(credentials) {
        console.log('🔐 [DEBUG] Connexion LinkedIn');
        console.log('📧 [DEBUG] Email utilisé:', credentials.email);
        
        await this.waitForPageLoad();
        
        // Chercher le bouton de connexion
        console.log('🔍 [DEBUG] Recherche du bouton de connexion LinkedIn');
        const loginButton = document.querySelector('a[href*="login"], .nav__button-secondary, [data-testid="login-button"]');
        if (!loginButton) {
            console.error('❌ [DEBUG] Bouton de connexion LinkedIn non trouvé');
            throw new Error('Bouton de connexion LinkedIn non trouvé');
        }

        console.log('✅ [DEBUG] Bouton de connexion trouvé, clic en cours...');
        await this.humanBehavior.naturalClick(loginButton);
        
        console.log('⏳ [DEBUG] Attente du formulaire de connexion...');
        await this.waitForElement('form[action*="login"], #username, input[name="session_key"]');

        // Remplir le formulaire
        console.log('🔍 [DEBUG] Recherche des champs de connexion...');
        const emailField = document.querySelector('#username, input[name="session_key"], input[type="email"]');
        const passwordField = document.querySelector('#password, input[name="session_password"], input[type="password"]');

        if (!emailField || !passwordField) {
            console.error('❌ [DEBUG] Champs de connexion LinkedIn non trouvés');
            console.log('🔍 [DEBUG] Champs trouvés:', { emailField: !!emailField, passwordField: !!passwordField });
            throw new Error('Champs de connexion LinkedIn non trouvés');
        }

        console.log('✅ [DEBUG] Champs trouvés, remplissage en cours...');
        await this.humanBehavior.humanTyping(emailField, credentials.email);
        await this.humanBehavior.humanTyping(passwordField, credentials.password);

        // Soumettre
        console.log('🔍 [DEBUG] Recherche du bouton de soumission...');
        const submitButton = document.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) {
            console.log('✅ [DEBUG] Bouton de soumission trouvé, clic en cours...');
            await this.humanBehavior.naturalClick(submitButton);
        } else {
            console.warn('⚠️ [DEBUG] Bouton de soumission non trouvé');
        }

        console.log('⏳ [DEBUG] Attente de la réussite de la connexion...');
        await this.waitForLoginSuccess();
        console.log('✅ [DEBUG] Connexion LinkedIn réussie');
    }

    async checkLoginStatus() {
        console.log('🔍 [DEBUG] Vérification du statut de connexion LinkedIn');
        
        const loginIndicators = [
            '.global-nav__me-photo',
            '.nav__button-secondary',
            '[data-testid="global-nav__me"]'
        ];

        const logoutIndicators = [
            'a[href*="login"]',
            '.nav__button-secondary'
        ];

        console.log('🔍 [DEBUG] Recherche des indicateurs de connexion...');
        for (const selector of loginIndicators) {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`✅ [DEBUG] Indicateur de connexion trouvé: ${selector}`);
                return true;
            }
        }

        console.log('🔍 [DEBUG] Recherche des indicateurs de déconnexion...');
        for (const selector of logoutIndicators) {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`⚠️ [DEBUG] Indicateur de déconnexion trouvé: ${selector}`);
                return false;
            }
        }

        console.log('❓ [DEBUG] Statut de connexion indéterminé');
        return false;
    }

    async searchJob(jobData) {
        console.log('🔍 [DEBUG] Recherche d\'offre LinkedIn');
        console.log('📋 [DEBUG] Données de recherche:', jobData);
        
        // LinkedIn utilise une recherche par mots-clés
        const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jobData.title)}&location=${encodeURIComponent(jobData.location || '')}`;
        console.log('🌐 [DEBUG] URL de recherche:', searchUrl);
        
        window.location.href = searchUrl;
        await this.waitForPageLoad();
        console.log('✅ [DEBUG] Recherche LinkedIn terminée');
    }

    async applyToJob(applicationData) {
        console.log('📝 [DEBUG] Candidature LinkedIn');
        console.log('📋 [DEBUG] Données de candidature:', applicationData);
        
        await this.waitForPageLoad();

        // Chercher le bouton "Postuler"
        console.log('🔍 [DEBUG] Recherche du bouton "Postuler" LinkedIn');
        const applyButton = document.querySelector('.jobs-apply-button, .apply-button, button[aria-label*="Postuler"]');
        if (!applyButton) {
            console.error('❌ [DEBUG] Bouton de candidature LinkedIn non trouvé');
            throw new Error('Bouton de candidature LinkedIn non trouvé');
        }

        console.log('✅ [DEBUG] Bouton "Postuler" trouvé, clic en cours...');
        await this.humanBehavior.naturalClick(applyButton);

        // Attendre le formulaire de candidature
        console.log('⏳ [DEBUG] Attente du formulaire de candidature...');
        await this.waitForElement('.jobs-easy-apply-content, .jobs-apply-form');

        // Remplir le formulaire LinkedIn
        console.log('📝 [DEBUG] Remplissage du formulaire LinkedIn...');
        await this.fillLinkedInForm(applicationData);

        // Soumettre
        console.log('🔍 [DEBUG] Recherche du bouton de soumission...');
        const submitButton = document.querySelector('.jobs-apply-button--top-card, button[aria-label*="Soumettre"]');
        if (submitButton) {
            console.log('✅ [DEBUG] Bouton de soumission trouvé, clic en cours...');
            await this.humanBehavior.naturalClick(submitButton);
        } else {
            console.warn('⚠️ [DEBUG] Bouton de soumission non trouvé');
        }
        
        console.log('✅ [DEBUG] Candidature LinkedIn terminée');
    }

    async fillLinkedInForm(applicationData) {
        console.log('📝 [DEBUG] Remplissage du formulaire LinkedIn');
        
        const profile = applicationData.profile;
        console.log('👤 [DEBUG] Profil utilisé:', profile);

        // LinkedIn pré-remplit souvent les informations
        // Vérifier et compléter si nécessaire
        const nameField = document.querySelector('input[name="name"], input[name="firstName"]');
        const emailField = document.querySelector('input[type="email"], input[name="email"]');
        const phoneField = document.querySelector('input[type="tel"], input[name="phone"]');

        console.log('🔍 [DEBUG] Champs trouvés:', {
            nameField: !!nameField,
            emailField: !!emailField,
            phoneField: !!phoneField
        });

        if (nameField && !nameField.value && profile.name) {
            console.log('📝 [DEBUG] Remplissage du champ nom:', profile.name);
            await this.humanBehavior.humanTyping(nameField, profile.name);
        }

        if (emailField && !emailField.value && profile.email) {
            console.log('📝 [DEBUG] Remplissage du champ email:', profile.email);
            await this.humanBehavior.humanTyping(emailField, profile.email);
        }

        if (phoneField && !phoneField.value && profile.phone) {
            console.log('📝 [DEBUG] Remplissage du champ téléphone:', profile.phone);
            await this.humanBehavior.humanTyping(phoneField, profile.phone);
        }
        
        console.log('✅ [DEBUG] Formulaire LinkedIn rempli');
    }

    async testConnection(credentials) {
        console.log('🔗 [DEBUG] Test de connexion LinkedIn');
        console.log('📧 [DEBUG] Email utilisé:', credentials.email);
        
        if (await this.checkLoginStatus()) {
            console.log('✅ [DEBUG] Déjà connecté à LinkedIn');
            return { success: true, message: 'Déjà connecté à LinkedIn' };
        }

        try {
            console.log('🔐 [DEBUG] Tentative de connexion LinkedIn...');
            await this.login(credentials);
            console.log('✅ [DEBUG] Connexion LinkedIn réussie');
            return { success: true, message: 'Connexion LinkedIn réussie' };
        } catch (error) {
            console.error('❌ [DEBUG] Erreur de connexion LinkedIn:', error);
            return { success: false, error: error.message };
        }
    }

    async waitForLoginSuccess() {
        console.log('⏳ [DEBUG] Attente de la réussite de la connexion LinkedIn');
        
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkLogin = () => {
                if (this.checkLoginStatus()) {
                    console.log('✅ [DEBUG] Connexion LinkedIn confirmée');
                    resolve();
                    return;
                }
                
                const errorElements = document.querySelectorAll('.alert-error, .error, .login-error');
                if (errorElements.length > 0) {
                    const errorText = errorElements[0].textContent.trim();
                    console.error('❌ [DEBUG] Erreur de connexion détectée:', errorText);
                    reject(new Error(`Erreur de connexion: ${errorText}`));
                    return;
                }
                
                if (Date.now() - startTime > 15000) {
                    console.error('❌ [DEBUG] Timeout de connexion LinkedIn');
                    reject(new Error('Timeout de connexion LinkedIn'));
                    return;
                }
                
                setTimeout(checkLogin, 500);
            };
            
            checkLogin();
        });
    }

    extractJobId() {
        const url = window.location.href;
        const match = url.match(/jobs\/view\/([^\/\?]+)/);
        const jobId = match ? match[1] : Date.now().toString();
        console.log('🆔 [DEBUG] Job ID extrait:', jobId);
        return jobId;
    }
}

// Adaptateur Indeed
class IndeedAdapter extends BaseSiteAdapter {
    constructor(humanBehavior) {
        super(humanBehavior);
        this.siteName = 'Indeed';
    }

    async detectJob() {
        const jobData = {
            id: this.extractJobId(),
            url: window.location.href,
            title: '',
            company: '',
            location: '',
            type: '',
            description: ''
        };

        // Sélecteurs Indeed spécifiques
        const titleSelectors = [
            'h1[data-testid="jobsearch-JobInfoHeader-title"]',
            '.jobsearch-JobInfoHeader-title',
            'h1',
            '.title'
        ];

        const companySelectors = [
            '[data-testid="jobsearch-JobInfoHeader-companyName"]',
            '.jobsearch-JobInfoHeader-companyName',
            '.company'
        ];

        const locationSelectors = [
            '[data-testid="jobsearch-JobInfoHeader-locationText"]',
            '.jobsearch-JobInfoHeader-locationText',
            '.location'
        ];

        // Extraire les informations
        for (const selector of titleSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                jobData.title = element.textContent.trim();
                break;
            }
        }

        for (const selector of companySelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                jobData.company = element.textContent.trim();
                break;
            }
        }

        for (const selector of locationSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                jobData.location = element.textContent.trim();
                break;
            }
        }

        if (!jobData.title) {
            throw new Error('Impossible de détecter le titre du poste Indeed');
        }

        return jobData;
    }

    async login(credentials) {
        await this.waitForPageLoad();
        
        // Chercher le bouton de connexion
        const loginButton = document.querySelector('a[href*="login"], .login-button, [data-testid="login-button"]');
        if (!loginButton) {
            throw new Error('Bouton de connexion Indeed non trouvé');
        }

        await this.humanBehavior.naturalClick(loginButton);
        await this.waitForElement('form[action*="login"], input[type="email"]');

        // Remplir le formulaire
        const emailField = document.querySelector('input[type="email"], input[name="email"]');
        const passwordField = document.querySelector('input[type="password"], input[name="password"]');

        if (!emailField || !passwordField) {
            throw new Error('Champs de connexion Indeed non trouvés');
        }

        await this.humanBehavior.humanTyping(emailField, credentials.email);
        await this.humanBehavior.humanTyping(passwordField, credentials.password);

        // Soumettre
        const submitButton = document.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) {
            await this.humanBehavior.naturalClick(submitButton);
        }

        await this.waitForLoginSuccess();
    }

    async checkLoginStatus() {
        const loginIndicators = [
            '.user-menu',
            '.profile-menu',
            '[data-testid="user-menu"]'
        ];

        const logoutIndicators = [
            'a[href*="login"]',
            '.login-button'
        ];

        for (const selector of loginIndicators) {
            if (document.querySelector(selector)) {
                return true;
            }
        }

        for (const selector of logoutIndicators) {
            if (document.querySelector(selector)) {
                return false;
            }
        }

        return false;
    }

    async searchJob(jobData) {
        // Recherche Indeed
        const searchUrl = `https://fr.indeed.com/emplois?q=${encodeURIComponent(jobData.title)}&l=${encodeURIComponent(jobData.location || '')}`;
        window.location.href = searchUrl;
        await this.waitForPageLoad();
    }

    async applyToJob(applicationData) {
        await this.waitForPageLoad();

        // Chercher le bouton "Postuler"
        const applyButton = document.querySelector('.apply-button, .btn-apply, button[data-testid="apply-button"]');
        if (!applyButton) {
            throw new Error('Bouton de candidature Indeed non trouvé');
        }

        await this.humanBehavior.naturalClick(applyButton);

        // Attendre le formulaire
        await this.waitForElement('.application-form, form');

        // Remplir le formulaire
        await this.fillIndeedForm(applicationData);

        // Soumettre
        const submitButton = document.querySelector('button[type="submit"], .submit-button');
        if (submitButton) {
            await this.humanBehavior.naturalClick(submitButton);
        }
    }

    async fillIndeedForm(applicationData) {
        const profile = applicationData.profile;

        const nameField = document.querySelector('input[name="name"], input[name="firstName"]');
        const emailField = document.querySelector('input[type="email"], input[name="email"]');
        const phoneField = document.querySelector('input[type="tel"], input[name="phone"]');
        const messageField = document.querySelector('textarea, textarea[name="message"]');

        if (nameField && profile.name) {
            await this.humanBehavior.humanTyping(nameField, profile.name);
        }

        if (emailField && profile.email) {
            await this.humanBehavior.humanTyping(emailField, profile.email);
        }

        if (phoneField && profile.phone) {
            await this.humanBehavior.humanTyping(phoneField, profile.phone);
        }

        if (messageField && profile.coverLetter) {
            await this.humanBehavior.humanTyping(messageField, profile.coverLetter);
        }
    }

    async testConnection(credentials) {
        if (await this.checkLoginStatus()) {
            return { success: true, message: 'Déjà connecté à Indeed' };
        }

        try {
            await this.login(credentials);
            return { success: true, message: 'Connexion Indeed réussie' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async waitForLoginSuccess() {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkLogin = () => {
                if (this.checkLoginStatus()) {
                    resolve();
                    return;
                }
                
                const errorElements = document.querySelectorAll('.alert-error, .error');
                if (errorElements.length > 0) {
                    const errorText = errorElements[0].textContent.trim();
                    reject(new Error(`Erreur de connexion: ${errorText}`));
                    return;
                }
                
                if (Date.now() - startTime > 15000) {
                    reject(new Error('Timeout de connexion Indeed'));
                    return;
                }
                
                setTimeout(checkLogin, 500);
            };
            
            checkLogin();
        });
    }

    extractJobId() {
        const url = window.location.href;
        const match = url.match(/viewjob\?jk=([^&]+)/);
        return match ? match[1] : Date.now().toString();
    }
}

// Adaptateur APEC
class ApecAdapter extends BaseSiteAdapter {
    constructor(humanBehavior) {
        super(humanBehavior);
        this.siteName = 'APEC';
    }

    async detectJob() {
        const jobData = {
            id: this.extractJobId(),
            url: window.location.href,
            title: '',
            company: '',
            location: '',
            type: '',
            description: ''
        };

        // Sélecteurs APEC spécifiques
        const titleSelectors = [
            'h1[data-testid="job-title"]',
            '.job-title h1',
            '.title',
            'h1'
        ];

        const companySelectors = [
            '[data-testid="company-name"]',
            '.company-name',
            '.employer-name'
        ];

        const locationSelectors = [
            '[data-testid="location"]',
            '.job-location',
            '.location'
        ];

        // Extraire les informations
        for (const selector of titleSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                jobData.title = element.textContent.trim();
                break;
            }
        }

        for (const selector of companySelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                jobData.company = element.textContent.trim();
                break;
            }
        }

        for (const selector of locationSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                jobData.location = element.textContent.trim();
                break;
            }
        }

        if (!jobData.title) {
            throw new Error('Impossible de détecter le titre du poste APEC');
        }

        return jobData;
    }

    async login(credentials) {
        await this.waitForPageLoad();
        
        // Chercher le bouton de connexion
        const loginButton = document.querySelector('.login-button, .connexion, a[href*="connexion"]');
        if (!loginButton) {
            throw new Error('Bouton de connexion APEC non trouvé');
        }

        await this.humanBehavior.naturalClick(loginButton);
        await this.waitForElement('form[action*="connexion"], .login-form');

        // Remplir le formulaire
        const emailField = document.querySelector('input[type="email"], input[name="email"]');
        const passwordField = document.querySelector('input[type="password"], input[name="password"]');

        if (!emailField || !passwordField) {
            throw new Error('Champs de connexion APEC non trouvés');
        }

        await this.humanBehavior.humanTyping(emailField, credentials.email);
        await this.humanBehavior.humanTyping(passwordField, credentials.password);

        // Soumettre
        const submitButton = document.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) {
            await this.humanBehavior.naturalClick(submitButton);
        }

        await this.waitForLoginSuccess();
    }

    async checkLoginStatus() {
        const loginIndicators = [
            '.user-menu',
            '.mon-compte',
            '[data-testid="user-menu"]'
        ];

        const logoutIndicators = [
            '.login-button',
            '.connexion',
            'a[href*="connexion"]'
        ];

        for (const selector of loginIndicators) {
            if (document.querySelector(selector)) {
                return true;
            }
        }

        for (const selector of logoutIndicators) {
            if (document.querySelector(selector)) {
                return false;
            }
        }

        return false;
    }

    async searchJob(jobData) {
        // Recherche APEC
        const searchUrl = `https://www.apec.fr/candidat/recherche-emploi.html?motsCles=${encodeURIComponent(jobData.title)}&lieux=${encodeURIComponent(jobData.location || '')}`;
        window.location.href = searchUrl;
        await this.waitForPageLoad();
    }

    async applyToJob(applicationData) {
        await this.waitForPageLoad();

        // Chercher le bouton "Postuler"
        const applyButton = document.querySelector('.apply-button, .candidature-button, button[data-testid="apply-button"]');
        if (!applyButton) {
            throw new Error('Bouton de candidature APEC non trouvé');
        }

        await this.humanBehavior.naturalClick(applyButton);

        // Attendre le formulaire
        await this.waitForElement('.application-form, form');

        // Remplir le formulaire
        await this.fillApecForm(applicationData);

        // Soumettre
        const submitButton = document.querySelector('button[type="submit"], .submit-button');
        if (submitButton) {
            await this.humanBehavior.naturalClick(submitButton);
        }
    }

    async fillApecForm(applicationData) {
        const profile = applicationData.profile;

        const nameField = document.querySelector('input[name="name"], input[name="nom"]');
        const emailField = document.querySelector('input[type="email"], input[name="email"]');
        const phoneField = document.querySelector('input[type="tel"], input[name="telephone"]');
        const messageField = document.querySelector('textarea, textarea[name="message"]');

        if (nameField && profile.name) {
            await this.humanBehavior.humanTyping(nameField, profile.name);
        }

        if (emailField && profile.email) {
            await this.humanBehavior.humanTyping(emailField, profile.email);
        }

        if (phoneField && profile.phone) {
            await this.humanBehavior.humanTyping(phoneField, profile.phone);
        }

        if (messageField && profile.coverLetter) {
            await this.humanBehavior.humanTyping(messageField, profile.coverLetter);
        }
    }

    async testConnection(credentials) {
        if (await this.checkLoginStatus()) {
            return { success: true, message: 'Déjà connecté à APEC' };
        }

        try {
            await this.login(credentials);
            return { success: true, message: 'Connexion APEC réussie' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async waitForLoginSuccess() {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkLogin = () => {
                if (this.checkLoginStatus()) {
                    resolve();
                    return;
                }
                
                const errorElements = document.querySelectorAll('.alert-error, .error');
                if (errorElements.length > 0) {
                    const errorText = errorElements[0].textContent.trim();
                    reject(new Error(`Erreur de connexion: ${errorText}`));
                    return;
                }
                
                if (Date.now() - startTime > 15000) {
                    reject(new Error('Timeout de connexion APEC'));
                    return;
                }
                
                setTimeout(checkLogin, 500);
            };
            
            checkLogin();
        });
    }

    extractJobId() {
        const url = window.location.href;
        const match = url.match(/emploi\/([^\/\?]+)/);
        return match ? match[1] : Date.now().toString();
    }
}

// Adaptateur Pôle Emploi
class PoleEmploiAdapter extends BaseSiteAdapter {
    constructor(humanBehavior) {
        super(humanBehavior);
        this.siteName = 'Pôle Emploi';
    }

    async detectJob() {
        const jobData = {
            id: this.extractJobId(),
            url: window.location.href,
            title: '',
            company: '',
            location: '',
            type: '',
            description: ''
        };

        // Sélecteurs Pôle Emploi spécifiques
        const titleSelectors = [
            'h1.media-heading',
            '.job-title',
            'h1',
            '.title'
        ];

        const companySelectors = [
            '.company',
            '.employer',
            '.company-name'
        ];

        const locationSelectors = [
            '.location',
            '.place',
            '.job-location'
        ];

        // Extraire les informations
        for (const selector of titleSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                jobData.title = element.textContent.trim();
                break;
            }
        }

        for (const selector of companySelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                jobData.company = element.textContent.trim();
                break;
            }
        }

        for (const selector of locationSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                jobData.location = element.textContent.trim();
                break;
            }
        }

        if (!jobData.title) {
            throw new Error('Impossible de détecter le titre du poste Pôle Emploi');
        }

        return jobData;
    }

    async login(credentials) {
        await this.waitForPageLoad();
        
        // Chercher le bouton de connexion
        const loginButton = document.querySelector('.btn-connexion, a[href*="connexion"], .login-button');
        if (!loginButton) {
            throw new Error('Bouton de connexion Pôle Emploi non trouvé');
        }

        await this.humanBehavior.naturalClick(loginButton);
        await this.waitForElement('form[action*="connexion"], input[type="email"]');

        // Remplir le formulaire
        const emailField = document.querySelector('input[type="email"], input[name="email"]');
        const passwordField = document.querySelector('input[type="password"], input[name="password"]');

        if (!emailField || !passwordField) {
            throw new Error('Champs de connexion Pôle Emploi non trouvés');
        }

        await this.humanBehavior.humanTyping(emailField, credentials.email);
        await this.humanBehavior.humanTyping(passwordField, credentials.password);

        // Soumettre
        const submitButton = document.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) {
            await this.humanBehavior.naturalClick(submitButton);
        }

        await this.waitForLoginSuccess();
    }

    async checkLoginStatus() {
        const loginIndicators = [
            '.user-menu',
            '.mon-compte',
            '.profile'
        ];

        const logoutIndicators = [
            '.btn-connexion',
            'a[href*="connexion"]'
        ];

        for (const selector of loginIndicators) {
            if (document.querySelector(selector)) {
                return true;
            }
        }

        for (const selector of logoutIndicators) {
            if (document.querySelector(selector)) {
                return false;
            }
        }

        return false;
    }

    async searchJob(jobData) {
        // Recherche Pôle Emploi
        const searchUrl = `https://candidat.pole-emploi.fr/offres/recherche?motsCles=${encodeURIComponent(jobData.title)}&localisation=${encodeURIComponent(jobData.location || '')}`;
        window.location.href = searchUrl;
        await this.waitForPageLoad();
    }

    async applyToJob(applicationData) {
        await this.waitForPageLoad();

        // Chercher le bouton "Postuler"
        const applyButton = document.querySelector('.btn-candidature, .apply-button, button[data-testid="apply-button"]');
        if (!applyButton) {
            throw new Error('Bouton de candidature Pôle Emploi non trouvé');
        }

        await this.humanBehavior.naturalClick(applyButton);

        // Attendre le formulaire
        await this.waitForElement('.candidature-form, form');

        // Remplir le formulaire
        await this.fillPoleEmploiForm(applicationData);

        // Soumettre
        const submitButton = document.querySelector('button[type="submit"], .submit-button');
        if (submitButton) {
            await this.humanBehavior.naturalClick(submitButton);
        }
    }

    async fillPoleEmploiForm(applicationData) {
        const profile = applicationData.profile;

        const nameField = document.querySelector('input[name="name"], input[name="nom"]');
        const emailField = document.querySelector('input[type="email"], input[name="email"]');
        const phoneField = document.querySelector('input[type="tel"], input[name="telephone"]');
        const messageField = document.querySelector('textarea, textarea[name="message"]');

        if (nameField && profile.name) {
            await this.humanBehavior.humanTyping(nameField, profile.name);
        }

        if (emailField && profile.email) {
            await this.humanBehavior.humanTyping(emailField, profile.email);
        }

        if (phoneField && profile.phone) {
            await this.humanBehavior.humanTyping(phoneField, profile.phone);
        }

        if (messageField && profile.coverLetter) {
            await this.humanBehavior.humanTyping(messageField, profile.coverLetter);
        }
    }

    async testConnection(credentials) {
        if (await this.checkLoginStatus()) {
            return { success: true, message: 'Déjà connecté à Pôle Emploi' };
        }

        try {
            await this.login(credentials);
            return { success: true, message: 'Connexion Pôle Emploi réussie' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async waitForLoginSuccess() {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkLogin = () => {
                if (this.checkLoginStatus()) {
                    resolve();
                    return;
                }
                
                const errorElements = document.querySelectorAll('.alert-error, .error');
                if (errorElements.length > 0) {
                    const errorText = errorElements[0].textContent.trim();
                    reject(new Error(`Erreur de connexion: ${errorText}`));
                    return;
                }
                
                if (Date.now() - startTime > 15000) {
                    reject(new Error('Timeout de connexion Pôle Emploi'));
                    return;
                }
                
                setTimeout(checkLogin, 500);
            };
            
            checkLogin();
        });
    }

    extractJobId() {
        const url = window.location.href;
        const match = url.match(/offre\/([^\/\?]+)/);
        return match ? match[1] : Date.now().toString();
    }
}

// Adaptateur Jobteaser
class JobteaserAdapter extends BaseSiteAdapter {
    constructor(humanBehavior) {
        super(humanBehavior);
        this.siteName = 'Jobteaser';
        this.credentials = {
            email: 'wawawawa1001100110011001@proton.me',
            password: 'Wawawawa1001100110011001'
        };
        this.cvData = null;
        this.applicationStats = {
            successful: 0,
            failed: 0,
            failureReasons: []
        };
        
        // Configuration des proxies (même liste que les scrapers)
        this.proxyList = [
            // Proxies européens
            { host: '156.228.189.249', port: 3129 },
            { host: '156.253.168.60', port: 3129 },
            { host: '154.213.198.102', port: 3129 },
            { host: '154.213.194.7', port: 3129 },
            { host: '154.213.193.184', port: 3129 },
            { host: '154.213.203.97', port: 3129 },
            { host: '154.213.166.162', port: 3129 },
            { host: '154.94.15.55', port: 3129 },
            { host: '156.228.179.246', port: 3129 },
            { host: '156.253.178.191', port: 3129 }
        ];
        this.currentProxyIndex = 0;
        
        // User agents variés pour éviter la détection
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
        ];
        
        // Activer le proxy au démarrage
        this.setupProxy();
    }

    // Configuration du proxy Chrome
    async setupProxy() {
        console.log('🌐 [DEBUG] Configuration du proxy');
        
        // Vérifier si l'API chrome.proxy est disponible
        if (typeof chrome !== 'undefined' && chrome.proxy) {
            const proxy = this.getNextProxy();
            const config = {
                mode: "fixed_servers",
                rules: {
                    singleProxy: {
                        scheme: "http",
                        host: proxy.host,
                        port: proxy.port
                    },
                    bypassList: ["localhost", "127.0.0.1"]
                }
            };
            
            // Configuration du proxy
            chrome.proxy.settings.set(
                { value: config, scope: 'regular' },
                () => {
                    if (chrome.runtime.lastError) {
                        console.error('❌ [DEBUG] Erreur configuration proxy:', chrome.runtime.lastError);
                    } else {
                        console.log(`✅ [DEBUG] Proxy configuré: ${proxy.host}:${proxy.port}`);
                    }
                }
            );
        } else {
            console.warn('⚠️ [DEBUG] API chrome.proxy non disponible');
        }
        
        // Changer le User-Agent
        this.changeUserAgent();
    }
    
    // Obtenir le prochain proxy de la liste
    getNextProxy() {
        const proxy = this.proxyList[this.currentProxyIndex % this.proxyList.length];
        this.currentProxyIndex++;
        console.log(`🌐 [DEBUG] Proxy sélectionné: ${proxy.host}:${proxy.port}`);
        return proxy;
    }
    
    // Changer le User-Agent
    changeUserAgent() {
        const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
        console.log(`🔄 [DEBUG] User-Agent: ${userAgent}`);
        
        // Note: Changer le User-Agent nécessite l'API webRequest dans le background script
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({
                action: 'changeUserAgent',
                userAgent: userAgent
            });
        }
    }

    async detectJob() {
        console.log('🔍 [DEBUG] Détection d\'offre Jobteaser');
        
        const jobData = {
            id: this.extractJobId(),
            url: window.location.href,
            title: '',
            company: '',
            location: '',
            type: '',
            description: ''
        };

        // Sélecteurs spécifiques Jobteaser
        const titleElement = document.querySelector('h1, [data-testid="job-title"], .job-title');
        const companyElement = document.querySelector('[data-testid="company-name"], .company-name, .company');
        const locationElement = document.querySelector('[data-testid="job-location"], .location, .job-location');
        
        if (titleElement) jobData.title = titleElement.textContent.trim();
        if (companyElement) jobData.company = companyElement.textContent.trim();
        if (locationElement) jobData.location = locationElement.textContent.trim();

        if (!jobData.title) {
            throw new Error('Impossible de détecter le titre du poste Jobteaser');
        }

        console.log('✅ [DEBUG] Offre Jobteaser détectée:', jobData);
        return jobData;
    }

    async login(credentials = null) {
        console.log('🔐 [DEBUG] Connexion Jobteaser');
        const creds = credentials || this.credentials;
        
        await this.waitForPageLoad();
        
        // Chercher le bouton de connexion
        const loginButton = await this.waitForElement('a[href*="login"], button[data-testid="login"], .login-button, .btn-login');
        if (loginButton) {
            await this.humanBehavior.naturalClick(loginButton);
            await this.humanBehavior.randomPause(1000, 2000);
        }

        // Attendre le formulaire de connexion
        await this.waitForElement('form[action*="login"], #email, input[type="email"], input[name="email"]');

        // Remplir les identifiants
        const emailField = document.querySelector('input[type="email"], input[name="email"], #email');
        const passwordField = document.querySelector('input[type="password"], input[name="password"], #password');

        if (!emailField || !passwordField) {
            throw new Error('Champs de connexion Jobteaser non trouvés');
        }

        // Effacer et remplir les champs
        emailField.value = '';
        await this.humanBehavior.humanTyping(emailField, creds.email);
        await this.humanBehavior.randomPause(500, 1000);

        passwordField.value = '';
        await this.humanBehavior.humanTyping(passwordField, creds.password);
        await this.humanBehavior.randomPause(500, 1000);

        // Soumettre le formulaire
        const submitButton = document.querySelector('button[type="submit"], button[data-testid="login-submit"], .submit-button');
        if (submitButton) {
            await this.humanBehavior.naturalClick(submitButton);
        } else {
            // Si pas de bouton, essayer d'appuyer sur Entrée
            const event = new KeyboardEvent('keypress', { key: 'Enter', keyCode: 13 });
            passwordField.dispatchEvent(event);
        }

        // Attendre la connexion
        await this.humanBehavior.randomPause(2000, 3000);
        
        if (!await this.checkLoginStatus()) {
            throw new Error('Échec de la connexion Jobteaser');
        }

        console.log('✅ [DEBUG] Connexion Jobteaser réussie');
    }

    async checkLoginStatus() {
        // Vérifier si connecté en cherchant des éléments spécifiques aux utilisateurs connectés
        const loggedInIndicators = [
            '.user-menu',
            '.profile-menu',
            'a[href*="logout"]',
            'button[data-testid="logout"]',
            '.user-avatar',
            '[data-testid="user-menu"]'
        ];

        for (const selector of loggedInIndicators) {
            if (document.querySelector(selector)) {
                return true;
            }
        }

        return false;
    }

    async loadCVFromServer() {
        console.log('📄 [DEBUG] Chargement du CV d\'Antoine Lorence depuis le serveur');
        
        try {
            // Utiliser le CV qu'on a déjà lu
            this.cvData = `Lorence Antoine
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
- Base de données PostgreSQL optimisée`;
            
            console.log('✅ [DEBUG] CV chargé avec succès');
            return this.cvData;
        } catch (error) {
            console.error('❌ [DEBUG] Erreur lors du chargement du CV:', error);
            throw new Error('Impossible de charger le CV');
        }
    }

    async applyToJob(applicationData) {
        console.log('📝 [DEBUG] Début de la candidature Jobteaser');
        
        try {
            await this.waitForPageLoad();

            // S'assurer d'être connecté
            if (!await this.checkLoginStatus()) {
                console.log('🔐 [DEBUG] Non connecté, tentative de connexion...');
                await this.login();
            }

            // Charger le CV si pas déjà fait
            if (!this.cvData) {
                await this.loadCVFromServer();
            }

            // Chercher le bouton "Postuler"
            const applyButtonSelectors = [
                'button[data-testid="apply-button"]',
                '.apply-button',
                'button:contains("Postuler")',
                'a:contains("Postuler")',
                '.btn-apply',
                'button.apply',
                '[data-action="apply"]'
            ];

            let applyButton = null;
            for (const selector of applyButtonSelectors) {
                applyButton = document.querySelector(selector);
                if (!applyButton && selector.includes(':contains')) {
                    // Gérer le cas :contains
                    const searchText = selector.match(/:contains\("(.+)"\)/)?.[1];
                    if (searchText) {
                        const buttons = document.querySelectorAll('button, a');
                        applyButton = Array.from(buttons).find(btn => 
                            btn.textContent.toLowerCase().includes(searchText.toLowerCase())
                        );
                    }
                }
                if (applyButton) break;
            }

            if (!applyButton) {
                throw new Error('Bouton de candidature non trouvé');
            }

            console.log('✅ [DEBUG] Bouton de candidature trouvé, clic...');
            await this.humanBehavior.naturalClick(applyButton);
            await this.humanBehavior.randomPause(2000, 3000);

            // Attendre le formulaire de candidature
            await this.waitForElement('form, .application-form, [data-testid="application-form"]', 15000);

            // Remplir le formulaire
            await this.fillApplicationForm(applicationData);

            // Soumettre la candidature
            const submitButton = document.querySelector(
                'button[type="submit"]:not([disabled])',
                'button[data-testid="submit-application"]',
                '.submit-application',
                'button:contains("Envoyer")'
            );

            if (submitButton) {
                console.log('📤 [DEBUG] Soumission de la candidature...');
                await this.humanBehavior.naturalClick(submitButton);
                await this.humanBehavior.randomPause(3000, 5000);
                
                // Vérifier le succès
                const successIndicators = [
                    '.success-message',
                    '.application-success',
                    '[data-testid="success-message"]',
                    '.confirmation'
                ];

                let success = false;
                for (const selector of successIndicators) {
                    if (document.querySelector(selector)) {
                        success = true;
                        break;
                    }
                }

                if (success || window.location.href.includes('success') || window.location.href.includes('confirmation')) {
                    this.applicationStats.successful++;
                    console.log('✅ [DEBUG] Candidature envoyée avec succès');
                    return true;
                } else {
                    throw new Error('Confirmation de candidature non détectée');
                }
            } else {
                throw new Error('Bouton de soumission non trouvé');
            }

        } catch (error) {
            console.error('❌ [DEBUG] Erreur lors de la candidature:', error);
            this.applicationStats.failed++;
            this.applicationStats.failureReasons.push({
                url: window.location.href,
                error: error.message
            });
            throw error;
        }
    }

    async fillApplicationForm(applicationData) {
        console.log('📝 [DEBUG] Remplissage du formulaire de candidature');

        // Champs de base
        const fields = {
            // Nom et prénom
            'input[name*="name"], input[name*="nom"], #name, #nom': 'Lorence Antoine',
            'input[name*="first"], input[name*="prenom"], #firstname, #prenom': 'Antoine',
            'input[name*="last"], input[name*="nom"], #lastname': 'Lorence',
            
            // Contact
            'input[type="email"], input[name*="email"], #email': 'lorence.antoine@email.com',
            'input[type="tel"], input[name*="phone"], input[name*="tel"], #phone': '0123456789',
            
            // CV (textarea ou champ texte)
            'textarea[name*="cv"], textarea[name*="resume"], #cv, #resume': this.cvData,
            
            // Lettre de motivation
            'textarea[name*="cover"], textarea[name*="letter"], textarea[name*="motivation"], #cover-letter': this.cvData
        };

        for (const [selector, value] of Object.entries(fields)) {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`📝 [DEBUG] Remplissage du champ: ${selector}`);
                element.value = '';
                await this.humanBehavior.humanTyping(element, value);
                await this.humanBehavior.randomPause(300, 800);
            }
        }

        // Gérer les uploads de fichiers si nécessaire
        const fileInputs = document.querySelectorAll('input[type="file"]');
        if (fileInputs.length > 0) {
            console.log('📎 [DEBUG] Upload de fichiers détecté mais non géré (utilisation du champ texte)');
        }

        // Cocher les cases requises
        const checkboxes = document.querySelectorAll('input[type="checkbox"][required]');
        for (const checkbox of checkboxes) {
            if (!checkbox.checked) {
                await this.humanBehavior.naturalClick(checkbox);
                await this.humanBehavior.randomPause(200, 500);
            }
        }
    }

    extractJobId() {
        const url = window.location.href;
        // Pattern Jobteaser : /job-offers/{uuid}-{company}-{job-title}
        const match = url.match(/job-offers\/([a-f0-9-]+)/);
        return match ? match[1] : Date.now().toString();
    }

    async applyToAllJobs() {
        console.log('🚀 [DEBUG] Début de la candidature automatique à toutes les offres Jobteaser');
        
        // S'assurer d'être connecté
        if (!await this.checkLoginStatus()) {
            await this.login();
        }

        // Charger le CV
        if (!this.cvData) {
            await this.loadCVFromServer();
        }

        // Récupérer toutes les offres de la page
        const jobLinks = document.querySelectorAll('a[href*="/job-offers/"]');
        console.log(`📊 [DEBUG] ${jobLinks.length} offres trouvées sur la page`);

        for (let i = 0; i < jobLinks.length; i++) {
            const jobLink = jobLinks[i];
            const jobUrl = jobLink.href;
            
            console.log(`\n📍 [DEBUG] Traitement de l'offre ${i + 1}/${jobLinks.length}: ${jobUrl}`);
            
            try {
                // Ouvrir l'offre dans un nouvel onglet
                window.open(jobUrl, '_blank');
                
                // Attendre un peu pour laisser le temps à l'onglet de se charger
                await this.humanBehavior.randomPause(5000, 8000);
                
                // Note: Dans une vraie extension, on utiliserait l'API chrome.tabs pour gérer les onglets
                
            } catch (error) {
                console.error(`❌ [DEBUG] Erreur pour l'offre ${jobUrl}:`, error);
                this.applicationStats.failed++;
                this.applicationStats.failureReasons.push({
                    url: jobUrl,
                    error: error.message
                });
            }
        }

        // Afficher les statistiques
        console.log('\n📊 [DEBUG] Statistiques finales:');
        console.log(`✅ Candidatures réussies: ${this.applicationStats.successful}`);
        console.log(`❌ Candidatures échouées: ${this.applicationStats.failed}`);
        
        if (this.applicationStats.failureReasons.length > 0) {
            console.log('\n❌ Raisons des échecs:');
            this.applicationStats.failureReasons.forEach((failure, index) => {
                console.log(`${index + 1}. ${failure.url}: ${failure.error}`);
            });
        }

        return this.applicationStats;
    }

    async testConnection(credentials) {
        if (await this.checkLoginStatus()) {
            return { success: true, message: 'Déjà connecté à Jobteaser' };
        }

        try {
            await this.login(credentials);
            return { success: true, message: 'Connexion Jobteaser réussie' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Adaptateur générique pour les sites non supportés
class GenericAdapter extends BaseSiteAdapter {
    constructor(humanBehavior) {
        super(humanBehavior);
        this.siteName = 'Generic';
    }

    async detectJob() {
        // Logique générique de détection
        const jobData = {
            id: this.extractJobId(),
            url: window.location.href,
            title: '',
            company: '',
            location: '',
            type: '',
            description: ''
        };

        // Sélecteurs génériques
        const titleSelectors = ['h1', '.title', '.job-title', '[data-testid="title"]'];
        const companySelectors = ['.company', '.employer', '.company-name'];
        const locationSelectors = ['.location', '.place', '.job-location'];

        for (const selector of titleSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                jobData.title = element.textContent.trim();
                break;
            }
        }

        for (const selector of companySelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                jobData.company = element.textContent.trim();
                break;
            }
        }

        for (const selector of locationSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                jobData.location = element.textContent.trim();
                break;
            }
        }

        if (!jobData.title) {
            throw new Error('Impossible de détecter le titre du poste');
        }

        return jobData;
    }

    async login(credentials) {
        // Logique générique de connexion
        throw new Error('Connexion non supportée pour ce site');
    }

    async checkLoginStatus() {
        // Logique générique de vérification
        return false;
    }

    async searchJob(jobData) {
        // Logique générique de recherche
        throw new Error('Recherche non supportée pour ce site');
    }

    async applyToJob(applicationData) {
        // Logique générique de candidature
        throw new Error('Candidature non supportée pour ce site');
    }

    async testConnection(credentials) {
        return { success: false, error: 'Site non supporté' };
    }

    extractJobId() {
        const url = window.location.href;
        const urlObj = new URL(url);
        return urlObj.pathname.split('/').pop() || Date.now().toString();
    }
}

// Export des adaptateurs
window.SiteAdapters = {
    LinkedInAdapter,
    IndeedAdapter,
    ApecAdapter,
    PoleEmploiAdapter,
    JobteaserAdapter,
    GenericAdapter
}; 