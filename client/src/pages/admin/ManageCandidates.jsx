import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import API from '../../api/axios'
import AnimatedPage, { fadeInUp, staggerContainer, cardHover } from '../../components/AnimatedPage'

function ManageCandidates() {
  const { electionId } = useParams()
  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    party: '',
    description: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [electionId])

  const fetchData = async () => {
    try {
      const [elRes, canRes] = await Promise.all([
        API.get(`/elections/${electionId}`),
        API.get(`/candidates/election/${electionId}`)
      ])
      setElection(elRes.data)
      setCandidates(canRes.data)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({ name: '', party: '', description: '' })
    setError('')
    setShowModal(true)
  }

  const openEdit = (candidate) => {
    setEditingId(candidate._id)
    setFormData({
      name: candidate.name,
      party: candidate.party || '',
      description: candidate.description || ''
    })
    setError('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (editingId) {
        await API.put(`/candidates/${editingId}`, formData)
      } else {
        await API.post('/candidates', { ...formData, election: electionId })
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save candidate')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return
    try {
      await API.delete(`/candidates/${id}`)
      fetchData()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <motion.div className="spinner" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }} />
      </div>
    )
  }

  return (
    <AnimatedPage>
      <motion.div className="action-row" variants={fadeInUp}>
        <div>
          <h1>Manage Candidates</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Election: <strong>{election?.title}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/admin/elections" className="btn btn-secondary">← Back</Link>
          </motion.div>
          <motion.button
            className="btn btn-primary"
            onClick={openCreate}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            + Add Candidate
          </motion.button>
        </div>
      </motion.div>

      {candidates.length === 0 ? (
        <motion.div className="empty-state" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.div className="empty-icon" animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            👤
          </motion.div>
          <p>No candidates added yet</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {candidates.map((candidate, index) => (
            <motion.div
              key={candidate._id}
              className="glass-card"
              style={{ textAlign: 'center' }}
              variants={fadeInUp}
              {...cardHover}
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
                  margin: '0 auto 1rem',
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  color: 'white'
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2 + index * 0.08, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}
              >
                {candidate.name.charAt(0).toUpperCase()}
              </motion.div>
              <h3>{candidate.name}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{candidate.party}</p>
              {candidate.description && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {candidate.description}
                </p>
              )}
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Votes: <strong style={{ color: 'var(--accent-light)' }}>{candidate.voteCount}</strong>
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <motion.button className="btn btn-secondary btn-sm" onClick={() => openEdit(candidate)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  Edit
                </motion.button>
                <motion.button className="btn btn-danger btn-sm" onClick={() => handleDelete(candidate._id)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            onClick={() => setShowModal(false)}
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
              <h2>{editingId ? 'Edit Candidate' : 'Add Candidate'}</h2>

              {error && (
                <motion.div className="alert alert-error" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  ⚠️ {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} placeholder="Candidate name" required />
                </div>
                <div className="form-group">
                  <label>Party</label>
                  <input type="text" name="party" className="form-control" value={formData.party} onChange={handleChange} placeholder="Party name (or Independent)" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} placeholder="Brief description (optional)" />
                </div>
                <div className="modal-actions">
                  <motion.button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    Cancel
                  </motion.button>
                  <motion.button type="submit" className="btn btn-primary" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    {editingId ? 'Update' : 'Add'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  )
}

export default ManageCandidates
