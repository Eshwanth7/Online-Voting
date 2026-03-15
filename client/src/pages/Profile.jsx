import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user } = useAuth()

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Your account information</p>
      </div>

      <div className="glass-card" style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: '700',
            color: 'white'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>{user?.name}</h2>
            <span className={`badge ${user?.role === 'admin' ? 'badge-pending' : 'badge-active'}`}>
              {user?.role === 'admin' ? '👑 Admin' : '🗳️ Voter'}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Email</div>
            <div style={{ fontWeight: '500' }}>{user?.email}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Phone</div>
            <div style={{ fontWeight: '500' }}>{user?.phone}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Voter ID</div>
            <div style={{ fontWeight: '500' }}>{user?.voterId}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Verification Status</div>
            <div>
              <span className="badge badge-active">✅ Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
