// Script de test pour simuler 3 candidatures successives sur JobTeaser
// Ce script doit être exécuté depuis la console du background script de l'extension

async function testThreeJobteaserApplications() {
    console.log('='.repeat(50));
    console.log('TEST: 3 CANDIDATURES JOBTEASER AUTOMATIQUES');
    console.log('='.repeat(50));
    
    // URLs de test (remplacer par de vraies URLs JobTeaser)
    const testUrls = [
        'https://www.jobteaser.com/fr/job-offers/d4fef48e-e526-47e8-9902-a2b8710b9580-shiseido-emea-alternance-security-awareness-assistant-h-f',
        'https://www.jobteaser.com/fr/job-offers/9e267e30-4e32-4bfb-bd21-6cbeed12ce7a-animalis-stage-assistant-chef-de-produit-mdd-h-f',
        'https://www.jobteaser.com/fr/job-offers/d2ee5374-0a2f-43c2-89d6-c18be421d627-societe-generale-assistant-transformation-cloud'
    ];
    
    const results = {
        successful: 0,
        failed: 0,
        details: []
    };
    
    console.log(`Début du test avec ${testUrls.length} offres`);
    console.log('');
    
    for (let i = 0; i < testUrls.length; i++) {
        const url = testUrls[i];
        const jobNumber = i + 1;
        
        console.log(`\n${'='.repeat(30)}`);
        console.log(`OFFRE ${jobNumber}/${testUrls.length}`);
        console.log(`URL: ${url}`);
        console.log(`${'='.repeat(30)}`);
        
        const startTime = Date.now();
        
        try {
            // Envoyer la demande de candidature
            console.log(`[Test] Envoi de la demande de candidature ${jobNumber}...`);
            
            // Simuler l'envoi depuis le dashboard/popup
            const response = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    action: 'apply-to-job',
                    data: { url: url }
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(response);
                    }
                });
            });
            
            const duration = Date.now() - startTime;
            
            if (response && response.success) {
                results.successful++;
                results.details.push({
                    url: url,
                    status: 'success',
                    duration: duration,
                    message: response.result?.message || 'Candidature réussie'
                });
                console.log(`✅ [Test] Candidature ${jobNumber} réussie en ${duration}ms`);
            } else {
                throw new Error(response?.error || 'Candidature échouée sans message');
            }
            
        } catch (error) {
            const duration = Date.now() - startTime;
            results.failed++;
            results.details.push({
                url: url,
                status: 'failed',
                duration: duration,
                error: error.message
            });
            console.error(`❌ [Test] Candidature ${jobNumber} échouée:`, error.message);
        }
        
        // Pause entre les candidatures (5-10 secondes)
        if (i < testUrls.length - 1) {
            const pauseDuration = 5000 + Math.random() * 5000;
            console.log(`\n⏸️  Pause de ${Math.round(pauseDuration/1000)}s avant la prochaine candidature...`);
            await new Promise(resolve => setTimeout(resolve, pauseDuration));
        }
    }
    
    // Afficher le résumé
    console.log('\n' + '='.repeat(50));
    console.log('RÉSUMÉ DU TEST');
    console.log('='.repeat(50));
    console.log(`✅ Candidatures réussies: ${results.successful}`);
    console.log(`❌ Candidatures échouées: ${results.failed}`);
    console.log(`📊 Taux de réussite: ${(results.successful / testUrls.length * 100).toFixed(1)}%`);
    console.log('\nDétails:');
    
    results.details.forEach((detail, index) => {
        console.log(`\nOffre ${index + 1}:`);
        console.log(`  URL: ${detail.url}`);
        console.log(`  Statut: ${detail.status}`);
        console.log(`  Durée: ${detail.duration}ms`);
        if (detail.status === 'success') {
            console.log(`  Message: ${detail.message}`);
        } else {
            console.log(`  Erreur: ${detail.error}`);
        }
    });
    
    return results;
}

// Fonction utilitaire pour tester une seule candidature
async function testSingleApplication(url) {
    console.log('[Test] Test d\'une candidature unique');
    console.log(`URL: ${url}`);
    
    try {
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'apply-to-job',
                data: { url: url }
            }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
        
        if (response && response.success) {
            console.log('✅ Candidature réussie:', response.result);
        } else {
            console.error('❌ Candidature échouée:', response?.error);
        }
        
        return response;
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        throw error;
    }
}

// Instructions d'utilisation
console.log('🚀 Script de test JobTeaser chargé');
console.log('');
console.log('Pour tester 3 candidatures:');
console.log('  testThreeJobteaserApplications()');
console.log('');
console.log('Pour tester une candidature unique:');
console.log('  testSingleApplication("https://www.jobteaser.com/fr/job-offers/...")');
console.log('');
console.log('Note: Assurez-vous que l\'extension est active et les permissions accordées.');