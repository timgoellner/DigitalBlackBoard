const express = require('express')

const mysql = require("../../helpers/mysql");
const validateUser = require("../../helpers/validateUser")

const router = express.Router()

router.get("/", async (request, response) => {
  const user = validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  var organization = await mysql.sendQuery(`SELECT * FROM organizations WHERE name = '${user.organization}'`)
  if (organization.length === 0) return response.status(401).json({ message: 'error' })
  else organization = organization[0]

  return response.status(200).json({ message: 'success', organization })
})

router.put("/", async (request, response) => {
  const user = validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { news, quarantine } = request.body
  if (quarantine === null) quarantine = false

  await mysql.sendQuery(`UPDATE organizations SET news = '${news}', quarantine = ${quarantine ? 1 : 0} WHERE name = '${user.organization}'`)

  return response.status(200).json({ message: 'success' })
})

router.delete("/", async (request, response) => {
  const user = validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  await mysql.sendQuery(`DELETE FROM organizations WHERE name = '${user.organization}'`)
  await mysql.sendQuery(`DELETE FROM student_classes WHERE organization = '${user.organization}'`)
  await mysql.sendQuery(`DELETE FROM teacher_subjects WHERE organization = '${user.organization}'`)
  await mysql.sendQuery(`DELETE FROM changes WHERE organization = '${user.organization}'`)
  await mysql.sendQuery(`DELETE FROM classes WHERE organization = '${user.organization}'`)
  await mysql.sendQuery(`DELETE FROM students WHERE organization = '${user.organization}'`)
  await mysql.sendQuery(`DELETE FROM teachers WHERE organization = '${user.organization}'`)
  await mysql.sendQuery(`DELETE FROM grades WHERE organization = '${user.organization}'`)
  await mysql.sendQuery(`DELETE FROM accounts WHERE organization = '${user.organization}'`)
  await mysql.sendQuery(`DELETE FROM subjects WHERE organization = '${user.organization}'`)
  await mysql.sendQuery(`DELETE FROM rooms WHERE organization = '${user.organization}'`)
  
  return response.status(200).json({ message: 'success' })
})

module.exports = router