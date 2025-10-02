// Enhanced currency conversion utilities with real-time exchange rates
import { supabase } from '../lib/supabase'

const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD'
const LOCATION_API_FALLBACK = 'https://ipapi.co/json/'

interface ExchangeRates {
  [key: string]: number
}

interface LocationData {
  country_code: string
  country_name: string
  currency: string
}

let cachedRates: { rates: ExchangeRates; timestamp: number } | null = null
let cachedLocation: { location: LocationData; timestamp: number } | null = null
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes for exchange rates
const LOCATION_CACHE_DURATION = 60 * 60 * 1000 // 1 hour for location

// Currency mapping based on country codes
const COUNTRY_CURRENCY_MAP: { [key: string]: string } = {
  'US': 'USD',
  'IN': 'INR', 
  'AU': 'AUD',
  'GB': 'GBP',
  'CA': 'CAD',
  'DE': 'EUR',
  'FR': 'EUR',
  'IT': 'EUR',
  'ES': 'EUR',
  'NL': 'EUR',
  'AT': 'EUR',
  'BE': 'EUR',
  'FI': 'EUR',
  'IE': 'EUR',
  'PT': 'EUR',
  'SG': 'USD',
  'HK': 'USD',
  'AE': 'USD',
  'JP': 'JPY',
  'KR': 'KRW',
  'CN': 'CNY',
  'BR': 'BRL',
  'MX': 'MXN',
  'AR': 'ARS',
  'CL': 'CLP',
  'CO': 'COP',
  'PE': 'PEN',
  'ZA': 'ZAR',
  'NG': 'NGN',
  'EG': 'EGP',
  'MA': 'MAD',
  'KE': 'KES',
  'GH': 'GHS',
  'TH': 'THB',
  'VN': 'VND',
  'ID': 'IDR',
  'MY': 'MYR',
  'PH': 'PHP',
  'BD': 'BDT',
  'PK': 'PKR',
  'LK': 'LKR',
  'NP': 'NPR',
  'RU': 'RUB',
  'UA': 'UAH',
  'PL': 'PLN',
  'CZ': 'CZK',
  'HU': 'HUF',
  'RO': 'RON',
  'BG': 'BGN',
  'HR': 'HRK',
  'RS': 'RSD',
  'TR': 'TRY',
  'IL': 'ILS',
  'SA': 'SAR',
  'QA': 'QAR',
  'KW': 'KWD',
  'BH': 'BHD',
  'OM': 'OMR',
  'JO': 'JOD',
  'LB': 'LBP',
  'NO': 'NOK',
  'SE': 'SEK',
  'DK': 'DKK',
  'CH': 'CHF',
  'IS': 'ISK',
  'NZ': 'NZD'
}

// Fallback exchange rates (updated with realistic current rates)
const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  INR: 83.25,
  AUD: 1.52,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  JPY: 149.50,
  KRW: 1340.00,
  CNY: 7.25,
  BRL: 5.15,
  MXN: 17.80,
  ZAR: 18.50,
  THB: 35.20,
  SGD: 1.35,
  HKD: 7.80,
  CHF: 0.88,
  SEK: 10.85,
  NOK: 10.95,
  DKK: 6.85,
  PLN: 4.05,
  CZK: 23.50,
  HUF: 365.00,
  TRY: 32.50,
  ILS: 3.65,
  SAR: 3.75,
  AED: 3.67,
  QAR: 3.64,
  KWD: 0.31,
  BHD: 0.38,
  OMR: 0.38,
  JOD: 0.71,
  NZD: 1.65,
  RUB: 92.50,
  UAH: 41.20,
  EGP: 48.50,
  NGN: 1580.00,
  KES: 129.00,
  GHS: 15.80,
  MAD: 9.85,
  VND: 24500.00,
  IDR: 15800.00,
  MYR: 4.65,
  PHP: 56.50,
  BDT: 119.50,
  PKR: 278.00,
  LKR: 295.00,
  NPR: 133.20
}

