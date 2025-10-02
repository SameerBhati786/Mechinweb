// Enhanced Zoho test function with detailed diagnostics
const axios = require('axios');

exports.handler = async (event, context) => {
  console.log('Enhanced Zoho test function invoked');
  
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Check Zoho environment variables
    const zohoConfig = {
      clientId: process.env.ZOHO_CLIENT_ID,
      clientSecret: process.env.ZOHO_CLIENT_SECRET,
      refreshToken: process.env.ZOHO_REFRESH_TOKEN,
      organizationId: process.env.ZOHO_ORGANIZATION_ID
    };

    const envCheck = {
      ZOHO_CLIENT_ID: !!zohoConfig.clientId,
      ZOHO_CLIENT_SECRET: !!zohoConfig.clientSecret,
      ZOHO_REFRESH_TOKEN: !!zohoConfig.refreshToken,
      ZOHO_ORGANIZATION_ID: !!zohoConfig.organizationId,
      CLIENT_ID_LENGTH: zohoConfig.clientId?.length || 0,
      REFRESH_TOKEN_LENGTH: zohoConfig.refreshToken?.length || 0,
      ORG_ID_VALUE: zohoConfig.organizationId
    };

    console.log('Zoho environment check:', envCheck);

    // Check for missing credentials
    const missing = [];
    if (!zohoConfig.clientId) missing.push('ZOHO_CLIENT_ID');
    if (!zohoConfig.clientSecret) missing.push('ZOHO_CLIENT_SECRET');
    if (!zohoConfig.refreshToken) missing.push('ZOHO_REFRESH_TOKEN');
    if (!zohoConfig.organizationId) missing.push('ZOHO_ORGANIZATION_ID');

    if (missing.length > 0) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: `Missing Zoho configuration: ${missing.join(', ')}`,
          debug: envCheck
        })
      };
    }

    // Test Zoho API connection step by step
    console.log('Step 1: Testing Zoho token refresh...');
    
    const tokenResponse = await axios.post('https://accounts.zoho.in/oauth/v2/token', 
      new URLSearchParams({
        refresh_token: zohoConfig.refreshToken,
        client_id: zohoConfig.clientId,
        client_secret: zohoConfig.clientSecret,
        grant_type: 'refresh_token'
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      }
    );

    console.log('Token response:', {
      status: tokenResponse.status,
      tokenType: tokenResponse.data.token_type,
      expiresIn: tokenResponse.data.expires_in,
      scope: tokenResponse.data.scope
    });

    const accessToken = tokenResponse.data.access_token;
    
    if (!accessToken) {
      throw new Error('No access token received');
    }

    console.log('Step 2: Testing organization access...');
    
    // Test organization access first
    try {
      const orgResponse = await axios.get('https://invoice.zoho.in/api/v3/organizations', {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      console.log('Organizations response:', {
        status: orgResponse.status,
        organizationsCount: orgResponse.data.organizations?.length || 0,
        organizations: orgResponse.data.organizations?.map(org => ({
          id: org.organization_id,
          name: org.name,
          status: org.status
        })) || []
      });

      // Check if provided org ID exists
      const organizations = orgResponse.data.organizations || [];
      const targetOrg = organizations.find(org => org.organization_id === zohoConfig.organizationId);
      
      if (!targetOrg) {
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            error: `Organization ID ${zohoConfig.organizationId} not found`,
            availableOrganizations: organizations.map(org => ({
              id: org.organization_id,
              name: org.name,
              status: org.status
            })),
            recommendation: `Please update ZOHO_ORGANIZATION_ID to one of the available organization IDs`,
            debug: envCheck
          })
        };
      }

      console.log('Step 3: Testing contacts API with organization...');
      
      // Test contacts API with organization
      const contactsResponse = await axios.get('https://invoice.zoho.in/api/v3/contacts', {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'X-com-zoho-invoice-organizationid': zohoConfig.organizationId,
          'Content-Type': 'application/json'
        },
        params: {
          per_page: 1
        },
        timeout: 15000
      });

      console.log('Contacts API test successful:', {
        status: contactsResponse.status,
        contactsCount: contactsResponse.data.contacts?.length || 0
      });

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          message: 'Zoho configuration is working correctly',
          timestamp: new Date().toISOString(),
          organizationInfo: {
            id: targetOrg.organization_id,
            name: targetOrg.name,
            status: targetOrg.status
          },
          debug: {
            ...envCheck,
            tokenObtained: true,
            organizationValidated: true,
            apiCallSuccessful: true,
            contactsAccessible: true
          }
        })
      };

    } catch (orgError) {
      console.log('Organization API failed, testing direct contacts access...');
      
      // If organization API fails, try direct contacts access
      try {
        const directContactsResponse = await axios.get('https://invoice.zoho.in/api/v3/contacts', {
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'X-com-zoho-invoice-organizationid': zohoConfig.organizationId,
            'Content-Type': 'application/json'
          },
          params: {
            per_page: 1
          },
          timeout: 15000
        });

        console.log('Direct contacts API successful:', {
          status: directContactsResponse.status,
          contactsCount: directContactsResponse.data.contacts?.length || 0
        });

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            message: 'Zoho configuration working (organization API not accessible but contacts API works)',
            timestamp: new Date().toISOString(),
            debug: {
              ...envCheck,
              tokenObtained: true,
              organizationApiAccessible: false,
              contactsApiAccessible: true,
              organizationId: zohoConfig.organizationId
            }
          })
        };

      } catch (contactsError) {
        console.error('Both organization and contacts API failed:', contactsError);
        
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            error: 'Zoho API access failed',
            details: {
              organizationError: orgError.response?.data || orgError.message,
              contactsError: contactsError.response?.data || contactsError.message,
              organizationId: zohoConfig.organizationId,
              possibleCauses: [
                'Invalid organization ID',
                'Insufficient API permissions',
                'Expired refresh token',
                'Account access restrictions'
              ]
            },
            debug: {
              ...envCheck,
              tokenObtained: true,
              organizationApiAccessible: false,
              contactsApiAccessible: false
            }
          })
        };
      }
    }

  } catch (error) {
    console.error('Zoho test failed:', error);
    
    let errorMessage = error.message;
    let errorType = 'unknown';
    
    if (error.response) {
      errorType = 'api_error';
      errorMessage = `API Error ${error.response.status}: ${error.response.data?.error || error.response.statusText}`;
      
      if (error.response.status === 400) {
        errorMessage = 'Invalid Zoho credentials. Please check your ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN.';
      } else if (error.response.status === 401) {
        errorMessage = 'Zoho refresh token expired or invalid. Please regenerate your refresh token.';
      } else if (error.response.status === 403) {
        errorMessage = 'Access denied. Please check your ZOHO_ORGANIZATION_ID and API permissions.';
      }
    } else if (error.code === 'ECONNABORTED') {
      errorType = 'timeout';
      errorMessage = 'Request timeout. Zoho API might be slow or unreachable.';
    } else if (error.code === 'ENOTFOUND') {
      errorType = 'network';
      errorMessage = 'Network error. Cannot reach Zoho servers.';
    }
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        errorType,
        timestamp: new Date().toISOString(),
        debug: {
          ZOHO_CLIENT_ID: !!process.env.ZOHO_CLIENT_ID,
          ZOHO_CLIENT_SECRET: !!process.env.ZOHO_CLIENT_SECRET,
          ZOHO_REFRESH_TOKEN: !!process.env.ZOHO_REFRESH_TOKEN,
          ZOHO_ORGANIZATION_ID: !!process.env.ZOHO_ORGANIZATION_ID,
          organizationIdValue: process.env.ZOHO_ORGANIZATION_ID,
          errorDetails: error.response?.data || error.message
        }
      })
    };
  }
};