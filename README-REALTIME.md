# 🚀 HR Dashboard - Real-Time Edition

A fully functional, real-time HR management system with live updates, notifications, and advanced features.

## ✨ Real-Time Features

### 🔌 WebSocket Integration
- **Live Updates**: Real-time data synchronization across all users
- **Instant Notifications**: Immediate alerts for all actions
- **Connection Status**: Visual indicators for server connectivity
- **Room-based Updates**: Targeted notifications for Employee/HR roles

### 📱 Live Notifications
- **Success Notifications**: Green notifications for successful actions
- **Error Notifications**: Red notifications for errors
- **Info Notifications**: Blue notifications for general updates
- **Auto-dismiss**: Notifications automatically disappear after 3-4 seconds
- **Smooth Animations**: Slide-in/slide-out animations

### 🔄 Smart Auto-Refresh
- **Intelligent Refresh**: Only refreshes when needed (every 1 minute)
- **Visibility Detection**: Pauses when tab is not visible
- **Performance Optimized**: Reduces unnecessary API calls
- **Manual Refresh**: Instant refresh buttons available

### 📍 Advanced Attendance Tracking
- **GPS Location**: Automatic location detection
- **WiFi Monitoring**: Connection status tracking
- **Half-Day Detection**: Auto-mark half-day for WiFi disconnections
- **Multiple Punch Types**: Manual, GPS, WiFi tracking
- **Real-time Status**: Live attendance status updates

## 🎯 Key Features

### Employee Dashboard
- ✅ **Real-time Attendance**: Punch in/out with live updates
- ✅ **Live Leave Requests**: Submit and track leave applications
- ✅ **Profile Management**: Edit profile with real-time sync
- ✅ **Regularization**: Request regularization with live updates
- ✅ **Holiday Calendar**: Real-time holiday data from API
- ✅ **Statistics**: Live attendance and leave statistics

### HR Dashboard
- ✅ **Employee Directory**: Real-time employee management
- ✅ **Leave Approvals**: Live leave request management
- ✅ **Attendance Overview**: Real-time attendance tracking
- ✅ **Dashboard Statistics**: Live metrics and charts
- ✅ **Birthday Tracking**: Upcoming birthdays with notifications
- ✅ **Bulk Attendance**: Manual attendance marking for all employees

## 🚀 Quick Start

### Option 1: Easy Start (Recommended)
```bash
# Double-click the start-realtime.bat file
# OR run in terminal:
start-realtime.bat
```

### Option 2: Manual Start
```bash
# Install dependencies
npm install

# Start the server
npm start
# OR
node server.js
```

### Option 3: Development Mode
```bash
# Install dependencies
npm install

# Start with auto-restart (if nodemon is installed)
npm run dev
```

## 🌐 Access Points

- **Login Page**: http://localhost:5000/login.html
- **Employee Dashboard**: http://localhost:5000/dashboard.html
- **HR Dashboard**: http://localhost:5000/hrdash.html
- **API Documentation**: http://localhost:5000 (REST endpoints)

## 🔑 Login Credentials

### Test Users (Created by test-data endpoint)
- **Employee**: `john.doe@company.com` / `password123`
- **HR Manager**: `hr@company.com` / `password123`
- **Another Employee**: `jane.smith@company.com` / `password123`

### Fallback Credentials
- **Employee**: `employee@example.com` / `12345`
- **HR**: `hr@example.com` / `admin123`

## 🛠️ Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Socket.IO**: Real-time WebSocket communication
- **MongoDB**: Database with Mongoose ODM
- **CORS**: Cross-origin resource sharing

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with animations
- **JavaScript (ES6+)**: Modern JavaScript features
- **Socket.IO Client**: Real-time communication
- **Chart.js**: Interactive charts and graphs
- **Fetch API**: Modern HTTP requests

### External APIs
- **Calendarific**: Holiday data for India
- **Random User**: Profile pictures
- **Geolocation API**: GPS tracking

## 📊 Real-Time Events

### WebSocket Events
- `connect` / `disconnect`: Connection status
- `join-room`: Join Employee/HR specific rooms
- `attendance-updated`: Live attendance changes
- `leave-status-changed`: Leave request updates
- `profile-updated`: Profile modification notifications
- `new-leave-request`: New leave applications

