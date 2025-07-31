#!/bin/bash

# Script pour démarrer le serveur d'administration sur le port 3002

echo "🚀 Démarrage du serveur d'administration sur le port 3002..."

# Vérifier si le port 3002 est déjà utilisé
if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Le port 3002 est déjà utilisé. Arrêt du processus existant..."
    pkill -f "next.*3002" || true
    sleep 2
fi

# Démarrer le serveur Next.js sur le port 3002
echo "🌐 Démarrage du serveur Next.js..."
PORT=3002 npm run dev &

# Attendre que le serveur démarre
echo "⏳ Attente du démarrage du serveur..."
sleep 5

# Vérifier si le serveur est démarré
if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Serveur démarré avec succès sur http://localhost:3002"
    echo "🔗 Interface d'administration: http://localhost:3002/admin"
    echo ""
    echo "📋 Scrapers disponibles:"
    echo "   - APEC Cron: http://localhost:3002/admin (bouton APEC)"
    echo "   - JobTeaser Cron: http://localhost:3002/admin (bouton JobTeaser)"
    echo ""
    echo "⏰ Prochaine exécution automatique:"
    echo "   - APEC Cron: 21h00"
    echo "   - JobTeaser Cron: 23h30"
    echo ""
    echo "🛑 Pour arrêter le serveur: Ctrl+C"
else
    echo "❌ Erreur: Le serveur n'a pas pu démarrer sur le port 3002"
    exit 1
fi

# Garder le script en vie
wait 