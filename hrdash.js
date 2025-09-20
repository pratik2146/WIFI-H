// ------------------------------
// Holidays (India) via Nager.Date API
// ------------------------------
async function fetchHolidays() {
  try {
    const year = new Date().getFullYear(); // current year
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/IN`);
    const data = await res.json();

    const ul = document.getElementById("holidayList");
    ul.innerHTML = "";

    if (!data || !data.length) {
      ul.innerHTML = `<li>No upcoming holidays 🎉</li>`;
      return;
    }

    // पुढील ५ holidays दाखवू
    data.slice(0, 5).forEach(h => {
      const d = new Date(h.date);
      const li = document.createElement("li");
      li.innerHTML = `📅 ${h.localName} — ${d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })}`;
      ul.appendChild(li);
    });
  } catch (e) {
    console.error("Holiday API error:", e);
    document.getElementById("holidayList").innerHTML =
      `<li>Error loading holidays</li>`;
  }
}

// ------------------------------
// Real-Time Chart System
// ------------------------------
let leaveChart = null;
let chartData = { approved: 0, pending: 0, rejected: 0 };

function loadLeaveChart() {
  const ctx = document.getElementById("leaveChart");
  if (!ctx) return;
  
  // Destroy existing chart if it exists
  if (leaveChart) {
    leaveChart.destroy();
  }
  
  leaveChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Approved", "Pending", "Rejected"],
      datasets: [{
        data: [chartData.approved, chartData.pending, chartData.rejected],
        backgroundColor: ["#2ecc71", "#f1c40f", "#e74c3c"],
        borderWidth: 2,
        borderColor: "#fff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${context.parsed} (${percentage}%)`;
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1000
      }
    }
  });
  
  updateChartTimestamp();
}

// Update chart with real-time data
async function updateLeaveChartData() {
  try {
    console.log("📊 Updating leave chart data...");
    const res = await fetch("http://localhost:5000/leaves");
    const leaves = await res.json();
    
    chartData = {
      approved: leaves.filter(leave => leave.status === "Approved").length,
      pending: leaves.filter(leave => leave.status === "Pending").length,
      rejected: leaves.filter(leave => leave.status === "Rejected").length
    };
    
    console.log("📊 Chart data updated:", chartData);
    
    if (leaveChart) {
      leaveChart.data.datasets[0].data = [chartData.approved, chartData.pending, chartData.rejected];
      leaveChart.update('active');
      updateChartTimestamp();
    }
  } catch (error) {
    console.error("❌ Error updating chart data:", error);
  }
}

// Refresh chart manually
function refreshLeaveChart() {
  console.log("🔄 Manually refreshing leave chart...");
  updateLeaveChartData();
}

// Update chart timestamp
function updateChartTimestamp() {
  const timestampEl = document.getElementById("chartLastUpdated");
  if (timestampEl) {
    const now = new Date();
    timestampEl.textContent = `Last updated: ${now.toLocaleTimeString()}`;
  }
}

// ------------------------------
// Init
// ------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  fetchHolidays();
  await updateLeaveChartData(); // Load real data first
  loadLeaveChart(); // Then create chart with real data
});
// Load employees into table
async function loadEmployees() {
  try {
    const res = await fetch("http://localhost:5000/users");
  const employees = await res.json();

  const tbody = document.getElementById("employeeTable");
  tbody.innerHTML = "";
    
    if (employees.length === 0) {
      tbody.innerHTML = "<tr><td colspan='4'>No employees found</td></tr>";
    } else {
  employees.forEach(emp => {
    const row = `<tr>
          <td>${emp.name || emp.username || 'N/A'}</td>
          <td>${emp.email || 'N/A'}</td>
          <td>${emp.department || 'N/A'}</td>
          <td><button class="btn-small" onclick="viewEmployee('${emp._id}')">View</button></td>
    </tr>`;
    tbody.innerHTML += row;
  });
    }

  // Update employee count
  document.getElementById("totalEmployees").innerText = employees.length;
  } catch (error) {
    console.error("Error loading employees:", error);
    document.getElementById("totalEmployees").innerText = "0";
    document.getElementById("employeeTable").innerHTML = "<tr><td colspan='4'>Error loading employees</td></tr>";
  }
}