export async function detectUserLocation(): Promise<LocationData> {
  // Check cache first
  if (cachedLocation && Date.now() - cachedLocation.timestamp < LOCATION_CACHE_DURATION) {
    console.log('Using cached location:', cachedLocation.location)
    return cachedLocation.location
  }

  try {
    console.log('Detecting user location via Supabase function...')
    
    // Use Supabase Edge Function to detect location (bypasses CORS issues)
    const { data, error } = await supabase.functions.invoke('detect-location')
    
    if (error) {
      throw new Error(`Location detection failed: ${error.message}`)
    }
    
    const locationResponse = data.data
    
    const location: LocationData = {
      country_code: locationResponse.country_code || 'US',
      country_name: locationResponse.country_name || 'United States',
      currency: COUNTRY_CURRENCY_MAP[locationResponse.country_code] || locationResponse.currency || 'USD'
    }
    
    // Cache the location
    cachedLocation = { location, timestamp: Date.now() }
    console.log('Location detected via proxy:', location)
    return location
  } catch (error) {
    console.error('Error detecting location:', error)
    // Fallback to US
    const fallbackLocation = {
      country_code: 'US',
      country_name: 'United States', 
      currency: 'USD'
    }
    cachedLocation = { location: fallbackLocation, timestamp: Date.now() }
    return fallbackLocation
  }
}

export async function getAllExchangeRates(): Promise<ExchangeRates> {
  // Check cache first
  if (cachedRates && Date.now() - cachedRates.timestamp < CACHE_DURATION) {
    // console.log('Using cached exchange rates:', cachedRates.rates)
    return cachedRates.rates
  }

  try {
    // console.log('Fetching fresh exchange rates via Supabase function...')
    
    // Use Supabase Edge Function to get exchange rates (bypasses CORS)
    const { data, error } = await supabase.functions.invoke('exchange-rates')
    
    if (error) {
      throw new Error(`Exchange rates function failed: ${error.message}`)
    }
    
    if (data && data.rates) {
      const rates = data.rates
      // Cache the rates
      cachedRates = { rates, timestamp: Date.now() }
      // console.log('Fresh exchange rates cached:', rates)
      return rates
    } else {
      throw new Error('Invalid response format from exchange rates function')
    }
  } catch (error) {
    console.error('Error fetching exchange rates from function:', error)
    
    // Use fallback rates
    // console.log('Using fallback exchange rates:', FALLBACK_RATES)
    cachedRates = { rates: FALLBACK_RATES, timestamp: Date.now() }
    return FALLBACK_RATES
  }
}

export async function getPreferredCurrency(): Promise<string> {
  try {
    // First check if user has a saved preference
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('preferred_currency, auto_detect_currency')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (preferences && !preferences.auto_detect_currency) {
        // console.log('Using saved user preference:', preferences.preferred_currency)
        return preferences.preferred_currency || 'USD'
      }
    }
    
    // Auto-detect based on location
    const location = await detectUserLocation()
    const detectedCurrency = COUNTRY_CURRENCY_MAP[location.country_code] || location.currency || 'USD'
    // console.log('Auto-detected currency:', detectedCurrency, 'for country:', location.country_code)
    
    // Save detected preference for logged-in users (only if client profile exists)
    if (user) {
      try {
        // Check if client profile exists first
        const { data: clientExists } = await supabase
          .from('clients')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()
        
        if (clientExists) {
          await supabase
            .from('user_preferences')
            .upsert({
              user_id: user.id,
              preferred_currency: detectedCurrency,
              country_code: location.country_code,
              auto_detect_currency: true,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            })
        }
      } catch (prefError) {
        // Failed to save user preference
      }
    }
    
    return detectedCurrency
  } catch (error) {
    return 'USD'
  }
}

export async function getExchangeRate(targetCurrency: string): Promise<number> {
  if (targetCurrency === 'USD') return 1
  
  try {
    const rates = await getAllExchangeRates()
    const rate = rates[targetCurrency]
    
    if (!rate || rate <= 0) {
      console.warn(`Invalid rate for ${targetCurrency}, using fallback`)
      return FALLBACK_RATES[targetCurrency] || 1
    }
    
    console.log(`Exchange rate USD to ${targetCurrency}:`, rate)
    return rate
  } catch (error) {
    console.error(`Error getting exchange rate for ${targetCurrency}:`, error)
    return FALLBACK_RATES[targetCurrency] || 1
  }
}

