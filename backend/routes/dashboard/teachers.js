const express = require('express')

const mysql = require("../../helpers/mysql");
const validateUser = require("../../helpers/validateUser")

const router = express.Router()

router.get("/", async (request, response) => {
  const user = validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const teacherClasses = await mysql.sendQuery(`SELECT teachers.id, teachers.forename, teachers.lastname, COUNT(classes.id) count FROM teachers LEFT JOIN classes ON teachers.id = classes.teacher WHERE teachers.organization = '${user.organization}' GROUP BY teachers.id ORDER BY teachers.forename`)
  const teacherSubjects = await mysql.sendQuery(`SELECT teachers.id, subjects.name subject FROM teachers LEFT JOIN teacher_subjects ON teachers.id = teacher_subjects.teacher INNER JOIN subjects ON teacher_subjects.subject = subjects.id WHERE teachers.organization = '${user.organization}'`)

  const teachers = {}
  teacherClasses.forEach(teacher => { teachers[teacher.id] = { forename: teacher.forename, lastname: teacher.lastname, classes: teacher.count, subjects: []} });
  teacherSubjects.forEach(teacher => { teachers[teacher.id].subjects.push(teacher.subject) })

  return response.status(200).json({ message: 'success', teachers })
})

router.post("/", async (request, response) => {
  const user = validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { teacherForename, teacherLastname, teacherSubjects } = request.body
  teacherForename = teacherForename.toLowerCase()
  teacherLastname = teacherLastname.toLowerCase()

  if (teacherForename.length > 45 || teacherForename.length === 0 || teacherLastname.length > 45 || teacherLastname.length === 0) return response.status(401).json({ message: 'invalid parameters' })

  const existing = await mysql.sendQuery(`SELECT * FROM teachers WHERE organization = '${user.organization}' AND forename = '${teacherForename}' AND lastname = '${teacherLastname}'`)
  if (existing.length > 0) return response.status(401).json({ message: 'teacher already exists' })

  await mysql.sendQuery("SET information_schema_stats_expiry = 0")
  const nextPK = await mysql.sendQuery("SELECT AUTO_INCREMENT FROM information_schema.tables WHERE table_name = 'teachers' AND table_schema = DATABASE( )")

  var subjectIds = {}
  for (var i = 0; i < teacherSubjects.length; i++) {
    const subject = teacherSubjects.at(i).toLowerCase()
    const existingSubject = await mysql.sendQuery(`SELECT * FROM subjects WHERE organization = '${user.organization}' AND name = '${subject}'`)
    if (existingSubject.length === 0) return response.status(401).json({ message: `subject ${subject} does not exist` })

    subjectIds[subject] = existingSubject[0].id
  }
  
  await mysql.sendQuery(`INSERT INTO teachers (organization, forename, lastname) VALUES ('${user.organization}', '${teacherForename}', '${teacherLastname}')`)

  for (var i = 0; i < teacherSubjects.length; i++) {
    const subject = teacherSubjects.at(i).toLowerCase()
    await mysql.sendQuery(`INSERT INTO teacher_subjects (organization, teacher, subject) VALUES ('${user.organization}', ${nextPK[0].AUTO_INCREMENT}, ${subjectIds[subject]})`)
  }

  return response.status(200).json({ message: 'success' })
})

router.delete("/", async (request, response) => {
  const user = validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { grade } = request.body

  const existing = await mysql.sendQuery(`SELECT * FROM grades WHERE organization = '${user.organization}' AND grade = '${grade}'`)
  if (existing.length === 0) return response.status(401).json({ message: 'grade does not exist' })
  
  const deletion = await mysql.sendQuery(`DELETE FROM grades WHERE organization = '${user.organization}' AND grade = '${grade}'`)
  if (deletion === false) return response.status(401).json({ message: 'grade is not empty' })
  
  return response.status(200).json({ message: 'success' })
})

module.exports = router