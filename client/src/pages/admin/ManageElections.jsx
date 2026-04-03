import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import API from '../../api/axios'
import AnimatedPage, { fadeInUp } from '../../components/AnimatedPage'

function ManageElections() {
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchElections()
  }, [])

  const fetchElections = async () => {
    try {
      const res = await API.get('/elections')
      setElections(res.data)
    } catch (err) {
      console.error('Failed to fetch elections:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({ title: '', description: '', startDate: '', endDate: '' })
    setError('')
    setShowModal(true)
  }

  const openEdit = (el) => {
    setEditingId(el._id)
    setFormData({
      title: el.title,
      description: el.description || '',
      startDate: el.startDate?.slice(0, 16),
      endDate: el.endDate?.slice(0, 16)
    })
    setError('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (editingId) {
        await API.put(`/elections/${editingId}`, formData)
      } else {
        await API.post('/elections', formData)
      }
      setShowModal(false)
      fetchElections()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save election')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this election?')) return
    try {
      await API.delete(`/elections/${id}`)
      fetchElections()
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
          <h1>Manage Elections</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create and manage all elections</p>
        </div>
        <motion.button
          className="btn btn-primary"
          onClick={openCreate}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          + Create Election
        </motion.button>
      </motion.div>

      {elections.length === 0 ? (
        <motion.div className="empty-state" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.div className="empty-icon" animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            🗳️
          </motion.div>
          <p>No elections yet. Create your first election!</p>
        </motion.div>
      ) : (
        <motion.div
          className="table-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {elections.map((el, index) => {
                const now = new Date()
                const isOngoing = el.isActive && new Date(el.startDate) <= now && new Date(el.endDate) >= now
                const isEnded = new Date(el.endDate) < now
                return (
                  <motion.tr
                    key={el._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.06 }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  >
                    <td style={{ fontWeight: '500' }}>{el.title}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {el.description || '—'}
                    </td>
                    <td>{new Date(el.startDate).toLocaleString()}</td>
                    <td>{new Date(el.endDate).toLocaleString()}</td>
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
                        <motion.button className="btn btn-secondary btn-sm" onClick={() => openEdit(el)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          Edit
                        </motion.button>
                        <motion.button className="btn btn-danger btn-sm" onClick={() => handleDelete(el._id)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          Delete
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
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
              <h2>{editingId ? 'Edit Election' : 'Create Election'}</h2>

              {error && (
                <motion.div className="alert alert-error" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  ⚠️ {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} placeholder="Election title" required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} placeholder="Optional description" />
                </div>
                <div className="form-group">
                  <label>Start Date & Time</label>
                  <input type="datetime-local" name="startDate" className="form-control" value={formData.startDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>End Date & Time</label>
                  <input type="datetime-local" name="endDate" className="form-control" value={formData.endDate} onChange={handleChange} required />
                </div>
                <div className="modal-actions">
                  <motion.button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    Cancel
                  </motion.button>
                  <motion.button type="submit" className="btn btn-primary" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    {editingId ? 'Update' : 'Create'}
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

export default ManageElections
