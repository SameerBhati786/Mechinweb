# Mechinweb - IT Services Platform

## Environment Variables Configuration

### Required Environment Variables for Netlify Deployment:

#### Supabase Configuration:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Email Configuration (Zoho SMTP):
```
EMAIL_USER=no-reply@mechinweb.com
EMAIL_PASSWORD=your_zoho_app_password
```

#### Zoho Invoice Integration:
```
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token
ZOHO_ORGANIZATION_ID=your_zoho_organization_id
```

## Email Verification Flow

### How it works:
1. User registers → Email verification page shown
2. User receives verification email from Supabase
3. User clicks verification link → Redirected to login with verified=true
4. User logs in → Dashboard access granted
5. Unverified users cannot access dashboard or make purchases

### Testing Email Verification:
1. Register a new account
2. Check that verification page is shown
3. Check email inbox for verification link
4. Click verification link
5. Login and verify dashboard access

## Payment Processing (Zoho Integration)

### Setup Requirements:
1. Zoho Invoice account with API access
2. OAuth app configured in Zoho Developer Console
3. Refresh token generated for API access
4. Organization ID from Zoho Invoice

### Testing Payment Flow:
1. Login to verified account
2. Navigate to Services → Purchase Service
3. Select package and quantity
4. Click "Proceed to Payment"
5. Should redirect to Zoho payment page

## Debugging Steps

### Testing Netlify Functions

#### Test Email Function:
```bash
# Test email configuration
curl https://your-site.netlify.app/.netlify/functions/testEmail

# Send test email
curl -X POST https://your-site.netlify.app/.netlify/functions/testEmail \
  -H "Content-Type: application/json"
```

#### Test Zoho Integration:
```bash
# Test Zoho configuration
curl https://your-site.netlify.app/.netlify/functions/testZoho
```

#### Test Contact Form:
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/sendEmail \
  -H "Content-Type: application/json" \
  -d '{
    "type": "contact_form",
    "data": {
      "name": "Test User",
      "email": "test@example.com",
      "subject": "Test Message",
      "message": "This is a test message"
    }
  }'
```

### Email Verification Issues:
- Check Supabase Auth settings
- Verify email templates are configured
- Check spam folder for verification emails
- **NEW**: Test email function: `/.netlify/functions/testEmail`
- **NEW**: Check Netlify function logs for detailed error messages

### Payment Processing Issues:
- **NEW**: Test Zoho integration: `/.netlify/functions/testZoho`
- Check Zoho credentials in Netlify environment variables
- Verify Zoho OAuth app permissions
- **NEW**: Check Netlify function logs for detailed error messages
- Test Zoho API connectivity

### Performance Monitoring:
- Use browser dev tools to check bundle sizes
- Monitor Core Web Vitals
- Check for unused dependencies
- Verify image optimization

### Function Debugging:

#### Check Netlify Function Logs:
1. Go to Netlify Dashboard → Functions
2. Click on function name to view logs
3. Look for error messages and debug information

#### Common Issues and Solutions:

**Email Not Sending:**
- Check if EMAIL_USER and EMAIL_PASSWORD are set in Netlify
- Verify Zoho SMTP credentials are correct
- Test with `/.netlify/functions/testEmail`
- Check function logs for authentication errors

**Zoho Payment Failures:**
- Verify all 4 Zoho environment variables are set
- Test Zoho connection with `/.netlify/functions/testZoho`
- Check if refresh token has expired
- Verify organization ID is correct

**Function Timeout Issues:**
- Functions have 10-second timeout on Netlify
- Check for slow API calls
- Implement proper error handling

## Deployment Checklist

### Before Deploying:
- [ ] All environment variables set in Netlify
- [ ] **NEW**: Test email function works
- [ ] **NEW**: Test Zoho integration works
- [ ] Zoho OAuth app configured
- [ ] Email SMTP credentials tested
- [ ] Supabase RLS policies configured
- [ ] Database migrations applied

### After Deploying:
- [ ] Test user registration flow
- [ ] Verify email verification works
- [ ] **NEW**: Test contact form email sending
- [ ] **NEW**: Test Zoho payment creation
- [ ] Test payment processing
- [ ] Check email delivery