import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { Header } from './components/common/Header'
import LandingPage from './pages/LandingPage'
import OppositionView from './pages/OppositionView'
import PlayerView from './pages/PlayerView'
import ProgressView from './pages/ProgressView'

function AppContent() {
  const location = useLocation()
  
  const getSelectedTab = () => {
    switch (location.pathname) {
      case '/':
        return 'home'
      case '/opposition':
        return 'opposition'
      case '/player':
        return 'player'
      case '/progress':
        return 'progress'
      default:
        return 'opposition'
    }
  }

  const handleTabChange = (tab: string) => {
    // Navigation will be handled by the Header component using useNavigate
  }

  return (
    <>
      <Helmet>
        <title>ELEVEN INTELLIGENCE</title>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <meta name="description" content="Football Analytics Platform" />
      </Helmet>
      
      <div className="min-h-screen bg-[#181D21]">
        <Routes>
          <Route path="/" element={
            <>
              <Header selectedTab={getSelectedTab()} onTabChange={handleTabChange} />
              <main className="pt-20 px-8 pb-8">
                <LandingPage />
              </main>
            </>
          } />
          <Route path="/opposition" element={
            <>
              <Header selectedTab={getSelectedTab()} onTabChange={handleTabChange} />
              <main className="pt-20 px-8 pb-8">
                <OppositionView />
              </main>
            </>
          } />
          <Route path="/player" element={
            <>
              <Header selectedTab={getSelectedTab()} onTabChange={handleTabChange} />
              <main className="pt-20 px-8 pb-8">
                <PlayerView />
              </main>
            </>
          } />
          <Route path="/progress" element={
            <>
              <Header selectedTab={getSelectedTab()} onTabChange={handleTabChange} />
              <main className="pt-20 px-8 pb-8">
                <ProgressView />
              </main>
            </>
          } />
        </Routes>
      </div>
    </>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App