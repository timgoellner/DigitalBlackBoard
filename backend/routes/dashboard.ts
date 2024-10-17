import express from 'express'

const router = express.Router()

import gradesRouter from "./dashboard/grades"
import teachersRouter from "./dashboard/teachers"
import studentsRouter from "./dashboard/students"
import classesRouter from "./dashboard/classes"
import changesRouter from "./dashboard/changes"
import accountsRouter from "./dashboard/accounts"
import organizationsRouter from "./dashboard/organizations"
import subjectsRouter from "./dashboard/subjects"
import roomsRouter from "./dashboard/rooms"

router.use("/grades", gradesRouter)
router.use("/teachers", teachersRouter)
router.use("/students", studentsRouter)
router.use("/classes", classesRouter)
router.use("/changes", changesRouter)
router.use("/accounts", accountsRouter)
router.use("/organizations", organizationsRouter)
router.use("/subjects", subjectsRouter)
router.use("/rooms", roomsRouter)

export default router