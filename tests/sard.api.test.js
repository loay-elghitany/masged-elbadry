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
  children: [{ childName: "Yusuf Ahmed", ageOrGrade: "12 سنة" }],
  parentName: "Ahmed Yusuf",
  parentPhone: "01001234567",
  parentPassword: "",
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
  it("creates multiple linked child accounts with sequential codes and unique internal emails", async () => {
    const [first, second] = await Promise.all([
      request(app).post("/api/sard/register").send(
        registration({
          children: [
            { childName: "Yusuf Ahmed", ageOrGrade: "12 سنة" },
            { childName: "Yusuf Ali", ageOrGrade: "10 سنة" },
          ],
        }),
      ),
      request(app).post("/api/public/sard-register").send(
        registration({
          parentName: "Mona Ali",
          parentPhone: "01001234568",
          children: [{ childName: "Yusuf Omar", ageOrGrade: "8 سنة" }],
        }),
      ),
    ]);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    const codes = [...first.body.children, ...second.body.children]
      .map((child) => child.sardCode)
      .sort();
    expect(codes).toEqual(["BDR-101", "BDR-102", "BDR-103"]);
    const firstChild = first.body.children.find(
      (child) => child.childName === "Yusuf Ahmed",
    );
    expect(firstChild.email).toBe(
      `yusuf.${firstChild.sardCode.replace("BDR-", "")}@albadri.local`,
    );
    expect(firstChild.password).toBe("01001234567");
    expect(first.body.children).toHaveLength(2);

    const student = await User.findById(first.body.children[0].id);
    const parent = await User.findById(first.body.parent.id);
    expect(student.parentId.toString()).toBe(parent._id.toString());
    expect(parent.childrenIds.map(String)).toEqual(
      first.body.children.map((child) => child.id),
    );
    expect(student.teacherId).toBeFalsy();
    expect(student.parentPhone).toBe("01001234567");
    expect(first.body.parent.email).toBe("parent.01001234567@albadri.local");
  });

  it("reuses the existing parent for a normalized phone and matching name", async () => {
    const first = await request(app)
      .post("/api/sard/register")
      .send(registration());
    const second = await request(app)
      .post("/api/sard/register")
      .send(
        registration({
          parentName: "  aHMED   yUSUF ",
          parentPhone: "0100-123-4567",
          children: [{ childName: "Sara Yusuf", ageOrGrade: "9 سنة" }],
        }),
      );

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.parent).toMatchObject({
      id: first.body.parent.id,
      email: first.body.parent.email,
      password: null,
      reused: true,
    });
    expect(await User.countDocuments({ role: "Parent" })).toBe(1);
    expect(await User.countDocuments({ role: "Student" })).toBe(2);

    const reusedParent = await User.findById(first.body.parent.id);
    expect(reusedParent.childrenIds.map(String)).toEqual(
      expect.arrayContaining([
        first.body.student.id,
        second.body.student.id,
      ]),
    );
    const secondChild = await User.findById(second.body.student.id);
    expect(secondChild.parentId.toString()).toBe(reusedParent._id.toString());
    expect(secondChild.parentPhone).toBe("01001234567");
  });

  it("finds legacy parent accounts with phone formatting differences", async () => {
    const legacyParent = await User.create({
      firstName: "Ahmed",
      lastName: "Yusuf",
      email: "legacy-parent@example.com",
      password: "parentpass123",
      role: "Parent",
      phone: "0100 123-4567",
      childrenIds: [new mongoose.Types.ObjectId()],
    });
    await User.collection.updateOne(
      { _id: legacyParent._id },
      { $unset: { parentPhoneNormalized: "" } },
    );

    const response = await request(app)
      .post("/api/sard/register")
      .send(registration());

    expect(response.status).toBe(201);
    expect(response.body.parent.id).toBe(legacyParent._id.toString());
    expect(response.body.parent.reused).toBe(true);
    const reusedParent = await User.findById(legacyParent._id);
    expect(reusedParent.phone).toBe("0100 123-4567");
    expect(reusedParent.parentPhoneNormalized).toBeUndefined();
    expect(await User.countDocuments({ role: "Parent" })).toBe(1);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "01001234567", password: "parentpass123" });
    expect(login.status).toBe(200);
    expect(login.body.user.id).toBe(legacyParent._id.toString());
  });

  it("rejects a matching phone submitted under a different parent name", async () => {
    await request(app)
      .post("/api/sard/register")
      .send(registration());

    const response = await request(app)
      .post("/api/sard/register")
      .send(
        registration({
          parentName: "Mona Ali",
          children: [{ childName: "Sara Yusuf", ageOrGrade: "9 سنة" }],
        }),
      );

    expect(response.status).toBe(409);
    expect(response.body.message).toBe(
      "رقم الهاتف مسجل بالفعل باسم ولي أمر آخر (Ahmed Yusuf). يرجى التأكد من الرقم أو التسجيل بنفس اسم ولي الأمر لإضافة أبناء جدد.",
    );
    expect(await User.countDocuments({ role: "Parent" })).toBe(1);
    expect(await User.countDocuments({ role: "Student" })).toBe(1);
  });

  it("recovers concurrent registrations by reusing the parent created first", async () => {
    const [first, second] = await Promise.all([
      request(app).post("/api/sard/register").send(registration()),
      request(app)
        .post("/api/sard/register")
        .send(
          registration({
            children: [{ childName: "Sara Yusuf", ageOrGrade: "9 سنة" }],
          }),
        ),
    ]);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(await User.countDocuments({ role: "Parent" })).toBe(1);
    const parent = await User.findOne({ role: "Parent" });
    expect(parent.childrenIds).toHaveLength(2);
    expect(first.body.parent.id).toBe(parent._id.toString());
    expect(second.body.parent.id).toBe(parent._id.toString());
    expect([first.body.parent.reused, second.body.parent.reused]).toContain(true);
  });

  it("enforces unique normalized phone values for parent accounts", async () => {
    await User.create({
      firstName: "Ahmed",
      lastName: "Yusuf",
      email: "parent-one@example.com",
      password: "parentpass123",
      role: "Parent",
      phone: "0100 123-4567",
      childrenIds: [new mongoose.Types.ObjectId()],
    });

    await expect(
      User.create({
        firstName: "Mona",
        lastName: "Ali",
        email: "parent-two@example.com",
        password: "parentpass123",
        role: "Parent",
        phone: "01001234567",
        childrenIds: [new mongoose.Types.ObjectId()],
      }),
    ).rejects.toMatchObject({ code: 11000 });
  });

  it("supports sign-in by child code and parent phone", async () => {
    const registered = await request(app)
      .post("/api/sard/register")
      .send(registration());
    const childLogin = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "BDR-101", password: "01001234567" });
    const parentLogin = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "0100 123-4567", password: "01001234567" });

    expect(registered.status).toBe(201);
    expect(childLogin.status).toBe(200);
    expect(childLogin.body.user.role).toBe("Student");
    expect(parentLogin.status).toBe(200);
    expect(parentLogin.body.user.role).toBe("Parent");
  });

  it("allows teachers to find and evaluate any Sard contestant and records evaluator identity", async () => {
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
    const registered = await request(app)
      .post("/api/sard/register")
      .send(registration());
    const studentId = registered.body.student.id;
    const token = makeToken(teacher);

    const listResponse = await request(app)
      .get("/api/teacher/sard/students")
      .set("Authorization", `Bearer ${token}`);
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.students.map((student) => student._id)).toContain(studentId);

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

    const invalidAyah = await request(app)
      .post("/api/teacher/sard-evaluations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        studentId,
        mistakes: [{ surahName: "النبأ", ayahNumber: 41 }],
      });
    expect(invalidAyah.status).toBe(400);

    const invalidType = await request(app)
      .post("/api/teacher/sard-evaluations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        studentId,
        mistakes: [{ surahName: "النبأ", ayahNumber: 25, type: "unknown" }],
      });
    expect(invalidType.status).toBe(400);

    const evaluationResponse = await request(app)
      .post("/api/teacher/sard-evaluations")
      .set("Authorization", `Bearer ${token}`)
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
    expect(evaluationResponse.body.evaluation.evaluatedBy).toMatchObject({
      teacherId: teacher._id.toString(),
      name: "Sheikh Amin",
    });
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
    expect((await User.findById(studentId)).teacherId.toString()).toBe(
      teacher._id.toString(),
    );

    const leaderboard = await request(app).get("/api/leaderboard");
    expect(leaderboard.body.leaderboard).toEqual([
      {
        rank: 1,
        studentName: "Yusuf Ahmed",
        sardCode: "BDR-101",
        score: 189,
      },
    ]);
    expect(leaderboard.body.encouragementList).toEqual([]);
  });

  it("saves incomplete evaluations without a numeric score and marks the contestant evaluated", async () => {
    const teacher = await User.create({
      firstName: "Mona",
      lastName: "Teacher",
      email: "mona@example.com",
      password: "teacherpass123",
      role: "Teacher",
    });
    const registered = await request(app)
      .post("/api/sard/register")
      .send(registration());

    const response = await request(app)
      .post("/api/teacher/sard-evaluations")
      .set("Authorization", `Bearer ${makeToken(teacher)}`)
      .send({
        studentId: registered.body.student.id,
        completionStatus: "incomplete",
        encouragementGrade: "جيد جداً",
        stoppedAtSurah: "النازعات",
        teacherNote: "أحسنت، واصل المحاولة.",
      });

    expect(response.status).toBe(201);
    expect(response.body.evaluation).toMatchObject({
      completionStatus: "incomplete",
      encouragementGrade: "جيد جداً",
      stoppedAtSurah: "النازعات",
      teacherNote: "أحسنت، واصل المحاولة.",
      finalScore: null,
      maxScore: null,
      evaluatedBy: {
        teacherId: teacher._id.toString(),
        name: "Mona Teacher",
      },
    });
    expect((await User.findById(registered.body.student.id)).sardEvaluated).toBe(true);

    const leaderboard = await request(app).get("/api/leaderboard");
    expect(leaderboard.body.leaderboard).toEqual([]);
    expect(leaderboard.body.encouragementList).toEqual([
      {
        studentName: "Yusuf Ahmed",
        sardCode: "BDR-101",
        encouragementGrade: "جيد جداً",
        stoppedAtSurah: "النازعات",
      },
    ]);
    expect(JSON.stringify(leaderboard.body.encouragementList[0])).not.toMatch(/score|rank/i);
  });
});
