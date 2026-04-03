import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import API from '../../api/axios'
import AnimatedPage, { fadeInUp, staggerContainer, scaleIn } from '../../components/AnimatedPage'

function AdminResults() {
  const { electionId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchResults()
  }, [electionId])

  const fetchResults = async () => {
    try {
      const res = await API.get(`/results/${electionId}`)
      setData(res.data)
    } catch (err) {
      setError('Failed to load results')
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

  if (error) {
    return (
      <motion.div className="alert alert-error" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        ⚠️ {error}
      </motion.div>
    )
  }

  const maxVotes = Math.max(...(data?.results?.map(r => r.voteCount) || [1]), 1)
  const winner = data?.results?.[0]

  const statCards = [
    { value: data?.totalVotes || 0, label: 'Total Votes', icon: '🗳️' },
    { value: data?.results?.length || 0, label: 'Candidates', icon: '👥' },
    { value: winner?.name || 'N/A', label: '🏆 Leading Candidate', icon: '', isText: true },
  ]

  return (
    <AnimatedPage>
      <motion.div className="action-row" variants={fadeInUp}>
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            📊 Election Results
          </motion.h1>
          <motion.p
            style={{ color: 'var(--text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {data?.election?.title}
          </motion.p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/admin/elections" className="btn btn-secondary">← Back to Elections</Link>
        </motion.div>
      </motion.div>

      {/* Summary Cards */}
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
            {stat.icon && (
              <motion.div
                style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 300 }}
              >
                {stat.icon}
              </motion.div>
            )}
            <motion.div
              className="stat-value"
              style={stat.isText ? { fontSize: '1.5rem' } : {}}
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

      {/* Results */}
      {data?.results?.length === 0 ? (
        <motion.div className="empty-state" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.div className="empty-icon" animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            📊
          </motion.div>
          <p>No votes have been cast yet</p>
        </motion.div>
      ) : (
        <>
          <motion.h2
            style={{ marginBottom: '1rem' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Detailed Results
          </motion.h2>
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {data?.results?.map((candidate, index) => (
              <motion.div
                key={candidate.candidateId}
                className="result-item"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.12, duration: 0.5 }}
              >
                <div className="result-header">
                  <div>
                    <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>#{index + 1}</span>
                    <span className="result-name">
                      {index === 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: 1 }}
                        >
                          🏆{' '}
                        </motion.span>
                      )}
                      {candidate.name}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                      ({candidate.party})
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className="result-votes">{candidate.voteCount} votes</span>
                    <motion.span
                      className="result-percentage"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.12, type: 'spring' }}
                    >
                      {candidate.percentage}%
                    </motion.span>
                  </div>
                </div>
                <div className="progress-bar-container">
                  <motion.div
                    className="progress-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${(candidate.voteCount / maxVotes) * 100}%` }}
                    transition={{ delay: 1 + index * 0.15, duration: 1, ease: 'easeOut' }}
                    style={{
                      background: index === 0
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : index === 1
                          ? 'linear-gradient(90deg, #6366f1, #818cf8)'
                          : 'linear-gradient(90deg, #64748b, #94a3b8)'
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </AnimatedPage>
  )
}

export default AdminResults
