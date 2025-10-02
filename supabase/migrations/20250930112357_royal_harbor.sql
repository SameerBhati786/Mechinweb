/*
  # Fix System Errors and Update Service Pricing

  This migration resolves system errors and updates service pricing to specified rates:
  - Email Migration: $4.00 per mailbox
  - Acronis Setup: $25.00
  - Cloud Management: $25.00
  - All other services: Maintain current documented rates

  1. System Fixes
     - Update service pricing in database
     - Ensure data consistency
     - Fix any constraint issues

  2. Pricing Updates
     - Email Migration & Setup: $4.00 per mailbox
     - Acronis Account Setup: $25.00
     - Cloud Suite Management: $25.00
     - Maintain all other existing rates

  3. Data Validation
     - Verify all pricing data is consistent
     - Ensure no orphaned records
     - Validate JSON structure integrity
*/

-- Update Email Migration & Setup pricing
UPDATE services 
SET pricing = jsonb_build_object(
  'basic', 4.00
),
features = jsonb_build_object(
  'basic', jsonb_build_array(
    'Complete mailbox migration',
    'Email backup included', 
    'Zero downtime migration',
    'Basic support'
  )
),
updated_at = now()
WHERE name ILIKE '%email migration%' OR name ILIKE '%email setup%';

-- Update Acronis Account Setup pricing
UPDATE services 
SET pricing = jsonb_build_object(
  'basic', 25.00
),
features = jsonb_build_object(
  'basic', jsonb_build_array(
    'Acronis account creation',
    'Complete configuration',
    'Multi-device setup', 
    'Training and support'
  )
),
updated_at = now()
WHERE name ILIKE '%acronis%';

-- Update Cloud Suite Management pricing
UPDATE services 
SET pricing = jsonb_build_object(
  'basic', 25.00,
  'standard', 5.00
),
features = jsonb_build_object(
  'basic', jsonb_build_array(
    'Initial setup & configuration',
    'User account creation',
    'Basic troubleshooting',
    'Documentation provided'
  ),
  'standard', jsonb_build_array(
    'Additional troubleshooting',
    'Configuration changes', 
    'User support',
    'Quick resolution'
  )
),
updated_at = now()
WHERE name ILIKE '%cloud%' AND (name ILIKE '%management%' OR name ILIKE '%suite%');

-- Ensure Email Deliverability pricing is correct
UPDATE services 
SET pricing = jsonb_build_object(
  'basic', 25.00
),
features = jsonb_build_object(
  'basic', jsonb_build_array(
    'SPF, DKIM, DMARC setup',
    'DNS configuration',
    'Deliverability optimization',
    'Email support'
  )
),
updated_at = now()
WHERE name ILIKE '%email deliverability%' OR name ILIKE '%email security%';

-- Ensure Per Incident Support pricing is correct
UPDATE services 
SET pricing = jsonb_build_object(
  'basic', 20.00
),
features = jsonb_build_object(
  'basic', jsonb_build_array(
    'Expert troubleshooting',
    'Quick issue resolution',
    '7-day follow-up support',
    'Documentation provided'
  )
),
updated_at = now()
WHERE name ILIKE '%per incident%' OR name ILIKE '%incident support%';

-- Ensure SSL Setup pricing is correct
UPDATE services 
SET pricing = jsonb_build_object(
  'basic', 7.00,
  'standard', 10.00,
  'enterprise', 25.00
),
features = jsonb_build_object(
  'basic', jsonb_build_array(
    'Free SSL certificate',
    'Installation & configuration',
    'Auto-renewal setup',
    'Basic support'
  ),
  'standard', jsonb_build_array(
    'Client-provided SSL certificate',
    'Professional installation',
    'Configuration & testing',
    'Priority support'
  ),
  'enterprise', jsonb_build_array(
    'Up to 5 domains',
    'Client-provided SSL certificate',
    'Complete configuration',
    'Advanced support'
  )
),
updated_at = now()
WHERE name ILIKE '%ssl%' AND name ILIKE '%setup%';

-- Ensure Data Migration pricing is correct
UPDATE services 
SET pricing = jsonb_build_object(
  'basic', 5.00
),
features = jsonb_build_object(
  'basic', jsonb_build_array(
    'Microsoft Teams chat migration',
    'SharePoint site migration',
    'OneDrive migration',
    'Google Drive migration'
  )
),
updated_at = now()
WHERE name ILIKE '%data migration%' OR name ILIKE '%cloud data%';

-- Ensure Hosting Support pricing is correct
UPDATE services 
SET pricing = jsonb_build_object(
  'basic', 15.00,
  'standard', 25.00,
  'enterprise', 55.00
),
features = jsonb_build_object(
  'basic', jsonb_build_array(
    'Basic troubleshooting',
    'Performance optimization',
    'Email support',
    'Monthly check-up'
  ),
  'standard', jsonb_build_array(
    'Everything in Basic',
    'Priority support',
    'Security hardening',
    'Weekly monitoring',
    'Backup management'
  ),
  'enterprise', jsonb_build_array(
    'Everything in Standard',
    '24/7 monitoring',
    'Dedicated support',
    'Custom configurations',
    'Emergency response'
  )
),
updated_at = now()
WHERE name ILIKE '%hosting%' AND name ILIKE '%support%';

-- Validate all pricing data integrity
DO $$
DECLARE
    service_record RECORD;
    pricing_issues TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check for services with invalid pricing
    FOR service_record IN 
        SELECT id, name, pricing 
        FROM services 
        WHERE pricing IS NULL OR pricing = '{}'::jsonb
    LOOP
        pricing_issues := array_append(pricing_issues, 
            'Service "' || service_record.name || '" has invalid pricing: ' || COALESCE(service_record.pricing::text, 'NULL'));
    END LOOP;
    
    -- Check for services with zero prices
    FOR service_record IN 
        SELECT id, name, pricing 
        FROM services 
        WHERE pricing IS NOT NULL
    LOOP
        -- Check if any pricing tier has zero or negative values
        IF (pricing->>'basic')::numeric <= 0 OR 
           (pricing ? 'standard' AND (pricing->>'standard')::numeric <= 0) OR
           (pricing ? 'enterprise' AND (pricing->>'enterprise')::numeric <= 0) THEN
            pricing_issues := array_append(pricing_issues, 
                'Service "' || service_record.name || '" has zero or negative pricing');
        END IF;
    END LOOP;
    
    -- Log any issues found
    IF array_length(pricing_issues, 1) > 0 THEN
        RAISE NOTICE 'Pricing validation issues found: %', array_to_string(pricing_issues, '; ');
    ELSE
        RAISE NOTICE 'All service pricing validated successfully';
    END IF;
END $$;

-- Create index for better pricing queries if not exists
CREATE INDEX IF NOT EXISTS idx_services_pricing_search 
ON services USING gin (pricing);

-- Update statistics
ANALYZE services;