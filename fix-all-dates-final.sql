-- SCRIPT DÉFINITIF POUR CORRIGER TOUTES LES DATES NULL
-- Exécuter: psql -h localhost -U postgres -d jobs_database -f fix-all-dates-final.sql

\echo '🚀 CORRECTION DÉFINITIVE DE TOUTES LES DATES NULL'
\echo '================================================'
\echo ''

-- 1. Statistiques avant correction
\echo '📊 AVANT correction:'
SELECT 
  'Total jobs' as metric,
  COUNT(*) as value
FROM jobs
UNION ALL
SELECT 
  'Jobs avec published_at NULL',
  COUNT(*) 
FROM jobs 
WHERE published_at IS NULL
UNION ALL
SELECT 
  'Jobs avec created_at NULL',
  COUNT(*) 
FROM jobs 
WHERE created_at IS NULL
UNION ALL
SELECT 
  'Jobs avec posted_date NULL',
  COUNT(*) 
FROM jobs 
WHERE posted_date IS NULL;

-- 2. Afficher quelques exemples de jobs problématiques
\echo ''
\echo '📋 Exemples de jobs avec dates NULL:'
SELECT 
  id,
  source,
  LEFT(title, 50) as title,
  published_at,
  created_at,
  posted_date
FROM jobs
WHERE published_at IS NULL
   OR created_at IS NULL
   OR posted_date IS NULL
LIMIT 10;

-- 3. CORRECTION MASSIVE - Phase 1: Remplir published_at
\echo ''
\echo '🔧 Phase 1: Correction de published_at...'
UPDATE jobs 
SET published_at = CASE
  -- Si on a created_at, l'utiliser
  WHEN created_at IS NOT NULL THEN created_at
  -- Si on a posted_date, l'utiliser
  WHEN posted_date IS NOT NULL THEN posted_date
  -- Si on a updated_at, l'utiliser
  WHEN updated_at IS NOT NULL THEN updated_at
  -- Sinon, utiliser une date basée sur l'ID (plus récent = date plus récente)
  ELSE CURRENT_DATE - INTERVAL '1 day' * (
    1 + FLOOR(
      30.0 * (1 - (id::float / NULLIF((SELECT MAX(id) FROM jobs), 1)))
    )
  )
END
WHERE published_at IS NULL;

-- 4. CORRECTION MASSIVE - Phase 2: Harmoniser toutes les dates
\echo '🔧 Phase 2: Harmonisation de toutes les dates...'

-- Remplir created_at
UPDATE jobs 
SET created_at = COALESCE(created_at, published_at, posted_date, CURRENT_TIMESTAMP)
WHERE created_at IS NULL;

-- Remplir posted_date
UPDATE jobs 
SET posted_date = COALESCE(posted_date, published_at, created_at, CURRENT_TIMESTAMP)
WHERE posted_date IS NULL;

-- Remplir updated_at
UPDATE jobs 
SET updated_at = COALESCE(updated_at, GREATEST(published_at, created_at, posted_date), CURRENT_TIMESTAMP)
WHERE updated_at IS NULL;

-- 5. Corriger les dates dans le futur
\echo '🔧 Phase 3: Correction des dates futures...'
UPDATE jobs 
SET 
  published_at = CASE 
    WHEN published_at > CURRENT_TIMESTAMP THEN CURRENT_TIMESTAMP 
    ELSE published_at 
  END,
  created_at = CASE 
    WHEN created_at > CURRENT_TIMESTAMP THEN CURRENT_TIMESTAMP 
    ELSE created_at 
  END,
  posted_date = CASE 
    WHEN posted_date > CURRENT_TIMESTAMP THEN CURRENT_TIMESTAMP 
    ELSE posted_date 
  END
WHERE published_at > CURRENT_TIMESTAMP 
   OR created_at > CURRENT_TIMESTAMP 
   OR posted_date > CURRENT_TIMESTAMP;

-- 6. Créer une fonction ultra-robuste pour les triggers
\echo ''
\echo '🔨 Création du système de protection permanent...'

CREATE OR REPLACE FUNCTION ensure_all_dates_valid()
RETURNS TRIGGER AS $$
DECLARE
  base_date TIMESTAMP;
