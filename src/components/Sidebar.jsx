import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import './Sidebar.css'

const API_URL = import.meta.env.VITE_API_URL

function groupConversationsByDate(conversations) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)
  const lastMonth = new Date(today)
  lastMonth.setDate(lastMonth.getDate() - 30)

  const groups = {
    'Today': [],
    'Yesterday': [],
    'Last 7 Days': [],
    'Last 30 Days': [],
    'Older': []
  }

  conversations.forEach(conv => {
    const convDate = new Date(conv.updated_at)

    if (convDate >= today) {
      groups['Today'].push(conv)
    } else if (convDate >= yesterday) {
      groups['Yesterday'].push(conv)
    } else if (convDate >= lastWeek) {
      groups['Last 7 Days'].push(conv)
    } else if (convDate >= lastMonth) {
      groups['Last 30 Days'].push(conv)
    } else {
      groups['Older'].push(conv)
    }
  })

  return Object.entries(groups)
    .filter(([_, convs]) => convs.length > 0)
    .map(([label, convs]) => ({ label, conversations: convs }))
}

function Sidebar({
  onSelectConversation,
  onNewChat,
  onAuthClick,
  currentConversationId,
  refreshTrigger
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { user, logout, getToken } = useAuth()

  useEffect(() => {
    if (!user) {
      setConversations([])
      return
    }

    async function fetchConversations() {
      try {
        setLoading(true)
        const token = await getToken()
        const response = await fetch(`${API_URL}/conversations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`)
        }

        const data = await response.json()
        setConversations(data.conversations || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching conversations:', err)
        setError('Failed to load chat history')
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [refreshTrigger, user])

  const toggleSidebar = () => setIsOpen(!isOpen)

  const handleConversationClick = (convId) => {
    if (onSelectConversation) {
      onSelectConversation(convId)
    }
    setIsOpen(false)
  }

  const handleNewChat = () => {
    if (!user) {
      if (onAuthClick) onAuthClick()
      return
    }
    if (onNewChat) {
      onNewChat()
    }
    setIsOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    if (onNewChat) onNewChat()
  }

  const filteredConversations = searchQuery
    ? conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations

  const groupedConversations = groupConversationsByDate(filteredConversations)

  return (
    <>
      {!isOpen && (
        <button className="hamburger" onClick={toggleSidebar}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      )}

      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button className="new-chat-btn" onClick={handleNewChat}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Chat
        </button>

        {user && (
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
        )}

        <div className="chat-history">
          {!user ? (
            <div className="sidebar-empty">
              Sign in to save and view your chat history
            </div>
          ) : loading ? (
            <div className="sidebar-loading">Loading...</div>
          ) : error ? (
            <div className="sidebar-error">{error}</div>
          ) : groupedConversations.length === 0 ? (
            <div className="sidebar-empty">
              {searchQuery ? 'No matching chats' : 'No conversations yet'}
            </div>
          ) : (
            groupedConversations.map((group, index) => (
              <div className="history-group" key={index}>
                <span className="date-label">{group.label}</span>
                {group.conversations.map((conv) => (
                  <div
                    className={`history-item ${conv.id === currentConversationId ? 'active' : ''}`}
                    key={conv.id}
                    onClick={() => handleConversationClick(conv.id)}
                  >
                    {conv.title}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          {user ? (
            <div className="user-info">
              <span className="user-email">{user.displayName || user.email}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          ) : (
            <button className="signin-btn" onClick={onAuthClick}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
              </svg>
              Sign In
            </button>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
