const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Bid amount must be positive']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required'],
    min: [0, 'Starting price must be positive']
  },
  currentBid: {
    type: Number,
    default: 0
  },
  imageURL: {
    type: String,
    required: [true, 'Image URL is required'],
    validate: {
      validator: function(value) {
        // Allow both HTTP/HTTPS URLs and base64 data URLs
        const isUrl = /^https?:\/\/.+/.test(value);
        const isBase64 = /^data:image\/[a-zA-Z]+;base64,/.test(value);
        return isUrl || isBase64;
      },
      message: 'Please provide a valid image URL or upload an image file'
    }
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(value) {
        // Allow past dates if the auction is already ended
        if (this.status === 'ended') {
          return true;
        }
        return value > new Date();
      },
      message: 'End time must be in the future'
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bids: [bidSchema],
  status: {
    type: String,
    enum: ['active', 'ended', 'cancelled'],
    default: 'active'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for highest bidder
itemSchema.virtual('highestBidder').get(function() {
  if (this.bids.length === 0) return null;
  const highestBid = this.bids.reduce((prev, current) => 
    (prev.amount > current.amount) ? prev : current
  );
  return highestBid.user;
});

// Virtual for time remaining
itemSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const timeLeft = this.endTime - now;
  return timeLeft > 0 ? timeLeft : 0;
});

// Virtual for is active
itemSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.endTime > new Date();
});

// Method to add a bid
itemSchema.methods.addBid = function(userId, amount) {
  if (!this.isActive) {
    throw new Error('Auction has ended');
  }
  
  if (amount <= this.currentBid) {
    throw new Error('Bid must be higher than current bid');
  }
  
  this.bids.push({
    user: userId,
    amount: amount,
    timestamp: new Date()
  });
  
  this.currentBid = amount;
  
  return this.save();
};

// Method to end auction
itemSchema.methods.endAuction = function() {
  this.status = 'ended';
  if (this.bids.length > 0) {
    this.winner = this.highestBidder;
  }
  return this.save();
};

// Index for better query performance
itemSchema.index({ endTime: 1, status: 1 });
itemSchema.index({ owner: 1 });
itemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Item', itemSchema);
