import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import AOS from 'aos'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './Pages/Home'
import Contact from './Pages/Contact'
import ECoin from './Pages/ECoin'
import AiAssistant from './Pages/AiAssistant'
import CodingPractice from './Pages/CodingPractice'
import Login from './Pages/Login'
import Signup from './Pages/Signup'
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css'
import NogenVoiceAssistant from "./components/NogenVoiceAssistant";


function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true
    })
  }, [])
  
  useEffect(() => {
    const nogen = new NogenVoiceAssistant();
    nogen.start();
}, []);

  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/ecoin" element={<ECoin />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />
          <Route path="/CodingPractice" element={<CodingPractice />}/>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App;