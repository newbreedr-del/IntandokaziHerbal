-- Chat Sessions Table
-- Stores conversation history for both web chat widget and WhatsApp agent.
-- Sessions are linked by phone number so a customer chatting on the website
-- and then messaging on WhatsApp shares the same conversation context.
--
-- Run this once in your Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS chat_sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    TEXT UNIQUE NOT NULL,        -- 'web_<random>' or 'wa_<phone>'
  phone         TEXT,                         -- E.164 format, e.g. 27821234567
  messages      JSONB NOT NULL DEFAULT '[]', -- Array of {role, content, timestamp}
  source        TEXT DEFAULT 'web',          -- 'web' | 'whatsapp'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_phone ON chat_sessions(phone);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated ON chat_sessions(updated_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER trg_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_chat_sessions_updated_at();

-- Clean up old sessions older than 90 days (run via pg_cron or manually)
-- DELETE FROM chat_sessions WHERE updated_at < NOW() - INTERVAL '90 days';
