import reactLogo from '../assets/react.svg'
import './Greeting.css'

function Greeting({ username = "User" }) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  return (
    <div className="greeting">
      <div className="greeting-avatar">
        <img src={reactLogo} alt="React Logo" className="avatar-icon" />
      </div>
      <h1 className="greeting-text">
        {getGreeting()}, {username}.
        <br />
        Ask me Anything About React?
      </h1>
    </div>
  )
}

export default Greeting
