import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
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
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageElections from './pages/admin/ManageElections'
import ManageCandidates from './pages/admin/ManageCandidates'
import ManageVoters from './pages/admin/ManageVoters'
import AdminResults from './pages/admin/AdminResults'

function App() {
  const { user } = useAuth()

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/verify-otp" element={<OtpVerify />} />

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
      </main>
      <Footer />
    </div>
  )
}

export default App
