import express from 'express'
import { ResultSetHeader, RowDataPacket, escape } from 'mysql2'

import sendQuery from "../../helpers/mysql"
import validateUser from "../../helpers/validateUser"

const router = express.Router()

router.get("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const teacherClasses = await sendQuery(`SELECT teachers.id, teachers.forename, teachers.lastname, COUNT(classes.id) count FROM teachers LEFT JOIN classes ON teachers.id = classes.teacher WHERE teachers.organization = ${escape(user.organization)} GROUP BY teachers.id ORDER BY teachers.forename`) as RowDataPacket[]
  const teacherSubjects = await sendQuery(`SELECT teachers.id, subjects.name subject FROM teachers LEFT JOIN teacher_subjects ON teachers.id = teacher_subjects.teacher INNER JOIN subjects ON teacher_subjects.subject = subjects.id WHERE teachers.organization = ${escape(user.organization)}`) as RowDataPacket[]

  const teachers: any = {}
  teacherClasses.forEach((teacher) => {
    teachers[teacher.id] = {
      forename: teacher.forename,
      lastname: teacher.lastname,
      classes: teacher.count,
      subjects: []
    }
  })

  teacherSubjects.forEach((teacher) => { teachers[teacher.id].subjects.push(teacher.subject) })

  return response.status(200).json({ message: 'success', teachers })
})

router.post("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { teacherForename, teacherLastname, teacherSubjects } = request.body
  teacherForename = teacherForename.toLowerCase()
  teacherLastname = teacherLastname.toLowerCase()

  if (teacherForename.length > 45 || teacherForename.length === 0 || teacherLastname.length > 45 || teacherLastname.length === 0) return response.status(401).json({ message: 'invalid parameters' })

  const existing = await sendQuery(`SELECT * FROM teachers WHERE organization = ${escape(user.organization)} AND forename = ${escape(teacherForename)} AND lastname = ${escape(teacherLastname)}`) as RowDataPacket[]
  if (existing.length > 0) return response.status(401).json({ message: 'teacher already exists' })

  await sendQuery("SET information_schema_stats_expiry = 0")
  const nextPK = await sendQuery("SELECT AUTO_INCREMENT FROM information_schema.tables WHERE table_name = 'teachers' AND table_schema = DATABASE( )") as RowDataPacket[]

  var subjectIds: any = {}
  for (var i = 0; i < teacherSubjects.length; i++) {
    const subject = teacherSubjects.at(i).toLowerCase()
    const existingSubject = await sendQuery(`SELECT * FROM subjects WHERE organization = ${escape(user.organization)} AND name = ${escape(subject)}`) as RowDataPacket[]
    if (existingSubject.length === 0) return response.status(401).json({ message: `subject ${subject} does not exist` })

    subjectIds[subject] = existingSubject[0].id
  }
  
  await sendQuery(`INSERT INTO teachers (organization, forename, lastname) VALUES (${escape(user.organization)}, ${escape(teacherForename)}, ${escape(teacherLastname)})`)

  for (var i = 0; i < teacherSubjects.length; i++) {
    const subject = teacherSubjects.at(i).toLowerCase()
    await sendQuery(`INSERT INTO teacher_subjects (organization, teacher, subject) VALUES (${escape(user.organization)}, ${escape(nextPK[0].AUTO_INCREMENT)}, ${escape(subjectIds[subject])})`)
  }

  return response.status(200).json({ message: 'success' })
})

router.put("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { teacherForename, teacherLastname, teacherSubjects } = request.body
  teacherForename = teacherForename.toLowerCase()
  teacherLastname = teacherLastname.toLowerCase()

  if (teacherForename.length > 45 || teacherForename.length === 0 || teacherLastname.length > 45 || teacherLastname.length === 0) return response.status(401).json({ message: 'invalid parameters' })

  const existing = await sendQuery(`SELECT * FROM teachers WHERE organization = ${escape(user.organization)} AND forename = ${escape(teacherForename)} AND lastname = ${escape(teacherLastname)}`) as RowDataPacket[]
  if (existing.length === 0) return response.status(401).json({ message: 'teacher does not exist' })

  const currentTeacherSubjects = await sendQuery(`SELECT subject FROM teacher_subjects WHERE organization = ${escape(user.organization)} AND teacher = ${escape(existing[0].id)}`) as RowDataPacket[]
  const subjects = await sendQuery(`SELECT id, name FROM subjects WHERE organization = ${escape(user.organization)}`) as RowDataPacket[]

  for (var i = 0; i < teacherSubjects.length; i++) {
    const teacherSubject = teacherSubjects.at(i)

    const subjectData = subjects.find(subject => subject.name === teacherSubject)
    if (!subjectData) return response.status(401).json({ message: `subject ${teacherSubject} does not exist` })
    
    const subjectId = subjectData.id
    const currentSubject = currentTeacherSubjects.find(currentTeacherSubject => currentTeacherSubject.subject === subjectId)
    
    if (currentSubject) currentTeacherSubjects.splice(currentTeacherSubjects.indexOf(currentSubject), 1)
    else await sendQuery(`INSERT INTO teacher_subjects (organization, teacher, subject) VALUES (${escape(user.organization)}, ${escape(existing[0].id)}, ${escape(subjectId)})`)
  }

  for (var i = 0; i < currentTeacherSubjects.length; i++) {
    await sendQuery(`DELETE FROM teacher_subjects WHERE organization = ${escape(user.organization)} AND teacher = ${escape(existing[0].id)} AND subject = ${escape(currentTeacherSubjects.at(i)?.subject)}`)
  }

  return response.status(200).json({ message: 'success' })
})

router.delete("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { teacherForename, teacherLastname } = request.body
  teacherForename = teacherForename.toLowerCase()
  teacherLastname = teacherLastname.toLowerCase()

  const existing = await sendQuery(`SELECT * FROM teachers WHERE organization = ${escape(user.organization)} AND forename = ${escape(teacherForename)} AND lastname = ${escape(teacherLastname)}`) as RowDataPacket[]
  if (existing.length === 0) return response.status(401).json({ message: 'teacher does not exist' })
  
  await sendQuery(`DELETE FROM teacher_subjects WHERE organization = ${escape(user.organization)} AND teacher = ${escape(existing[0].id)}`)

  const deletion = await sendQuery(`DELETE FROM teachers WHERE organization = ${escape(user.organization)} AND id = ${escape(existing[0].id)}`) as ResultSetHeader
  if (deletion.affectedRows === 0) return response.status(401).json({ message: 'error' })
  
  return response.status(200).json({ message: 'success' })
})

export default router