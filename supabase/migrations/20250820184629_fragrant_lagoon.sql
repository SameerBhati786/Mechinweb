/*
  # Add encrypted payment data storage

  1. New Tables
    - `encrypted_payment_data` - Store encrypted payment information
    - `zoho_integrations` - Store Zoho API configurations
    - `email_templates` - Store customizable email templates
  
  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to access their own data
    - Implement encryption for sensitive payment data
  
  3. Updates
    - Add encryption fields to existing tables
    - Update orders table for Zoho integration
*/

-- Create encrypted payment data table
CREATE TABLE IF NOT EXISTS encrypted_payment_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  encrypted_data text NOT NULL, -- Encrypted payment method data
  payment_method_type text NOT NULL CHECK (payment_method_type IN ('card', 'bank', 'digital_wallet')),
  last_four text, -- Last 4 digits for display (not encrypted)
  expiry_month integer,
  expiry_year integer,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Zoho integrations table
CREATE TABLE IF NOT EXISTS zoho_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text UNIQUE NOT NULL,
  encrypted_credentials text NOT NULL, -- Encrypted Zoho API credentials
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text UNIQUE NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  variables jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add Zoho-related fields to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'zoho_invoice_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN zoho_invoice_id text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'zoho_customer_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN zoho_customer_id text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_gateway'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_gateway text DEFAULT 'zoho';
  END IF;
END $$;

-- Add email verification fields to clients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE clients ADD COLUMN email_verified boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'email_verified_at'
  ) THEN
    ALTER TABLE clients ADD COLUMN email_verified_at timestamptz;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE encrypted_payment_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoho_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for encrypted_payment_data
CREATE POLICY "Users can read own payment data"
  ON encrypted_payment_data
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Users can insert own payment data"
  ON encrypted_payment_data
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Users can update own payment data"
  ON encrypted_payment_data
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Users can delete own payment data"
  ON encrypted_payment_data
  FOR DELETE
  TO authenticated
  USING (client_id = auth.uid());

-- Create RLS policies for zoho_integrations (admin only)
CREATE POLICY "Only service role can access zoho integrations"
  ON zoho_integrations
  FOR ALL
  TO service_role
  USING (true);

-- Create RLS policies for email_templates (read-only for authenticated users)
CREATE POLICY "Authenticated users can read email templates"
  ON email_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert default email templates
