# Auction System Backend

A Node.js/Express backend for the Online Auction System with real-time bidding using Socket.io.

## Features

- JWT Authentication
- User Management (User/Admin roles)
- Item Management
- Real-time Bidding with Socket.io
- Admin Dashboard
- MongoDB Integration
- Automatic Auction End Checking

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Items
- `GET /api/items` - Get all items (with pagination, search, filters)
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new item (authenticated)
- `PUT /api/items/:id` - Update item (owner only)
- `POST /api/items/:id/bid` - Place a bid (authenticated)
- `GET /api/items/:id/bids` - Get item bids

### Admin
- `GET /api/admin/dashboard` - Get admin statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/items` - Get all items
- `DELETE /api/admin/items/:id` - Delete item
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/users/:id/role` - Update user role
- `POST /api/admin/items/:id/end` - Manually end auction

## Socket.io Events

### Client to Server
- `join-item` - Join item room for real-time updates
- `leave-item` - Leave item room
- `new-bid` - Emit new bid (handled by server)

### Server to Client
- `bid-update` - Broadcast new bid to all clients in item room

## Environment Variables

Create a `.env` file with:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/auction-system
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your environment variables

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Database Models

### User
- name, email, password (hashed), role, avatar, createdAt

### Item
- title, description, startingPrice, currentBid, imageURL, endTime, owner, bids[], status, winner, createdAt

### Bid
- user, item, amount, timestamp, isWinning

## Deployment

The backend is configured for deployment on Render.com:

1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

## Real-time Features

- Automatic auction end checking (runs every minute)
- Real-time bid updates via Socket.io
- Live countdown timers
- Instant bid notifications
