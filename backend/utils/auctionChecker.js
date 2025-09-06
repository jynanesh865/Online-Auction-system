const Item = require('../models/Item');

// Function to check and end expired auctions
const checkExpiredAuctions = async () => {
  try {
    const now = new Date();
    
    // Find all active auctions that have ended
    const expiredItems = await Item.find({
      status: 'active',
      endTime: { $lte: now }
    });

    console.log(`Found ${expiredItems.length} expired auctions`);

    // End each expired auction
    for (const item of expiredItems) {
      await item.endAuction();
      console.log(`Ended auction for item: ${item.title}`);
    }

    return expiredItems.length;
  } catch (error) {
    console.error('Error checking expired auctions:', error);
    return 0;
  }
};

// Run the check every minute
const startAuctionChecker = () => {
  console.log('Starting auction checker...');
  
  // Run immediately
  checkExpiredAuctions();
  
  // Then run every minute
  setInterval(checkExpiredAuctions, 60000);
};

module.exports = {
  checkExpiredAuctions,
  startAuctionChecker
};
