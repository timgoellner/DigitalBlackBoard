const express = require('express')

const mysql = require("../../helpers/mysql");
const validateUser = require("../../helpers/validateUser")

const router = express.Router()

const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

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

  const teachers = await mysql.sendQuery(`SELECT id, forename, lastname FROM teachers WHERE teachers.organization = '${user.organization}' ORDER BY forename, lastname`)
  const grades = await mysql.sendQuery(`SELECT id, grade, subgrade FROM grades WHERE grades.organization = '${user.organization}' ORDER BY grade, subgrade`)
  const students = await mysql.sendQuery(`SELECT id, forename, lastname, grade FROM students WHERE students.organization = '${user.organization}' ORDER BY forename, lastname`)

  return response.status(200).json({ message: 'success', classes, teachers, grades, students })
})

router.post("/", async (request, response) => {
  const user = validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { className, classWeekday, classStarttime, classDuration, classTeacher, classSubject, classRoom, classGrade, classStudents } = request.body
  classWeekday = classWeekday.toLowerCase()
  classSubject = classSubject.toLowerCase()

  if (
    className.length > 45 || className.length === 0 ||
    !weekdays.includes(classWeekday) ||
    !/^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(classStarttime) ||
    classDuration == 0
  ) return response.status(401).json({ message: 'invalid parameters' })

  const teacher = await mysql.sendQuery(`SELECT * FROM teachers WHERE organization = '${user.organization}' AND id = '${classTeacher}'`)
  if (teacher.length === 0) return response.status(401).json({ message: 'teacher does not exist' })

  const subject = await mysql.sendQuery(`SELECT * FROM subjects WHERE organization = '${user.organization}' AND name = '${classSubject}'`)
  if (subject.length === 0) return response.status(401).json({ message: 'subject does not exist' })

  const room = await mysql.sendQuery(`SELECT * FROM rooms WHERE organization = '${user.organization}' AND name = '${classRoom}'`)
  if (room.length === 0) return response.status(401).json({ message: 'room does not exist' })

  const grade = await mysql.sendQuery(`SELECT * FROM grades WHERE organization = '${user.organization}' AND id = '${classGrade}'`)
  if (grade.length === 0) return response.status(401).json({ message: 'grade does not exist' })

  const classId = JSON.parse(JSON.stringify(await mysql.sendQuery(`INSERT INTO classes (organization, name, weekday, startTime, duration, teacher, subject, room, grade, usesGrade) VALUES ('${user.organization}', '${className}', '${classWeekday}', '${classStarttime}', ${classDuration}, ${teacher[0].id}, ${subject[0].id}, ${room[0].id}, ${grade[0].id}, ${grade[0].hasSubgrade})`))).insertId

  if (!grade[0].hasSubgrade) {
    for (var i = 0; i < classStudents.length; i++) {
      await mysql.sendQuery(`INSERT INTO student_classes (organization, student, class) VALUES ('${user.organization}', ${classStudents[i].id}, ${classId})`)
    }
  }

  return response.status(200).json({ message: 'success' })
})

module.exports = router