const jwt =  require('jsonwebtoken')
const bcypt =  require('bcrypt')
const express = require('express')

const mysql =  require("../helpers/mysql");

const router = express.Router()

router.post("/", async (request, response) => {
  const jwtSecretKey = process.env.JWT_SECRET

  var { organization, identifier, password } = request.body
  organization = organization.toLowerCase()

  if (!organization || !identifier || !password) {
    return response.status(401).json({ message: 'invalid credentials' })
  }

  const alreadyExists = await mysql.sendQuery(`SELECT COUNT(*) AS count FROM accounts WHERE organization = '${organization}'`)
  if (alreadyExists[0].count > 0) return response.status(401).json({ message: 'organisation already exists' })

  await mysql.sendQuery(`INSERT INTO organizations (name, quarantine) VALUES ('${organization}', 0)`)

  password = await bcypt.hash(password, 10)
  await mysql.sendQuery(`INSERT INTO accounts (organization, identifier, password, isStaff) VALUES ('${organization}', '${identifier}', '${password}', 1)`)

  const data = {
    signInTime: Date.now(),
    organization,
    identifier,
    isStaff: true
  }
  
  const token = jwt.sign(data, jwtSecretKey)
  response.status(200).json({ message: 'valid', token })
})

module.exports = router