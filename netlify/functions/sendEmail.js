const nodemailer = require('nodemailer');

// Enhanced logging function
const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data: data ? JSON.stringify(data, null, 2) : null
  };
  console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || '');
  return logEntry;
};

// Email Configuration with enhanced error handling
const createEmailTransporter = () => {
  log('info', 'Creating email transporter');
  
  const config = {
    host: 'smtp.zoho.in',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: false, // Disable debug to reduce logs
    logger: false // Disable logger to reduce logs
  };

  log('info', 'Email config', {
    host: config.host,
    port: config.port,
    user: config.auth.user,
    hasPassword: !!config.auth.pass
  });

  return nodemailer.createTransport(config);
};

// Verify email configuration
const verifyEmailConfig = async (transporter) => {
  try {
    log('info', 'Verifying email configuration...');
    await transporter.verify();
    log('info', 'Email configuration verified successfully');
    return true;
  } catch (error) {
    log('error', 'Email configuration verification failed', error);
    throw new Error(`Email configuration invalid: ${error.message}`);
  }
};

// Enhanced email sending with retry logic
const sendEmailWithRetry = async (transporter, emailOptions, maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log('info', `Sending email attempt ${attempt}/${maxRetries}`, {
        to: emailOptions.to,
        subject: emailOptions.subject
      });
      
      const result = await transporter.sendMail(emailOptions);
      log('info', 'Email sent successfully', {
        messageId: result.messageId,
        response: result.response
      });
      return result;
    } catch (error) {
      log('error', `Email send attempt ${attempt} failed`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

// Main handler function
exports.handler = async (event, context) => {
  const requestId = context.awsRequestId || Date.now().toString();
  
  log('info', 'Function invoked', {
    requestId,
    method: event.httpMethod,
    path: event.path
  });

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    log('info', 'Handling CORS preflight');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    log('error', 'Invalid HTTP method', { method: event.httpMethod });
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Method not allowed',
        requestId 
      })
    };
  }

  try {
    // Parse request body
    let requestData;
    try {
      if (!event.body) {
        log('warning', 'No request body provided');
        throw new Error('Request body is required');
      }
      
      requestData = JSON.parse(event.body);
      log('info', 'Request data parsed', { type: requestData.type });
    } catch (parseError) {
      log('error', 'Failed to parse request body', parseError);
      throw new Error(`Invalid JSON in request body: ${parseError.message}`);
    }

    const { type, data } = requestData;
    
    // Handle missing type - default to contact_form for backward compatibility
    const emailType = type || 'contact_form';
    log('info', 'Email type determined', { 
      originalType: type, 
      emailType, 
      hasData: !!data,
      requestDataKeys: Object.keys(requestData),
      fullRequestData: requestData
    });
    
    // If no data provided, treat the entire requestData as the email data
    const emailData = data || requestData;
    
    log('info', 'Email data prepared', {
      emailDataKeys: Object.keys(emailData),
      emailDataSample: {
        name: emailData.name,
        email: emailData.email,
        subject: emailData.subject,
        hasMessage: !!emailData.message
      }
    });

    // Validate email credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      log('error', 'Email credentials missing', {
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPassword: !!process.env.EMAIL_PASSWORD
      });
      throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in Netlify environment variables.');
    }

    // Create and verify email transporter
    const transporter = createEmailTransporter();
    await verifyEmailConfig(transporter);

    // Route to appropriate handler
    switch (emailType) {
      case 'contact_form':
        await handleContactForm(transporter, emailData, requestId);
        break;
      case 'quote_request':
        await handleQuoteRequest(transporter, emailData, requestId);
        break;
      case 'welcome_email':
        await handleWelcomeEmail(transporter, emailData, requestId);
        break;
      case 'payment_confirmation':
        await handlePaymentConfirmation(transporter, emailData, requestId);
        break;
      case 'test':
        await handleTestEmail(transporter, emailData, requestId);
        break;
      case 'registration_welcome':
        await handleRegistrationWelcome(transporter, emailData, requestId);
        break;
      default:
        // Default to contact form if type is not recognized
        log('warning', 'Unknown email type, defaulting to contact_form', { emailType });
        await handleContactForm(transporter, emailData, requestId);
    }

    log('info', 'Email function completed successfully', { requestId });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        requestId,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    log('error', 'Email function error', {
      requestId,
      error: error.message,
      stack: error.stack
    });
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false, 
        error: error.message,
        requestId,
        timestamp: new Date().toISOString(),
        debug: {
          hasEmailUser: !!process.env.EMAIL_USER,
          hasEmailPassword: !!process.env.EMAIL_PASSWORD,
          emailUser: process.env.EMAIL_USER,
          nodeVersion: process.version
        }
      })
    };
  }
};

