const express = require('express')

const mysql = require("../helpers/mysql");
const validateUser = require("../helpers/validateUser")

const router = express.Router()

router.get("/grades", async (request, response) => {
  const user = validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const grades = await mysql.sendQuery(`SELECT grades.id, grades.grade, grades.subgrade, COUNT(students.id) count FROM grades LEFT JOIN students ON grades.id = students.grade WHERE grades.organization = '${user.organization}' GROUP BY grades.id ORDER BY grades.grade`);

  const sortedGrades = {}
  grades.forEach(grade => {
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

router.post("/grades", async (request, response) => {
  const user = validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { grade, subgradesCount } = request.body

  if (grade.length > 5 || grade.length === 0 || subgradesCount > 8) return response.status(401).json({ message: 'invalid parameters' })

  const existing = await mysql.sendQuery(`SELECT * FROM grades WHERE organization = '${user.organization}' AND grade = '${grade}'`)
  if (existing.length > 0) return response.status(401).json({ message: 'grade already exists' }) 

  if (subgradesCount === 0) {
    await mysql.sendQuery(`INSERT INTO grades (organization, grade, hasSubgrade) VALUES ('${user.organization}', '${grade}', 0)`)
  } else {
    const subgradeNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    for ( ; subgradesCount > 0; subgradesCount--) {
      await mysql.sendQuery(`INSERT INTO grades (organization, grade, subgrade, hasSubgrade) VALUES ('${user.organization}', '${grade}', '${subgradeNames[subgradesCount-1]}', 1)`)
    }
  }

  return response.status(200).json({ message: 'success' })
})

router.put("/grades", async (request, response) => {
  const user = validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { grade, subgradesCount } = request.body

  if (grade.length > 5 || grade.length === 0 || subgradesCount > 8) return response.status(401).json({ message: 'invalid parameters' })

  const existing = await mysql.sendQuery(`SELECT * FROM grades WHERE organization = '${user.organization}' AND grade = '${grade}'`)
  if (existing.length === 0) return response.status(401).json({ message: 'grade does not exist' })

  var difference = subgradesCount - existing.length
  if (!existing[0].hasSubgrade) return response.status(401).json({ message: 'grade does not have subgrades' })

  const subgradeNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  if (difference > 0) {
    for ( ; difference > 0; difference--) {
      await mysql.sendQuery(`INSERT INTO grades (organization, grade, subgrade, hasSubgrade) VALUES ('${user.organization}', '${grade}', '${subgradeNames[existing.length + difference - 1]}', 1)`)
    }
  } else if (difference < 0) {
    for ( ; difference < 0; difference++) {
      const deletion = await mysql.sendQuery(`DELETE FROM grades WHERE organization = '${user.organization}' AND grade = '${grade}' AND subgrade = '${subgradeNames[existing.length + difference]}'`)
      if (deletion === false) return response.status(401).json({ message: 'subgrade is not empty' })
    }
  }
  
  return response.status(200).json({ message: 'success' })
})

router.delete("/grades", async (request, response) => {
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