INSERT INTO email_templates (template_name, subject, html_content, variables) VALUES
('welcome_email', 'Welcome to Mechinweb - Your Account is Ready!', 
'<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Mechinweb</title>
</head>
<body style="margin: 0; padding: 0; font-family: Inter, system-ui, sans-serif; background-color: #111827;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #111827;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #06B6D4, #3B82F6, #8B5CF6); padding: 40px 30px; text-align: center;">
      <div style="display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
        <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
        <div style="text-align: left;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #FBBF24, #F59E0B); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Mechinweb</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">IT Solutions</p>
        </div>
      </div>
      <h2 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Welcome to Mechinweb!</h2>
      <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 18px;">Your account is ready and waiting for you</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px; background-color: #1F2937;">
      <p style="color: #E5E7EB; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">Dear {{client_name}},</p>
      
      <p style="color: #E5E7EB; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
        Welcome to Mechinweb! Your client account has been successfully created and you can now access our full range of professional IT services.
      </p>
      
      <!-- Account Details Card -->
      <div style="background: linear-gradient(135deg, #374151, #4B5563); padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #06B6D4;">
        <h3 style="color: #06B6D4; margin: 0 0 20px 0; font-size: 20px; font-weight: bold;">Your Account Details</h3>
        <div style="color: #E5E7EB; line-height: 1.8;">
          <p style="margin: 8px 0;"><strong style="color: white;">Name:</strong> {{client_name}}</p>
          <p style="margin: 8px 0;"><strong style="color: white;">Email:</strong> {{client_email}}</p>
          <p style="margin: 8px 0;"><strong style="color: white;">Account Status:</strong> <span style="color: #10B981; font-weight: bold;">Active</span></p>
        </div>
      </div>
      
      <!-- Services Card -->
      <div style="background: linear-gradient(135deg, #374151, #4B5563); padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #8B5CF6;">
        <h3 style="color: #8B5CF6; margin: 0 0 20px 0; font-size: 20px; font-weight: bold;">What you can do now:</h3>
        <ul style="color: #E5E7EB; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li style="margin: 8px 0;">Browse and purchase our professional IT services</li>
          <li style="margin: 8px 0;">Track your orders and service progress</li>
          <li style="margin: 8px 0;">Download invoices and payment receipts</li>
          <li style="margin: 8px 0;">Access 24/7 customer support</li>
        </ul>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{login_url}}" 
           style="display: inline-block; background: linear-gradient(135deg, #06B6D4, #3B82F6, #8B5CF6); color: white; padding: 18px 36px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 10px 25px rgba(6, 182, 212, 0.3); transition: all 0.3s ease;">
          Access Your Dashboard
        </a>
      </div>
      
      <!-- Contact Info -->
      <div style="background: linear-gradient(135deg, #1F2937, #374151); padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #374151;">
        <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">Need Help? We''re Here for You</h3>
        <div style="color: #E5E7EB; line-height: 1.6;">
          <p style="margin: 8px 0;">📧 <strong>Email:</strong> contact@mechinweb.com</p>
          <p style="margin: 8px 0;">📱 <strong>WhatsApp:</strong> +1 (555) 123-4567</p>
          <p style="margin: 8px 0;">📞 <strong>Phone:</strong> +1 (555) 123-4567</p>
        </div>
      </div>
      
      <p style="color: #E5E7EB; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
        Best regards,<br>
        <strong style="color: white;">The Mechinweb Team</strong>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #111827; padding: 30px; text-align: center; border-top: 1px solid #374151;">
      <p style="color: #9CA3AF; font-size: 14px; margin: 0;">
        © 2024 Mechinweb IT Solutions. All rights reserved.
      </p>
      <p style="color: #6B7280; font-size: 12px; margin: 10px 0 0 0;">
        This email was sent to {{client_email}}. If you have any questions, please contact our support team.
      </p>
    </div>
  </div>
</body>
</html>', 
'{"client_name": "Client Name", "client_email": "client@example.com", "login_url": "https://mechinweb.com/client/login"}'),

('email_verification', 'Verify Your Email - Mechinweb Account',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Inter, system-ui, sans-serif; background-color: #111827;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #111827;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #06B6D4, #3B82F6, #8B5CF6); padding: 40px 30px; text-align: center;">
      <div style="display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
        <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="12" r="9"/>
          </svg>
        </div>
        <div style="text-align: left;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #FBBF24, #F59E0B); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Mechinweb</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">IT Solutions</p>
        </div>
      </div>
      <h2 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Verify Your Email</h2>
      <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 18px;">Just one more step to complete your registration</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px; background-color: #1F2937;">
      <p style="color: #E5E7EB; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">Dear {{client_name}},</p>
      
      <p style="color: #E5E7EB; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
        Thank you for registering with Mechinweb! To complete your account setup and access our professional IT services, please verify your email address.
      </p>
      
      <!-- Verification Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{verification_url}}" 
           style="display: inline-block; background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 18px 36px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);">
          Verify Email Address
        </a>
      </div>
      
      <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin: 25px 0; text-align: center;">
        Or copy and paste this link in your browser:<br>
        <a href="{{verification_url}}" style="color: #06B6D4; word-break: break-all;">{{verification_url}}</a>
      </p>
      
      <!-- Security Notice -->
      <div style="background: linear-gradient(135deg, #1F2937, #374151); padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #374151;">
        <h3 style="color: #FBBF24; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">🔒 Security Notice</h3>
        <p style="color: #E5E7EB; line-height: 1.6; margin: 0; font-size: 14px;">
          This verification link will expire in 24 hours for security reasons. If you didn''t create this account, please ignore this email.
        </p>
      </div>
      
      <p style="color: #E5E7EB; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
        Best regards,<br>
        <strong style="color: white;">The Mechinweb Team</strong>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #111827; padding: 30px; text-align: center; border-top: 1px solid #374151;">
      <p style="color: #9CA3AF; font-size: 14px; margin: 0;">
        © 2024 Mechinweb IT Solutions. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>',
