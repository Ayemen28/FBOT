
-- Create bot settings table
CREATE TABLE IF NOT EXISTS bot_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_token text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bot_settings ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Enable full access to all users"
  ON bot_settings
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);
