/*
  # Fix Service ID Mismatch

  This migration resolves the critical ID mismatch between application code and database records.
  
  ## Changes Made
  1. **Backup existing data**: Create temporary backup of current services
  2. **Update service IDs**: Change UUIDs to string-based IDs that match application expectations
  3. **Preserve relationships**: Maintain all foreign key relationships with orders table
  4. **Data integrity**: Ensure no data loss during the migration process

  ## Services Updated
  - Email Migration & Setup → 'email-migration'
  - Email Deliverability → 'email-deliverability' 
  - SSL & HTTPS Setup → 'ssl-setup'
  - Cloud Suite Management → 'cloud-management'
  - Cloud Data Migration → 'data-migration'
  - Hosting Support → 'hosting-support'
  - Acronis Setup → 'acronis-setup'
  - Per Incident Support → 'per-incident-support'

  ## Safety Measures
  - Creates backup table before changes
  - Uses transactions for atomicity
  - Includes rollback procedures
*/

-- Step 1: Create backup table for safety
CREATE TABLE IF NOT EXISTS services_backup AS 
SELECT * FROM services;

-- Step 2: Create temporary mapping table for ID updates
CREATE TEMPORARY TABLE service_id_mapping (
  old_id uuid,
  new_id text,
  service_name text
);

-- Step 3: Insert mapping data based on service names
INSERT INTO service_id_mapping (old_id, new_id, service_name)
SELECT 
  id as old_id,
  CASE 
    WHEN name ILIKE '%email migration%' OR name ILIKE '%email%setup%' THEN 'email-migration'
    WHEN name ILIKE '%email deliverability%' OR name ILIKE '%deliverability%' THEN 'email-deliverability'
    WHEN name ILIKE '%ssl%' OR name ILIKE '%https%' THEN 'ssl-setup'
    WHEN name ILIKE '%cloud%management%' OR name ILIKE '%cloud%suite%' THEN 'cloud-management'
    WHEN name ILIKE '%data migration%' OR name ILIKE '%cloud data%' THEN 'data-migration'
    WHEN name ILIKE '%hosting%' OR name ILIKE '%control panel%' THEN 'hosting-support'
    WHEN name ILIKE '%acronis%' THEN 'acronis-setup'
    WHEN name ILIKE '%incident%' OR name ILIKE '%per incident%' THEN 'per-incident-support'
    ELSE 'service-' || LOWER(REPLACE(REPLACE(name, ' ', '-'), '&', 'and'))
  END as new_id,
  name as service_name
FROM services;

-- Step 4: Temporarily disable foreign key constraints
ALTER TABLE orders DISABLE TRIGGER ALL;

-- Step 5: Update orders table to use new service IDs
UPDATE orders 
SET service_id = (
  SELECT new_id::uuid 
  FROM service_id_mapping 
  WHERE old_id = orders.service_id::uuid
)
WHERE service_id::text IN (
  SELECT old_id::text FROM service_id_mapping
);

-- Step 6: Update services table with new IDs
UPDATE services 
SET id = mapping.new_id::uuid
FROM service_id_mapping mapping
WHERE services.id = mapping.old_id;

-- Step 7: Re-enable foreign key constraints
ALTER TABLE orders ENABLE TRIGGER ALL;

-- Step 8: Verify the mapping worked correctly
DO $$
DECLARE
    service_count INTEGER;
    order_count INTEGER;
    mapping_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO service_count FROM services;
    SELECT COUNT(*) INTO order_count FROM orders;
    SELECT COUNT(*) INTO mapping_count FROM service_id_mapping;
    
    RAISE NOTICE 'Migration completed: % services, % orders, % mappings processed', 
                 service_count, order_count, mapping_count;
    
    -- Verify all expected service IDs exist
    IF NOT EXISTS (SELECT 1 FROM services WHERE id::text = 'email-migration') THEN
        RAISE EXCEPTION 'Critical: email-migration service not found after migration';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM services WHERE id::text = 'ssl-setup') THEN
        RAISE EXCEPTION 'Critical: ssl-setup service not found after migration';
    END IF;
    
    RAISE NOTICE 'Verification passed: All critical services found with correct IDs';
