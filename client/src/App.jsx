import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import API from './api/axios'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Register from './pages/Register'
import Login from './pages/Login'
import OtpVerify from './pages/OtpVerify'
import Dashboard from './pages/Dashboard'
import Vote from './pages/Vote'
import Results from './pages/Results'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageElections from './pages/admin/ManageElections'
import ManageCandidates from './pages/admin/ManageCandidates'
import ManageVoters from './pages/admin/ManageVoters'
import AdminResults from './pages/admin/AdminResults'

function App() {
  const { user } = useAuth()
  const location = useLocation()

  // Pre-warm backend on load to eliminate Vercel cold starts
  useEffect(() => {
    const prewarm = async () => {
      try {
        await API.get('/health')
        console.log('🗳️ Backend warmed up')
      } catch (err) {
        console.warn('Backend warm-up failed', err)
      }
    }
    prewarm()
  }, [])

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/verify-otp" element={<OtpVerify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Voter Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/vote/:electionId" element={<ProtectedRoute><Vote /></ProtectedRoute>} />
            <Route path="/results/:electionId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/elections" element={<ProtectedRoute adminOnly><ManageElections /></ProtectedRoute>} />
            <Route path="/admin/candidates/:electionId" element={<ProtectedRoute adminOnly><ManageCandidates /></ProtectedRoute>} />
            <Route path="/admin/voters" element={<ProtectedRoute adminOnly><ManageVoters /></ProtectedRoute>} />
            <Route path="/admin/results/:electionId" element={<ProtectedRoute adminOnly><AdminResults /></ProtectedRoute>} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

export default App
