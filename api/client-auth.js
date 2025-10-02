// Client Authentication API
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Mock database - in production, use a real database
const clients = [];

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

// Register new client
async function registerClient(req, res) {
  try {
    const { name, email, phone, company, password } = req.body;
    
    // Check if client already exists
    const existingClient = clients.find(client => client.email === email);
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Client already exists with this email'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new client
    const newClient = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      company,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    clients.push(newClient);
    
    // Send welcome email
    await sendWelcomeEmail(newClient);
    
    res.json({
      success: true,
      message: 'Client registered successfully',
      clientId: newClient.id
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
}

// Login client
async function loginClient(req, res) {
  try {
    const { email, password } = req.body;
    
    // Find client
    const client = clients.find(c => c.email === email);
    if (!client) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, client.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { clientId: client.id, email: client.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
}

// Get client profile
async function getClientProfile(req, res) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const client = clients.find(c => c.id === decoded.clientId);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    res.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        createdAt: client.createdAt
      }
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
}

// Send welcome email
async function sendWelcomeEmail(client) {
  const emailOptions = {
    from: 'no-reply@mechinweb.com',
    to: client.email,
    subject: 'Welcome to Mechinweb - Your Account is Ready!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Mechinweb!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p>Dear ${client.name},</p>
          
          <p>Welcome to Mechinweb! Your client account has been successfully created and you can now access our full range of IT services.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3B82F6; margin-top: 0;">Your Account Details:</h3>
            <p><strong>Name:</strong> ${client.name}</p>
            <p><strong>Email:</strong> ${client.email}</p>
            ${client.company ? `<p><strong>Company:</strong> ${client.company}</p>` : ''}
            <p><strong>Account Status:</strong> Active</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3B82F6; margin-top: 0;">What you can do now:</h3>
            <ul>
              <li>Browse and purchase our professional IT services</li>
              <li>Track your orders and service progress</li>
              <li>Download invoices and payment receipts</li>
              <li>Access 24/7 customer support</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_PORTAL_URL || 'https://mechinweb.com/client/dashboard'}" 
               style="background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Access Your Dashboard
            </a>
          </div>
          
          <p>If you have any questions or need assistance, don't hesitate to contact us:</p>
          <p>📧 Email: contact@mechinweb.com<br>
</p>
          
          <p>Best regards,<br>
          The Mechinweb Team</p>
        </div>
      </div>
    `
  };

  await emailTransporter.sendMail(emailOptions);
}

module.exports = {
  registerClient,
  loginClient,
  getClientProfile
};