BEGIN
  -- Déterminer une date de base valide
  base_date := COALESCE(
    CASE WHEN NEW.published_at IS NOT NULL AND NEW.published_at <= CURRENT_TIMESTAMP THEN NEW.published_at ELSE NULL END,
    CASE WHEN NEW.created_at IS NOT NULL AND NEW.created_at <= CURRENT_TIMESTAMP THEN NEW.created_at ELSE NULL END,
    CASE WHEN NEW.posted_date IS NOT NULL AND NEW.posted_date <= CURRENT_TIMESTAMP THEN NEW.posted_date ELSE NULL END,
    CASE WHEN NEW.updated_at IS NOT NULL AND NEW.updated_at <= CURRENT_TIMESTAMP THEN NEW.updated_at ELSE NULL END,
    CURRENT_TIMESTAMP
  );
  
  -- Appliquer la date de base à tous les champs NULL
  NEW.published_at := COALESCE(NEW.published_at, base_date);
  NEW.created_at := COALESCE(NEW.created_at, base_date);
  NEW.posted_date := COALESCE(NEW.posted_date, base_date);
  NEW.updated_at := COALESCE(NEW.updated_at, CURRENT_TIMESTAMP);
  
  -- S'assurer qu'aucune date n'est dans le futur
  IF NEW.published_at > CURRENT_TIMESTAMP THEN
    NEW.published_at := CURRENT_TIMESTAMP;
  END IF;
  
  IF NEW.created_at > CURRENT_TIMESTAMP THEN
    NEW.created_at := CURRENT_TIMESTAMP;
  END IF;
  
  IF NEW.posted_date > CURRENT_TIMESTAMP THEN
    NEW.posted_date := CURRENT_TIMESTAMP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Supprimer tous les anciens triggers et créer le nouveau
DROP TRIGGER IF EXISTS ensure_dates_trigger ON jobs;
DROP TRIGGER IF EXISTS validate_dates_trigger ON jobs;
DROP TRIGGER IF EXISTS ensure_no_null_dates_trigger ON jobs;
DROP TRIGGER IF EXISTS ensure_valid_dates_trigger ON jobs;
DROP TRIGGER IF EXISTS force_dates_trigger ON jobs;
DROP TRIGGER IF EXISTS force_valid_dates_trigger ON jobs;

CREATE TRIGGER ensure_all_dates_valid_trigger
BEFORE INSERT OR UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION ensure_all_dates_valid();

-- 8. Ajouter des valeurs par défaut
\echo '🔧 Ajout des valeurs par défaut...'
ALTER TABLE jobs ALTER COLUMN published_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE jobs ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE jobs ALTER COLUMN posted_date SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE jobs ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

-- 9. Ajouter des contraintes CHECK pour empêcher les NULL
\echo '🔧 Ajout des contraintes de non-nullité...'
DO $$ 
BEGIN
  -- Essayer d'ajouter des contraintes NOT NULL
  BEGIN
    ALTER TABLE jobs ALTER COLUMN published_at SET NOT NULL;
    RAISE NOTICE 'Contrainte NOT NULL ajoutée sur published_at';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Impossible d\'ajouter NOT NULL sur published_at: %', SQLERRM;
  END;
END $$;

-- 10. Vérification finale
\echo ''
\echo '✅ APRÈS correction:'
SELECT 
  'Total jobs' as metric,
  COUNT(*) as value
FROM jobs
UNION ALL
SELECT 
  'Jobs avec published_at NULL',
  COUNT(*) 
FROM jobs 
WHERE published_at IS NULL
UNION ALL
SELECT 
  'Jobs avec created_at NULL',
  COUNT(*) 
FROM jobs 
WHERE created_at IS NULL
UNION ALL
SELECT 
  'Jobs avec posted_date NULL',
  COUNT(*) 
FROM jobs 
WHERE posted_date IS NULL;

-- 11. Afficher des exemples de dates corrigées
\echo ''
\echo '📅 Exemples de jobs avec dates corrigées:'
SELECT 
  id,
  source,
  LEFT(title, 40) as title,
  TO_CHAR(published_at, 'DD/MM/YYYY') as date_pub,
  TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as date_creation
FROM jobs
ORDER BY id DESC
LIMIT 15;

-- 12. Test du trigger avec une insertion
\echo ''
\echo '🧪 Test du trigger avec une insertion sans dates:'
INSERT INTO jobs (title, company, location, source, original_id)
VALUES ('Test Job Sans Date', 'Test Company', 'Paris', 'test', 'test-' || EXTRACT(EPOCH FROM NOW())::TEXT)
RETURNING id, title, TO_CHAR(published_at, 'DD/MM/YYYY HH24:MI:SS') as published_at;

\echo ''
\echo '🎉 CORRECTION TERMINÉE!'
\echo ''
\echo '📌 Actions suivantes:'
\echo '1. Redémarrez votre serveur Next.js'
\echo '2. Videz le cache du navigateur (Ctrl+F5)'
\echo '3. Toutes les offres auront maintenant une date au format DD/MM/YYYY!'