export async function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
  if (fromCurrency === toCurrency) return amount
  
  try {
    const rates = await getAllExchangeRates()
    
    // Convert to USD first if needed
    let usdAmount = amount
    if (fromCurrency !== 'USD') {
      const fromRate = rates[fromCurrency]
      if (!fromRate || fromRate <= 0) {
        throw new Error(`Invalid exchange rate for ${fromCurrency}`)
      }
      usdAmount = amount / fromRate
    }
    
    // Convert from USD to target currency
    if (toCurrency === 'USD') {
      const result = parseFloat(usdAmount.toFixed(2))
      return result
    }
    
    const targetRate = rates[toCurrency]
    if (!targetRate || targetRate <= 0) {
      throw new Error(`Invalid exchange rate for ${toCurrency}`)
    }
    
    const result = parseFloat((usdAmount * targetRate).toFixed(2))
    return result
  } catch (error) {
    
    // Use fallback rates
    const fallbackFromRate = FALLBACK_RATES[fromCurrency] || 1
    const fallbackToRate = FALLBACK_RATES[toCurrency] || 1
    
    let usdAmount = amount
    if (fromCurrency !== 'USD') {
      usdAmount = amount / fallbackFromRate
    }
    
    const result = toCurrency === 'USD' ? usdAmount : usdAmount * fallbackToRate
    return parseFloat(result.toFixed(2))
  }
}

export function formatCurrency(amount: number, currency: string): string {
  const currencyConfig = {
    'USD': { locale: 'en-US', currency: 'USD' },
    'INR': { locale: 'en-IN', currency: 'INR' },
    'AUD': { locale: 'en-AU', currency: 'AUD' },
    'EUR': { locale: 'de-DE', currency: 'EUR' },
    'GBP': { locale: 'en-GB', currency: 'GBP' },
    'CAD': { locale: 'en-CA', currency: 'CAD' },
    'JPY': { locale: 'ja-JP', currency: 'JPY' },
    'KRW': { locale: 'ko-KR', currency: 'KRW' },
    'CNY': { locale: 'zh-CN', currency: 'CNY' },
    'BRL': { locale: 'pt-BR', currency: 'BRL' },
    'MXN': { locale: 'es-MX', currency: 'MXN' },
    'ZAR': { locale: 'en-ZA', currency: 'ZAR' },
    'THB': { locale: 'th-TH', currency: 'THB' },
    'SGD': { locale: 'en-SG', currency: 'SGD' },
    'HKD': { locale: 'en-HK', currency: 'HKD' },
    'CHF': { locale: 'de-CH', currency: 'CHF' },
    'SEK': { locale: 'sv-SE', currency: 'SEK' },
    'NOK': { locale: 'nb-NO', currency: 'NOK' },
    'DKK': { locale: 'da-DK', currency: 'DKK' },
    'PLN': { locale: 'pl-PL', currency: 'PLN' },
    'CZK': { locale: 'cs-CZ', currency: 'CZK' },
    'HUF': { locale: 'hu-HU', currency: 'HUF' },
    'TRY': { locale: 'tr-TR', currency: 'TRY' },
    'ILS': { locale: 'he-IL', currency: 'ILS' },
    'SAR': { locale: 'ar-SA', currency: 'SAR' },
    'AED': { locale: 'ar-AE', currency: 'AED' },
    'NZD': { locale: 'en-NZ', currency: 'NZD' },
    'RUB': { locale: 'ru-RU', currency: 'RUB' }
  }
  
  const config = currencyConfig[currency as keyof typeof currencyConfig] || currencyConfig.USD
  
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2
    }).format(amount)
  } catch (error) {
    return `${getCurrencySymbol(currency)}${amount.toFixed(currency === 'JPY' || currency === 'KRW' ? 0 : 2)}`
  }
}

export function getCurrencySymbol(currency: string): string {
  const symbols = {
    'USD': '$',
    'INR': '₹', 
    'AUD': 'A$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'JPY': '¥',
    'KRW': '₩',
    'CNY': '¥',
    'BRL': 'R$',
    'MXN': '$',
    'ZAR': 'R',
    'THB': '฿',
    'SGD': 'S$',
    'HKD': 'HK$',
    'CHF': 'CHF',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'TRY': '₺',
    'ILS': '₪',
    'SAR': 'ر.س',
    'AED': 'د.إ',
    'NZD': 'NZ$',
    'RUB': '₽'
  }
  return symbols[currency as keyof typeof symbols] || '$'
}

export function validateCurrency(currency: string): boolean {
  return Object.keys(FALLBACK_RATES).includes(currency)
}

// Force refresh exchange rates
export async function refreshExchangeRates(): Promise<ExchangeRates> {
  cachedRates = null // Clear cache
  return await getAllExchangeRates()
}

// Get rate age for debugging
export function getRateAge(): number | null {
  return cachedRates ? Date.now() - cachedRates.timestamp : null
}

// Legacy functions for backward compatibility
export async function getUSDToINRRate(): Promise<number> {
  return await getExchangeRate('INR')
}

export async function convertUSDToINR(usdAmount: number): Promise<number> {
  return await convertCurrency(usdAmount, 'USD', 'INR')
}