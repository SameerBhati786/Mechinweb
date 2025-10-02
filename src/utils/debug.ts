// FIXED: Enhanced debug utilities for production troubleshooting with comprehensive error resolution
import { supabase } from '../lib/supabase';
import { ServiceManager } from '../lib/services';
import { PaymentService } from '../lib/payments';
import { ProductionLogger } from '../lib/productionLogger';

export class DebugService {
  private static logger = ProductionLogger.getInstance();

  // Enhanced logging
  private static log(level: 'info' | 'error' | 'warn', message: string, data?: any) {
    this.logger.log(level, `DebugService: ${message}`, data);
  }

  // FIXED: Comprehensive system diagnostic with error resolution
  static async runFullDiagnostic() {
    console.group('🔍 PRODUCTION SYSTEM DIAGNOSTIC');
    this.log('info', 'Starting comprehensive system diagnostic');
    
    const results = {
      timestamp: new Date().toISOString(),
      environment: null as any,
      database: null as any,
      services: null as any,
      zoho: null as any,
      paymentFlow: null as any,
      errors: [] as string[],
      recommendations: [] as string[]
    };
    
    try {
      // Step 1: Environment Check
      this.log('info', 'Checking environment configuration');
      results.environment = await this.checkEnvironment();
      
      // Step 2: Database Connectivity
      this.log('info', 'Testing database connectivity');
      results.database = await this.testDatabaseConnection();
      
      // Step 3: Service System
      this.log('info', 'Testing service resolution system');
      results.services = await this.testServiceSystem();
      
      // Step 4: Zoho Integration
      this.log('info', 'Testing Zoho integration');
      results.zoho = await this.testZohoIntegration();
      
      // Step 5: Payment Flow
      this.log('info', 'Testing payment flow');
      results.paymentFlow = await this.testPaymentFlow();
      
      // Generate recommendations
      results.recommendations = this.generateRecommendations(results);
      
      this.log('info', 'Full diagnostic completed successfully', results);
      
      console.groupEnd();
      return results;
    } catch (error) {
      this.log('error', 'Full diagnostic failed', { error: error.message });
      results.errors.push(error.message);
      console.groupEnd();
      return results;
    }
  }

  // FIXED: Environment configuration check
  private static async checkEnvironment() {
    const env = {
      supabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
      supabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD,
      mode: import.meta.env.MODE,
      baseUrl: import.meta.env.BASE_URL
    };

    const issues = [];
    if (!env.supabaseUrl) issues.push('Missing VITE_SUPABASE_URL');
    if (!env.supabaseKey) issues.push('Missing VITE_SUPABASE_ANON_KEY');

    return { ...env, issues, healthy: issues.length === 0 };
  }

  // FIXED: Enhanced database connection test
  private static async testDatabaseConnection() {
    try {
      this.log('info', 'Testing database connection');
      
      // Test basic connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('services')
        .select('id')
        .limit(1);
      
      if (connectionError) {
        this.log('error', 'Database connection failed', connectionError);
        throw connectionError;
      }
      
      // Test services table
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, name, category, pricing')
        .limit(10);
      
      if (servicesError) {
        this.log('error', 'Services query failed', servicesError);
        throw servicesError;
      }
      
      // Test user authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      const authStatus = {
        isAuthenticated: !!user,
        userId: user?.id,
        email: user?.email,
        emailVerified: !!user?.email_confirmed_at,
        authError: authError?.message
      };
      
      // Test client profile if user exists
      let clientProfile = null;
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('clients')
          .select('id, name, email, email_verified')
          .eq('id', user.id)
          .maybeSingle();
        
        clientProfile = {
          hasProfile: !!profile,
          profileData: profile ? {
            name: profile.name,
            email: profile.email,
            emailVerified: profile.email_verified
          } : null,
          profileError: profileError?.message
        };
      }
      
      this.log('info', 'Database connection test completed', {
        servicesCount: services?.length || 0,
        authStatus,
        clientProfile
      });
      
