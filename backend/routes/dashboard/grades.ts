import express from 'express'
import { ResultSetHeader, RowDataPacket, escape } from 'mysql2'

import sendQuery from "../../helpers/mysql"
import validateUser from "../../helpers/validateUser"

const router = express.Router()

router.get("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const grades = await sendQuery(`SELECT grades.id, grades.grade, grades.subgrade, COUNT(students.id) count FROM grades LEFT JOIN students ON grades.id = students.grade WHERE grades.organization = ${escape(user.organization)} GROUP BY grades.id ORDER BY grades.grade`) as RowDataPacket[]

  const sortedGrades: any = {}
  grades.forEach((grade) => {
    if (sortedGrades[grade.grade]) {
      sortedGrades[grade.grade].subgrades.push(grade.subgrade)
      sortedGrades[grade.grade].count += grade.count
    } else {
      if (grade.subgrade === null) sortedGrades[grade.grade] = { "id": grade.id, "subgrades": null, "count": grade.count }
      else sortedGrades[grade.grade] = { "id": grade.id, "subgrades": [ grade.subgrade ], "count": grade.count }
    }
  });
  
  return response.status(200).json({ message: 'success', grades: sortedGrades })
})

router.post("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { grade, subgradesCount } = request.body
  grade = grade.toLowerCase()

  if (grade.length > 5 || grade.length === 0 || subgradesCount > 8) return response.status(409).json({ message: 'invalid parameters' })

  const existing = await sendQuery(`SELECT * FROM grades WHERE organization = ${escape(user.organization)} AND grade = ${escape(grade)}`) as RowDataPacket[]
  if (existing.length > 0) return response.status(409).json({ message: 'grade already exists' }) 

  if (subgradesCount === 0) {
    await sendQuery(`INSERT INTO grades (organization, grade, hasSubgrade) VALUES (${escape(user.organization)}, ${escape(grade)}, 0)`)
  } else {
    const subgradeNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    for ( ; subgradesCount > 0; subgradesCount--) {
      await sendQuery(`INSERT INTO grades (organization, grade, subgrade, hasSubgrade) VALUES (${escape(user.organization)}, ${escape(grade)}, ${escape(subgradeNames[subgradesCount-1])}, 1)`)
    }
  }

  return response.status(200).json({ message: 'success' })
})

router.put("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { grade, subgradesCount } = request.body
  grade = grade.toLowerCase()

  if (grade.length > 5 || grade.length === 0 || subgradesCount > 8) return response.status(409).json({ message: 'invalid parameters' })

  const existing = await sendQuery(`SELECT * FROM grades WHERE organization = ${escape(user.organization)} AND grade = ${escape(grade)}`) as RowDataPacket[]
  if (existing.length === 0) return response.status(409).json({ message: 'grade does not exist' })

  var difference = subgradesCount - existing.length
  if (!existing[0].hasSubgrade) return response.status(409).json({ message: 'grade does not have subgrades' })

  const subgradeNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  if (difference > 0) {
    for ( ; difference > 0; difference--) {
      await sendQuery(`INSERT INTO grades (organization, grade, subgrade, hasSubgrade) VALUES (${escape(user.organization)}, ${escape(grade)}, ${escape(subgradeNames[existing.length + difference - 1])}, 1)`)
    }
  } else if (difference < 0) {
    for ( ; difference < 0; difference++) {
      const deletion = await sendQuery(`DELETE FROM grades WHERE organization = ${escape(user.organization)} AND grade = ${escape(grade)} AND subgrade = ${escape(subgradeNames[existing.length + difference])}`) as ResultSetHeader
      if (deletion.affectedRows === 0) return response.status(409).json({ message: 'subgrade is not empty' })
    }
  }
  
  return response.status(200).json({ message: 'success' })
})

router.delete("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { grade } = request.body
  grade = grade.toLowerCase()

  const existing = await sendQuery(`SELECT * FROM grades WHERE organization = ${escape(user.organization)} AND grade = ${escape(grade)}`) as RowDataPacket[]
  if (existing.length === 0) return response.status(409).json({ message: 'grade does not exist' })
  
  const deletion = await sendQuery(`DELETE FROM grades WHERE organization = ${escape(user.organization)} AND grade = ${escape(grade)}`) as ResultSetHeader
  if (deletion.affectedRows === 0) return response.status(409).json({ message: 'grade is not empty' })
  
  return response.status(200).json({ message: 'success' })
})

export default router