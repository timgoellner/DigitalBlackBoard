const express = require('express')

const mysql = require("../../helpers/mysql");
const validateUser = require("../../helpers/validateUser")

const router = express.Router()

router.get("/", async (request, response) => {
  const user = validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const changesData = await mysql.sendQuery(`SELECT changes.id, changes.type, classes.id classId, classes.name className, grades.id gradesId, grades.grade, grades.subgrade, teachers.id teacherId, teachers.forename teacherForename, teachers.lastname teacherLastname, rooms.name room, subjects.name subject, changes.information FROM changes LEFT JOIN classes ON changes.class = classes.id INNER JOIN grades ON classes.grade = grades.id LEFT JOIN teachers ON changes.teacher = teachers.id LEFT JOIN rooms ON changes.room = rooms.id LEFT JOIN subjects ON changes.subject = subjects.id`)

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

  const teachers = await mysql.sendQuery(`SELECT id, forename, lastname FROM teachers WHERE teachers.organization = '${user.organization}' ORDER BY forename, lastname`)
  const grades = await mysql.sendQuery(`SELECT id, grade, subgrade FROM grades WHERE grades.organization = '${user.organization}' ORDER BY grade, subgrade`)
  const classes = await mysql.sendQuery(`SELECT classes.id, name, grades.grade, grades.subgrade FROM classes LEFT JOIN grades ON classes.grade = grades.id WHERE classes.organization = '${user.organization}' ORDER BY grade, subgrade`)

  return response.status(200).json({ message: 'success', changes, teachers, grades, classes })
})

module.exports = router