// View employee details
async function viewEmployee(employeeId) {
  try {
    // Try to get employee details from users endpoint
    let res = await fetch("http://localhost:5000/users");
    let employees = await res.json();
    
    if (!employees || employees.length === 0) {
      res = await fetch("http://localhost:5000/employees");
      employees = await res.json();
    }
    
    const employee = employees.find(emp => emp._id === employeeId);
    
    if (employee) {
      const details = `
Employee Details:
Name: ${employee.name || employee.username || 'N/A'}
Email: ${employee.email || 'N/A'}
Department: ${employee.department || 'N/A'}
Phone: ${employee.phone || 'N/A'}
Date of Birth: ${employee.dob ? new Date(employee.dob).toLocaleDateString() : 'N/A'}
Gender: ${employee.gender || 'N/A'}
Address: ${employee.address || 'N/A'}
User Type: ${employee.usertype || 'N/A'}
      `;
      alert(details);
    } else {
      alert("Employee not found");
    }
  } catch (error) {
    console.error("Error fetching employee details:", error);
    alert("Error loading employee details");
  }
}

// Load leave requests
async function loadLeaveRequests() {
  try {
    const res = await fetch("http://localhost:5000/leaves");
    const leaves = await res.json();

    const tbody = document.getElementById("leaveRequestsTable");
    tbody.innerHTML = "";
    
    if (leaves.length === 0) {
      tbody.innerHTML = "<tr><td colspan='4'>No leave requests found</td></tr>";
    } else {
      leaves.forEach(leave => {
        const statusClass = leave.status.toLowerCase();
        const row = `<tr>
          <td>${leave.employee || 'N/A'}</td>
          <td>${new Date(leave.from).toLocaleDateString()}</td>
          <td>${new Date(leave.to).toLocaleDateString()}</td>
          <td><span class="status-badge status-${statusClass}">${leave.status}</span></td>
        </tr>`;
        tbody.innerHTML += row;
      });
    }

    // Update pending requests count
    const pendingCount = leaves.filter(leave => leave.status === "Pending").length;
    document.getElementById("pendingRequests").innerText = pendingCount;
  } catch (error) {
    console.error("Error loading leave requests:", error);
    document.getElementById("pendingRequests").innerText = "0";
    document.getElementById("leaveRequestsTable").innerHTML = "<tr><td colspan='4'>Error loading leave requests</td></tr>";
  }
}

// Load attendance data
async function loadAttendanceData() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(`http://localhost:5000/attendance/${today}`);
    const attendance = await res.json();

    const activeToday = attendance.filter(att => att.status === "Present" || att.status === "Half-Day").length;
    document.getElementById("activeToday").innerText = activeToday;
  } catch (error) {
    console.error("Error loading attendance data:", error);
    document.getElementById("activeToday").innerText = "0";
  }
}

// Load regularization requests
async function loadRegularizationRequests() {
  try {
    const res = await fetch("http://localhost:5000/regularization");
    const regularizations = await res.json();

    const tbody = document.getElementById("regularizationTable");
    tbody.innerHTML = "";

    if (regularizations.length === 0) {
      tbody.innerHTML = "<tr><td colspan='6'>No regularization requests found</td></tr>";
    } else {
      regularizations.forEach(req => {
        const statusClass = req.status.toLowerCase();
        const appliedDate = new Date(req.appliedDate).toLocaleDateString();
        const requestDate = new Date(req.date).toLocaleDateString();
        
        const row = `
          <tr>
            <td>${req.employee}</td>
            <td>${requestDate}</td>
            <td>${req.reason || 'N/A'}</td>
            <td><span class="status-badge status-${statusClass}">${req.status}</span></td>
            <td>${appliedDate}</td>
            <td>
              ${req.status === 'Pending' ? `
                <button class="btn-small" onclick="approveRegularization('${req._id}')" style="background: #27ae60; margin-right: 5px;">Approve</button>
                <button class="btn-small" onclick="rejectRegularization('${req._id}')" style="background: #e74c3c;">Reject</button>
              ` : `
                <span class="status-text">${req.status}</span>
              `}
            </td>
          </tr>
        `;
        tbody.innerHTML += row;
      });
    }

    // Update pending regularization count
    const pendingRegularizations = regularizations.filter(req => req.status === "Pending").length;
    console.log(`Pending regularizations: ${pendingRegularizations}`);
  } catch (error) {
    console.error("Error loading regularization requests:", error);
    document.getElementById("regularizationTable").innerHTML = "<tr><td colspan='6'>Error loading regularization requests</td></tr>";
  }
}

// Approve regularization request
async function approveRegularization(regularizationId) {
  await updateRegularizationStatus(regularizationId, "Approved");
}

// Reject regularization request
async function rejectRegularization(regularizationId) {
  await updateRegularizationStatus(regularizationId, "Rejected");
}

