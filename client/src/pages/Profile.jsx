import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import AnimatedPage, { fadeInUp } from '../components/AnimatedPage'

function Profile() {
  const { user } = useAuth()

  const profileFields = [
    { label: 'Email', value: user?.email, icon: '📧' },
    { label: 'Phone', value: user?.phone, icon: '📱' },
    { label: 'Voter ID', value: user?.voterId, icon: '🪪' },
    { label: 'Verification Status', value: null, icon: '✅', badge: true },
  ]

  return (
    <AnimatedPage>
      <motion.div className="page-header" variants={fadeInUp}>
        <h1>My Profile</h1>
        <p>Your account information</p>
      </motion.div>

      <motion.div
        className="glass-card"
        style={{ maxWidth: '500px' }}
        variants={fadeInUp}
      >
        {/* Avatar & Name */}
        <motion.div
          style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: '700',
              color: 'white'
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
            whileHover={{
              scale: 1.1,
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)',
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </motion.div>
          <div>
            <motion.h2
              style={{ marginBottom: '0.25rem' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {user?.name}
            </motion.h2>
            <motion.span
              className={`badge ${user?.role === 'admin' ? 'badge-pending' : 'badge-active'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.4 }}
            >
              {user?.role === 'admin' ? '👑 Admin' : '🗳️ Voter'}
            </motion.span>
          </div>
        </motion.div>

        {/* Profile Fields */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {profileFields.map((field, i) => (
            <motion.div
              key={field.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border)',
              }}
              whileHover={{
                borderColor: 'var(--border-hover)',
                background: 'var(--bg-glass-hover)',
                x: 4,
                transition: { duration: 0.2 },
              }}
            >
              <div style={{
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                marginBottom: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}>
                <span>{field.icon}</span>
                {field.label}
              </div>
              {field.badge ? (
                <motion.span
                  className="badge badge-active"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.7 }}
                >
                  ✅ Verified
                </motion.span>
              ) : (
                <div style={{ fontWeight: '500' }}>{field.value}</div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatedPage>
  )
}

export default Profile
