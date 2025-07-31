# 🔧 Guide de Debug - API data.gouv

## 📋 Problèmes identifiés et solutions

### ❌ Problème principal : `q=*` non supporté
**Problème :** L'API data.gouv n'accepte pas le caractère `*` comme terme de recherche.
**Solution :** Remplacer `q=*` par `q=entreprise` ou un autre terme générique valide.

### ✅ Corrections appliquées

1. **Validation des filtres améliorée**
   - Ajout de vérifications pour éviter les valeurs "Tous", "tous", ""
   - Validation des codes de filtre avant envoi

2. **Gestion d'erreurs détaillée**
   - Messages d'erreur spécifiques selon le code HTTP
   - Gestion des erreurs 400, 429, 500

3. **Panel de debug intégré**
   - Affichage en temps réel des requêtes
   - Logs détaillés des réponses
   - Statistiques de debug

## 🧪 Tests de validation

### ✅ Tests réussis
- Recherche simple avec 'entreprise' : Status 200, 10 000 résultats
- Recherche avec nom d'entreprise : Status 200, 2 678 résultats
- Filtres d'activité : Status 200, 1 519 résultats
- Filtres d'effectif : Status 200, 2 216 résultats
- Filtres de CA : Status 200, 10 000 résultats
- Recherche combinée : Status 200, 65 résultats

### ⚠️ Tests avec problèmes
- Localisation (Paris) : Status 400 - Format de commune à vérifier
- Paramètres invalides : Status 400 - Comportement normal

## 🔍 Comment utiliser le debug

### 1. Panel de debug sur la page
- Accédez à `http://localhost:3000/spontaneous`
- Le panel de debug s'affiche en haut de la page
- Vérifiez les URLs générées et les réponses

### 2. Console du navigateur
- Ouvrez les outils de développement (F12)
- Regardez les logs avec les emojis :
  - 🚀 Début de recherche
  - 🔍 URL générée
  - 📡 Réponse de l'API
  - ✅/❌ Succès/Erreur

### 3. Scripts de test
```bash
# Test de l'API
node test-api-debug.js

# Application des corrections
node fix-api-issues.js
```

## 📊 Paramètres valides de l'API

### Codes d'activité (section_activite_principale)
- A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U

### Codes d'effectif (tranche_effectif_salarie)
- NN, 00, 01, 02, 03, 11, 12, 21, 22, 31, 32, 41, 42, 51, 52, 53

### Codes de CA (chiffre_affaires)
- 1, 2, 3, 4, 5, 6, 7

## 🚨 Erreurs courantes et solutions

### Erreur 400 - Paramètres invalides
**Cause :** Valeurs de filtre non reconnues par l'API
**Solution :** Vérifier que les codes correspondent à la liste valide

### Erreur 429 - Trop de requêtes
**Cause :** Limitation de taux de l'API
**Solution :** Attendre quelques secondes avant de relancer

### Aucun résultat retourné
**Cause :** Combinaison de filtres trop restrictive
**Solution :** Essayer avec moins de filtres ou des termes plus généraux

## 🔧 Améliorations futures

1. **Cache des résultats** pour éviter les requêtes répétées
2. **Validation côté client** des paramètres avant envoi
3. **Gestion des timeouts** pour les requêtes lentes
4. **Retry automatique** en cas d'erreur temporaire
5. **Format de localisation** à investiguer pour le paramètre `commune`

## 📝 Notes importantes

- L'API nécessite toujours un paramètre `q` valide
- Les filtres sont optionnels mais doivent être valides si utilisés
- Le CORS est activé (`Access-Control-Allow-Origin: *`)
- Les réponses sont limitées à 20 résultats par page par défaut

## 🎯 Prochaines étapes

1. Tester l'interface utilisateur avec les corrections
2. Vérifier le format du paramètre `commune`
3. Optimiser les performances avec du cache
4. Ajouter des tests automatisés
5. Documenter les cas d'usage spécifiques 