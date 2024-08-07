const express = require('express')
const escape = require("mysql2").escape

const mysql = require("../../helpers/mysql");
const validateUser = require("../../helpers/validateUser")

const router = express.Router()

const types = [ "cancellation", "change", "information" ]

router.get("/", async (request, response) => {
  const user = validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const changesData = await mysql.sendQuery(`SELECT changes.id, changes.type, classes.id classId, classes.name className, grades.id gradesId, grades.grade, grades.subgrade, teachers.id teacherId, teachers.forename teacherForename, teachers.lastname teacherLastname, rooms.name room, subjects.name subject, changes.information FROM changes LEFT JOIN classes ON changes.class = classes.id INNER JOIN grades ON classes.grade = grades.id LEFT JOIN teachers ON changes.teacher = teachers.id LEFT JOIN rooms ON changes.room = rooms.id LEFT JOIN subjects ON changes.subject = subjects.id WHERE changes.organization = ${escape(user.organization)}`)

  const changes = {}
  changesData.forEach(change => {
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

  const teachers = await mysql.sendQuery(`SELECT id, forename, lastname FROM teachers WHERE teachers.organization = ${escape(user.organization)} ORDER BY forename, lastname`)
  const grades = await mysql.sendQuery(`SELECT id, grade, subgrade FROM grades WHERE grades.organization = ${escape(user.organization)} ORDER BY grade, subgrade`)
  const classes = await mysql.sendQuery(`SELECT classes.id, name, grades.id gradeId, grades.grade, grades.subgrade FROM classes LEFT JOIN grades ON classes.grade = grades.id WHERE classes.organization = ${escape(user.organization)} ORDER BY grade, subgrade`)

  return response.status(200).json({ message: 'success', changes, teachers, grades, classes })
})

router.post("/", async (request, response) => {
  const user = validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { changeType, changeClass, changeTeacher, changeSubject, changeRoom, changeInformation } = request.body
  changeType = changeType?.toLowerCase()
  changeSubject = changeSubject?.toLowerCase()

  const class_ = await mysql.sendQuery(`SELECT * FROM classes WHERE organization = ${escape(user.organization)} AND id = ${escape(changeClass)}`)
  if (class_.length === 0) return response.status(401).json({ message: 'class does not exist' })

  if (!types.some(type => type === changeType)) return response.status(401).json({ message: 'invalid type' })

  const changeId = JSON.parse(JSON.stringify(await mysql.sendQuery(`INSERT INTO changes (organization, type, class) VALUES (${escape(user.organization)}, ${escape(changeType)}, ${escape(class_[0].id)})`))).insertId

  const changes = []
  if (changeType === 'change') {
    if (changeTeacher) {
      const teacher = await mysql.sendQuery(`SELECT * FROM teachers WHERE organization = ${escape(user.organization)} AND id = ${escape(changeTeacher)}`)
      if (teacher.length === 0) return response.status(401).json({ message: 'teacher does not exist' })

      changes.push(`teacher = ${escape(teacher[0].id)}`)
    }

    if (changeSubject) {
      const subject = await mysql.sendQuery(`SELECT * FROM subjects WHERE organization = ${escape(user.organization)} AND name = ${escape(changeSubject)}`)
      if (subject.length === 0) return response.status(401).json({ message: 'subject does not exist' })

      changes.push(`subject = ${escape(subject[0].id)}`)
    }

    if (changeRoom) {
      const room = await mysql.sendQuery(`SELECT * FROM rooms WHERE organization = ${escape(user.organization)} AND name = ${escape(changeRoom)}`)
      if (room.length === 0) return response.status(401).json({ message: 'room does not exist' })

      changes.push(`room = ${escape(room[0].id)}`)
    }
  }
  
  if (changeType === 'change' || changeType === 'information') {
    if (changeInformation) {
      if (changeInformation.length > 100) return response.status(401).json({ message: 'too long information' })

      changes.push(`information = ${escape(changeInformation)}`)
    }
  }

  if (changes.length > 0) await mysql.sendQuery(`UPDATE changes SET ${changes.join(', ')} WHERE organization = ${escape(user.organization)} AND id = ${escape(changeId)}`)

  return response.status(200).json({ message: 'success' })
})

router.put("/", async (request, response) => {
  const user = validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { changeId, changeType, changeClass, changeTeacher, changeSubject, changeRoom, changeInformation } = request.body
  changeType = changeType?.toLowerCase()
  changeSubject = changeSubject?.toLowerCase()

  const change = await mysql.sendQuery(`SELECT * FROM changes WHERE organization = ${escape(user.organization)} AND id = ${escape(changeId)}`)
  if (change.length === 0) return response.status(401).json({ message: 'change does not exist' })

  const class_ = await mysql.sendQuery(`SELECT * FROM classes WHERE organization = ${escape(user.organization)} AND id = ${escape(changeClass)}`)
  if (class_.length === 0) return response.status(401).json({ message: 'class does not exist' })

  if (!types.some(type => type === changeType)) return response.status(401).json({ message: 'invalid type' })

  const changes = [`type = ${escape(changeType)}`]

  if (changeType === 'cancellation') changes.push("teacher = NULL, subject = NULL, room = NULL, information = NULL")

  if (changeType === 'information') changes.push("teacher = NULL, subject = NULL, room = NULL")
  
  if (changeType === 'change') {
    if (changeTeacher) {
      const teacher = await mysql.sendQuery(`SELECT * FROM teachers WHERE organization = ${escape(user.organization)} AND id = ${escape(changeTeacher)}`)
      if (teacher.length === 0) return response.status(401).json({ message: 'teacher does not exist' })

      changes.push(`teacher = ${escape(teacher[0].id)}`)
    } else changes.push("teacher = NULL")

    if (changeSubject) {
      const subject = await mysql.sendQuery(`SELECT * FROM subjects WHERE organization = ${escape(user.organization)} AND name = ${escape(changeSubject)}`)
      if (subject.length === 0) return response.status(401).json({ message: 'subject does not exist' })

      changes.push(`subject = ${escape(subject[0].id)}`)
    } else changes.push("subject = NULL")

    if (changeRoom) {
      const room = await mysql.sendQuery(`SELECT * FROM rooms WHERE organization = ${escape(user.organization)} AND name = ${escape(changeRoom)}`)
      if (room.length === 0) return response.status(401).json({ message: 'room does not exist' })

      changes.push(`room = ${escape(room[0].id)}`)
    } else changes.push("room = NULL")
  }

  if (changeType === 'change' || changeType === 'information') {
    if (changeInformation) {
      if (changeInformation.length > 100) return response.status(401).json({ message: 'too long information' })

      changes.push(`information = ${escape(changeInformation)}`)
    } else changes.push("information = NULL")
  }
  
  if (changes.length > 0) await mysql.sendQuery(`UPDATE changes SET ${changes.join(', ')} WHERE organization = ${escape(user.organization)} AND id = ${escape(changeId)}`)

  return response.status(200).json({ message: 'success' })
})

router.delete("/", async (request, response) => {
  const user = validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { changeId } = request.body

  const existing = await mysql.sendQuery(`SELECT * FROM changes WHERE organization = ${escape(user.organization)} AND id = ${escape(changeId)}`)
  if (existing.length === 0) return response.status(401).json({ message: 'change does not exist' })

  const deletion = await mysql.sendQuery(`DELETE FROM changes WHERE organization = ${escape(user.organization)} AND id = ${escape(existing[0].id)}`)
  if (deletion === false) return response.status(401).json({ message: 'error' })
  
  return response.status(200).json({ message: 'success' })
})

module.exports = router