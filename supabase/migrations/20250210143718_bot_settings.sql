
CREATE TABLE IF NOT EXISTS bot_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_token text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bot_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage bot settings"
  ON bot_settings
  FOR ALL
  TO authenticated
  USING (true);
