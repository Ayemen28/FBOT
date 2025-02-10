
-- Create bot messages table
CREATE TABLE IF NOT EXISTS bot_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bot_messages ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Enable read access for all users"
  ON bot_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON bot_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
