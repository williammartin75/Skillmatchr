# Guide de Test - Flux Complet JobTeaser

## Améliorations Intégrées

### 1. ✅ Flux Complet depuis background.js
- Message `apply-to-job` reçu par background.js
- Fonction `applyToJobTeaser` dédiée avec timeout de 30 secondes
- Injection automatique des scripts dans tous les frames
- Création d'onglet si nécessaire

### 2. ✅ Rotation des Proxies
- Liste de 10 proxies européens
- Rotation automatique via `getNextProxy()`
- Configuration du proxy avant chaque connexion/candidature
- Logs : `[JobteaserAdapter] Proxy configuré: XXX.XXX.XXX.XXX:3129`

### 3. ✅ User-Agent Dynamique
- 5 User-Agents différents (Chrome, Firefox, Safari)
- Changement aléatoire pour chaque page
- Modification via l'API webRequest dans background.js
- Logs : `[JobteaserAdapter] Changement User-Agent: Mozilla/5.0...`

### 4. ✅ Skip Login si Connecté
- Vérification via `checkLoginStatus()` avant login
- Si déjà connecté : `[JobteaserAdapter] Déjà connecté - Skip login`
- Économise du temps sur les candidatures multiples

### 5. ✅ Gestion des Iframes/Redirections
- Détection automatique des iframes
- Injection dans tous les frames via `allFrames: true`
- Détection des redirections vers sites entreprise
- Message `injectInAllFrames` vers background.js

### 6. ✅ Logs Clairs et Structurés
Format uniforme : `[Module] Step X: Description`
- `[Background] Starting JobTeaser application process`
- `[JobteaserAdapter] Step 1: Vérification du statut de connexion`
- `[JobteaserAdapter] Step 2: Début de la connexion`
- ... jusqu'à Step 10

### 7. ✅ Timeout de 30 Secondes
- Implémenté dans `applyToJobTeaser` et `applyToJob`
- Promise.race entre application et timeout
- Message d'erreur clair : "Timeout après 30 secondes"

### 8. ✅ Gestion d'Erreurs Propre
- Try/catch à tous les niveaux
- Historique des échecs avec durée et message
- Statistiques complètes (successful/failed/failureReasons)
- Notification automatique via `sendNotification`

## Test du Flux Complet

### Prérequis
1. Chrome avec extension chargée en mode développeur
2. Permissions accordées (proxy, webRequest, etc.)
3. Connexion internet stable

### Étape 1 : Chargement de l'Extension
```bash
1. Ouvrir Chrome
2. Aller dans chrome://extensions/
3. Activer "Mode développeur"
4. "Charger l'extension non empaquetée"
5. Sélectionner le dossier /workspace/extension/
```

### Étape 2 : Test d'une Candidature Unique
```javascript
// Dans la console du background script (Inspecter la vue)
testSingleApplication('https://www.jobteaser.com/fr/job-offers/d4fef48e-e526-47e8-9902-a2b8710b9580-shiseido-emea-alternance-security-awareness-assistant-h-f')
```

### Étape 3 : Test de 3 Candidatures Successives
```javascript
// Dans la console du background script
testThreeJobteaserApplications()
```

## Flux Attendu par Candidature

1. **[Background]** Réception du message `apply-to-job`
2. **[Background]** Création/réutilisation d'un onglet JobTeaser
3. **[Background]** Injection des scripts dans tous les frames
4. **[Content]** Réception de `navigateAndApply`
5. **[JobteaserAdapter]** Configuration proxy + user-agent
6. **[JobteaserAdapter]** Vérification connexion (skip si déjà connecté)
7. **[JobteaserAdapter]** Navigation vers l'offre
8. **[JobteaserAdapter]** Détection et gestion des iframes
9. **[JobteaserAdapter]** Clic sur "Postuler"
10. **[JobteaserAdapter]** Remplissage du formulaire avec CV
11. **[JobteaserAdapter]** Soumission de la candidature
12. **[JobteaserAdapter]** Vérification du succès
13. **[Background]** Ajout à l'historique
14. **[Background]** Notification de résultat

## Résultats Attendus

### Candidature Réussie
```
[Background] Application completed in 15234ms
[JobteaserAdapter] Step 10: Candidature envoyée avec succès!
✅ Candidature réussie
```

### Candidature Échouée
```
[Background] JobTeaser application failed: Timeout après 30 secondes
❌ Candidature échouée
Raison: Timeout ou bouton non trouvé
```

## Vérification des Statistiques
```javascript
// Voir l'historique complet
chrome.storage.sync.get(['applicationHistory'], (result) => {
    console.log(result.applicationHistory);
});
```

## Problèmes Courants et Solutions

### 1. Proxy Non Fonctionnel
- Vérifier la permission "proxy" dans manifest.json
- Essayer sans proxy temporairement
- Vérifier les logs : `[JobteaserAdapter] Erreur configuration proxy`

### 2. User-Agent Non Modifié
- Vérifier permissions "webRequest" et "webRequestBlocking"
- Vérifier que l'URL correspond dans les patterns

### 3. Iframe Non Détecté
- Vérifier que `allFrames: true` est bien défini
- Tester avec `chrome.scripting.executeScript` manuellement

### 4. Timeout Fréquents
- Augmenter le timeout à 45 secondes si nécessaire
- Vérifier la connexion internet
- Réduire les délais aléatoires

## Commandes de Debug

```javascript
// Voir l'état actuel de l'extension
chrome.runtime.sendMessage({action: 'getExtensionState'}, console.log)

// Forcer un changement de proxy
new JobteaserAdapter().setupProxy()

// Tester la détection d'offre
new JobteaserAdapter().detectJob()

// Voir les statistiques
console.log(new JobteaserAdapter().applicationStats)
```