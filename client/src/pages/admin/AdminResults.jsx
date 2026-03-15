import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../../api/axios'

function AdminResults() {
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
  const winner = data?.results?.[0]

  return (
    <div className="animate-in">
      <div className="action-row">
        <div>
          <h1>📊 Election Results</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{data?.election?.title}</p>
        </div>
        <Link to="/admin/elections" className="btn btn-secondary">← Back to Elections</Link>
      </div>

      {/* Summary Cards */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-value">{data?.totalVotes || 0}</div>
          <div className="stat-label">Total Votes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data?.results?.length || 0}</div>
          <div className="stat-label">Candidates</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{winner?.name || 'N/A'}</div>
          <div className="stat-label">🏆 Leading Candidate</div>
        </div>
      </div>

      {/* Results Table */}
      {data?.results?.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>No votes have been cast yet</p>
        </div>
      ) : (
        <>
          <h2 style={{ marginBottom: '1rem' }}>Detailed Results</h2>
          <div className="glass-card">
            {data?.results?.map((candidate, index) => (
              <div key={candidate.candidateId} className="result-item">
                <div className="result-header">
                  <div>
                    <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>#{index + 1}</span>
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
                        : index === 1
                          ? 'linear-gradient(90deg, #6366f1, #818cf8)'
                          : 'linear-gradient(90deg, #64748b, #94a3b8)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default AdminResults
