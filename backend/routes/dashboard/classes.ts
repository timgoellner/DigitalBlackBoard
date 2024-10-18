import express from 'express'
import { ResultSetHeader, RowDataPacket, escape } from 'mysql2'

import sendQuery from "../../helpers/mysql"
import validateUser from "../../helpers/validateUser"

const router = express.Router()

const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

router.get("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const classesData = await sendQuery(`SELECT classes.id, classes.name, classes.weekday, classes.startTime, classes.duration, teachers.id teacherId, teachers.forename teacherForename, teachers.lastname teacherLastname, subjects.name subject, rooms.name room, grades.id gradeId, grades.grade, grades.subgrade, students.id studentId, students.forename studentForename, students.lastname studentLastname FROM classes LEFT JOIN teachers ON classes.teacher = teachers.id LEFT JOIN subjects ON classes.subject = subjects.id LEFT JOIN rooms ON classes.room = rooms.id LEFT JOIN grades ON classes.grade = grades.id LEFT JOIN student_classes ON classes.id = student_classes.class LEFT JOIN students ON student_classes.student = students.id WHERE classes.organization = ${escape(user.organization)} AND grades.subgrade IS NULL UNION ALL SELECT classes.id, classes.name, classes.weekday, classes.startTime, classes.duration, teachers.id teacherId, teachers.forename teacherForename, teachers.lastname teacherLastname, subjects.name subject, rooms.name room, grades.id gradeId, grades.grade, grades.subgrade, students.id studentId, students.forename studentForename, students.lastname studentLastname FROM classes LEFT JOIN teachers ON classes.teacher = teachers.id LEFT JOIN subjects ON classes.subject = subjects.id LEFT JOIN rooms ON classes.room = rooms.id LEFT JOIN grades ON classes.grade = grades.id LEFT JOIN students ON classes.grade = students.grade WHERE classes.organization = ${escape(user.organization)} AND grades.subgrade IS NOT NULL`) as RowDataPacket[]

  const classes: any = {}
  classesData.forEach((class_) => {
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
        students: (class_.studentId) ? [{
          id: class_.studentId,
          forename: class_.studentForename,
          lastname: class_.studentLastname
        }] : []
      }
    }
  })

  const teachers = await sendQuery(`SELECT id, forename, lastname FROM teachers WHERE teachers.organization = ${escape(user.organization)} ORDER BY forename, lastname`)
  const grades = await sendQuery(`SELECT id, grade, subgrade FROM grades WHERE grades.organization = ${escape(user.organization)} ORDER BY grade, subgrade`)
  const students = await sendQuery(`SELECT id, forename, lastname, grade FROM students WHERE students.organization = ${escape(user.organization)} ORDER BY forename, lastname`)

  return response.status(200).json({ message: 'success', classes, teachers, grades, students })
})

router.post("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { className, classWeekday, classStarttime, classDuration, classTeacher, classSubject, classRoom, classGrade, classStudents } = request.body
  classWeekday = classWeekday.toLowerCase()
  classSubject = classSubject.toLowerCase()

  if (
    className.length > 45 || className.length === 0 ||
    !weekdays.includes(classWeekday) ||
    !/^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(classStarttime) ||
    classDuration == 0
  ) return response.status(409).json({ message: 'invalid parameters' })

  const starttimeSplit = classStarttime.split(":")
  if ((starttimeSplit[0]*60 + parseInt(starttimeSplit[1]) + parseInt(classDuration)) > 1440) return response.status(409).json({ message: 'class duration extends 24 hours' })

  const teacher = await sendQuery(`SELECT * FROM teachers WHERE organization = ${escape(user.organization)} AND id = ${escape(classTeacher)}`) as RowDataPacket[]
  if (teacher.length === 0) return response.status(409).json({ message: 'teacher does not exist' })

  const subject = await sendQuery(`SELECT * FROM subjects WHERE organization = ${escape(user.organization)} AND name = ${escape(classSubject)}`) as RowDataPacket[]
  if (subject.length === 0) return response.status(409).json({ message: 'subject does not exist' })

  const room = await sendQuery(`SELECT * FROM rooms WHERE organization = ${escape(user.organization)} AND name = ${escape(classRoom)}`) as RowDataPacket[]
  if (room.length === 0) return response.status(409).json({ message: 'room does not exist' })

  const grade = await sendQuery(`SELECT * FROM grades WHERE organization = ${escape(user.organization)} AND id = ${escape(classGrade)}`) as RowDataPacket[]
  if (grade.length === 0) return response.status(409).json({ message: 'grade does not exist' })

  const classId = (await sendQuery(`INSERT INTO classes (organization, name, weekday, startTime, duration, teacher, subject, room, grade, usesGrade) VALUES (${escape(user.organization)}, ${escape(className)}, ${escape(classWeekday)}, ${escape(classStarttime)}, ${escape(classDuration)}, ${escape(teacher[0].id)}, ${escape(subject[0].id)}, ${escape(room[0].id)}, ${escape(grade[0].id)}, ${escape(grade[0].hasSubgrade)})`) as ResultSetHeader).insertId

  if (!grade[0].hasSubgrade) {
    for (var i = 0; i < classStudents.length; i++) {
      await sendQuery(`INSERT INTO student_classes (organization, student, class) VALUES (${escape(user.organization)}, ${escape(classStudents[i].id)}, ${escape(classId)})`)
    }
  }

  return response.status(200).json({ message: 'success' })
})

