#!/bin/bash

echo "🚀 SOLUTION DÉFINITIVE POUR LES DATES NON SPÉCIFIÉES"
echo "===================================================="
echo ""

# 1. Exécuter le script SQL de correction
echo "📊 Étape 1: Correction de toutes les dates NULL dans la base de données..."
PGPASSWORD= psql -h localhost -U postgres -d jobs_database -f fix-all-dates-final.sql

# 2. Vérifier le résultat
echo ""
echo "📊 Étape 2: Vérification des corrections..."
PGPASSWORD= psql -h localhost -U postgres -d jobs_database -t -c "
SELECT 'Jobs avec dates NULL: ' || COUNT(*) 
FROM jobs 
WHERE published_at IS NULL;
"

# 3. Forcer une mise à jour de toutes les dates même si elles ne sont pas NULL
echo ""
echo "🔧 Étape 3: Harmonisation forcée de TOUTES les dates..."
PGPASSWORD= psql -h localhost -U postgres -d jobs_database -c "
-- S'assurer que TOUTES les colonnes de dates ont une valeur
UPDATE jobs 
SET 
  published_at = COALESCE(published_at, created_at, posted_date, updated_at, CURRENT_TIMESTAMP),
  created_at = COALESCE(created_at, published_at, posted_date, updated_at, CURRENT_TIMESTAMP),
  posted_date = COALESCE(posted_date, published_at, created_at, updated_at, CURRENT_TIMESTAMP),
  updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP);
"

# 4. Tester avec quelques exemples
echo ""
echo "📅 Étape 4: Exemples de dates après correction:"
PGPASSWORD= psql -h localhost -U postgres -d jobs_database -c "
SELECT 
  id,
  source,
  LEFT(title, 40) as title,
  TO_CHAR(published_at, 'DD/MM/YYYY') as date_formatee
FROM jobs
ORDER BY RANDOM()
LIMIT 10;
"

# 5. Instructions finales
echo ""
echo "✅ CORRECTION TERMINÉE!"
echo ""
echo "🔥 ACTIONS CRITIQUES À FAIRE MAINTENANT:"
echo ""
echo "1. ARRÊTEZ votre serveur Next.js (Ctrl+C)"
echo ""
echo "2. VIDEZ LE CACHE:"
echo "   - Navigateur: Ctrl+Shift+Delete → Cocher 'Images et fichiers en cache' → Effacer"
echo "   - OU plus simple: Ouvrez une fenêtre de navigation privée"
echo ""
echo "3. REDÉMARREZ le serveur Next.js:"
echo "   npm run dev"
echo "   # ou"
echo "   yarn dev"
echo ""
echo "4. RECHARGEZ la page http://localhost:3000/jobs"
echo ""
echo "Si vous voyez ENCORE 'Date non spécifiée':"
echo "- Utilisez une fenêtre de navigation privée"
echo "- Essayez un autre navigateur"
echo "- Exécutez: node test-api-dates.js"
echo ""