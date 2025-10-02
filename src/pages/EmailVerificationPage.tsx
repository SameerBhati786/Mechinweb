import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function EmailVerificationPage() {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [checkingVerification, setCheckingVerification] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  const email = location.state?.email || ''
  const userData = location.state?.userData || {}
  const emailSent = location.state?.emailSent || false

  useEffect(() => {
    // Check if user is already verified
    const checkVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email_confirmed_at) {
        setIsVerified(true)
        // Create client profile if it doesn't exist
        await createClientProfile(user, userData)
        setTimeout(() => {
          navigate('/thank-you?type=registration&email=' + encodeURIComponent(email) + '&name=' + encodeURIComponent(userData.name || ''))
        }, 2000)
      }
    }

    checkVerification()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        setIsVerified(true)
        await createClientProfile(session.user, userData)
        setTimeout(() => {
          navigate('/thank-you?type=registration&email=' + encodeURIComponent(email) + '&name=' + encodeURIComponent(userData.name || ''))
        }, 2000)
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate, userData, email])

  const createClientProfile = async (user: any, userData: any) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('clients')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!existingProfile) {
        const { error } = await supabase
          .from('clients')
          .insert({
            id: user.id,
            name: userData.name || user.user_metadata?.name || 'User',
            email: user.email,
            phone: userData.phone || null,
            company: userData.company || null,
            email_verified: true,
            email_verified_at: new Date().toISOString()
          })

        if (error) {
          console.error('Error creating client profile:', error)
        }
      } else {
        // Update verification status
        await supabase
          .from('clients')
          .update({
            email_verified: true,
            email_verified_at: new Date().toISOString()
          })
          .eq('id', user.id)
      }
    } catch (error) {
      console.error('Error handling client profile:', error)
    }
  }

  const handleResendEmail = async () => {
    if (!email) {
      setResendMessage('Email address not found. Please register again.')
      return
    }

    setIsResending(true)
    setResendMessage('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/client/login?verified=true`
        }
      })

      if (error) {
        setResendMessage('Failed to resend verification email. Please try again.')
      } else {
        setResendMessage('Verification email sent! Please check your inbox.')
      }
    } catch (error) {
      setResendMessage('An error occurred. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const handleCheckVerification = async () => {
    setCheckingVerification(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email_confirmed_at) {
        setIsVerified(true)
        await createClientProfile(user, userData)
        navigate('/thank-you?type=registration&email=' + encodeURIComponent(email) + '&name=' + encodeURIComponent(userData.name || ''))
      } else {
        setResendMessage('Email not yet verified. Please check your inbox and click the verification link.')
      }
    } catch (error) {
      setResendMessage('Error checking verification status.')
    } finally {
      setCheckingVerification(false)
    }
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Email Verified!
          </h1>
          <p className="text-gray-600 mb-6">
            Your email has been successfully verified. Redirecting you to complete your registration...
          </p>
          <div className="flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mr-2" />
            <span className="text-blue-600">Redirecting...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      {/* Back to Home */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          to="/"
          className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Verify Your Email
              </h1>
              <p className="text-gray-400">
                We've sent a verification link to:
              </p>
              <p className="font-semibold text-cyan-400 mt-2">
                {email}
              </p>
              {emailSent && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-sm">✓ Verification email sent successfully!</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">Check your email inbox</p>
                    <p>We've sent you a verification email with instructions. Click the verification link in the email to activate your account.</p>
                    <p className="mt-2 text-blue-200">Note: Check your spam/junk folder if you don't see the email.</p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <button
                  onClick={handleCheckVerification}
                  disabled={checkingVerification}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingVerification ? (
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Checking...</span>
                    </div>
                  ) : (
                    'I\'ve Verified My Email'
                  )}
                </button>
                
                <p className="text-sm text-gray-400 mb-4">
                  Didn't receive the email? Check your spam folder or request a new one.
                </p>
                
                <button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Email
                    </>
                  )}
                </button>
                
                {resendMessage && (
                  <p className={`mt-3 text-sm ${resendMessage.includes('sent') ? 'text-green-400' : 'text-red-400'}`}>
                    {resendMessage}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-700">
                <Link
                  to="/client/login"
                  className="w-full text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors block"
                >
                  Already verified? Sign in here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}