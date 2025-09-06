# Auction System Frontend

A React + Vite frontend for the Online Auction System with real-time bidding and modern UI.

## Features

- Modern React 18 with Vite
- TailwindCSS for styling
- Real-time bidding with Socket.io
- JWT Authentication
- Responsive design
- Live countdown timers
- Search and filtering
- Admin dashboard
- User bid tracking

## Pages

- **Home** - Browse all auction items with search and filters
- **Item Details** - View item details and place bids in real-time
- **Login/Signup** - User authentication
- **Create Item** - Create new auction items
- **My Bids** - Track user's bidding activity
- **Admin Dashboard** - Manage users and items (admin only)

## Components

- **Navbar** - Navigation with user authentication state
- **ItemCard** - Display auction item previews
- **BidBox** - Real-time bidding interface
- **ProtectedRoute** - Route protection for authenticated users

## Technologies

- React 18
- Vite
- TailwindCSS
- React Router DOM
- Axios
- Socket.io Client
- React Hot Toast
- Lucide React (icons)
- date-fns

## Environment Variables

Create a `.env` file with:

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your environment variables

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Real-time Features

- Live bid updates via Socket.io
- Real-time countdown timers
- Instant bid notifications
- Live auction status updates

## Deployment

The frontend is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Styling

- TailwindCSS for utility-first styling
- Custom component classes in `src/index.css`
- Responsive design with mobile-first approach
- Dark/light theme support ready

## State Management

- React Context for authentication state
- React Context for Socket.io connection
- Local state for component-specific data
- React Router for navigation state
