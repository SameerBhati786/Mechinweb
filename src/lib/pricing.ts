import { getExchangeRate, convertCurrency, getPreferredCurrency } from '../utils/currency';

export interface PricingTier {
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

export interface ServicePricing {
  id: string;
  name: string;
  description: string;
  tiers: {
    basic: PricingTier;
    standard?: PricingTier;
    enterprise?: PricingTier;
  };
}

// UPDATED PRICING CONFIGURATION - Restored to specified rates
export const servicePricing: Record<string, ServicePricing> = {
  'email-migration': {
    id: 'email-migration',
    name: 'Email Migration & Setup',
    description: 'Per mailbox migration with zero downtime',
    tiers: {
      basic: {
        name: 'Per Mailbox',
        price: 4.00, // FIXED: Restored to $4.00 per mailbox
        features: [
          'Complete mailbox migration',
          'Email backup included',
          'Zero downtime migration',
          'Basic support'
        ]
      }
    }
  },
  'per-incident-support': {
    id: 'per-incident-support',
    name: 'Per Incident Support',
    description: 'Quick resolution for specific IT issues across all platforms',
    tiers: {
      basic: {
        name: 'Per Incident',
        price: 20, // Maintained at $20.00
        features: [
          'Expert troubleshooting',
          'Quick issue resolution',
          '7-day follow-up support',
          'Documentation provided'
        ]
      }
    }
  },
  'email-deliverability': {
    id: 'email-deliverability',
    name: 'Email Deliverability',
    description: 'Complete DNS and email authentication setup',
    tiers: {
      basic: {
        name: 'Complete Setup',
        price: 25, // Maintained at $25.00
        features: [
          'SPF, DKIM, DMARC setup',
          'DNS configuration',
          'Deliverability optimization',
          'Email support'
        ]
      }
    }
  },
  'ssl-setup': {
    id: 'ssl-setup',
    name: 'SSL & HTTPS Setup',
    description: 'Professional SSL certificate installation and management',
    tiers: {
      basic: {
        name: 'Free SSL (Let\'s Encrypt)',
        price: 7, // Maintained at $7.00
        features: [
          'Free SSL certificate',
          'Installation & configuration',
          'Auto-renewal setup',
          'Basic support'
        ]
      },
      standard: {
        name: 'Paid SSL (Single Domain)',
        price: 10, // Maintained at $10.00
        features: [
          'Client-provided SSL certificate',
          'Professional installation',
          'Configuration & testing',
          'Priority support'
        ]
      },
      enterprise: {
        name: 'Paid SSL (Multi-Domain)',
        price: 25, // Maintained at $25.00
        features: [
          'Up to 5 domains',
          'Client-provided SSL certificate',
          'Complete configuration',
          'Advanced support'
        ]
      }
    }
  },
  'ssl-procurement': {
    id: 'ssl-procurement',
    name: 'SSL Certificate Procurement',
    description: 'SSL certificate purchase and installation service',
    tiers: {
      basic: {
        name: 'Single Domain',
        price: 15, // Maintained at $15.00
        features: [
          'Certificate procurement',
          'Installation & configuration',
          'From trusted CAs',
          'Complete setup'
        ]
      },
      standard: {
        name: 'Multi-Domain',
        price: 30, // Maintained at $30.00
        features: [
          'Up to 5 domains',
          'Certificate procurement',
          'Professional installation',
          'Priority support'
        ]
      },
      enterprise: {
        name: 'Wildcard Certificate',
        price: 55, // Maintained at $55.00
        features: [
          'Wildcard certificate',
          'Unlimited subdomains',
          'Premium CA selection',
          'Advanced support'
        ]
      }
    }
  },
  'cloud-management': {
    id: 'cloud-management',
    name: 'Cloud Suite Management',
    description: 'Expert administration of Google Workspace and Microsoft 365',
    tiers: {
      basic: {
        name: 'One-time Setup',
        price: 25.00, // FIXED: Restored to $25.00
        features: [
          'Initial setup & configuration',
          'User account creation',
          'Basic troubleshooting',
          'Documentation provided'
        ]
      },
      standard: {
        name: 'Per Incident Support',
        price: 5, // Maintained at $5.00
        features: [
          'Additional troubleshooting',
          'Configuration changes',
          'User support',
          'Quick resolution'
        ]
      }
    }
  },
  'data-migration': {
    id: 'data-migration',
    name: 'Cloud Data Migration',
    description: 'Per user migration between cloud platforms',
    tiers: {
      basic: {
        name: 'Per User Migration',
        price: 5, // Maintained at $5.00
        features: [
          'Microsoft Teams chat migration',
          'SharePoint site migration',
          'OneDrive migration',
          'Google Drive migration'
        ]
      }
    }
  },
  'hosting-support': {
    id: 'hosting-support',
    name: 'Hosting & Control Panel Support',
    description: 'Professional hosting management and optimization',
    tiers: {
      basic: {
        name: 'Basic',
        price: 15, // Maintained at $15.00
        features: [
          'Basic troubleshooting',
          'Performance optimization',
          'Email support',
          'Monthly check-up'
        ]
      },
      standard: {
        name: 'Standard',
        price: 25, // Maintained at $25.00
        features: [
          'Everything in Basic',
          'Priority support',
          'Security hardening',
          'Weekly monitoring',
          'Backup management'
        ],
        popular: true
      },
      enterprise: {
        name: 'Enterprise',
        price: 55, // Maintained at $55.00
        features: [
          'Everything in Standard',
          '24/7 monitoring',
          'Dedicated support',
          'Custom configurations',
          'Emergency response'
        ]
      }
    }
  },
  'acronis-setup': {
    id: 'acronis-setup',
    name: 'Acronis Account Setup (Data Backup & Recovery)',
    description: 'One-time Acronis backup solution setup and configuration',
    tiers: {
      basic: {
        name: 'Complete Setup',
        price: 25.00, // FIXED: Restored to $25.00
        features: [
          'Acronis account creation',
          'Complete configuration',
          'Multi-device setup',
          'Training and support'
        ]
      }
    }
  }
};

export class PricingService {
  static async getLocalizedPrice(
    serviceId: string,
    tier: string,
    currency?: string
  ): Promise<{ amount: number; currency: string }> {
    const service = servicePricing[serviceId];
    if (!service || !service.tiers[tier as keyof typeof service.tiers]) {
      throw new Error('Invalid service or tier');
    }

    const usdPrice = service.tiers[tier as keyof typeof service.tiers].price;
    const targetCurrency = currency || await getPreferredCurrency();

    if (targetCurrency === 'USD') {
      return { amount: usdPrice, currency: 'USD' };
    }

    const convertedAmount = await convertCurrency(usdPrice, 'USD', targetCurrency);
    return { amount: convertedAmount, currency: targetCurrency };
  }

