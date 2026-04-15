import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import CreateListingPage from './pages/CreateListingPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-listing" element={<CreateListingPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
