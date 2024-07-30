const express = require('express')

const mysql = require("../../helpers/mysql");
const validateUser = require("../../helpers/validateUser")

const router = express.Router()

router.get("/", async (request, response) => {
  const user = validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const studentsData = await mysql.sendQuery(`SELECT students.id, students.forename, students.lastname, grades.grade, grades.subgrade, classes.name class FROM students LEFT JOIN grades ON students.grade = grades.id LEFT JOIN classes ON students.grade = classes.grade WHERE students.organization = 'testorga' AND grades.subgrade IS NOT NULL UNION ALL SELECT students.id, students.forename, students.lastname, grades.grade, grades.subgrade, classes.name class FROM students LEFT JOIN grades ON students.grade = grades.id LEFT JOIN student_classes ON students.id = student_classes.student LEFT JOIN classes ON student_classes.class = classes.id WHERE students.organization = 'testorga' AND grades.subgrade IS NULL`)

  const students = {}
  studentsData.forEach(student => {
    if (students[student.id]) students[student.id].classes.push(student.class)
    else {
      students[student.id] = {
        forename: student.forename,
        lastname: student.lastname,
        grade: student.grade,
        subgrade: (student.subgrade) ? student.subgrade : "",
        classes: (student.class) ? [student.class] : []
      }
    }
  })

  return response.status(200).json({ message: 'success', students })
})

router.post("/", async (request, response) => {
  const user = validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { studentForename, studentLastname, studentGrade, studentSubgrade } = request.body
  studentForename = studentForename.toLowerCase()
  studentLastname = studentLastname.toLowerCase()
  studentGrade = studentGrade.toLowerCase()
  studentSubgrade = studentSubgrade.toLowerCase()

  if (studentForename.length > 45 || studentForename.length === 0 ||
      studentLastname.length > 45 || studentLastname.length === 0 ||
      studentGrade.length > 5 || studentGrade.length === 0 ||
      (studentSubgrade !== '' && studentSubgrade.length !== 1)) return response.status(401).json({ message: 'invalid parameters' })

  studentSubgrade = (studentSubgrade === '') ? "IS NULL" : `= '${studentSubgrade}'`

  const grade = await mysql.sendQuery(`SELECT grades.id FROM grades WHERE organization = '${user.organization}' AND grade = '${studentGrade}' AND subgrade ${studentSubgrade}`)
  if (grade.length === 0) return response.status(401).json({ message: 'grade does not exist' })
    
  await mysql.sendQuery(`INSERT INTO students (organization, forename, lastname, grade) VALUES ('${user.organization}', '${studentForename}', '${studentLastname}', ${grade[0].id})`)

  return response.status(200).json({ message: 'success' })
})

router.put("/", async (request, response) => {
  const user = validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { studentForename, studentLastname, studentGrade, studentSubgrade, id } = request.body
  studentForename = studentForename.toLowerCase()
  studentLastname = studentLastname.toLowerCase()
  studentGrade = studentGrade.toLowerCase()
  studentSubgrade = studentSubgrade.toLowerCase()

  if (studentForename.length > 45 || studentForename.length === 0 ||
      studentLastname.length > 45 || studentLastname.length === 0 ||
      studentGrade.length > 5 || studentGrade.length === 0 ||
      (studentSubgrade !== '' && studentSubgrade.length !== 1)) return response.status(401).json({ message: 'invalid parameters' })

  const existing = await mysql.sendQuery(`SELECT * FROM students WHERE organization = '${user.organization}' AND id = ${id}`)
  if (existing.length === 0) return response.status(401).json({ message: 'student does not exist' })

  studentSubgrade = (studentSubgrade === '') ? "IS NULL" : `= '${studentSubgrade}'`

  const grade = await mysql.sendQuery(`SELECT grades.id FROM grades WHERE organization = '${user.organization}' AND grade = '${studentGrade}' AND subgrade ${studentSubgrade}`)
  if (grade.length === 0) return response.status(401).json({ message: 'grade does not exist' })

  await mysql.sendQuery(`UPDATE students SET grade = ${grade[0].id} WHERE id = ${id}`)

  return response.status(200).json({ message: 'success' })
})

module.exports = router