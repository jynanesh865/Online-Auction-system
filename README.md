# Online Auction System

A complete MERN stack application for online auctions with real-time bidding, user authentication, and admin management.

## 🚀 Features

### Core Functionality
- **Real-time Bidding** - Live updates using Socket.io
- **User Authentication** - JWT-based login/signup
- **Auction Management** - Create, view, and manage auction items
- **Admin Dashboard** - Complete admin panel for user and item management
- **Responsive Design** - Mobile-first design with TailwindCSS

### User Features
- Browse and search auction items
- Place bids in real-time
- Track personal bidding history
- Create new auction items
- View detailed item information with bidding history

### Admin Features
- Manage users and items
- View system statistics
- End auctions manually
- Delete users and items
- Monitor bidding activity

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client

## 📁 Project Structure

```
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── utils/           # Utility functions
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── App.jsx      # Main app component
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update `.env` with your MongoDB URI and JWT secret:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/auction-system
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update `.env` with your backend URL:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🌐 Deployment

### Backend (Render.com)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGO_URI` in your backend `.env` file

## 📱 Usage

### For Users
1. **Sign Up** - Create a new account
2. **Browse Items** - View all available auction items
3. **Place Bids** - Bid on items you're interested in
4. **Create Items** - List your own items for auction
5. **Track Bids** - Monitor your bidding activity

### For Admins
1. **Login** - Use an admin account
2. **Dashboard** - View system statistics and activity
3. **Manage Users** - View and delete user accounts
4. **Manage Items** - View, delete, and end auctions
5. **Monitor Activity** - Track bidding patterns and user behavior

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Item Endpoints
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new item
- `POST /api/items/:id/bid` - Place a bid

### Admin Endpoints
- `GET /api/admin/dashboard` - Get admin statistics
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/items/:id` - Delete item

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Protected routes
- Admin role verification

## 🎨 UI/UX Features

- Responsive design for all devices
- Real-time updates without page refresh
- Intuitive navigation and user flow
- Modern, clean interface
- Loading states and error handling
- Toast notifications for user feedback

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please open an issue in the GitHub repository.

---

**Happy Bidding! 🎯**
