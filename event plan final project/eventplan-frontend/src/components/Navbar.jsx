import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isOrganizer, isTeamMember, isVendor } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = isVendor
    ? [{ to: '/vendor/dashboard', label: 'Dashboard' }]
    : isTeamMember
    ? [{ to: '/team/dashboard', label: 'Dashboard' }]
    : isOrganizer
    ? [
        { to: '/dashboard', label: 'Dashboard' },
      ]
    : []

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-cream/90 backdrop-blur-md border-b border-obsidian-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-medium text-obsidian-900 tracking-wide">Soirée</span>
            <span className="hidden sm:block text-xs text-obsidian-300 font-sans tracking-widest uppercase mt-0.5">Events</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-sans transition-colors ${
                  location.pathname === link.to
                    ? 'text-obsidian-900 font-medium'
                    : 'text-obsidian-500 hover:text-obsidian-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-obsidian-900 text-cream flex items-center justify-center text-xs font-medium">
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-obsidian-600 font-sans max-w-[140px] truncate">{user.email}</span>
                </div>
                <button onClick={handleLogout} className="btn-ghost text-xs">
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-xs">Sign in</Link>
                <Link to="/register" className="btn-primary text-xs">Get started</Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              className="md:hidden p-1.5 rounded hover:bg-obsidian-100 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="block w-4 h-0.5 bg-obsidian-700 mb-1" />
              <span className="block w-4 h-0.5 bg-obsidian-700 mb-1" />
              <span className="block w-3 h-0.5 bg-obsidian-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-obsidian-100 bg-cream px-4 py-3 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block py-2 text-sm text-obsidian-700 font-sans"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