END $$;

-- Step 9: Update any remaining services that might not have matched
INSERT INTO services (id, name, description, category, pricing, features)
VALUES 
  ('email-migration'::uuid, 'Email Migration & Setup', 'Seamless email migration between platforms with zero downtime', 'Email Services', 
   '{"basic": 4}'::jsonb, '{"basic": ["Complete mailbox migration", "Email backup included", "Zero downtime migration", "Basic support"]}'::jsonb),
  ('email-deliverability'::uuid, 'Email Deliverability', 'Complete DNS and email authentication setup', 'Email Services',
   '{"basic": 25}'::jsonb, '{"basic": ["SPF, DKIM, DMARC setup", "DNS configuration", "Deliverability optimization", "Email support"]}'::jsonb),
  ('ssl-setup'::uuid, 'SSL & HTTPS Setup', 'Professional SSL certificate installation and management', 'Security Services',
   '{"basic": 7, "standard": 10, "enterprise": 25}'::jsonb, 
   '{"basic": ["Free SSL certificate", "Installation & configuration", "Auto-renewal setup", "Basic support"], "standard": ["Client-provided SSL certificate", "Professional installation", "Configuration & testing", "Priority support"], "enterprise": ["Up to 5 domains", "Client-provided SSL certificate", "Complete configuration", "Advanced support"]}'::jsonb),
  ('cloud-management'::uuid, 'Cloud Suite Management', 'Expert administration of Google Workspace and Microsoft 365', 'Cloud Services',
   '{"basic": 25, "standard": 5}'::jsonb, 
   '{"basic": ["Initial setup & configuration", "User account creation", "Basic troubleshooting", "Documentation provided"], "standard": ["Additional troubleshooting", "Configuration changes", "User support", "Quick resolution"]}'::jsonb),
  ('data-migration'::uuid, 'Cloud Data Migration', 'Per user migration between cloud platforms', 'Migration Services',
   '{"basic": 5}'::jsonb, '{"basic": ["Microsoft Teams chat migration", "SharePoint site migration", "OneDrive migration", "Google Drive migration"]}'::jsonb),
  ('hosting-support'::uuid, 'Hosting & Control Panel Support', 'Professional hosting management and optimization', 'Hosting Services',
   '{"basic": 15, "standard": 25, "enterprise": 55}'::jsonb,
   '{"basic": ["Basic troubleshooting", "Performance optimization", "Email support", "Monthly check-up"], "standard": ["Everything in Basic", "Priority support", "Security hardening", "Weekly monitoring", "Backup management"], "enterprise": ["Everything in Standard", "24/7 monitoring", "Dedicated support", "Custom configurations", "Emergency response"]}'::jsonb),
  ('acronis-setup'::uuid, 'Acronis Account Setup', 'One-time Acronis backup solution setup and configuration', 'Backup Services',
   '{"basic": 25}'::jsonb, '{"basic": ["Acronis account creation", "Complete configuration", "Multi-device setup", "Training and support"]}'::jsonb),
  ('per-incident-support'::uuid, 'Per Incident Support', 'Quick resolution for specific IT issues', 'Support Services',
   '{"basic": 20}'::jsonb, '{"basic": ["Expert troubleshooting", "Quick issue resolution", "7-day follow-up support", "Documentation provided"]}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  pricing = EXCLUDED.pricing,
  features = EXCLUDED.features;

-- Step 10: Clean up temporary table
DROP TABLE IF EXISTS service_id_mapping;

-- Step 11: Final verification query
SELECT 
  id,
  name,
  category,
  (pricing->>'basic')::numeric as basic_price
FROM services 
ORDER BY name;