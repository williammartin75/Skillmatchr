#!/bin/bash

# Script pour ajouter le scraper Jobteaser au cron à 19h00

echo "🔧 Ajout du scraper Jobteaser au cron à 19h00..."

# Créer une entrée cron pour Jobteaser à 19h00
CRON_ENTRY="0 19 * * * cd /home/ubuntu/officiel/clean && /usr/bin/node server/scrapers/jobteaserCron.js >> /home/ubuntu/officiel/clean/logs/jobteaser_cron.log 2>&1"

# Ajouter l'entrée au crontab
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

echo "✅ Scraper Jobteaser ajouté au cron à 19h00"
echo "📝 Entrée ajoutée: $CRON_ENTRY"

# Créer le dossier de logs s'il n'existe pas
mkdir -p /home/ubuntu/officiel/clean/logs

echo "📁 Dossier de logs créé: /home/ubuntu/officiel/clean/logs"

# Afficher le crontab actuel
echo ""
echo "📋 Crontab actuel:"
crontab -l

echo ""
echo "🎉 Configuration terminée !"
echo "⏰ Le scraper Jobteaser s'exécutera automatiquement à 19h00 chaque jour" 