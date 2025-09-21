const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

// Define allowed office Wi-Fi SSIDs
const OFFICE_WIFI_SSIDS = [
  "Office_WiFi_1",
  "Office_WiFi_2",
  "Pratik" // <-- Add your hotspot SSID here for testing
];
const { exec } = require("child_process");

// Function to get current Wi-Fi SSID
function getCurrentSSID(callback) {
  exec("netsh wlan show interfaces", (err, stdout, stderr) => {
    if (err) {
      console.error("Error fetching SSID:", err);
      return callback(null);
    }
    const ssidMatch = stdout.match(/SSID\s+:\s(.*)/);
    const ssid = ssidMatch ? ssidMatch[1].trim() : null;
    callback(ssid);
  });
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

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

// After your existing RegularizationSchema:
const CompanyConfigSchema = new mongoose.Schema({
  companyWifi: { type: String, required: true, default: "Pratik" },
  officeLocation: {
    latitude: { type: Number, required: true, default: 18.5204 },
    longitude: { type: Number, required: true, default: 73.8567 },
    allowedRadius: { type: Number, default: 100 }
  },
  createdAt: { type: Date, default: Date.now }
});

const CompanyConfig = mongoose.model("CompanyConfig", CompanyConfigSchema);

// Models
const User = mongoose.model("User", UserSchema);
const HRProfile = mongoose.model("HRProfile", HRProfileSchema);
const Employee = mongoose.model("Employee", EmployeeSchema);
const Leave = mongoose.model("Leave", LeaveSchema);
const Attendance = mongoose.model("Attendance", AttendanceSchema);
const Regularization = mongoose.model("Regularization", RegularizationSchema);

// ADD THIS UTILITY FUNCTION HERE:
// Utility function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// Routes
// Routes
// after your Employee model is defined ⬇️

// 👉 Get total employees count (for HR Dashboard)
app.get("/employees/count", async (req, res) => {
  try {
    const count = await Employee.countDocuments();
    res.json({ total: count });
  } catch (err) {
    console.error("Error fetching employee count:", err);
    res.status(500).json({ error: "Server error" });
  }
});

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
// Edit Profile Route (real-time updates)
app.put("/edit-profile/:email", async (req, res) => {
  try {
    console.log(`✏️ Editing profile for: ${req.params.email}`);

    const updates = {
      name: req.body.name,
      phone: req.body.phone,
      dob: req.body.dob ? new Date(req.body.dob) : null,
      address: req.body.address,
      profilePic: req.body.profilePic || ''
    };

    updates.updatedAt = new Date();

    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      updates,
      { new: true, runValidators: true }
    );

    if (user) {
      console.log(`✅ Profile updated for ${user.email}`);
      broadcastUpdate("profile-updated", { user: user.email, data: user });
      res.json({ message: "Profile updated successfully", user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("❌ Profile update error:", error);
    res.status(500).json({ message: "Error updating profile", error: error.message });
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
  const { employee, punchType, location } = req.body;

  getCurrentSSID(async (ssid) => {
    console.log("Current SSID:", ssid);

    const OFFICE_WIFI_SSIDS = ["Office_WiFi_1", "Pratik"];
    if (!OFFICE_WIFI_SSIDS.includes(ssid)) {
      return res.status(403).json({ message: "Attendance can only be marked from allowed Wi-Fi", status: "Failed" });
    }
    // Proceed with attendance marking
    try {
      const today = new Date().toISOString().split('T')[0];
      let attendance = await Attendance.findOne({ employee, date: new Date(today) });

      if (!attendance) {
        attendance = new Attendance({
          employee,
          date: new Date(today),
          status: "Present",
          punchType,
          punchIn: new Date(),
          location,
          wifiDisconnections: [],
          totalDisconnections: 0,
          isHalfDay: false
        });
      } else {
        // Update punch-in/punch-out
        if (!attendance.punchIn) attendance.punchIn = new Date();
        else if (!attendance.punchOut) attendance.punchOut = new Date();
      }

      await attendance.save();

      // Broadcast attendance update
      broadcastUpdate('attendance-updated', { 
        employee: attendance.employee, 
        status: attendance.status,
        punchType: attendance.punchType
      });

      res.json({ message: "Attendance punched successfully", attendance });
    } catch (error) {
      res.status(500).json({ message: "Error marking attendance", error: error.message });
    }
  });
});

// Wi-Fi Based Attendance Marking
app.post("/attendance/wifi-punch", async (req, res) => {
  const { employee, punchType, location, wifiSSID } = req.body;
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD               
    try {
      const wifiSSID = req.body.wifiSSID; // SSID sent from client
    // Check if connected to allowed Wi-Fi
    const isConnectedToOfficeWiFi = OFFICE_WIFI_SSIDS.includes(wifiSSID);

    if (!isConnectedToOfficeWiFi) {
      // ❌ Reject punch if not on allowed Wi-Fi
      return res.status(403).json({ 
        message: "Attendance can only be marked from office Wi-Fi",
        status: "Failed"
      });
    }

    // Check if attendance already exists
    let attendance = await Attendance.findOne({ employee, date: new Date(today) });

    if (!attendance) {
      // ✅ Create new attendance record
      attendance = new Attendance({
        employee,
        date: new Date(today),
        status: "Present",
        punchType,
        punchIn: new Date(),
        location,
        wifiDisconnections: [],
        totalDisconnections: 0,
        isHalfDay: false
      });
    } else {
      // Update punch-in/punch-out
      if (!attendance.punchIn) attendance.punchIn = new Date();
      else if (!attendance.punchOut) attendance.punchOut = new Date();
    }

    await attendance.save();

    // Broadcast attendance update
    broadcastUpdate('attendance-updated', { 
      employee: attendance.employee, 
      status: attendance.status,
      punchType: attendance.punchType
    });

    res.json({ message: "Attendance punched successfully", attendance });
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
    res.status(500).json({ message: "Error fetching regularizations", error: error.message });
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
// Create test data endpoint (for debugging)
app.post("/test-data", async (req, res) => {
  // ... existing test-data code ...
});

// ADD THESE NEW ROUTES HERE:

// Location & Wi-Fi verified attendance punch
app.post("/attendance/location-punch", async (req, res) => {
  try {
    const { employee, location, wifiNetwork } = req.body;

    console.log(`📍 Location punch attempt for: ${employee}`);

    // Validate input
    if (!employee || !location || !wifiNetwork) {
      return res.status(400).json({ 
        message: "Employee, location, and Wi-Fi network are required" 
      });
    }

    // Ensure location has required properties
    if (!location.latitude || !location.longitude) {
      return res.status(400).json({
        message: "Location must include latitude and longitude"
      });
    }

    // Get company configuration
    let companyConfig = await CompanyConfig.findOne({});
    if (!companyConfig) {
      companyConfig = new CompanyConfig({
        companyWifi: "Pratik",
        officeLocation: {
          latitude: 18.5204,
          longitude: 73.8567,
          allowedRadius: 100
        }
      });
      await companyConfig.save();
      console.log("📝 Created default company configuration");
    }

    // Verify Wi-Fi network
    const isWifiValid = wifiNetwork.toLowerCase() === companyConfig.companyWifi.toLowerCase();
    
    // Verify location
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      companyConfig.officeLocation.latitude,
      companyConfig.officeLocation.longitude
    );
    const isLocationValid = distance <= companyConfig.officeLocation.allowedRadius;

    console.log(`🔍 Verification Results:`, {
      wifi: isWifiValid,
      location: isLocationValid,
      distance: Math.round(distance),
      allowedRadius: companyConfig.officeLocation.allowedRadius
    });

    // Check if both verifications pass
    if (!isWifiValid || !isLocationValid) {
      const failureReasons = [];
      if (!isWifiValid) {
        failureReasons.push(`Wrong Wi-Fi network. Expected: ${companyConfig.companyWifi}, Got: ${wifiNetwork}`);
      }
      if (!isLocationValid) {
        failureReasons.push(`Outside office premises. Distance: ${Math.round(distance)}m (Max: ${companyConfig.officeLocation.allowedRadius}m)`);
      }

      return res.status(403).json({
        message: "Attendance verification failed",
        failures: failureReasons,
        verificationStatus: {
          wifi: isWifiValid,
          location: isLocationValid,
          distance: Math.round(distance)
        }
      });
    }

    // Both verifications passed - proceed with attendance
    const today = new Date().toISOString().split('T')[0];
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
        punchType: "Location-WiFi",
        punchIn: new Date(),
        punchOut: null,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address || 'Office Location'
        },
        wifiDisconnections: [],
        totalDisconnections: 0,
        isHalfDay: false
      });

      console.log(`✅ New attendance created for ${employee}`);
    } else {
      // Update for punch out
      if (!attendance.punchOut) {
        attendance.punchOut = new Date();
        console.log(`✅ Punch out recorded for ${employee}`);
      }
    }

    await attendance.save();

    // Broadcast attendance update
    broadcastUpdate('location-attendance-updated', { 
      employee: attendance.employee, 
      status: attendance.status, 
      punchType: attendance.punchType,
      verified: true
    });

    res.json({ 
      message: "Attendance marked successfully with location and Wi-Fi verification", 
      attendance: attendance,
      verification: {
        wifi: { verified: true, network: wifiNetwork },
        location: { 
          verified: true, 
          distance: Math.round(distance),
          allowedRadius: companyConfig.officeLocation.allowedRadius 
        }
      }
    });

  } catch (error) {
    console.error("❌ Location punch error:", error);
    res.status(500).json({ 
      message: "Error marking attendance", 
      error: error.message 
    });
  }
});

// Company configuration routes
app.get("/company/config", async (req, res) => {
  try {
    let config = await CompanyConfig.findOne({});
    if (!config) {
      config = new CompanyConfig();
      await config.save();
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: "Error fetching config", error: error.message });
  }
});

app.post("/company/config", async (req, res) => {
  try {
    const { companyWifi, officeLocation } = req.body;
    
    let config = await CompanyConfig.findOne({});
    if (!config) {
      config = new CompanyConfig();
    }
    
    if (companyWifi) config.companyWifi = companyWifi;
    if (officeLocation) config.officeLocation = officeLocation;
    
    await config.save();
    res.json({ message: "Configuration updated", config });
  } catch (error) {
    res.status(500).json({ message: "Error updating config", error: error.message });
  }
});

console.log("📍 Location & Wi-Fi attendance verification enabled");

// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready for real-time connections`);
});

