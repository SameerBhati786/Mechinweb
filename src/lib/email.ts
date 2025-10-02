// Email service for sending templated emails
import { supabase } from './supabase';

export interface EmailTemplate {
  id: string;
  template_name: string;
  subject: string;
  html_content: string;
  variables: Record<string, string>;
}

export class EmailService {
  static async getTemplate(templateName: string): Promise<EmailTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('template_name', templateName)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching email template:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting email template:', error);
      return null;
    }
  }

  static async sendTemplatedEmail(
    templateName: string,
    to: string,
    variables: Record<string, string>
  ): Promise<boolean> {
    try {
      const template = await this.getTemplate(templateName);
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      // Replace variables in template
      let htmlContent = template.html_content;
      let subject = template.subject;

      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
      });

      // Send email via API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to,
          subject,
          html: htmlContent
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending templated email:', error);
      return false;
    }
  }

  static async sendWelcomeEmail(clientName: string, clientEmail: string): Promise<boolean> {
    return await this.sendTemplatedEmail('welcome_email', clientEmail, {
      client_name: clientName,
      client_email: clientEmail,
      login_url: `${window.location.origin}/client/login`,
      client_area_url: `${window.location.origin}/client/dashboard`
    });
  }

  static async sendVerificationEmail(clientName: string, clientEmail: string, verificationUrl: string): Promise<boolean> {
    return await this.sendTemplatedEmail('email_verification', clientEmail, {
      client_name: clientName,
      verification_url: verificationUrl
    });
  }

  static async sendPaymentConfirmationEmail(
    clientName: string,
    clientEmail: string,
    serviceName: string,
    packageType: string,
    orderId: string,
    amount: number
  ): Promise<boolean> {
    return await this.sendTemplatedEmail('payment_confirmation', clientEmail, {
      client_name: clientName,
      service_name: serviceName,
      package_type: packageType,
      order_id: orderId,
      amount: amount.toString(),
      payment_date: new Date().toLocaleDateString(),
      dashboard_url: `${window.location.origin}/client/dashboard`,
      invoice_url: `${window.location.origin}/client/invoices`
    });
  }
}