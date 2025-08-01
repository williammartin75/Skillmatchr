// Test script pour simuler des candidatures JobTeaser
// Utilisation : node test-jobteaser-apply.js

console.log('[Test] Starting JobTeaser application test...');

// URLs de test JobTeaser (remplacer par de vraies URLs)
const testJobUrls = [
    'https://www.jobteaser.com/fr/job-offers/123456-developpeur-frontend',
    'https://www.jobteaser.com/fr/job-offers/234567-ingenieur-backend',
    'https://www.jobteaser.com/fr/job-offers/345678-data-scientist'
];

// Profil de test (Antoine Lorence)
const testProfile = {
    name: 'Antoine Lorence',
    email: 'wawawawa1001100110011001@proton.me',
    phone: '+33 6 12 34 56 78',
    coverLetter: `Bonjour,

Je suis très intéressé par cette opportunité et souhaite apporter mes compétences à votre équipe.

Mes expériences passées m'ont permis de développer une expertise solide dans ce domaine.

Je serais ravi de pouvoir échanger avec vous sur la façon dont je peux contribuer à vos projets.

Cordialement,
Antoine Lorence`
};

// Chemin du CV (à adapter selon votre structure)
const cvPath = 'cv/antoine_lorence_cv.pdf';

// Fonction pour envoyer un message à l'extension
async function sendApplicationMessage(url, index) {
    console.log(`\n[Test] Application ${index + 1}/3`);
    console.log(`[Test] URL: ${url}`);
    console.log('[Test] Sending apply-to-job message...');
    
    try {
        // Simuler l'envoi du message à l'extension
        const message = {
            action: 'apply-to-job',
            data: {
                url: url,
                profile: testProfile,
                cvPath: cvPath
            }
        };
        
        console.log('[Test] Message structure:', JSON.stringify(message, null, 2));
        
        // Dans un vrai test, on utiliserait chrome.runtime.sendMessage
        // Pour ce test en ligne de commande, on affiche juste la structure
        
        console.log('[Test] Waiting for response...');
        
        // Simuler un délai d'attente
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('[Test] Application completed (simulated)');
        
        return {
            success: true,
            message: 'Application simulée avec succès'
        };
        
    } catch (error) {
        console.error('[Test] Application error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Fonction principale de test
async function runTest() {
    console.log('[Test] Starting sequential applications test');
    console.log('[Test] Profile:', testProfile.name);
    console.log('[Test] Email:', testProfile.email);
    console.log('[Test] Jobs to apply:', testJobUrls.length);
    
    const results = [];
    
    for (let i = 0; i < testJobUrls.length; i++) {
        const url = testJobUrls[i];
        
        console.log(`\n${'='.repeat(50)}`);
        console.log(`[Test] Starting application ${i + 1}/${testJobUrls.length}`);
        console.log(`${'='.repeat(50)}`);
        
        const result = await sendApplicationMessage(url, i);
        results.push({
            url: url,
            ...result
        });
        
        // Délai entre les candidatures (pour éviter la détection)
        if (i < testJobUrls.length - 1) {
            const delay = 5000 + Math.random() * 5000; // 5-10 secondes
            console.log(`[Test] Waiting ${Math.round(delay / 1000)}s before next application...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    // Afficher le résumé
    console.log(`\n${'='.repeat(50)}`);
    console.log('[Test] Test Summary');
    console.log(`${'='.repeat(50)}`);
    
    results.forEach((result, index) => {
        console.log(`\nApplication ${index + 1}:`);
        console.log(`- URL: ${result.url}`);
        console.log(`- Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
        console.log(`- Message: ${result.message || result.error}`);
    });
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n[Test] Total: ${successCount}/${results.length} successful applications`);
}

// Script pour utilisation dans la console Chrome
const chromeConsoleScript = `
// Copier ce script dans la console Chrome sur une page JobTeaser

// Fonction pour tester l'extension depuis la console
async function testJobTeaserApplication() {
    const testUrls = [
        'https://www.jobteaser.com/fr/job-offers/123456-developpeur-frontend',
        'https://www.jobteaser.com/fr/job-offers/234567-ingenieur-backend',
        'https://www.jobteaser.com/fr/job-offers/345678-data-scientist'
    ];
    
    const profile = {
        name: 'Antoine Lorence',
        email: 'wawawawa1001100110011001@proton.me',
        phone: '+33 6 12 34 56 78'
    };
    
    for (let i = 0; i < testUrls.length; i++) {
        console.log(\`Testing application \${i + 1}/\${testUrls.length}\`);
        
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'apply-to-job',
                data: {
                    url: testUrls[i],
                    profile: profile,
                    cvPath: 'cv/antoine_lorence_cv.pdf'
                }
            });
            
            console.log('Response:', response);
            
            // Attendre entre les applications
            if (i < testUrls.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
            
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    console.log('Test completed!');
}

// Lancer le test
testJobTeaserApplication();
`;

// Si exécuté directement avec Node.js
if (typeof window === 'undefined') {
    console.log('\n[Test] Running in Node.js environment');
    runTest().then(() => {
        console.log('\n[Test] Test completed!');
        console.log('\n[Test] To run in Chrome, copy the following script:');
        console.log('─'.repeat(50));
        console.log(chromeConsoleScript);
        console.log('─'.repeat(50));
    });
} else {
    // Si exécuté dans un navigateur
    console.log('[Test] Running in browser environment');
    window.testJobTeaserApplication = runTest;
    console.log('[Test] Use testJobTeaserApplication() to start the test');
}