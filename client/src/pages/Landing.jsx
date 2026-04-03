import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedPage, { fadeInUp, staggerContainer, floatingAnimation, buttonInteraction, cardHover } from '../components/AnimatedPage'

function Landing() {
  // Animated floating particles for hero
  const particles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 3,
    delay: Math.random() * 2,
  }))

  return (
    <AnimatedPage>
      {/* Hero Section */}
      <section className="landing-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Floating particles background */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.3)',
              pointerEvents: 'none',
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 4 + p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: p.delay,
            }}
          />
        ))}

        <motion.div
          variants={floatingAnimation}
          animate="animate"
          style={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            fontSize: '4rem',
            opacity: 0.15,
            pointerEvents: 'none',
          }}
        >
          🗳️
        </motion.div>

        <motion.h1 variants={fadeInUp}>
          Vote From Anywhere,<br />
          <motion.span
            className="gradient-text"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            style={{
              backgroundSize: '200% auto',
            }}
          >
            Securely & Transparently
          </motion.span>
        </motion.h1>

        <motion.p className="hero-subtitle" variants={fadeInUp}>
          A secure online voting platform with robust authentication.
          Cast your vote from the comfort of your home with complete confidence
          in the integrity of every election.
        </motion.p>

        <motion.div className="hero-buttons" variants={fadeInUp}>
          <motion.div {...buttonInteraction}>
            <Link to="/register" className="btn btn-primary btn-lg">
              🚀 Get Started
            </Link>
          </motion.div>
          <motion.div {...buttonInteraction}>
            <Link to="/login" className="btn btn-secondary btn-lg">
              🔐 Login to Vote
            </Link>
          </motion.div>
        </motion.div>

        {/* Animated trust badges */}
        <motion.div
          variants={fadeInUp}
          style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            marginTop: '3rem',
            flexWrap: 'wrap',
          }}
        >
          {[
            { icon: '🔒', text: 'End-to-End Encrypted' },
            { icon: '✅', text: 'OTP Verified' },
            { icon: '📊', text: 'Real-time Results' },
          ].map((badge, i) => (
            <motion.div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.15 }}
            >
              <span>{badge.icon}</span>
              <span>{badge.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it Works Section */}
      <motion.section
        style={{ padding: '3rem 0' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          How It Works
        </motion.h2>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { step: '01', icon: '📝', title: 'Register', desc: 'Create your account with verified credentials' },
            { step: '02', icon: '📧', title: 'Verify OTP', desc: 'Confirm your identity via email verification' },
            { step: '03', icon: '🗳️', title: 'Cast Vote', desc: 'Select your candidate and submit securely' },
            { step: '04', icon: '📊', title: 'View Results', desc: 'Watch live results as votes are counted' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              style={{
                textAlign: 'center',
                padding: '1.5rem',
                flex: '1 1 200px',
                maxWidth: '250px',
                position: 'relative',
              }}
            >
              <motion.div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: 'white',
                  margin: '0 auto 0.75rem',
                }}
                whileHover={{ scale: 1.2 }}
              >
                {item.step}
              </motion.div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="landing-features"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Why Choose VoteSecure?
        </motion.h2>

        <motion.div
          className="grid-3"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
        >
          {[
            { icon: '🔒', title: 'Secure Authentication', desc: 'Multi-step verification with OTP ensures only legitimate voters can participate in elections.' },
            { icon: '🛡️', title: 'One Vote Per Person', desc: 'Advanced duplicate detection prevents any voter from casting more than one vote per election.' },
            { icon: '📊', title: 'Instant Results', desc: 'Automated vote counting delivers accurate results the moment the voting period ends.' },
            { icon: '🌐', title: 'Vote Anywhere', desc: 'Access the platform from any device with an internet connection — no polling station needed.' },
            { icon: '👤', title: 'User Dashboard', desc: 'Track your voting history, manage your profile, and stay updated on active elections.' },
            { icon: '⚙️', title: 'Admin Panel', desc: 'Comprehensive administration tools to create elections, manage candidates, and monitor results.' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="feature-card"
              variants={fadeInUp}
              {...cardHover}
            >
              <motion.div
                className="feature-icon"
                whileHover={{
                  rotate: [0, -10, 10, -5, 0],
                  transition: { duration: 0.5 },
                }}
              >
                {feature.icon}
              </motion.div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        style={{
          textAlign: 'center',
          padding: '4rem 1rem',
          margin: '2rem 0',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.05))',
          border: '1px solid var(--border)',
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          style={{ marginBottom: '1rem' }}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Ready to Make Your Voice Heard?
        </motion.h2>
        <motion.p
          style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          Join thousands of voters who trust VoteSecure for transparent, secure elections.
        </motion.p>
        <motion.div
          {...buttonInteraction}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link to="/register" className="btn btn-primary btn-lg">
            🗳️ Start Voting Now
          </Link>
        </motion.div>
      </motion.section>
    </AnimatedPage>
  )
}

export default Landing
