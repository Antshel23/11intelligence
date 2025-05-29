import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-[#04122D] flex">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-[#EEEEEE] h-screen fixed left-0 top-0"
      >
        <nav className="p-6 space-y-6">
          <div className="space-y-4">
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-white transition-colors duration-200">
              Match
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-white transition-colors duration-200">
              Opponent
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-white transition-colors duration-200">
              Recruitment
            </button>
          </div>
        </nav>
      </motion.aside>

      {/* Main content */}
      <div className="ml-64 w-full">
        {/* Header */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="h-16 bg-[#EEEEEE] fixed top-0 right-0 left-64 z-10 flex items-center px-6"
        >
          <img src="/image.png" alt="Company Logo" className="h-10" />
        </motion.header>

        {/* Main content area */}
        <main className="pt-16 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}