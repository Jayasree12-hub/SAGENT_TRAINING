import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import OtpVerify from './pages/OtpVerify'
import VendorRegister from './pages/VendorRegister'
import VendorLogin from './pages/VendorLogin'
import OrganizerDashboard from './pages/OrganizerDashboard'
import VendorDashboard from './pages/VendorDashboard'
import VendorDetailPage from './pages/VendorDetailPage'
import TeamMemberDashboard from './pages/TeamMemberDashboard'
import EventDetail from './pages/EventDetail'
import RsvpRespond from './pages/RsvpRespond'
import ResponseSuccess from './pages/ResponseSuccess'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-obsidian-900 border-t-transparent rounded-full animate-spin" />
        <span className="font-sans text-sm text-obsidian-400 tracking-wide">Loading…</span>
      </div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'VENDOR') return <Navigate to="/vendor/dashboard" replace />
    if (user.role === 'TEAM_MEMBER') return <Navigate to="/team/dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={!user ? <Login /> : (
        <Navigate to={
          user.role === 'VENDOR'
            ? '/vendor/dashboard'
            : user.role === 'TEAM_MEMBER'
              ? '/team/dashboard'
              : '/dashboard'
        } replace />
      )} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
      <Route path="/verify-otp" element={!user ? <OtpVerify /> : (
        <Navigate to={
          user.role === 'VENDOR'
            ? '/vendor/dashboard'
            : user.role === 'TEAM_MEMBER'
              ? '/team/dashboard'
              : '/dashboard'
        } replace />
      )} />
      <Route path="/vendor/register" element={!user ? <VendorRegister /> : <Navigate to="/vendor/dashboard" replace />} />
      <Route path="/vendor/login" element={!user ? <VendorLogin /> : <Navigate to="/vendor/dashboard" replace />} />
      <Route path="/rsvp/respond" element={<RsvpRespond />} />
      <Route path="/response-success" element={<ResponseSuccess />} />

      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN', 'USER']}>
          <OrganizerDashboard />
        </ProtectedRoute>
      } />

      <Route path="/team/dashboard" element={
        <ProtectedRoute allowedRoles={['TEAM_MEMBER']}>
          <TeamMemberDashboard />
        </ProtectedRoute>
      } />

      <Route path="/dashboard/events/:eventId" element={
        <ProtectedRoute allowedRoles={['ORGANIZER', 'TEAM_MEMBER', 'ADMIN', 'USER']}>
          <EventDetail />
        </ProtectedRoute>
      } />

      <Route path="/vendor/dashboard" element={
        <ProtectedRoute allowedRoles={['VENDOR']}>
          <VendorDashboard />
        </ProtectedRoute>
      } />

      <Route path="/vendor/dashboard/:section" element={
        <ProtectedRoute allowedRoles={['VENDOR']}>
          <VendorDashboard />
        </ProtectedRoute>
      } />

      <Route path="/vendors/:vendorId" element={
        <ProtectedRoute allowedRoles={['VENDOR', 'TEAM_MEMBER', 'ORGANIZER', 'ADMIN', 'USER']}>
          <VendorDetailPage />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
