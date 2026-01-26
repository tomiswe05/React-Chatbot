import { useState, useRef, useEffect, useCallback } from 'react'
import './Chat.css'
import Sidebar from '../components/Sidebar'
import Greeting from '../components/Greeting'
import ChatInput from '../components/ChatInput'
import { FeatureCards } from '../components/FeatureCard'

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

  // NEW: Track which conversation we're in
  // null = new chat (not saved yet), string = existing conversation ID
  const [conversationId, setConversationId] = useState(null)

  // NEW: Track when sidebar needs to refresh (after new message)
  const [refreshSidebar, setRefreshSidebar] = useState(0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  /**
   * Send a message to the API
   *
   * Key changes:
   * 1. Include conversation_id in request (if we have one)
   * 2. Store the returned conversation_id (for new conversations)
   * 3. Trigger sidebar refresh after successful message
   */
  const handleSend = async (message) => {
    if (!message.trim() || loading) return

    setError(null)

    // Add user message to chat immediately (optimistic UI)
    const userMessage = { role: 'user', content: message }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: message,
          conversation_id: conversationId,  // NEW: Include conversation ID
          top_k: 5
        })
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      // NEW: Store the conversation ID from response
      // This is especially important for new conversations
      if (data.conversation_id) {
        setConversationId(data.conversation_id)
      }

      // Add assistant message with sources
      const assistantMessage = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources
      }
      setMessages(prev => [...prev, assistantMessage])

      // NEW: Trigger sidebar refresh to show updated conversation list
      setRefreshSidebar(prev => prev + 1)

    } catch (err) {
      setError(err.message || 'Failed to get response')
      // Remove the user message if request failed
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  /**
   * NEW: Load an existing conversation from the sidebar
   *
   * Fetches all messages for a conversation and displays them
   */
  const loadConversation = useCallback(async (convId) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/conversations/${convId}`)

      if (!response.ok) {
        throw new Error(`Failed to load conversation: ${response.status}`)
      }

      const data = await response.json()

      // Set the conversation ID
      setConversationId(convId)

      // Transform messages to match our format
      // API returns: { id, role, content, sources, created_at }
      // We need: { role, content, sources }
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
  }, [])

  /**
   * NEW: Start a fresh conversation
   *
   * Clears messages and resets conversation ID
   */
  const startNewChat = useCallback(() => {
    setConversationId(null)
    setMessages([])
    setError(null)
  }, [])

  const handleCardClick = (card) => {
    handleSend(`Tell me about ${card.title}`)
  }

  const hasMessages = messages.length > 0

  return (
    <div className="chat-page">
      {/* NEW: Pass functions and state to Sidebar */}
      <Sidebar
        onSelectConversation={loadConversation}
        onNewChat={startNewChat}
        currentConversationId={conversationId}
        refreshTrigger={refreshSidebar}
      />

      <section className="chat-container">
        <div className="chat-content">
          {!hasMessages ? (
            <>
              <Greeting username="User" />
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
    </div>
  )
}

export default Chat
