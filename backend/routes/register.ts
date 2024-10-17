import express from 'express'
import jwt, { Secret } from 'jsonwebtoken';
import bcypt from 'bcrypt';
const escape = require("mysql2").escape

import sendQuery from "../helpers/mysql";
import { RowDataPacket } from 'mysql2';

const router = express.Router()

router.post("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const jwtSecretKey = process.env.JWT_SECRET

  var { organization, identifier, password } = request.body
  organization = organization.toLowerCase()

  if (!organization || !identifier || !password) {
    return response.status(401).json({ message: 'invalid credentials' })
  }

  const alreadyExists = await sendQuery(`SELECT COUNT(*) AS count FROM accounts WHERE organization = ${escape(organization)}`) as RowDataPacket[]
  if (alreadyExists[0].count > 0) return response.status(401).json({ message: 'organisation already exists' })

  await sendQuery(`INSERT INTO organizations (name, quarantine) VALUES (${escape(organization)}, 0)`)

  password = await bcypt.hash(password, 10)
  await sendQuery(`INSERT INTO accounts (organization, identifier, password, isStaff) VALUES (${escape(organization)}, ${escape(identifier)}, ${escape(password)}, 1)`)

  const data = {
    signInTime: Date.now(),
    organization,
    identifier,
    isStaff: true
  }
  
  const token = jwt.sign(data, jwtSecretKey as Secret)
  response.status(200).json({ message: 'valid', token })
})

export default router