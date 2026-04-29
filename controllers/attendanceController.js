const Attendance = require("../models/Attendance");
const User = require("../models/User");

const bulkMarkAttendance = async (req, res) => {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    for (const record of records) {
      const { employeeId, date, status } = record;
      
      const [y, m, d] = date.split('-').map(Number);
      const attDate = new Date(y, m - 1, d);
      attDate.setHours(0, 0, 0, 0);

      const day = attDate.getDay();
      if (day === 0 || day === 6) continue;

      let finalStatus = status;
      if (status === "Absent") {
        const user = await User.findById(employeeId);
        if (user && Number(user.leaveBalance) > 0) {
          finalStatus = "Leave";
          user.leaveBalance = Math.max(0, user.leaveBalance - 1);
          await user.save();
        }
      }

      await Attendance.findOneAndUpdate(
        { employeeId, date: attDate },
        { status: finalStatus, markedBy: req.user.userId },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, message: "Attendance updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "employee") {
      filter.employeeId = req.user.userId;
    } else if (req.query.employeeId) {
      filter.employeeId = req.query.employeeId;
    }

    if (req.query.date) {
      const start = new Date(req.query.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(req.query.date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const attendance = await Attendance.find(filter)
      .populate("employeeId", "name department")
      .sort("-date");

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ success: false, message: "Not found" });

    const day = new Date(attendance.date).getDay();
    if (day === 0 || day === 6) {
      return res.status(400).json({ success: false, message: "Cannot update attendance for weekends" });
    }

    attendance.status = req.body.status;
    attendance.markedBy = req.user.userId;
    await attendance.save();

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const filter = { employeeId: req.user.userId };

    if (req.query.month && req.query.year) {
      const month = Number(req.query.month);
      const year = Number(req.query.year);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const attendance = await Attendance.find(filter)
      .select("date status")
      .sort("-date");

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyAttendanceSummary = async (req, res) => {
  try {
    const now = new Date();
    const month = Number(req.query.month || now.getMonth() + 1);
    const year = Number(req.query.year || now.getFullYear());
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const records = await Attendance.find({
      employeeId: req.user.userId,
      date: { $gte: start, $lte: end },
    }).select("status");

    const summary = records.reduce(
      (acc, record) => {
        const key = record.status.toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { present: 0, absent: 0, leave: 0 }
    );

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAttendanceReport = async (req, res) => {
  try {
    const { month, year, employeeId } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const filter = { date: { $gte: startDate, $lte: endDate } };
    if (req.user.role === "employee") filter.employeeId = req.user.userId;
    else if (employeeId) filter.employeeId = employeeId;

    const records = await Attendance.find(filter).populate("employeeId", "name");
    const totalDays = new Date(year, month, 0).getDate();

    const report = {};
    records.forEach(r => {
      const id = r.employeeId._id.toString();
      if (!report[id]) {
        report[id] = { name: r.employeeId.name, present: 0, absent: 0, leave: 0 };
      }
      report[id][r.status.toLowerCase()]++;
    });

    res.json({ success: true, data: Object.values(report) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  bulkMarkAttendance,
  getAttendance,
  updateAttendance,
  getMyAttendance,
  getMyAttendanceSummary,
  getAttendanceReport,
};
