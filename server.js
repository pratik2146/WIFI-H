const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static('.'));

// ✅ Connect to MongoDB local Compass
mongoose.connect("mongodb://127.0.0.1:27017/hr_dashboard");
mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB (Compass)");
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  // Join user to appropriate room based on user type
  socket.on('join-room', (userType) => {
    socket.join(userType);
    console.log(`👤 User ${socket.id} joined ${userType} room`);
  });
  
  // Handle real-time attendance updates
  socket.on('attendance-update', (data) => {
    io.emit('attendance-changed', data);
  });
  
  // Handle leave request updates
  socket.on('leave-update', (data) => {
    io.emit('leave-changed', data);
  });
  
  // Handle user profile updates
  socket.on('profile-update', (data) => {
    io.emit('profile-changed', data);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Helper function to broadcast updates
function broadcastUpdate(type, data) {
  io.emit(type, data);
}

// Enhanced Schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  usertype: { type: String, required: true, enum: ['Employee', 'HR', 'employee', 'hr'] },
  name: { type: String, required: true },
  department: { type: String, default: 'General' },
  phone: { type: String, default: '' },
  dob: { type: Date, default: null },
  gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
  address: { type: String, default: '' },
  profilePic: { type: String, default: '' },
  employeeId: { type: String, unique: true, sparse: true },
  position: { type: String, default: '' },
  salary: { type: Number, default: 0 },
  joiningDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// HR Profile Schema
const HRProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hrId: { type: String, unique: true, required: true },
  permissions: {
    canApproveLeaves: { type: Boolean, default: true },
    canManageEmployees: { type: Boolean, default: true },
    canViewReports: { type: Boolean, default: true },
    canManageAttendance: { type: Boolean, default: true }
  },
  department: { type: String, required: true },
  level: { type: String, enum: ['Junior HR', 'Senior HR', 'HR Manager', 'HR Director'], default: 'Junior HR' },
  specialization: [String],
  certifications: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const EmployeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  department: String,
});
const AttendanceSchema = new mongoose.Schema({
  employee: String,
  date: Date,
  status: String, // Present / Absent / Half-Day
  punchType: String, // Manual / GPS / WiFi
  punchIn: Date,
  punchOut: Date,
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  wifiDisconnections: [{
    timestamp: Date,
    duration: Number // in minutes
  }],
  totalDisconnections: { type: Number, default: 0 },
  isHalfDay: { type: Boolean, default: false }
});

const LeaveSchema = new mongoose.Schema({
  employee: String,
  from: Date,
  to: Date,
  status: String, // Approved / Pending / Rejected
  reason: String,
  leaveType: String, // Sick / Personal / Vacation / Half-Day
  appliedDate: { type: Date, default: Date.now }
});

