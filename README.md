# BekasShop - Full-Stack E-commerce Application - Miniapp integration

A modern, full-stack e-commerce application built with React.js frontend, Node.js backend, and PostgresSql database, featuring FIB (First Iraqi Bank) payment integration.
This web app is for testing purposes only, to test app in app integraton which is currently the latest feature of FIRST IRAQI BANK.

## 🚀 Features

### Frontend (React.js)
- **Modern UI/UX**: Beautiful, responsive design with gradient backgrounds
- **User Authentication**: Login/Register with JWT tokens
- **Product Catalog**: Display products with images, descriptions, and prices
- **Shopping Cart**: Add/remove items, quantity adjustment, persistent storage
- **Order Management**: View order history and status
- **Payment Integration**: FIB payment gateway integration
- **Responsive Design**: Works on all device sizes

### Backend (Node.js + Express)
- **RESTful API**: Complete API for products, users, orders, and payments
- **Authentication**: JWT-based user authentication and authorization
- **Database**: PostgresSql database with automatic table creation
- **Payment Processing**: FIB payment gateway integration
- **Error Handling**: Comprehensive error handling and validation

### Database (PostgresSql)
- **Users Table**: User accounts with secure password hashing
- **Products Table**: Product catalog with images and stock management
- **Orders Table**: Order tracking with payment information
- **Order Items Table**: Detailed order line items

## 🛠️ Tech Stack

### Frontend
- **React.js 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **React Icons**: Beautiful icon library
- **CSS3**: Modern styling with gradients and animations

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **SQLite3**: Lightweight database
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **CORS**: Cross-origin resource sharing

### Database
- **SQLite**: File-based database (no server setup required)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd miniapp-integration
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Start the development servers**

   **Option 1: Run both servers separately**
   ```bash
   # Terminal 1 - Start backend server
   npm run dev
   
   # Terminal 2 - Start frontend server
   cd client
   npm start
   ```

   **Option 2: Use the convenience script**
   ```bash
   # Install all dependencies and start both servers
   npm run install-all
   npm run dev
   npm run client
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🗄️ Database Setup

The SQLite database is automatically created when you first run the server. The database file will be created at `server/database.sqlite`.

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Order items table
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  product_id INTEGER,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders (id),
  FOREIGN KEY (product_id) REFERENCES products (id)
);
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
PORT=5000
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### FIB Payment Configuration
Update the FIB payment settings in `server/index.js`:

```javascript
// FIB Payment integration endpoint
app.post('/api/payment/fib', (req, res) => {
  // Add your FIB API credentials and configuration here
  const FIB_CONFIG = {
    clientId: 'your_client_id_here',
    clientSecret: 'your_client_secret_here',
    baseUrl: 'https://api.fib.iq'
  };
  // ... payment processing logic
});
```

## 📱 Available Scripts

### Root Directory
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run client     # Start React development server
npm run build      # Build React app for production
npm run install-all # Install both server and client dependencies
```

### Client Directory
```bash
npm start          # Start React development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

## 🚀 Deployment

### Development
1. Start the backend server: `npm run dev`
2. Start the frontend server: `cd client && npm start`
3. Access the app at http://localhost:3000

### Production
1. Build the React app: `cd client && npm run build`
2. Set NODE_ENV=production
3. Start the server: `npm start`
4. The server will serve the built React app

## 🔐 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured for cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries

## 🎨 UI/UX Features

- **Modern Design**: Clean, gradient-based design
- **Responsive Layout**: Works on mobile, tablet, and desktop
- **Smooth Animations**: CSS transitions and hover effects
- **Loading States**: Spinner animations for better UX
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time form validation

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Orders
- `POST /api/orders` - Create new order (authenticated)
- `GET /api/orders` - Get user orders (authenticated)

### Payments
- `POST /api/payment/fib` - Process FIB payment

## 🔄 Project Structure

```
miniapp-integration/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # React entry point
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js           # Express server
│   └── database.sqlite    # SQLite database
├── package.json           # Root package.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the console for error messages
2. Ensure all dependencies are installed
3. Verify the database is properly initialized
4. Check that both servers are running

## 🚀 Future Enhancements

- [ ] Admin dashboard for product management
- [ ] Email notifications for orders
- [ ] Advanced search and filtering
- [ ] Product reviews and ratings
- [ ] Multiple payment gateways
- [ ] Inventory management
- [ ] Shipping integration
- [ ] Mobile app development 
