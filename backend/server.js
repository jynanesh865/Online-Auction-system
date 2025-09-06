// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const { createServer } = require('http');
// const { Server } = require('socket.io');
// const { startAuctionChecker } = require('./utils/auctionChecker');
// require('dotenv').config();

// const app = express();
// const server = createServer(app);

// // Socket.io setup
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || "http://localhost:5173",
//     methods: ["GET", "POST"]
//   }
// });

// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || "http://localhost:5173",
//   credentials: true
// }));
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/items', require('./routes/items'));
// app.use('/api/admin', require('./routes/admin'));

// // Socket.io connection handling
// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   // Join item room for real-time bidding
//   socket.on('join-item', (itemId) => {
//     socket.join(`item-${itemId}`);
//     console.log(`User ${socket.id} joined item ${itemId}`);
//   });

//   // Leave item room
//   socket.on('leave-item', (itemId) => {
//     socket.leave(`item-${itemId}`);
//     console.log(`User ${socket.id} left item ${itemId}`);
//   });

//   // Handle new bid
//   socket.on('new-bid', (data) => {
//     socket.to(`item-${data.itemId}`).emit('bid-update', data);
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//   });
// });

// // Make io available to routes
// app.set('io', io);

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://jynaneshchappa865_db_user:chappa123@cluster0.xebt9nf.mongodb.net/')
//   .then(() => console.log('MongoDB connected successfully'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
  
//   if (err.type === 'entity.too.large') {
//     return res.status(413).json({ 
//       message: 'File too large. Please choose a smaller image (max 5MB)' 
//     });
//   }
  
//   res.status(500).json({ 
//     message: 'Something went wrong!',
//     error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   // Start checking for expired auctions
//   startAuctionChecker();
// });

// module.exports = { app, io };
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { startAuctionChecker } = require('./utils/auctionChecker');
require('dotenv').config();

const app = express();
const server = createServer(app);

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173", // local frontend
  "https://online-auction-system-orpin.vercel.app", // custom Vercel domain
  "https://online-auction-system-qanskvydo-jynanesh-chappas-projects.vercel.app" // Vercel default domain
];

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like Postman)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/admin', require('./routes/admin'));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join item room for real-time bidding
  socket.on('join-item', (itemId) => {
    socket.join(`item-${itemId}`);
    console.log(`User ${socket.id} joined item ${itemId}`);
  });

  // Leave item room
  socket.on('leave-item', (itemId) => {
    socket.leave(`item-${itemId}`);
    console.log(`User ${socket.id} left item ${itemId}`);
  });

  // Handle new bid
  socket.on('new-bid', (data) => {
    socket.to(`item-${data.itemId}`).emit('bid-update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://jynaneshchappa865_db_user:chappa123@cluster0.xebt9nf.mongodb.net/')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      message: 'File too large. Please choose a smaller image (max 5MB)' 
    });
  }

  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Start checking for expired auctions
  startAuctionChecker();
});

module.exports = { app, io };
