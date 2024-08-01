const express = require('express')

const mysql = require("../../helpers/mysql");
const validateUser = require("../../helpers/validateUser")

const router = express.Router()

router.get("/", async (request, response) => {
  const user = validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const classesData = await mysql.sendQuery(`SELECT classes.id, classes.name, classes.weekday, classes.startTime, classes.duration, teachers.id teacherId, teachers.forename teacherForename, teachers.lastname teacherLastname, subjects.name subject, rooms.name room, grades.id gradeId, grades.grade, grades.subgrade, students.id studentId, students.forename studentForename, students.lastname studentLastname FROM classes LEFT JOIN teachers ON classes.teacher = teachers.id LEFT JOIN subjects ON classes.subject = subjects.id LEFT JOIN rooms ON classes.room = rooms.id LEFT JOIN grades ON classes.grade = grades.id LEFT JOIN student_classes ON classes.id = student_classes.class LEFT JOIN students ON student_classes.student = students.id WHERE classes.organization = '${user.organization}' AND grades.subgrade IS NULL UNION ALL SELECT classes.id, classes.name, classes.weekday, classes.startTime, classes.duration, teachers.id teacherId, teachers.forename teacherForename, teachers.lastname teacherLastname, subjects.name subject, rooms.name room, grades.id gradeId, grades.grade, grades.subgrade, students.id studentId, students.forename studentForename, students.lastname studentLastname FROM classes LEFT JOIN teachers ON classes.teacher = teachers.id LEFT JOIN subjects ON classes.subject = subjects.id LEFT JOIN rooms ON classes.room = rooms.id LEFT JOIN grades ON classes.grade = grades.id LEFT JOIN students ON classes.grade = students.grade WHERE classes.organization = '${user.organization}' AND grades.subgrade IS NOT NULL`)

  const classes = {}
  classesData.forEach(class_ => {
    if (classes[class_.id]) {
      classes[class_.id].students.push({
        id: class_.studentId,
        forename: class_.studentForename,
        lastname: class_.studentLastname
      })
    }
    else {
      classes[class_.id] = {
        name: class_.name,
        weekday: class_.weekday,
        startTime: class_.startTime,
        duration: class_.duration,
        teacher: {
          id: class_.teacherId,
          forename: class_.teacherForename,
          lastname: class_.teacherLastname
        },
        subject: class_.subject,
        room: class_.room,
        grade: {
          id: class_.gradeId,
          grade: class_.grade,
          subgrade: class_.subgrade
        },
        students: [{
          id: class_.studentId,
          forename: class_.studentForename,
          lastname: class_.studentLastname
        }]
      }
    }
  })

  const teachers = mysql.sendQuery(`SELECT id, forename, lastname FROM teachers WHERE teachers.organization = '${user.organization}' ORDER BY forename, lastname`)
  const grades = mysql.sendQuery(`SELECT id, grade, subgrade FROM grades WHERE grades.organization = '${user.organization}' ORDER BY grade, subgrade`)
  const students = mysql.sendQuery(`SELECT id, forename, lastname FROM students WHERE students.organization = '${user.organization}' ORDER BY forename, lastname`)

  return response.status(200).json({ message: 'success', classes, teachers, grades, students })
})

module.exports = router