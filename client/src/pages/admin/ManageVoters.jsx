import { useState, useEffect } from 'react'
import API from '../../api/axios'

function ManageVoters() {
  const [voters, setVoters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVoters()
  }, [])

  const fetchVoters = async () => {
    try {
      const res = await API.get('/users')
      setVoters(res.data)
    } catch (err) {
      setError('Failed to load voters')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this voter?')) return
    try {
      await API.delete(`/users/${id}`)
      fetchVoters()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete voter')
    }
  }

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Manage Voters</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {voters.length} registered user{voters.length !== 1 ? 's' : ''}
        </p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {voters.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <p>No registered voters yet</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Voter ID</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {voters.map(voter => (
                <tr key={voter._id}>
                  <td style={{ fontWeight: '500' }}>{voter.name}</td>
                  <td>{voter.email}</td>
                  <td>{voter.phone}</td>
                  <td>{voter.voterId}</td>
                  <td>
                    <span className={`badge ${voter.role === 'admin' ? 'badge-pending' : 'badge-active'}`}>
                      {voter.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${voter.isVerified ? 'badge-active' : 'badge-inactive'}`}>
                      {voter.isVerified ? '✅ Yes' : '❌ No'}
                    </span>
                  </td>
                  <td>
                    {voter.role !== 'admin' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(voter._id)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ManageVoters
