
CREATE TABLE IF NOT EXISTS bot_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bot_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage bot messages"
  ON bot_messages
  FOR ALL
  TO authenticated
  USING (true);
