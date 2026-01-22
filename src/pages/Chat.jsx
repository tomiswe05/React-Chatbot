import { useState, useRef, useEffect } from 'react'
import './Chat.css'
import Sidebar from '../components/Sidebar'
import Greeting from '../components/Greeting'
import ChatInput from '../components/ChatInput'
import { FeatureCards } from '../components/FeatureCard'

const API_URL = 'http://localhost:8000/api'

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (message) => {
    if (!message.trim() || loading) return

    setError(null)

    // Add user message to chat
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
          top_k: 5
        })
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      // Add assistant message with sources
      const assistantMessage = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources
      }
      setMessages(prev => [...prev, assistantMessage])

    } catch (err) {
      setError(err.message || 'Failed to get response')
      // Remove the user message if request failed
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = (card) => {
    handleSend(`Tell me about ${card.title}`)
  }

  const hasMessages = messages.length > 0

  return (
    <div className="chat-page">
      <Sidebar />

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
