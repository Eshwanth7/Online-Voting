import { motion } from 'framer-motion'

function Footer() {
  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <p>© {new Date().getFullYear()} VoteSecure — Online Voting System with Authentication. All rights reserved.</p>
    </motion.footer>
  )
}

export default Footer
