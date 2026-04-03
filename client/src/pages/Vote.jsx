import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import API from '../api/axios'
import AnimatedPage, { fadeInUp, staggerContainer, cardHover } from '../components/AnimatedPage'

function Vote() {
  const { electionId } = useParams()
  const navigate = useNavigate()
  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    fetchData()
  }, [electionId])

  const fetchData = async () => {
    try {
      const [elRes, canRes, statusRes] = await Promise.all([
        API.get(`/elections/${electionId}`),
        API.get(`/candidates/election/${electionId}`),
        API.get(`/votes/status/${electionId}`)
      ])
      setElection(elRes.data)
      setCandidates(canRes.data)
      setHasVoted(statusRes.data.hasVoted)
    } catch (err) {
      setError('Failed to load election data')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    setSubmitting(true)
    setError('')
    try {
      await API.post('/votes', {
        electionId,
        candidateId: selected
      })
      setSuccess('Your vote has been cast successfully! 🎉')
      setHasVoted(true)
      setShowConfirm(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cast vote')
      setShowConfirm(false)
    } finally {
      setSubmitting(false)
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

  if (hasVoted || success) {
    return (
      <AnimatedPage style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <motion.div
          style={{ fontSize: '5rem', marginBottom: '1rem' }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          ✅
        </motion.div>
        <motion.h1 variants={fadeInUp}>Vote Recorded!</motion.h1>
        <motion.p
          style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem' }}
          variants={fadeInUp}
        >
          {success || 'You have already voted in this election. Thank you for participating!'}
        </motion.p>

        {/* Celebration particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'fixed',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#818cf8', '#34d399'][i % 6],
              pointerEvents: 'none',
            }}
            initial={{
              top: '50%',
              left: '50%',
              opacity: 1,
            }}
            animate={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0,
              scale: [1, 2, 0],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.05,
              ease: 'easeOut',
            }}
          />
        ))}

        <motion.div
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}
          variants={fadeInUp}
        >
          <motion.button
            className="btn btn-primary"
            onClick={() => navigate(`/results/${electionId}`)}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            📊 View Results
          </motion.button>
          <motion.button
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            ← Back to Dashboard
          </motion.button>
        </motion.div>
      </AnimatedPage>
    )
  }

  const selectedCandidate = candidates.find(c => c._id === selected)

  return (
    <AnimatedPage>
      <motion.div className="page-header" variants={fadeInUp}>
        <h1>{election?.title}</h1>
        <p>{election?.description || 'Select your candidate and cast your vote'}</p>
      </motion.div>

      {error && (
        <motion.div
          className="alert alert-error"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          ⚠️ {error}
        </motion.div>
      )}

      <motion.p
        style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}
        variants={fadeInUp}
      >
        Choose your candidate below. Click to select, then confirm your vote.
      </motion.p>

      <motion.div
        className="grid-3"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {candidates.map((candidate, index) => (
          <motion.div
            key={candidate._id}
            className={`candidate-card ${selected === candidate._id ? 'selected' : ''}`}
            onClick={() => setSelected(candidate._id)}
            variants={fadeInUp}
            whileHover={{
              y: -8,
              scale: 1.03,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.98 }}
            animate={selected === candidate._id ? {
              borderColor: '#6366f1',
              boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)',
            } : {}}
          >
            <motion.div
              className="candidate-avatar"
              animate={selected === candidate._id ? {
                scale: [1, 1.1, 1],
                transition: { duration: 0.3 },
              } : {}}
            >
              {candidate.name.charAt(0).toUpperCase()}
            </motion.div>
            <div className="candidate-name">{candidate.name}</div>
            <div className="candidate-party">{candidate.party}</div>
            {candidate.description && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                {candidate.description}
              </p>
            )}
            {selected === candidate._id && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  marginTop: '0.75rem',
                  fontSize: '0.8rem',
                  color: 'var(--accent-light)',
                  fontWeight: 600,
                }}
              >
                ✓ Selected
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {candidates.length === 0 && (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-icon">👤</div>
          <p>No candidates have been added to this election yet</p>
        </motion.div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            style={{ textAlign: 'center', marginTop: '2rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <motion.button
              className="btn btn-primary btn-lg"
              onClick={() => setShowConfirm(true)}
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  '0 4px 15px rgba(99, 102, 241, 0.3)',
                  '0 4px 30px rgba(99, 102, 241, 0.5)',
                  '0 4px 15px rgba(99, 102, 241, 0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🗳️ Cast My Vote
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="modal-overlay"
            onClick={() => setShowConfirm(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="confirm-vote">
                <motion.div
                  style={{ fontSize: '3rem', marginBottom: '0.5rem' }}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  🗳️
                </motion.div>
                <h2>Confirm Your Vote</h2>
                <p style={{ color: 'var(--text-secondary)' }}>You are about to vote for:</p>
                <motion.div
                  className="selected-candidate"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {selectedCandidate?.name}
                </motion.div>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Party: {selectedCandidate?.party}
                </p>
                <motion.p
                  style={{ color: 'var(--warning)', fontSize: '0.9rem', marginTop: '1rem' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  ⚠️ This action cannot be undone. You can only vote once.
                </motion.p>
              </div>
              <div className="modal-actions">
                <motion.button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirm(false)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="btn btn-primary"
                  onClick={handleVote}
                  disabled={submitting}
                  whileHover={!submitting ? { scale: 1.04 } : {}}
                  whileTap={!submitting ? { scale: 0.96 } : {}}
                >
                  {submitting ? '⏳ Submitting...' : '✅ Confirm Vote'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  )
}

export default Vote
