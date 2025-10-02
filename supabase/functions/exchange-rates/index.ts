import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.55.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface ExchangeRateResponse {
  rates: { [key: string]: number };
  base: string;
  date: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'get';

    if (action === 'update') {
      // Update exchange rates from external API
      const rates = await updateExchangeRates();
      return new Response(
        JSON.stringify({ success: true, rates }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } else {
      // Get current exchange rates
      const rates = await getCurrentRates();
      return new Response(
        JSON.stringify({ success: true, rates }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

  } catch (error) {
    console.error('Exchange rates error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to process exchange rates',
        fallback_rates: {
          USD: 1,
          INR: 83.25,
          AUD: 1.52,
          EUR: 0.92,
          GBP: 0.79,
          CAD: 1.36
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

async function updateExchangeRates(): Promise<any> {
  try {
    console.log('Fetching latest exchange rates from API...');
    
    // Fetch latest rates from external API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data: ExchangeRateResponse = await response.json();
    
    if (!data.rates) {
      throw new Error('Invalid API response: missing rates');
    }
    
    console.log('API rates received:', data.rates);
    
    // Update rates in database with proper error handling
    const ratesToUpdate = [
      { currency: 'INR', rate: data.rates.INR || 83.25 },
      { currency: 'AUD', rate: data.rates.AUD || 1.52 },
      { currency: 'EUR', rate: data.rates.EUR || 0.92 },
      { currency: 'GBP', rate: data.rates.GBP || 0.79 },
      { currency: 'CAD', rate: data.rates.CAD || 1.36 }
    ];

    for (const rateData of ratesToUpdate) {
      try {
        const { error } = await supabase
          .from('exchange_rates')
          .upsert({
            base_currency: 'USD',
            target_currency: rateData.currency,
            rate: rateData.rate,
            last_updated: new Date().toISOString()
          }, {
            onConflict: 'base_currency,target_currency'
          });

        if (error) {
          console.error(`Error updating ${rateData.currency} rate:`, error);
        } else {
          console.log(`Updated ${rateData.currency} rate: ${rateData.rate}`);
        }
      } catch (updateError) {
        console.error(`Failed to update ${rateData.currency}:`, updateError);
      }
    }

    return {
      USD: 1,
      ...Object.fromEntries(ratesToUpdate.map(r => [r.currency, r.rate]))
    };
  } catch (error) {
    console.error('Error updating exchange rates:', error);
    throw error;
  }
}

async function getCurrentRates(): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('target_currency, rate, last_updated')
      .eq('base_currency', 'USD');

    if (error) {
      console.error('Database query error:', error);
      throw error;
    }

    const rates: { [key: string]: number } = { USD: 1 };
    
    if (data && data.length > 0) {
      data.forEach(rate => {
        rates[rate.target_currency] = rate.rate;
      });
      console.log('Database rates retrieved:', rates);
    } else {
      console.log('No rates found in database, will fetch from API');
      // If no rates in database, fetch from API
      return await updateExchangeRates();
    }

    return rates;
  } catch (error) {
    console.error('Error getting current rates:', error);
    // Return fallback rates with current approximate values
    return {
      USD: 1,
      INR: 83.25,
      AUD: 1.52,
      EUR: 0.92,
      GBP: 0.79,
      CAD: 1.36
    };
  }
}