-- Créer la table jobs unifiée
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  original_id VARCHAR(100),
  title VARCHAR(500) NOT NULL,
  company VARCHAR(255),
  location VARCHAR(255),
  description TEXT,
  salary VARCHAR(100),
  contract_type VARCHAR(100),
  source VARCHAR(50) NOT NULL,
  url TEXT,
  source_url TEXT,
  posted_date TIMESTAMP,
  published_at TIMESTAMP,
  remote BOOLEAN DEFAULT false,
  telework BOOLEAN DEFAULT false,
  skills TEXT[],
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(original_id, source)
);

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON jobs(published_at);
CREATE INDEX IF NOT EXISTS idx_jobs_original_id_source ON jobs(original_id, source); 