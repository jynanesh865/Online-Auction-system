import { useState, useEffect } from 'react'
import { Search, Filter, Clock, DollarSign } from 'lucide-react'
import { itemsAPI } from '../services/api'
import ItemCard from '../components/ItemCard'
import toast from 'react-hot-toast'

const Home = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('active')
  const [sortBy, setSortBy] = useState('endTime')
  const [sortOrder, setSortOrder] = useState('asc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalItems: 0,
    activeItems: 0,
    totalBids: 0
  })

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await itemsAPI.getItems({
        search,
        status,
        sortBy,
        sortOrder,
        page,
        limit: 12
      })
      
      console.log('API Response:', response.data)
      console.log('Items from API:', response.data.items)
      response.data.items.forEach((item, index) => {
        console.log(`Item ${index}:`, item)
        console.log(`Item ${index} ID:`, item._id)
      })
      
      setItems(response.data.items)
      setTotalPages(response.data.totalPages)
      setStats({
        totalItems: response.data.totalItems,
        activeItems: response.data.items.filter(item => item.isActive).length,
        totalBids: response.data.items.reduce((sum, item) => sum + (item.bids?.length || 0), 0)
      })
    } catch (error) {
      toast.error('Failed to fetch items')
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [search, status, sortBy, sortOrder, page])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchItems()
  }

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
    setPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to AuctionHub
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover amazing items and place your bids in real-time auctions
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-4">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalItems}</h3>
            <p className="text-gray-600">Total Items</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.activeItems}</h3>
            <p className="text-gray-600">Active Auctions</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-4">
              <Filter className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalBids}</h3>
            <p className="text-gray-600">Total Bids</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <button
              onClick={() => handleStatusChange('active')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                status === 'active'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => handleStatusChange('ended')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                status === 'ended'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ended
            </button>
            <button
              onClick={() => handleStatusChange('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                status === 'all'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input py-1 text-sm"
            >
              <option value="endTime">End Time</option>
              <option value="currentBid">Current Bid</option>
              <option value="createdAt">Created Date</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="input py-1 text-sm"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-outline btn-sm disabled:opacity-50"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-outline btn-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">
            {search ? 'Try adjusting your search terms' : 'No auction items available at the moment'}
          </p>
        </div>
      )}
    </div>
  )
}

export default Home
