import express from 'express'
import { ResultSetHeader, RowDataPacket, escape } from 'mysql2'

import sendQuery from "../../helpers/mysql"
import validateUser from "../../helpers/validateUser"

const router = express.Router()

const types = [ "cancellation", "change", "information" ]

router.get("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const changesData = await sendQuery(`SELECT changes.id, changes.type, classes.id classId, classes.name className, grades.id gradesId, grades.grade, grades.subgrade, teachers.id teacherId, teachers.forename teacherForename, teachers.lastname teacherLastname, rooms.name room, subjects.name subject, changes.information FROM changes LEFT JOIN classes ON changes.class = classes.id INNER JOIN grades ON classes.grade = grades.id LEFT JOIN teachers ON changes.teacher = teachers.id LEFT JOIN rooms ON changes.room = rooms.id LEFT JOIN subjects ON changes.subject = subjects.id WHERE changes.organization = ${escape(user.organization)}`) as RowDataPacket[]

  const changes: any = {}
  changesData.forEach((change) => {
    changes[change.id] = {
      type: change.type,
      class: {
        id: change.classId,
        name: change.className
      },
      teacher: {
        id: change.teacherId,
        forename: change.teacherForename,
        lastname: change.teacherLastname
      },
      subject: change.subject,
      room: change.room,
      grade: {
        id: change.gradeId,
        grade: change.grade,
        subgrade: change.subgrade
      },
      information: change.information
    }
  })

  const teachers = await sendQuery(`SELECT id, forename, lastname FROM teachers WHERE teachers.organization = ${escape(user.organization)} ORDER BY forename, lastname`)
  const grades = await sendQuery(`SELECT id, grade, subgrade FROM grades WHERE grades.organization = ${escape(user.organization)} ORDER BY grade, subgrade`)
  const classes = await sendQuery(`SELECT classes.id, name, weekday, grades.id gradeId, grades.grade, grades.subgrade FROM classes LEFT JOIN grades ON classes.grade = grades.id WHERE classes.organization = ${escape(user.organization)} ORDER BY grade, subgrade`)

  return response.status(200).json({ message: 'success', changes, teachers, grades, classes })
})

router.post("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { changeType, changeClass, changeTeacher, changeSubject, changeRoom, changeInformation } = request.body
  changeType = changeType?.toLowerCase()
  changeSubject = changeSubject?.toLowerCase()

  const class_ = await sendQuery(`SELECT * FROM classes WHERE organization = ${escape(user.organization)} AND id = ${escape(changeClass)}`) as RowDataPacket[]
  if (class_.length === 0) return response.status(409).json({ message: 'class does not exist' })

  const change = await sendQuery(`SELECT * FROM changes WHERE organization = ${escape(user.organization)} AND class = ${escape(changeClass)}`) as RowDataPacket[]
  if (change.length > 0) return response.status(409).json({ message: 'class already has a change' })

  if (!types.some(type => type === changeType)) return response.status(409).json({ message: 'invalid type' })

  const changeId = (await sendQuery(`INSERT INTO changes (organization, type, class) VALUES (${escape(user.organization)}, ${escape(changeType)}, ${escape(class_[0].id)})`) as ResultSetHeader).insertId

  const changes = []
  if (changeType === 'change') {
    if (changeTeacher) {
      const teacher = await sendQuery(`SELECT * FROM teachers WHERE organization = ${escape(user.organization)} AND id = ${escape(changeTeacher)}`) as RowDataPacket[]
      if (teacher.length === 0) return response.status(409).json({ message: 'teacher does not exist' })

      changes.push(`teacher = ${escape(teacher[0].id)}`)
    }

    if (changeSubject) {
      const subject = await sendQuery(`SELECT * FROM subjects WHERE organization = ${escape(user.organization)} AND name = ${escape(changeSubject)}`) as RowDataPacket[]
      if (subject.length === 0) return response.status(409).json({ message: 'subject does not exist' })

      changes.push(`subject = ${escape(subject[0].id)}`)
    }

    if (changeRoom) {
      const room = await sendQuery(`SELECT * FROM rooms WHERE organization = ${escape(user.organization)} AND name = ${escape(changeRoom)}`) as RowDataPacket[]
      if (room.length === 0) return response.status(409).json({ message: 'room does not exist' })

      changes.push(`room = ${escape(room[0].id)}`)
    }
  }
  
  if (changeType === 'change' || changeType === 'information') {
    if (changeInformation) {
      if (changeInformation.length > 100) return response.status(409).json({ message: 'too long information' })

      changes.push(`information = ${escape(changeInformation)}`)
    }
  }

  if (changes.length > 0) await sendQuery(`UPDATE changes SET ${changes.join(', ')} WHERE organization = ${escape(user.organization)} AND id = ${escape(changeId)}`)

  return response.status(200).json({ message: 'success' })
})

router.put("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { changeId, changeType, changeClass, changeTeacher, changeSubject, changeRoom, changeInformation } = request.body
  changeType = changeType?.toLowerCase()
  changeSubject = changeSubject?.toLowerCase()

  const change = await sendQuery(`SELECT * FROM changes WHERE organization = ${escape(user.organization)} AND id = ${escape(changeId)}`) as RowDataPacket[]
  if (change.length === 0) return response.status(409).json({ message: 'change does not exist' })

  const class_ = await sendQuery(`SELECT * FROM classes WHERE organization = ${escape(user.organization)} AND id = ${escape(changeClass)}`) as RowDataPacket[]
  if (class_.length === 0) return response.status(409).json({ message: 'class does not exist' })

  if (!types.some(type => type === changeType)) return response.status(409).json({ message: 'invalid type' })

  const changes = [`type = ${escape(changeType)}`]

  if (changeType === 'cancellation') changes.push("teacher = NULL, subject = NULL, room = NULL, information = NULL")

  if (changeType === 'information') changes.push("teacher = NULL, subject = NULL, room = NULL")
  
  if (changeType === 'change') {
    if (changeTeacher) {
      const teacher = await sendQuery(`SELECT * FROM teachers WHERE organization = ${escape(user.organization)} AND id = ${escape(changeTeacher)}`) as RowDataPacket[]
      if (teacher.length === 0) return response.status(409).json({ message: 'teacher does not exist' })

      changes.push(`teacher = ${escape(teacher[0].id)}`)
    } else changes.push("teacher = NULL")

    if (changeSubject) {
      const subject = await sendQuery(`SELECT * FROM subjects WHERE organization = ${escape(user.organization)} AND name = ${escape(changeSubject)}`) as RowDataPacket[]
      if (subject.length === 0) return response.status(409).json({ message: 'subject does not exist' })

      changes.push(`subject = ${escape(subject[0].id)}`)
    } else changes.push("subject = NULL")

    if (changeRoom) {
      const room = await sendQuery(`SELECT * FROM rooms WHERE organization = ${escape(user.organization)} AND name = ${escape(changeRoom)}`) as RowDataPacket[]
      if (room.length === 0) return response.status(409).json({ message: 'room does not exist' })

      changes.push(`room = ${escape(room[0].id)}`)
    } else changes.push("room = NULL")
  }

  if (changeType === 'change' || changeType === 'information') {
    if (changeInformation) {
      if (changeInformation.length > 100) return response.status(409).json({ message: 'too long information' })

      changes.push(`information = ${escape(changeInformation)}`)
    } else changes.push("information = NULL")
  }
  
  if (changes.length > 0) await sendQuery(`UPDATE changes SET ${changes.join(', ')} WHERE organization = ${escape(user.organization)} AND id = ${escape(changeId)}`)

  return response.status(200).json({ message: 'success' })
})

router.delete("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { changeId } = request.body

  const deletion = await sendQuery(`DELETE FROM changes WHERE organization = ${escape(user.organization)} AND id = ${escape(changeId)}`) as ResultSetHeader
  if (deletion.affectedRows === 0) return response.status(409).json({ message: 'change does not exist' })
  
  return response.status(200).json({ message: 'success' })
})

export default router