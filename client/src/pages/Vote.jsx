import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'

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
    return <div className="loading-container"><div className="spinner"></div></div>
  }

  if (hasVoted || success) {
    return (
      <div className="animate-in" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h1>Vote Recorded!</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem' }}>
          {success || 'You have already voted in this election. Thank you for participating!'}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate(`/results/${electionId}`)}>
            📊 View Results
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const selectedCandidate = candidates.find(c => c._id === selected)

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{election?.title}</h1>
        <p>{election?.description || 'Select your candidate and cast your vote'}</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Choose your candidate below. Click to select, then confirm your vote.
      </p>

      <div className="grid-3">
        {candidates.map(candidate => (
          <div
            key={candidate._id}
            className={`candidate-card ${selected === candidate._id ? 'selected' : ''}`}
            onClick={() => setSelected(candidate._id)}
          >
            <div className="candidate-avatar">
              {candidate.name.charAt(0).toUpperCase()}
            </div>
            <div className="candidate-name">{candidate.name}</div>
            <div className="candidate-party">{candidate.party}</div>
            {candidate.description && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                {candidate.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {candidates.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <p>No candidates have been added to this election yet</p>
        </div>
      )}

      {selected && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn btn-primary btn-lg" onClick={() => setShowConfirm(true)}>
            🗳️ Cast My Vote
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-vote">
              <h2>Confirm Your Vote</h2>
              <p style={{ color: 'var(--text-secondary)' }}>You are about to vote for:</p>
              <div className="selected-candidate">{selectedCandidate?.name}</div>
              <p style={{ color: 'var(--text-secondary)' }}>
                Party: {selectedCandidate?.party}
              </p>
              <p style={{ color: 'var(--warning)', fontSize: '0.9rem', marginTop: '1rem' }}>
                ⚠️ This action cannot be undone. You can only vote once.
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleVote} disabled={submitting}>
                {submitting ? 'Submitting...' : '✅ Confirm Vote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Vote