router.put("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { classId, className, classWeekday, classStarttime, classDuration, classTeacher, classSubject, classRoom, classGrade, classStudents } = request.body
  classWeekday = classWeekday.toLowerCase()
  classSubject = classSubject.toLowerCase()

  if (
    className.length > 45 || className.length === 0 ||
    !weekdays.includes(classWeekday) ||
    !/^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(classStarttime) ||
    classDuration == 0
  ) return response.status(409).json({ message: 'invalid parameters' })

  const starttimeSplit = classStarttime.split(":")
  if ((starttimeSplit[0]*60 + parseInt(starttimeSplit[1]) + parseInt(classDuration)) > 1440) return response.status(409).json({ message: 'class duration extends 24 hours' })

  const existing = await sendQuery(`SELECT * FROM classes WHERE organization = ${escape(user.organization)} AND id = ${escape(classId)}`) as RowDataPacket[]
  if (existing.length === 0) return response.status(409).json({ message: 'class does not exist' })

  const teacher = await sendQuery(`SELECT * FROM teachers WHERE organization = ${escape(user.organization)} AND id = ${escape(classTeacher)}`) as RowDataPacket[]
  if (teacher.length === 0) return response.status(409).json({ message: 'teacher does not exist' })

  const subject = await sendQuery(`SELECT * FROM subjects WHERE organization = ${escape(user.organization)} AND name = ${escape(classSubject)}`) as RowDataPacket[]
  if (subject.length === 0) return response.status(409).json({ message: 'subject does not exist' })

  const room = await sendQuery(`SELECT * FROM rooms WHERE organization = ${escape(user.organization)} AND name = ${escape(classRoom)}`) as RowDataPacket[]
  if (room.length === 0) return response.status(409).json({ message: 'room does not exist' })

  const grade = await sendQuery(`SELECT * FROM grades WHERE organization = ${escape(user.organization)} AND id = ${escape(classGrade)}`) as RowDataPacket[]
  if (grade.length === 0) return response.status(409).json({ message: 'grade does not exist' })

  const currentClassStudents = await sendQuery(`SELECT * FROM student_classes WHERE organization = ${escape(user.organization)} AND class = ${escape(existing[0].id)}`) as RowDataPacket[]
  const students = await sendQuery(`SELECT * FROM students WHERE organization = ${escape(user.organization)}`) as RowDataPacket[]

  for (var i = 0; i < classStudents.length; i++) {
    const classStudent = classStudents.at(i)

    const studentData = students.find((student) => student.id === classStudent.id)
    if (!studentData) return response.status(409).json({ message: `student ${classStudent.forename} ${classStudent.lastname} does not exist` })

    const currentStudent = currentClassStudents.find((currentClassStudent) => currentClassStudent.student == classStudent.id)
    
    if (currentStudent) currentClassStudents.splice(currentClassStudents.indexOf(currentStudent), 1)
    else await sendQuery(`INSERT INTO student_classes (organization, student, class) VALUES (${escape(user.organization)}, ${escape(classStudent.id)}, ${escape(existing[0].id)})`)
  }

  for (var i = 0; i < currentClassStudents.length; i++) {
    await sendQuery(`DELETE FROM student_classes WHERE organization = ${escape(user.organization)} AND class = ${escape(existing[0].id)} AND student = ${escape(currentClassStudents.at(i)?.student)}`)
  }

  await sendQuery(`UPDATE classes SET name = ${escape(className)}, weekday = ${escape(classWeekday)}, startTime = ${escape(classStarttime)}, duration = ${escape(classDuration)}, teacher = ${escape(teacher[0].id)}, subject = ${escape(subject[0].id)}, room = ${escape(room[0].id)}, grade = ${escape(grade[0].id)}, usesGrade = ${escape(grade[0].hasSubgrade)} WHERE organization = ${escape(user.organization)} AND id = ${escape(existing[0].id)}`)

  return response.status(200).json({ message: 'success' })
})

router.delete("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { classId } = request.body
  
  await sendQuery(`DELETE FROM student_classes WHERE organization = ${escape(user.organization)} AND class = ${escape(classId)}`)

  const deletion = await sendQuery(`DELETE FROM classes WHERE organization = ${escape(user.organization)} AND id = ${escape(classId)}`) as ResultSetHeader
  if (deletion.affectedRows === 0) return response.status(409).json({ message: 'class does not exist' })
  
  return response.status(200).json({ message: 'success' })
})

export default router