### API Endpoints with Real-Time Broadcasting
- `POST /login`: Broadcasts user login
- `PUT /user/:email`: Broadcasts profile updates
- `POST /leaves`: Broadcasts new leave requests
- `PUT /leaves/:id`: Broadcasts leave status changes
- `POST /attendance/punch`: Broadcasts attendance updates

## 🔧 Configuration

### Environment Variables
```bash
PORT=5000                    # Server port
MONGODB_URI=mongodb://127.0.0.1:27017/hr_dashboard
```

### MongoDB Setup
1. Install MongoDB locally
2. Start MongoDB service
3. Create database: `hr_dashboard`
4. Server will auto-create collections

## 📱 Mobile Responsiveness

- **Responsive Design**: Works on all device sizes
- **Touch-Friendly**: Optimized for mobile interactions
- **Progressive Web App**: Can be installed on mobile devices
- **Offline Indicators**: Shows connection status

## 🎨 UI/UX Features

### Visual Indicators
- **Connection Status**: Green/Red border indicators
- **Loading States**: Smooth loading animations
- **Status Badges**: Color-coded status indicators
- **Interactive Charts**: Real-time data visualization

### Animations
- **Notification Animations**: Slide-in/slide-out effects
- **Button Hover Effects**: Interactive feedback
- **Loading Spinners**: Visual loading indicators
- **Smooth Transitions**: Page and element transitions

## 🚨 Troubleshooting

### Common Issues

1. **Server Won't Start**
   ```bash
   # Check if port 5000 is available
   netstat -an | findstr :5000
   
   # Kill process using port 5000
   taskkill /f /pid <PID>
   ```

2. **MongoDB Connection Error**
   ```bash
   # Start MongoDB service
   net start MongoDB
   
   # Check MongoDB status
   mongo --eval "db.runCommand('ping')"
   ```

3. **WebSocket Connection Failed**
   - Check firewall settings
   - Ensure server is running
   - Check browser console for errors

4. **Real-Time Updates Not Working**
   - Check browser console for WebSocket errors
   - Verify Socket.IO client is loaded
   - Check network connectivity

### Debug Mode
```bash
# Enable debug logging
DEBUG=socket.io:* npm start
```

## 📈 Performance Optimizations

- **Smart Refresh**: Only refreshes when needed
- **Connection Pooling**: Efficient database connections
- **Caching**: Browser caching for static assets
- **Lazy Loading**: Load data only when needed
- **Debounced Search**: Optimized search functionality

## 🔒 Security Features

- **CORS Protection**: Cross-origin request security
- **Input Validation**: Server-side validation
- **Password Protection**: Secure authentication
- **Session Management**: Local storage sessions
- **SQL Injection Protection**: Mongoose ODM protection

## 📝 API Documentation

### Authentication
- `POST /login` - User login with real-time broadcast
- `POST /register` - User registration
- `POST /recovery/check-email` - Password recovery

### User Management
- `GET /users` - Get all users
- `GET /user/:email` - Get specific user
- `PUT /user/:email` - Update user with real-time broadcast

### Attendance
- `POST /attendance/punch` - Mark attendance with GPS/WiFi
- `GET /attendance/:date` - Get attendance for date
- `GET /attendance/employee/:email` - Get employee attendance

### Leave Management
- `POST /leaves` - Create leave request with real-time broadcast
- `GET /leaves` - Get all leave requests
- `PUT /leaves/:id` - Update leave status with real-time broadcast

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. **Server Console**:
   ```
   🚀 Server running on http://localhost:5000
   🔌 WebSocket server ready for real-time connections
   ✅ Connected to MongoDB (Compass)
   🔌 User connected: <socket-id>
   ```

2. **Browser Console**:
   ```
   🔌 Connected to server
   📊 Real-time attendance update: {...}
   📋 Real-time leave update: {...}
   ```

3. **Visual Indicators**:
   - Green border on pages (connected)
   - Live notifications appearing
   - Real-time data updates
   - Smooth animations

## 🚀 Next Steps

Your HR Dashboard is now fully functional with real-time capabilities! You can:

1. **Start the server** using `start-realtime.bat`
2. **Open multiple browser tabs** to test real-time updates
3. **Login as different users** to see live notifications
4. **Test attendance marking** to see real-time updates
5. **Submit leave requests** to see live HR notifications

Enjoy your fully functional, real-time HR management system! 🎉
