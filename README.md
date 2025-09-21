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
- <img width="1919" height="956" alt="Screenshot 2025-09-20 181724" src="https://github.com/user-attachments/assets/0517acd7-6ce3-459b-afc0-53d8068c1f46" />
- <img width="1919" height="971" alt="Screenshot 2025-09-21 181107" src="https://github.com/user-attachments/assets/7e72a524-c124-4278-9b66-dd8fba7f622a" />
<img width="1906" height="874" alt="Screenshot 2025-09-21 181040" src="https://github.com/user-attachments/assets/4dea65e7-517b-4cd1-b68f-ea70dcde6ac9" />
<img width="1912" height="865" alt="Screenshot 2025-09-21 181026" src="https://github.com/user-attachments/assets/56fe035a-609e-46c0-9fb4-5a23a8840ab2" />
<img width="1919" height="795" alt="Screenshot 2025-09-21 181012" src="https://github.com/user-attachments/assets/2f1d87c6-8498-4949-bac1-957fb2878c21" />
<img width="1919" height="969" alt="Screenshot 2025-09-21 180745" src="https://github.com/user-attachments/assets/cb08c03f-1f50-4eb4-80a2-f91acaf88a59" />
<img width="1913" height="962" alt="Screenshot 2025-09-21 180722" src="https://github.com/user-attachments/assets/14e2d332-0ed5-4585-9b40-1196365e2989" />
<img width="1917" height="957" alt="Screenshot 2025-09-21 180651" src="https://github.com/user-attachments/assets/404ec945-2212-4e0e-94d9-2ee167bdbe20" />
<img width="1919" height="965" alt="Screenshot 2025-09-21 180635" src="https://github.com/user-attachments/assets/1c117ccb-6308-4ee4-93c3-de42d8d534b4" />
<img width="1908" height="896" alt="Screenshot 2025-09-21 180618" src="https://github.com/user-attachments/assets/a176e9cc-1635-47b8-867e-6959e372f3af" />
<img width="1918" height="774" alt="Screenshot 2025-09-21 180603" src="https://github.com/user-attachments/assets/98e747d4-8b2a-45b2-9fed-8aeecdd16a48" />
<img width="1918" height="861" alt="Screenshot 2025-09-21 180540" src="https://github.com/user-attachments/assets/1aeca2f3-da2c-44e1-9c50-94c1d136e33d" />
<img width="1919" height="969" alt="Screenshot 2025-09-21 180254" src="https://github.com/user-attachments/assets/a7b0f261-ef30-40cb-b7d8-928a0a909753" />
<img width="1919" height="963" alt="Screenshot 2025-09-21 180228" src="https://github.com/user-attachments/assets/de3433ed-6add-4509-88e4-8d4fde5cbbe5" />
<img width="1919" height="966" alt="Screenshot 2025-09-21 180137" src="https://github.com/user-attachments/assets/e2e5c012-9a50-49fd-ae63-a408f34b8f43" />
<img width="1919" height="973" alt="Screenshot 2025-09-21 180055" src="https://github.com/user-attachments/assets/797088f0-f6d3-4cb7-985f-f693249acbde" />
<img width="1919" height="972" alt="Screenshot 2025-09-21 180001" src="https://github.com/user-attachments/assets/652409db-17ec-4c14-9b0f-c89d19b002bd" />
<img width="1914" height="971" alt="Screenshot 2025-09-21 175932" src="https://github.com/user-attachments/assets/d7c1cd34-abb7-4879-8c7d-03bab38c4725" />
<img width="1919" height="978" alt="Screenshot 2025-09-21 175912" src="https://github.com/user-attachments/assets/a64af80b-09e4-45d3-8877-85fb3b46066b" />
<img width="1913" height="969" alt="Screenshot 2025-09-21 175846" src="https://github.com/user-attachments/assets/7412448c-6985-452b-a72d-e5fd1fbcec82" />
<img width="1919" height="1005" alt="Screenshot 2025-09-21 165443" src="https://github.com/user-attachments/assets/3d7b4f04-2437-4e9a-a976-540d9164bc3f" />
<img width="1300" height="861" alt="Screenshot 2025-09-21 165430" src="https://github.com/user-attachments/assets/82bd8c42-6452-4bac-8f80-f5b2bfc92499" />
<img width="638" height="229" alt="Screenshot 2025-09-21 135339" src="https://github.com/user-attachments/assets/9bb579ed-5683-4c20-bb82-ee862b06d894" />
<img width="1919" height="1056" alt="Screenshot 2025-09-21 125938" src="https://github.com/user-attachments/assets/83f1e9e9-0053-4db5-9a13-35d9a216facf" />
<img width="497" height="189" alt="Screenshot 2025-09-21 125926" src="https://github.com/user-attachments/assets/7cfead6a-06e7-4f6d-a110-100b1be70bb5" />
<img width="699" height="222" alt="Screenshot 2025-09-21 125818" src="https://github.com/user-attachments/assets/0146abe0-4ae7-42dc-a6ce-0a4ac997d76b" />
<img width="596" height="235" alt="Screenshot 2025-09-21 123024" src="https://github.com/user-attachments/assets/210177d5-6114-4a75-ae65-b48f9b6e4a31" />
<img width="578" height="196" alt="Screenshot 2025-09-21 113510" src="https://github.com/user-attachments/assets/a5c2fbe4-9569-43f9-9c89-4dbe2239d70f" />
<img width="546" height="375" alt="Screenshot 2025-09-21 105717" src="https://github.com/user-attachments/assets/136ec398-1cd3-49c8-a656-3df85893bd82" />
<img width="1908" height="1017" alt="Screenshot 2025-09-20 182505" src="https://github.com/user-attachments/assets/4bbbe0f1-f9c6-49b5-bc42-f237a1a9ddce" />
<img width="1913" height="864" alt="Screenshot 2025-09-20 181842" src="https://github.com/user-attachments/assets/9c82bb55-2a58-431e-8fb6-a99ca9dee9cc" />
<img width="1917" height="810" alt="Screenshot 2025-09-20 181805" src="https://github.com/user-attachments/assets/235cd54e-4b1d-4263-9e66-12e9ca14c4e2" />
![Uploading Screenshot 2025-09-20 181724.png…]()
<img width="1913" height="969" alt="Screenshot 2025-09-21 175846" src="https://github.com/user-attachments/assets/ceabd86d-6f14-4f2b-b889-d33942e801e0" />

