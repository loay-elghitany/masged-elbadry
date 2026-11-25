const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const User = require("../src/models/user.model");
const SardEvaluation = require("../src/models/sardEvaluation.model");

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
  it("publicly ranks all evaluated Sard participants without opt-in filtering", async () => {
    const first = await User.create({
      firstName: "Amina",
      lastName: "Ali",
      email: "amina@example.com",
      password: "studentpass123",
      role: "Student",
      competitionCode: "BDR-101",
      publicLeaderboardOptIn: false,
    });
    const second = await User.create({
      firstName: "Omar",
      lastName: "Hassan",
      email: "omar@example.com",
      password: "studentpass123",
      role: "Student",
      competitionCode: "BDR-102",
      publicLeaderboardOptIn: true,
    });
    const evaluationFields = {
      teacherId: teacher._id,
      evaluatedBy: { teacherId: teacher._id, name: "Teacher User" },
      maxScore: 100,
    };
    await SardEvaluation.create({
      studentId: first._id,
      ...evaluationFields,
      alertCount: 2,
      alertPenalty: 5,
    });
    await SardEvaluation.create({
      studentId: second._id,
      ...evaluationFields,
      alertCount: 1,
      alertPenalty: 5,
    });

    const leaderboardResponse = await request(app).get("/api/leaderboard");

    expect(leaderboardResponse.status).toBe(200);
    expect(leaderboardResponse.body.leaderboard).toEqual([
      {
        rank: 1,
        firstName: "Omar",
        lastName: "Hassan",
        competitionCode: "BDR-102",
        finalScore: 95,
        maxScore: 100,
        evaluatedBy: "Teacher User",
      },
      {
        rank: 2,
        firstName: "Amina",
        lastName: "Ali",
        competitionCode: "BDR-101",
        finalScore: 90,
        maxScore: 100,
        evaluatedBy: "Teacher User",
      },
    ]);
    const responseJson = JSON.stringify(leaderboardResponse.body);
    expect(responseJson).not.toContain(first.email);
    expect(responseJson).not.toContain(second.email);
    expect(responseJson).not.toContain(first._id.toString());
    expect(responseJson).not.toContain(teacher._id.toString());
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