const RegularizationSchema = new mongoose.Schema({
  employee: String,
  date: Date,
  reason: String,
  status: String, // Approved / Pending / Rejected
  appliedDate: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model("User", UserSchema);
const HRProfile = mongoose.model("HRProfile", HRProfileSchema);
const Employee = mongoose.model("Employee", EmployeeSchema);
const Leave = mongoose.model("Leave", LeaveSchema);
const Attendance = mongoose.model("Attendance", AttendanceSchema);
const Regularization = mongoose.model("Regularization", RegularizationSchema);

// Routes

// User Authentication Routes
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, usertype, name, department, phone, dob, gender, address } = req.body;
    
    console.log("📝 Registration attempt for:", email);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Generate employee ID
    const employeeId = `EMP${Date.now().toString().slice(-6)}`;
    
    const userData = {
      username: username || email.split('@')[0],
      email,
      password,
      usertype: usertype || 'Employee',
      name: name || username || email.split('@')[0],
      department: department || 'General',
      phone: phone || '',
      dob: dob ? new Date(dob) : null,
      gender: gender || '',
      address: address || '',
      employeeId: employeeId,
      position: '',
      salary: 0,
      joiningDate: new Date(),
      isActive: true,
      lastLogin: new Date()
    };
    
    console.log("📤 Creating user with data:", userData);
    
    const user = new User(userData);
    await user.save();
    
    console.log("✅ User registered successfully:", email);
    res.json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("❌ Registration failed:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password, usertype } = req.body;
    const user = await User.findOne({ email, password, usertype });
    
    if (user) {
      // Broadcast user login
      broadcastUpdate('user-login', { user: user.email, usertype: user.usertype });
      res.json({ message: "Login successful", user });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

app.get("/user/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
});

app.put("/user/:email", async (req, res) => {
  try {
    console.log(`👤 Updating user: ${req.params.email}`);
    console.log(`📤 Update data:`, req.body);
    
    // Add updatedAt timestamp
    req.body.updatedAt = new Date();
    
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (user) {
      console.log(`✅ User updated successfully:`, user.email);
      // Broadcast profile update
      broadcastUpdate('profile-updated', { user: user.email, data: user });
      res.json({ message: "User updated successfully", user });
    } else {
      console.log(`❌ User not found: ${req.params.email}`);
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(`❌ Error updating user ${req.params.email}:`, error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
});

// Password Recovery Routes
app.post("/recovery/check-email", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (user) {
      // In a real application, you would send an email here
      // For now, we'll just return success
      res.json({ 
        message: "Recovery link has been sent to your email", 
        email: email,
        userExists: true 
      });
    } else {
      res.status(404).json({ message: "No account found with this email" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error checking email", error: error.message });
  }
});

app.post("/recovery/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { password: newPassword },
      { new: true }
    );
    
    if (user) {
      res.json({ message: "Password updated successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating password", error: error.message });
  }
});

// Employee Routes
app.get("/employees", async (req, res) => {
  try {
  const employees = await Employee.find();
  res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees", error: error.message });
  }
});

app.post("/employees", async (req, res) => {
  try {
  const employee = new Employee(req.body);
  await employee.save();
  res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Error creating employee", error: error.message });
  }
});

app.get("/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee", error: error.message });
  }
});

app.put("/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (employee) {
      res.json({ message: "Employee updated successfully", employee });
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating employee", error: error.message });
  }
});

app.delete("/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (employee) {
      res.json({ message: "Employee deleted successfully" });
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting employee", error: error.message });
  }
});

// Leave Routes
app.get("/leaves", async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ appliedDate: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaves", error: error.message });
  }
});

app.get("/leaves/employee/:email", async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.params.email }).sort({ appliedDate: -1 });
  res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee leaves", error: error.message });
  }
});

app.post("/leaves", async (req, res) => {
  try {
  const leave = new Leave(req.body);
  await leave.save();
  // Broadcast new leave request
  broadcastUpdate('new-leave-request', { leave, employee: leave.employee });
  res.json(leave);
  } catch (error) {
    res.status(500).json({ message: "Error creating leave request", error: error.message });
  }
});

app.put("/leaves/:id", async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (leave) {
      // Broadcast leave status update
      broadcastUpdate('leave-status-changed', { leaveId: req.params.id, status: req.body.status, employee: leave.employee });
      res.json({ message: "Leave request updated successfully", leave });
    } else {
      res.status(404).json({ message: "Leave request not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating leave request", error: error.message });
  }
});

app.delete("/leaves/:id", async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (leave) {
      res.json({ message: "Leave request deleted successfully" });
    } else {
      res.status(404).json({ message: "Leave request not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting leave request", error: error.message });
  }
});

// Attendance Routes
app.get("/attendance/:date", async (req, res) => {
  const attendance = await Attendance.find({ date: req.params.date });
  res.json(attendance);
});

app.get("/attendance/employee/:email", async (req, res) => {
  try {
    const attendance = await Attendance.find({ employee: req.params.email }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance", error: error.message });
  }
});

// Advanced Attendance Punch with GPS/Wi-Fi tracking
app.post("/attendance/punch", async (req, res) => {
  try {
    const { employee, punchType, location, wifiStatus } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if attendance already exists for today
    let attendance = await Attendance.findOne({ 
      employee: employee, 
      date: new Date(today) 
    });

    if (!attendance) {
      // Create new attendance record
      attendance = new Attendance({
        employee: employee,
        date: new Date(today),
        status: "Present",
        punchType: punchType,
        punchIn: new Date(),
        location: location,
        wifiDisconnections: [],
        totalDisconnections: 0,
        isHalfDay: false
      });
    } else {
      // Update existing record
      if (!attendance.punchIn) {
        attendance.punchIn = new Date();
        attendance.punchType = punchType;
        attendance.location = location;
      } else if (!attendance.punchOut) {
        attendance.punchOut = new Date();
      }
    }

    // Handle Wi-Fi disconnection tracking
    if (wifiStatus === "disconnected") {
      attendance.wifiDisconnections.push({
        timestamp: new Date(),
        duration: 0
      });
      attendance.totalDisconnections += 1;

      // Auto-mark half-day if Wi-Fi disconnects more than 2 times
      if (attendance.totalDisconnections > 2) {
        attendance.status = "Half-Day";
        attendance.isHalfDay = true;
        
        // Create automatic regularization request for WiFi disconnection
        try {
          const regularization = new Regularization({
            employee: attendance.employee,
            date: attendance.date,
            reason: `Automatic regularization request due to WiFi disconnection (${attendance.totalDisconnections} times)`,
            status: "Pending"
          });
          await regularization.save();
          
          console.log(`📝 Auto-created regularization request for ${attendance.employee} due to WiFi disconnection`);
          
          // Broadcast regularization request
          broadcastUpdate('new-regularization-request', { 
            regularization, 
            employee: attendance.employee,
            reason: 'WiFi disconnection'
          });
        } catch (regError) {
          console.error("Error creating auto-regularization:", regError);
        }
      }
    }

    await attendance.save();
    // Broadcast attendance update
    broadcastUpdate('attendance-updated', { 
      employee: attendance.employee, 
      status: attendance.status, 
      punchType: attendance.punchType,
      isHalfDay: attendance.isHalfDay 
    });
    res.json({ 
      message: "Attendance punched successfully", 
      attendance: attendance,
      isHalfDay: attendance.isHalfDay
    });
  } catch (error) {
    res.status(500).json({ message: "Error marking attendance", error: error.message });
  }
});

// Regular attendance marking (fallback)
app.post("/attendance", async (req, res) => {
  try {
  const attendance = new Attendance(req.body);
  await attendance.save();
    res.json({ message: "Attendance marked successfully", attendance });
  } catch (error) {
    res.status(500).json({ message: "Error marking attendance", error: error.message });
  }
});

// Regularization Routes
app.post("/regularization", async (req, res) => {
  try {
    const regularization = new Regularization(req.body);
    await regularization.save();
    res.json({ message: "Regularization request submitted successfully", regularization });
  } catch (error) {
    res.status(500).json({ message: "Error submitting regularization", error: error.message });
  }
});

app.get("/regularization/:email", async (req, res) => {
  try {
    const regularizations = await Regularization.find({ employee: req.params.email }).sort({ appliedDate: -1 });
    res.json(regularizations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching regularizations", error: error.message });
  }
});

app.put("/regularization/:id", async (req, res) => {
  try {
    const regularization = await Regularization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (regularization) {
      // Broadcast regularization status update
      broadcastUpdate('regularization-status-changed', { 
        regularizationId: req.params.id, 
        status: req.body.status, 
        employee: regularization.employee 
      });
      res.json({ message: "Regularization updated successfully", regularization });
    } else {
      res.status(404).json({ message: "Regularization not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating regularization", error: error.message });
  }
});

// Get all regularizations (for HR dashboard)
app.get("/regularization", async (req, res) => {
  try {
    const regularizations = await Regularization.find().sort({ appliedDate: -1 });
    res.json(regularizations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching regularizations", error: error.message });
  }
});

// HR Dashboard Statistics
app.get("/dashboard/stats", async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalUsers = await User.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: "Pending" });
    const pendingRegularizations = await Regularization.countDocuments({ status: "Pending" });
    
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.countDocuments({ 
      date: new Date(today),
      status: { $in: ["Present", "Half-Day"] }
    });

    // Get leaves today
    const leavesToday = await Leave.countDocuments({
      from: { $lte: new Date(today) },
      to: { $gte: new Date(today) },
      status: "Approved"
    });

    res.json({
      totalEmployees,
      totalUsers,
      pendingLeaves,
      pendingRegularizations,
      activeToday: todayAttendance,
      leavesToday
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
  }
});

// Get all users for employee directory
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

// HR Profile Management Routes
app.post("/hr-profile", async (req, res) => {
  try {
    const { userId, hrId, department, level, specialization, certifications } = req.body;
    
    // Check if user exists and is HR
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (!['HR', 'hr'].includes(user.usertype)) {
      return res.status(400).json({ message: "User is not an HR employee" });
    }
    
    // Check if HR profile already exists
    const existingProfile = await HRProfile.findOne({ userId: userId });
    if (existingProfile) {
      return res.status(400).json({ message: "HR profile already exists for this user" });
    }
    
    const hrProfile = new HRProfile({
      userId: userId,
      hrId: hrId,
      department: department,
      level: level || 'Junior HR',
      specialization: specialization || [],
      certifications: certifications || []
    });
    
    await hrProfile.save();
    
    // Populate user data
    const populatedProfile = await HRProfile.findById(hrProfile._id).populate('userId');
    
    res.json({ message: "HR profile created successfully", profile: populatedProfile });
  } catch (error) {
    res.status(500).json({ message: "Error creating HR profile", error: error.message });
  }
});

app.get("/hr-profile/:userId", async (req, res) => {
  try {
    const profile = await HRProfile.findOne({ userId: req.params.userId }).populate('userId');
    if (profile) {
      res.json(profile);
    } else {
      res.status(404).json({ message: "HR profile not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching HR profile", error: error.message });
  }
});

app.put("/hr-profile/:userId", async (req, res) => {
  try {
    req.body.updatedAt = new Date();
    
    const profile = await HRProfile.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('userId');
    
    if (profile) {
      res.json({ message: "HR profile updated successfully", profile });
    } else {
      res.status(404).json({ message: "HR profile not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating HR profile", error: error.message });
  }
});

app.get("/hr-profiles", async (req, res) => {
  try {
    const profiles = await HRProfile.find().populate('userId', '-password');
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching HR profiles", error: error.message });
  }
});

// Get upcoming birthdays
app.get("/birthdays", async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
    // Get users with birthdays in the next 30 days
    const users = await User.find({
      dob: {
        $exists: true,
        $ne: null
      }
    }).select('name email dob username');
    
    const upcomingBirthdays = users.filter(user => {
      if (!user.dob) return false;
      const birthday = new Date(user.dob);
      const birthdayMonth = birthday.getMonth();
      const birthdayDay = birthday.getDate();
      
      // Check if birthday is in the next 30 days
      const birthdayThisYear = new Date(today.getFullYear(), birthdayMonth, birthdayDay);
      const daysUntilBirthday = (birthdayThisYear - today) / (1000 * 60 * 60 * 24);
      
      return daysUntilBirthday >= 0 && daysUntilBirthday <= 30;
    }).sort((a, b) => {
      const aBirthday = new Date(today.getFullYear(), new Date(a.dob).getMonth(), new Date(a.dob).getDate());
      const bBirthday = new Date(today.getFullYear(), new Date(b.dob).getMonth(), new Date(b.dob).getDate());
      return aBirthday - bBirthday;
    }).slice(0, 5); // Show only next 5 birthdays
    
    res.json(upcomingBirthdays);
  } catch (error) {
    res.status(500).json({ message: "Error fetching birthdays", error: error.message });
  }
});

// Create test data endpoint (for debugging)
app.post("/test-data", async (req, res) => {
  try {
    // Create test users if they don't exist
    const testUsers = [
      {
        username: "john_doe",
        email: "john.doe@company.com",
        password: "password123",
        usertype: "employee",
        name: "John Doe",
        department: "IT",
        phone: "123-456-7890",
        dob: new Date("1990-05-15"),
        gender: "Male",
        address: "123 Main St, City"
      },
      {
        username: "jane_smith",
        email: "jane.smith@company.com",
        password: "password123",
        usertype: "employee",
        name: "Jane Smith",
        department: "HR",
        phone: "123-456-7891",
        dob: new Date("1988-09-22"),
        gender: "Female",
        address: "456 Oak Ave, City"
      },
      {
        username: "hr_admin",
        email: "hr@company.com",
        password: "password123",
        usertype: "hr",
        name: "HR Admin",
        department: "HR",
        phone: "123-456-7892",
        dob: new Date("1985-03-10"),
        gender: "Female",
        address: "789 Pine St, City"
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created test user: ${userData.name}`);
      }
    }

    res.json({ message: "Test data created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating test data", error: error.message });
  }
});

// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready for real-time connections`);
});
