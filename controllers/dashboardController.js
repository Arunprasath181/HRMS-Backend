const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Payroll = require("../models/Payroll");

const getDashboardSummary = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: "employee" });

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todayAttendance = await Attendance.find({
      date: { $gte: start, $lte: end },
    });

    const presentToday = todayAttendance.filter(a => a.status === "Present").length;
    const absentToday = todayAttendance.filter(a => a.status === "Absent").length;

    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    const payroll = await Payroll.find({ month, year });
    const totalPayroll = payroll.reduce((sum, r) => sum + r.netSalary, 0);

    res.json({
      success: true,
      data: {
        totalEmployees,
        presentToday,
        absentToday,
        totalPayroll: Math.round(totalPayroll)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardSummary };
