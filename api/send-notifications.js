// Unified notification handler for both quote requests and contact forms
// This file should be deployed to your backend server (Node.js/Express)

const { handleQuoteRequest } = require('./create-quote');
const { handleContactForm } = require('./contact');

async function handleNotifications(req, res) {
  try {
    const { type, customer_email, business_email, data } = req.body;
    
    if (type === 'quote_request') {
      // Handle quote request notifications
      await handleQuoteRequest({ body: data }, res);
    } else if (type === 'contact_form') {
      // Handle contact form notifications
      await handleContactForm({ body: data }, res);
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid notification type'
      });
    }
    
  } catch (error) {
    console.error('Error handling notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing notification',
      error: error.message
    });
  }
}

module.exports = { handleNotifications };