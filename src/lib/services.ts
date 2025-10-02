// Enhanced Service management utilities with production-ready UUID handling and error resolution
import { supabase } from './supabase';
import { ProductionLogger } from './productionLogger';

export interface ServiceData {
  id: string;
  name: string;
  description: string;
  category: string;
  pricing: {
    basic?: number;
    standard?: number;
    enterprise?: number;
  };
  features: {
    basic?: string[];
    standard?: string[];
    enterprise?: string[];
  };
  created_at: string;
}

export class ServiceManager {
  private static serviceCache: Map<string, ServiceData> = new Map();
  private static serviceMappingCache: { [key: string]: string } | null = null;
  private static logger = ProductionLogger.getInstance();

  // Enhanced logging for production debugging
  private static log(level: 'info' | 'error' | 'warn', message: string, data?: any) {
    this.logger.log(level, `ServiceManager: ${message}`, data);
  }

  // FIXED: Enhanced service resolution with proper UUID validation
  static async resolveServiceId(serviceIdentifier: string): Promise<string | null> {
    try {
      this.log('info', 'Resolving service identifier', { serviceIdentifier });
      
      // Validate UUID format first
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(serviceIdentifier)) {
        this.log('info', 'Identifier is UUID, validating existence');
        
        // Check if UUID exists in database
        const { data, error } = await supabase
          .from('services')
          .select('id, name')
          .eq('id', serviceIdentifier)
          .maybeSingle();

        if (error) {
          this.log('error', 'Database error during UUID validation', { error, serviceIdentifier });
          return null;
        }

        if (data) {
          this.log('info', 'UUID service found', { serviceId: serviceIdentifier, serviceName: data.name });
          return serviceIdentifier;
        } else {
          this.log('error', 'UUID service not found in database', { serviceIdentifier });
          return null;
        }
      }

      // Handle string-based identifiers
      this.log('info', 'Identifier is string, resolving via mapping');
      const mapping = await this.createServiceMapping();
      const resolvedId = mapping[serviceIdentifier];
      
      if (resolvedId) {
        this.log('info', 'Service resolved via mapping', { 
          originalIdentifier: serviceIdentifier, 
          resolvedId 
        });
        return resolvedId;
      }

      this.log('error', 'Service not found in mapping', { 
        serviceIdentifier, 
        availableMappings: Object.keys(mapping) 
      });
      return null;
    } catch (error) {
      this.log('error', 'Error resolving service ID', { serviceIdentifier, error: error.message });
      return null;
    }
  }

  // FIXED: Robust service mapping creation with error handling
  static async createServiceMapping(): Promise<{ [key: string]: string }> {
    try {
      if (this.serviceMappingCache) {
        return this.serviceMappingCache;
      }

      this.log('info', 'Creating service mapping from database');
      const services = await this.getAllServices();
      const mapping: { [key: string]: string } = {};

      services.forEach(service => {
        const name = service.name.toLowerCase();
        
        // Create comprehensive mapping for each service
        if (name.includes('email migration') || name.includes('email setup')) {
          mapping['email-migration'] = service.id;
          mapping['email_migration'] = service.id;
          mapping['email-setup'] = service.id;
        }
        if (name.includes('email deliverability') || name.includes('email security') || name.includes('domain') && name.includes('email')) {
          mapping['email-deliverability'] = service.id;
          mapping['email_security'] = service.id;
          mapping['domain-email-security'] = service.id;
        }
        if (name.includes('ssl') || name.includes('https')) {
          mapping['ssl-setup'] = service.id;
          mapping['ssl_setup'] = service.id;
          mapping['https-setup'] = service.id;
        }
        if (name.includes('cloud suite') || name.includes('cloud management')) {
          mapping['cloud-management'] = service.id;
          mapping['cloud_management'] = service.id;
          mapping['cloud-suite'] = service.id;
        }
        if (name.includes('data migration') || name.includes('cloud data')) {
          mapping['data-migration'] = service.id;
          mapping['data_migration'] = service.id;
          mapping['cloud-data-migration'] = service.id;
        }
        if (name.includes('hosting') || name.includes('control panel')) {
          mapping['hosting-support'] = service.id;
          mapping['hosting_support'] = service.id;
          mapping['control-panel-support'] = service.id;
        }
        if (name.includes('acronis')) {
          mapping['acronis-setup'] = service.id;
          mapping['acronis_setup'] = service.id;
          mapping['acronis-backup'] = service.id;
        }
        if (name.includes('per incident') || name.includes('incident support')) {
          mapping['per-incident-support'] = service.id;
          mapping['per_incident_support'] = service.id;
          mapping['incident-support'] = service.id;
        }
      });

      this.serviceMappingCache = mapping;
      this.log('info', 'Service mapping created successfully', { 
        mappingCount: Object.keys(mapping).length,
        servicesCount: services.length 
      });
      return mapping;
    } catch (error) {
      this.log('error', 'Error creating service mapping', { error: error.message });
      return {};
    }
  }

  // FIXED: Enhanced service retrieval with proper error handling
  static async getServiceById(serviceId: string): Promise<ServiceData | null> {
    try {
      this.log('info', 'Fetching service by ID', { serviceId });
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(serviceId)) {
        this.log('error', 'Invalid UUID format', { serviceId });
        return null;
      }

      // Check cache first
      if (this.serviceCache.has(serviceId)) {
        this.log('info', 'Service found in cache', { serviceId });
        return this.serviceCache.get(serviceId)!;
      }

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .maybeSingle();

      if (error) {
        this.log('error', 'Database error fetching service', { serviceId, error });
        throw error;
      }

      if (!data) {
        this.log('warn', 'Service not found in database', { serviceId });
        return null;
      }

      this.log('info', 'Service found in database', { serviceId, serviceName: data.name });
      
      // Update cache
      this.serviceCache.set(serviceId, data);
      return data;
    } catch (error) {
      this.log('error', 'Error fetching service by ID', { serviceId, error: error.message });
      throw error;
    }
  }

  // FIXED: Enhanced service loading with error recovery
  static async getAllServices(): Promise<ServiceData[]> {
    try {
      this.log('info', 'Fetching all services from database');
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        this.log('error', 'Database error fetching services', error);
        throw error;
      }

      const services = data || [];
      this.log('info', `Loaded ${services.length} services from database`);
      
      // Update cache
      services.forEach(service => {
        this.serviceCache.set(service.id, service);
      });

      // Validate service data integrity
      const validationResults = this.validateServiceData(services);
      if (!validationResults.isValid) {
        this.log('warn', 'Service data validation issues found', validationResults.issues);
      }

      return services;
    } catch (error) {
      this.log('error', 'Error fetching services', { error: error.message });
      throw error;
    }
  }

  // NEW: Service data validation
  static validateServiceData(services: ServiceData[]): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    services.forEach(service => {
      if (!service.id || !service.name) {
        issues.push(`Service missing required fields: ${service.id || 'unknown'}`);
      }
      
      if (!service.pricing || Object.keys(service.pricing).length === 0) {
        issues.push(`Service ${service.name} missing pricing data`);
      }
      
      if (!service.features || Object.keys(service.features).length === 0) {
        issues.push(`Service ${service.name} missing features data`);
      }
    });

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  // NEW: System health check
  static async performHealthCheck(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    try {
      // Test database connectivity
      const { error: dbError } = await supabase
        .from('services')
        .select('id')
        .limit(1);
      
      if (dbError) {
        issues.push(`Database connectivity issue: ${dbError.message}`);
      }

      // Test service resolution
      const services = await this.getAllServices();
      if (services.length === 0) {
        issues.push('No services found in database');
      }

      // Test service mapping
      const mapping = await this.createServiceMapping();
      if (Object.keys(mapping).length === 0) {
        issues.push('Service mapping creation failed');
      }

      this.log('info', 'Service health check completed', {
        servicesCount: services.length,
        mappingCount: Object.keys(mapping).length,
        issuesCount: issues.length
      });

    } catch (error) {
      issues.push(`Health check failed: ${error.message}`);
      this.log('error', 'Service health check failed', { error: error.message });
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  // Clear cache for testing
  static clearCache() {
    this.serviceCache.clear();
    this.serviceMappingCache = null;
    this.log('info', 'Service cache cleared');
  }
}