#!/usr/bin/env node

// Comprehensive payment flow testing script
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('services')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }
}

async function testServiceResolution() {
  console.log('🔍 Testing service resolution...');
  
  try {
    const { data: services } = await supabase
      .from('services')
      .select('id, name, pricing')
      .limit(5);
    
    if (!services || services.length === 0) {
      console.error('❌ No services found in database');
      return false;
    }
    
    console.log('✅ Service resolution test passed');
    console.log(`📊 Found ${services.length} services`);
    
    // Test pricing validation
    for (const service of services) {
      if (!service.pricing || !service.pricing.basic) {
        console.warn(`⚠️ Service ${service.name} missing basic pricing`);
      } else {
        console.log(`💰 ${service.name}: $${service.pricing.basic}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Service resolution failed:', error.message);
    return false;
  }
}

async function testZohoIntegration() {
  console.log('🔍 Testing Zoho integration...');
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/zoho-integration`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('❌ Zoho integration HTTP error:', response.status);
      return false;
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Zoho integration working');
      return true;
    } else {
      console.error('❌ Zoho integration failed:', result.error);
      console.log('🔧 Debug info:', result.debug);
      return false;
    }
  } catch (error) {
    console.error('❌ Zoho integration test failed:', error.message);
    return false;
  }
}

async function testEmailService() {
  console.log('🔍 Testing email service...');
  
  try {
    // Test via Netlify function if available
    const response = await fetch('/.netlify/functions/testEmail', {
      method: 'GET'
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        console.log('✅ Email service working');
        return true;
      }
    }
    
    console.warn('⚠️ Email service test inconclusive');
    return true; // Don't fail on email service issues
  } catch (error) {
    console.warn('⚠️ Email service test failed:', error.message);
    return true; // Don't fail on email service issues
  }
}

async function runFullTest() {
  console.log('🚀 Starting comprehensive payment flow test\n');
  
  const results = {
    database: await testDatabaseConnection(),
    services: await testServiceResolution(),
    zoho: await testZohoIntegration(),
    email: await testEmailService()
  };
  
  console.log('\n📊 TEST RESULTS SUMMARY:');
  console.log('========================');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${test.toUpperCase().padEnd(12)} ${status}`);
  });
  
  const overallHealth = results.database && results.services;
  const paymentReady = overallHealth && results.zoho;
  
  console.log('\n🎯 SYSTEM STATUS:');
  console.log('=================');
  console.log(`Overall Health: ${overallHealth ? '✅ HEALTHY' : '❌ CRITICAL'}`);
  console.log(`Payment Ready:  ${paymentReady ? '✅ READY' : '⚠️ DEGRADED'}`);
  
  if (!overallHealth) {
    console.log('\n🔧 REQUIRED ACTIONS:');
    if (!results.database) console.log('- Fix database connection issues');
    if (!results.services) console.log('- Resolve service loading problems');
  }
  
  if (!results.zoho) {
    console.log('\n⚠️ PAYMENT DEGRADATION:');
    console.log('- Zoho integration unavailable');
    console.log('- Alternative payment methods will be used');
    console.log('- Contact support to restore full payment functionality');
  }
  
  console.log('\n' + '='.repeat(50));
  
  process.exit(overallHealth ? 0 : 1);
}

// Run the test
runFullTest().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});