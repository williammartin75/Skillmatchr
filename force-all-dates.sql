-- Script SQL AGRESSIF pour forcer TOUTES les dates à avoir une valeur
-- Exécuter : psql -h localhost -U postgres -d jobs_database < force-all-dates.sql

\echo '🔥 CORRECTION AGRESSIVE DE TOUTES LES DATES NULL'
\echo ''

-- 1. D'abord, voir combien de jobs ont des dates NULL
\echo '📊 État AVANT correction:'
SELECT 
  'Total jobs: ' || COUNT(*),
  'Sans published_at: ' || COUNT(CASE WHEN published_at IS NULL THEN 1 END),
  'Sans created_at: ' || COUNT(CASE WHEN created_at IS NULL THEN 1 END),
  'Sans posted_date: ' || COUNT(CASE WHEN posted_date IS NULL THEN 1 END)
FROM jobs;

\echo ''
\echo '🔧 Correction en cours...'

-- 2. FORCER published_at pour TOUS les jobs
-- Stratégie ultra-agressive avec dates réalistes basées sur l'ID
UPDATE jobs 
SET published_at = CASE
  -- Si on a déjà une date valide, la garder
  WHEN published_at IS NOT NULL AND published_at <= CURRENT_TIMESTAMP THEN published_at
  
  -- Essayer created_at si valide
  WHEN created_at IS NOT NULL AND created_at <= CURRENT_TIMESTAMP THEN created_at
  
  -- Essayer posted_date si valide
  WHEN posted_date IS NOT NULL AND posted_date <= CURRENT_TIMESTAMP THEN posted_date
  
  -- Essayer updated_at si valide
  WHEN updated_at IS NOT NULL AND updated_at <= CURRENT_TIMESTAMP THEN updated_at
  
  -- Pour les IDs récents (derniers 1000), date d'hier
  WHEN id > (SELECT COALESCE(MAX(id), 0) - 1000 FROM jobs) THEN CURRENT_DATE - INTERVAL '1 day'
  
  -- Pour les IDs moyens (derniers 5000), semaine dernière
  WHEN id > (SELECT COALESCE(MAX(id), 0) - 5000 FROM jobs) THEN CURRENT_DATE - INTERVAL '7 days'
  
  -- Pour les IDs plus anciens (derniers 10000), il y a 2 semaines
  WHEN id > (SELECT COALESCE(MAX(id), 0) - 10000 FROM jobs) THEN CURRENT_DATE - INTERVAL '14 days'
  
  -- Pour tous les autres, distribuer sur les 30 derniers jours
  ELSE CURRENT_DATE - (
    INTERVAL '1 day' * (
      30 - FLOOR(
        30.0 * (id::float / NULLIF((SELECT MAX(id) FROM jobs), 0))
      )
    )
  )
END
WHERE published_at IS NULL OR published_at > CURRENT_TIMESTAMP;

-- 3. Forcer created_at à partir de published_at
UPDATE jobs 
SET created_at = COALESCE(created_at, published_at, CURRENT_TIMESTAMP)
WHERE created_at IS NULL;

-- 4. Forcer posted_date à partir de published_at
UPDATE jobs 
SET posted_date = COALESCE(posted_date, published_at, CURRENT_TIMESTAMP)
WHERE posted_date IS NULL;

-- 5. S'assurer qu'aucune date n'est dans le futur
UPDATE jobs 
SET 
  published_at = LEAST(published_at, CURRENT_TIMESTAMP),
  created_at = LEAST(created_at, CURRENT_TIMESTAMP),
  posted_date = LEAST(posted_date, CURRENT_TIMESTAMP)
WHERE 
  published_at > CURRENT_TIMESTAMP 
  OR created_at > CURRENT_TIMESTAMP 
  OR posted_date > CURRENT_TIMESTAMP;

-- 6. Forcer updated_at
UPDATE jobs 
SET updated_at = CURRENT_TIMESTAMP
WHERE updated_at IS NULL;

-- 7. Créer une fonction AGRESSIVE pour les triggers
CREATE OR REPLACE FUNCTION force_valid_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- FORCER published_at quoi qu'il arrive
  IF NEW.published_at IS NULL OR NEW.published_at > CURRENT_TIMESTAMP THEN
    NEW.published_at = COALESCE(
      CASE WHEN NEW.created_at <= CURRENT_TIMESTAMP THEN NEW.created_at ELSE NULL END,
      CASE WHEN NEW.posted_date <= CURRENT_TIMESTAMP THEN NEW.posted_date ELSE NULL END,
      CURRENT_TIMESTAMP
    );
  END IF;
  
  -- FORCER les autres dates
  NEW.created_at = COALESCE(NEW.created_at, NEW.published_at, CURRENT_TIMESTAMP);
  NEW.posted_date = COALESCE(NEW.posted_date, NEW.published_at, CURRENT_TIMESTAMP);
  NEW.updated_at = CURRENT_TIMESTAMP;
  
  -- S'assurer qu'aucune date n'est dans le futur
  NEW.published_at = LEAST(NEW.published_at, CURRENT_TIMESTAMP);
  NEW.created_at = LEAST(NEW.created_at, CURRENT_TIMESTAMP);
  NEW.posted_date = LEAST(NEW.posted_date, CURRENT_TIMESTAMP);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Supprimer TOUS les anciens triggers
DROP TRIGGER IF EXISTS ensure_dates_trigger ON jobs;
DROP TRIGGER IF EXISTS validate_dates_trigger ON jobs;
DROP TRIGGER IF EXISTS ensure_no_null_dates_trigger ON jobs;
DROP TRIGGER IF EXISTS ensure_valid_dates_trigger ON jobs;

-- 9. Créer le nouveau trigger AGRESSIF
CREATE TRIGGER force_dates_trigger
BEFORE INSERT OR UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION force_valid_dates();

-- 10. Ajouter des contraintes par défaut
ALTER TABLE jobs ALTER COLUMN published_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE jobs ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE jobs ALTER COLUMN posted_date SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE jobs ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

-- 11. Vérification finale
\echo ''
\echo '✅ État APRÈS correction:'
SELECT 
  'Total jobs: ' || COUNT(*),
  'Sans published_at: ' || COUNT(CASE WHEN published_at IS NULL THEN 1 END),
  'Sans created_at: ' || COUNT(CASE WHEN created_at IS NULL THEN 1 END),
  'Sans posted_date: ' || COUNT(CASE WHEN posted_date IS NULL THEN 1 END)
FROM jobs;

-- 12. Exemples de dates corrigées
\echo ''
\echo '📅 Exemples de jobs avec leurs dates:'
SELECT 
  id,
  source,
  LEFT(title, 40) as title,
  TO_CHAR(published_at, 'DD/MM/YYYY') as date_publication,
  TO_CHAR(created_at, 'DD/MM/YYYY') as date_creation
FROM jobs
ORDER BY id DESC
LIMIT 20;

-- 13. Vérifier spécifiquement les jobs WTTJ
\echo ''
\echo '📊 Statistiques WTTJ:'
SELECT 
  'Total WTTJ: ' || COUNT(*),
  'WTTJ sans date: ' || COUNT(CASE WHEN published_at IS NULL THEN 1 END)
FROM jobs
WHERE source IN ('wttj', 'welcometothejungle');

\echo ''
\echo '🎉 TERMINÉ! Plus AUCUN job ne devrait avoir de date NULL!'
\echo '📌 Rafraîchissez http://localhost:3000/jobs maintenant!'