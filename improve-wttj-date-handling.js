/**
 * Script pour améliorer la gestion des dates dans le scraper WTTJ
 * - Met à jour le code du scraper pour ne jamais retourner de dates NULL
 * - Ajoute une validation des dates avant insertion
 * - Améliore la synchronisation avec la base unifiée
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Amélioration de la gestion des dates WTTJ...\n');

// 1. Créer une fonction de validation des dates améliorée
const improvedDateHandling = `
// Fonction améliorée pour valider et corriger les dates
function ensureValidDate(date, fallbackDate = new Date()) {
  if (!date) return fallbackDate;
  
  const parsedDate = date instanceof Date ? date : new Date(date);
  
  // Vérifier si la date est valide
  if (isNaN(parsedDate.getTime())) {
    console.log(\`⚠️ Date invalide détectée: \${date}, utilisation du fallback\`);
    return fallbackDate;
  }
  
  // Vérifier si la date est dans le futur (probablement une erreur)
  const now = new Date();
  if (parsedDate > now) {
    console.log(\`⚠️ Date future détectée: \${parsedDate.toISOString()}, utilisation de la date actuelle\`);
    return now;
  }
  
  // Vérifier si la date est trop ancienne (plus de 1 an)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  if (parsedDate < oneYearAgo) {
    console.log(\`⚠️ Date trop ancienne détectée: \${parsedDate.toISOString()}, possiblement incorrecte\`);
  }
  
  return parsedDate;
}
`;

// 2. Créer une fonction de transformation des dates relatives améliorée
const improvedRelativeDateParser = `
// Fonction améliorée pour parser les dates relatives avec plus de patterns
function parseRelativeDateExtended(dateText) {
  const now = new Date();
  
  if (!dateText) {
    console.log('⚠️ Pas de date fournie, utilisation de la date actuelle');
    return now;
  }
  
  const text = dateText.toLowerCase().trim();
  
  // Cas spéciaux
  const specialCases = {
    "aujourd'hui": () => now,
    "today": () => now,
    "hier": () => { const d = new Date(now); d.setDate(d.getDate() - 1); return d; },
    "yesterday": () => { const d = new Date(now); d.setDate(d.getDate() - 1); return d; },
    "avant-hier": () => { const d = new Date(now); d.setDate(d.getDate() - 2); return d; },
    "cette semaine": () => { const d = new Date(now); d.setDate(d.getDate() - 3); return d; },
    "ce mois-ci": () => { const d = new Date(now); d.setDate(d.getDate() - 15); return d; }
  };
  
  for (const [key, getValue] of Object.entries(specialCases)) {
    if (text.includes(key)) {
      return getValue();
    }
  }
  
  // Patterns pour les dates relatives
  const patterns = [
    { regex: /il y a (\\d+) minute?s?/, unit: 'minutes' },
    { regex: /il y a (\\d+) heure?s?/, unit: 'hours' },
    { regex: /il y a (\\d+) jour?s?/, unit: 'days' },
    { regex: /il y a (\\d+) semaine?s?/, unit: 'weeks' },
    { regex: /il y a (\\d+) mois/, unit: 'months' },
    { regex: /(\\d+) minute?s? ago/, unit: 'minutes' },
    { regex: /(\\d+) hour?s? ago/, unit: 'hours' },
    { regex: /(\\d+) day?s? ago/, unit: 'days' },
    { regex: /(\\d+) week?s? ago/, unit: 'weeks' },
    { regex: /(\\d+) month?s? ago/, unit: 'months' }
  ];
  
  for (const { regex, unit } of patterns) {
    const match = text.match(regex);
    if (match) {
      const amount = parseInt(match[1]);
      const date = new Date(now);
      
      switch (unit) {
        case 'minutes':
          date.setMinutes(date.getMinutes() - amount);
          break;
        case 'hours':
          date.setHours(date.getHours() - amount);
          break;
        case 'days':
          date.setDate(date.getDate() - amount);
          break;
        case 'weeks':
          date.setDate(date.getDate() - (amount * 7));
          break;
        case 'months':
          date.setMonth(date.getMonth() - amount);
          break;
      }
      
      return date;
    }
  }
  
  // Essayer de parser différents formats de dates
  const dateFormats = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY
    /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
    /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY
  ];
  
  for (const format of dateFormats) {
    const match = text.match(format);
    if (match) {
      if (format.source.includes('d{4})-')) {
        // Format YYYY-MM-DD
        return new Date(match[1], match[2] - 1, match[3]);
      } else {
        // Format DD/MM/YYYY ou DD-MM-YYYY
        return new Date(match[3], match[2] - 1, match[1]);
      }
    }
  }
  
  // Si rien ne marche, retourner la date actuelle
  console.log(\`⚠️ Impossible de parser la date: "\${dateText}", utilisation de la date actuelle\`);
  return now;
}
`;

// 3. Créer un patch pour le scraper WTTJ
const scraperPatch = `
// Patch pour améliorer la gestion des dates dans wttjScraper.js

// Remplacer dans saveToDatabase:
// const publishedAt = this.parseRelativeDate(job.published_date);
// Par:
const rawDate = this.parseRelativeDate(job.published_date);
const publishedAt = ensureValidDate(rawDate, new Date());

// Ajouter la validation avant l'insertion:
if (!publishedAt || isNaN(publishedAt.getTime())) {
  console.error('❌ Date invalide pour le job:', job.title);
  publishedAt = new Date(); // Utiliser la date actuelle comme fallback
}
`;

// 4. Créer un script de migration des données existantes
const migrationScript = `
-- Script SQL pour corriger les dates NULL dans la base unifiée
-- À exécuter dans PostgreSQL

-- 1. Mettre à jour les jobs WTTJ sans date de publication
UPDATE jobs 
SET published_at = COALESCE(created_at, CURRENT_TIMESTAMP),
    updated_at = CURRENT_TIMESTAMP
WHERE source = 'wttj' AND published_at IS NULL;

-- 2. Ajouter une contrainte pour éviter les dates NULL à l'avenir
ALTER TABLE jobs 
ALTER COLUMN published_at SET DEFAULT CURRENT_TIMESTAMP;

-- 3. Créer une fonction pour valider les dates lors des insertions
CREATE OR REPLACE FUNCTION validate_job_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Si published_at est NULL, utiliser created_at ou CURRENT_TIMESTAMP
  IF NEW.published_at IS NULL THEN
    NEW.published_at = COALESCE(NEW.created_at, CURRENT_TIMESTAMP);
  END IF;
  
  -- Si la date est dans le futur, utiliser CURRENT_TIMESTAMP
  IF NEW.published_at > CURRENT_TIMESTAMP THEN
    NEW.published_at = CURRENT_TIMESTAMP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer un trigger pour appliquer la validation
DROP TRIGGER IF EXISTS validate_dates_trigger ON jobs;
CREATE TRIGGER validate_dates_trigger
BEFORE INSERT OR UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION validate_job_dates();
`;

// 5. Sauvegarder les améliorations
const outputDir = path.join(__dirname, 'wttj-date-improvements');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.writeFileSync(
  path.join(outputDir, 'date-validation-functions.js'),
  improvedDateHandling + '\n\n' + improvedRelativeDateParser
);

fs.writeFileSync(
  path.join(outputDir, 'scraper-patch.js'),
  scraperPatch
);

fs.writeFileSync(
  path.join(outputDir, 'migration.sql'),
  migrationScript
);

// 6. Créer un README avec les instructions
const readme = `# Amélioration de la gestion des dates WTTJ

## Problème identifié
Les dates des offres WTTJ apparaissent comme "Date non spécifiée" car :
1. La fonction parseRelativeDate retourne null quand elle ne peut pas parser la date
2. Les dates NULL sont stockées dans la base de données
3. L'interface affiche "Date non spécifiée" pour les valeurs NULL

## Solutions implémentées

### 1. Amélioration du parser de dates (date-validation-functions.js)
- Ne retourne jamais NULL, utilise la date actuelle comme fallback
- Valide les dates avant insertion
- Gère plus de formats et patterns

### 2. Patch du scraper (scraper-patch.js)
- Ajoute la validation des dates avant insertion
- Utilise ensureValidDate pour garantir des dates valides

### 3. Migration de la base de données (migration.sql)
- Met à jour les dates NULL existantes
- Ajoute une valeur par défaut pour published_at
- Crée un trigger pour valider automatiquement les dates

## Instructions d'application

1. **Mettre à jour le scraper WTTJ** :
   - Appliquer les modifications du fichier scraper-patch.js dans server/scrapers/wttjScraper.js
   - Ajouter les fonctions de date-validation-functions.js

2. **Exécuter la migration SQL** :
   \`\`\`bash
   psql -h localhost -U postgres -d jobs_database < migration.sql
   \`\`\`

3. **Relancer le scraper WTTJ** pour les nouveaux jobs

## Résultat attendu
- Plus aucune date "Non spécifiée" pour les nouveaux jobs
- Les dates existantes sont corrigées
- Protection contre les dates invalides à l'avenir
`;

fs.writeFileSync(
  path.join(outputDir, 'README.md'),
  readme
);

console.log('✅ Fichiers d\'amélioration créés dans:', outputDir);
console.log('\n📁 Fichiers générés:');
console.log('   - date-validation-functions.js : Fonctions de validation améliorées');
console.log('   - scraper-patch.js : Modifications à appliquer au scraper');
console.log('   - migration.sql : Script SQL pour corriger les données existantes');
console.log('   - README.md : Instructions détaillées');

console.log('\n🚀 Prochaines étapes:');
console.log('   1. Appliquer le patch au scraper WTTJ');
console.log('   2. Exécuter le script SQL de migration');
console.log('   3. Relancer le scraper pour vérifier les améliorations');