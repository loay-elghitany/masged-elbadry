const express = require("express");
const { validateBody } = require("../middlewares/validation.middleware");
const { registerSardStudent } = require("../controllers/sard.controller");
const { sardRegistrationSchema } = require("../validation/schemas/sard.schema");

const router = express.Router();

router.post("/register", validateBody(sardRegistrationSchema), registerSardStudent);

module.exports = router;
