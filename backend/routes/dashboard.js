const express = require('express')

const router = express.Router()

const gradesRouter = require("./dashboard/grades")
const teachersRouter = require("./dashboard/teachers")

router.use("/grades", gradesRouter)
router.use("/teachers", teachersRouter)

module.exports = router