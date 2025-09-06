import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, DollarSign, User, Eye } from 'lucide-react'
import { itemsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

const MyBids = () => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, active, ended, won

  useEffect(() => {
    fetchMyBids()
  }, [])

  const fetchMyBids = async () => {
    try {
      setLoading(true)
      // For now, we'll fetch all items and filter client-side
      // In a real app, you'd have a dedicated endpoint for user's bids
      const response = await itemsAPI.getItems({ status: 'all' })
      console.log('=== FETCHED DATA FROM BACKEND ===')
      console.log('Response:', response.data)
      console.log('Items from backend:', response.data.items)
      console.log('=== END FETCHED DATA ===')
      setItems(response.data.items)
    } catch (error) {
      toast.error('Failed to fetch your bids')
      console.error('Error fetching bids:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMyBids = () => {
    if (!user) return []
    
    console.log('=== MyBids Debug ===')
    console.log('Current user:', user)
    console.log('All items:', items)
    
    const filteredItems = items.filter(item => {
      console.log(`Checking item: ${item.title}`)
      console.log('Item bids:', item.bids)
      
      const hasMyBids = item.bids?.some(bid => {
        console.log('Checking bid:', bid)
        console.log('Bid user:', bid.user)
        console.log('User match by ID:', bid.user?._id === user._id)
        console.log('User match by email:', bid.user?.email === user.email)
        return bid.user?._id === user._id || bid.user?.email === user.email
      })
      
      console.log('Has my bids:', hasMyBids)
      if (!hasMyBids) return false

      switch (filter) {
        case 'active':
          // Use the same logic as ItemCard - check isActive virtual first, then fallback
          const isActive = item.isActive !== undefined ? item.isActive : (item.status === 'active' && new Date(item.endTime) > new Date())
          return isActive
        case 'ended':
          return item.status === 'ended' || new Date(item.endTime) <= new Date()
        case 'won':
          return item.winner?._id === user._id || item.winner?.email === user.email
        default:
          return true
      }
    })
    
    console.log('Filtered items:', filteredItems)
    console.log('=== End Debug ===')
    
    return filteredItems
  }

  const myBids = getMyBids()

  const getBidStatus = (item) => {
    if (!item.bids || item.bids.length === 0 || !user) return 'No bids'
    
    const myBids = item.bids.filter(bid => bid.user?._id === user._id || bid.user?.email === user.email)
    if (myBids.length === 0) return 'No bids'
    
    const highestBid = item.bids.reduce((prev, current) => 
      (prev.amount > current.amount) ? prev : current
    )
    
    const isWinning = highestBid.user?._id === user._id || highestBid.user?.email === user.email
    const isEnded = item.status === 'ended' || new Date(item.endTime) <= new Date()
    
    if (isEnded) {
      return isWinning ? 'Won' : 'Lost'
    } else {
      return isWinning ? 'Winning' : 'Outbid'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Winning':
        return 'bg-green-100 text-green-800'
      case 'Won':
        return 'bg-green-100 text-green-800'
      case 'Outbid':
        return 'bg-yellow-100 text-yellow-800'
      case 'Lost':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading || !user) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card">
              <div className="flex items-center space-x-4 p-6">
                <div className="h-20 w-20 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
            <p className="mt-2 text-gray-600">
              Track all your auction bids and their current status
            </p>
          </div>
          <button
            onClick={fetchMyBids}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'all', label: 'All Bids' },
            { key: 'active', label: 'Active' },
            { key: 'ended', label: 'Ended' },
            { key: 'won', label: 'Won' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bids List */}
      {myBids.length > 0 ? (
        <div className="space-y-4">
          {myBids.map((item) => {
            const status = getBidStatus(item)
            const myBids = item.bids?.filter(bid => bid.user?._id === user._id || bid.user?.email === user.email) || []
            const myHighestBid = myBids.length > 0 ? Math.max(...myBids.map(bid => bid.amount)) : 0
            
            return (
              <div key={item._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4 p-6">
                  <div className="flex-shrink-0">
                    <img
                      src={item.imageURL}
                      alt={item.title}
                      className="h-20 w-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=No+Image'
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          <Link 
                            to={`/item/${item._id}`}
                            className="hover:text-primary-600 transition-colors"
                          >
                            {item.title}
                          </Link>
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {item.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>My bid: ${myHighestBid.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>Current: ${(item.currentBid || item.startingPrice).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(item.endTime) > new Date() 
                                ? `Ends ${formatDistanceToNow(new Date(item.endTime), { addSuffix: true })}`
                                : 'Ended'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {status}
                        </span>
                        
                        <Link
                          to={`/item/${item._id}`}
                          className="btn btn-outline btn-sm flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <DollarSign className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bids found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? "You haven't placed any bids yet"
              : `No ${filter} bids found`
            }
          </p>
          <Link
            to="/"
            className="btn btn-primary"
          >
            Browse Auctions
          </Link>
        </div>
      )}
    </div>
  )
}

export default MyBids
