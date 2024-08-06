const express = require('express')

const mysql = require("../../helpers/mysql");
const validateUser = require("../../helpers/validateUser")

const router = express.Router()

router.get("/", async (request, response) => {
  const user = validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const subjectsData = await mysql.sendQuery(`SELECT * FROM subjects WHERE organization = '${user.organization}'`)

  const subjects = []
  subjectsData.forEach(subject => subjects.push(subject.name));

  return response.status(200).json({ message: 'success', subjects })
})

router.post("/", async (request, response) => {
  const user = validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { subject } = request.body
  subject = subject?.toLowerCase()

  if (subject.length > 45 || subject.length === 0) return response.status(401).json({ message: 'invalid parameters' })

  await mysql.sendQuery(`INSERT INTO subjects (organization, name) VALUES ('${user.organization}', '${subject}')`)

  return response.status(200).json({ message: 'success' })
})

router.delete("/", async (request, response) => {
  const user = validateUser(request)
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })

  var { subject } = request.body

  const existing = await mysql.sendQuery(`SELECT * FROM subjects WHERE organization = '${user.organization}' AND name = '${subject}'`)
  if (existing.length === 0) return response.status(401).json({ message: 'subject does not exist' })

  await mysql.sendQuery(`DELETE FROM subjects WHERE organization = '${user.organization}' AND name = '${subject}'`)
  
  return response.status(200).json({ message: 'success' })
})

module.exports = router