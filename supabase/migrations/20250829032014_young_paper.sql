/*
  # Add Multi-Currency Support

  1. Database Changes
    - Add AUD currency support to existing tables
    - Update currency constraints to include AUD
    - Add exchange rates table for real-time currency conversion
    - Add user preferences table for currency override

  2. New Tables
    - `exchange_rates` - Store real-time exchange rates
    - `user_preferences` - Store user currency preferences

  3. Security
    - Enable RLS on new tables
    - Add appropriate policies for data access
*/

-- Add AUD support to existing currency constraints
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_currency_check;
ALTER TABLE orders ADD CONSTRAINT orders_currency_check CHECK (currency = ANY (ARRAY['USD'::text, 'INR'::text, 'AUD'::text]));

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_currency_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_currency_check CHECK (currency = ANY (ARRAY['USD'::text, 'INR'::text, 'AUD'::text]));

-- Add AUD amount columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'amount_aud'
  ) THEN
    ALTER TABLE orders ADD COLUMN amount_aud numeric(10,2) DEFAULT 0;
  END IF;
END $$;

-- Add AUD amount columns to invoices table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'amount_aud'
  ) THEN
    ALTER TABLE invoices ADD COLUMN amount_aud numeric(10,2) DEFAULT 0;
  END IF;
END $$;

-- Create exchange rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency text NOT NULL DEFAULT 'USD',
  target_currency text NOT NULL,
  rate numeric(10,6) NOT NULL,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Create unique constraint for currency pairs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'exchange_rates' AND constraint_name = 'exchange_rates_currency_pair_key'
  ) THEN
    ALTER TABLE exchange_rates ADD CONSTRAINT exchange_rates_currency_pair_key UNIQUE (base_currency, target_currency);
  END IF;
END $$;

-- Add currency constraint
ALTER TABLE exchange_rates ADD CONSTRAINT exchange_rates_currency_check 
CHECK (target_currency = ANY (ARRAY['INR'::text, 'AUD'::text, 'EUR'::text, 'GBP'::text, 'CAD'::text]));

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  preferred_currency text DEFAULT 'USD',
  auto_detect_currency boolean DEFAULT true,
  country_code text,
  timezone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint
ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Add currency constraint for user preferences
ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_currency_check 
CHECK (preferred_currency = ANY (ARRAY['USD'::text, 'INR'::text, 'AUD'::text, 'EUR'::text, 'GBP'::text, 'CAD'::text]));

-- Create unique constraint for user preferences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'user_preferences' AND constraint_name = 'user_preferences_user_id_key'
  ) THEN
    ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Create policies for exchange_rates
CREATE POLICY "Anyone can read exchange rates"
  ON exchange_rates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can manage exchange rates"
  ON exchange_rates
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for user_preferences
CREATE POLICY "Users can read own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create trigger for user_preferences updated_at
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Insert initial exchange rates (these should be updated regularly via API)
INSERT INTO exchange_rates (base_currency, target_currency, rate) VALUES
  ('USD', 'INR', 83.50),
  ('USD', 'AUD', 1.52),
  ('USD', 'EUR', 0.92),
  ('USD', 'GBP', 0.79),
  ('USD', 'CAD', 1.36)
ON CONFLICT (base_currency, target_currency) DO UPDATE SET
  rate = EXCLUDED.rate,
  last_updated = now();