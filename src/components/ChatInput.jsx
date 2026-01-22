import { useState, useEffect, useRef } from 'react'
import './ChatInput.css'

function ChatInput({ onSend, loading }) {
  const [message, setMessage] = useState('')
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    // Handle visual viewport changes (keyboard open/close)
    const handleViewportResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height
        const windowHeight = window.innerHeight
        const keyboardH = windowHeight - viewportHeight
        setKeyboardHeight(keyboardH > 0 ? keyboardH : 0)
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize)
      window.visualViewport.addEventListener('scroll', handleViewportResize)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize)
        window.visualViewport.removeEventListener('scroll', handleViewportResize)
      }
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !loading) {
      onSend(message)
      setMessage('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div
      className="chat-input-wrapper"
      style={{ paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : undefined }}
    >
      <form className="chat-input" onSubmit={handleSubmit}>
        <div className="input-container">
          <textarea
            ref={inputRef}
            className="message-input"
            placeholder="Message AI Chat..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
          />
          <button
            type="submit"
            className={`send-button ${message.trim() ? 'active' : ''}`}
            disabled={!message.trim() || loading}
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <svg
                className="send-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatInput
