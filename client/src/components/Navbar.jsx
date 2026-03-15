import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🗳️</span>
          VoteSecure
        </Link>

        <div className="navbar-links">
          {!user ? (
            <>
              <Link to="/login" className={isActive('/login')}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className={isActive('/admin')}>Admin</Link>
              )}
              <Link to="/profile" className={isActive('/profile')}>Profile</Link>
              <button onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
