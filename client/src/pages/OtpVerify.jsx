import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import API from '../api/axios'
import AnimatedPage, { fadeInUp } from '../components/AnimatedPage'

function OtpVerify() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const inputsRef = useRef([])
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const handleChange = (index, value) => {
    if (value.length > 1) value = value[0]
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const res = await API.post('/auth/verify-otp', { email, otp: otpString })
      setSuccess(res.data.message)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setSuccess('')
    try {
      await API.post('/auth/resend-otp', { email })
      setSuccess('New OTP sent! Check your email inbox.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    }
  }

  if (!email) {
    return (
      <AnimatedPage className="auth-container">
        <motion.div className="auth-card" style={{ textAlign: 'center' }} variants={fadeInUp}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          >
            <span style={{ fontSize: '3rem' }}>📧</span>
          </motion.div>
          <h1>OTP Verification</h1>
          <p className="subtitle">No email provided. Please register first.</p>
          <motion.button
            className="btn btn-primary"
            onClick={() => navigate('/register')}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            Go to Registration
          </motion.button>
        </motion.div>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage className="auth-container">
      <motion.div className="auth-card" variants={fadeInUp}>
        <motion.div
          style={{ textAlign: 'center', marginBottom: '0.5rem' }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <span style={{ fontSize: '3rem' }}>📧</span>
        </motion.div>

        <motion.h1 variants={fadeInUp}>Verify Your Email</motion.h1>
        <motion.p className="subtitle" variants={fadeInUp}>
          Enter the 6-digit OTP sent to <strong>{email}</strong>
          <br /><small style={{ color: 'var(--text-muted)' }}>(Don't forget to check your spam folder)</small>
        </motion.p>

        {error && (
          <motion.div
            className="alert alert-error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            className="alert alert-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <motion.input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputsRef.current[index] = el)}
                autoFocus={index === 0}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.08, type: 'spring', stiffness: 300 }}
                whileFocus={{
                  borderColor: '#6366f1',
                  boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.3)',
                  scale: 1.1,
                }}
              />
            ))}
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
            variants={fadeInUp}
            whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading ? '⏳ Verifying...' : '✅ Verify OTP'}
          </motion.button>
        </form>

        <motion.div
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Didn't receive the OTP?{' '}
          <motion.button
            onClick={handleResend}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-light)',
              cursor: 'pointer',
              fontFamily: 'var(--font-family)',
              fontSize: '0.9rem'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Resend OTP
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatedPage>
  )
}

export default OtpVerify
