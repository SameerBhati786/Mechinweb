/*
  # Update Email Templates for Client Area

  1. Email Templates
    - Update welcome email template to include client area URL
    - Add proper client dashboard link
    - Enhance email content with login instructions

  2. Template Variables
    - Add client_area_url variable
    - Update template content with proper formatting
*/

-- Update welcome email template
INSERT INTO email_templates (
  template_name,
  subject,
  html_content,
  variables,
  is_active
) VALUES (
  'welcome_email',
  'Welcome to Mechinweb - Your Account is Ready!',
  '
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to Mechinweb!</h1>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa;">
        <p>Dear {{client_name}},</p>
        
        <p>Welcome to Mechinweb! Your client account has been successfully created and you can now access our full range of IT services.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #3B82F6; margin-top: 0;">Your Account Details:</h3>
          <p><strong>Name:</strong> {{client_name}}</p>
          <p><strong>Email:</strong> {{client_email}}</p>
          <p><strong>Account Status:</strong> Active</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #3B82F6; margin-top: 0;">Access Your Client Area:</h3>
          <p>You can now log in to your dedicated client dashboard to:</p>
          <ul>
            <li>Browse and purchase our professional IT services</li>
            <li>Track your orders and service progress</li>
            <li>Download invoices and payment receipts</li>
            <li>Access 24/7 customer support</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{client_area_url}}" 
             style="background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Access Your Client Dashboard
          </a>
        </div>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #1565c0;"><strong>Login URL:</strong> {{login_url}}</p>
          <p style="margin: 5px 0 0 0; color: #1565c0; font-size: 14px;">Bookmark this link for easy access to your account</p>
        </div>
        
        <p>If you have any questions or need assistance, don''t hesitate to contact us:</p>
        <p>📧 Email: contact@mechinweb.com<br>
        📱 WhatsApp: +1 (555) 123-4567<br>
        📞 Phone: +1 (555) 123-4567</p>
        
        <p>Best regards,<br>
        The Mechinweb Team</p>
      </div>
    </div>
  ',
  '{"client_name": "", "client_email": "", "login_url": "", "client_area_url": ""}'::jsonb,
  true
) ON CONFLICT (template_name) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  variables = EXCLUDED.variables,
  is_active = EXCLUDED.is_active;