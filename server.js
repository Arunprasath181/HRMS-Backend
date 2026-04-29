const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const result = dotenv.config();
if (result.error) {
  console.warn("Warning: .env file not found or could not be loaded. Environment variables may be missing.");
}
connectDB();

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/employees", require("./routes/employeeRoutes"));
app.use("/attendance", require("./routes/attendanceRoutes"));
app.use("/payroll", require("./routes/payrollRoutes"));
app.use("/dashboard", require("./routes/dashboardRoutes"));

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "HRMS API is running",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
