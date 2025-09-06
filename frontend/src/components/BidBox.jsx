import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { itemsAPI } from '../services/api'
import { DollarSign, Clock, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const BidBox = ({ item, onBidUpdate }) => {
  const { user, isAuthenticated } = useAuth()
  const { socket, joinItem, leaveItem } = useSocket()
  const [bidAmount, setBidAmount] = useState('')
  const [bids, setBids] = useState(item.bids || [])
  const [isPlacingBid, setIsPlacingBid] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(item.timeRemaining || 0)

  // Join item room for real-time updates
  useEffect(() => {
    if (socket && item._id) {
      joinItem(item._id)
      
      // Listen for bid updates
      socket.on('bid-update', (data) => {
        if (data.itemId === item._id) {
          setBids(prev => [data.newBid, ...prev])
          onBidUpdate && onBidUpdate(data.currentBid)
          toast.success(`New bid: $${data.newBid.amount} by ${data.newBid.user.name}`)
        }
      })

      return () => {
        leaveItem(item._id)
        socket.off('bid-update')
      }
    }
  }, [socket, item._id, joinItem, leaveItem, onBidUpdate])

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1000
          return newTime > 0 ? newTime : 0
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeRemaining])

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

  const handleBidSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      toast.error('Please login to place a bid')
      return
    }

    if (!bidAmount || isNaN(bidAmount) || parseFloat(bidAmount) <= 0) {
      toast.error('Please enter a valid bid amount')
      return
    }

    const amount = parseFloat(bidAmount)
    const currentBid = item.currentBid || item.startingPrice

    if (amount <= currentBid) {
      toast.error(`Bid must be higher than $${currentBid}`)
      return
    }

    setIsPlacingBid(true)

    try {
      const response = await itemsAPI.placeBid(item._id, amount)
      setBidAmount('')
      toast.success('Bid placed successfully!')
      
      // Update local state
      const newBid = {
        user: { name: user.name, email: user.email },
        amount,
        timestamp: new Date()
      }
      setBids(prev => [newBid, ...prev])
      onBidUpdate && onBidUpdate(amount)
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to place bid'
      toast.error(message)
    } finally {
      setIsPlacingBid(false)
    }
  }

  const isAuctionActive = timeRemaining > 0 && item.status === 'active'
  const isOwner = user && item.owner && user._id === item.owner._id
  const minBid = (item.currentBid || item.startingPrice) + 1

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">Place a Bid</h3>
      </div>
      
      <div className="card-content space-y-4">
        {/* Current bid info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Current Bid</span>
            <span className="text-2xl font-bold text-gray-900">
              ${(item.currentBid || item.startingPrice).toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Time Remaining</span>
            <span className={`font-medium ${
              timeRemaining > 0 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {formatTimeRemaining(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Bid form */}
        {isAuctionActive && !isOwner ? (
          <form onSubmit={handleBidSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Bid (Minimum: ${minBid})
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={minBid.toString()}
                  min={minBid}
                  step="0.01"
                  className="input pl-10"
                  disabled={isPlacingBid}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isPlacingBid || !bidAmount}
              className="btn btn-primary w-full"
            >
              {isPlacingBid ? 'Placing Bid...' : 'Place Bid'}
            </button>
          </form>
        ) : isOwner ? (
          <div className="text-center py-4">
            <p className="text-gray-600">You cannot bid on your own item</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600">This auction has ended</p>
          </div>
        )}

        {/* Recent bids */}
        {bids.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Recent Bids ({bids.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {bids.slice(0, 5).map((bid, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {bid.user?.name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(bid.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    ${bid.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BidBox
