const puppeteer = require('puppeteer');

async function autoApplyJobteaser() {
    console.log('🚀 Début des candidatures automatiques Jobteaser');
    
    // Configuration
    const credentials = {
        email: 'wawawawa1001100110011001@proton.me',
        password: 'Wawawawa1001100110011001'
    };
    
    // CV d'Antoine Lorence
    const cvData = `Lorence Antoine
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

    // Proxies disponibles
    const proxies = [
        { host: '156.228.189.249', port: 3129 },
        { host: '156.253.168.60', port: 3129 },
        { host: '154.213.198.102', port: 3129 },
        { host: '154.213.194.7', port: 3129 },
        { host: '154.213.193.184', port: 3129 }
    ];
    
    // User agents
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    
    // Sélectionner un proxy et un user agent aléatoires
    const proxy = proxies[Math.floor(Math.random() * proxies.length)];
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    console.log(`🌐 Utilisation du proxy: ${proxy.host}:${proxy.port}`);
    console.log(`🔄 User-Agent: ${userAgent}`);
    
    // Statistiques
    let successful = 0;
    let failed = 0;
    const failureReasons = [];
    
    let browser;
    
    try {
        // Lancer le navigateur sans proxy pour le test
        browser = await puppeteer.launch({
            headless: false, // Mode visible pour déboguer
            args: [
                // `--proxy-server=http://${proxy.host}:${proxy.port}`, // Désactivé temporairement
                '--no-sandbox',
                '--disable-setuid-sandbox',
                `--user-agent=${userAgent}`,
                '--window-size=1366,768',
                '--disable-blink-features=AutomationControlled'
            ],
            defaultViewport: null
        });
        
        const page = await browser.newPage();
        
        // Configuration de la page
        await page.setViewport({ width: 1366, height: 768 });
        await page.setUserAgent(userAgent);
        
        // Fonction pour attendre avec délai aléatoire
        const randomDelay = (min = 1000, max = 3000) => {
            const delay = Math.random() * (max - min) + min;
            return new Promise(resolve => setTimeout(resolve, delay));
        };
        
        // Fonction pour taper comme un humain
        const humanType = async (selector, text) => {
            await page.click(selector);
            await page.evaluate((sel) => {
                document.querySelector(sel).value = '';
            }, selector);
            await page.type(selector, text, { delay: 100 + Math.random() * 100 });
        };
        
        console.log('📄 Navigation vers Jobteaser...');
        await page.goto('https://www.jobteaser.com/fr', { waitUntil: 'networkidle2' });
        await randomDelay();
        
        // Étape 1: Connexion
        console.log('🔐 Recherche du bouton de connexion...');
        
        // Chercher et cliquer sur le bouton de connexion
        const loginSelectors = [
            'a[href*="login"]',
            'button:has-text("Connexion")',
            'button:has-text("Se connecter")',
            '.login-button',
            'a:has-text("Connexion")',
            'a:has-text("Se connecter")'
        ];
        
        let loginClicked = false;
        for (const selector of loginSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 5000 });
                await page.click(selector);
                loginClicked = true;
                console.log('✅ Bouton de connexion trouvé et cliqué');
                break;
            } catch (e) {
                // Continuer avec le prochain sélecteur
            }
        }
        
        if (!loginClicked) {
            // Essayer de naviguer directement vers la page de connexion
            console.log('📄 Navigation directe vers la page de connexion...');
            await page.goto('https://www.jobteaser.com/fr/users/sign_in', { waitUntil: 'networkidle2' });
        }
        
        await randomDelay(2000, 4000);
        
        // Remplir le formulaire de connexion
        console.log('📝 Remplissage du formulaire de connexion...');
        
        // Email
        const emailSelectors = ['input[type="email"]', 'input[name="email"]', '#email', 'input[name="user[email]"]'];
        for (const selector of emailSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 5000 });
                await humanType(selector, credentials.email);
                console.log('✅ Email saisi');
                break;
            } catch (e) {
                // Continuer
            }
        }
        
        await randomDelay(500, 1000);
        
        // Mot de passe
        const passwordSelectors = ['input[type="password"]', 'input[name="password"]', '#password', 'input[name="user[password]"]'];
        for (const selector of passwordSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 5000 });
                await humanType(selector, credentials.password);
                console.log('✅ Mot de passe saisi');
                break;
            } catch (e) {
                // Continuer
            }
        }
        
        await randomDelay(500, 1000);
        
        // Soumettre le formulaire
        console.log('📤 Soumission du formulaire...');
        const submitSelectors = ['button[type="submit"]', 'input[type="submit"]', 'button:has-text("Se connecter")', 'button:has-text("Connexion")'];
        
        for (const selector of submitSelectors) {
            try {
                await page.click(selector);
                console.log('✅ Formulaire soumis');
                break;
            } catch (e) {
                // Continuer
            }
        }
        
        // Attendre la connexion
        await randomDelay(3000, 5000);
        
        // Vérifier si connecté
        const isLoggedIn = await page.evaluate(() => {
            const indicators = [
                document.querySelector('a[href*="logout"]'),
                document.querySelector('a[href*="sign_out"]'),
                document.querySelector('.user-menu'),
                document.querySelector('.profile-menu')
            ];
            return indicators.some(el => el !== null);
        });
        
        if (isLoggedIn) {
            console.log('✅ Connexion réussie');
        } else {
            console.log('⚠️ Statut de connexion incertain, continuation...');
        }
        
        // Étape 2: Aller sur la page des offres
        console.log('📋 Navigation vers la page des offres...');
        await page.goto('https://www.jobteaser.com/fr/job-offers', { waitUntil: 'networkidle2' });
        await randomDelay(2000, 4000);
        
        // Prendre une capture d'écran pour déboguer
        await page.screenshot({ path: 'jobteaser-page.png', fullPage: true });
        console.log('📸 Capture d\'écran sauvegardée: jobteaser-page.png');
        
        // Afficher l'URL actuelle
        const currentUrl = page.url();
        console.log('🔗 URL actuelle:', currentUrl);
        
        // Essayer différents sélecteurs pour trouver les offres
        console.log('🔍 Recherche des offres d\'emploi...');
        
        // D'abord, essayer de récupérer tout le HTML pour voir la structure
        const pageContent = await page.content();
        console.log('📄 Longueur du contenu de la page:', pageContent.length);
        
        // Essayer plusieurs sélecteurs
        const selectors = [
            'a[href*="/job-offers/"]',
            'a[href*="/fr/job-offers/"]',
            'a[href*="jobteaser.com/fr/job-offers/"]',
            '.job-card a',
            '.job-list a',
            'article a',
            'div[data-testid*="job"] a'
        ];
        
        let jobLinks = [];
        for (const selector of selectors) {
            const links = await page.evaluate((sel) => {
                const elements = Array.from(document.querySelectorAll(sel));
                return elements.map(el => el.href);
            }, selector);
            
            if (links.length > 0) {
                console.log(`✅ Trouvé ${links.length} liens avec le sélecteur: ${selector}`);
                jobLinks = links;
                break;
            }
        }
        
        // Filtrer les liens
        jobLinks = jobLinks
            .filter(href => href.includes('/job-offers/') && !href.endsWith('/job-offers/'))
            .slice(0, 5); // Limiter à 5 offres pour le test
        
        console.log(`📊 ${jobLinks.length} offres trouvées`);
        
        // Postuler à chaque offre
        for (let i = 0; i < jobLinks.length; i++) {
            const jobUrl = jobLinks[i];
            console.log(`\n📍 Traitement de l'offre ${i + 1}/${jobLinks.length}`);
            console.log(`🔗 URL: ${jobUrl}`);
            
            try {
                // Ouvrir l'offre dans un nouvel onglet
                const newPage = await browser.newPage();
                await newPage.setUserAgent(userAgent);
                await newPage.goto(jobUrl, { waitUntil: 'networkidle2' });
                await randomDelay(2000, 3000);
                
                // Récupérer les infos de l'offre
                const jobInfo = await newPage.evaluate(() => {
                    const title = document.querySelector('h1')?.textContent?.trim() || 'Titre inconnu';
                    const company = document.querySelector('[data-testid="company-name"], .company-name, .company')?.textContent?.trim() || 'Entreprise inconnue';
                    return { title, company };
                });
                
                console.log(`📋 Offre: ${jobInfo.title} chez ${jobInfo.company}`);
                
                // Chercher le bouton "Postuler"
                const applyButtonSelectors = [
                    'button:has-text("Postuler")',
                    'a:has-text("Postuler")',
                    'button[data-testid="apply-button"]',
                    '.apply-button',
                    '.btn-apply',
                    'button.apply'
                ];
                
                let applyClicked = false;
                for (const selector of applyButtonSelectors) {
                    try {
                        // Utiliser evaluate pour chercher le bouton avec le texte
                        const buttonExists = await newPage.evaluate((sel) => {
                            if (sel.includes(':has-text')) {
                                const text = sel.match(/:has-text\("(.+)"\)/)?.[1];
                                if (text) {
                                    const buttons = Array.from(document.querySelectorAll('button, a'));
                                    return buttons.some(btn => btn.textContent?.toLowerCase().includes(text.toLowerCase()));
                                }
                            }
                            return !!document.querySelector(sel);
                        }, selector);
                        
                        if (buttonExists) {
                            // Cliquer sur le bouton
                            await newPage.evaluate((sel) => {
                                if (sel.includes(':has-text')) {
                                    const text = sel.match(/:has-text\("(.+)"\)/)?.[1];
                                    if (text) {
                                        const buttons = Array.from(document.querySelectorAll('button, a'));
                                        const button = buttons.find(btn => btn.textContent?.toLowerCase().includes(text.toLowerCase()));
                                        if (button) button.click();
                                    }
                                } else {
                                    document.querySelector(sel)?.click();
                                }
                            }, selector);
                            
                            applyClicked = true;
                            console.log('✅ Bouton "Postuler" cliqué');
                            break;
                        }
                    } catch (e) {
                        // Continuer
                    }
                }
                
                if (!applyClicked) {
                    throw new Error('Bouton "Postuler" non trouvé');
                }
                
                await randomDelay(2000, 3000);
                
                // Remplir le formulaire de candidature
                console.log('📝 Remplissage du formulaire de candidature...');
                
                // Essayer de remplir différents champs
                const formFields = {
                    // Nom complet
                    'input[name*="name"], #name': 'Lorence Antoine',
                    'input[name*="first"], #firstname': 'Antoine',
                    'input[name*="last"], #lastname': 'Lorence',
                    
                    // Contact
                    'input[type="email"], input[name*="email"]': 'lorence.antoine@email.com',
                    'input[type="tel"], input[name*="phone"]': '0123456789',
                    
                    // CV et lettre
                    'textarea[name*="cv"], #cv': cvData,
                    'textarea[name*="cover"], textarea[name*="letter"]': cvData
                };
                
                for (const [selector, value] of Object.entries(formFields)) {
                    try {
                        await newPage.waitForSelector(selector, { timeout: 2000 });
                        await humanType(selector, value);
                        console.log(`✅ Champ rempli: ${selector.split(',')[0]}`);
                        await randomDelay(300, 800);
                    } catch (e) {
                        // Le champ n'existe pas, continuer
                    }
                }
                
                // Cocher les cases requises
                await newPage.evaluate(() => {
                    const checkboxes = document.querySelectorAll('input[type="checkbox"][required]');
                    checkboxes.forEach(cb => {
                        if (!cb.checked) cb.click();
                    });
                });
                
                // Soumettre la candidature
                console.log('📤 Soumission de la candidature...');
                const submitButtonSelectors = [
                    'button[type="submit"]:not([disabled])',
                    'button:has-text("Envoyer")',
                    'button:has-text("Soumettre")',
                    'button:has-text("Postuler")'
                ];
                
                let submitted = false;
                for (const selector of submitButtonSelectors) {
                    try {
                        const buttonExists = await newPage.evaluate((sel) => {
                            if (sel.includes(':has-text')) {
                                const text = sel.match(/:has-text\("(.+)"\)/)?.[1];
                                if (text) {
                                    const buttons = Array.from(document.querySelectorAll('button'));
                                    return buttons.some(btn => btn.textContent?.toLowerCase().includes(text.toLowerCase()) && !btn.disabled);
                                }
                            }
                            const btn = document.querySelector(sel);
                            return btn && !btn.disabled;
                        }, selector);
                        
                        if (buttonExists) {
                            await newPage.evaluate((sel) => {
                                if (sel.includes(':has-text')) {
                                    const text = sel.match(/:has-text\("(.+)"\)/)?.[1];
                                    if (text) {
                                        const buttons = Array.from(document.querySelectorAll('button'));
                                        const button = buttons.find(btn => btn.textContent?.toLowerCase().includes(text.toLowerCase()) && !btn.disabled);
                                        if (button) button.click();
                                    }
                                } else {
                                    document.querySelector(sel)?.click();
                                }
                            }, selector);
                            
                            submitted = true;
                            console.log('✅ Candidature soumise');
                            break;
                        }
                    } catch (e) {
                        // Continuer
                    }
                }
                
                if (!submitted) {
                    throw new Error('Impossible de soumettre la candidature');
                }
                
                await randomDelay(3000, 5000);
                
                // Vérifier le succès
                const successDetected = await newPage.evaluate(() => {
                    const successIndicators = [
                        '.success-message',
                        '.confirmation',
                        '[data-testid="success"]',
                        'h1:has-text("Merci")',
                        'h2:has-text("Candidature envoyée")'
                    ];
                    
                    return successIndicators.some(selector => {
                        if (selector.includes(':has-text')) {
                            const text = selector.match(/:has-text\("(.+)"\)/)?.[1];
                            if (text) {
                                const elements = Array.from(document.querySelectorAll('h1, h2, h3, div'));
                                return elements.some(el => el.textContent?.toLowerCase().includes(text.toLowerCase()));
                            }
                        }
                        return !!document.querySelector(selector);
                    }) || window.location.href.includes('success') || window.location.href.includes('confirmation');
                });
                
                if (successDetected) {
                    successful++;
                    console.log('✅ Candidature réussie!');
                } else {
                    throw new Error('Confirmation de candidature non détectée');
                }
                
                // Fermer l'onglet
                await newPage.close();
                
            } catch (error) {
                failed++;
                failureReasons.push({
                    url: jobUrl,
                    error: error.message
                });
                console.error(`❌ Échec de la candidature: ${error.message}`);
                
                // Fermer l'onglet en cas d'erreur
                try {
                    const pages = await browser.pages();
                    if (pages.length > 1) {
                        await pages[pages.length - 1].close();
                    }
                } catch (e) {
                    // Ignorer
                }
            }
            
            // Pause entre les candidatures
            await randomDelay(3000, 5000);
        }
        
    } catch (error) {
        console.error('❌ Erreur globale:', error);
    } finally {
        // Fermer le navigateur
        if (browser) {
            await browser.close();
        }
    }
    
    // Afficher les résultats
    console.log('\n' + '='.repeat(50));
    console.log('📊 RÉSUMÉ DES CANDIDATURES');
    console.log('='.repeat(50));
    console.log(`✅ Candidatures réussies: ${successful}`);
    console.log(`❌ Candidatures échouées: ${failed}`);
    console.log(`📊 Taux de réussite: ${successful + failed > 0 ? (successful / (successful + failed) * 100).toFixed(1) : 0}%`);
    
    if (failureReasons.length > 0) {
        console.log('\n❌ Détail des échecs:');
        failureReasons.forEach((failure, index) => {
            console.log(`${index + 1}. ${failure.url}`);
            console.log(`   Raison: ${failure.error}`);
        });
    }
    
    return {
        successful,
        failed,
        failureReasons
    };
}

// Exécuter le script
autoApplyJobteaser()
    .then(results => {
        console.log('\n✅ Script terminé');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Erreur fatale:', error);
        process.exit(1);
    });