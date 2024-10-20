import jwt, { Secret } from 'jsonwebtoken'
import bcypt from 'bcrypt'
import express from 'express'
import { RowDataPacket, escape } from 'mysql2'

import sendQuery from "../helpers/mysql"
import validateUser from "../helpers/validateUser"

const router = express.Router()

router.post("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const jwtSecretKey = process.env.JWT_SECRET

  const isStaff = request.query.type === 'staff'
  var password = null
  if (isStaff) password = request.body.password

  const { organization, identifier } = request.body

  if (!organization || !identifier || (isStaff && !password)) {
    return response.status(409).json({ message: 'invalid login credentials' })
  }

  const userData = await sendQuery(`SELECT password, isStaff FROM accounts WHERE organization = ${escape(organization)} AND identifier = ${escape(identifier)}`) as RowDataPacket[]

  if (!userData.length) {
    return response.status(409).json({ message: 'invalid login credentials' })
  }

  if (isStaff != userData[0].isStaff) {
    return response.status(409).json({ message: 'invalid login credentials' })
  }

  if (isStaff && !await bcypt.compare(password, userData[0].password)) {
    return response.status(409).json({ message: 'invalid login credentials' })
  }

  const organisationData = await sendQuery(`SELECT * FROM organizations WHERE name = ${escape(organization)}`) as RowDataPacket[]
  if (organisationData[0].quarantine === 1 && !isStaff) {
    return response.status(409).json({ message: 'organization currently blocks logins' })
  }

  const data = {
    signInTime: Date.now(),
    organization,
    identifier,
    isStaff
  }

  const token = jwt.sign(data, jwtSecretKey as Secret)
  response.status(200).json({ message: 'valid', token })
})

router.get("/", async (request: express.Request, response: express.Response): Promise<any> => {
  const user = await validateUser(request);
  if (!user) return response.status(401).json({ message: 'error' })

  return response.status(200).json({ message: 'valid', user })
})

export default router