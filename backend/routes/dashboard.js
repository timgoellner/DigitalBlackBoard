const express = require('express')

const mysql = require("../helpers/mysql");
const validateUser = require("../helpers/validateUser")

const router = express.Router()

router.get("/grades", async (request, response) => {
  const user = validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const grades = await mysql.sendQuery(`SELECT grades.grade, grades.subgrade, COUNT(students.id) count FROM grades LEFT JOIN students ON grades.id = students.grade WHERE grades.organization = '${user.organization}' GROUP BY grades.id ORDER BY grades.grade`);

  const sortedGrades = {}
  grades.forEach(grade => {
    if (sortedGrades[grade.grade]) {
      sortedGrades[grade.grade].subgrades.push(grade.subgrade)
      sortedGrades[grade.grade].count += grade.count
    } else {
      if (grade.subgrade === null) sortedGrades[grade.grade] = { "subgrades": null, "count": grade.count }
      else sortedGrades[grade.grade] = { "subgrades": [ grade.subgrade ], "count": grade.count }
    }
  });

  console.log(sortedGrades)
  
  return response.status(200).json({message: 'success', grades: sortedGrades})
})

module.exports = router