import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

function Dashboard() {
  const { user } = useAuth()
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [votedMap, setVotedMap] = useState({})

  useEffect(() => {
    fetchElections()
  }, [])

  const fetchElections = async () => {
    try {
      const res = await API.get('/elections')
      setElections(res.data)

      // Check vote status for each election
      const statusMap = {}
      for (const el of res.data) {
        try {
          const statusRes = await API.get(`/votes/status/${el._id}`)
          statusMap[el._id] = statusRes.data.hasVoted
        } catch {
          statusMap[el._id] = false
        }
      }
      setVotedMap(statusMap)
    } catch (err) {
      console.error('Failed to fetch elections:', err)
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Welcome, {user?.name} 👋</h1>
        <p>Your voting dashboard — view elections and cast your vote</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-value">{elections.length}</div>
          <div className="stat-label">Total Elections</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{elections.filter(isOngoing).length}</div>
          <div className="stat-label">Active Now</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Object.values(votedMap).filter(Boolean).length}</div>
          <div className="stat-label">Votes Cast</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{elections.filter(e => isOngoing(e) && !votedMap[e._id]).length}</div>
          <div className="stat-label">Pending Votes</div>
        </div>
      </div>

      {/* Elections List */}
      <h2 style={{ marginBottom: '1rem' }}>Elections</h2>
      {elections.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No elections available at the moment</p>
        </div>
      ) : (
        <div className="grid-2">
          {elections.map(el => {
            const status = getStatus(el)
            const hasVoted = votedMap[el._id]
            return (
              <div key={el._id} className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', flex: 1 }}>{el.title}</h3>
                  <span className={`badge ${status.class}`}>{status.label}</span>
                </div>
                {el.description && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    {el.description}
                  </p>
                )}
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  📅 {new Date(el.startDate).toLocaleDateString()} — {new Date(el.endDate).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {isOngoing(el) && !hasVoted && (
                    <Link to={`/vote/${el._id}`} className="btn btn-primary btn-sm">
                      🗳️ Vote Now
                    </Link>
                  )}
                  {hasVoted && (
                    <span className="badge badge-active">✅ Voted</span>
                  )}
                  <Link to={`/results/${el._id}`} className="btn btn-secondary btn-sm">
                    📊 Results
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Dashboard
