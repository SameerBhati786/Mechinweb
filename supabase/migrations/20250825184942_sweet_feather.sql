/*
  # Add notifications table for real-time updates

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `title` (text)
      - `message` (text)
      - `type` (text, enum: success, info, warning, error)
      - `read` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `notifications` table
    - Add policy for users to read their own notifications
    - Add policy for users to update their own notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add constraint for notification types
ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('success', 'info', 'warning', 'error'));

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid());

-- Service role can insert notifications
CREATE POLICY "Service role can insert notifications"
  ON notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);