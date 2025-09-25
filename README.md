# 🗳️ Online Voting System - MERN Stack

A comprehensive full-stack online voting system built with MongoDB, Express.js, React, and Node.js. Features secure authentication, role-based access control, and real-time election management.

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based Authentication** - Secure login/logout system
- **Role-based Access Control** - Admin and Voter roles
- **Password Hashing** - bcrypt for secure password storage
- **Input Validation** - Server and client-side validation
- **CORS Protection** - Cross-origin resource sharing
- **Helmet Security** - HTTP headers protection
- **Duplicate Vote Prevention** - One vote per user per election

### 👑 Admin Capabilities
- **Election Management** - Create, update, and delete elections
- **Candidate Management** - Add and manage candidates
- **Real-time Results** - View live election results
- **System Analytics** - Dashboard with key statistics
- **User Management** - Monitor registered users

### 🗳️ Voter Capabilities
- **Election Browsing** - View available elections
- **Secure Voting** - Cast votes with confidence
- **Results Viewing** - See election outcomes
- **Vote Tracking** - Confirm vote submission
- **Election Status** - Real-time election state updates

### 🎨 Frontend (React + TypeScript)
- **Modern UI** - Clean, responsive design with Tailwind CSS
- **Protected Routes** - Role-based navigation
- **State Management** - React Context API
- **Type Safety** - Full TypeScript implementation
- **Real-time Updates** - Dynamic content updates

### 🚀 Backend (Express + Node.js)
- **RESTful API** - Clean, organized endpoints
- **MongoDB Integration** - Mongoose ODM
- **Error Handling** - Comprehensive error management
- **API Documentation** - Clear endpoint structure
- **Environment Configuration** - Flexible deployment options

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd voting-system
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
npm run install-server

# Install client dependencies
npm run install-client

# Or install all at once
npm run install-all
```

### 3. Environment Configuration

#### Server Environment (.env)
```bash
# Copy example file
cp server/.env.example server/.env
```

Configure your server environment variables:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/voting-system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000
```

#### Client Environment (.env)
```bash
# Copy example file
cp client/.env.example client/.env
```

Configure your client environment variables:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=Online Voting System
```

### 4. Database Setup

#### Start MongoDB
Make sure MongoDB is running on your system.

#### Seed Test Data
```bash
npm run seed
```

This creates test users and sample elections:

| Role  | Email             | Password    |
|-------|-------------------|-------------|
| Admin | admin@example.com | password123 |
| Voter | voter@example.com | password123 |
| Voter | jane@example.com  | password123 |
| Voter | bob@example.com   | password123 |
| Voter | alice@example.com | password123 |

## 🚀 Running the Application

### Development Mode
```bash
# Run both client and server concurrently
npm run dev

# Or run separately
npm run server  # Starts backend on :5000
npm run client  # Starts frontend on :3000
```

### Production Build
```bash
# Build client for production
npm run build
```

## 📁 Project Structure

```
voting-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context providers
│   │   ├── pages/         # Page components
│   │   │   ├── admin/     # Admin-specific pages
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Elections.tsx
│   │   │   ├── Vote.tsx
│   │   │   └── Results.tsx
│   │   ├── services/      # API service functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── App.tsx
│   ├── package.json
│   └── tailwind.config.js
├── server/                # Express backend
│   ├── middleware/        # Custom middleware
│   ├── models/           # MongoDB models
│   │   ├── User.js
│   │   ├── Election.js
│   │   ├── Candidate.js
│   │   └── Vote.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── elections.js
│   │   └── admin.js
│   ├── scripts/          # Utility scripts
│   │   └── seed.js
│   ├── server.js         # Main server file
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## 🔗 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user

### Election Routes (`/api/elections`)
- `GET /` - Get all active elections
- `GET /:id` - Get election by ID with candidates
- `GET /:id/results` - Get election results
- `POST /:id/vote` - Cast a vote
- `GET /:id/check-vote` - Check if user has voted

### Admin Routes (`/api/admin`)
- `GET /elections` - Get all elections
- `POST /elections` - Create new election
- `PUT /elections/:id` - Update election
- `DELETE /elections/:id` - Delete election
- `GET /elections/:id/candidates` - Get election candidates
- `POST /elections/:id/candidates` - Add candidate
- `PUT /candidates/:id` - Update candidate
- `DELETE /candidates/:id` - Delete candidate
- `GET /stats` - Get system statistics

## 🎯 Usage Guide

### For Voters
1. **Register/Login** - Create account or sign in
2. **Browse Elections** - View available elections
3. **Cast Vote** - Select candidate and submit vote
4. **View Results** - Check election outcomes
5. **Track History** - See your voting history

### For Admins
1. **Access Dashboard** - View system statistics
2. **Manage Elections** - Create and configure elections
3. **Add Candidates** - Set up candidates for elections
4. **Monitor Results** - Track real-time voting results
5. **System Management** - Oversee user activity

## 🔒 Security Features

- **JWT Authentication** - Stateless authentication
- **Password Hashing** - bcrypt with salt rounds
- **Input Sanitization** - Prevents injection attacks
- **CORS Configuration** - Controlled cross-origin access
- **Rate Limiting** - API abuse prevention
- **Helmet Security** - HTTP header protection
- **Environment Variables** - Sensitive data protection

## 🛡️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'voter',
  isActive: Boolean,
  timestamps: true
}
```

### Election Model
```javascript
{
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  isActive: Boolean,
  createdBy: ObjectId (User),
  timestamps: true
}
```

### Candidate Model
```javascript
{
  name: String,
  party: String,
  description: String,
  photo: String (URL),
  election: ObjectId (Election),
  voteCount: Number,
  timestamps: true
}
```

### Vote Model
```javascript
{
  voter: ObjectId (User),
  candidate: ObjectId (Candidate),
  election: ObjectId (Election),
  timestamp: Date,
  timestamps: true
}
```

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secret
4. Configure client build path

### Production Considerations
- Use environment variables for all secrets
- Enable MongoDB authentication
- Configure reverse proxy (nginx)
- Set up SSL certificates
- Implement rate limiting
- Configure logging
- Set up monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- MongoDB for database solution
- Express.js for backend framework
- React for frontend library
- Node.js for runtime environment
- Tailwind CSS for styling
- JWT for authentication
- bcrypt for password hashing

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

Made with ❤️ using the MERN stack