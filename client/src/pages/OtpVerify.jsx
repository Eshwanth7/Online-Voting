import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import API from '../api/axios'

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
      setSuccess('New OTP sent! Check the server console.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    }
  }

  if (!email) {
    return (
      <div className="auth-container animate-in">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h1>OTP Verification</h1>
          <p className="subtitle">No email provided. Please register first.</p>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>
            Go to Registration
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container animate-in">
      <div className="auth-card">
        <h1>Verify Your Email</h1>
        <p className="subtitle">
          Enter the 6-digit OTP sent to <strong>{email}</strong>
          <br /><small style={{ color: 'var(--text-muted)' }}>(Check the server console for the OTP)</small>
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputsRef.current[index] = el)}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="auth-footer">
          Didn't receive the OTP?{' '}
          <button
            onClick={handleResend}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-light)',
              cursor: 'pointer',
              fontFamily: 'var(--font-family)',
              fontSize: '0.9rem'
            }}
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  )
}

export default OtpVerify
