import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Login.css'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Login form submitted:', formData)
    // Here you would typically handle authentication
  }
  
  return (
    <div className="login-page page-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="login-container">
              <div className="row g-0">
                <div className="col-md-6">
                  <motion.div 
                    className="login-image"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="overlay"></div>
                    <div className="login-content">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      >
                        <h2>Welcome Back!</h2>
                        <p>Log in to access your smart notes and continue organizing your ideas with AI assistance.</p>
                      </motion.div>
                      <motion.div 
                        className="login-features"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      >
                        <div className="feature-item">
                          <i className="fas fa-check-circle"></i>
                          <span>AI-powered note organization</span>
                        </div>
                        <div className="feature-item">
                          <i className="fas fa-check-circle"></i>
                          <span>Smart connections between ideas</span>
                        </div>
                        <div className="feature-item">
                          <i className="fas fa-check-circle"></i>
                          <span>Earn E-Coins for premium features</span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
                <div className="col-md-6">
                  <motion.div 
                    className="login-form-container"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="login-header">
                      <h3>Sign In</h3>
                      <p>Enter your credentials to access your account</p>
                    </div>
                    
                    <form className="login-form" onSubmit={handleSubmit}>
                      <div className="social-login">
                        <motion.button 
                          type="button" 
                          className="social-btn google"
                          whileHover={{ y: -5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <i className="fab fa-google"></i>
                          <span>Sign in with Google</span>
                        </motion.button>
                        <motion.button 
                          type="button" 
                          className="social-btn facebook"
                          whileHover={{ y: -5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <i className="fab fa-facebook-f"></i>
                          <span>Sign in with Facebook</span>
                        </motion.button>
                      </div>
                      
                      <div className="divider">
                        <span>or</span>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-group">
                          <span className="input-icon">
                            <i className="fas fa-envelope"></i>
                          </span>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-group">
                          <span className="input-icon">
                            <i className="fas fa-lock"></i>
                          </span>
                          <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                          />
                        </div>
                      </div>
                      
                      <div className="form-options">
                        <div className="remember-me">
                          <input
                            type="checkbox"
                            id="rememberMe"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleChange}
                          />
                          <label htmlFor="rememberMe">Remember me</label>
                        </div>
                        <Link to="#" className="forgot-password">Forgot Password?</Link>
                      </div>
                      
                      <motion.button 
                        type="submit" 
                        className="btn-primary-custom login-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Sign In <i className="fas fa-arrow-right"></i>
                      </motion.button>
                    </form>
                    
                    <div className="login-footer">
                      <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login