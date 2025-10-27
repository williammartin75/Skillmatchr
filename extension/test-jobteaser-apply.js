// Script de test pour l'extension Chrome - Candidatures automatiques Jobteaser
// Ce script doit être exécuté dans la console du navigateur sur une page Jobteaser

(async function testJobteaserAutoApply() {
    console.log('🚀 Début du test de candidature automatique Jobteaser');
    
    // Vérifier que nous sommes sur Jobteaser
    if (!window.location.hostname.includes('jobteaser.com')) {
        console.error('❌ Ce script doit être exécuté sur jobteaser.com');
        return;
    }
    
    // Créer une instance de l'adaptateur
    const humanBehavior = window.humanBehavior || {
        naturalClick: async (element) => {
            element.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
        },
        humanTyping: async (element, text) => {
            element.value = text;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            await new Promise(resolve => setTimeout(resolve, 500));
        },
        randomPause: async (min, max) => {
            const delay = Math.random() * (max - min) + min;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    };
    
    const adapter = new JobteaserAdapter(humanBehavior);
    
    try {
        // Test 1: Détection de l'offre actuelle
        console.log('\n📋 Test 1: Détection de l\'offre');
        const jobData = await adapter.detectJob();
        console.log('✅ Offre détectée:', jobData);
        
        // Test 2: Vérification du statut de connexion
        console.log('\n📋 Test 2: Vérification du statut de connexion');
        const isLoggedIn = await adapter.checkLoginStatus();
        console.log(isLoggedIn ? '✅ Connecté' : '❌ Non connecté');
        
        // Test 3: Connexion si nécessaire
        if (!isLoggedIn) {
            console.log('\n📋 Test 3: Connexion');
            await adapter.login();
            console.log('✅ Connexion réussie');
        }
        
        // Test 4: Candidature sur l'offre actuelle
        console.log('\n📋 Test 4: Candidature sur l\'offre actuelle');
        const applicationData = {
            job: jobData,
            profile: {
                name: 'Lorence Antoine',
                email: 'lorence.antoine@email.com',
                phone: '0123456789'
            }
        };
        
        await adapter.applyToJob(applicationData);
        console.log('✅ Candidature envoyée avec succès');
        
        // Test 5: Affichage des statistiques
        console.log('\n📊 Statistiques des candidatures:');
        console.log(`✅ Réussies: ${adapter.applicationStats.successful}`);
        console.log(`❌ Échouées: ${adapter.applicationStats.failed}`);
        
        if (adapter.applicationStats.failureReasons.length > 0) {
            console.log('\nRaisons des échecs:');
            adapter.applicationStats.failureReasons.forEach((failure, index) => {
                console.log(`${index + 1}. ${failure.url}: ${failure.error}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
    
    console.log('\n✅ Test terminé');
})();

// Pour tester toutes les offres d'une page :
// 1. Aller sur https://www.jobteaser.com/fr/job-offers
// 2. Exécuter ce script dans la console
// 3. L'extension va automatiquement postuler à toutes les offres visibles

async function testAllJobsOnPage() {
    console.log('🚀 Test de candidature sur toutes les offres de la page');
    
    const humanBehavior = window.humanBehavior || {
        naturalClick: async (element) => {
            element.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
        },
        humanTyping: async (element, text) => {
            element.value = text;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            await new Promise(resolve => setTimeout(resolve, 500));
        },
        randomPause: async (min, max) => {
            const delay = Math.random() * (max - min) + min;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    };
    
    const adapter = new JobteaserAdapter(humanBehavior);
    const stats = await adapter.applyToAllJobs();
    
    console.log('\n📊 Résumé final:');
    console.log(`✅ Candidatures réussies: ${stats.successful}`);
    console.log(`❌ Candidatures échouées: ${stats.failed}`);
    
    return stats;
}