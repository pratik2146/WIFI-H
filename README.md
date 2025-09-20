# HR Dashboard Application

A complete HR management system with employee and HR dashboards.

## Features

- **User Authentication**: Login/Register system with user type selection (Employee/HR)
- **Employee Dashboard**: 
  - Profile management
  - **Advanced Attendance System**:
    - Manual/GPS/Wi-Fi punch tracking
    - Auto half-day marking if Wi-Fi disconnects >2 times/day
    - Location-based attendance verification
  - Leave application with multiple leave types
  - Regularization request system
  - Personal details editing
  - Holiday calendar
- **HR Dashboard**:
  - Employee directory
  - Leave management and approval
  - Attendance tracking with detailed analytics
  - Regularization request management
  - Statistics and charts
  - Holiday calendar

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB running locally (MongoDB Compass or MongoDB service)

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the application:
   ```bash
   node server.js
   ```
   Or use the batch file:
   ```bash
   start.bat
   ```

3. Open your browser and navigate to:
   - Login: `http://localhost:5000/login.html`
   - Register: `http://localhost:5000/register.html`

## Default Login Credentials

### Employee Login
- Email: `employee@example.com`
- Password: `12345`
- User Type: `Employee`

### HR Login
- Email: `hr@example.com`
- Password: `admin123`
- User Type: `HR`

## Application Flow

1. **Login/Register**: Users can register new accounts or login with existing credentials
2. **Dashboard Redirect**: Based on user type, users are redirected to appropriate dashboard
3. **Employee Dashboard**: Employees can manage their profile, mark attendance, and apply for leaves
4. **HR Dashboard**: HR managers can view employee data, manage leaves, and track attendance
5. **Logout**: Users can logout and return to login page

## File Structure

- `login.html` - Login page with user type selection
- `register.html` - User registration page
- `dashboard.html` - Employee dashboard
- `hrdash.html` - HR dashboard
- `server.js` - Node.js backend server
- `hrdash.js` - HR dashboard JavaScript functionality
- CSS files for styling each page

## API Endpoints

### User Management
- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /user/:email` - Get user data
- `PUT /user/:email` - Update user data

### Password Recovery
- `POST /recovery/check-email` - Check if email exists for recovery
- `POST /recovery/reset-password` - Reset user password

### Employee Management
- `GET /employees` - Get employee list
- `POST /employees` - Create employee record
- `GET /employees/:id` - Get specific employee
- `PUT /employees/:id` - Update employee record
- `DELETE /employees/:id` - Delete employee record

### Leave Management
- `GET /leaves` - Get all leave requests
- `GET /leaves/employee/:email` - Get employee leave requests
- `POST /leaves` - Create leave request
- `PUT /leaves/:id` - Update leave request status
- `DELETE /leaves/:id` - Delete leave request

### Advanced Attendance System
- `GET /attendance/:date` - Get attendance for specific date
- `GET /attendance/employee/:email` - Get employee attendance history
- `POST /attendance/punch` - Advanced attendance punch with GPS/Wi-Fi tracking
- `POST /attendance` - Basic attendance marking

### Regularization
- `GET /regularization` - Get all regularization requests
- `POST /regularization` - Submit regularization request
- `GET /regularization/:email` - Get employee regularization requests
- `PUT /regularization/:id` - Update regularization status

### HR Dashboard
- `GET /dashboard/stats` - Get dashboard statistics

## Database

The application uses MongoDB with the following collections:
- `users` - User accounts and profiles
- `employees` - Employee directory
- `leaves` - Leave requests with leave types
- `attendance` - Advanced attendance records with GPS/Wi-Fi tracking
- `regularizations` - Regularization requests

### Advanced Attendance Features
- **GPS Tracking**: Records latitude/longitude coordinates
- **Wi-Fi Monitoring**: Tracks connection status and disconnections
- **Auto Half-Day**: Automatically marks half-day if Wi-Fi disconnects >2 times
- **Punch Types**: Manual, GPS, or Wi-Fi based attendance
- **Location Verification**: Stores address information for attendance verification

## MongoDB Backend Features

### Complete Database Integration
- **All files now use MongoDB backend** with localStorage fallback
- **User Authentication**: Full MongoDB integration for login/register
- **Password Recovery**: MongoDB-based email verification
- **Employee Management**: Complete CRUD operations
- **Leave Management**: Full leave request lifecycle
- **Attendance Tracking**: Advanced GPS/Wi-Fi tracking with MongoDB storage
- **Regularization**: Complete request management system
- **HR Dashboard**: Real-time statistics from MongoDB

### Data Persistence
- All user data stored in MongoDB collections
- Automatic fallback to localStorage if server unavailable
- Real-time data synchronization
- Complete audit trail for all operations

## Notes

- The application includes fallback to localStorage if the server is not available
- All user sessions are managed through localStorage
- The application supports both server-side (MongoDB) and client-side (localStorage) data storage
- **All remaining files now have complete MongoDB backend integration**
