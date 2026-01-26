import { useState, useEffect } from 'react'
import './Sidebar.css'

const API_URL = import.meta.env.VITE_API_URL

/**
 * Groups conversations by date: Today, Yesterday, Last 7 Days, Last 30 Days, Older
 *
 * @param {Array} conversations - Array of conversation objects with updated_at field
 * @returns {Array} - Array of { label, conversations } groups
 */
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

  // Convert to array and filter out empty groups
  return Object.entries(groups)
    .filter(([_, convs]) => convs.length > 0)
    .map(([label, convs]) => ({ label, conversations: convs }))
}

/**
 * Sidebar component for displaying chat history
 *
 * Props:
 * - onSelectConversation: Function to call when a conversation is clicked
 * - onNewChat: Function to call when "New Chat" is clicked
 * - currentConversationId: ID of the currently active conversation (for highlighting)
 * - refreshTrigger: Number that changes when sidebar should refetch data
 */
function Sidebar({
  onSelectConversation,
  onNewChat,
  currentConversationId,
  refreshTrigger
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Fetch conversations from the API
   * Runs on mount and whenever refreshTrigger changes
   */
  useEffect(() => {
    async function fetchConversations() {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/conversations`)

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
  }, [refreshTrigger]) // Re-fetch when refreshTrigger changes

  const toggleSidebar = () => setIsOpen(!isOpen)

  /**
   * Handle clicking on a conversation
   * Closes sidebar on mobile and loads the conversation
   */
  const handleConversationClick = (convId) => {
    if (onSelectConversation) {
      onSelectConversation(convId)
    }
    // Close sidebar on mobile after selection
    setIsOpen(false)
  }

  /**
   * Handle "New Chat" button click
   */
  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat()
    }
    setIsOpen(false)
  }

  // Filter conversations based on search query
  const filteredConversations = searchQuery
    ? conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations

  // Group filtered conversations by date
  const groupedConversations = groupConversationsByDate(filteredConversations)

  return (
    <>
      {/* Hamburger Button - Mobile only */}
      {!isOpen && (
        <button className="hamburger" onClick={toggleSidebar}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      )}

      {/* Overlay - Mobile only */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* New Chat Button */}
        <button className="new-chat-btn" onClick={handleNewChat}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Chat
        </button>

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

        {/* Chat History */}
        <div className="chat-history">
          {loading ? (
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
      </aside>
    </>
  )
}

export default Sidebar
