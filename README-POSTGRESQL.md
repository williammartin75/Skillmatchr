# Connexion PostgreSQL - Offres d'emploi

## 🎯 Objectif

Ce projet est maintenant connecté à PostgreSQL pour récupérer les vraies offres d'emploi des scrapers au lieu d'utiliser des données simulées.

## 📊 Configuration

### Variables d'environnement (.env.local)
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=jobscraper
DB_PASSWORD=password
DB_PORT=5432
NEXT_PUBLIC_BASE_URL=http://localhost:3006
```

### Base de données PostgreSQL
- **Base de données**: `jobscraper`
- **Table**: `jobs`
- **Structure**: Voir le schéma ci-dessous

## 🗄️ Schéma de la base de données

```sql
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500),
  company VARCHAR(200),
  location VARCHAR(200),
  description TEXT,
  salary VARCHAR(100),
  contract_type VARCHAR(100),
  source VARCHAR(100),
  url TEXT,
  posted_date TIMESTAMP,
  remote BOOLEAN DEFAULT false,
  skills TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Utilisation

### 1. Démarrage du serveur
```bash
npm run dev -- -p 3006
```

### 2. Test de l'API
L'API `/api/jobs` accepte les paramètres suivants :
- `page`: Numéro de page (défaut: 1)
- `limit`: Nombre d'offres par page (défaut: 6)
- `searchQuery`: Recherche textuelle
- `location`: Localisation
- `radius`: Rayon de recherche (km)
- `contractType`: Type de contrat
- `minSalary`: Salaire minimum
- `skills`: Compétences requises
- `remoteOnly`: Télétravail uniquement (true/false)
- `newJobsOnly`: Nouvelles offres uniquement (true/false)
- `source`: Source de l'offre
- `hasCV`: Matching CV activé (true/false)

### 3. Exemples de requêtes
```bash
# Toutes les offres
curl "http://localhost:3006/api/jobs?page=1&limit=10"

# Recherche par mot-clé
curl "http://localhost:3006/api/jobs?searchQuery=Python&page=1&limit=5"

# Filtrage par localisation
curl "http://localhost:3006/api/jobs?location=Paris&page=1&limit=5"

# Télétravail uniquement
curl "http://localhost:3006/api/jobs?remoteOnly=true&page=1&limit=5"

# Matching CV activé
curl "http://localhost:3006/api/jobs?hasCV=true&page=1&limit=5"
```

## 📝 Scripts disponibles

### 1. Génération de données de test réalistes
```bash
node generate-realistic-test-data.js
```
Génère 12 offres d'emploi réalistes pour tester l'API.

### 2. Import des vraies données des scrapers
```bash
node import-scraper-data.js
```
Importe automatiquement les données des scrapers depuis les fichiers JSON.

**Dossiers recherchés**:
- `scraper_data/` - Données des scrapers
- `backend/` - Données du backend

**Formats supportés**:
- Array direct: `[{job1}, {job2}, ...]`
- Objet avec `jobs`: `{jobs: [{job1}, {job2}, ...]}`
- Objet avec `data`: `{data: [{job1}, {job2}, ...]}`

### 3. Cron pour import automatique
Pour automatiser l'import après les scrapers (23h30), ajoutez au crontab :
```bash
30 23 * * * cd /home/ubuntu/officiel/clean && node import-scraper-data.js >> /var/log/scraper-import.log 2>&1
```

## 🔧 Maintenance

### Vérifier la connexion PostgreSQL
```bash
sudo -u postgres psql -d jobscraper -c "SELECT COUNT(*) FROM jobs;"
```

### Vider la base de données
```bash
sudo -u postgres psql -d jobscraper -c "DELETE FROM jobs;"
```

### Sauvegarder la base de données
```bash
sudo -u postgres pg_dump jobscraper > backup_jobscraper_$(date +%Y%m%d).sql
```

## 🎯 Avantages de PostgreSQL

1. **Performance**: Requêtes optimisées avec index
2. **Scalabilité**: Gestion de grandes quantités de données
3. **Filtrage avancé**: Recherche textuelle, géolocalisation
4. **Pagination**: Gestion efficace des grandes listes
5. **Intégrité**: Contraintes et validation des données
6. **Backup**: Sauvegarde et restauration faciles

## 🔄 Workflow complet

1. **Scrapers** (23h30) → Fichiers JSON
2. **Import script** → PostgreSQL
3. **API Next.js** → Frontend
4. **Utilisateur** → Recherche et filtrage en temps réel

## 📈 Statistiques

L'API fournit des statistiques en temps réel :
- Nombre total d'offres
- Répartition par source
- Offres en télétravail
- Matching CV avec pourcentages

## 🐛 Dépannage

### Erreur de connexion PostgreSQL
```bash
# Vérifier le statut
sudo systemctl status postgresql

# Redémarrer si nécessaire
sudo systemctl restart postgresql
```

### Erreur d'authentification
```bash
# Réinitialiser le mot de passe
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password';"
```

### Erreur de base de données
```bash
# Recréer la base
sudo -u postgres dropdb jobscraper
sudo -u postgres createdb jobscraper
sudo -u postgres psql -d jobscraper -c "CREATE TABLE jobs (...);"
```

## ✅ Statut actuel

- ✅ Connexion PostgreSQL configurée
- ✅ API `/api/jobs` connectée à PostgreSQL
- ✅ Filtrage et recherche fonctionnels
- ✅ Matching CV activé
- ✅ Données de test réalistes
- ✅ Script d'import des scrapers prêt
- ⏳ En attente des vraies données des scrapers

L'application est maintenant prête à recevoir les vraies données des scrapers ! 🎉 