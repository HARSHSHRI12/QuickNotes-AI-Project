import { useState } from 'react'
import { motion } from 'framer-motion'
import './AiAssistant.css'


const AiAssistant = () => {
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([
    { type: 'assistant', text: 'Hello! I\'m your QuickNotes AI assistant. How can I help you today?' }
  ])
  const [isTyping, setIsTyping] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    setChatHistory([...chatHistory, { type: 'user', text: message }]);
    setMessage('');
    setIsTyping(true);

    try {
        const response = await fetch('http://localhost:3500/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: message })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        if (!data.response) {
            throw new Error("Invalid API response structure.");
        }

        setChatHistory(prev => [...prev, { type: 'assistant', text: data.response }]);
    } catch (error) {
        console.error("Error fetching response:", error);
        setChatHistory(prev => [...prev, { type: 'assistant', text: 'Oops! Something went wrong.' }]);
    } finally {
        setIsTyping(false);
    }
};


  return (
    <div className="ai-assistant-page page-container">
      <div className="container">
        <div className="row">
          <div className="col-lg-4" data-aos="fade-right">
            <div className="assistant-sidebar">
              <div className="sidebar-header">
                <h2><i className="fas fa-robot"></i> AI Assistant</h2>
              </div>
              
              <div className="sidebar-features">
                <h3>What I Can Do</h3>
                <ul className="feature-list">
                  <li>
                    <div className="feature-icon">
                      <i className="fas fa-magic"></i>
                    </div>
                    <div className="feature-content">
                      <h4>Smart Summarization</h4>
                      <p>Automatically summarize long notes and extract key points</p>
                    </div>
                  </li>
                  <li>
                    <div className="feature-icon">
                      <i className="fas fa-sitemap"></i>
                    </div>
                    <div className="feature-content">
                      <h4>Organize Content</h4>
                      <p>Categorize and structure your notes intelligently</p>
                    </div>
                  </li>
                  <li>
                    <div className="feature-icon">
                      <i className="fas fa-lightbulb"></i>
                    </div>
                    <div className="feature-content">
                      <h4>Generate Ideas</h4>
                      <p>Get creative suggestions and thought starters</p>
                    </div>
                  </li>
                  <li>
                    <div className="feature-icon">
                      <i className="fas fa-search"></i>
                    </div>
                    <div className="feature-content">
                      <h4>Smart Search</h4>
                      <p>Find exactly what you need with semantic search</p>
                    </div>
                  </li>
                  <li>
                    <div className="feature-icon">
                      <i className="fas fa-language"></i>
                    </div>
                    <div className="feature-content">
                      <h4>Language Enhancement</h4>
                      <p>Improve writing clarity, grammar, and style</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="sidebar-tips">
                <h3>Tips</h3>
                <div className="tip-card">
                  <div className="tip-icon">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <p>Try asking "Summarize my recent notes" to get a quick overview</p>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <p>Say "Find notes about [topic]" to quickly locate relevant content</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-8" data-aos="fade-left">
            <div className="chat-container">
              <div className="chat-header">
                <div className="assistant-info">
                  <div className="assistant-avatar">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="assistant-details">
                    <h3>QuickNotes AI</h3>
                    <p className="status online">Online</p>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="action-btn">
                    <i className="fas fa-volume-up"></i>
                  </button>
                  <button className="action-btn">
                    <i className="fas fa-cog"></i>
                  </button>
                </div>
              </div>
              
              <div className="chat-messages">
                {chatHistory.map((chat, index) => (
                  <motion.div 
                    key={index}
                    className={`message ${chat.type}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {chat.type === 'assistant' && (
                      <div className="message-avatar">
                        <i className="fas fa-robot"></i>
                      </div>
                    )}
                    <div className="message-content">
                      <p>{chat.text}</p>
                      <span className="message-time">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <div className="message assistant typing">
                    <div className="message-avatar">
                      <i className="fas fa-robot"></i>
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <form className="chat-input" onSubmit={handleSubmit}>
                <div className="input-actions">
                  <button type="button" className="action-btn">
                    <i className="fas fa-paperclip"></i>
                  </button>
                </div>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                />
                <motion.button 
                  type="submit"
                  className="send-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!message.trim()}
                >
                  <i className="fas fa-paper-plane"></i>
                </motion.button>
              </form>
            </div>
            
            <div className="assistant-features" data-aos="fade-up">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <motion.button 
                  className="quick-action-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setMessage("Summarize my recent notes")
                  }}
                >
                  <i className="fas fa-file-alt"></i>
                  <span>Summarize Notes</span>
                </motion.button>
                <motion.button 
                  className="quick-action-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setMessage("Generate ideas for my project")
                  }}
                >
                  <i className="fas fa-lightbulb"></i>
                  <span>Generate Ideas</span>
                </motion.button>
                <motion.button 
                  className="quick-action-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setMessage("Organize my notes by category")
                  }}
                >
                  <i className="fas fa-folder"></i>
                  <span>Organize Notes</span>
                </motion.button>
                <motion.button 
                  className="quick-action-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setMessage("Find related notes")
                  }}
                >
                  <i className="fas fa-search"></i>
                  <span>Find Related</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiAssistant