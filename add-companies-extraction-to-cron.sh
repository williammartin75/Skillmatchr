#!/bin/bash

# Script pour ajouter l'extraction des entreprises au cron à 7h

echo "🔧 Ajout de l'extraction des entreprises au cron à 7h..."

# Créer une entrée cron pour l'extraction des entreprises à 7h
CRON_ENTRY="0 7 * * * cd /home/ubuntu/officiel/clean && /usr/bin/node extract-companies-from-jobs.js >> /home/ubuntu/officiel/clean/logs/companies-extraction.log 2>&1"

# Ajouter l'entrée au crontab
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

echo "✅ Extraction des entreprises ajoutée au cron à 7h"
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
echo "⏰ L'extraction des entreprises s'exécutera automatiquement à 7h chaque jour" 