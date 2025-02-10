/*
  # User Management Schema

  1. New Tables
    - `channel_admins`
      - `id` (uuid, primary key)
      - `channel_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `role` (text)
      - `permissions` (text[])
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_interactions`
      - `id` (uuid, primary key)
      - `channel_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `action_type` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Channel Admins Table
CREATE TABLE channel_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'editor')),
  permissions text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

ALTER TABLE channel_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read channel admins"
  ON channel_admins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage channel admins"
  ON channel_admins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM channel_admins ca
      WHERE ca.channel_id = channel_admins.channel_id
      AND ca.user_id = auth.uid()
      AND ca.role IN ('owner', 'admin')
    )
  );

-- User Interactions Table
CREATE TABLE user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read interactions"
  ON user_interactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert interactions"
  ON user_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_channel_admins_updated_at
  BEFORE UPDATE ON channel_admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();