// Zoho Invoice API Integration for Quote Creation
// This file should be deployed to your backend server (Node.js/Express)

const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');

// Zoho Invoice API Configuration
const ZOHO_CONFIG = {
  client_id: process.env.ZOHO_CLIENT_ID,
  client_secret: process.env.ZOHO_CLIENT_SECRET,
  refresh_token: process.env.ZOHO_REFRESH_TOKEN,
  organization_id: process.env.ZOHO_ORGANIZATION_ID,
  base_url: 'https://invoice.zoho.in/api/v3'
};

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

async function getZohoAccessToken() {
  try {
    const response = await axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
      params: {
        refresh_token: ZOHO_CONFIG.refresh_token,
        client_id: ZOHO_CONFIG.client_id,
        client_secret: ZOHO_CONFIG.client_secret,
        grant_type: 'refresh_token'
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Zoho access token:', error);
    throw error;
  }
}

async function createZohoCustomer(accessToken, customerData) {
  try {
    const customerPayload = {
      contact_name: customerData.customer_name,
      company_name: customerData.company_name || '',
      email: customerData.customer_email,
      phone: customerData.phone || ''
    };

    const response = await axios.post(
      `${ZOHO_CONFIG.base_url}/contacts`,
      customerPayload,
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'X-com-zoho-invoice-organizationid': ZOHO_CONFIG.organization_id
        }
      }
    );

    return response.data.contact.contact_id;
  } catch (error) {
    console.error('Error creating Zoho customer:', error);
    // If customer already exists, try to find them
    return await findZohoCustomer(accessToken, customerData.customer_email);
  }
}

async function findZohoCustomer(accessToken, email) {
  try {
    const response = await axios.get(
      `${ZOHO_CONFIG.base_url}/contacts`,
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'X-com-zoho-invoice-organizationid': ZOHO_CONFIG.organization_id
        },
        params: {
          email: email
        }
      }
    );

    if (response.data.contacts && response.data.contacts.length > 0) {
      return response.data.contacts[0].contact_id;
    }
    throw new Error('Customer not found');
  } catch (error) {
    console.error('Error finding Zoho customer:', error);
    throw error;
  }
}

async function createZohoEstimate(accessToken, customerId, quoteData) {
  try {
    const estimatePayload = {
      customer_id: customerId,
      estimate_number: `EST-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      line_items: [
        {
          name: quoteData.service_type,
          description: quoteData.project_details,
          rate: 0, // Will be filled manually after review
          quantity: 1
        }
      ],
      notes: `Budget Range: ${quoteData.budget_range}\nTimeline: ${quoteData.timeline}\nSubmitted: ${quoteData.quote_date}`,
      terms: 'This estimate is valid for 30 days. Final pricing will be provided after project review.'
    };

    const response = await axios.post(
      `${ZOHO_CONFIG.base_url}/estimates`,
      estimatePayload,
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'X-com-zoho-invoice-organizationid': ZOHO_CONFIG.organization_id
        }
      }
    );

    return response.data.estimate;
  } catch (error) {
    console.error('Error creating Zoho estimate:', error);
    throw error;
  }
}

async function sendQuoteEmails(quoteData, estimateNumber) {
  // Email to customer
  const customerEmailOptions = {
    from: 'no-reply@mechinweb.com',
    to: quoteData.customer_email,
    subject: 'Quote Request Received - Mechinweb IT Services',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Thank You for Your Quote Request!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p>Dear ${quoteData.customer_name},</p>
          
          <p>Thank you for requesting a quote for our IT services. We've received your request and will review it carefully.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3B82F6; margin-top: 0;">Quote Details:</h3>
            <p><strong>Service:</strong> ${quoteData.service_type}</p>
            <p><strong>Budget Range:</strong> ${quoteData.budget_range}</p>
            <p><strong>Timeline:</strong> ${quoteData.timeline}</p>
            <p><strong>Estimate Number:</strong> ${estimateNumber}</p>
          </div>
          
          <p><strong>What happens next?</strong></p>
          <ol>
            <li>We'll review your requirements within 24 hours</li>
            <li>Prepare a detailed quote with pricing</li>
            <li>Send you the official estimate via email</li>
            <li>Schedule a call to discuss the project</li>
          </ol>
          
          <p>For urgent matters, feel free to contact us directly:</p>
          <p>📧 Email: contact@mechinweb.com<br>
          
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
    subject: `New Quote Request - ${quoteData.customer_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">New Quote Request Received</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h3>Customer Information:</h3>
          <p><strong>Name:</strong> ${quoteData.customer_name}</p>
          <p><strong>Email:</strong> ${quoteData.customer_email}</p>
          <p><strong>Company:</strong> ${quoteData.company_name || 'Not provided'}</p>
          <p><strong>Phone:</strong> ${quoteData.phone || 'Not provided'}</p>
          
          <h3>Project Details:</h3>
          <p><strong>Service:</strong> ${quoteData.service_type}</p>
          <p><strong>Budget Range:</strong> ${quoteData.budget_range}</p>
          <p><strong>Timeline:</strong> ${quoteData.timeline}</p>
          <p><strong>Estimate Number:</strong> ${estimateNumber}</p>
          
          <h3>Project Description:</h3>
          <p>${quoteData.project_details}</p>
          
          <p><strong>Submitted:</strong> ${new Date(quoteData.quote_date).toLocaleString()}</p>
        </div>
        
        <p><em>Please review and prepare the quote in Zoho Invoice.</em></p>
      </div>
    `
  };

  await Promise.all([
    emailTransporter.sendMail(customerEmailOptions),
    emailTransporter.sendMail(businessEmailOptions)
  ]);
}

// API endpoint handler
async function handleQuoteRequest(req, res) {
  try {
    const quoteData = req.body;
    
    // Get Zoho access token
    const accessToken = await getZohoAccessToken();
    
    // Create or find customer in Zoho
    const customerId = await createZohoCustomer(accessToken, quoteData);
    
    // Create estimate in Zoho
    const estimate = await createZohoEstimate(accessToken, customerId, quoteData);
    
    // Send notification emails
    await sendQuoteEmails(quoteData, estimate.estimate_number);
    
    res.json({
      success: true,
      message: 'Quote request processed successfully',
      estimate_number: estimate.estimate_number
    });
    
  } catch (error) {
    console.error('Error processing quote request:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing quote request',
      error: error.message
    });
  }
}

module.exports = { handleQuoteRequest };
