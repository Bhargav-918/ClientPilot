-- =============================================================================
-- CLIENTPILOT DATABASE SCHEMA (PostgreSQL)
-- Hack With Hyderabad 3.0: AI Agents That Learn Using Hindsight
-- =============================================================================

-- Drop tables if exists (for clean migration)
DROP TABLE IF EXISTS interactions CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TYPE IF EXISTS interaction_type_enum CASCADE;

-- Create interaction type enumeration
CREATE TYPE interaction_type_enum AS ENUM (
    'MEETING',
    'CALL',
    'EMAIL',
    'NOTE',
    'REQUIREMENT',
    'PROPOSAL',
    'COMPLAINT',
    'FOLLOW_UP',
    'OTHER'
);

-- =============================================================================
-- TABLE: clients
-- Stores structured client profiles and primary commercial details.
-- (Note: Unstructured, evolving cognitive insights are managed in Hindsight Memory)
-- =============================================================================
CREATE TABLE clients (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    industry VARCHAR(128) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(64),
    project VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for searching clients by company and name
CREATE INDEX idx_clients_company ON clients(company);
CREATE INDEX idx_clients_name ON clients(name);

-- =============================================================================
-- TABLE: interactions
-- Stores chronological touchpoints between the business and client.
-- Each interaction is ingested by HindsightService to update the client's memory bank.
-- =============================================================================
CREATE TABLE interactions (
    id VARCHAR(64) PRIMARY KEY,
    client_id VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    interaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_interactions_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Indexes for high-frequency queries
CREATE INDEX idx_interactions_client_id ON interactions(client_id);
CREATE INDEX idx_interactions_date ON interactions(interaction_date);
CREATE INDEX idx_interactions_type ON interactions(type);

-- Trigger to automatically update `updated_at` on client table
CREATE OR REPLACE FUNCTION update_client_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_client_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_client_updated_at();

COMMENT ON TABLE clients IS 'Structured client account records';
COMMENT ON TABLE interactions IS 'Log of chronological interactions. Retained as memory vectors in Hindsight AI memory';
