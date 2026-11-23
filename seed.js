require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const User = require("./src/models/user.model");

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const initialAdminData = {
  firstName: "Sameh",
  lastName: "Admin",
  email: "sameh@gmail.com",
  password: "Sameh@123",
  role: "SuperAdmin",
};

async function seedSuperAdmin() {
  if (!MONGODB_URI) {
    console.error("❌ Missing MONGODB_URI in .env");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("📌 Connected to DB name:", mongoose.connection.name);

  try {
    const existingAdmin = await User.findOne({ email: initialAdminData.email });

    if (existingAdmin) {
      console.log(`⚠️ الأدمن موجود بالفعل: ${existingAdmin.email}`);
    } else {
      const adminUser = new User(initialAdminData);
      await adminUser.save();
      console.log(
        `✅ تم إنشاء الأدمن بنجاح في قاعدة [${mongoose.connection.name}]: ${adminUser.email}`,
      );
    }
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit(process.exitCode || 0);
  }
}

seedSuperAdmin();
