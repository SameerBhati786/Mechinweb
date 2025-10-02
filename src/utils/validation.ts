import validator from 'validator'

export interface PasswordValidation {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []
  let strength: 'weak' | 'medium' | 'strong' = 'weak'

  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  // Check for number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  // Check for common passwords
  if (validator.isIn(password.toLowerCase(), [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123'
  ])) {
    errors.push('Password is too common, please choose a stronger password')
  }

  // Determine strength
  if (errors.length === 0) {
    if (password.length >= 12 && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      strength = 'strong'
    } else {
      strength = 'medium'
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  }
}

export function validateEmail(email: string): boolean {
  return validator.isEmail(email)
}

export function validatePhone(phone: string): boolean {
  return validator.isMobilePhone(phone, 'any')
}

export function sanitizeInput(input: string): string {
  return validator.escape(input.trim())
}