// Contact Form API Handler
// This file should be deployed to your backend server (Node.js/Express)

const nodemailer = require('nodemailer');

// Email Configuration
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function sendContactEmails(contactData) {
  // Email to customer (confirmation)
  const customerEmailOptions = {
    from: 'contact@mechinweb.com',
    to: contactData.email,
    subject: 'Message Received - Mechinweb IT Services',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Thank You for Contacting Us!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p>Dear ${contactData.name},</p>
          
          <p>Thank you for reaching out to Mechinweb. We've received your message and will get back to you within 24 hours.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3B82F6; margin-top: 0;">Your Message:</h3>
            <p><strong>Subject:</strong> ${contactData.subject}</p>
            <p><strong>Message:</strong></p>
            <p style="background: #f8f9fa; padding: 15px; border-radius: 4px;">${contactData.message}</p>
          </div>
          
          <p>For urgent matters, feel free to contact us directly:</p>
          <p>📧 Email: contact@mechinweb.com<br>
</p>
          
          <p>Best regards,<br>
          The Mechinweb Team</p>
        </div>
      </div>
    `
  };

  // Email to business
  const businessEmailOptions = {
    from: 'contact@mechinweb.com',
    to: 'contact@mechinweb.com',
    subject: `New Contact Message - ${contactData.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">New Contact Message Received</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h3>Contact Information:</h3>
          <p><strong>Name:</strong> ${contactData.name}</p>
          <p><strong>Email:</strong> ${contactData.email}</p>
          <p><strong>Subject:</strong> ${contactData.subject}</p>
          
          <h3>Message:</h3>
          <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #3B82F6;">
            ${contactData.message}
          </div>
          
          <p><strong>Submitted:</strong> ${new Date(contactData.timestamp).toLocaleString()}</p>
        </div>
        
        <p><em>Please respond to the customer within 24 hours.</em></p>
      </div>
    `
  };

  await Promise.all([
    emailTransporter.sendMail(customerEmailOptions),
    emailTransporter.sendMail(businessEmailOptions)
  ]);
}

// API endpoint handler
async function handleContactForm(req, res) {
  try {
    const contactData = req.body;
    
    // Send notification emails
    await sendContactEmails(contactData);
    
    res.json({
      success: true,
      message: 'Contact message sent successfully'
    });
    
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
}

module.exports = { handleContactForm };
