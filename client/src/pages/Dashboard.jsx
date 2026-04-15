import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import AnimatedPage, { fadeInUp, staggerContainer, cardHover, scaleIn } from '../components/AnimatedPage'

function Dashboard() {
  const { user } = useAuth()
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [votedMap, setVotedMap] = useState({})

  const isOngoing = (el) => {
    const now = new Date()
    return el.isActive && new Date(el.startDate) <= now && new Date(el.endDate) >= now
  }

  const isUpcoming = (el) => {
    return el.isActive && new Date(el.startDate) > new Date()
  }

  const isEnded = (el) => {
    return new Date(el.endDate) < new Date()
  }

  const getStatus = (el) => {
    if (isOngoing(el)) return { label: 'Active', class: 'badge-active' }
    if (isUpcoming(el)) return { label: 'Upcoming', class: 'badge-pending' }
    return { label: 'Ended', class: 'badge-inactive' }
  }

  // Fix #12: fetch vote statuses in parallel with Promise.all instead of a sequential for-loop.
  // Fix #20: useCallback ensures fetchElections is stable — won't cause infinite loops in useEffect.
  const fetchElections = useCallback(async () => {
    try {
      const res = await API.get('/elections')
      const electionList = res.data
      setElections(electionList)

      // Fetch all vote statuses in parallel — much faster than sequential loop
      const statusResults = await Promise.all(
        electionList.map(el =>
          API.get(`/votes/status/${el._id}`)
            .then(r => ({ id: el._id, hasVoted: r.data.hasVoted }))
            .catch(() => ({ id: el._id, hasVoted: false }))
        )
      )

      const statusMap = {}
      statusResults.forEach(({ id, hasVoted }) => {
        statusMap[id] = hasVoted
      })
      setVotedMap(statusMap)
    } catch (err) {
      console.error('Failed to fetch elections:', err)
    } finally {
      setLoading(false)
    }
  }, []) // no deps — only runs once

  useEffect(() => {
    fetchElections()
  }, [fetchElections])

  if (loading) {
    return (
      <div className="loading-container">
        <motion.div
          className="spinner"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        />
      </div>
    )
  }

  const statCards = [
    { value: elections.length, label: 'Total Elections', icon: '🗳️' },
    { value: elections.filter(isOngoing).length, label: 'Active Now', icon: '🟢' },
    { value: Object.values(votedMap).filter(Boolean).length, label: 'Votes Cast', icon: '✅' },
    { value: elections.filter(e => isOngoing(e) && !votedMap[e._id]).length, label: 'Pending Votes', icon: '⏳' },
  ]

  return (
    <AnimatedPage>
      <motion.div className="page-header" variants={fadeInUp}>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome, {user?.name} 👋
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Your voting dashboard — view elections and cast your vote
        </motion.p>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid-4"
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
            whileHover={{
              y: -4,
              scale: 1.03,
              boxShadow: '0 8px 30px rgba(99, 102, 241, 0.15)',
              transition: { duration: 0.2 },
            }}
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

      {/* Elections List */}
      <motion.h2
        style={{ marginBottom: '1rem' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Elections
      </motion.h2>

      {elections.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="empty-icon"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📭
          </motion.div>
          <p>No elections available at the moment</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid-2"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {elections.map((el, index) => {
            const status = getStatus(el)
            const hasVoted = votedMap[el._id]
            return (
              <motion.div
                key={el._id}
                className="glass-card"
                variants={fadeInUp}
                {...cardHover}
                layout
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', flex: 1 }}>{el.title}</h3>
                  <motion.span
                    className={`badge ${status.class}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05, type: 'spring' }}
                  >
                    {status.label}
                  </motion.span>
                </div>
                {el.description && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    {el.description}
                  </p>
                )}
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  📅 {new Date(el.startDate).toLocaleDateString()} — {new Date(el.endDate).toLocaleDateString()}
                </div>
                <motion.div
                  style={{ display: 'flex', gap: '0.5rem' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                >
                  {isOngoing(el) && !hasVoted && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link to={`/vote/${el._id}`} className="btn btn-primary btn-sm">
                        🗳️ Vote Now
                      </Link>
                    </motion.div>
                  )}
                  {hasVoted && (
                    <motion.span
                      className="badge badge-active"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      ✅ Voted
                    </motion.span>
                  )}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to={`/results/${el._id}`} className="btn btn-secondary btn-sm">
                      📊 Results
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </AnimatedPage>
  )
}

export default Dashboard
