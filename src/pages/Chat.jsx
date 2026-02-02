import { useState, useRef, useEffect, useCallback } from 'react'
import './Chat.css'
import Sidebar from '../components/Sidebar'
import Greeting from '../components/Greeting'
import ChatInput from '../components/ChatInput'
import { FeatureCards } from '../components/FeatureCard'
import AuthModal from '../components/AuthModal'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL

const suggestionCards = [
  {
    title: "React Hooks",
    description: "Learn about useState, useEffect, and custom hooks"
  },
  {
    title: "Components",
    description: "Build reusable UI components with props and state"
  },
  {
    title: "State Management",
    description: "Manage complex state with Context or Redux"
  }
]

function Chat() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const [conversationId, setConversationId] = useState(null)
  const [refreshSidebar, setRefreshSidebar] = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const { user, getToken } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (message) => {
    if (!message.trim() || loading) return

    setError(null)

    const userMessage = { role: 'user', content: message }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      const headers = { 'Content-Type': 'application/json' }

      if (user) {
        const token = await getToken()
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question: message,
          conversation_id: conversationId,
          top_k: 5
        })
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      if (data.conversation_id) {
        setConversationId(data.conversation_id)
      }

      const assistantMessage = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources
      }
      setMessages(prev => [...prev, assistantMessage])

      if (user) {
        setRefreshSidebar(prev => prev + 1)
      }

    } catch (err) {
      setError(err.message || 'Failed to get response')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const loadConversation = useCallback(async (convId) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const token = await getToken()
      const response = await fetch(`${API_URL}/conversations/${convId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to load conversation: ${response.status}`)
      }

      const data = await response.json()

      setConversationId(convId)

      const loadedMessages = data.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        sources: msg.sources || []
      }))

      setMessages(loadedMessages)

    } catch (err) {
      setError(err.message || 'Failed to load conversation')
    } finally {
      setLoading(false)
    }
  }, [user, getToken])

  const startNewChat = useCallback(() => {
    setConversationId(null)
    setMessages([])
    setError(null)
  }, [])

  const handleCardClick = (card) => {
    handleSend(`Tell me about ${card.title}`)
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User'
  const hasMessages = messages.length > 0

  return (
    <div className="chat-page">
      <Sidebar
        onSelectConversation={loadConversation}
        onNewChat={startNewChat}
        onAuthClick={() => setShowAuthModal(true)}
        currentConversationId={conversationId}
        refreshTrigger={refreshSidebar}
      />

      <section className="chat-container">
        <div className="chat-content">
          {!hasMessages ? (
            <>
              <Greeting username={displayName} />
              <FeatureCards cards={suggestionCards} onCardClick={handleCardClick} />
            </>
          ) : (
            <div className="messages-container">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.role}`}>
                  <div className="message-content">
                    {msg.content}
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="message-sources">
                      <span className="sources-label">Sources:</span>
                      {msg.sources.map((source, idx) => (
                        <span key={idx} className="source-tag">
                          {source.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="message assistant">
                  <div className="message-content loading">
                    <span className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
        <ChatInput onSend={handleSend} loading={loading} />
      </section>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  )
}

export default Chat
