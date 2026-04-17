import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import MessagingPage from './pages/MessagingPage'
import CreateListingPage from './pages/CreateListingPage'
import { SignUpPage, SignInPage} from './pages/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="messaging" element={<MessagingPage />}/>
            <Route path="create-listing" element={<CreateListingPage />} />
          </Route>

          <Route path="/signin" element={<SignInPage />}/>
          <Route path="/signup" element={<SignUpPage />}/>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
