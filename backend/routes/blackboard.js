const express = require('express')
const escape = require("mysql2").escape

const mysql = require("../helpers/mysql")
const validateUser = require("../helpers/validateUser")

const router = express.Router()

router.get("/:organization/:identifier", async (request, response) => {
  const user = await validateUser(request);
  if (!user || user.isStaff || !request.params.organization || !request.params.identifier) return response.status(401).json({ message: 'error' })

  const blackboardData = await mysql.sendQuery(`SELECT classes.id, classes.name, classes.weekday, classes.startTime, classes.duration, teachers.forename teacherForename, teachers.lastname teacherLastname, subjects.name subject, rooms.name room, changes.type changeType, changes.information changeInformation, changeTeachers.forename changeTeacherForename, changeTeachers.lastname changeTeacherLastname, changeSubjects.name changeSubject, changeRooms.name changeRoom FROM classes LEFT JOIN grades ON classes.grade = grades.id LEFT JOIN students ON grades.id = students.grade LEFT JOIN accounts ON students.account = accounts.id LEFT JOIN teachers ON classes.teacher = teachers.id LEFT JOIN subjects ON classes.subject = subjects.id LEFT JOIN rooms ON classes.room = rooms.id LEFT JOIN changes ON classes.id = changes.class LEFT JOIN teachers AS changeTeachers ON changes.teacher = changeTeachers.id LEFT JOIN subjects AS changeSubjects ON changes.subject = changeSubjects.id LEFT JOIN rooms AS changeRooms ON changes.room = changeRooms.id WHERE accounts.identifier = ${escape(request.params.identifier)} AND accounts.isStaff = 0 AND classes.usesGrade = 1 AND classes.organization = ${escape(request.params.organization)} UNION ALL SELECT classes.id, classes.name, classes.weekday, classes.startTime, classes.duration, teachers.forename teacherForename, teachers.lastname teacherLastname, subjects.name subject, rooms.name room, changes.type changeType, changes.information changeInformation, changeTeachers.forename changeTeacherForename, changeTeachers.lastname changeTeacherLastname, changeSubjects.name changeSubject, changeRooms.name changeRoom FROM classes LEFT JOIN student_classes ON classes.id = student_classes.class LEFT JOIN students ON student_classes.student = students.id LEFT JOIN accounts ON students.account = accounts.id LEFT JOIN teachers ON classes.teacher = teachers.id LEFT JOIN subjects ON classes.subject = subjects.id LEFT JOIN rooms ON classes.room = rooms.id LEFT JOIN changes ON classes.id = changes.class LEFT JOIN teachers AS changeTeachers ON changes.teacher = changeTeachers.id LEFT JOIN subjects AS changeSubjects ON changes.subject = changeSubjects.id LEFT JOIN rooms AS changeRooms ON changes.room = changeRooms.id WHERE accounts.identifier = ${escape(request.params.identifier)} AND accounts.isStaff = 0 AND classes.usesGrade = 0 AND classes.organization = ${escape(request.params.organization)}`)
  const student = await mysql.sendQuery(`SELECT students.forename, students.lastname FROM students LEFT JOIN accounts ON students.account = accounts.id WHERE accounts.identifier = ${escape(request.params.identifier)}`)

  let earliest = 10000
  let latest = 0

  blackboardData.forEach((element, index) => {
    const startTimeSplit = element.startTime.split(':')

    const startTime = (parseInt(startTimeSplit[0]) * 60) + parseInt(startTimeSplit[1])
    const endTime = startTime + parseInt(element.duration)

    if (startTime < earliest) earliest = startTime
    if (endTime > latest) latest = endTime

    blackboardData[index].startTime = startTime
    blackboardData[index].endTime = endTime
  });

  console.log(blackboardData)

  response.status(200).json({ message: 'success', blackboardData, student: student[0], earliest, latest })
})

module.exports = router