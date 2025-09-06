const express = require('express');
const { body, validationResult } = require('express-validator');
const Item = require('../models/Item');
const Bid = require('../models/Bid');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/items
// @desc    Get all auction items with pagination and filtering
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || '';
    const status = req.query.status || 'active';
    const sortBy = req.query.sortBy || 'endTime';
    const sortOrder = req.query.sortOrder || 'asc';

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') {
      filter.status = 'active';
      filter.endTime = { $gt: new Date() };
    } else if (status === 'ended') {
      filter.status = 'ended';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const items = await Item.find(filter)
      .populate('owner', 'name email')
      .populate('bids.user', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Item.countDocuments(filter);

    // Add virtual fields
    const itemsWithVirtuals = items.map(item => ({
      ...item.toObject(),
      timeRemaining: Math.max(0, item.endTime - new Date()),
      isActive: item.status === 'active' && item.endTime > new Date(),
      highestBidder: item.bids.length > 0 ? 
        item.bids.reduce((prev, current) => 
          (prev.amount > current.amount) ? prev : current
        ).user : null
    }));

    console.log('=== BACKEND: Returning items ===');
    console.log('Total items found:', items.length);
    items.forEach((item, index) => {
      console.log(`Item ${index + 1}: ${item.title}`);
      console.log(`Item ${index + 1} ID: ${item._id}`);
      console.log(`Bids count: ${item.bids.length}`);
      item.bids.forEach((bid, bidIndex) => {
        console.log(`  Bid ${bidIndex + 1}: User ${bid.user?.name} (${bid.user?.email}) - Amount: ${bid.amount}`);
      });
    });
    console.log('Items with virtuals:', itemsWithVirtuals.map(item => ({ id: item._id, title: item.title })));
    console.log('=== END BACKEND DEBUG ===');

    res.json({
      items: itemsWithVirtuals,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalItems: total
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/items/:id
// @desc    Get single auction item with bids
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('bids.user', 'name email')
      .populate('winner', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Add virtual fields
    const itemWithVirtuals = {
      ...item.toObject(),
      timeRemaining: Math.max(0, item.endTime - new Date()),
      isActive: item.status === 'active' && item.endTime > new Date(),
      highestBidder: item.bids.length > 0 ? 
        item.bids.reduce((prev, current) => 
          (prev.amount > current.amount) ? prev : current
        ).user : null
    };

    res.json(itemWithVirtuals);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/items
// @desc    Create new auction item
// @access  Private
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('startingPrice').isNumeric().isFloat({ min: 0 }).withMessage('Starting price must be a positive number'),
  body('imageURL').custom((value) => {
    // Allow both URLs and base64 data URLs
    const isUrl = /^https?:\/\/.+/.test(value);
    const isBase64 = /^data:image\/[a-zA-Z]+;base64,/.test(value);
    
    if (!isUrl && !isBase64) {
      throw new Error('Please provide a valid image URL or upload an image file');
    }
    return true;
  }),
  body('endTime').isISO8601().withMessage('Please provide a valid end time')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { title, description, startingPrice, imageURL, endTime } = req.body;

    // Validate end time is in the future
    const endDate = new Date(endTime);
    if (endDate <= new Date()) {
      return res.status(400).json({ message: 'End time must be in the future' });
    }

    const item = new Item({
      title,
      description,
      startingPrice,
      currentBid: startingPrice,
      imageURL,
      endTime: endDate,
      owner: req.user._id
    });

    await item.save();
    await item.populate('owner', 'name email');

    res.status(201).json({
      message: 'Item created successfully',
      item
    });
  } catch (error) {
    console.error('Create item error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// @route   POST /api/items/:id/bid
// @desc    Place a bid on an item
// @access  Private
router.post('/:id/bid', authenticateToken, [
  body('amount').isNumeric().isFloat({ min: 0 }).withMessage('Bid amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { amount } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if auction is still active
    if (!item.isActive) {
      return res.status(400).json({ message: 'Auction has ended' });
    }

    // Check if user is not the owner
    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot bid on your own item' });
    }

    // Check if bid is higher than current bid
    if (amount <= item.currentBid) {
      return res.status(400).json({ 
        message: `Bid must be higher than current bid of $${item.currentBid}` 
      });
    }

    // Add bid to item with user info
    const bidData = {
      user: req.user._id,
      amount: amount,
      timestamp: new Date()
    };
    
    console.log('Adding bid for user:', req.user._id, 'amount:', amount);
    item.bids.push(bidData);
    item.currentBid = amount;
    await item.save();
    
    // Populate the user info for the bids
    await item.populate('bids.user', 'name email');
    console.log('Item saved with bids:', item.bids);

    // Create separate bid record
    const bid = new Bid({
      user: req.user._id,
      item: item._id,
      amount,
      isWinning: true
    });
    await bid.save();

    // Update previous winning bids
    await Bid.updateMany(
      { item: item._id, _id: { $ne: bid._id } },
      { isWinning: false }
    );

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`item-${item._id}`).emit('bid-update', {
      itemId: item._id,
      newBid: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email
        },
        amount,
        timestamp: new Date()
      },
      currentBid: item.currentBid
    });

    // Populate user info for response
    await item.populate('bids.user', 'name email');

    res.json({
      message: 'Bid placed successfully',
      item,
      bid
    });
  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/items/:id/bids
// @desc    Get all bids for an item
// @access  Public
router.get('/:id/bids', async (req, res) => {
  try {
    const bids = await Bid.find({ item: req.params.id })
      .populate('user', 'name email')
      .sort({ amount: -1, timestamp: -1 });

    res.json(bids);
  } catch (error) {
    console.error('Get bids error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/items/:id
// @desc    Update auction item (only by owner)
// @access  Private
router.put('/:id', authenticateToken, [
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('imageURL').optional().isURL().withMessage('Please provide a valid image URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the owner
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own items' });
    }

    // Check if auction has ended
    if (!item.isActive) {
      return res.status(400).json({ message: 'Cannot update ended auction' });
    }

    const { title, description, imageURL } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (imageURL) updateData.imageURL = imageURL;

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    res.json({
      message: 'Item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
