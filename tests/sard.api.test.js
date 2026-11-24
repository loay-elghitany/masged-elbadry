process.env.JWT_SECRET = process.env.JWT_SECRET || "sard-test-secret";

const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const User = require("../src/models/user.model");
const SardEvaluation = require("../src/models/sardEvaluation.model");

let mongoServer;

const makeToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );

const registration = (overrides = {}) => ({
  studentName: "Yusuf Ahmed",
  ageOrGrade: "12 سنة",
  talent: "الخط العربي",
  studentEmail: "yusuf@example.com",
  studentPassword: "studentpass123",
  parentName: "Ahmed Yusuf",
  parentPhone: "01001234567",
  parentEmail: "ahmed@example.com",
  parentPassword: "parentpass123",
  ...overrides,
});

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  for (const collection of Object.values(mongoose.connection.collections)) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Juz Amma recitation competition", () => {
  it("registers linked parent and student accounts and issues sequential codes", async () => {
    const [first, second] = await Promise.all([
      request(app).post("/api/public/sard-register").send(registration()),
      request(app)
        .post("/api/public/sard-register")
        .send(
        registration({
          studentEmail: "student2@example.com",
          parentEmail: "parent2@example.com",
        }),
        ),
    ]);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(
      [first.body.competitionCode, second.body.competitionCode].sort(),
    ).toEqual(["BDR-101", "BDR-102"]);
    const student = await User.findById(first.body.student.id);
    const parent = await User.findById(first.body.parent.id);
    expect(student.parentId.toString()).toBe(parent._id.toString());
    expect(parent.childrenIds.map(String)).toContain(student._id.toString());
    expect(student.teacherId).toBeFalsy();
    expect(student.parentPhone).toBe("01001234567");
  });

  it("snapshots scoring rules, calculates final score, and rejects unauthorized or invalid ayah evaluations", async () => {
    const admin = await User.create({
      firstName: "Admin",
      lastName: "Sard",
      email: "admin@example.com",
      password: "adminpass123",
      role: "SuperAdmin",
    });
    const teacher = await User.create({
      firstName: "Sheikh",
      lastName: "Amin",
      email: "teacher@example.com",
      password: "teacherpass123",
      role: "Teacher",
    });
    const otherTeacher = await User.create({
      firstName: "Other",
      lastName: "Teacher",
      email: "other@example.com",
      password: "teacherpass123",
      role: "Teacher",
    });
    const registered = await request(app)
      .post("/api/public/sard-register")
      .send(registration());

    const savedSettings = await request(app)
      .put("/api/admin/sard/settings")
      .set("Authorization", `Bearer ${makeToken(admin)}`)
      .send({
        maxScore: 200,
        hesitationPenalty: 1,
        alertPenalty: 2,
        correctionPenalty: 4,
      });
    expect(savedSettings.status).toBe(200);

    const studentId = registered.body.student.id;
    const assignment = await request(app)
      .put(`/api/admin/sard/students/${studentId}/committee`)
      .set("Authorization", `Bearer ${makeToken(admin)}`)
      .send({ assignedCommittee: "قاعة النور", teacherId: teacher._id });
    expect(assignment.status).toBe(200);

    const denied = await request(app)
      .post("/api/teacher/sard-evaluations")
      .set("Authorization", `Bearer ${makeToken(otherTeacher)}`)
      .send({ studentId, alertCount: 1 });
    expect(denied.status).toBe(403);

    const invalidAyah = await request(app)
      .post("/api/teacher/sard-evaluations")
      .set("Authorization", `Bearer ${makeToken(teacher)}`)
      .send({
        studentId,
        mistakes: [{ surahName: "النبأ", ayahNumber: 41 }],
      });
    expect(invalidAyah.status).toBe(400);

    const invalidType = await request(app)
      .post("/api/teacher/sard-evaluations")
      .set("Authorization", `Bearer ${makeToken(teacher)}`)
      .send({
        studentId,
        mistakes: [{ surahName: "النبأ", ayahNumber: 25, type: "unknown" }],
      });
    expect(invalidType.status).toBe(400);

    const evaluationResponse = await request(app)
      .post("/api/teacher/sard-evaluations")
      .set("Authorization", `Bearer ${makeToken(teacher)}`)
      .send({
        studentId,
        hesitationCount: 3,
        alertCount: 2,
        correctionCount: 1,
        mistakes: [
          { surahName: "النبأ", ayahNumber: 25, type: "correction" },
          { surahName: "الناس", ayahNumber: null },
        ],
      });

    expect(evaluationResponse.status).toBe(201);
    expect(evaluationResponse.body.evaluation.maxScore).toBe(200);
    expect(evaluationResponse.body.evaluation.finalScore).toBe(189);
    expect(evaluationResponse.body.evaluation.mistakes[0]).toMatchObject({
      surahName: "النبأ",
      ayahNumber: 25,
      type: "correction",
    });
    expect(evaluationResponse.body.evaluation.mistakes[1]).toMatchObject({
      surahName: "الناس",
      ayahNumber: null,
      type: "alert",
    });
    const savedEvaluation = await SardEvaluation.findById(
      evaluationResponse.body.evaluation._id,
    );
    expect(savedEvaluation.hesitationPenalty).toBe(1);
    expect(savedEvaluation.alertPenalty).toBe(2);
    expect(savedEvaluation.correctionPenalty).toBe(4);
  });
});
