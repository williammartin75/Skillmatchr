# Extension SkillMatchr - JobTeaser Automation

Extension Chrome pour automatiser les candidatures sur JobTeaser et autres sites d'emploi.

## 🚀 Installation

1. **Cloner le repository**
   ```bash
   git clone [votre-repo]
   cd extension
   ```

2. **Préparer le CV**
   - Placer le CV d'Antoine Lorence dans `cv/antoine_lorence_cv.pdf`

3. **Charger l'extension dans Chrome**
   - Ouvrir Chrome et aller à `chrome://extensions/`
   - Activer le "Mode développeur" (en haut à droite)
   - Cliquer sur "Charger l'extension non empaquetée"
   - Sélectionner le dossier `extension`

## 🔧 Configuration

### Identifiants JobTeaser
Les identifiants sont déjà configurés dans l'adapter :
- Email : `wawawawa1001100110011001@proton.me`
- Mot de passe : `Wawawawa1001100110011001`

### Proxy (Optionnel)
Pour configurer des proxies, modifier `CONFIG.PROXIES` dans `background.js` :
```javascript
PROXIES: [
    { host: 'proxy1.example.com', port: 8080, username: 'user', password: 'pass' },
    { host: 'proxy2.example.com', port: 8080, username: 'user', password: 'pass' }
]
```

## 📋 Utilisation

### 1. Test Automatique (Recommandé)

Ouvrir la console Chrome (F12) sur n'importe quelle page et exécuter :

```javascript
// Test avec 3 URLs JobTeaser
async function testJobTeaserApplication() {
    const testUrls = [
        'https://www.jobteaser.com/fr/job-offers/123456',
        'https://www.jobteaser.com/fr/job-offers/234567',
        'https://www.jobteaser.com/fr/job-offers/345678'
    ];
    
    for (let i = 0; i < testUrls.length; i++) {
        console.log(`Application ${i + 1}/${testUrls.length}`);
        
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'apply-to-job',
                data: {
                    url: testUrls[i],
                    profile: {
                        name: 'Antoine Lorence',
                        email: 'wawawawa1001100110011001@proton.me',
                        phone: '+33 6 12 34 56 78'
                    },
                    cvPath: 'cv/antoine_lorence_cv.pdf'
                }
            });
            
            console.log('Response:', response);
            
            // Attendre 5-10 secondes entre les applications
            if (i < testUrls.length - 1) {
                await new Promise(r => setTimeout(r, 5000 + Math.random() * 5000));
            }
            
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

testJobTeaserApplication();
```

### 2. Candidature Manuelle

Pour postuler à une offre spécifique :

```javascript
chrome.runtime.sendMessage({
    action: 'apply-to-job',
    data: {
        url: 'https://www.jobteaser.com/fr/job-offers/YOUR-JOB-ID',
        profile: {
            name: 'Antoine Lorence',
            email: 'wawawawa1001100110011001@proton.me',
            phone: '+33 6 12 34 56 78',
            coverLetter: 'Votre lettre de motivation personnalisée...'
        },
        cvPath: 'cv/antoine_lorence_cv.pdf'
    }
});
```

## 🛠️ Fonctionnalités

### ✅ Implémentées
- ✅ Connexion automatique à JobTeaser
- ✅ Détection automatique des offres d'emploi
- ✅ Remplissage automatique des formulaires
- ✅ Timeout de 30 secondes par candidature
- ✅ Logs détaillés dans la console
- ✅ Gestion des erreurs
- ✅ Skip login si déjà connecté
- ✅ User-Agent rotatif
- ✅ Support multi-sites (LinkedIn, Indeed, APEC, Pôle Emploi, JobTeaser)

### 🚧 À Implémenter
- 🚧 Upload automatique du CV
- 🚧 Injection dans les iframes
- 🚧 Configuration des proxies fonctionnelle
- 🚧 Dashboard de suivi des candidatures

## 📊 Flux de Candidature

1. **Réception du message** `apply-to-job` avec l'URL
2. **Chargement de l'adapter** JobTeaserAdapter
3. **Vérification connexion** Skip si déjà connecté
4. **Navigation** vers la page de l'offre
5. **Clic sur "Postuler"**
6. **Remplissage du formulaire**
7. **Upload du CV** (manuel pour l'instant)
8. **Soumission**
9. **Envoi de la réponse** au dashboard

## 🐛 Debug

### Logs
Tous les logs sont préfixés par `[JobTeaserAdapter]` :
- `Step 1: Detecting job offer...`
- `Step 2: Login process started`
- `Step 3: Clicked Apply`
- `Step 4: Filling application form...`
- `Step 5: Uploading CV...`
- `Step 6: Submitting application...`
- `Step 7: Application completed successfully`

### Erreurs Courantes

1. **"Bouton de candidature non trouvé"**
   - Vérifier que vous êtes sur une page d'offre d'emploi
   - Le bouton peut avoir un autre sélecteur

2. **"Timeout de connexion"**
   - Vérifier les identifiants
   - Vérifier la connexion internet

3. **"Timeout: La candidature a pris plus de 30 secondes"**
   - La page peut nécessiter une interaction manuelle
   - Vérifier les logs pour identifier où ça bloque

## 🔒 Sécurité

- Les identifiants sont stockés localement dans l'extension
- Pas de transmission de données sensibles
- User-Agent rotatif pour éviter la détection
- Délais aléatoires entre les actions

## 📝 Notes

- **CAPTCHA** : Si un CAPTCHA apparaît, l'intervention manuelle est nécessaire
- **Limites** : Respecter les limites de candidatures par jour du site
- **CV** : L'upload automatique du CV nécessite une interaction manuelle pour des raisons de sécurité du navigateur

## 🤝 Contribution

Pour améliorer l'extension :
1. Tester sur de vraies offres JobTeaser
2. Ajouter de nouveaux sélecteurs si nécessaire
3. Implémenter l'upload automatique du CV
4. Ajouter le support d'autres sites

## ⚠️ Disclaimer

Cette extension est à des fins éducatives. Respectez les conditions d'utilisation des sites d'emploi. 