
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
