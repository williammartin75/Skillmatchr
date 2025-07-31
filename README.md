# SkillMatchr - Nous postulons, vous réussissez

## 🎯 Description du projet

SkillMatchr est une plateforme innovante qui révolutionne la recherche d'emploi en automatisant le processus de candidature. Notre mission est simple : **vous téléchargez votre CV, nos experts et notre IA s'occupent du reste**.

## ✨ Fonctionnalités principales

### 🔍 **Analyse de CV et Lettres de Motivation**
- **CV Checker** : Analyse approfondie de votre CV avec scores ATS et suggestions d'amélioration
- **Lettre de Motivation Checker** : Évaluation de la structure, motivation et personnalisation
- Feedback détaillé avec scores par catégorie
- Suggestions d'amélioration personnalisées

### 🤖 **Automatisation des candidatures**
- **Candidatures automatiques** : Notre IA postule automatiquement aux offres pertinentes
- **Candidatures spontanées** : Envoi automatique de candidatures aux entreprises ciblées
- **Rotation des proxies** : Utilisation de proxies pour éviter la détection
- **Rotation des User-Agents** : Changement automatique des navigateurs simulés

### 📊 **Dashboard et suivi**
- **Dashboard personnel** : Suivi de vos candidatures et statistiques
- **Gestion des offres** : Consultation et filtrage des offres d'emploi
- **Historique des candidatures** : Suivi complet de vos démarches

### 🎯 **Matching intelligent**
- **Analyse des compétences** : Évaluation automatique de vos compétences
- **Matching avec les offres** : Correspondance intelligente CV/offres
- **Recommandations personnalisées** : Suggestions d'offres adaptées à votre profil

### 👤 **Gestion de profil**
- **Profil utilisateur** : Gestion complète de vos informations
- **Upload de documents** : CV et lettres de motivation
- **Paramètres personnalisés** : Configuration de vos préférences

## 🚀 Technologies utilisées

- **Frontend** : Next.js 14, React, Tailwind CSS
- **Backend** : Node.js, API Routes
- **Base de données** : PostgreSQL
- **IA/ML** : Analyse de texte, scoring ATS
- **Scraping** : Système de scraping intelligent avec rotation de proxies

## 📁 Structure du projet

```
clean/
├── app/
│   ├── api/                    # API Routes
│   │   ├── cv-upload/         # Analyse de CV
│   │   ├── lettre-upload/     # Analyse de lettres de motivation
│   │   └── matching/          # Matching CV/offres
│   ├── components/            # Composants réutilisables
│   │   └── Navbar.js         # Navigation principale
│   ├── cv-checker/           # Page d'analyse de CV
│   ├── lettre-motivation/    # Page d'analyse de lettres
│   ├── dashboard/            # Dashboard utilisateur
│   ├── jobs/                 # Consultation des offres
│   ├── applications/         # Gestion des candidatures
│   ├── spontaneous/          # Candidatures spontanées
│   ├── skills/               # Gestion des compétences
│   ├── profile/              # Profil utilisateur
│   └── ...                   # Autres pages
├── backend/                  # Scripts backend et scraping
└── lib/                      # Utilitaires et configurations
```

## 🛠️ Installation et démarrage

### Prérequis
- Node.js 18+
- npm ou yarn
- PostgreSQL (pour la production)

### Installation
```bash
# Cloner le projet
git clone [URL_DU_REPO]
cd clean

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

### Accès
- **Frontend** : http://localhost:3000
- **API** : http://localhost:3000/api

## 🎨 Interface utilisateur

### Design moderne et responsive
- Interface utilisateur intuitive et moderne
- Design responsive (mobile, tablette, desktop)
- Thème cohérent avec la marque SkillMatchr
- Navigation fluide et accessible

### Pages principales
1. **Accueil** : Présentation du service et inscription
2. **Dashboard** : Vue d'ensemble de vos candidatures
3. **CV Checker** : Analyse et amélioration de CV
4. **Lettre de Motivation** : Analyse et amélioration de lettres
5. **Offres** : Consultation des offres d'emploi
6. **Candidatures** : Suivi de vos candidatures
7. **Candidatures spontanées** : Envoi automatique
8. **Compétences** : Gestion de vos compétences
9. **Profil** : Gestion de votre compte

## 🔧 Configuration

### Variables d'environnement
```env
# Base de données
DATABASE_URL=postgresql://...

# API Keys (si nécessaire)
API_KEY=...

# Configuration scraping
PROXY_LIST=...
USER_AGENTS=...
```

### Configuration du scraping
- **9 processus de scraping** en parallèle
- **Rotation automatique des proxies**
- **Alternance entre sites cibles**
- **Mode furtif** pour éviter la détection

## 📈 Fonctionnalités avancées

### Système de scoring ATS
- Analyse des mots-clés pertinents
- Évaluation de la structure du CV
- Score de compatibilité avec les ATS
- Suggestions d'optimisation

### Analyse de lettres de motivation
- Vérification de la structure (introduction, développement, conclusion)
- Analyse de la motivation exprimée
- Évaluation de la personnalisation
- Score de lisibilité

### Matching intelligent
- Correspondance CV/offres basée sur les compétences
- Analyse sémantique du contenu
- Score de compatibilité
- Recommandations personnalisées

## 🚀 Déploiement

### Production
```bash
# Build de production
npm run build

# Démarrage en production
npm start
```

### Environnements
- **Développement** : `npm run dev`
- **Production** : `npm run build && npm start`
- **Tests** : `npm test`

## 📞 Support et contact

Pour toute question ou support :
- **Email** : support@skillmatchr.com
- **Documentation** : [docs.skillmatchr.com](https://docs.skillmatchr.com)
- **FAQ** : `/faq` sur le site

## 📄 Licence

Ce projet est propriétaire et confidentiel. Tous droits réservés à SkillMatchr.

---

**SkillMatchr** - Révolutionnez votre recherche d'emploi avec l'IA 🤖✨
