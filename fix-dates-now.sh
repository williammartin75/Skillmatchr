#!/bin/bash

echo "🔧 Correction immédiate de toutes les dates NULL..."
echo ""

# Option 1: Exécuter le script SQL directement
if command -v psql &> /dev/null; then
    echo "📊 Exécution du script SQL de correction..."
    PGPASSWORD= psql -h localhost -U postgres -d jobs_database < fix-all-dates-immediate.sql
    echo "✅ Script SQL exécuté"
else
    echo "⚠️  psql non trouvé, essai avec Node.js..."
fi

# Option 2: Exécuter le script Node.js
if command -v node &> /dev/null; then
    echo ""
    echo "📊 Exécution du script Node.js de correction..."
    DB_PASSWORD= node fix-all-null-dates.js
    echo "✅ Script Node.js exécuté"
else
    echo "❌ Node.js non trouvé"
fi

echo ""
echo "🎉 Correction terminée!"
echo "📌 Veuillez rafraîchir la page http://localhost:3000/jobs"
echo "   Toutes les offres devraient maintenant avoir une date au format DD/MM/YYYY"