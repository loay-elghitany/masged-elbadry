const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const Badge = require("../src/models/badge.model");
const User = require("../src/models/user.model");

jest.mock("../src/services/quran.service");

let mongoServer;
let studentToken;
let student;
let teacher;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  teacher = new User({
    firstName: "Teacher",
    lastName: "User",
    email: "teacher@example.com",
    password: "teacherpass123",
    role: "Teacher",
  });
  await teacher.save();

  student = new User({
    firstName: "Student",
    lastName: "User",
    email: "student@example.com",
    password: "studentpass123",
    role: "Student",
    teacherId: teacher._id,
  });
  await student.save();

  studentToken = jwt.sign(
    { id: student._id, role: student.role },
    process.env.JWT_SECRET || "defaultsecret",
    { expiresIn: "24h" },
  );
});

afterEach(async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    await mongoose.connection.collections[collectionName].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("GET /api/leaderboard", () => {
  it("makes the opted-in student leaderboard public and exposes display fields only", async () => {
    const privateStudentResponse = await request(app).get(
      "/api/leaderboard/students",
    );

    expect(privateStudentResponse.status).toBe(200);
    expect(privateStudentResponse.body.leaderboard).toEqual([]);

    const badge = await Badge.create({
      name: "قارئ متميز",
      icon: "🌟",
      description: "Private badge description",
    });
    student.points = 125;
    student.avatar = "https://example.com/avatar.png";
    student.badges = [
      {
        badgeId: badge._id,
        awardedBy: teacher._id,
      },
    ];
    student.publicLeaderboardOptIn = true;
    await student.save();

    const studentsResponse = await request(app).get(
      "/api/leaderboard/students",
    );

    expect(studentsResponse.status).toBe(200);
    expect(studentsResponse.body.leaderboard).toEqual([
      {
        rank: 1,
        firstName: "Student",
        lastName: "User",
        points: 125,
        avatar: "https://example.com/avatar.png",
        badges: [{ name: "قارئ متميز", icon: "🌟" }],
      },
    ]);
    const responseJson = JSON.stringify(studentsResponse.body);
    expect(responseJson).not.toContain(student.email);
    expect(responseJson).not.toContain(student._id.toString());
    expect(responseJson).not.toContain(teacher._id.toString());
    expect(responseJson).not.toContain("Private badge description");
  });

  it("keeps group rankings protected", async () => {
    const guestGroupsResponse = await request(app).get(
      "/api/leaderboard/groups",
    );
    expect(guestGroupsResponse.status).toBe(401);

    const groupsResponse = await request(app)
      .get("/api/leaderboard/groups")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(groupsResponse.status).toBe(200);
    expect(groupsResponse.body).toHaveProperty("groupsLeaderboard");
  });
});
