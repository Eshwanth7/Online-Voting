import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import API from '../../api/axios'
import AnimatedPage, { fadeInUp } from '../../components/AnimatedPage'

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
    return (
      <div className="loading-container">
        <motion.div className="spinner" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }} />
      </div>
    )
  }

  return (
    <AnimatedPage>
      <motion.div className="page-header" variants={fadeInUp}>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Manage Voters
        </motion.h1>
        <motion.p
          style={{ color: 'var(--text-secondary)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {voters.length} registered user{voters.length !== 1 ? 's' : ''}
        </motion.p>
      </motion.div>

      {error && (
        <motion.div className="alert alert-error" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          ⚠️ {error}
        </motion.div>
      )}

      {voters.length === 0 ? (
        <motion.div className="empty-state" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.div className="empty-icon" animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            👥
          </motion.div>
          <p>No registered voters yet</p>
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
              {voters.map((voter, index) => (
                <motion.tr
                  key={voter._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
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
                      <motion.button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(voter._id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Delete
                      </motion.button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </AnimatedPage>
  )
}

export default ManageVoters