  static async getLocalizedPricing(serviceId: string, currency?: string): Promise<ServicePricing & { localizedTiers: any }> {
    const service = servicePricing[serviceId];
    if (!service) {
      throw new Error('Service not found');
    }

    const targetCurrency = currency || await getPreferredCurrency();
    const localizedTiers: any = {};

    // Convert all tier prices to target currency
    for (const [tierKey, tier] of Object.entries(service.tiers)) {
      const convertedPrice = await convertCurrency(tier.price, 'USD', targetCurrency);
      localizedTiers[tierKey] = {
        ...tier,
        price: convertedPrice,
        originalPrice: tier.price,
        currency: targetCurrency
      };
    }

    return {
      ...service,
      localizedTiers
    };
  }

  static getAllServices(): ServicePricing[] {
    return Object.values(servicePricing);
  }

  static getService(serviceId: string): ServicePricing | null {
    return servicePricing[serviceId] || null;
  }

  static async getAllLocalizedServices(currency?: string): Promise<Array<ServicePricing & { localizedTiers: any }>> {
    const services = this.getAllServices();
    const localizedServices = await Promise.all(
      services.map(service => this.getLocalizedPricing(service.id, currency))
    );
    return localizedServices;
  }

  // Update user currency preference
  static async updateUserCurrencyPreference(currency: string, autoDetect: boolean = false): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferred_currency: currency,
          auto_detect_currency: autoDetect,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating currency preference:', error);
    }
  }

  // Validate pricing consistency across system
  static validatePricingConsistency(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for required services
    const requiredServices = ['email-migration', 'acronis-setup', 'cloud-management'];
    for (const serviceId of requiredServices) {
      if (!servicePricing[serviceId]) {
        issues.push(`Missing required service: ${serviceId}`);
      }
    }

    // Validate pricing structure
    for (const [serviceId, service] of Object.entries(servicePricing)) {
      if (!service.tiers.basic) {
        issues.push(`Service ${serviceId} missing basic tier`);
      }
      
      if (service.tiers.basic.price <= 0) {
        issues.push(`Service ${serviceId} has invalid basic price: ${service.tiers.basic.price}`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}