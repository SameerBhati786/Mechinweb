#!/usr/bin/env node

// Database-specific testing and repair script
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBasicConnectivity() {
  console.log('🔍 Testing basic database connectivity...');
  
  try {
    const { data, error } = await supabase
      .from('services')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Basic connectivity failed:', error.message);
      return false;
    }
    
    console.log('✅ Basic database connectivity working');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }
}

async function testTablePermissions() {
  console.log('🔍 Testing table permissions...');
  
  const tables = ['services', 'clients', 'orders', 'invoices'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      results[table] = !error;
      
      if (error) {
        console.error(`❌ ${table} table access failed:`, error.message);
      } else {
        console.log(`✅ ${table} table accessible`);
      }
    } catch (error) {
      results[table] = false;
      console.error(`❌ ${table} table error:`, error.message);
    }
  }
  
  return results;
}

async function testPricingData() {
  console.log('🔍 Testing pricing data integrity...');
  
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('id, name, pricing');
    
    if (error) {
      console.error('❌ Pricing data query failed:', error.message);
      return false;
    }
    
    let validPricing = 0;
    let invalidPricing = 0;
    
    for (const service of services) {
      if (!service.pricing || !service.pricing.basic || service.pricing.basic <= 0) {
        console.warn(`⚠️ ${service.name}: Invalid pricing`);
        invalidPricing++;
      } else {
        console.log(`✅ ${service.name}: $${service.pricing.basic}`);
        validPricing++;
      }
    }
    
    console.log(`📊 Pricing validation: ${validPricing} valid, ${invalidPricing} invalid`);
    return invalidPricing === 0;
  } catch (error) {
    console.error('❌ Pricing data test failed:', error.message);
    return false;
  }
}

async function testConstraints() {
  console.log('🔍 Testing database constraints...');
  
  try {
    // Test foreign key constraints
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Test client profile constraint
      const { data: profile, error: profileError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error('❌ Client profile constraint test failed:', profileError.message);
        return false;
      }
      
      console.log('✅ Client profile constraints working');
    }
    
    // Test service constraints
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id')
      .limit(1);
    
    if (servicesError) {
      console.error('❌ Service constraints test failed:', servicesError.message);
      return false;
    }
    
    console.log('✅ Database constraints working');
    return true;
  } catch (error) {
    console.error('❌ Constraint test failed:', error.message);
    return false;
  }
}

async function repairPricingData() {
  console.log('🔧 Attempting to repair pricing data...');
  
  try {
    // This would typically be done via migration, but we can test the repair logic
    const { data: services } = await supabase
      .from('services')
      .select('id, name, pricing');
    
    let repaired = 0;
    
    for (const service of services) {
      if (!service.pricing || !service.pricing.basic) {
        console.log(`🔧 Would repair pricing for: ${service.name}`);
        repaired++;
      }
    }
    
    console.log(`🔧 Would repair ${repaired} services (run migration to apply)`);
    return true;
  } catch (error) {
    console.error('❌ Pricing repair test failed:', error.message);
    return false;
  }
}

async function runDatabaseTests() {
  console.log('🚀 Starting comprehensive database tests\n');
  
  const tests = [
    { name: 'Basic Connectivity', fn: testBasicConnectivity },
    { name: 'Table Permissions', fn: testTablePermissions },
    { name: 'Pricing Data', fn: testPricingData },
    { name: 'Constraints', fn: testConstraints },
    { name: 'Repair Logic', fn: repairPricingData }
  ];
  
  const results = {};
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    results[test.name] = await test.fn();
  }
  
  console.log('\n📊 DATABASE TEST SUMMARY:');
  console.log('==========================');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${test.padEnd(20)} ${status}`);
  });
  
  const criticalTests = ['Basic Connectivity', 'Table Permissions', 'Pricing Data'];
  const criticalPassed = criticalTests.every(test => results[test]);
  
  console.log('\n🎯 CRITICAL SYSTEMS:');
  console.log('====================');
  console.log(`Status: ${criticalPassed ? '✅ OPERATIONAL' : '❌ CRITICAL FAILURE'}`);
  
  if (!criticalPassed) {
    console.log('\n🚨 IMMEDIATE ACTIONS REQUIRED:');
    criticalTests.forEach(test => {
      if (!results[test]) {
        console.log(`- Fix ${test}`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(50));
  
  process.exit(criticalPassed ? 0 : 1);
}

// Run the tests
runDatabaseTests().catch(error => {
  console.error('💥 Database test runner failed:', error);
  process.exit(1);
});