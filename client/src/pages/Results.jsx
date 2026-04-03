import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import API from '../api/axios'
import AnimatedPage, { fadeInUp, staggerContainer } from '../components/AnimatedPage'

function Results() {
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
        <motion.div
          className="spinner"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' }}
        />
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        className="alert alert-error"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        ⚠️ {error}
      </motion.div>
    )
  }

  const maxVotes = Math.max(...(data?.results?.map(r => r.voteCount) || [1]), 1)

  return (
    <AnimatedPage>
      <motion.div className="page-header" variants={fadeInUp}>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          📊 {data?.election?.title} — Results
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Total Votes Cast: <strong>{data?.totalVotes || 0}</strong>
          {' | '}
          Status: <motion.span
            className={`badge ${data?.election?.isActive ? 'badge-active' : 'badge-inactive'}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.4 }}
          >
            {data?.election?.isActive ? 'Active' : 'Closed'}
          </motion.span>
        </motion.p>
      </motion.div>

      {data?.results?.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="empty-icon"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📊
          </motion.div>
          <p>No votes have been cast yet</p>
        </motion.div>
      ) : (
        <motion.div
          className="glass-card"
          style={{ maxWidth: '700px' }}
          variants={fadeInUp}
        >
          {data?.results?.map((candidate, index) => (
            <motion.div
              key={candidate.candidateId}
              className="result-item"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.12, duration: 0.5 }}
            >
              <div className="result-header">
                <div>
                  <span className="result-name">
                    {index === 0 && (
                      <motion.span
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', delay: 0.6 }}
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
                    transition={{ delay: 0.5 + index * 0.12, type: 'spring' }}
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
                  transition={{ delay: 0.5 + index * 0.15, duration: 1, ease: 'easeOut' }}
                  style={{
                    background: index === 0
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : 'linear-gradient(90deg, var(--accent), var(--accent-light))'
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div
        style={{ marginTop: '2rem' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Link to="/dashboard" className="btn btn-secondary">← Back to Dashboard</Link>
        </motion.div>
      </motion.div>
    </AnimatedPage>
  )
}

export default Results
