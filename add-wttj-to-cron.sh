#!/bin/bash

# Script pour ajouter le scraper WTTJ au cron à 23h30

echo "🔧 Ajout du scraper WTTJ au cron à 23h30..."

# Créer une entrée cron pour WTTJ à 23h30
CRON_ENTRY="30 23 * * * cd /home/ubuntu/officiel/clean && /usr/bin/node launch-scrapers-with-sync.js wttj >> /home/ubuntu/officiel/clean/logs/wttj_cron.log 2>&1"

# Ajouter l'entrée au crontab
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

echo "✅ Scraper WTTJ ajouté au cron à 23h30"
echo "📝 Entrée ajoutée: $CRON_ENTRY"

# Créer le fichier de log s'il n'existe pas
touch /home/ubuntu/officiel/clean/logs/wttj_cron.log
echo "📄 Fichier de log créé: /home/ubuntu/officiel/clean/logs/wttj_cron.log"

echo ""
echo "📋 Vérification du crontab:"
echo "=========================="

# Afficher le crontab actuel
echo "📋 Crontab actuel:"
crontab -l

echo ""
echo "✅ Configuration terminée!"
echo "🚀 Le scraper WTTJ s'exécutera automatiquement à 23h30 chaque jour"
echo "📊 Les logs seront disponibles dans: /home/ubuntu/officiel/clean/logs/wttj_cron.log" 