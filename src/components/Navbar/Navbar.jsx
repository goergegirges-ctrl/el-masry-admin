import React, { useState, useEffect } from 'react'
import './Navbar.css'
import { Moon, Sun } from 'lucide-react'
import NotificationPanel from '../NotificationPanel/NotificationPanel'

const LogoMark = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="El-Masry Electronics" className="navbar-logomark">
    <defs>
      <linearGradient id="nb-gearNavy" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1E3A5F" />
        <stop offset="100%" stopColor="#0A1628" />
      </linearGradient>
      <linearGradient id="nb-mCyan" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00B4D8" />
        <stop offset="100%" stopColor="#0096BC" />
      </linearGradient>
    </defs>
    <g transform="translate(120 120)">
      <g fill="url(#nb-gearNavy)">
        <path d="M -14 -115 L 14 -115 L 10 -95 L -10 -95 Z" />
        {[30,60,90,120,150,180,210,240,270,300,330].map(r => (
          <g key={r} transform={`rotate(${r})`}><path d="M -14 -115 L 14 -115 L 10 -95 L -10 -95 Z" /></g>
        ))}
      </g>
      <circle r="100" fill="url(#nb-gearNavy)" />
      <circle r="82" fill="#FFFFFF" />
      <circle r="82" fill="none" stroke="#00B4D8" strokeWidth="2" strokeOpacity="0.6" />
      <path d="M -48 42 L -48 -42 L 0 20 L 48 -42 L 48 42" stroke="url(#nb-mCyan)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <g fill="#00B4D8">
        <circle cx="-48" cy="-42" r="5.5" />
        <circle cx="48" cy="-42" r="5.5" />
        <circle cx="-48" cy="42" r="5.5" />
        <circle cx="48" cy="42" r="5.5" />
        <circle cx="0" cy="20" r="5.5" />
      </g>
      <g stroke="#00B4D8" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.85">
        <path d="M 48 -42 L 64 -42 L 64 -58" />
        <path d="M 48 42 L 64 42 L 64 58" />
      </g>
      <g fill="#00B4D8" opacity="0.85">
        <circle cx="64" cy="-58" r="3.5" />
        <circle cx="64" cy="58" r="3.5" />
      </g>
    </g>
  </svg>
)

const Navbar = () => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('admin_theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('admin_theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <div className='navbar'>
      <h1 className="navbar-logo">
        El-Masry <span className="admin-text">Admin</span>
      </h1>
      <div className='navbar-right'>
        <NotificationPanel />
        <button
          className="dark-toggle"
          onClick={() => setIsDark(d => !d)}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <LogoMark />
      </div>
    </div>
  )
}

export default Navbar
