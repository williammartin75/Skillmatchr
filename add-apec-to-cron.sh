#!/bin/bash

# Script pour ajouter le scraper APEC au cron
# Exécution quotidienne à 21h00 (comme mentionné dans start-admin-server.sh)

echo "🔧 Configuration du cron pour le scraper APEC..."

# Chemin vers le script de lancement
SCRIPT_PATH="/home/ubuntu/officiel/clean/launch-scrapers-with-sync.js"
LOG_PATH="/home/ubuntu/officiel/clean/logs/apec_cron.log"

# Vérifier que le script existe
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Erreur: Le script $SCRIPT_PATH n'existe pas"
    exit 1
fi

# Créer le dossier logs s'il n'existe pas
mkdir -p /home/ubuntu/officiel/clean/logs

# Ajouter l'entrée cron pour APEC (exécution quotidienne à 21h00)
(crontab -l 2>/dev/null; echo "0 21 * * * cd /home/ubuntu/officiel/clean && /usr/bin/node launch-scrapers-with-sync.js apec >> $LOG_PATH 2>&1") | crontab -

echo "✅ Entrée cron ajoutée pour APEC:"
echo "   - Exécution: Tous les jours à 21h00"
echo "   - Script: $SCRIPT_PATH"
echo "   - Logs: $LOG_PATH"

# Afficher le cron actuel
echo ""
echo "📋 Configuration cron actuelle:"
crontab -l

echo ""
echo "🎯 Pour tester le scraper APEC manuellement:"
echo "   cd /home/ubuntu/officiel/clean"
echo "   node launch-scrapers-with-sync.js apec" 