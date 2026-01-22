import { useState } from 'react'
import './Chat.css'
import Sidebar from '../components/Sidebar'
import Greeting from '../components/Greeting'
import ChatInput from '../components/ChatInput'
import { FeatureCards } from '../components/FeatureCard'

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

  const handleSend = (message) => {
    console.log('Message sent:', message)
    // TODO: Connect to backend API
  }

  const handleCardClick = (card) => {
    handleSend(`Tell me about ${card.title}`)
  }

  return (
    <div className="chat-page">
      <Sidebar />

      <section className="chat-container">
        <div className="chat-content">
          <Greeting username="User" />
          <FeatureCards cards={suggestionCards} onCardClick={handleCardClick} />
        </div>
        <ChatInput onSend={handleSend} loading={loading} />
      </section>
    </div>
  )
}

export default Chat
