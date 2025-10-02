import { corsHeaders } from '../_shared/cors.ts';

interface LocationResponse {
  country_code: string;
  country_name: string;
  currency: string;
  ip: string;
  city?: string;
  region?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('Fetching user location from ipapi.co...');
    
    // Fetch location data from ipapi.co
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mechinweb-Location-Service/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Location API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate and format response
    const locationData: LocationResponse = {
      country_code: data.country_code || 'US',
      country_name: data.country_name || 'United States',
      currency: data.currency || 'USD',
      ip: data.ip || 'unknown',
      city: data.city,
      region: data.region
    };

    console.log('Location detected:', locationData);

    return new Response(
      JSON.stringify({
        success: true,
        data: locationData
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Location detection error:', error);
    
    // Return fallback location data
    const fallbackLocation: LocationResponse = {
      country_code: 'US',
      country_name: 'United States',
      currency: 'USD',
      ip: 'unknown'
    };

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        data: fallbackLocation
      }),
      {
        status: 200, // Return 200 with fallback data instead of error
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});