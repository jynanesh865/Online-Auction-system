const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MONGO_URI:', process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });
    
    console.log('✅ MongoDB connected successfully!');
    
    // Test a simple query
    const Item = require('./models/Item');
    const count = await Item.countDocuments();
    console.log(`✅ Found ${count} items in database`);
    
    // Test finding items with bids
    const itemsWithBids = await Item.find({ 'bids.0': { $exists: true } }).populate('bids.user', 'name email');
    console.log(`✅ Found ${itemsWithBids.length} items with bids`);
    
    itemsWithBids.forEach((item, index) => {
      console.log(`Item ${index + 1}: ${item.title}`);
      console.log(`Bids: ${item.bids.length}`);
      item.bids.forEach((bid, bidIndex) => {
        console.log(`  Bid ${bidIndex + 1}: ${bid.user?.name} (${bid.user?.email}) - $${bid.amount}`);
      });
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();



