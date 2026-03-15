import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../../api/axios'

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
    return <div className="loading-container"><div className="spinner"></div></div>
  }

  return (
    <div className="animate-in">
      <div className="action-row">
        <div>
          <h1>Manage Candidates</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Election: <strong>{election?.title}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/admin/elections" className="btn btn-secondary">← Back</Link>
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Candidate
          </button>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <p>No candidates added yet</p>
        </div>
      ) : (
        <div className="grid-3">
          {candidates.map(candidate => (
            <div key={candidate._id} className="glass-card" style={{ textAlign: 'center' }}>
              <div style={{
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
              }}>
                {candidate.name.charAt(0).toUpperCase()}
              </div>
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
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(candidate)}>
                  Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(candidate._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Candidate' : 'Add Candidate'}</h2>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Candidate name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Party</label>
                <input
                  type="text"
                  name="party"
                  className="form-control"
                  value={formData.party}
                  onChange={handleChange}
                  placeholder="Party name (or Independent)"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description (optional)"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageCandidates
