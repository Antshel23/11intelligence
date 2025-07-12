import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  selectedTab: string
  onTabChange: (tab: string) => void
}

export function Header({ selectedTab, onTabChange }: HeaderProps) {
  const navigate = useNavigate()

  const handleTabClick = (tab: string) => {
    onTabChange(tab)
    navigate(`/${tab}`)
  }

  const tabs = [
    { id: '', name: 'Home' },
    { id: 'squad', name: 'Squad' },
    { id: 'opposition', name: 'Opposition' },
    { id: 'player', name: 'Player' },
    { id: 'progress', name: 'Progress' }
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#EFEFEF]/95 backdrop-blur-sm border-b border-gray-200/30">
      <div className="px-8 py-2">
        <div className="flex items-center justify-between relative">
          {/* Left - Dorking Wanderers Logo */}
          <div>
            <img 
              src="/league_logos/Dorking Wanderers.webp" 
              alt="Dorking Wanderers FC" 
              className="h-12 w-12"
            />
          </div>
          
          {/* Center - Other Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <img 
              src="/other_logos/image.png" 
              alt="Logo" 
              className="max-w-[300px] h-auto"
            />
          </div>
          
          {/* Right - Navigation */}
          <nav className="flex space-x-1">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => handleTabClick(tab.id)}
      className={`px-6 py-2.5 font-semibold text-sm transition-all duration-150 ease-in-out relative ${
        selectedTab === tab.id
          ? 'text-[#7406B5] bg-white shadow-sm border-b-2 border-[#7406B5]'
          : 'text-gray-600 hover:text-[#7406B5] hover:bg-white/50'
      }`}
    >
      {tab.name}
    </button>
  ))}
</nav>
        </div>
      </div>
    </header>
  )
}