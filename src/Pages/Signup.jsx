import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Signup.css'

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  })
  
  const [step, setStep] = useState(1)
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  
  const nextStep = (e) => {
    e.preventDefault()
    setStep(2)
  }
  
  const prevStep = () => {
    setStep(1)
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Signup form submitted:', formData)
    // Here you would typically handle user registration
  }
  
  return (
    <div className="signup-page page-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="signup-container">
              <div className="row g-0">
                <div className="col-md-6 order-md-2">
                  <motion.div 
                    className="signup-image"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="overlay"></div>
                    <div className="signup-content">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      >
                        <h2>Join QuickNotes AI</h2>
                        <p>Create your account and start organizing your ideas with the power of artificial intelligence.</p>
                      </motion.div>
                      <motion.div 
                        className="signup-benefits"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      >
                        <h3>Why Choose QuickNotes AI?</h3>
                        <div className="benefit-item">
                          <i className="fas fa-brain"></i>
                          <div>
                            <h4>AI-Powered Organization</h4>
                            <p>Our AI automatically organizes and connects your notes</p>
                          </div>
                        </div>
                        <div className="benefit-item">
                          <i className="fas fa-bolt"></i>
                          <div>
                            <h4>Quick Capture</h4>
                            <p>Capture ideas instantly with text, voice, or images</p>
                          </div>
                        </div>
                        <div className="benefit-item">
                          <i className="fas fa-coins"></i>
                          <div>
                            <h4>E-Coin Rewards</h4>
                            <p>Earn rewards for consistent usage and unlock premium features</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
                <div className="col-md-6 order-md-1">
                  <motion.div 
                    className="signup-form-container"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="signup-header">
                      <h3>Create Account</h3>
                      <p>Sign up for free and start using QuickNotes AI</p>
                    </div>
                    
                    <div className="signup-steps">
                      <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                        <div className="step-number">1</div>
                        <div className="step-label">Account Info</div>
                      </div>
                      <div className="step-line"></div>
                      <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                        <div className="step-number">2</div>
                        <div className="step-label">Preferences</div>
                      </div>
                    </div>
                    
                    {step === 1 ? (
                      <form className="signup-form" onSubmit={nextStep}>
                        <div className="form-group">
                          <label htmlFor="fullName">Full Name</label>
                          <div className="input-group">
                            <span className="input-icon">
                              <i className="fas fa-user"></i>
                            </span>
                            <input
                              type="text"
                              id="fullName"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              required
                              placeholder="Enter your full name"
                            />
                          </div>
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
                              placeholder="Create a password"
                            />
                          </div>
                          <div className="password-strength">
                            <div className="strength-meter">
                              <div className="strength-bar" style={{ width: formData.password.length > 8 ? '100%' : `${formData.password.length * 12.5}%` }}></div>
                            </div>
                            <span className="strength-text">
                              {formData.password.length === 0 ? 'Password strength' : 
                               formData.password.length < 6 ? 'Weak' : 
                               formData.password.length < 8 ? 'Medium' : 'Strong'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="confirmPassword">Confirm Password</label>
                          <div className="input-group">
                            <span className="input-icon">
                              <i className="fas fa-lock"></i>
                            </span>
                            <input
                              type="password"
                              id="confirmPassword"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              required
                              placeholder="Confirm your password"
                            />
                          </div>
                          {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <div className="password-mismatch">Passwords do not match</div>
                          )}
                        </div>
                        
                        <motion.button 
                          type="submit" 
                          className="btn-primary-custom signup-btn"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
                        >
                          Next Step <i className="fas fa-arrow-right"></i>
                        </motion.button>
                      </form>
                    ) : (
                      <form className="signup-form" onSubmit={handleSubmit}>
                        <div className="preferences-section">
                          <h4>Select Your Interests</h4>
                          <p>We'll customize your experience based on your interests</p>
                          
                          <div className="interests-grid">
                            <div className="interest-item">
                              <input type="checkbox" id="work" name="interests" value="work" />
                              <label htmlFor="work">
                                <i className="fas fa-briefcase"></i>
                                <span>Work</span>
                              </label>
                            </div>
                            <div className="interest-item">
                              <input type="checkbox" id="study" name="interests" value="study" />
                              <label htmlFor="study">
                                <i className="fas fa-book"></i>
                                <span>Study</span>
                              </label>
                            </div>
                            <div className="interest-item">
                              <input type="checkbox" id="personal" name="interests" value="personal" />
                              <label htmlFor="personal">
                                <i className="fas fa-user"></i>
                                <span>Personal</span>
                              </label>
                            </div>
                            <div className="interest-item">
                              <input type="checkbox" id="creative" name="interests" value="creative" />
                              <label htmlFor="creative">
                                <i className="fas fa-paint-brush"></i>
                                <span>Creative</span>
                              </label>
                            </div>
                            <div className="interest-item">
                              <input type="checkbox" id="research" name="interests" value="research" />
                              <label htmlFor="research">
                                <i className="fas fa-flask"></i>
                                <span>Research</span>
                              </label>
                            </div>
                            <div className="interest-item">
                              <input type="checkbox" id="other" name="interests" value="other" />
                              <label htmlFor="other">
                                <i className="fas fa-ellipsis-h"></i>
                                <span>Other</span>
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="form-group terms-group">
                          <div className="checkbox-group">
                            <input
                              type="checkbox"
                              id="agreeTerms"
                              name="agreeTerms"
                              checked={formData.agreeTerms}
                              onChange={handleChange}
                              required
                            />
                            <label htmlFor="agreeTerms">
                              I agree to the <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link>
                            </label>
                          </div>
                        </div>
                        
                        <div className="form-buttons">
                          <motion.button 
                            type="button" 
                            className="btn-secondary-custom back-btn"
                            onClick={prevStep}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <i className="fas fa-arrow-left"></i> Back
                          </motion.button>
                          
                          <motion.button 
                            type="submit" 
                            className="btn-primary-custom signup-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={!formData.agreeTerms}
                          >
                            Create Account <i className="fas fa-check"></i>
                          </motion.button>
                        </div>
                      </form>
                    )}
                    
                    <div className="signup-footer">
                      <p>Already have an account? <Link to="/login">Sign In</Link></p>
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

export default Signup