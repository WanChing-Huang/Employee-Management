# User Management System Setup Guide

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/employee-management

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (for Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development
```

## Installation

### 1. Install Dependencies
```bash
cd backend
npm install nodemailer jsonwebtoken bcryptjs
```

### 2. Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use the generated password as `EMAIL_PASSWORD`

### 3. Add Routes to Main App
```javascript
// In your main app.js or server.js
import userRoutes from './routes/userRoutes.js';
import userProfileRoutes from './routes/userProfileRoutes.js';

app.use('/api/users', userRoutes);
app.use('/api/user-profiles', userProfileRoutes);
```

## API Endpoints

### Public Routes (No Authentication)

#### 1. Register User
```javascript
POST /api/users/register
Content-Type: application/json

{
  "token": "registration-token-here",
  "username": "john_doe",
  "password": "password123",
  "email": "john@company.com"
}
```

#### 2. Login User
```javascript
POST /api/users/login
Content-Type: application/json

{
  "email": "john@company.com",
  "password": "password123"
}
```

#### 3. Validate Registration Token
```javascript
GET /api/users/validate-token/:token
```

### Protected Routes (Authentication Required)

#### 4. Generate Registration Token (HR Only)
```javascript
POST /api/users/generate-token
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "email": "newemployee@company.com"
}
```

#### 5. Get All Users (HR Only)
```javascript
GET /api/users
Authorization: Bearer <jwt-token>
```

#### 6. Get User by ID
```javascript
GET /api/users/:id
Authorization: Bearer <jwt-token>
```

#### 7. Update User
```javascript
PUT /api/users/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "username": "new_username",
  "email": "newemail@company.com"
}
```

#### 8. Delete User (HR Only)
```javascript
DELETE /api/users/:id
Authorization: Bearer <jwt-token>
```

## Usage Flow

### 1. HR Generates Registration Token
```javascript
// HR logs in and generates token for new employee
const response = await fetch('/api/users/generate-token', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${hrToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'newemployee@company.com'
  })
});
```

### 2. Employee Receives Email
- Employee receives email with registration link
- Link contains the registration token
- Link expires in 3 hours

### 3. Employee Registers
```javascript
// Employee clicks link and registers
const response = await fetch('/api/users/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'token-from-email',
    username: 'newemployee',
    password: 'password123',
    email: 'newemployee@company.com'
  })
});
```

### 4. Employee Logs In
```javascript
// Employee logs in with credentials
const response = await fetch('/api/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'newemployee@company.com',
    password: 'password123'
  })
});

// Response includes JWT token for future requests
const { token, user } = await response.json();
```

## Security Features

1. **Token-based Registration**: Only HR can generate registration tokens
2. **Email Validation**: Tokens are tied to specific email addresses
3. **Token Expiration**: Tokens expire after 3 hours
4. **One-time Use**: Tokens can only be used once
5. **Password Hashing**: Passwords are hashed using bcrypt
6. **JWT Authentication**: Secure token-based authentication
7. **Role-based Access**: HR-only routes are protected

## Error Handling

### Common Error Responses

```json
{
  "error": "Invalid or expired registration token"
}
```

```json
{
  "error": "Username already exists"
}
```

```json
{
  "error": "Email already exists"
}
```

```json
{
  "error": "Invalid email format"
}
```

```json
{
  "error": "Password must be at least 6 characters"
}
```

```json
{
  "error": "Only HR representatives can generate registration tokens"
}
```

## Testing

### Test Email Sending
```bash
# Create a test email
curl -X POST http://localhost:5000/api/users/generate-token \
  -H "Authorization: Bearer <hr-token>" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Test Registration
```bash
# Register with token
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token-from-email",
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com"
  }'
```

This system provides a secure, role-based user management system with email-based registration tokens! 