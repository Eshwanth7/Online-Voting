import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../api/axios'

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
    return <div className="loading-container"><div className="spinner"></div></div>
  }

  if (error) {
    return <div className="alert alert-error">⚠️ {error}</div>
  }

  const maxVotes = Math.max(...(data?.results?.map(r => r.voteCount) || [1]), 1)

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>📊 {data?.election?.title} — Results</h1>
        <p>
          Total Votes Cast: <strong>{data?.totalVotes || 0}</strong>
          {' | '}
          Status: <span className={`badge ${data?.election?.isActive ? 'badge-active' : 'badge-inactive'}`}>
            {data?.election?.isActive ? 'Active' : 'Closed'}
          </span>
        </p>
      </div>

      {data?.results?.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>No votes have been cast yet</p>
        </div>
      ) : (
        <div className="glass-card" style={{ maxWidth: '700px' }}>
          {data?.results?.map((candidate, index) => (
            <div key={candidate.candidateId} className="result-item">
              <div className="result-header">
                <div>
                  <span className="result-name">
                    {index === 0 && '🏆 '}
                    {candidate.name}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                    ({candidate.party})
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span className="result-votes">{candidate.voteCount} votes</span>
                  <span className="result-percentage">{candidate.percentage}%</span>
                </div>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${(candidate.voteCount / maxVotes) * 100}%`,
                    background: index === 0
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : 'linear-gradient(90deg, var(--accent), var(--accent-light))'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <Link to="/dashboard" className="btn btn-secondary">← Back to Dashboard</Link>
      </div>
    </div>
  )
}

export default Results