// Load pending leave requests for approval
async function loadPendingLeaveRequests() {
  try {
    const res = await fetch("http://localhost:5000/leaves");
    const leaves = await res.json();

    const pendingLeaves = leaves.filter(leave => leave.status === "Pending");
    const tbody = document.getElementById("approvalsTable");
    tbody.innerHTML = "";

    if (pendingLeaves.length === 0) {
      tbody.innerHTML = "<tr><td colspan='5'>No pending requests 🎉</td></tr>";
    } else {
      pendingLeaves.forEach(leave => {
        const row = `<tr>
          <td>${leave.employee}</td>
          <td>${new Date(leave.from).toLocaleDateString()} - ${new Date(leave.to).toLocaleDateString()}</td>
          <td>${leave.leaveType || 'N/A'}</td>
          <td>${leave.reason || 'N/A'}</td>
          <td>
            <button class="btn-small" onclick="approveLeave('${leave._id}')" style="background: #27ae60; margin-right: 5px;">Approve</button>
            <button class="btn-small" onclick="rejectLeave('${leave._id}')" style="background: #e74c3c;">Reject</button>
          </td>
        </tr>`;
        tbody.innerHTML += row;
      });
    }
  } catch (error) {
    console.error("Error loading pending leave requests:", error);
    document.getElementById("approvalsTable").innerHTML = "<tr><td colspan='5'>Error loading pending requests</td></tr>";
  }
}

// Approve leave request
async function approveLeave(leaveId) {
  await updateLeaveStatus(leaveId, "Approved");
}

// Reject leave request
async function rejectLeave(leaveId) {
  await updateLeaveStatus(leaveId, "Rejected");
}

// Approve/Reject leave request
async function updateLeaveStatus(leaveId, status) {
  try {
    const res = await fetch(`http://localhost:5000/leaves/${leaveId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    if (res.ok) {
      alert(`Leave request ${status.toLowerCase()} successfully!`);
      
      // Emit real-time update
      if (typeof socket !== 'undefined') {
        socket.emit('leave-update', {
          leaveId: leaveId,
          status: status,
          action: 'status-changed'
        });
      }
      
      // Update real-time chart immediately
      await updateLeaveChartData();
      
      loadPendingLeaveRequests();
      loadLeaveRequests();
      loadDashboardStats();
    } else {
      alert("Error updating leave request");
    }
  } catch (error) {
    console.error("Error updating leave status:", error);
    alert("Error updating leave request");
  }
}

// Approve/Reject regularization request
async function updateRegularizationStatus(regularizationId, status) {
  try {
    const res = await fetch(`http://localhost:5000/regularization/${regularizationId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    if (res.ok) {
      alert(`Regularization request ${status.toLowerCase()} successfully!`);
      
      // Emit real-time update
      if (typeof socket !== 'undefined') {
        socket.emit('regularization-update', {
          regularizationId: regularizationId,
          status: status,
          action: 'status-changed'
        });
      }
      
      loadRegularizationRequests(); // Refresh the list
    } else {
      alert("Error updating regularization request");
    }
  } catch (error) {
    console.error("Error updating regularization status:", error);
    alert("Error updating regularization request");
  }
}

// Load dashboard statistics
async function loadDashboardStats() {
  try {
    const res = await fetch("http://localhost:5000/dashboard/stats");
    const stats = await res.json();

    document.getElementById("totalEmployees").innerText = stats.totalEmployees || 0;
    document.getElementById("activeToday").innerText = stats.activeToday || 0;
    document.getElementById("pendingRequests").innerText = stats.pendingLeaves || 0;
    document.getElementById("leavesToday").innerText = stats.leavesToday || 0;
  } catch (error) {
    console.error("Error loading dashboard stats:", error);
    document.getElementById("totalEmployees").innerText = "0";
    document.getElementById("activeToday").innerText = "0";
    document.getElementById("pendingRequests").innerText = "0";
    document.getElementById("leavesToday").innerText = "0";
  }
}