'{"client_name": "Client Name", "verification_url": "https://mechinweb.com/verify-email"}'),

('payment_confirmation', 'Payment Confirmation - Mechinweb Services',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Inter, system-ui, sans-serif; background-color: #111827;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #111827;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10B981, #059669, #047857); padding: 40px 30px; text-align: center;">
      <div style="display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
        <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="12" r="9"/>
          </svg>
        </div>
        <div style="text-align: left;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Mechinweb</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">IT Solutions</p>
        </div>
      </div>
      <h2 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Payment Successful!</h2>
      <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 18px;">Your order has been confirmed</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px; background-color: #1F2937;">
      <p style="color: #E5E7EB; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">Dear {{client_name}},</p>
      
      <p style="color: #E5E7EB; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
        Thank you for your payment! Your order has been confirmed and we''ll begin working on your service immediately.
      </p>
      
      <!-- Order Details Card -->
      <div style="background: linear-gradient(135deg, #374151, #4B5563); padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #10B981;">
        <h3 style="color: #10B981; margin: 0 0 20px 0; font-size: 20px; font-weight: bold;">Order Details</h3>
        <div style="color: #E5E7EB; line-height: 1.8;">
          <p style="margin: 8px 0;"><strong style="color: white;">Service:</strong> {{service_name}}</p>
          <p style="margin: 8px 0;"><strong style="color: white;">Package:</strong> {{package_type}}</p>
          <p style="margin: 8px 0;"><strong style="color: white;">Order ID:</strong> {{order_id}}</p>
          <p style="margin: 8px 0;"><strong style="color: white;">Amount Paid:</strong> <span style="color: #10B981; font-weight: bold;">${{amount}}</span></p>
          <p style="margin: 8px 0;"><strong style="color: white;">Payment Date:</strong> {{payment_date}}</p>
        </div>
      </div>
      
      <!-- Next Steps -->
      <div style="background: linear-gradient(135deg, #374151, #4B5563); padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #06B6D4;">
        <h3 style="color: #06B6D4; margin: 0 0 20px 0; font-size: 20px; font-weight: bold;">What happens next?</h3>
        <ol style="color: #E5E7EB; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li style="margin: 8px 0;">Our team will contact you within 24 hours to begin the project</li>
          <li style="margin: 8px 0;">We''ll provide you with a detailed project timeline</li>
          <li style="margin: 8px 0;">You''ll receive regular updates on the progress</li>
          <li style="margin: 8px 0;">Upon completion, you''ll get full documentation and support</li>
        </ol>
      </div>
      
      <!-- Action Buttons -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{dashboard_url}}" 
           style="display: inline-block; background: linear-gradient(135deg, #06B6D4, #3B82F6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 0 10px 10px 0;">
          View Dashboard
        </a>
        <a href="{{invoice_url}}" 
           style="display: inline-block; background: #374151; color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 0 10px 10px 0;">
          Download Invoice
        </a>
      </div>
      
      <p style="color: #E5E7EB; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
        Best regards,<br>
        <strong style="color: white;">The Mechinweb Team</strong>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #111827; padding: 30px; text-align: center; border-top: 1px solid #374151;">
      <p style="color: #9CA3AF; font-size: 14px; margin: 0;">
        © 2024 Mechinweb IT Solutions. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>',
'{"client_name": "Client Name", "service_name": "Service Name", "package_type": "Package", "order_id": "Order ID", "amount": "Amount", "payment_date": "Date", "dashboard_url": "Dashboard URL", "invoice_url": "Invoice URL"}');

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_encrypted_payment_data_updated_at
    BEFORE UPDATE ON encrypted_payment_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zoho_integrations_updated_at
    BEFORE UPDATE ON zoho_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();