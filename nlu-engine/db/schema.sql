CREATE TABLE IF NOT EXISTS majors (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  program_type VARCHAR(100),
  tuition_fee NUMERIC(10, 2),
  curriculum_summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS major_descriptions (
  id SERIAL PRIMARY KEY,
  major_id INT UNIQUE NOT NULL REFERENCES majors(id) ON DELETE CASCADE,
  introduction TEXT,
  duration NUMERIC(3, 1),
  orientation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admission_methods (
  id SERIAL PRIMARY KEY,
  method_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admission_scores (
  id SERIAL PRIMARY KEY,
  major_id INT NOT NULL REFERENCES majors(id) ON DELETE CASCADE,
  method_id INT NOT NULL REFERENCES admission_methods(id) ON DELETE CASCADE,
  year INT NOT NULL,
  score NUMERIC(4, 2) NOT NULL,
  subject_groups VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admission_quotas (
  id SERIAL PRIMARY KEY,
  major_id INT NOT NULL REFERENCES majors(id) ON DELETE CASCADE,
  method_id INT NOT NULL REFERENCES admission_methods(id) ON DELETE CASCADE,
  year INT NOT NULL,
  quota INT NOT NULL,
  is_expected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificate_conversion (
  id SERIAL PRIMARY KEY,
  cert_type VARCHAR(100) NOT NULL,
  original_score NUMERIC(6, 2) NOT NULL,
  converted_score NUMERIC(6, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cert_type, original_score)
);

CREATE TABLE IF NOT EXISTS scholarships_policies (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  major_id INT REFERENCES majors(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS candidate_leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  major_code VARCHAR(20) NOT NULL,
  admission_type VARCHAR(50) NOT NULL,
  block VARCHAR(10),
  gpa_score NUMERIC(4, 2),
  ielts_score NUMERIC(3, 1),
  transcript_file TEXT,
  ielts_file TEXT,
  evaluation_result VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chatbot_interactions (
  id SERIAL PRIMARY KEY,
  sender_id VARCHAR(100) NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  intent_name VARCHAR(100),
  response_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_majors_name ON majors(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_admission_scores_major_year ON admission_scores(major_id, year DESC);
CREATE INDEX IF NOT EXISTS idx_admission_quotas_major_year ON admission_quotas(major_id, year DESC);
CREATE INDEX IF NOT EXISTS idx_candidate_leads_phone ON candidate_leads(phone);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_sender ON chatbot_interactions(sender_id);
