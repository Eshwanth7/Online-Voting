import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div className="animate-in">
      {/* Hero Section */}
      <section className="landing-hero">
        <h1>
          Vote From Anywhere,<br />
          <span className="gradient-text">Securely & Transparently</span>
        </h1>
        <p className="hero-subtitle">
          A secure online voting platform with robust authentication. 
          Cast your vote from the comfort of your home with complete confidence 
          in the integrity of every election.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Login to Vote
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <h2>Why Choose VoteSecure?</h2>
        <div className="grid-3">
          <div className="feature-card animate-in">
            <div className="feature-icon">🔒</div>
            <h3>Secure Authentication</h3>
            <p>Multi-step verification with OTP ensures only legitimate voters can participate in elections.</p>
          </div>
          <div className="feature-card animate-in">
            <div className="feature-icon">🛡️</div>
            <h3>One Vote Per Person</h3>
            <p>Advanced duplicate detection prevents any voter from casting more than one vote per election.</p>
          </div>
          <div className="feature-card animate-in">
            <div className="feature-icon">📊</div>
            <h3>Instant Results</h3>
            <p>Automated vote counting delivers accurate results the moment the voting period ends.</p>
          </div>
          <div className="feature-card animate-in">
            <div className="feature-icon">🌐</div>
            <h3>Vote Anywhere</h3>
            <p>Access the platform from any device with an internet connection — no polling station needed.</p>
          </div>
          <div className="feature-card animate-in">
            <div className="feature-icon">👤</div>
            <h3>User Dashboard</h3>
            <p>Track your voting history, manage your profile, and stay updated on active elections.</p>
          </div>
          <div className="feature-card animate-in">
            <div className="feature-icon">⚙️</div>
            <h3>Admin Panel</h3>
            <p>Comprehensive administration tools to create elections, manage candidates, and monitor results.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing
