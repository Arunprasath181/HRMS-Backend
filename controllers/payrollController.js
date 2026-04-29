const Payroll = require("../models/Payroll");
const Attendance = require("../models/Attendance");
const User = require("../models/User");

const runPayroll = async (req, res) => {
  try {
    const { month, year, deductions = 0 } = req.body;
    
    let totalWorkingDays = 0;
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(year, month - 1, d).getDay();
      if (day !== 0 && day !== 6) totalWorkingDays++;
    }

    const totalDays = totalWorkingDays;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const employees = await User.find({ role: "employee" });
    const results = [];

    for (const emp of employees) {
      const attendance = await Attendance.find({
        employeeId: emp._id,
        date: { $gte: start, $lte: end }
      });

      const absentDays = attendance.filter(r => r.status === "Absent").length;
      const lop = Math.round((emp.basicSalary / totalDays) * absentDays * 100) / 100;
      
      // Use req.body.deductions if provided, otherwise use employee's stored deductions
      const finalDeductions = req.body.deductions !== undefined ? deductions : (emp.deductions || 0);
      const netSalary = (emp.basicSalary + (emp.allowances || 0)) - (finalDeductions + lop);

      const existingPayroll = await Payroll.findOne({ employeeId: emp._id, month, year });

      const payroll = await Payroll.findOneAndUpdate(
        { employeeId: emp._id, month, year },
        { 
          basicSalary: emp.basicSalary,
          allowances: emp.allowances || 0,
          deductions: finalDeductions,
          lop,
          absentDays,
          totalDays,
          netSalary: Math.max(0, netSalary)
        },
        { upsert: true, new: true }
      );

      if (!existingPayroll) {
        emp.leaveBalance += 2;
        await emp.save();
      }

      results.push(payroll);
    }

    res.json({ success: true, count: results.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPayroll = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (req.user.role === "employee" && req.user.userId.toString() !== employeeId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const payrolls = await Payroll.find({ employeeId })
      .populate("employeeId", "name department")
      .sort("-year -month");

    res.json({ success: true, data: payrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyPayroll = async (req, res) => {
  try {
    const payrolls = await Payroll.find({ employeeId: req.user.userId })
      .select("month year basicSalary allowances deductions lop absentDays totalDays netSalary")
      .sort("-year -month");

    res.json({ success: true, data: payrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLatestPayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findOne({ employeeId: req.user.userId })
      .select("month year basicSalary allowances deductions lop absentDays totalDays netSalary")
      .sort("-year -month");

    res.json({ success: true, data: payroll || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { runPayroll, getPayroll, getMyPayroll, getLatestPayslip };
