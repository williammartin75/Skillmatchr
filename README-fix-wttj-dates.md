# Correction des dates non spécifiées WTTJ

## 🔍 Problème identifié

Les offres d'emploi provenant de Welcome to the Jungle (WTTJ) affichaient "Date non spécifiée" sur l'interface web (http://localhost:3000/jobs) en raison de :

1. **Parser de dates incomplet** : La fonction `parseRelativeDate` retournait `null` quand elle ne pouvait pas parser certains formats de dates
2. **Dates NULL dans la base** : Ces valeurs `null` étaient stockées directement dans la base de données
3. **Affichage par défaut** : L'API remplaçait les dates NULL par "Date non spécifiée"

## ✅ Solutions implémentées

### 1. Amélioration du parser de dates dans le scraper WTTJ

**Fichier modifié** : `server/scrapers/wttjScraper.js`

#### Changements apportés :

1. **Parser amélioré** : La fonction `parseRelativeDate` retourne maintenant toujours une date valide
   - Si pas de date fournie → date actuelle
   - Si format non reconnu → date actuelle avec avertissement
   - Support étendu des formats (semaines, mois)

2. **Fonction de validation** : Nouvelle fonction `ensureValidDate` qui :
   - Valide que la date est bien un objet Date valide
   - Corrige les dates futures (erreur de parsing)
   - Utilise toujours un fallback valide

3. **Validation à l'insertion** : Les dates sont validées avant insertion dans :
   - La base WTTJ (`insertJobsToDatabase`)
   - La base unifiée (`syncToUnifiedDatabase`)

### 2. Script SQL de correction des données existantes

**Fichier créé** : `fix-wttj-dates-sql.sql`

Le script SQL effectue :

1. **Correction des dates NULL** : Met à jour toutes les dates NULL avec `created_at` ou la date actuelle
2. **Correction des dates futures** : Remplace les dates dans le futur par la date actuelle
3. **Ajout de valeur par défaut** : `published_at` a maintenant `CURRENT_TIMESTAMP` par défaut
4. **Trigger de validation** : Validation automatique des dates à chaque insertion/mise à jour

### 3. Fichiers d'amélioration générés

**Répertoire** : `wttj-date-improvements/`

- `date-validation-functions.js` : Fonctions réutilisables de validation
- `scraper-patch.js` : Patch à appliquer au scraper
- `migration.sql` : Script SQL de migration
- `README.md` : Documentation détaillée

## 🚀 Instructions d'application

### 1. Appliquer les modifications du scraper

Les modifications ont déjà été appliquées dans `server/scrapers/wttjScraper.js` :
- Fonction `parseRelativeDate` améliorée
- Nouvelle fonction `ensureValidDate`
- Validation dans `insertJobsToDatabase` et `syncToUnifiedDatabase`

### 2. Exécuter le script SQL de correction

```bash
# Se connecter à PostgreSQL et exécuter le script
psql -h localhost -U postgres -d jobs_database < fix-wttj-dates-sql.sql
```

### 3. Vérifier les résultats

Après l'exécution du script SQL :
- Les jobs WTTJ existants auront des dates valides
- Les nouveaux jobs ne pourront plus avoir de dates NULL
- L'interface n'affichera plus "Date non spécifiée"

## 📊 Résultats attendus

### Avant correction
- Jobs WTTJ avec `published_at = NULL`
- Interface affichant "Date non spécifiée"

### Après correction
- Tous les jobs ont une date valide
- Les nouvelles insertions sont automatiquement validées
- Protection contre les dates invalides par trigger SQL

## 🔧 Maintenance future

1. **Monitoring** : Surveiller régulièrement avec :
   ```sql
   SELECT COUNT(*) FROM jobs 
   WHERE source IN ('wttj', 'welcometothejungle') 
   AND published_at IS NULL;
   ```

2. **Logs** : Les avertissements de dates invalides apparaissent dans les logs du scraper

3. **Tests** : Tester régulièrement le scraper WTTJ pour vérifier que les dates sont bien extraites

## 📝 Notes techniques

- La fonction `parseRelativeDate` gère maintenant : minutes, heures, jours, semaines, mois
- Le fallback utilise toujours la date actuelle pour éviter les NULL
- Le trigger SQL assure une protection supplémentaire côté base de données
- Les index sur `published_at` améliorent les performances des requêtes par date