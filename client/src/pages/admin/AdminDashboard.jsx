import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../../api/axios'

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
    return <div className="loading-container"><div className="spinner"></div></div>
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>👑 Admin Dashboard</h1>
        <p>Manage elections, candidates, and voters</p>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-value">{stats.elections}</div>
          <div className="stat-label">Total Elections</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {elections.filter(e => {
              const now = new Date()
              return e.isActive && new Date(e.startDate) <= now && new Date(e.endDate) >= now
            }).length}
          </div>
          <div className="stat-label">Active Elections</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {elections.filter(e => new Date(e.endDate) < new Date()).length}
          </div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Quick Links */}
      <h2 style={{ marginBottom: '1rem' }}>Quick Actions</h2>
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <Link to="/admin/elections" className="glass-card" style={{ textAlign: 'center', textDecoration: 'none' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗳️</div>
          <h3>Manage Elections</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Create, edit, and delete elections</p>
        </Link>
        <Link to="/admin/voters" className="glass-card" style={{ textAlign: 'center', textDecoration: 'none' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
          <h3>Manage Voters</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>View and manage registered voters</p>
        </Link>
        <Link to="/dashboard" className="glass-card" style={{ textAlign: 'center', textDecoration: 'none' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <h3>View as Voter</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Switch to the voter dashboard</p>
        </Link>
      </div>

      {/* Recent Elections */}
      <h2 style={{ marginBottom: '1rem' }}>Recent Elections</h2>
      {elections.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No elections created yet</p>
          <Link to="/admin/elections" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            + Create First Election
          </Link>
        </div>
      ) : (
        <div className="table-container">
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
              {elections.slice(0, 5).map(el => {
                const now = new Date()
                const isOngoing = el.isActive && new Date(el.startDate) <= now && new Date(el.endDate) >= now
                const isEnded = new Date(el.endDate) < now
                return (
                  <tr key={el._id}>
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
                        <Link to={`/admin/candidates/${el._id}`} className="btn btn-secondary btn-sm">
                          Candidates
                        </Link>
                        <Link to={`/admin/results/${el._id}`} className="btn btn-secondary btn-sm">
                          Results
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
