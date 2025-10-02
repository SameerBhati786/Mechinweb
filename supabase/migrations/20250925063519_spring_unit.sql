/*
  # Fix Service Purchase Flow Issues

  1. Data Validation
    - Ensure all services have proper UUID format
    - Validate pricing and features data structure
    - Add missing service records if needed

  2. Indexes
    - Add performance indexes for service lookups
    - Optimize order and invoice queries

  3. Functions
    - Add helper functions for service resolution
    - Improve error handling in purchase flow

  4. Security
    - Ensure RLS policies are working correctly
    - Add audit logging for purchase attempts
*/

-- Ensure all services have proper data structure
UPDATE services 
SET 
  pricing = COALESCE(pricing, '{}'::jsonb),
  features = COALESCE(features, '{}'::jsonb)
WHERE pricing IS NULL OR features IS NULL;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_services_name_search ON services USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_orders_client_service ON orders(client_id, service_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_client_status ON invoices(client_id, status);

-- Add function to resolve service by name pattern
CREATE OR REPLACE FUNCTION resolve_service_by_name(service_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  service_id uuid;
BEGIN
  -- Try exact name match first
  SELECT id INTO service_id
  FROM services
  WHERE LOWER(name) = LOWER(service_name)
  LIMIT 1;
  
  IF service_id IS NOT NULL THEN
    RETURN service_id;
  END IF;
  
  -- Try pattern matching for common service names
  SELECT id INTO service_id
  FROM services
  WHERE 
    (service_name = 'email-migration' AND LOWER(name) LIKE '%email%migration%') OR
    (service_name = 'email-deliverability' AND LOWER(name) LIKE '%email%deliver%') OR
    (service_name = 'ssl-setup' AND LOWER(name) LIKE '%ssl%') OR
    (service_name = 'cloud-management' AND LOWER(name) LIKE '%cloud%manage%') OR
    (service_name = 'data-migration' AND LOWER(name) LIKE '%data%migration%') OR
    (service_name = 'hosting-support' AND LOWER(name) LIKE '%hosting%') OR
    (service_name = 'acronis-setup' AND LOWER(name) LIKE '%acronis%') OR
    (service_name = 'per-incident-support' AND LOWER(name) LIKE '%incident%')
  LIMIT 1;
  
  RETURN service_id;
END;
$$;

-- Add function to validate order data before creation
CREATE OR REPLACE FUNCTION validate_order_data()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Ensure service exists
  IF NOT EXISTS (SELECT 1 FROM services WHERE id = NEW.service_id) THEN
    RAISE EXCEPTION 'Service with ID % does not exist', NEW.service_id;
  END IF;
  
  -- Ensure client exists
  IF NOT EXISTS (SELECT 1 FROM clients WHERE id = NEW.client_id) THEN
    RAISE EXCEPTION 'Client with ID % does not exist', NEW.client_id;
  END IF;
  
  -- Validate package type
  IF NEW.package_type NOT IN ('basic', 'standard', 'enterprise') THEN
    RAISE EXCEPTION 'Invalid package type: %', NEW.package_type;
  END IF;
  
  -- Validate amounts
  IF NEW.amount_usd <= 0 OR NEW.amount_inr <= 0 THEN
    RAISE EXCEPTION 'Order amounts must be positive';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger for order validation
DROP TRIGGER IF EXISTS validate_order_trigger ON orders;
CREATE TRIGGER validate_order_trigger
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION validate_order_data();

-- Add audit logging for purchase attempts
CREATE TABLE IF NOT EXISTS purchase_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  service_id uuid REFERENCES services(id),
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  success boolean DEFAULT false,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE purchase_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own audit logs"
  ON purchase_audit_log
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Service role can manage audit logs"
  ON purchase_audit_log
  FOR ALL
  TO service_role
  USING (true);

-- Add function to log purchase attempts
CREATE OR REPLACE FUNCTION log_purchase_attempt(
  p_client_id uuid,
  p_service_id uuid,
  p_action text,
  p_details jsonb DEFAULT '{}',
  p_success boolean DEFAULT false,
  p_error_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO purchase_audit_log (
    client_id,
    service_id,
    action,
    details,
    success,
    error_message
  ) VALUES (
    p_client_id,
    p_service_id,
    p_action,
    p_details,
    p_success,
    p_error_message
  );
END;
$$;

-- Ensure we have some basic services if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM services LIMIT 1) THEN
    INSERT INTO services (name, description, category, pricing, features) VALUES
    (
      'Email Migration & Setup',
      'Seamless email migration between platforms with zero downtime and complete data integrity.',
      'email',
      '{"basic": 4}',
      '{"basic": ["Complete mailbox migration", "Email backup included", "Zero downtime migration", "Basic support"]}'
    ),
    (
      'Domain & Email Security',
      'Complete DNS and email authentication setup including SPF, DKIM, and DMARC configuration.',
      'security',
      '{"basic": 25}',
      '{"basic": ["SPF, DKIM, DMARC setup", "DNS configuration", "Deliverability optimization", "Email support"]}'
    ),
    (
      'SSL & HTTPS Setup',
      'Professional SSL certificate installation, configuration, and automated renewal systems.',
      'security',
      '{"basic": 7, "standard": 10, "enterprise": 25}',
      '{"basic": ["Free SSL certificate", "Installation & configuration", "Auto-renewal setup", "Basic support"], "standard": ["Client-provided SSL certificate", "Professional installation", "Configuration & testing", "Priority support"], "enterprise": ["Up to 5 domains", "Client-provided SSL certificate", "Complete configuration", "Advanced support"]}'
    ),
    (
      'Cloud Suite Management',
      'Expert administration and optimization of Google Workspace and Microsoft 365 environments.',
      'cloud',
      '{"basic": 25, "standard": 5}',
      '{"basic": ["Initial setup & configuration", "User account creation", "Basic troubleshooting", "Documentation provided"], "standard": ["Additional troubleshooting", "Configuration changes", "User support", "Quick resolution"]}'
    ),
    (
      'Cloud Data Migration',
      'Per drive/site/Teams chat migration between cloud platforms.',
      'migration',
      '{"basic": 5}',
      '{"basic": ["Microsoft Teams chat migration", "SharePoint site migration", "OneDrive migration", "Google Drive migration"]}'
    ),
    (
      'Hosting & Control Panel Support',
      'Professional Plesk and cPanel troubleshooting, optimization, and ongoing maintenance.',
      'hosting',
      '{"basic": 15, "standard": 25, "enterprise": 55}',
      '{"basic": ["Basic troubleshooting", "Performance optimization", "Email support", "Monthly check-up"], "standard": ["Everything in Basic", "Priority support", "Security hardening", "Weekly monitoring", "Backup management"], "enterprise": ["Everything in Standard", "24/7 monitoring", "Dedicated support", "Custom configurations", "Emergency response"]}'
    ),
    (
      'Acronis Account Setup (Data Backup & Recovery)',
      'One-time Acronis backup solution setup and configuration for comprehensive data protection.',
      'backup',
      '{"basic": 25}',
      '{"basic": ["Acronis account creation", "Complete configuration", "Multi-device setup", "Training and support"]}'
    ),
    (
      'Per Incident Support',
      'Quick resolution for specific IT issues across all platforms with expert troubleshooting.',
      'support',
      '{"basic": 20}',
      '{"basic": ["Expert troubleshooting", "Quick issue resolution", "7-day follow-up support", "Documentation provided"]}'
    );
  END IF;
END $$;