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

router.put("/", async (request, response) => {
  const user = validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { teacherForename, teacherLastname, teacherSubjects } = request.body

  if (teacherForename.length > 45 || teacherForename.length === 0 || teacherLastname.length > 45 || teacherLastname.length === 0) return response.status(401).json({ message: 'invalid parameters' })

  const existing = await mysql.sendQuery(`SELECT * FROM teachers WHERE organization = '${user.organization}' AND forename = '${teacherForename}' AND lastname = '${teacherLastname}'`)
  if (existing.length === 0) return response.status(401).json({ message: 'teacher does not exist' })

  const currentTeacherSubjects = await mysql.sendQuery(`SELECT subject FROM teacher_subjects WHERE organization = '${user.organization}' AND teacher = ${existing[0].id}`)
  const subjects = await mysql.sendQuery(`SELECT id, name FROM subjects WHERE organization = '${user.organization}'`)

  for (var i = 0; i < teacherSubjects.length; i++) {
    const teacherSubject = teacherSubjects.at(i)

    const subjectData = subjects.find(subject => subject.name === teacherSubject)
    if (!subjectData) return response.status(401).json({ message: `subject ${teacherSubject} does not exist` })
    
    const subjectId = subjectData.id
    const currentSubject = currentTeacherSubjects.find(currentTeacherSubject => currentTeacherSubject.subject === subjectId)
    
    if (currentSubject) currentTeacherSubjects.splice(currentTeacherSubjects.indexOf(currentSubject), 1)
    else await mysql.sendQuery(`INSERT INTO teacher_subjects (organization, teacher, subject) VALUES ('${user.organization}', ${existing[0].id}, ${subjectId})`)
  }

  for (var i = 0; i < currentTeacherSubjects.length; i++) {
    await mysql.sendQuery(`DELETE FROM teacher_subjects WHERE organization = '${user.organization}' AND teacher = ${existing[0].id} AND subject = ${currentTeacherSubjects.at(i).subject}`)
  }

  return response.status(200).json({ message: 'success' })
})

router.delete("/", async (request, response) => {
  const user = validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { teacherForename, teacherLastname } = request.body

  const existing = await mysql.sendQuery(`SELECT * FROM teachers WHERE organization = '${user.organization}' AND forename = '${teacherForename}' AND lastname = '${teacherLastname}'`)
  if (existing.length === 0) return response.status(401).json({ message: 'teacher does not exist' })
  
  await mysql.sendQuery(`DELETE FROM teacher_subjects WHERE organization = '${user.organization}' AND teacher = ${existing[0].id}`)

  const deletion = await mysql.sendQuery(`DELETE FROM teachers WHERE organization = '${user.organization}' AND id = ${existing[0].id}`)
  if (deletion === false) return response.status(401).json({ message: 'error' })
  
  return response.status(200).json({ message: 'success' })
})

module.exports = router