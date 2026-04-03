import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import API from '../../api/axios'
import AnimatedPage, { fadeInUp, staggerContainer, scaleIn, cardHover } from '../../components/AnimatedPage'

function AdminDashboard() {
  const [stats, setStats] = useState({ elections: 0, voters: 0, votes: 0 })
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const elRes = await API.get('/elections')
      setElections(elRes.data)
      setStats(prev => ({ ...prev, elections: elRes.data.length }))
    } catch (err) {
      console.error('Failed to fetch admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <motion.div className="spinner" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }} />
      </div>
    )
  }

  const statCards = [
    { value: stats.elections, label: 'Total Elections', icon: '🗳️' },
    {
      value: elections.filter(e => {
        const now = new Date()
        return e.isActive && new Date(e.startDate) <= now && new Date(e.endDate) >= now
      }).length,
      label: 'Active Elections',
      icon: '🟢',
    },
    {
      value: elections.filter(e => new Date(e.endDate) < new Date()).length,
      label: 'Completed',
      icon: '✅',
    },
  ]

  const quickActions = [
    { to: '/admin/elections', icon: '🗳️', title: 'Manage Elections', desc: 'Create, edit, and delete elections' },
    { to: '/admin/voters', icon: '👥', title: 'Manage Voters', desc: 'View and manage registered voters' },
    { to: '/dashboard', icon: '📊', title: 'View as Voter', desc: 'Switch to the voter dashboard' },
  ]

  return (
    <AnimatedPage>
      <motion.div className="page-header" variants={fadeInUp}>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          👑 Admin Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Manage elections, candidates, and voters
        </motion.p>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid-3"
        style={{ marginBottom: '2rem' }}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            className="stat-card"
            variants={scaleIn}
            whileHover={{ y: -4, scale: 1.03, boxShadow: '0 8px 30px rgba(99, 102, 241, 0.15)' }}
          >
            <motion.div
              style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 300 }}
            >
              {stat.icon}
            </motion.div>
            <motion.div
              className="stat-value"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1, type: 'spring' }}
            >
              {stat.value}
            </motion.div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Links */}
      <motion.h2
        style={{ marginBottom: '1rem' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Quick Actions
      </motion.h2>
      <motion.div
        className="grid-3"
        style={{ marginBottom: '2rem' }}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {quickActions.map((action, i) => (
          <motion.div key={i} variants={fadeInUp} {...cardHover}>
            <Link to={action.to} className="glass-card" style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}>
              <motion.div
                style={{ fontSize: '2rem', marginBottom: '0.5rem' }}
                whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
              >
                {action.icon}
              </motion.div>
              <h3>{action.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{action.desc}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Elections */}
      <motion.h2
        style={{ marginBottom: '1rem' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        Recent Elections
      </motion.h2>
      {elections.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div className="empty-icon" animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            📭
          </motion.div>
          <p>No elections created yet</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/admin/elections" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              + Create First Election
            </Link>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          className="table-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {elections.slice(0, 5).map((el, index) => {
                const now = new Date()
                const isOngoing = el.isActive && new Date(el.startDate) <= now && new Date(el.endDate) >= now
                const isEnded = new Date(el.endDate) < now
                return (
                  <motion.tr
                    key={el._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.08 }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  >
                    <td style={{ fontWeight: '500' }}>{el.title}</td>
                    <td>{new Date(el.startDate).toLocaleDateString()}</td>
                    <td>{new Date(el.endDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${isOngoing ? 'badge-active' : isEnded ? 'badge-inactive' : 'badge-pending'}`}>
                        {isOngoing ? 'Active' : isEnded ? 'Ended' : 'Upcoming'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Link to={`/admin/candidates/${el._id}`} className="btn btn-secondary btn-sm">Candidates</Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Link to={`/admin/results/${el._id}`} className="btn btn-secondary btn-sm">Results</Link>
                        </motion.div>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </AnimatedPage>
  )
}

export default AdminDashboard
