import React, { useState, useEffect } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Moon, Sun } from 'lucide-react'

const Navbar = () => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('admin_theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('admin_theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <div className='navbar'>
      <h1 className="navbar-logo">El-Masry <span className="admin-text">Admin</span></h1>
      <div className='navbar-right'>
        <button
          className="dark-toggle"
          onClick={() => setIsDark(d => !d)}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <img className='profile' src={assets.profile_image} alt="Profile" />
      </div>
    </div>
  )
}

export default Navbar
