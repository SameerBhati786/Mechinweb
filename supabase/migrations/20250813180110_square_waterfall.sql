/*
  # Create clients table and related tables

  1. New Tables
    - `clients`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text, optional)
      - `company` (text, optional)
      - `avatar_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `services`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `pricing` (jsonb)
      - `features` (jsonb)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `service_id` (uuid, foreign key)
      - `package_type` (text)
      - `amount_usd` (decimal)
      - `amount_inr` (decimal)
      - `currency` (text)
      - `status` (text)
      - `payment_intent_id` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `invoices`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `client_id` (uuid, foreign key)
      - `invoice_number` (text, unique)
      - `amount_usd` (decimal)
      - `amount_inr` (decimal)
      - `currency` (text)
      - `tax_amount` (decimal)
      - `total_amount` (decimal)
      - `status` (text)
      - `due_date` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for service management
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  company text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  pricing jsonb NOT NULL DEFAULT '{}',
  features jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  package_type text NOT NULL CHECK (package_type IN ('basic', 'standard', 'enterprise')),
  amount_usd decimal(10,2) NOT NULL,
  amount_inr decimal(10,2) NOT NULL,
  currency text NOT NULL CHECK (currency IN ('USD', 'INR')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'completed', 'cancelled')),
  payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number text UNIQUE NOT NULL,
  amount_usd decimal(10,2) NOT NULL,
  amount_inr decimal(10,2) NOT NULL,
  currency text NOT NULL CHECK (currency IN ('USD', 'INR')),
  tax_amount decimal(10,2) NOT NULL DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  due_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policies for clients table
CREATE POLICY "Users can read own profile"
  ON clients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policies for services table (public read)
CREATE POLICY "Anyone can read services"
  ON services
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policies for orders table
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid());

-- Policies for invoices table
CREATE POLICY "Users can read own invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample services
INSERT INTO services (name, description, category, pricing, features) VALUES
('Email Migration & Setup', 'Seamless email migration between platforms with zero downtime', 'email', 
 '{"basic": 299, "standard": 799, "enterprise": 1499}',
 '{"basic": ["Up to 10 accounts", "Email migration", "Basic support", "Data backup"], "standard": ["Up to 50 accounts", "Everything in Basic", "Priority support", "Advanced configuration", "30-day post-migration support"], "enterprise": ["50+ accounts", "Everything in Standard", "Dedicated project manager", "Custom integrations", "90-day support"]}'),

('Domain & Email Security', 'Complete DNS and email authentication setup including SPF, DKIM, and DMARC', 'security',
 '{"basic": 199, "standard": 399, "enterprise": 799}',
 '{"basic": ["SPF, DKIM, DMARC setup", "Basic DNS configuration", "Email support"], "standard": ["Everything in Basic", "Security monitoring", "Monthly reports", "Priority support"], "enterprise": ["Everything in Advanced", "Custom policies", "24/7 monitoring", "Dedicated security expert"]}'),

('SSL & HTTPS Setup', 'Professional SSL certificate installation and automated renewal systems', 'security',
 '{"basic": 149, "standard": 299, "enterprise": 499}',
 '{"basic": ["SSL certificate installation", "HTTPS configuration", "Security validation", "Basic support"], "standard": ["Up to 5 domains", "Everything in Single Domain", "Centralized management", "Priority support"], "enterprise": ["Unlimited subdomains", "Everything in Multi-Domain", "Auto-renewal setup", "Advanced monitoring", "24/7 support"]}'),

('Cloud Suite Management', 'Expert administration of Google Workspace and Microsoft 365 environments', 'cloud',
 '{"basic": 399, "standard": 299, "enterprise": 599}',
 '{"basic": ["Initial setup", "User configuration", "Basic training", "Documentation"], "standard": ["Monthly management", "Everything in Setup", "Ongoing management", "User support", "Monthly optimization", "Security monitoring"], "enterprise": ["Everything in Advanced", "Dedicated manager", "24/7 support", "Custom integrations", "Advanced analytics"]}'),

('Cloud Data Migration', 'Secure migration between Microsoft Teams, SharePoint, OneDrive, and Google Drive', 'migration',
 '{"basic": 499, "standard": 999, "enterprise": 1999}',
 '{"basic": ["Up to 100GB data", "Basic migration", "Data validation", "Email support"], "standard": ["Up to 1TB data", "Everything in Basic", "Priority support", "Advanced validation", "30-day support"], "enterprise": ["1TB+ data", "Everything in Standard", "Dedicated manager", "Custom migration", "90-day support"]}'),

('Hosting & Control Panel Support', 'Professional troubleshooting and optimization for Plesk and cPanel', 'hosting',
 '{"basic": 149, "standard": 199, "enterprise": 399}',
 '{"basic": ["One-time fix", "Basic troubleshooting", "Email support"], "standard": ["Monthly care", "Everything in Basic", "Regular maintenance", "Priority support", "Performance monitoring"], "enterprise": ["Premium 24/7", "Everything in Standard", "Emergency support", "Advanced optimization", "Dedicated support"]}');