// Handle test emails
async function handleTestEmail(transporter, data, requestId) {
  log('info', 'Processing test email', { requestId });
  
  const emailOptions = {
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
            <p><strong>Request ID:</strong> ${requestId}</p>
            <p><strong>Status:</strong> ✅ Working</p>
          </div>
          
          <p>If you received this email, the email service is configured correctly!</p>
          
          <p>Best regards,<br>
          Mechinweb Email Service</p>
        </div>
      </div>
    `
  };

  await sendEmailWithRetry(transporter, emailOptions);
  log('info', 'Test email sent successfully', { requestId });
}

// Handle contact form submissions
async function handleContactForm(transporter, data, requestId) {
  log('info', 'Processing contact form', { 
    requestId, 
    email: data.email,
    dataKeys: Object.keys(data),
    hasRequiredFields: {
      name: !!data.name,
      email: !!data.email,
      subject: !!data.subject,
      message: !!data.message
    }
  });
  
  const { name, email, subject, message } = data;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    log('warning', 'Missing required fields for contact form', { 
      hasName: !!name, 
      hasEmail: !!email, 
      hasSubject: !!subject, 
      hasMessage: !!message,
      receivedData: data,
      receivedDataString: JSON.stringify(data)
    });
    
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!subject) missingFields.push('subject');
    if (!message) missingFields.push('message');
    
    throw new Error(`Missing required fields: ${missingFields.join(', ')}. Please provide all required contact form fields.`);
  }

  // Email to customer (confirmation)
  const customerEmailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Message Received - Mechinweb IT Services',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Thank You for Contacting Us!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p>Dear ${name},</p>
          
          <p>Thank you for reaching out to Mechinweb. We've received your message and will get back to you within 24 hours.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3B82F6; margin-top: 0;">Your Message:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="background: #f8f9fa; padding: 15px; border-radius: 4px;">${message}</p>
          </div>
          
          <p>For urgent matters, feel free to contact us directly:</p>
          <p>📧 Email: contact@mechinweb.com</p>
          
          <p>Best regards,<br>
          The Mechinweb Team</p>
        </div>
      </div>
    `
  };

  // Email to business
  const businessEmailOptions = {
    from: process.env.EMAIL_USER,
    to: 'contact@mechinweb.com',
    subject: `New Contact Message - ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">New Contact Message Received</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h3>Contact Information:</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          
          <h3>Message:</h3>
          <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #3B82F6;">
            ${message}
          </div>
          
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Request ID:</strong> ${requestId}</p>
        </div>
        
        <p><em>Please respond to the customer within 24 hours.</em></p>
      </div>
    `
  };

  // Send both emails
  await Promise.all([
    sendEmailWithRetry(transporter, customerEmailOptions),
    sendEmailWithRetry(transporter, businessEmailOptions)
  ]);

  log('info', 'Contact form emails sent successfully', { requestId });
}

