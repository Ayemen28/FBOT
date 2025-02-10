/*
  # Initial Schema Setup for Channel Management System

  1. New Tables
    - `channels`
      - `id` (uuid, primary key)
      - `telegram_id` (text, unique)
      - `name` (text)
      - `category` (text)
      - `language` (text)
      - `status` (text)
      - `subscribers_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `channel_statistics`
      - `id` (uuid, primary key)
      - `channel_id` (uuid, foreign key)
      - `posts_count` (integer)
      - `views_count` (integer)
      - `engagement_rate` (numeric)
      - `recorded_at` (timestamp)

    - `channel_posts`
      - `id` (uuid, primary key)
      - `channel_id` (uuid, foreign key)
      - `telegram_message_id` (text)
      - `content` (text)
      - `views` (integer)
      - `posted_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Channels Table
CREATE TABLE channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  language text NOT NULL DEFAULT 'ar',
  status text NOT NULL DEFAULT 'active',
  subscribers_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read channels"
  ON channels
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert channels"
  ON channels
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update channels"
  ON channels
  FOR UPDATE
  TO authenticated
  USING (true);

-- Channel Statistics Table
CREATE TABLE channel_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  posts_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE channel_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read channel statistics"
  ON channel_statistics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert channel statistics"
  ON channel_statistics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Channel Posts Table
CREATE TABLE channel_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  telegram_message_id text NOT NULL,
  content text NOT NULL,
  views integer DEFAULT 0,
  posted_at timestamptz DEFAULT now()
);

ALTER TABLE channel_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read channel posts"
  ON channel_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert channel posts"
  ON channel_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();