// Load upcoming birthdays
async function loadBirthdays() {
  try {
    const res = await fetch("http://localhost:5000/birthdays");
    const birthdays = await res.json();

    const birthdayList = document.getElementById("birthdayList");
    birthdayList.innerHTML = "";

    if (birthdays.length === 0) {
      birthdayList.innerHTML = "<li>No upcoming birthdays 🎉</li>";
    } else {
      birthdays.forEach(birthday => {
        const birthdayDate = new Date(birthday.dob);
        const today = new Date();
        const thisYearBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
        const daysUntil = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));
        
        const li = document.createElement("li");
        li.innerHTML = `🎂 ${birthday.name || birthday.username || 'Employee'} — ${birthdayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${daysUntil} days)`;
        birthdayList.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error loading birthdays:", error);
    document.getElementById("birthdayList").innerHTML = "<li>Error loading birthdays ❌</li>";
  }
}

// Load today's attendance for all employees
async function loadTodayAttendance() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(`http://localhost:5000/attendance/${today}`);
    const attendanceData = await res.json();

    const tbody = document.getElementById("todayAttendanceTable");
    tbody.innerHTML = "";

    if (attendanceData.length === 0) {
      tbody.innerHTML = "<tr><td colspan='5'>No attendance records for today</td></tr>";
    } else {
      attendanceData.forEach(att => {
        const punchInTime = att.punchIn ? new Date(att.punchIn).toLocaleTimeString() : 'N/A';
        const punchOutTime = att.punchOut ? new Date(att.punchOut).toLocaleTimeString() : 'N/A';
        const statusClass = att.status.toLowerCase().replace(' ', '-');
        
        const row = `<tr>
          <td>${att.employee}</td>
          <td><span class="status-badge status-${statusClass}">${att.status}</span></td>
          <td>${punchInTime}</td>
          <td>${punchOutTime}</td>
          <td>${att.punchType || 'N/A'}</td>
        </tr>`;
        tbody.innerHTML += row;
      });
    }
  } catch (error) {
    console.error("Error loading today's attendance:", error);
    document.getElementById("todayAttendanceTable").innerHTML = "<tr><td colspan='5'>Error loading attendance data</td></tr>";
  }
}

// Take attendance functionality
async function takeAttendance() {
  const modal = document.getElementById("attendanceModal");
  const dateInput = document.getElementById("attendanceDate");
  
  // Set today's date as default
  dateInput.value = new Date().toISOString().split('T')[0];
  
  modal.style.display = "block";
  
  // Load all employees for attendance
  await loadEmployeesForAttendance();
}

// Load employees for attendance modal
async function loadEmployeesForAttendance() {
  try {
    const res = await fetch("http://localhost:5000/users");
    const employees = await res.json();
    
    const attendanceList = document.getElementById("attendanceList");
    attendanceList.innerHTML = "";
    
    employees.forEach(emp => {
      const div = document.createElement("div");
      div.className = "attendance-employee";
      div.innerHTML = `
        <span>${emp.name || emp.username || emp.email}</span>
        <select class="attendance-status" data-employee="${emp.email}">
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Half-Day">Half-Day</option>
        </select>
      `;
      attendanceList.appendChild(div);
    });
  } catch (error) {
    console.error("Error loading employees for attendance:", error);
  }
}

// Save attendance
async function saveAttendance() {
  try {
    const attendanceDate = document.getElementById("attendanceDate").value;
    const attendanceStatuses = document.querySelectorAll('.attendance-status');
    
    const attendanceRecords = [];
    attendanceStatuses.forEach(select => {
      const employee = select.dataset.employee;
      const status = select.value;
      
      if (status !== 'Present') { // Only save non-present records
        attendanceRecords.push({
          employee: employee,
          date: new Date(attendanceDate),
          status: status
        });
      }
    });
    
    // Save attendance records
    for (const record of attendanceRecords) {
      await fetch("http://localhost:5000/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
      });
    }
    
    alert("Attendance saved successfully!");
    
    // Emit real-time update
    if (typeof socket !== 'undefined') {
      socket.emit('attendance-update', {
        action: 'bulk-attendance',
        records: attendanceRecords.length,
        date: attendanceDate
      });
    }
    
    closeAttendanceModal();
    loadHRDashboardData(); // Refresh dashboard
  } catch (error) {
    console.error("Error saving attendance:", error);
    alert("Error saving attendance");
  }
}

// Close attendance modal
function closeAttendanceModal() {
  document.getElementById("attendanceModal").style.display = "none";
}

// Load all HR dashboard data
async function loadHRDashboardData() {
  try {
    loadDashboardStats();
  loadEmployees();
    loadLeaveRequests();
    loadPendingLeaveRequests();
    loadAttendanceData();
    loadTodayAttendance();
    loadRegularizationRequests();
    loadBirthdays();
  } catch (error) {
    console.error("Error loading HR dashboard data:", error);
  }
}

// Smart auto-refresh HR dashboard (only when needed)
let lastHRRefreshTime = 0;
const HR_REFRESH_INTERVAL = 60000; // 1 minute

function startHRAutoRefresh() {
  setInterval(async () => {
    const now = Date.now();
    // Only refresh if it's been more than 1 minute since last refresh
    // and if the page is visible (not in background tab)
    if (now - lastHRRefreshTime > HR_REFRESH_INTERVAL && !document.hidden) {
      console.log('🔄 Auto-refreshing HR dashboard...');
    await loadHRDashboardData();
      lastHRRefreshTime = now;
    }
  }, 30000); // Check every 30 seconds
}

