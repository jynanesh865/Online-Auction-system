import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, DollarSign, User, Calendar, ArrowLeft } from 'lucide-react'
import { itemsAPI } from '../services/api'
import BidBox from '../components/BidBox'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

const ItemDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentBid, setCurrentBid] = useState(0)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        const response = await itemsAPI.getItem(id)
        setItem(response.data)
        setCurrentBid(response.data.currentBid || response.data.startingPrice)
      } catch (error) {
        toast.error('Item not found')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id, navigate])

  const handleBidUpdate = (newBid) => {
    setCurrentBid(newBid)
    setItem(prev => ({
      ...prev,
      currentBid: newBid
    }))
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h2>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Back to Home
        </button>
      </div>
    )
  }

  const timeRemaining = item.timeRemaining || (item.endTime - new Date())
  const isActive = item.isActive !== undefined ? item.isActive : (item.status === 'active' && item.endTime > new Date())

  const formatTimeRemaining = (ms) => {
    if (ms <= 0) return 'Auction Ended'
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Home</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Item Image */}
        <div className="space-y-4">
          <div className="relative">
            <img
              src={item.imageURL}
              alt={item.title}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
              }}
            />
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isActive ? 'Active' : 'Ended'}
              </span>
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {item.title}
            </h1>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 px-6 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-gray-600" />
                  <span className="text-lg font-medium text-gray-700">Current Bid</span>
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  ${currentBid.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between py-4 px-6 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span className="text-lg font-medium text-gray-700">Time Remaining</span>
                </div>
                <span className={`text-xl font-bold ${
                  timeRemaining > 0 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {formatTimeRemaining(timeRemaining)}
                </span>
              </div>

              <div className="flex items-center justify-between py-4 px-6 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-lg font-medium text-gray-700">Owner</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {item.owner?.name}
                </span>
              </div>

              <div className="flex items-center justify-between py-4 px-6 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <span className="text-lg font-medium text-gray-700">Ends At</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {new Date(item.endTime).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Bidding Section */}
          <BidBox 
            item={item} 
            onBidUpdate={handleBidUpdate}
          />
        </div>
      </div>

      {/* Bids History */}
      {item.bids && item.bids.length > 0 && (
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Bidding History</h3>
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bidder
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {item.bids
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((bid, index) => (
                    <tr key={index} className={index === 0 ? 'bg-green-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {bid.user?.name || 'Anonymous'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {bid.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${bid.amount.toLocaleString()}
                        </div>
                        {index === 0 && (
                          <div className="text-xs text-green-600 font-medium">
                            Winning Bid
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(new Date(bid.timestamp), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ItemDetails
