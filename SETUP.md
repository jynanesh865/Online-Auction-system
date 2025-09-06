# 🚀 Quick Setup Guide

## MongoDB Setup (Required)

The backend needs a MongoDB database to work. You have two options:

### Option 1: MongoDB Atlas (Recommended - Free)

1. **Create MongoDB Atlas Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (choose the free tier)

2. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

3. **Create Database User**:
   - Go to "Database Access" in Atlas
   - Click "Add New Database User"
   - Create a username and password
   - Give "Read and write to any database" permissions

4. **Whitelist IP Address**:
   - Go to "Network Access" in Atlas
   - Click "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0) for development

### Option 2: Local MongoDB

If you have MongoDB installed locally:
```bash
# Start MongoDB service
mongod
```

## Backend Setup

1. **Create Environment File**:
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Update .env file**:
   ```env
   # For MongoDB Atlas
   MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/auction-system?retryWrites=true&w=majority
   
   # For Local MongoDB
   MONGO_URI=mongodb://localhost:27017/auction-system
   
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start Backend**:
   ```bash
   npm run dev
   ```

## Frontend Setup

1. **Create Environment File**:
   ```bash
   cd frontend
   cp env.example .env
   ```

2. **Update .env file**:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start Frontend**:
   ```bash
   npm run dev
   ```

## Test the Application

1. **Backend should show**:
   ```
   Server running on port 5000
   Starting auction checker...
   MongoDB connected successfully
   ```

2. **Frontend should open** at http://localhost:5173

3. **Test the flow**:
   - Sign up for a new account
   - Create an auction item
   - Place bids in real-time
   - Check admin dashboard (if you make yourself admin)

## Troubleshooting

### MongoDB Connection Issues

**Error**: `ENOTFOUND _mongodb._tcp.cluster.mongodb.net`

**Solutions**:
1. Check your MongoDB Atlas connection string
2. Ensure your database user has proper permissions
3. Check that your IP is whitelisted in Atlas
4. Verify the cluster is running (not paused)

**Error**: `Authentication failed`

**Solutions**:
1. Check username and password in connection string
2. Ensure user has "Read and write to any database" permissions
3. Try creating a new database user

### Frontend Issues

**Error**: `Failed to fetch` or CORS errors

**Solutions**:
1. Ensure backend is running on port 5000
2. Check that FRONTEND_URL in backend .env matches your frontend URL
3. Verify VITE_API_URL in frontend .env is correct

## Quick Test MongoDB Connection

You can test your MongoDB connection string by running this in your backend directory:

```bash
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/auction-system')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));
"
```

## Need Help?

If you're still having issues:
1. Check the console logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed (`npm install` in both directories)
4. Make sure ports 5000 and 5173 are not being used by other applications