      return {
        connected: true,
        servicesCount: services?.length || 0,
        services: services?.map(s => ({ id: s.id, name: s.name, category: s.category })) || [],
        authStatus,
        clientProfile,
        healthy: true
      };
    } catch (error) {
      this.log('error', 'Database connection test failed', { error: error.message });
      return {
        connected: false,
        error: error.message,
        healthy: false
      };
    }
  }

  // FIXED: Service system testing with actual database data
  private static async testServiceSystem() {
    try {
      this.log('info', 'Testing service resolution system');
      
      // Get actual service IDs from database
      const { data: actualServices } = await supabase
        .from('services')
        .select('id, name')
        .limit(5);
      
      if (!actualServices || actualServices.length === 0) {
        throw new Error('No services found in database');
      }
      
      const testResults = {};
      
      // Test with actual UUIDs from database
      for (const service of actualServices) {
        try {
          const resolved = await ServiceManager.resolveServiceId(service.id);
          const serviceData = await ServiceManager.getServiceById(service.id);
          
          testResults[service.id] = {
            name: service.name,
            resolved: !!resolved,
            hasData: !!serviceData,
            hasPricing: !!(serviceData?.pricing),
            pricingValid: this.validateServicePricing(serviceData?.pricing),
            status: 'PASS'
          };
        } catch (error) {
          testResults[service.id] = {
            name: service.name,
            error: error.message,
            status: 'FAIL'
          };
        }
      }
      
      // Test service mapping
      const mapping = await ServiceManager.createServiceMapping();
      
      // Test service health
      const healthCheck = await ServiceManager.performHealthCheck();
      
      this.log('info', 'Service system test completed', {
        testResults,
        mappingCount: Object.keys(mapping).length,
        healthCheck
      });
      
      return {
        testResults,
        mapping: Object.keys(mapping),
        healthCheck,
        actualServices: actualServices.map(s => ({ id: s.id, name: s.name })),
        healthy: healthCheck.healthy
      };
    } catch (error) {
      this.log('error', 'Service system test failed', { error: error.message });
      return {
        error: error.message,
        healthy: false
      };
    }
  }

  // NEW: Validate service pricing structure
  private static validateServicePricing(pricing: any): boolean {
    if (!pricing || typeof pricing !== 'object') return false;
    
    // Check if at least basic tier exists with valid price
    if (!pricing.basic || typeof pricing.basic !== 'number' || pricing.basic <= 0) {
      return false;
    }
    
    // Validate other tiers if they exist
    for (const [tier, price] of Object.entries(pricing)) {
      if (typeof price !== 'number' || price < 0) {
        return false;
      }
    }
    
    return true;
  }

  // NEW: Test specific pricing updates
  static async testPricingUpdates() {
    console.group('🔍 PRICING VALIDATION TEST');
    this.log('info', 'Testing pricing updates');
    
    try {
      const expectedPricing = {
        'email-migration': { basic: 4.00 },
        'acronis-setup': { basic: 25.00 },
        'cloud-management': { basic: 25.00, standard: 5.00 },
        'email-deliverability': { basic: 25.00 },
        'per-incident-support': { basic: 20.00 }
      };
      
      const results = {};
      
      for (const [serviceKey, expectedPrices] of Object.entries(expectedPricing)) {
        try {
          const serviceId = await ServiceManager.resolveServiceId(serviceKey);
          if (!serviceId) {
            results[serviceKey] = { status: 'FAIL', error: 'Service not found' };
            continue;
          }
          
          const service = await ServiceManager.getServiceById(serviceId);
          if (!service) {
            results[serviceKey] = { status: 'FAIL', error: 'Service data not found' };
            continue;
          }
          
          const pricingMatches = Object.entries(expectedPrices).every(([tier, expectedPrice]) => {
            const actualPrice = service.pricing?.[tier];
            return Math.abs((actualPrice || 0) - expectedPrice) < 0.01;
          });
          
          results[serviceKey] = {
            status: pricingMatches ? 'PASS' : 'FAIL',
            expected: expectedPrices,
            actual: service.pricing,
            serviceName: service.name
          };
        } catch (error) {
          results[serviceKey] = { status: 'ERROR', error: error.message };
        }
      }
      
      this.log('info', 'Pricing validation completed', results);
      console.groupEnd();
      return results;
    } catch (error) {
      this.log('error', 'Pricing validation failed', { error: error.message });
      console.groupEnd();
      throw error;
    }
  }

  // FIXED: Enhanced Zoho integration testing
  private static async testZohoIntegration() {
    try {
      this.log('info', 'Testing Zoho integration');
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zoho-integration`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      this.log('info', 'Zoho integration test completed', {
        success: result.success,
        status: response.status,
        message: result.message,
        error: result.error
      });
      
      return {
        accessible: response.ok,
        success: result.success,
        message: result.message,
        error: result.error,
        debug: result.debug,
        healthy: result.success
      };
    } catch (error) {
      this.log('error', 'Zoho integration test failed', { error: error.message });
      return {
        accessible: false,
        error: error.message,
        healthy: false
      };
    }
  }

  // FIXED: Complete payment flow testing
  private static async testPaymentFlow() {
    try {
      this.log('info', 'Testing complete payment flow');
      
      // Get actual service from database for testing
      const { data: testService } = await supabase
        .from('services')
        .select('id, name')
        .limit(1)
        .single();
      
      if (!testService) {
        throw new Error('No test service available in database');
      }
      
      const testResults = {
        serviceResolution: false,
        databaseConnection: false,
        zohoIntegration: false,
        currencyConversion: false,
        userAuthentication: false,
        paymentSystemHealth: false
      };
      
      // Test service resolution
      try {
        const resolved = await ServiceManager.resolveServiceId(testService.id);
        testResults.serviceResolution = !!resolved;
      } catch (error) {
        this.log('error', 'Service resolution test failed', error);
      }
      
      // Test database
      try {
        const dbTest = await this.testDatabaseConnection();
        testResults.databaseConnection = dbTest.healthy;
      } catch (error) {
        this.log('error', 'Database test failed', error);
      }
      
      // Test Zoho
      try {
        const zohoTest = await this.testZohoIntegration();
        testResults.zohoIntegration = zohoTest.healthy;
      } catch (error) {
        this.log('error', 'Zoho test failed', error);
      }
      
      // Test currency conversion
      try {
        const { convertCurrency, getPreferredCurrency } = await import('../utils/currency');
        const currency = await getPreferredCurrency();
        const convertedAmount = await convertCurrency(100, 'USD', currency);
        testResults.currencyConversion = convertedAmount > 0;
      } catch (error) {
        this.log('error', 'Currency conversion test failed', error);
      }
      
      // Test user authentication
      try {
        const { data: { user } } = await supabase.auth.getUser();
        testResults.userAuthentication = !!user;
      } catch (error) {
        this.log('error', 'User authentication test failed', error);
      }
      
      // Test payment system health
      try {
        const healthCheck = await PaymentService.performHealthCheck();
        testResults.paymentSystemHealth = healthCheck.healthy;
      } catch (error) {
        this.log('error', 'Payment system health check failed', error);
      }
      
      const allPassed = Object.values(testResults).every(result => result === true);
      
      this.log('info', 'Payment flow test completed', {
        testResults,
        allPassed,
        testServiceUsed: testService
      });
      
      return {
        testResults,
        allPassed,
        testService: testService,
        healthy: allPassed
      };
    } catch (error) {
      this.log('error', 'Payment flow test failed', { error: error.message });
      return {
        error: error.message,
        healthy: false
      };
    }
  }

  // NEW: Generate actionable recommendations
  private static generateRecommendations(results: any): string[] {
    const recommendations = [];
    
    if (!results.environment?.healthy) {
      recommendations.push('Fix environment configuration: Ensure all required environment variables are set');
    }
    
    if (!results.database?.healthy) {
      recommendations.push('Database issues detected: Check Supabase connection and table permissions');
    }
    
    if (!results.services?.healthy) {
      recommendations.push('Service system issues: Verify service data in database and UUID resolution');
    }
    
    if (!results.zoho?.healthy) {
      recommendations.push('Zoho integration issues: Check Zoho credentials and API permissions');
    }
    
    if (!results.paymentFlow?.healthy) {
      recommendations.push('Payment flow issues: Review payment processing logic and error handling');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('System is healthy - all tests passed successfully');
    }
    
    return recommendations;
  }

  // NEW: Production readiness assessment
  static async assessProductionReadiness() {
    console.group('🚀 PRODUCTION READINESS ASSESSMENT');
    
    try {
      const diagnostic = await this.runFullDiagnostic();
      
      const readinessScore = {
        environment: diagnostic.environment?.healthy ? 1 : 0,
        database: diagnostic.database?.healthy ? 1 : 0,
        services: diagnostic.services?.healthy ? 1 : 0,
        zoho: diagnostic.zoho?.healthy ? 1 : 0,
        paymentFlow: diagnostic.paymentFlow?.healthy ? 1 : 0
      };
      
      const totalScore = Object.values(readinessScore).reduce((sum, score) => sum + score, 0);
      const maxScore = Object.keys(readinessScore).length;
      const percentage = Math.round((totalScore / maxScore) * 100);
      
      const isReady = totalScore === maxScore;
      
      this.log('info', 'Production readiness assessment completed', {
        readinessScore,
        totalScore,
        maxScore,
        percentage,
        isReady,
        recommendations: diagnostic.recommendations
      });
      
      console.log(`📊 Production Readiness: ${percentage}% (${totalScore}/${maxScore})`);
      console.log(`🎯 Status: ${isReady ? '✅ READY FOR PRODUCTION' : '❌ NEEDS ATTENTION'}`);
      
      if (!isReady) {
        console.log('🔧 Issues to resolve:');
        diagnostic.recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec}`);
        });
      }
      
      console.groupEnd();
      return { isReady, percentage, diagnostic };
    } catch (error) {
      this.log('error', 'Production readiness assessment failed', error);
      console.groupEnd();
      throw error;
    }
  }

  // NEW: Quick system repair
  static async performSystemRepair() {
    console.group('🔧 SYSTEM REPAIR');
    
    try {
      this.log('info', 'Starting system repair process');
      
      const repairResults = {
        cacheCleared: false,
        servicesReloaded: false,
        mappingRecreated: false,
        healthChecksPerformed: false
      };
      
      // Clear all caches
      ServiceManager.clearCache();
      repairResults.cacheCleared = true;
      this.log('info', 'Caches cleared');
      
      // Reload services
      await ServiceManager.getAllServices();
      repairResults.servicesReloaded = true;
      this.log('info', 'Services reloaded');
      
      // Recreate service mapping
      await ServiceManager.createServiceMapping();
      repairResults.mappingRecreated = true;
      this.log('info', 'Service mapping recreated');
      
      // Perform health checks
      const serviceHealth = await ServiceManager.performHealthCheck();
      const paymentHealth = await PaymentService.performHealthCheck();
      repairResults.healthChecksPerformed = true;
      
      this.log('info', 'System repair completed', {
        repairResults,
        serviceHealth,
        paymentHealth
      });
      
      console.log('✅ System repair completed successfully');
      console.groupEnd();
      
      return {
        success: true,
        repairResults,
        serviceHealth,
        paymentHealth
      };
    } catch (error) {
      this.log('error', 'System repair failed', error);
      console.log('❌ System repair failed:', error.message);
      console.groupEnd();
      throw error;
    }
  }
}

// Global debug functions for browser console
(window as any).debugMechinweb = {
  ...DebugService,
  // Quick access functions
  quickDiagnostic: () => DebugService.runFullDiagnostic(),
  checkProduction: () => DebugService.assessProductionReadiness(),
  repairSystem: () => DebugService.performSystemRepair(),
  
  // Individual test functions
  testServices: () => DebugService.testServiceSystem(),
  testZoho: () => DebugService.testZohoIntegration(),
  testPayments: () => DebugService.testPaymentFlow()
};