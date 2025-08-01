-- Script SQL pour corriger IMMÉDIATEMENT toutes les dates NULL
-- Exécuter dans PostgreSQL : psql -h localhost -U postgres -d jobs_database < fix-all-dates-immediate.sql

-- 1. Afficher les statistiques avant correction
\echo '📊 AVANT correction:'
SELECT 
  'Total offres: ' || COUNT(*) as stat,
  'Sans date: ' || COUNT(CASE WHEN published_at IS NULL THEN 1 END) as null_dates
FROM jobs;

-- 2. CORRECTION IMMÉDIATE de toutes les dates NULL
UPDATE jobs 
SET 
  published_at = CASE
    -- Priorité 1: utiliser created_at si disponible
    WHEN created_at IS NOT NULL THEN created_at
    -- Priorité 2: utiliser posted_date si disponible  
    WHEN posted_date IS NOT NULL THEN posted_date
    -- Priorité 3: pour les jobs récents (derniers 1000), date d'hier
    WHEN id > (SELECT MAX(id) - 1000 FROM jobs) THEN CURRENT_DATE - INTERVAL '1 day'
    -- Priorité 4: pour les jobs moyennement récents, date de la semaine dernière
    WHEN id > (SELECT MAX(id) - 5000 FROM jobs) THEN CURRENT_DATE - INTERVAL '7 days'
    -- Priorité 5: pour tous les autres, date proportionnelle à leur position
    ELSE CURRENT_DATE - INTERVAL '30 days' + 
         (INTERVAL '29 days' * (id::float / (SELECT MAX(id) FROM jobs)))
  END,
  updated_at = CURRENT_TIMESTAMP
WHERE published_at IS NULL;

-- 3. S'assurer que posted_date et created_at sont aussi remplis
UPDATE jobs 
SET posted_date = published_at
WHERE posted_date IS NULL;

UPDATE jobs 
SET created_at = COALESCE(published_at, CURRENT_TIMESTAMP)
WHERE created_at IS NULL;

-- 4. Créer un trigger pour empêcher les dates NULL à l'avenir
CREATE OR REPLACE FUNCTION ensure_no_null_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Forcer published_at à avoir une valeur
  IF NEW.published_at IS NULL THEN
    NEW.published_at = COALESCE(NEW.created_at, NEW.posted_date, CURRENT_TIMESTAMP);
  END IF;
  
  -- Forcer created_at à avoir une valeur
  IF NEW.created_at IS NULL THEN
    NEW.created_at = COALESCE(NEW.published_at, CURRENT_TIMESTAMP);
  END IF;
  
  -- Forcer posted_date à avoir une valeur
  IF NEW.posted_date IS NULL THEN
    NEW.posted_date = NEW.published_at;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS ensure_dates_trigger ON jobs;
DROP TRIGGER IF EXISTS validate_dates_trigger ON jobs;

-- Créer le nouveau trigger
CREATE TRIGGER ensure_no_null_dates_trigger
BEFORE INSERT OR UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION ensure_no_null_dates();

-- 5. Ajouter une valeur par défaut à published_at
ALTER TABLE jobs 
ALTER COLUMN published_at SET DEFAULT CURRENT_TIMESTAMP;

-- 6. Afficher les statistiques après correction
\echo ''
\echo '✅ APRÈS correction:'
SELECT 
  'Total offres: ' || COUNT(*) as stat,
  'Sans date: ' || COUNT(CASE WHEN published_at IS NULL THEN 1 END) as null_dates
FROM jobs;

-- 7. Afficher quelques exemples de dates corrigées
\echo ''
\echo '📅 Exemples de dates après correction:'
SELECT 
  source,
  LEFT(title, 50) as title,
  TO_CHAR(published_at, 'DD/MM/YYYY') as date_publication
FROM jobs
WHERE source IN ('wttj', 'welcometothejungle')
ORDER BY id DESC
LIMIT 10;

\echo ''
\echo '🎉 Correction terminée! Toutes les offres ont maintenant une date.'