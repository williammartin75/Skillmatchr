# Extension Chrome Jobteaser - Candidatures Automatiques

## Configuration

L'extension Chrome pour Jobteaser est configurée pour postuler automatiquement aux offres d'emploi avec :

### Identifiants de connexion
- Email : `wawawawa1001100110011001@proton.me`
- Mot de passe : `Wawawawa1001100110011001`

### CV utilisé
Le CV d'Antoine Lorence est automatiquement utilisé pour toutes les candidatures :
```
Lorence Antoine
Développeur Full Stack
Email: lorence.antoine@email.com
Téléphone: 0123456789
```

## Fonctionnalités de sécurité

### 1. Utilisation de proxies
L'extension utilise une rotation de proxies HTTP pour éviter la détection :
- 10 proxies européens configurés
- Rotation automatique à chaque connexion
- Configuration via l'API chrome.proxy

### 2. Rotation des User-Agents
- 5 User-Agents différents (Chrome, Firefox, Safari)
- Changement aléatoire pour chaque session
- Interception des requêtes HTTP pour modifier les headers

### 3. Comportement humain simulé
- Délais aléatoires entre les actions (500ms - 3000ms)
- Saisie progressive du texte
- Mouvements de souris naturels

## Installation

1. Ouvrir Chrome et aller dans `chrome://extensions/`
2. Activer le "Mode développeur"
3. Cliquer sur "Charger l'extension non empaquetée"
4. Sélectionner le dossier `extension/`

## Utilisation

### Candidature sur une offre unique
1. Naviguer vers une offre Jobteaser (ex: https://www.jobteaser.com/fr/job-offers/[id])
2. L'extension détecte automatiquement l'offre
3. Cliquer sur l'icône de l'extension
4. Cliquer sur "Postuler automatiquement"

### Candidature sur toutes les offres d'une page
1. Aller sur la page de liste des offres : https://www.jobteaser.com/fr/job-offers
2. Ouvrir la console du navigateur (F12)
3. Exécuter le script de test : `testAllJobsOnPage()`

## Test de l'extension

Pour tester l'extension dans la console :

```javascript
// Test sur une offre unique
(async function() {
    const adapter = new JobteaserAdapter(humanBehavior);
    await adapter.login();
    const jobData = await adapter.detectJob();
    await adapter.applyToJob({ job: jobData });
    console.log('Statistiques:', adapter.applicationStats);
})();
```

## Statistiques de candidature

L'extension maintient des statistiques :
- Nombre de candidatures réussies
- Nombre de candidatures échouées
- Raisons des échecs (URL + message d'erreur)

## Limitations connues

1. **Proxies** : Les proxies Chrome s'appliquent à tout le navigateur, pas seulement à Jobteaser
2. **Upload de fichiers** : L'extension utilise les champs texte pour le CV au lieu d'uploader des fichiers
3. **Captcha** : Si Jobteaser active des captchas, l'extension ne peut pas les résoudre
4. **Limite de taux** : Respecter des délais entre les candidatures pour éviter la détection

## Dépannage

### Erreur de connexion
- Vérifier que les identifiants sont corrects
- Vérifier que le proxy fonctionne
- Essayer de désactiver temporairement le proxy

### Candidature échouée
- Vérifier dans la console les messages d'erreur détaillés
- S'assurer que tous les champs requis sont présents
- Vérifier que la page est complètement chargée

### Proxy non fonctionnel
- L'extension essaiera automatiquement le proxy suivant
- Vérifier la liste des proxies dans `site-adapters.js`

## Résumé des résultats

Après l'exécution, l'extension affiche :
- ✅ Nombre de candidatures réussies
- ❌ Nombre de candidatures échouées
- 📋 Liste détaillée des échecs avec les raisons

## Notes importantes

- L'extension simule un comportement humain avec des délais aléatoires
- Les proxies et User-Agents sont changés régulièrement
- Toujours vérifier les logs dans la console pour le débogage
- Ne pas exécuter trop de candidatures d'un coup pour éviter la détection