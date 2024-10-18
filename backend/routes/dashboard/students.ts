import express from 'express'
import { RowDataPacket, escape } from 'mysql2'

import sendQuery from "../../helpers/mysql"
import validateUser from "../../helpers/validateUser"

const router = express.Router()

router.get("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const studentsData = await sendQuery(`SELECT students.id, students.forename, students.lastname, accounts.identifier, grades.grade, grades.subgrade, classes.name class FROM students LEFT JOIN accounts ON students.account = accounts.id LEFT JOIN grades ON students.grade = grades.id LEFT JOIN classes ON students.grade = classes.grade WHERE students.organization = ${escape(user.organization)} AND grades.subgrade IS NOT NULL UNION ALL SELECT students.id, students.forename, students.lastname, accounts.identifier, grades.grade, grades.subgrade, classes.name class FROM students LEFT JOIN accounts ON students.account = accounts.id LEFT JOIN grades ON students.grade = grades.id LEFT JOIN student_classes ON students.id = student_classes.student LEFT JOIN classes ON student_classes.class = classes.id WHERE students.organization = ${escape(user.organization)} AND grades.subgrade IS NULL`) as RowDataPacket[]

  const students: any = {}
  studentsData.forEach((student) => {
    if (students[student.id]) students[student.id].classes.push(student.class)
    else {
      students[student.id] = {
        forename: student.forename,
        lastname: student.lastname,
        identifier: student.identifier,
        grade: student.grade,
        subgrade: (student.subgrade) ? student.subgrade : "",
        classes: (student.class) ? [student.class] : []
      }
    }
  })

  return response.status(200).json({ message: 'success', students })
})

router.post("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { studentForename, studentLastname, studentGrade, studentSubgrade } = request.body
  studentForename = studentForename.toLowerCase()
  studentLastname = studentLastname.toLowerCase()
  studentGrade = studentGrade.toLowerCase()
  studentSubgrade = studentSubgrade.toLowerCase()

  if (studentForename.length > 45 || studentForename.length === 0 ||
      studentLastname.length > 45 || studentLastname.length === 0 ||
      studentGrade.length > 5 || studentGrade.length === 0 ||
      (studentSubgrade !== '' && studentSubgrade.length !== 1)) return response.status(409).json({ message: 'invalid parameters' })

  studentSubgrade = (studentSubgrade === '') ? "IS NULL" : `= ${escape(studentSubgrade)}`

  const grade = await sendQuery(`SELECT grades.id FROM grades WHERE organization = ${escape(user.organization)} AND grade = ${escape(studentGrade)} AND subgrade ${studentSubgrade}`) as RowDataPacket[]
  if (grade.length === 0) return response.status(409).json({ message: 'grade does not exist' })

  const identifierData = await sendQuery(`SELECT identifier FROM accounts WHERE organization = ${escape(user.organization)} AND isStaff = FALSE ORDER BY identifier DESC LIMIT 1`) as RowDataPacket[]
  const identifier = String(parseInt((!identifierData) ? '0' : identifierData[0].identifier) + 1).padStart(5, '0')

  const accountId = JSON.parse(JSON.stringify(await sendQuery(`INSERT INTO accounts (organization, identifier, isStaff) VALUES (${escape(user.organization)}, ${escape(identifier)}, 0)`))).insertId

  await sendQuery(`INSERT INTO students (organization, account, forename, lastname, grade) VALUES (${escape(user.organization)}, ${escape(accountId)}, ${escape(studentForename)}, ${escape(studentLastname)}, ${escape(grade[0].id)})`)

  return response.status(200).json({ message: 'success' })
})

router.put("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { studentForename, studentLastname, studentGrade, studentSubgrade, id } = request.body
  studentForename = studentForename.toLowerCase()
  studentLastname = studentLastname.toLowerCase()
  studentGrade = studentGrade.toLowerCase()
  studentSubgrade = studentSubgrade.toLowerCase()

  if (studentForename.length > 45 || studentForename.length === 0 ||
      studentLastname.length > 45 || studentLastname.length === 0 ||
      studentGrade.length > 5 || studentGrade.length === 0 ||
      (studentSubgrade !== '' && studentSubgrade.length !== 1)) return response.status(409).json({ message: 'invalid parameters' })

  const existing = await sendQuery(`SELECT * FROM students WHERE organization = ${escape(user.organization)} AND id = ${escape(id)}`) as RowDataPacket[]
  if (existing.length === 0) return response.status(409).json({ message: 'student does not exist' })

  studentSubgrade = (studentSubgrade === '') ? "IS NULL" : `= ${escape(studentSubgrade)}`

  const grade = await sendQuery(`SELECT grades.id FROM grades WHERE organization = ${escape(user.organization)} AND grade = ${escape(studentGrade)} AND subgrade ${studentSubgrade}`) as RowDataPacket[]
  if (grade.length === 0) return response.status(409).json({ message: 'grade does not exist' })

  await sendQuery(`UPDATE students SET grade = ${escape(grade[0].id)} WHERE id = ${escape(id)}`)

  return response.status(200).json({ message: 'success' })
})

router.delete("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { id } = request.body

  const existing = await sendQuery(`SELECT * FROM students WHERE organization = ${escape(user.organization)} AND id = ${escape(id)}`) as RowDataPacket[]
  if (existing.length === 0) return response.status(409).json({ message: 'student does not exist' })

  await sendQuery(`DELETE FROM students WHERE organization = ${escape(user.organization)} AND id = ${escape(existing[0].id)}`)
  await sendQuery(`DELETE FROM accounts WHERE organization = ${escape(user.organization)} AND id = ${escape(existing[0].account)}`)
  
  return response.status(200).json({ message: 'success' })
})

export default router