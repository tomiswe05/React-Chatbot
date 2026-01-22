import { useState } from 'react'
import './Sidebar.css'

function Sidebar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  // Dummy data for now
  const chatHistory = [
    {
      date: "Today",
      chats: [
        "What is useState?",
        "How do effects work?",
      ]
    },
    {
      date: "Yesterday",
      chats: [
        "Explain useContext",
        "What is JSX?",
      ]
    },
    {
      date: "Last Week",
      chats: [
        "How to manage state?",
        "What are React hooks?",
      ]
    }
  ]

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Hamburger Button */}
      {!isOpen && (
        <button className="hamburger" onClick={toggleSidebar}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      )}

      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Search */}
      <div className="search-box">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* History */}
      <div className="chat-history">
        {chatHistory.map((group, index) => (
          <div className="history-group" key={index}>
            <span className="date-label">{group.date}</span>
            {group.chats.map((chat, chatIndex) => (
              <div className="history-item" key={chatIndex}>
                {chat}
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
    </>
  )
}

export default Sidebar