// Handle quote requests
async function handleQuoteRequest(transporter, data, requestId) {
  log('info', 'Processing quote request', { requestId, email: data.customer_email });
  
  const { customer_name, customer_email, service_type, budget_range, timeline, project_details, company_name, phone } = data;

  // Email to customer
  const customerEmailOptions = {
    from: process.env.EMAIL_USER,
    to: customer_email,
    subject: 'Quote Request Received - Mechinweb IT Services',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Thank You for Your Quote Request!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p>Dear ${customer_name},</p>
          
          <p>Thank you for requesting a quote for our IT services. We've received your request and will review it carefully.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3B82F6; margin-top: 0;">Quote Details:</h3>
            <p><strong>Service:</strong> ${service_type}</p>
            <p><strong>Budget Range:</strong> ${budget_range}</p>
            <p><strong>Timeline:</strong> ${timeline}</p>
            <p><strong>Request ID:</strong> ${requestId}</p>
          </div>
          
          <p><strong>What happens next?</strong></p>
          <ol>
            <li>We'll review your requirements within 24 hours</li>
            <li>Prepare a detailed quote with pricing</li>
            <li>Send you the official estimate via email</li>
            <li>Schedule a call to discuss the project</li>
          </ol>
          
          <p>For urgent matters, feel free to contact us directly:</p>
          <p>📧 Email: contact@mechinweb.com</p>
          
          <p>Best regards,<br>
          The Mechinweb Team</p>
        </div>
      </div>
    `
  };

  // Email to business
  const businessEmailOptions = {
    from: process.env.EMAIL_USER,
    to: 'contact@mechinweb.com',
    subject: `New Quote Request - ${customer_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">New Quote Request Received</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h3>Customer Information:</h3>
          <p><strong>Name:</strong> ${customer_name}</p>
          <p><strong>Email:</strong> ${customer_email}</p>
          <p><strong>Company:</strong> ${company_name || 'Not provided'}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          
          <h3>Project Details:</h3>
          <p><strong>Service:</strong> ${service_type}</p>
          <p><strong>Budget Range:</strong> ${budget_range}</p>
          <p><strong>Timeline:</strong> ${timeline}</p>
          
          <h3>Project Description:</h3>
          <p>${project_details}</p>
          
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Request ID:</strong> ${requestId}</p>
        </div>
        
        <p><em>Please review and prepare the quote.</em></p>
      </div>
    `
  };

  await Promise.all([
    sendEmailWithRetry(transporter, customerEmailOptions),
    sendEmailWithRetry(transporter, businessEmailOptions)
  ]);

  log('info', 'Quote request emails sent successfully', { requestId });
}

// Handle welcome emails
async function handleWelcomeEmail(transporter, data, requestId) {
  log('info', 'Processing welcome email', { requestId, email: data.clientEmail });
  
  const { clientName, clientEmail, loginUrl } = data;

  const emailOptions = {
    from: process.env.EMAIL_USER,
    to: clientEmail,
    subject: 'Welcome to Mechinweb - Your Account is Ready!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Mechinweb!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p>Dear ${clientName},</p>
          
          <p>Welcome to Mechinweb! Your client account has been successfully created and you can now access our full range of IT services.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3B82F6; margin-top: 0;">Your Account Details:</h3>
            <p><strong>Name:</strong> ${clientName}</p>
            <p><strong>Email:</strong> ${clientEmail}</p>
            <p><strong>Account Status:</strong> Active</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" 
               style="background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Access Your Dashboard
            </a>
          </div>
          
          <p>Best regards,<br>
          The Mechinweb Team</p>
        </div>
      </div>
    `
  };

  await sendEmailWithRetry(transporter, emailOptions);
  log('info', 'Welcome email sent successfully', { requestId });
}

// Handle payment confirmation emails
async function handlePaymentConfirmation(transporter, data, requestId) {
  log('info', 'Processing payment confirmation email', { requestId, email: data.clientEmail });
  
  const { clientName, clientEmail, serviceName, packageType, orderId, amount } = data;

  const emailOptions = {
    from: process.env.EMAIL_USER,
    to: clientEmail,
    subject: 'Payment Confirmation - Mechinweb IT Services',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Payment Confirmed!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p>Dear ${clientName},</p>
          
          <p>Thank you for your payment! We've received your payment and will begin working on your service immediately.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #10B981; margin-top: 0;">Order Details:</h3>
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Package:</strong> ${packageType}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Amount:</strong> $${amount}</p>
            <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Request ID:</strong> ${requestId}</p>
          </div>
          
          <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0277bd; margin-top: 0;">What happens next?</h3>
            <ol>
              <li>Our team will contact you within 24 hours</li>
              <li>We'll begin working on your service</li>
              <li>You'll receive regular updates on progress</li>
              <li>Service completion notification</li>
            </ol>
          </div>
          
          <p>You can track your order progress in your dashboard.</p>
          
          <p>Best regards,<br>
          The Mechinweb Team</p>
        </div>
      </div>
    `
  };

  await sendEmailWithRetry(transporter, emailOptions);
  log('info', 'Payment confirmation email sent successfully', { requestId });
}

// Handle registration welcome emails
async function handleRegistrationWelcome(transporter, data, requestId) {
  log('info', 'Processing registration welcome email', { 
    requestId, 
    email: data.email,
    dataKeys: Object.keys(data)
  });
  
  const { name, email, loginUrl, supportEmail, verificationRequired } = data;
  
  // Validate required fields
  if (!name || !email) {
    log('warning', 'Missing required fields for registration welcome', {
      hasName: !!name,
      hasEmail: !!email,
      receivedData: data
    });
    throw new Error('Missing required fields: name and email are required for registration welcome email');
  }

  const emailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Mechinweb - Please Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Mechinweb, ${name}!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p>Dear ${name},</p>
          
          <p>Thank you for registering with Mechinweb! Your account has been created successfully.</p>
          
          ${verificationRequired ? `
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
              <h3 style="color: #1976d2; margin-top: 0;">⚠️ Important: Email Verification Required</h3>
              <p style="margin: 0;">To access your dashboard and purchase services, you must verify your email address first.</p>
            </div>
          ` : ''}
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${verificationRequired ? `
              <h3 style="color: #3B82F6; margin-top: 0;">How to Verify Your Email:</h3>
              <ol>
                <li><strong>Check your email inbox</strong> for a verification email from Supabase</li>
                <li><strong>Click the verification link</strong> in that email to confirm your email address</li>
                <li><strong>Return to our website</strong> and log in to access your dashboard</li>
              </ol>
              <p style="margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 4px; color: #856404;">
                <strong>Note:</strong> If you don't see the verification email, please check your spam/junk folder.
              </p>
            ` : `
              <h3 style="color: #3B82F6; margin-top: 0;">Your Account is Ready!</h3>
              <p>You can now log in and start using our services.</p>
            `}
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3B82F6; margin-top: 0;">What you'll get access to after verification:</h3>
            <ul>
              <li>Professional IT services dashboard</li>
              <li>Order tracking and management</li>
              <li>Invoice downloads and payment history</li>
              <li>24/7 customer support</li>
              <li>Real-time order status updates</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" 
               style="background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              ${verificationRequired ? 'Go to Login Page (After Verification)' : 'Login to Your Account'}
            </a>
          </div>
          
          <p>If you have any questions or need assistance${verificationRequired ? ' with verification' : ''}, please contact us at ${supportEmail || 'contact@mechinweb.com'}</p>
          
          <p>Best regards,<br>
          The Mechinweb Team</p>
        </div>
      </div>
    `
  };
  
  await sendEmailWithRetry(transporter, emailOptions);
  log('info', 'Registration welcome email sent successfully', { requestId });
}