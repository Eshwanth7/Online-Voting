import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import AnimatedPage, { fadeInUp, buttonInteraction } from '../components/AnimatedPage'

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    voterId: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const { confirmPassword, ...userData } = formData
      const result = await register(userData)
      navigate('/verify-otp', { state: { email: formData.email } })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const formFields = [
    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
    { id: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your email' },
    { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'Enter your phone number' },
    { id: 'voterId', label: 'Voter ID', type: 'text', placeholder: 'Enter your Voter ID' },
    { id: 'password', label: 'Password', type: 'password', placeholder: 'Create a password (min 6 characters)' },
    { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Confirm your password' },
  ]

  return (
    <AnimatedPage className="auth-container">
      <motion.div className="auth-card" variants={fadeInUp}>
        <motion.div
          style={{ textAlign: 'center', marginBottom: '0.5rem' }}
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <span style={{ fontSize: '3rem' }}>📝</span>
        </motion.div>

        <motion.h1 variants={fadeInUp}>Create Account</motion.h1>
        <motion.p className="subtitle" variants={fadeInUp}>
          Register to start voting securely
        </motion.p>

        {error && (
          <motion.div
            className="alert alert-error"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          {formFields.map((field, index) => (
            <motion.div
              key={field.id}
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.06, duration: 0.4 }}
            >
              <label htmlFor={field.id}>{field.label}</label>
              <motion.input
                type={field.type}
                id={field.id}
                name={field.id}
                className="form-control"
                placeholder={field.placeholder}
                value={formData[field.id]}
                onChange={handleChange}
                required
                whileFocus={{ borderColor: '#6366f1', boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.3)' }}
              />
            </motion.div>
          ))}

          <motion.button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading ? '⏳ Creating Account...' : '🚀 Register'}
          </motion.button>
        </form>

        <motion.div
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Already have an account? <Link to="/login">Login here</Link>
        </motion.div>
      </motion.div>
    </AnimatedPage>
  )
}

export default Register
