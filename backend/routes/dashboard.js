const express = require('express')

const router = express.Router()

const gradesRouter = require("./dashboard/grades")
const teachersRouter = require("./dashboard/teachers")
const studentsRouter = require("./dashboard/students")
const classesRouter = require("./dashboard/classes")

router.use("/grades", gradesRouter)
router.use("/teachers", teachersRouter)
router.use("/students", studentsRouter)
router.use("/classes", classesRouter)

module.exports = router