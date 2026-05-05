import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Trade from './pages/Trade'
import Leaderboard from './pages/Leaderboard'
import PrivacyArchitecture from './pages/PrivacyArchitecture'
import Docs from './pages/Docs'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-[#050714] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trade" element={<Trade />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/privacy-architecture" element={<PrivacyArchitecture />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
