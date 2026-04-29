const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const connectDB = require("./config/db");

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin exists already");
      process.exit(0);
    }

    await User.create({
      name: "Admin",
      email: "admin@hrms.com",
      password: "admin123",
      role: "admin",
      department: "Management",
      basicSalary: 100000,
      allowances: 20000,
    });

    console.log("Admin created: admin@hrms.com / admin123");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
