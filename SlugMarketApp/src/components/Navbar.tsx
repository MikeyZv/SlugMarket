import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-yellow-500 tracking-tight">
          🐌 SlugMarket
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Browse
          </Link>
          <Link
            to="/messaging"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Messaging
          </Link>
          <Link
            to="/create-listing"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"


          >
            + Post a Listing
          </Link>
          <Link
            to="/signin"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  )
}
