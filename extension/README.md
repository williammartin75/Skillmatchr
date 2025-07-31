# Extension Chrome SkillMatchr

Extension Chrome pour postuler automatiquement sur les sites d'emploi avec vos identifiants, CV et lettre de motivation.

## 🚀 Fonctionnalités

- **Détection automatique** des offres d'emploi sur les sites supportés
- **Candidature en un clic** avec vos profils préconfigurés
- **Synchronisation** avec votre compte SkillMatchr
- **Support multi-sites** : APEC, Pôle Emploi, Indeed, LinkedIn, etc.
- **Interface intuitive** avec bouton flottant et notifications

## 📋 Sites supportés

- ✅ APEC (apec.fr)
- ✅ Pôle Emploi (pole-emploi.fr)
- ✅ Indeed (indeed.fr)
- ✅ LinkedIn (linkedin.com)
- ✅ Welcome to the Jungle (welcometothejungle.com)
- ✅ RegionsJob (regionsjob.com)
- ✅ Cadremploi (cadremploi.fr)
- ✅ Choose Your Boss (chooseyourboss.com)

## 🔧 Installation

### Méthode 1 : Installation depuis la page profil SkillMatchr

1. Connectez-vous à votre compte SkillMatchr
2. Allez sur votre page profil
3. Dans la section "Extension Chrome SkillMatchr", cliquez sur "Construire"
4. Une fois construite, cliquez sur "Télécharger"
5. Suivez les instructions d'installation ci-dessous

### Méthode 2 : Installation manuelle

1. Téléchargez le fichier `skillmatchr-extension.zip`
2. Décompressez le fichier dans un dossier de votre choix
3. Ouvrez Chrome et allez dans `chrome://extensions/`
4. Activez le **"Mode développeur"** (toggle en haut à droite)
5. Cliquez sur **"Charger l'extension non empaquetée"**
6. Sélectionnez le dossier de l'extension décompressée
7. L'extension apparaîtra dans votre barre d'outils

## ⚙️ Configuration

### Première utilisation

1. Cliquez sur l'icône de l'extension dans la barre d'outils
2. Configurez votre URL API SkillMatchr (par défaut : `http://localhost:3001`)
3. Entrez votre ID utilisateur et votre clé API
4. Sélectionnez un profil de candidature
5. Cliquez sur "Sauvegarder"

### Récupération de vos identifiants

- **ID Utilisateur** : Disponible dans votre profil SkillMatchr
- **Clé API** : Générée automatiquement lors de votre inscription

## 🎯 Utilisation

### Détection d'offre

1. Naviguez vers une page d'offre d'emploi sur un site supporté
2. L'extension détecte automatiquement l'offre
3. Un bouton flottant 🎯 apparaît en bas à droite
4. Cliquez sur le bouton pour détecter l'offre

### Candidature automatique

1. Ouvrez l'extension (icône dans la barre d'outils)
2. Vérifiez que l'offre est bien détectée
3. Sélectionnez votre profil de candidature
4. Cliquez sur "Postuler automatiquement"
5. L'extension remplit automatiquement le formulaire

### Sauvegarde d'offre

1. Sur une page d'offre détectée
2. Cliquez sur "Sauvegarder l'offre" dans l'extension
3. L'offre sera ajoutée à votre liste de favoris

## 🔧 Développement

### Structure du projet

```
extension/
├── manifest.json          # Configuration de l'extension
├── popup.html            # Interface de l'extension
├── popup.css             # Styles de l'interface
├── popup.js              # Logique de l'interface
├── content.js            # Script injecté dans les pages
├── content.css           # Styles du content script
├── background.js         # Service worker
├── build-extension.js    # Script de construction
├── icons/                # Icônes de l'extension
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # Ce fichier
```

### Construction de l'extension

```bash
# Installer les dépendances
npm install archiver

# Construire l'extension
node extension/build-extension.js
```

### API endpoints utilisés

- `GET /api/extension/build` - Vérifier le statut de l'extension
- `POST /api/extension/build` - Construire l'extension
- `GET /api/user/profiles` - Récupérer les profils utilisateur
- `POST /api/applications/auto-apply` - Envoyer une candidature
- `POST /api/jobs/save` - Sauvegarder une offre

## 🛠️ Dépannage

### L'extension ne se charge pas

1. Vérifiez que le mode développeur est activé
2. Rechargez l'extension dans `chrome://extensions/`
3. Vérifiez la console pour les erreurs

### L'offre n'est pas détectée

1. Vérifiez que le site est supporté
2. Attendez que la page soit complètement chargée
3. Rechargez la page et réessayez

### Erreur de candidature

1. Vérifiez votre configuration (ID utilisateur, clé API)
2. Assurez-vous qu'un profil est sélectionné
3. Vérifiez votre connexion internet

### Problème de synchronisation

1. Vérifiez l'URL de l'API dans la configuration
2. Assurez-vous que le serveur SkillMatchr est accessible
3. Vérifiez vos identifiants

## 🔒 Sécurité

- L'extension ne stocke que vos identifiants de configuration
- Aucune donnée personnelle n'est envoyée sans votre consentement
- Les communications avec l'API sont sécurisées (HTTPS)
- L'extension respecte les politiques de confidentialité des sites

## 📞 Support

Pour toute question ou problème :

1. Consultez la section dépannage ci-dessus
2. Vérifiez les logs dans la console de développement
3. Contactez le support SkillMatchr via votre dashboard

## 📝 Licence

Cette extension est développée pour SkillMatchr et est destinée à un usage personnel uniquement.

## 🔄 Mises à jour

L'extension se met à jour automatiquement lors de la construction depuis votre profil SkillMatchr. Pour les mises à jour manuelles :

1. Téléchargez la nouvelle version
2. Remplacez l'ancienne extension dans Chrome
3. Rechargez l'extension

---

**Version** : 1.0.0  
**Dernière mise à jour** : $(date)  
**Compatibilité** : Chrome 88+ 