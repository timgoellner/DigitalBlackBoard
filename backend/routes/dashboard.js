const express = require('express')

const router = express.Router()

const gradesRouter = require("./dashboard/grades")
const teachersRouter = require("./dashboard/teachers")
const studentsRouter = require("./dashboard/students")
const classesRouter = require("./dashboard/classes")
const changesRouter = require("./dashboard/changes")
const accountsRouter = require("./dashboard/accounts")
const organizationsRouter = require("./dashboard/organizations")
const subjectsRouter = require("./dashboard/subjects")
const roomsRouter = require("./dashboard/rooms")

router.use("/grades", gradesRouter)
router.use("/teachers", teachersRouter)
router.use("/students", studentsRouter)
router.use("/classes", classesRouter)
router.use("/changes", changesRouter)
router.use("/accounts", accountsRouter)
router.use("/organizations", organizationsRouter)
router.use("/subjects", subjectsRouter)
router.use("/rooms", roomsRouter)

module.exports = router