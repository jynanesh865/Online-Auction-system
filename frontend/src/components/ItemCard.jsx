import { Link } from 'react-router-dom'
import { Clock, DollarSign, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const ItemCard = ({ item }) => {
  // Debug logging
  console.log('ItemCard received item:', item)
  console.log('Item ID:', item._id)
  
  const timeRemaining = item.timeRemaining || (item.endTime - new Date())
  const isActive = item.isActive !== undefined ? item.isActive : (item.status === 'active' && item.endTime > new Date())
  
  const formatTimeRemaining = (ms) => {
    if (ms <= 0) return 'Ended'
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={item.imageURL}
          alt={item.title}
          className="w-full h-48 object-cover rounded-t-lg"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
          }}
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isActive ? 'Active' : 'Ended'}
          </span>
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {item.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Current Bid</span>
            </div>
            <span className="font-semibold text-lg text-gray-900">
              ${item.currentBid?.toLocaleString() || item.startingPrice?.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Time Left</span>
            </div>
            <span className={`text-sm font-medium ${
              timeRemaining > 0 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {formatTimeRemaining(timeRemaining)}
            </span>
          </div>
          
          <div className="flex items-center space-x-1 text-gray-600">
            <User className="h-4 w-4" />
            <span className="text-sm">Owner: {item.owner?.name}</span>
          </div>
        </div>
      </div>
      
      <div className="card-footer">
        <Link
          to={`/item/${item._id}`}
          className="btn btn-primary w-full"
        >
          {isActive ? 'View & Bid' : 'View Details'}
        </Link>
      </div>
    </div>
  )
}

export default ItemCard
