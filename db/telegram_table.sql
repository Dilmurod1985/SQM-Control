-- Table mapping app user -> telegram chat id
CREATE TABLE IF NOT EXISTS user_telegram (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  telegram_chat_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_telegram_chat ON user_telegram (telegram_chat_id);
