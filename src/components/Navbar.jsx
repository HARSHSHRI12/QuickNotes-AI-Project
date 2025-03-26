import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Navbar.css'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location])

  const navVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring', 
        stiffness: 100,
        duration: 0.5 
      }
    }
  }

  const linkVariants = {
    hover: { 
      scale: 1.1, 
      color: '#4a6bff',
      transition: { duration: 0.2 }
    }
  }

  return (
    <motion.nav 
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-brain"></i> QuickNotes <span>AI</span>
          </motion.div>
        </Link>

        <div className={`menu-icon ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <motion.div whileHover="hover" variants={linkVariants}>
              <Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}>
                <i className="fas fa-home"></i> Home
              </Link>
            </motion.div>
          </li>
          <li className="nav-item">
            <motion.div whileHover="hover" variants={linkVariants}>
              <Link to="/contact" className={location.pathname === '/contact' ? 'nav-link active' : 'nav-link'}>
                <i className="fas fa-envelope"></i> Contact
              </Link>
            </motion.div>
          </li>
          <li className="nav-item">
            <motion.div whileHover="hover" variants={linkVariants}>
              <Link to="/ecoin" className={location.pathname === '/ecoin' ? 'nav-link active' : 'nav-link'}>
                <i className="fas fa-coins"></i> E-Coin
              </Link>
            </motion.div>
          </li>
          <li className="nav-item">
            <motion.div whileHover="hover" variants={linkVariants}>
              <Link to="/ai-assistant" className={location.pathname === '/ai-assistant' ? 'nav-link active' : 'nav-link'}>
                <i className="fas fa-robot"></i> AI Assistant
              </Link>
            </motion.div>
          </li>
          <li className="nav-item">
            <motion.div whileHover="hover" variants={linkVariants}>
              <Link to="/login" className={location.pathname === '/login' ? 'nav-link active' : 'nav-link'}>
                <i className="fas fa-sign-in-alt"></i> Login
              </Link>
            </motion.div>
          </li>
          
        </ul>
      </div>
    </motion.nav>
  )
}

export default Navbar