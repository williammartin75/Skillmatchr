-- Script pour corriger les dates non spécifiées des jobs WTTJ
-- À exécuter dans PostgreSQL sur la base jobs_database

-- 1. Afficher les statistiques avant correction
SELECT 
  COUNT(*) as total_jobs,
  COUNT(CASE WHEN source = 'wttj' THEN 1 END) as wttj_jobs,
  COUNT(CASE WHEN source = 'wttj' AND published_at IS NULL THEN 1 END) as wttj_null_dates,
  COUNT(CASE WHEN source = 'welcometothejungle' THEN 1 END) as welcometothejungle_jobs,
  COUNT(CASE WHEN source = 'welcometothejungle' AND published_at IS NULL THEN 1 END) as welcometothejungle_null_dates
FROM jobs;

-- 2. Mettre à jour les jobs WTTJ sans date de publication
-- Utiliser created_at comme fallback si disponible, sinon la date actuelle
UPDATE jobs 
SET 
  published_at = COALESCE(created_at, CURRENT_TIMESTAMP),
  updated_at = CURRENT_TIMESTAMP
WHERE 
  (source = 'wttj' OR source = 'welcometothejungle') 
  AND published_at IS NULL;

-- 3. Corriger les dates dans le futur (erreur possible)
UPDATE jobs 
SET 
  published_at = CURRENT_TIMESTAMP,
  updated_at = CURRENT_TIMESTAMP
WHERE 
  (source = 'wttj' OR source = 'welcometothejungle')
  AND published_at > CURRENT_TIMESTAMP;

-- 4. Ajouter une valeur par défaut pour published_at
-- (Seulement si la colonne n'a pas déjà de valeur par défaut)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'jobs' 
    AND column_name = 'published_at' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE jobs 
    ALTER COLUMN published_at SET DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- 5. Créer une fonction pour valider les dates lors des insertions/mises à jour
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
  
  -- Si created_at est NULL, utiliser CURRENT_TIMESTAMP
  IF NEW.created_at IS NULL THEN
    NEW.created_at = CURRENT_TIMESTAMP;
  END IF;
  
  -- Mettre à jour updated_at
  NEW.updated_at = CURRENT_TIMESTAMP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Créer un trigger pour appliquer la validation automatiquement
DROP TRIGGER IF EXISTS validate_dates_trigger ON jobs;
CREATE TRIGGER validate_dates_trigger
BEFORE INSERT OR UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION validate_job_dates();

-- 7. Créer un index sur published_at pour améliorer les performances des requêtes par date
CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON jobs(published_at);
CREATE INDEX IF NOT EXISTS idx_jobs_source_published_at ON jobs(source, published_at);

-- 8. Afficher les statistiques après correction
SELECT 
  '✅ Correction terminée' as status,
  COUNT(*) as total_jobs,
  COUNT(CASE WHEN source = 'wttj' THEN 1 END) as wttj_jobs,
  COUNT(CASE WHEN source = 'wttj' AND published_at IS NULL THEN 1 END) as wttj_null_dates_remaining,
  COUNT(CASE WHEN source = 'welcometothejungle' THEN 1 END) as welcometothejungle_jobs,
  COUNT(CASE WHEN source = 'welcometothejungle' AND published_at IS NULL THEN 1 END) as welcometothejungle_null_dates_remaining
FROM jobs;

-- 9. Afficher quelques exemples de jobs WTTJ corrigés
SELECT 
  id,
  title,
  company,
  published_at,
  created_at,
  updated_at
FROM jobs
WHERE (source = 'wttj' OR source = 'welcometothejungle')
ORDER BY updated_at DESC
LIMIT 10;