// Refresh when page becomes visible again
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    console.log('👁️ HR Page visible, refreshing data...');
    loadHRDashboardData();
  }
});

// Employee search functionality
function setupEmployeeSearch() {
  const searchInput = document.getElementById("employeeSearch");
  const clearBtn = document.getElementById("clearSearchBtn");
  
  if (searchInput) {
    searchInput.addEventListener("input", function() {
      const searchTerm = this.value.toLowerCase();
      const rows = document.querySelectorAll("#employeeTable tr");
      
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  }
  
  if (clearBtn) {
    clearBtn.addEventListener("click", function() {
      searchInput.value = "";
      const rows = document.querySelectorAll("#employeeTable tr");
      rows.forEach(row => {
        row.style.display = "";
      });
    });
  }
}

// Create test data for debugging
async function createTestData() {
  try {
    console.log("Creating test data...");
    
    const res = await fetch("http://localhost:5000/test-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    
    if (!res.ok) {
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response. Check if server is running.');
    }
    
    const result = await res.json();
    alert("Test data created successfully! Refreshing dashboard...");
    await loadHRDashboardData();
  } catch (error) {
    console.error("Error creating test data:", error);
    alert("Error creating test data: " + error.message + "\n\nMake sure the server is running on http://localhost:5000");
  }
}

// Real-time charts
let attendanceChart = null;
let leaveStatusChart = null;

// Initialize charts
function initializeCharts() {
  // Attendance Chart
  const attendanceCtx = document.getElementById('attendanceChart');
  if (attendanceCtx) {
    attendanceChart = new Chart(attendanceCtx, {
      type: 'doughnut',
      data: {
        labels: ['Present', 'Absent', 'Half-Day'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  // Leave Status Chart
  const leaveStatusCtx = document.getElementById('leaveStatusChart');
  if (leaveStatusCtx) {
    leaveStatusChart = new Chart(leaveStatusCtx, {
      type: 'bar',
      data: {
        labels: ['Pending', 'Approved', 'Rejected'],
        datasets: [{
          label: 'Leave Requests',
          data: [0, 0, 0],
          backgroundColor: ['#ffc107', '#28a745', '#dc3545'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

// Update attendance chart with real-time data
async function updateAttendanceChart() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(`http://localhost:5000/attendance/${today}`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (res.ok) {
      const attendanceData = await res.json();
      
      const present = attendanceData.filter(att => att.status === 'Present').length;
      const absent = attendanceData.filter(att => att.status === 'Absent').length;
      const halfDay = attendanceData.filter(att => att.status === 'Half-Day').length;
      
      if (attendanceChart) {
        attendanceChart.data.datasets[0].data = [present, absent, halfDay];
        attendanceChart.update();
      }
    }
  } catch (error) {
    console.error("Error updating attendance chart:", error);
  }
}

// Update leave status chart with real-time data
async function updateLeaveStatusChart() {
  try {
    const res = await fetch("http://localhost:5000/leaves", {
      headers: { 'Accept': 'application/json' }
    });
    
    if (res.ok) {
      const leaves = await res.json();
      
      const pending = leaves.filter(leave => leave.status === 'Pending').length;
      const approved = leaves.filter(leave => leave.status === 'Approved').length;
      const rejected = leaves.filter(leave => leave.status === 'Rejected').length;
      
      if (leaveStatusChart) {
        leaveStatusChart.data.datasets[0].data = [pending, approved, rejected];
        leaveStatusChart.update();
      }
    }
  } catch (error) {
    console.error("Error updating leave status chart:", error);
  }
}

// Real-time notification system
function showNotification(message, type = 'info') {
  const container = document.getElementById('notificationContainer');
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span class="notification-message">${message}</span>
    <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
  `;
  
  container.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Check server status
async function checkServerStatus() {
  try {
    const res = await fetch("http://localhost:5000/users", {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    const statusEl = document.getElementById('serverStatus');
    if (res.ok) {
      statusEl.textContent = '🟢 Online';
      statusEl.className = 'server-status online';
    } else {
      statusEl.textContent = '🟡 Server Error';
      statusEl.className = 'server-status warning';
    }
  } catch (error) {
    const statusEl = document.getElementById('serverStatus');
    statusEl.textContent = '🔴 Offline';
    statusEl.className = 'server-status offline';
  }
}

// Call functions when page loads
document.addEventListener("DOMContentLoaded", () => {
  loadHRDashboardData();
  setupEmployeeSearch();
  startHRAutoRefresh();
});
