const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
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
  },
  isWinning: {
    type: Boolean,
    default: false
  }
});

// Index for better query performance
bidSchema.index({ item: 1, amount: -1 });
bidSchema.index({ user: 1 });
bidSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Bid', bidSchema);
