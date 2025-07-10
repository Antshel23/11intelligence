import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { lazy } from 'react'
import { Suspense } from 'react'
import { Helmet } from 'react-helmet'
import { Header } from './components/common/Header'
import { Login } from './components/auth/Login'
import { useAuth } from './hooks/data/useAuth'

// Lazy load all page components
const LandingPage = lazy(() => import('./pages/LandingPage'))
const OppositionView = lazy(() => import('./pages/OppositionView'))
const PlayerView = lazy(() => import('./pages/PlayerView'))
const ProgressView = lazy(() => import('./pages/ProgressView'))

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-[#EFEFEF] text-lg flex items-center space-x-2">
      <div className="w-6 h-6 border-2 border-[#EFEFEF] border-t-transparent rounded-full animate-spin"></div>
      <span>Loading...</span>
    </div>
  </div>
)

// Wrapper component for lazy-loaded pages
const LazyPageWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
)

function AppContent() {
  const location = useLocation()
  const { isAuthenticated, isLoading, login } = useAuth()
  
  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#181D21] flex items-center justify-center">
        <div className="text-[#EFEFEF] text-lg">Loading...</div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={login} />
  }
  
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

  // Common layout wrapper
  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <>
      <Header selectedTab={getSelectedTab()} onTabChange={handleTabChange} />
      <main className="pt-20 px-8 pb-8">
        {children}
      </main>
    </>
  )

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
            <PageWrapper>
              <LazyPageWrapper>
                <LandingPage />
              </LazyPageWrapper>
            </PageWrapper>
          } />
          <Route path="/opposition" element={
            <PageWrapper>
              <LazyPageWrapper>
                <OppositionView />
              </LazyPageWrapper>
            </PageWrapper>
          } />
          <Route path="/player" element={
            <PageWrapper>
              <LazyPageWrapper>
                <PlayerView />
              </LazyPageWrapper>
            </PageWrapper>
          } />
          <Route path="/progress" element={
            <PageWrapper>
              <LazyPageWrapper>
                <ProgressView />
              </LazyPageWrapper>
            </PageWrapper>
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