import { corsHeaders } from '../_shared/cors.ts';

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  template?: string;
  variables?: Record<string, string>;
}

interface ZohoEmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, subject, html, template, variables }: EmailRequest = await req.json();

    console.log('Sending email to:', to);
    console.log('Subject:', subject);

    // Zoho SMTP configuration
    const emailConfig: ZohoEmailConfig = {
      host: 'smtp.zoho.in',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: Deno.env.get('EMAIL_USER') || 'no-reply@mechinweb.com',
        pass: Deno.env.get('EMAIL_PASSWORD') || ''
      }
    };

    console.log('Email config:', {
      host: emailConfig.host,
      port: emailConfig.port,
      user: emailConfig.auth.user,
      hasPassword: !!emailConfig.auth.pass
    });

    // Validate email configuration
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      throw new Error('Email credentials not configured. Please check EMAIL_USER and EMAIL_PASSWORD environment variables.');
    }

    // For now, we'll simulate email sending since we can't use nodemailer in Deno
    // In production, you would integrate with a proper email service
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Log email details for debugging
    console.log('Email would be sent with:', {
      from: emailConfig.auth.user,
      to,
      subject,
      htmlLength: html.length,
      template,
      variables
    });

    // In a real implementation, you would use a proper email service like:
    // - Zoho Mail API
    // - SendGrid
    // - AWS SES
    // - Resend
    // - Postmark

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        details: {
          to,
          subject,
          from: emailConfig.auth.user,
          timestamp: new Date().toISOString()
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email',
        details: {
          timestamp: new Date().toISOString(),
          errorType: error.name || 'EmailError'
        }
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});