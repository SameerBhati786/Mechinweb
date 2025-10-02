const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  console.log('Testing email configuration...');

  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

  // Check that environment variables are loaded
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('Email credentials are not set in environment variables.');
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false,
        error: 'Email credentials not configured.',
        debug: {
          hasEmailUser: !!process.env.EMAIL_USER,
          hasEmailPassword: !!process.env.EMAIL_PASSWORD,
          emailUser: process.env.EMAIL_USER
        }
      }),
    };
  }

  try {
    console.log('Creating nodemailer transporter...');
    
    // Create the transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.in',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('Transporter created successfully.');

    // Verify the SMTP connection
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP configuration is correct.');

    // If POST request, send a test email
    if (event.httpMethod === 'POST') {
      console.log('Sending test email...');
      
      const testEmailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to self for testing
        subject: 'Test Email from Mechinweb - Email Service Working',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Email Service Test</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <p>This is a test email to verify that the Mechinweb email service is working correctly.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #10B981; margin-top: 0;">Test Details:</h3>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
                <p><strong>SMTP Host:</strong> smtp.zoho.in</p>
                <p><strong>Status:</strong> ✅ Working</p>
              </div>
              
              <p>If you received this email, the email service is configured correctly!</p>
              
              <p>Best regards,<br>
              Mechinweb Email Service</p>
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail(testEmailOptions);
      console.log('Test email sent successfully:', result.messageId);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: true, 
          message: 'Email service is working correctly! Test email sent.',
          details: {
            messageId: result.messageId,
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            timestamp: new Date().toISOString()
          }
        }),
      };
    }

    // If GET request, just verify configuration
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Email configuration is correct!',
        details: {
          host: 'smtp.zoho.in',
          port: 587,
          user: process.env.EMAIL_USER,
          verified: true,
          timestamp: new Date().toISOString()
        }
      }),
    };

  } catch (error) {
    console.error('Email test failed:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Email test failed.',
        errorMessage: error.message,
        debug: {
          hasEmailUser: !!process.env.EMAIL_USER,
          hasEmailPassword: !!process.env.EMAIL_PASSWORD,
          emailUser: process.env.EMAIL_USER,
          errorStack: error.stack
        }
      }),
    };
  }
};