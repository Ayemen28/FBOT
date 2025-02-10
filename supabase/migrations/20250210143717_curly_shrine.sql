/*
  # Enhanced User Management Features

  1. New Tables
    - `permission_templates`
      - `id` (uuid, primary key)
      - `name` (text)
      - `permissions` (text[])
      - `created_at` (timestamp)
    
    - `user_activity_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `channel_id` (uuid, foreign key)
      - `action` (text)
      - `details` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Permission Templates Table
CREATE TABLE permission_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  permissions text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE permission_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read permission templates"
  ON permission_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage permission templates"
  ON permission_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM channel_admins ca
      WHERE ca.user_id = auth.uid()
      AND ca.role = 'owner'
    )
  );

-- User Activity Logs Table
CREATE TABLE user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read activity logs"
  ON user_activity_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert activity logs"
  ON user_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);