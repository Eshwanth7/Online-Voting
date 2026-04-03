import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import AnimatedPage, { fadeInUp, buttonInteraction } from '../components/AnimatedPage'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(email, password)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (data?.needsVerification) {
        navigate('/verify-otp', { state: { email: data.email } })
        return
      }
      setError(data?.message || 'Login failed')
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
          <span style={{ fontSize: '3rem' }}>🔐</span>
        </motion.div>

        <motion.h1 variants={fadeInUp}>Welcome Back</motion.h1>
        <motion.p className="subtitle" variants={fadeInUp}>
          Login to access your voting dashboard
        </motion.p>

        {error && (
          <motion.div
            className="alert alert-error"
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <motion.div className="form-group" variants={fadeInUp}>
            <label htmlFor="login-email">Email Address</label>
            <motion.input
              type="email"
              id="login-email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              whileFocus={{ borderColor: '#6366f1', boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.3)' }}
            />
          </motion.div>

          <motion.div className="form-group" variants={fadeInUp}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ marginBottom: 0 }} htmlFor="login-password">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent-light)' }}>
                Forgot password?
              </Link>
            </div>
            <motion.input
              type="password"
              id="login-password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              whileFocus={{ borderColor: '#6366f1', boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.3)' }}
            />
          </motion.div>

          <motion.button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
            variants={fadeInUp}
            whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                ⏳ Logging in...
              </motion.span>
            ) : (
              '🚀 Login'
            )}
          </motion.button>
        </form>

        <motion.div className="auth-footer" variants={fadeInUp}>
          Don't have an account? <Link to="/register">Register here</Link>
        </motion.div>
      </motion.div>
    </AnimatedPage>
  )
}

export default Login
