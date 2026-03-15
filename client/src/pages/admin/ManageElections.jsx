import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../../api/axios'

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
    return <div className="loading-container"><div className="spinner"></div></div>
  }

  return (
    <div className="animate-in">
      <div className="action-row">
        <div>
          <h1>Manage Elections</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create and manage all elections</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Create Election
        </button>
      </div>

      {elections.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗳️</div>
          <p>No elections yet. Create your first election!</p>
        </div>
      ) : (
        <div className="table-container">
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
              {elections.map(el => {
                const now = new Date()
                const isOngoing = el.isActive && new Date(el.startDate) <= now && new Date(el.endDate) >= now
                const isEnded = new Date(el.endDate) < now
                return (
                  <tr key={el._id}>
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
                        <Link to={`/admin/candidates/${el._id}`} className="btn btn-secondary btn-sm">
                          Candidates
                        </Link>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(el)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(el._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Election' : 'Create Election'}</h2>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Election title"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Optional description"
                />
              </div>
              <div className="form-group">
                <label>Start Date & Time</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  className="form-control"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date & Time</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  className="form-control"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageElections
