#!/bin/bash

echo "🚀 CORRECTION COMPLÈTE DES DATES NON SPÉCIFIÉES"
echo "=============================================="
echo ""

# 1. Débugger d'abord pour voir l'état actuel
echo "📊 1. Analyse du problème..."
DB_PASSWORD= node debug-date-issue.js
echo ""
echo "Appuyez sur Entrée pour continuer avec la correction..."
read

# 2. Forcer toutes les dates dans la base principale
echo ""
echo "🔧 2. Correction agressive des dates dans jobs_database..."
PGPASSWORD= psql -h localhost -U postgres -d jobs_database < force-all-dates.sql

# 3. Harmoniser toutes les bases de données
echo ""
echo "🔄 3. Harmonisation de toutes les bases de données..."
DB_PASSWORD= node harmonize-all-dates.js

# 4. Exécuter le script SQL simple aussi
echo ""
echo "🔨 4. Double vérification avec le script SQL immédiat..."
PGPASSWORD= psql -h localhost -U postgres -d jobs_database < fix-all-dates-immediate.sql

# 5. Vérification finale
echo ""
echo "✅ 5. Vérification finale..."
PGPASSWORD= psql -h localhost -U postgres -d jobs_database -c "SELECT 'Jobs total: ' || COUNT(*), 'Sans date: ' || COUNT(CASE WHEN published_at IS NULL THEN 1 END) FROM jobs;"

echo ""
echo "🎉 CORRECTION TERMINÉE!"
echo ""
echo "📌 Actions à faire maintenant:"
echo "   1. Arrêtez votre serveur Next.js (Ctrl+C)"
echo "   2. Redémarrez-le (npm run dev ou yarn dev)"
echo "   3. Videz le cache de votre navigateur (Ctrl+F5)"
echo "   4. Rafraîchissez http://localhost:3000/jobs"
echo ""
echo "Si vous voyez encore 'Date non spécifiée', exécutez:"
echo "   DB_PASSWORD= node debug-date-issue.js"
echo "pour identifier le problème restant."