import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Chat from './pages/Chat'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat />} />
        {/* Add more routes here later */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
