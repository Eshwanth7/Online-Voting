import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import API from '../api/axios'
import AnimatedPage, { fadeInUp } from '../components/AnimatedPage'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const res = await API.post('/auth/forgot-password', { email })
      setMessage(res.data.message)
      setTimeout(() => {
        navigate('/reset-password', { state: { email } })
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code')
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
          <span style={{ fontSize: '3.5rem' }}>🔓</span>
        </motion.div>

        <motion.h1 variants={fadeInUp}>Forgot Password</motion.h1>
        <motion.p className="subtitle" variants={fadeInUp}>
          Enter your email to receive a password reset OTP
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
          <motion.div className="form-group" variants={fadeInUp}>
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </motion.div>

          <motion.button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
            variants={fadeInUp}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? '⏳ Sending...' : 'Send Reset Code'}
          </motion.button>
        </form>

        <motion.div className="auth-footer" variants={fadeInUp}>
          Remembered your password? <Link to="/login">Back to Login</Link>
        </motion.div>
      </motion.div>
    </AnimatedPage>
  )
}

export default ForgotPassword
