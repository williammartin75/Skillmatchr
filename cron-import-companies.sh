#!/bin/bash

# Script d'import des entreprises pour cron
# Exécuté tous les jours à 9h

# Définir le répertoire de travail
cd /home/ubuntu/officiel/clean

# Log de début
echo "$(date): 🚀 Début de l'import des entreprises" >> /home/ubuntu/officiel/clean/logs/import-companies.log

# Exécuter l'import
node import-companies-multiprocess.js >> /home/ubuntu/officiel/clean/logs/import-companies.log 2>&1

# Log de fin
echo "$(date): ✅ Import des entreprises terminé" >> /home/ubuntu/officiel/clean/logs/import-companies.log
echo "----------------------------------------" >> /home/ubuntu/officiel/clean/logs/import-companies.log 