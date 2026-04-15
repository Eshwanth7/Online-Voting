import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import API from '../api/axios'
import AnimatedPage, { fadeInUp } from '../components/AnimatedPage'

function ResetPassword() {
  const [data, setData] = useState({
    email: '',
    otp: ['', '', '', '', '', ''],
    newPassword: '',
    confirmPassword: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputsRef = useRef([])
  const location = useLocation()
  const navigate = useNavigate()

  // Fix #8: was incorrectly using useState(() => {}, []) — which does nothing.
  // useEffect is the correct hook for running side-effects after mount.
  useEffect(() => {
    if (location.state?.email) {
      setData(prev => ({ ...prev, email: location.state.email }))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[0]
    if (!/^\d*$/.test(value)) return

    const newOtp = [...data.otp]
    newOtp[index] = value
    setData(prev => ({ ...prev, otp: newOtp }))

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !data.otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (data.newPassword !== data.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (data.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    const otpString = data.otp.join('')
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const res = await API.post('/auth/reset-password', {
        email: data.email,
        otp: otpString,
        newPassword: data.newPassword
      })
      setMessage(res.data.message)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed')
    } finally {
      setLoading(false)
    }
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
          <span style={{ fontSize: '3.5rem' }}>🔧</span>
        </motion.div>

        <motion.h1 variants={fadeInUp}>Reset Password</motion.h1>
        <motion.p className="subtitle" variants={fadeInUp}>
          Enter the OTP and your new password
        </motion.p>

        {error && (
          <motion.div className="alert alert-error" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            ⚠️ {error}
          </motion.div>
        )}
        {message && (
          <motion.div className="alert alert-success" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            ✅ {message}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          {!location.state?.email && (
            <motion.div className="form-group" variants={fadeInUp}>
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={data.email}
                onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                required
              />
            </motion.div>
          )}

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>6-Digit OTP</label>
            <div className="otp-inputs" style={{ justifyContent: 'center' }}>
              {data.otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="form-control"
                  style={{ width: '40px', textAlign: 'center', padding: '0.5rem 0' }}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={(el) => (inputsRef.current[index] = el)}
                  required
                />
              ))}
            </div>
          </div>

          <motion.div className="form-group" variants={fadeInUp}>
            <label>New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Min 6 characters"
              value={data.newPassword}
              onChange={(e) => setData(prev => ({ ...prev, newPassword: e.target.value }))}
              required
            />
          </motion.div>

          <motion.div className="form-group" variants={fadeInUp}>
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Confirm new password"
              value={data.confirmPassword}
              onChange={(e) => setData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              required
            />
          </motion.div>

          <motion.button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
            variants={fadeInUp}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Fix #9: was "Reseting" (typo), now "Resetting" */}
            {loading ? '⏳ Resetting...' : 'Reset Password'}
          </motion.button>
        </form>

        <motion.div className="auth-footer" variants={fadeInUp}>
          Remembered your password? <Link to="/login">Back to Login</Link>
        </motion.div>
      </motion.div>
    </AnimatedPage>
  )
}

export default ResetPassword
